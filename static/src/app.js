//main.js

import xs from 'xstream';
import {run} from '@cycle/xstream-run';
import {makeDOMDriver, h, div, h1, button, input} from '@cycle/dom';
import {makeHTTPDriver} from '@cycle/http';

class TimerProps {
  constructor(startTime, time, paused) {
    this.startTime = startTime;
    this.time = time;
    this.paused = paused;
  }
}

let timerPropsInit = new TimerProps(25 * 60, 25 * 60, false);

function updateTimer(timerProps, timerEvent) {
  switch (timerEvent.caseClass) {
    case "SET":
      return new TimerProps(timerEvent.time,
          timerEvent.time, true);
    case "RESET":
      return new TimerProps(timerProps.startTime,
          timerProps.startTime, timerProps.paused);
    case "TICK":
      return new TimerProps(timerProps.startTime,
          timerProps.paused ?
            timerProps.time :
            Math.max(0, timerProps.time - 1),
          timerProps.paused);
    case "PAUSE":
      return new TimerProps(timerProps.startTime,
          timerProps.time, !timerProps.paused);
    default:
      return timerProps;
  }
}

function main(sources) {
  // Intent

  const setTime$ = sources.DOM.select('#startTime').events('input')
    .map (ev => ({
      caseClass: "SET",
      time: ev.target.value * 60
    }));

  const reset$ = sources.DOM.select('#reset').events('click')
    .mapTo({
      caseClass: "RESET"
    });

  const pause$ = sources.DOM.select('#pause').events('click')
    .mapTo({
      caseClass: "PAUSE"
    });

  const tick$ = xs.merge(reset$, setTime$, pause$).compose( () =>
      xs.periodic(1000).mapTo( {
        caseClass: "TICK"
      })
  );

  const request$ = sources.DOM.select('#test').events('click')
    .mapTo({
      url: '/test',
      method: 'GET',
      category: 'test'
    });

  const newTodo$ = sources.DOM.select('#newTodo').events('click')
    .mapTo({
      url: '/api/todo/new',
      method: 'GET',
      category: 'new_todo'
    });

  const uuid$ = xs.of(window.location.href)
    .map(uuid => {
      let url = uuid.split('?');
      return url.length > 1 ? url[1] : '';
    })

  const post$ = xs.combine(uuid$,
    sources.DOM.select('#test_post').events('click'))
      .map( ([uuid, click]) => {
        return ({
          url: '/api/todo/test_uuid/tasks/new',
          method: 'POST',
          category: 'task',
          send: {
            todo_uuid: uuid,
            task: 'test task'
          },
        });
      });

  // model
  const timer$ = xs.merge(setTime$, reset$, pause$, tick$)
    .fold(updateTimer, timerPropsInit);

  const todo$ = sources.HTTP.select('test')
    .flatten()
    .map( json => {
      return json.body.resp;
    })
    .startWith("test");

  const newTodoResp$ = sources.HTTP.select('new_todo')
    .flatten()
    .map( json => '/?' + json.body.resp);

  // view
  const timerDOM$ = timer$.map(timerProps => {
    const minutes = Math.floor(timerProps.time / 60);
    const seconds = ('00' + (timerProps.time % 60)).slice(-2);
    return div([
      h1(minutes + ':' + seconds),
      button('#reset', 'Reset'),
      button('#pause', timerProps.paused ? 'Start' : 'Pause'),
      input('#startTime', {
        attrs: {
          type: 'text',
          value: Math.floor(timerProps.startTime / 60)
        }
      }),
      button("#test", "JSON")
    ])
  });

  const todoDOM$ = todo$.map(todo => {
    return div([
      h1(todo),
      button("#test_post", "POST"),
      button("#newTodo", "New Todo")
    ]);
  });

  const newTodoDOM$ = newTodoResp$.map(url => {
    window.open(url);
  });

  const vDOM$ = xs.combine(timerDOM$, todoDOM$, uuid$)
    .map( ([timerDom, todoDom, uuid]) =>
        div([timerDom, todoDom, h1(uuid)]) );

  const sinks = {
    DOM: vDOM$,
    HTTP: xs.merge(request$, post$, newTodo$),
    POPUP: newTodoDOM$
  };

  return sinks;
}

const drivers = {
  DOM: makeDOMDriver('#app'),
  HTTP: makeHTTPDriver(),
  POPUP: makeHTTPDriver()
};

run(main, drivers);

//main.js
import xs from 'xstream';
import {run} from '@cycle/xstream-run';
import {makeDOMDriver, div, h1, button, input} from '@cycle/dom';
import {makeHTTPDriver} from '@cycle/http';

// components
import Timer from './components/timer.js';
import Todo from './components/todo.js';

function main(sources) {
  // components
  const timer = Timer(sources);
  const todo = Todo(sources);

  // model
  const timerFinish$ = timer.timerProps.filter(tp => tp.time == 0);

  let selectedTask = -1; //note: this is stateful...
  const selectTask$ = todo.selectTask.map(id => selectedTask = id);

  // note: this end point ignoring the /todo/<uuid>/tasks convention...
  // don't feel like pulling the uuid$ out from Todo right now
  const addPomodoro$ = timerFinish$
    .map( () => {
      if (selectedTask > 0) {
        return ({
          url: `api/tasks/${selectedTask}/addPomodoro`,
          method: 'GET',
          category: 'tasks'
        })
      }
    })

  // view
  const vDOM$ = xs.combine(timer.DOM, todo.DOM, selectTask$)
    .map( ([timerDom, todoDom, _]) => div([timerDom, todoDom]) );

  return {
    DOM: vDOM$,
    HTTP: xs.merge(todo.HTTP, addPomodoro$),
    POPUP: todo.POPUP
  };
}

const drivers = {
  DOM: makeDOMDriver('#app'),
  HTTP: makeHTTPDriver(),
  POPUP: makeHTTPDriver(),
};

run(main, drivers);

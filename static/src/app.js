//main.js

import xs from 'xstream';
import {run} from '@cycle/xstream-run';
import {makeDOMDriver, h, div, h1, button, input} from '@cycle/dom';

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

  // model
  const timer$ = xs.merge(setTime$, reset$, pause$, tick$)
    .fold(updateTimer, timerPropsInit);

  // view
  const vdom$ = timer$.map(timerProps => {
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
      })
    ])
  });


  const sinks = {
    DOM: vdom$
  };

  return sinks;
}

const drivers = {
  DOM: makeDOMDriver('#app')
};

run(main, drivers);

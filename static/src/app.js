//main.js

import xs from 'xstream';
import {run} from '@cycle/xstream-run';
import {makeDOMDriver, div, h1, button, input} from '@cycle/dom';

/*
let toggle = {
  value: false,
  toggle: function() {
    this.value = !this.value;
    return this.value;
  }
}

function toggle(value) {
  return !value;
}
*/
let timerProps = {
  startTime: 25 * 60,
  time: 25 * 60,
  paused: false
}

function updateTimer(timerProps, timerEvent) {
  switch (timerEvent.caseClass) {
    case "SET":
      timerProps.startTime = timerEvent.time;
      timerProps.time = timerEvent.time;
      break;
    case "RESET":
      timerProps.time = timerProps.startTime;
      break;
    case "TICK":
      if (!timerProps.paused) timerProps.time--;
      break;
    case "PAUSE":
      timerProps.paused = timerEvent.paused;
      break;
    case "START":
      timerProps.paused = false;
      break;
    default:
      break;
  }
  return timerProps;
}

function main(sources) {
  // Intent
  const setTime$ = sources.DOM.select('#startTime').events('input')
    .map (ev => ({
      caseClass: "SET",
      time: ev.target.value
    }));

  const reset$ = sources.DOM.select('#reset').events('click')
    .mapTo({
      caseClass: "RESET"
    });

  const pause$ = sources.DOM.select('#pause').events('click')
    .mapTo({
      caseClass: "PAUSE",
      paused: true
    });

  const tick$ = xs.periodic(1000)
    .mapTo( {
      caseClass: "TICK"
    });


  // model
  const timer$ = xs.merge(setTime$, reset$, pause$, tick$)
    // should the DOM be the state?
    .map( timerEvent => {
        updateTimer(timerProps, timerEvent);
        return timerProps;
    });

  // view
  const vdom$ = timer$.map(timerProps =>
    div([
      h1('' + timerProps.time + ' seconds elapsed'),
      button('#reset', 'Reset'),
      input('#startTime', timerProps.startTime) // todo: fix display
    ])
  );


  const sinks = {
    DOM: vdom$
  };

  return sinks;
}

const drivers = {
  DOM: makeDOMDriver('#app')
};

run(main, drivers);

import xs from 'xstream';
import {div, h1, button, input} from '@cycle/dom';

const freeze = Object.freeze;

class TimerProps {
  constructor(startTime, time, paused) {
    this.startTime = startTime;
    this.time = time;
    this.paused = paused;
  }
}

const timerPropsInit = freeze(new TimerProps(25 * 60, 25 * 60, false));

function updateTimer(timerProps, timerEvent) {
  switch (timerEvent.caseClass) {
    case "SET":
      return freeze(new TimerProps(timerEvent.time,
          timerEvent.time, true));
    case "RESET":
      return freeze(new TimerProps(timerProps.startTime,
          timerProps.startTime, timerProps.paused));
    case "TICK":
      return freeze(new TimerProps(timerProps.startTime,
          timerProps.paused ?
            timerProps.time :
            Math.max(-1, timerProps.time - 1),
          timerProps.paused));
    case "PAUSE":
      return freeze(new TimerProps(timerProps.startTime,
          timerProps.time, !timerProps.paused));
    default:
      return timerProps;
  }
}

export default function Timer(sources) {
  //intent
  const setTime$ = sources.DOM.select('#startTime').events('input')
    .map (ev => ({
      caseClass: "SET",
      time: Math.floor(ev.target.value * 60)
    }));

  const reset$ = sources.DOM.select('#reset').events('click')
    .mapTo({
      caseClass: "RESET"
    });

  const pause$ = sources.DOM.select('#pause').events('click')
    .mapTo({
      caseClass: "PAUSE"
    });

  const tick$ = xs.merge(reset$, setTime$, pause$).startWith(1)
    .map( () =>
      xs.periodic(1000)
      .mapTo( {
          caseClass: "TICK"
      })
    )
    .flatten();

  // model
  const timer$ = xs.merge(setTime$, reset$, pause$, tick$)
    .fold(updateTimer, timerPropsInit);

  // view
  const timerDOM$ = timer$.map(timerProps => {
    const time = Math.max(timerProps.time, 0)
    const minutes = Math.floor(time / 60);
    const seconds = ('00' + (time % 60)).slice(-2);
    return div([
      h1('#time', minutes + ':' + seconds),
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

  return {
    DOM: timerDOM$,
    timerProps: timer$
  }
}

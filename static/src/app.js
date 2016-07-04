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

  // view
  const vDOM$ = xs.combine(timer.DOM, todo.DOM)
    .map( ([timerDom, todoDom]) => div([timerDom, todoDom]) );

  return {
    DOM: vDOM$,
    HTTP: todo.HTTP,
    POPUP: todo.POPUP
  };
}

const drivers = {
  DOM: makeDOMDriver('#app'),
  HTTP: makeHTTPDriver(),
  POPUP: makeHTTPDriver()
};

run(main, drivers);

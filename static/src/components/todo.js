import xs from 'xstream';
import {div, h1, button, input} from '@cycle/dom';

const freeze = Object.freeze;

export default function Todo(sources) {
  // intent
  const uuid$ = xs.of(window.location.href)
    .map(uuid => {
      let url = uuid.split('?');
      return url.length > 1 ? url[1] : '';
    })

  const newTodo$ = sources.DOM.select('#newTodo').events('click')
    .mapTo({
      url: '/api/todo/new',
      method: 'GET',
      category: 'new_todo'
    });

  const newTask$ = xs.combine(uuid$,
    sources.DOM.select('#newTask').events('click'))
      .map( ([uuid, click]) => {
        return ({
          url: `/api/todo/${uuid}/tasks/new`,
          method: 'POST',
          category: 'task',
          send: {
            todo_uuid: uuid,
            task: 'test task'
          },
        });
      });

  // model
  const newTodoResp$ = sources.HTTP.select('new_todo')
    .flatten()
    .map( json => '/?' + json.body.resp);

  // view
  const actionsDOM$ = xs.of(
    div([
      button("#newTodo", "New Todo"),
      button("#newTask", "New Task")
    ])
  );

  const newTodoDOM$ = newTodoResp$.map(url => {
    window.open(url);
  });

  return {
    DOM: actionsDOM$,
    HTTP: xs.merge(newTodo$, newTask$),
    POPUP: newTodoDOM$
  }
}

import xs from 'xstream';
import {div, h1, button, input} from '@cycle/dom';

const freeze = Object.freeze;

export default function Todo(sources) {
  // intent
  const uuid$ = xs.of(window.location.href)
    .map(uuid => {
      let url = uuid.split('?');
      return url.length > 1 ? url[1] : null;
    })

  const newTaskText$ = sources.DOM.select('#newTaskText').events('keyup')
    .filter( ev => ev.keyCode == 13 )
    .map( ev => ev.target.value )

  const newTodo$ = sources.DOM.select('#newTodo').events('click')
    .mapTo({
      url: '/api/todo/new',
      method: 'GET',
      category: 'new_todo'
    });

  const newTask$ = xs.combine(uuid$, newTaskText$)
      .map( ([uuid, newTaskText]) => {
        return ({
          url: `/api/todo/${uuid}/tasks/new`,
          method: 'POST',
          category: 'task',
          send: {
            todo_uuid: uuid,
            task: newTaskText
          },
        });
      });

  // model
  const newTodoResp$ = sources.HTTP.select('new_todo')
    .flatten()
    .map( json => '/?' + json.body.resp);

  const newTaskResp$ = sources.HTTP.select('task')
    .flatten()
    .map( json => json.body.resp);

  // view
  const actionsDOM$ = uuid$.map( uuid => {
    let els = [button("#newTodo", "New Todo")];
    if (uuid != null) {
      els = els.concat([
        input("#newTaskText", {
          attr: "New Task..."
        }),
        button("#newTask", "New Task")
      ]);
    }
    return div(els);
  });

  const tasksDOM$ = newTaskResp$
    .map(tasks => {
      console.log(tasks);
    })

  const newTodoDOM$ = newTodoResp$.map(url => {
    window.open(url);
  });

  const vDOM$ = xs.combine(actionsDOM$, tasksDOM$)
    .map(div);

  return {
    DOM: actionsDOM$,
    HTTP: xs.merge(newTodo$, newTask$),
    POPUP: newTodoDOM$
  }
}

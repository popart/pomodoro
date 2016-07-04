import xs from 'xstream';
import {div, h1, button, input, ul, li} from '@cycle/dom';

const freeze = Object.freeze;

export default function Todo(sources) {
  // intent
  const uuid$ = xs.of(window.location.href)
    .map(url => {
      let url_parts = url.split('?');
      return url_parts.length > 1 ? url_parts[1] : null;
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
            task: newTaskText
          },
        });
      });

  const getTasks$ = uuid$.map(uuid => {
    if (uuid != null) {
      return ({
        url: `/api/todo/${uuid}/tasks`,
        method: 'GET',
        category: 'get_tasks'
      });
    } 
   });

  // model
  const newTodoResp$ = sources.HTTP.select('new_todo')
    .flatten()
    .map( json => '/?' + json.body.resp);

  const newTaskResp$ = sources.HTTP.select('task')
    .flatten()
    .map( json => json.body.resp);

  const getTasksResp$ = sources.HTTP.select('get_tasks')
    .flatten()
    .map( json => json.body.resp)
    .startWith([]);

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

  const tasksDOM$ = xs.merge(newTaskResp$, getTasksResp$)
    .map( tasks => ul(tasks.map(task => li(task.task))) );

  const newTodoDOM$ = newTodoResp$.map(url => {
    window.open(url);
  });

  const vDOM$ = xs.combine(actionsDOM$, tasksDOM$)
    .map(div);

  return {
    DOM: vDOM$,
    HTTP: xs.merge(newTodo$, newTask$, getTasks$),
    POPUP: newTodoDOM$
  }
}

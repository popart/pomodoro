import xs from 'xstream';
import {div, h1, button, input, ul, li, span} from '@cycle/dom';

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
          category: 'tasks',
          send: {
            text: newTaskText
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

  // #fixme: should also be able to deselect task
  const selectTask$ = sources.DOM.select('li.task').events('click')
    .map( ev => ev.currentTarget.querySelectorAll('input.task_id')[0].value )
    .startWith(-1);

  // model
  const newTodoResp$ = sources.HTTP.select('new_todo')
    .flatten()
    .map( json => '/?' + json.body.resp);

  const tasksResp$ = sources.HTTP.select('tasks')
    .flatten()
    .map( json => json.body.resp);

  const getTasksResp$ = sources.HTTP.select('get_tasks')
    .flatten()
    .map( json => json.body.resp)
    .startWith([]);

  const taskList$ = xs.merge(tasksResp$, getTasksResp$);

  const completeTask$ = xs.combine(
    uuid$,
    sources.DOM.select('.taskCheck').events('click'))
      .map( ([uuid, ev]) => {
        let taskId = ev.currentTarget.parentNode
          .querySelectorAll('input.task_id')[0].value;
        // instead of saving data in DOM, could use a toggle GET req
        // can't use taskList$, b/c it updates w/ this response
        let taskCompleted = JSON.parse(ev.currentTarget
          .querySelectorAll('input.task_completed')[0].value);
        return ({
          url: `/api/todo/${uuid}/tasks/${taskId}/update`,
          method: 'POST',
          category: 'tasks',
          send: {
            completed: !taskCompleted
          }
        })
      })

  // view
  const actionsDOM$ = uuid$.map( uuid => {
    let els = [button("#newTodo", "New Todo")];
    if (uuid != null) {
      els = els.concat([
        input("#newTaskText", {
          attrs: {
            value: "New Task..."
          }
        })
      ]);
    }
    return div(els);
  });

  const tasksDOM$ = xs.combine(taskList$, selectTask$)
    .map( ([taskList, selectTask]) =>
      ul( taskList.map(task =>
        li('.task' + (task.id == selectTask ? '.selected' : ''),
           [ span(task.text + ' | ' + task.pomodoros + ' pomodoros'),
             span('.taskCheck', [
               ' | ' + (task.completed ? '[x]' : '[ ]'),
               input('.task_completed', { attrs: {
                 value: task.completed, type: 'hidden'
               } })
             ]),
             input('.task_id', { attrs: {
               value: task.id, type: 'hidden'
             } })
           ]
        )
      )
    ));

  const newTodoDOM$ = newTodoResp$.map(url => {
    window.open(url);
  });

  const vDOM$ = xs.combine(actionsDOM$, tasksDOM$)
    .map(div);

  return {
    DOM: vDOM$,
    HTTP: xs.merge(newTodo$, newTask$, getTasks$, completeTask$),
    POPUP: newTodoDOM$,
    selectTask: selectTask$
  }
}

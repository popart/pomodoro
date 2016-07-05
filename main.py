from flask import Flask, jsonify, redirect, url_for, request
import json
from uuid import uuid4
from store.sqliteconn import SQLite3Conn
from store.todo_store import TodoStore
from store.task_store import TaskStore

app = Flask(__name__)
db = SQLite3Conn('db/pomodoro.db')

stores = {
    'todos': TodoStore(db),
    'tasks': TaskStore(db)
}

@app.route('/')
@app.route('/todo')
def landing():
    return app.send_static_file('index.html')

@app.route('/api/todo/<uuid:uuid>')
def get_todo(uuid):
    todo = stores['todos'].select(uuid=str(uuid), limit=1)
    return jsonify({'resp': next(todo) })

@app.route('/api/todo/new')
def create_todo():
    uuid = str(uuid4())
    stores['todos'].insert(uuid)
    return jsonify({'resp': uuid})

@app.route('/api/todo/<uuid:uuid>/tasks')
def get_tasks(uuid):
    tasks = list(stores['tasks'].select(todo_uuid=str(uuid)))
    return jsonify({'resp': tasks})

@app.route('/api/todo/<uuid:uuid>/tasks/new', methods=['POST'])
def create_task(uuid):
    data = json.loads(request.data.decode('utf-8'))
    todo = next(stores['todos'].select(
        uuid=str(uuid), limit=1))

    stores['tasks'].insert(data['text'], todo['id'])

    tasks = list(stores['tasks'].select(todo_id=todo['id']));
    return jsonify({ 'resp': tasks })

@app.route('/api/todo/<uuid:uuid>/tasks/<task_id>/update', methods=['POST'])
def update_task(uuid, task_id):
    data = json.loads(request.data.decode('utf-8'))
    todo = next(stores['todos'].select(
        uuid=str(uuid), limit=1))

    stores['tasks'].update(task_id=task_id, **data)

    tasks = list(stores['tasks'].select(todo_id=todo['id']));
    return jsonify({ 'resp': tasks })

@app.route('/api/tasks/<task_id>/addPomodoro')
def add_pomodoro(task_id):
    task = next(stores['tasks'].select(id=task_id))
    todo = next(stores['todos'].select(
        id=task['todo_id'], limit=1))

    stores['tasks'].update(task_id=task_id, add_pomodoros=1)

    tasks = list(stores['tasks'].select(todo_id=todo['id']));
    return jsonify({ 'resp': tasks })

@app.route('/<path:path>')
def static_proxy(path):
    return app.send_static_file(path)

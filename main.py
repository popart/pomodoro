from flask import Flask, jsonify, redirect, url_for
import json
from uuid import uuid4
from store.sqliteconn import SQLite3Conn
from store.todostore import TodoStore

app = Flask(__name__)
db = SQLite3Conn('db/test.db')

@app.route('/')
def landing():
    return app.send_static_file('index.html')

@app.route('/test')
def test():
    return jsonify({'resp': "this is the end!"})

@app.route('/api/todo/<uuid:uuid>')
def get_todo(uuid):
    todo_store = TodoStore(db)
    todo = todo_store.select(uuid=str(uuid), limit=1)
    id, uuid, date_created = todo[0]
    resp = { 'id': id, 'uuid': uuid, 'date_created': date_created }
    return jsonify({'resp': resp })

@app.route('/api/todo/new')
def create_todo():
    uuid = str(uuid4())
    todo_store = TodoStore(db)
    todo_store.insert(uuid)
    return redirect("api/todo/%s" % uuid )

@app.route('/<path:path>')
def static_proxy(path):
    return app.send_static_file(path)

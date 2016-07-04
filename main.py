from flask import Flask, jsonify
import json

app = Flask(__name__)

@app.route('/')
def landing():
    return app.send_static_file('index.html')

@app.route('/test')
def test():
    return jsonify({'resp': "this is the end!"})

@app.route('/<path:path>')
def static_proxy(path):
    return app.send_static_file(path)

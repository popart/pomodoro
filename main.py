from flask import Flask
app = Flask(__name__)

@app.route('/')
def hello_world():
    return app.send_static_file('index.html')

@app.route('/<path:path>')
def static_proxy(path):
    return app.send_static_file(path)

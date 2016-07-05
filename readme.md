# Pomodoro
An application to create todo lists and run a pomodoro timer. Uses [flask](http://flask.pocoo.org/), [cycle.js](http://cycle.js.org/), and [xstream](https://github.com/staltz/xstream). Written in Python & ES6.

## Requirements
  * sqlite3
  * python3
  * virtualenv
  
## Setup Instuctions
  ```bash
  npm install
  webpack

  virtualenv -p python3 venv
  source venv/bin/activate
  python scripts/setup_db.py
  pip install flask
  ./runserver
  ```

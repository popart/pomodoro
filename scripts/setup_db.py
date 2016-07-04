import sqlite3

def run(conn, query):
    c = conn.cursor()
    c.execute(query)
    conn.commit()

def create_todos(conn):
    run(conn, '''CREATE TABLE todos
        (id integer primary key, uuid text,
        date_created timestamp DEFAULT CURRENT_TIMESTAMP)''')

def create_todo_tasks(conn):
    run(conn, '''CREATE TABLE todo_tasks (
        id integer primary key, todo_id integer,
        task text, pomodoros integer DEFAULT 0,
        date_created timestamp DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (todo_id) REFERENCES todos(id)
        )''')

if __name__ == "__main__":
    conn = sqlite3.connect('db/test.db')
    create_todos(conn)
    create_todo_tasks(conn)
    conn.close()

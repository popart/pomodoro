import sqlite3

class SQLite3Conn:

    def __init__(self, db_loc):
        self.__conn = sqlite3.connect(db_loc)

    def run(self, query, params):
        c = self.__conn.cursor()
        c.execute(query, params)
        self.__conn.commit()

    def fetch(self, query, params):
        c = self.__conn.cursor()
        return c.execute(query, params).fetchall()

    def __del__(self):
        if self.__conn:
            self.__conn.close()

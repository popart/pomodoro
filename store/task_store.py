class TaskStore:

    def __init__(self, db):
        self.__db = db

    def insert(self, task, todo_id):
        query = """
            INSERT INTO todo_tasks (task, todo_id)
            VALUES (?, ?)
        """
        self.__db.run(query, [task, todo_id])

    def select(self, **params):
        search_params = []
        join_clause = ""
        where_clause = ""

        if 'todo_id' in params:
            search_params.append(params['todo_id'])
            where_clause = where_clause + "AND tt.todo_id = ?\n"

        if 'todo_uuid' in params:
            search_params.append(params['todo_uuid'])
            join_clause = join_clause + "JOIN todo t ON t.id = tt.todo_id\n"

            where_clause = where_clause + "AND t.uuid = ?\n"


        if 'limit' in params:
            search_params.append(params['limit'])
        else:
            search_params.append(10)

        query = """
            SELECT id, todo_id, task, pomodoros, date_created
            %s
            FROM todo_tasks tt
            WHERE 1=1
            %s
            LIMIT ?
        """ % join_clause, where_clause

        return self.__db.fetch(query, search_params)

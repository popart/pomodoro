class TaskStore:

    def __init__(self, db):
        self.__db = db

    def insert(self, text, todo_id):
        query = """
            INSERT INTO todo_tasks (text, todo_id)
            VALUES (?, ?)
        """
        self.__db.run(query, [text, todo_id])

    def select(self, **params):
        search_params = []
        join_clause = ""
        where_clause = ""
        limit_clause = ""

        if 'todo_id' in params:
            search_params.append(params['todo_id'])
            where_clause = where_clause + "AND tt.todo_id = ?\n"

        if 'todo_uuid' in params:
            search_params.append(params['todo_uuid'])
            join_clause = join_clause + "JOIN todos t ON t.id = tt.todo_id\n"

            where_clause = where_clause + "AND t.uuid = ?\n"


        if 'limit' in params:
            limit_clause = "LIMIT ?\n"
            search_params.append(params['limit'])

        query = """
            SELECT tt.id, tt.todo_id, tt.text, tt.pomodoros, tt.date_created
            FROM todo_tasks tt
            %s
            WHERE 1=1
            %s
            %s
            ORDER BY tt.date_created
        """ % (join_clause, where_clause, limit_clause)

        def parse_result(result):
            id, todo_id, text, pomodoros, date_created = result
            return {
                'id': id,
                'todo_id': todo_id,
                'text': text,
                'pomodoros': pomodoros,
                'date_created': date_created
            }

        results = self.__db.fetch(query, search_params)
        return map(parse_result, results)

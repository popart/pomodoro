class TodoStore:

    def __init__(self, db):
        self.__db = db

    def insert(self, uuid):
        query = """
            INSERT INTO todos (uuid)
            VALUES (?)
        """
        self.__db.run(query, [uuid])

    def select(self, **params):
        search_params = []
        where_clause = ""

        if 'uuid' in params:
            search_params.append(params['uuid'])
            where_clause = where_clause + "AND uuid = ?"

        if 'limit' in params: search_params.append(params['limit'])
        else:
            search_params.append(10)

        query = """
            SELECT id, uuid, date_created FROM todos
            WHERE 1=1
            %s
            LIMIT ?
        """ % where_clause

        results = self.__db.fetch(query, search_params)

        def parse_result(result):
            id, uuid, date_created = result
            return {
                'id': id,
                'uuid': uuid,
                'date_created': date_created
            }

        return map(parse_result, results)


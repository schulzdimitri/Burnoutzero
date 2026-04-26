from django.db import connection
from django.test import TransactionTestCase


class SqlQueriesTest(TransactionTestCase):
    """Valida consultas SQL de negocio em um schema de teste isolado."""

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls._create_schema()
        cls._seed_data()

    @classmethod
    def tearDownClass(cls):
        cls._drop_schema()
        super().tearDownClass()

    @classmethod
    def _create_schema(cls):
        with connection.cursor() as cursor:
            cursor.execute("DROP TABLE IF EXISTS historico_consultas")
            cursor.execute("DROP TABLE IF EXISTS log_acessos")
            cursor.execute("DROP TABLE IF EXISTS user_roles")
            cursor.execute("DROP TABLE IF EXISTS users")
            cursor.execute("DROP TABLE IF EXISTS roles")
            cursor.execute("DROP TABLE IF EXISTS setor")

            cursor.execute(
                """
                CREATE TABLE setor (
                    id_setor SERIAL PRIMARY KEY,
                    nome_setor VARCHAR(100) NOT NULL
                )
                """
            )

            cursor.execute(
                """
                CREATE TABLE roles (
                    id_role SERIAL PRIMARY KEY,
                    nome_cargo VARCHAR(100) NOT NULL
                )
                """
            )

            cursor.execute(
                """
                CREATE TABLE users (
                    id_user SERIAL PRIMARY KEY,
                    nome VARCHAR(100) NOT NULL,
                    id_setor INTEGER NOT NULL REFERENCES setor(id_setor),
                    pontos_gamificacao INTEGER NOT NULL DEFAULT 0,
                    ultimo_aceite_lgpd TIMESTAMP NULL
                )
                """
            )

            cursor.execute(
                """
                CREATE TABLE user_roles (
                    id_user INTEGER NOT NULL REFERENCES users(id_user),
                    id_role INTEGER NOT NULL REFERENCES roles(id_role),
                    PRIMARY KEY (id_user, id_role)
                )
                """
            )

            cursor.execute(
                """
                CREATE TABLE log_acessos (
                    id_log SERIAL PRIMARY KEY,
                    id_user INTEGER NOT NULL REFERENCES users(id_user),
                    data_acesso TIMESTAMP NOT NULL
                )
                """
            )

            cursor.execute(
                """
                CREATE TABLE historico_consultas (
                    id_consulta SERIAL PRIMARY KEY,
                    id_funcionario INTEGER NOT NULL REFERENCES users(id_user),
                    id_psicologo INTEGER NOT NULL REFERENCES users(id_user),
                    data_consulta TIMESTAMP NOT NULL,
                    status_agendamento VARCHAR(50) NOT NULL
                )
                """
            )

    @classmethod
    def _seed_data(cls):
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO setor (id_setor, nome_setor) VALUES (1, 'Tecnologia'), (2, 'RH')"
            )
            cursor.execute(
                "INSERT INTO roles (id_role, nome_cargo) VALUES (1, 'Gestor'), (2, 'Funcionario'), (3, 'Psicologo')"
            )

            cursor.execute(
                """
                INSERT INTO users (id_user, nome, id_setor, pontos_gamificacao, ultimo_aceite_lgpd)
                VALUES
                    (1, 'Ana', 1, 120, NULL),
                    (2, 'Bruno', 1, 80, '2026-01-10 10:00:00'),
                    (3, 'Carla', 2, 150, '2026-01-11 10:00:00'),
                    (4, 'Diego', 2, 60, NULL),
                    (5, 'Elaine', 1, 40, '2026-01-12 10:00:00'),
                    (6, 'Paula Psicologa', 1, 0, '2026-01-13 10:00:00')
                """
            )

            cursor.execute(
                """
                INSERT INTO user_roles (id_user, id_role)
                VALUES
                    (1, 1),
                    (2, 2),
                    (3, 1),
                    (4, 2),
                    (5, 2),
                    (6, 3)
                """
            )

            cursor.execute(
                """
                INSERT INTO log_acessos (id_user, data_acesso)
                VALUES
                    (1, '2026-02-01 09:00:00'),
                    (2, '2026-02-02 09:00:00'),
                    (3, '2026-02-03 09:00:00'),
                    (6, '2026-02-04 09:00:00')
                """
            )

            cursor.execute(
                """
                INSERT INTO historico_consultas (id_funcionario, id_psicologo, data_consulta, status_agendamento)
                VALUES
                    (2, 6, '2026-03-10 14:00:00', 'Realizada'),
                    (1, 6, '2026-03-11 15:00:00', 'Cancelada')
                """
            )

    @classmethod
    def _drop_schema(cls):
        with connection.cursor() as cursor:
            cursor.execute("DROP TABLE IF EXISTS historico_consultas")
            cursor.execute("DROP TABLE IF EXISTS log_acessos")
            cursor.execute("DROP TABLE IF EXISTS user_roles")
            cursor.execute("DROP TABLE IF EXISTS users")
            cursor.execute("DROP TABLE IF EXISTS roles")
            cursor.execute("DROP TABLE IF EXISTS setor")

    def _fetch_all(self, query, params=None):
        with connection.cursor() as cursor:
            cursor.execute(query, params or [])
            return cursor.fetchall()

    def test_query_01_users_setor_cargo(self):
        rows = self._fetch_all(
            """
            SELECT u.nome, s.nome_setor, r.nome_cargo
            FROM users u
            INNER JOIN setor s ON s.id_setor = u.id_setor
            INNER JOIN user_roles ur ON ur.id_user = u.id_user
            INNER JOIN roles r ON r.id_role = ur.id_role
            ORDER BY u.nome
            """
        )
        self.assertEqual(
            rows,
            [
                ('Ana', 'Tecnologia', 'Gestor'),
                ('Bruno', 'Tecnologia', 'Funcionario'),
                ('Carla', 'RH', 'Gestor'),
                ('Diego', 'RH', 'Funcionario'),
                ('Elaine', 'Tecnologia', 'Funcionario'),
                ('Paula Psicologa', 'Tecnologia', 'Psicologo'),
            ],
        )

    def test_query_02_total_pontos_por_setor(self):
        rows = self._fetch_all(
            """
            SELECT SUM(u.pontos_gamificacao) AS total_pontos, s.nome_setor
            FROM users u
            INNER JOIN setor s ON s.id_setor = u.id_setor
            GROUP BY s.nome_setor
            ORDER BY SUM(u.pontos_gamificacao) DESC
            """
        )
        self.assertEqual(rows, [(240, 'Tecnologia'), (210, 'RH')])

    def test_query_03_usuarios_gestor(self):
        rows = self._fetch_all(
            """
            SELECT u.nome, s.nome_setor
            FROM users u
            INNER JOIN user_roles ur ON ur.id_user = u.id_user
            INNER JOIN roles r ON r.id_role = ur.id_role
            INNER JOIN setor s ON s.id_setor = u.id_setor
            WHERE r.nome_cargo = 'Gestor'
            ORDER BY u.nome
            """
        )
        self.assertEqual(rows, [('Ana', 'Tecnologia'), ('Carla', 'RH')])

    def test_query_04_lgpd_nulo(self):
        rows = self._fetch_all(
            """
            SELECT u.nome
            FROM users u
            WHERE u.ultimo_aceite_lgpd IS NULL
            ORDER BY u.nome
            """
        )
        self.assertEqual(rows, [('Ana',), ('Diego',)])

    def test_query_05_pontos_maior_100(self):
        rows = self._fetch_all(
            """
            SELECT u.nome, u.pontos_gamificacao, s.nome_setor
            FROM users u
            INNER JOIN setor s ON s.id_setor = u.id_setor
            WHERE u.pontos_gamificacao > 100
            ORDER BY u.pontos_gamificacao DESC
            """
        )
        self.assertEqual(rows, [('Carla', 150, 'RH'), ('Ana', 120, 'Tecnologia')])

    def test_query_06_sem_log_acesso_left_join(self):
        rows = self._fetch_all(
            """
            SELECT u.nome
            FROM users u
            LEFT JOIN log_acessos la ON la.id_user = u.id_user
            WHERE la.data_acesso IS NULL
            ORDER BY u.nome
            """
        )
        self.assertEqual(rows, [('Diego',), ('Elaine',)])

    def test_query_06_sem_log_acesso_subconsulta(self):
        rows = self._fetch_all(
            """
            SELECT nome
            FROM users
            WHERE id_user NOT IN (SELECT id_user FROM log_acessos)
            ORDER BY nome
            """
        )
        self.assertEqual(rows, [('Diego',), ('Elaine',)])

    def test_query_07_media_setor_tecnologia(self):
        rows = self._fetch_all(
            """
            SELECT s.nome_setor, ROUND(AVG(u.pontos_gamificacao), 2) AS media_setor
            FROM users u
            INNER JOIN setor s ON s.id_setor = u.id_setor
            WHERE s.nome_setor = 'Tecnologia'
            GROUP BY s.nome_setor
            """
        )
        self.assertEqual(rows, [('Tecnologia', 60.00)])

    def test_query_08_historico_consultas_realizada(self):
        rows = self._fetch_all(
            """
            SELECT
                func.nome AS nome_funcionario,
                psico.nome AS nome_psicologo,
                hc.data_consulta
            FROM historico_consultas hc
            INNER JOIN users func ON func.id_user = hc.id_funcionario
            INNER JOIN users psico ON psico.id_user = hc.id_psicologo
            WHERE hc.status_agendamento = 'Realizada'
            ORDER BY hc.data_consulta
            """
        )
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0][0], 'Bruno')
        self.assertEqual(rows[0][1], 'Paula Psicologa')

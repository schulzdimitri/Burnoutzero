from django.db import connection
from django.test import TransactionTestCase


class SqlQueriesTest(TransactionTestCase):
    """Validates business SQL queries in an isolated test schema."""

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
            cursor.execute("DROP TABLE IF EXISTS appointment_history")
            cursor.execute("DROP TABLE IF EXISTS access_logs")
            cursor.execute("DROP TABLE IF EXISTS user_roles")
            cursor.execute("DROP TABLE IF EXISTS users")
            cursor.execute("DROP TABLE IF EXISTS roles")
            cursor.execute("DROP TABLE IF EXISTS department")

            cursor.execute(
                """
                CREATE TABLE department (
                    id_department SERIAL PRIMARY KEY,
                    name VARCHAR(100) NOT NULL
                )
                """
            )

            cursor.execute(
                """
                CREATE TABLE roles (
                    id_role SERIAL PRIMARY KEY,
                    name VARCHAR(100) NOT NULL
                )
                """
            )

            cursor.execute(
                """
                CREATE TABLE users (
                    id_user SERIAL PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    id_department INTEGER NOT NULL REFERENCES department(id_department),
                    gamification_points INTEGER NOT NULL DEFAULT 0,
                    last_lgpd_acceptance TIMESTAMP NULL
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
                CREATE TABLE access_logs (
                    id_log SERIAL PRIMARY KEY,
                    id_user INTEGER NOT NULL REFERENCES users(id_user),
                    access_date TIMESTAMP NOT NULL
                )
                """
            )

            cursor.execute(
                """
                CREATE TABLE appointment_history (
                    id_appointment SERIAL PRIMARY KEY,
                    id_employee INTEGER NOT NULL REFERENCES users(id_user),
                    id_psychologist INTEGER NOT NULL REFERENCES users(id_user),
                    appointment_date TIMESTAMP NOT NULL,
                    status VARCHAR(50) NOT NULL
                )
                """
            )

    @classmethod
    def _seed_data(cls):
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO department (id_department, name) VALUES (1, 'Tecnologia'), (2, 'RH')"
            )
            cursor.execute(
                "INSERT INTO roles (id_role, name) VALUES (1, 'Gestor'), (2, 'Funcionario'), (3, 'Psicologo')"
            )

            cursor.execute(
                """
                INSERT INTO users (id_user, name, id_department, gamification_points, last_lgpd_acceptance)
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
                INSERT INTO access_logs (id_user, access_date)
                VALUES
                    (1, '2026-02-01 09:00:00'),
                    (2, '2026-02-02 09:00:00'),
                    (3, '2026-02-03 09:00:00'),
                    (6, '2026-02-04 09:00:00')
                """
            )

            cursor.execute(
                """
                INSERT INTO appointment_history (id_employee, id_psychologist, appointment_date, status)
                VALUES
                    (2, 6, '2026-03-10 14:00:00', 'Realizada'),
                    (1, 6, '2026-03-11 15:00:00', 'Cancelada')
                """
            )

    @classmethod
    def _drop_schema(cls):
        with connection.cursor() as cursor:
            cursor.execute("DROP TABLE IF EXISTS appointment_history")
            cursor.execute("DROP TABLE IF EXISTS access_logs")
            cursor.execute("DROP TABLE IF EXISTS user_roles")
            cursor.execute("DROP TABLE IF EXISTS users")
            cursor.execute("DROP TABLE IF EXISTS roles")
            cursor.execute("DROP TABLE IF EXISTS department")

    def _fetch_all(self, query, params=None):
        with connection.cursor() as cursor:
            cursor.execute(query, params or [])
            return cursor.fetchall()

    def test_query_01_users_department_role(self):
        rows = self._fetch_all(
            """
            SELECT u.name, d.name, r.name
            FROM users u
            INNER JOIN department d ON d.id_department = u.id_department
            INNER JOIN user_roles ur ON ur.id_user = u.id_user
            INNER JOIN roles r ON r.id_role = ur.id_role
            ORDER BY u.name
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

    def test_query_02_total_points_by_department(self):
        rows = self._fetch_all(
            """
            SELECT SUM(u.gamification_points) AS total_points, d.name
            FROM users u
            INNER JOIN department d ON d.id_department = u.id_department
            GROUP BY d.name
            ORDER BY SUM(u.gamification_points) DESC
            """
        )
        self.assertEqual(rows, [(240, 'Tecnologia'), (210, 'RH')])

    def test_query_03_users_manager(self):
        rows = self._fetch_all(
            """
            SELECT u.name, d.name
            FROM users u
            INNER JOIN user_roles ur ON ur.id_user = u.id_user
            INNER JOIN roles r ON r.id_role = ur.id_role
            INNER JOIN department d ON d.id_department = u.id_department
            WHERE r.name = 'Gestor'
            ORDER BY u.name
            """
        )
        self.assertEqual(rows, [('Ana', 'Tecnologia'), ('Carla', 'RH')])

    def test_query_04_lgpd_null(self):
        rows = self._fetch_all(
            """
            SELECT u.name
            FROM users u
            WHERE u.last_lgpd_acceptance IS NULL
            ORDER BY u.name
            """
        )
        self.assertEqual(rows, [('Ana',), ('Diego',)])

    def test_query_05_points_greater_than_100(self):
        rows = self._fetch_all(
            """
            SELECT u.name, u.gamification_points, d.name
            FROM users u
            INNER JOIN department d ON d.id_department = u.id_department
            WHERE u.gamification_points > 100
            ORDER BY u.gamification_points DESC
            """
        )
        self.assertEqual(rows, [('Carla', 150, 'RH'), ('Ana', 120, 'Tecnologia')])

    def test_query_06_no_access_log_left_join(self):
        rows = self._fetch_all(
            """
            SELECT u.name
            FROM users u
            LEFT JOIN access_logs al ON al.id_user = u.id_user
            WHERE al.access_date IS NULL
            ORDER BY u.name
            """
        )
        self.assertEqual(rows, [('Diego',), ('Elaine',)])

    def test_query_06_no_access_log_subquery(self):
        rows = self._fetch_all(
            """
            SELECT name
            FROM users
            WHERE id_user NOT IN (SELECT id_user FROM access_logs)
            ORDER BY name
            """
        )
        self.assertEqual(rows, [('Diego',), ('Elaine',)])

    def test_query_07_average_department_tech(self):
        rows = self._fetch_all(
            """
            SELECT d.name, ROUND(AVG(u.gamification_points), 2) AS average_points
            FROM users u
            INNER JOIN department d ON d.id_department = u.id_department
            WHERE d.name = 'Tecnologia'
            GROUP BY d.name
            """
        )
        self.assertEqual(rows, [('Tecnologia', 60.00)])

    def test_query_08_appointment_history_completed(self):
        rows = self._fetch_all(
            """
            SELECT
                func.name AS employee_name,
                psico.name AS psychologist_name,
                ah.appointment_date
            FROM appointment_history ah
            INNER JOIN users func ON func.id_user = ah.id_employee
            INNER JOIN users psico ON psico.id_user = ah.id_psychologist
            WHERE ah.status = 'Realizada'
            ORDER BY ah.appointment_date
            """
        )
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0][0], 'Bruno')
        self.assertEqual(rows[0][1], 'Paula Psicologa')

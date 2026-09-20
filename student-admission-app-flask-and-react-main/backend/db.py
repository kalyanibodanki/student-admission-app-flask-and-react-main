import mysql.connector

# MySQL database details
DB_HOST = "localhost"
DB_USER = "root"
DB_PASSWORD = "kalyani@14#"
DB_NAME = "student_admissions"


def get_connection():
    connection = mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME
    )

    return connection
# =====================================================================
# app.py
#
# This is our Flask backend. It exposes a simple REST API that the
# React frontend talks to using fetch().
#
#   React  --HTTP request-->  Flask (this file)  --SQL-->  Oracle
#   React  <--JSON response-- Flask (this file)  <--rows-- Oracle
#
# Every route below does ONE thing:
#   GET    /students       -> read all students
#   POST   /students       -> create a new student
#   PUT    /students/<id>  -> update one student
#   DELETE /students/<id>  -> delete one student
#
# Flask receives/sends data as JSON, which is just Python dictionaries
# under the hood -- easy for a browser (React) to understand.
# =====================================================================

from flask import Flask, request, jsonify
from flask_cors import CORS
from db import get_connection

app = Flask(__name__)

# CORS lets our React app (running on a different port, e.g. 3000)
# make requests to this Flask app (running on port 5000).
CORS(app)


def row_to_dict(row):
    """
    Oracle gives us back each row as a plain tuple, e.g.:
        (1, 'Sri Ram', 20, 'Male', '9876543210', 'Chennai', 'B.Tech', 'CSE')
    This helper turns that tuple into a dictionary with named keys,
    which converts cleanly into JSON for React to use.
    """
    return {
        "id": row[0],
        "name": row[1],
        "age": row[2],
        "gender": row[3],
        "phone": row[4],
        "address": row[5],
        "degree": row[6],
        "program": row[7],
    }


# ---------------------------------------------------------------------
# READ - GET /students
# Called once when the React app first loads, to fill the directory.
# ---------------------------------------------------------------------
@app.route("/students", methods=["GET"])
def get_students():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        "SELECT id, name, age, gender, phone, address, degree, program "
        "FROM students ORDER BY id"
    )
    rows = cursor.fetchall()

    cursor.close()
    connection.close()

    students = [row_to_dict(row) for row in rows]
    return jsonify(students)


# ---------------------------------------------------------------------
# CREATE - POST /students
# Called when the user fills the admission form and clicks "Add Student".
# ---------------------------------------------------------------------
@app.route("/students", methods=["POST"])
def add_student():
    data = request.get_json()  # the JSON body React sent us

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        INSERT INTO students (name, age, gender, phone, address, degree, program)
        VALUES (:1, :2, :3, :4, :5, :6, :7)
        """,
        (
            data["name"],
            data["age"],
            data["gender"],
            data["phone"],
            data["address"],
            data["degree"],
            data["program"],
        ),
    )
    connection.commit()  # save the change permanently

    cursor.close()
    connection.close()

    return jsonify({"message": "Student added successfully."}), 201


# ---------------------------------------------------------------------
# UPDATE - PUT /students/<id>
# Called when the user edits a student's details and saves the changes.
# ---------------------------------------------------------------------
@app.route("/students/<int:student_id>", methods=["PUT"])
def update_student(student_id):
    data = request.get_json()

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        UPDATE students
        SET name = :1, age = :2, gender = :3, phone = :4,
            address = :5, degree = :6, program = :7
        WHERE id = :8
        """,
        (
            data["name"],
            data["age"],
            data["gender"],
            data["phone"],
            data["address"],
            data["degree"],
            data["program"],
            student_id,
        ),
    )
    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({"message": "Student updated successfully."})


# ---------------------------------------------------------------------
# DELETE - DELETE /students/<id>
# Called when the user clicks the "Delete" button on a student record.
# ---------------------------------------------------------------------
@app.route("/students/<int:student_id>", methods=["DELETE"])
def delete_student(student_id):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("DELETE FROM students WHERE id = :1", (student_id,))
    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({"message": "Student record deleted successfully."})


# ---------------------------------------------------------------------
# Run the Flask development server.
# By default this app runs at: http://127.0.0.1:5000
# ---------------------------------------------------------------------
if __name__ == "__main__":
    app.run(debug=True, port=5000)

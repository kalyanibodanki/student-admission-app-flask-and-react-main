# =====================================================================
# app.py
#
# Simple Flask backend for Student Admission CRUD Application.
#
# React  <----HTTP/JSON---->  Flask  <----SQL---->  MySQL
#
# Routes:
#   GET    /students       -> Read all students
#   POST   /students       -> Add a new student
#   PUT    /students/<id>  -> Update a student
#   DELETE /students/<id>  -> Delete a student
# =====================================================================

from flask import Flask, request, jsonify
from flask_cors import CORS
from db import get_connection

app = Flask(__name__)

# Allow React to communicate with Flask
CORS(app)


# ---------------------------------------------------------------------
# Convert a database row into a Python dictionary
# ---------------------------------------------------------------------
def row_to_dict(row):
    return {
        "id": row[0],
        "name": row[1],
        "age": row[2],
        "gender": row[3],
        "phone": row[4],
        "address": row[5],
        "degree": row[6],
        "program": row[7]
    }


# ---------------------------------------------------------------------
# READ - GET /students
# ---------------------------------------------------------------------
@app.route("/students", methods=["GET"])
def get_students():

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT id, name, age, gender, phone, address, degree, program
        FROM students
        ORDER BY id
        """
    )

    rows = cursor.fetchall()

    cursor.close()
    connection.close()

    students = [row_to_dict(row) for row in rows]

    return jsonify(students)


# ---------------------------------------------------------------------
# CREATE - POST /students
# ---------------------------------------------------------------------
@app.route("/students", methods=["POST"])
def add_student():

    data = request.get_json()

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        INSERT INTO students
        (name, age, gender, phone, address, degree, program)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """,
        (
            data["name"],
            data["age"],
            data["gender"],
            data["phone"],
            data["address"],
            data["degree"],
            data["program"]
        )
    )

    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({
        "message": "Student added successfully."
    }), 201


# ---------------------------------------------------------------------
# UPDATE - PUT /students/<id>
# ---------------------------------------------------------------------
@app.route("/students/<int:student_id>", methods=["PUT"])
def update_student(student_id):

    data = request.get_json()

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        UPDATE students
        SET name = %s,
            age = %s,
            gender = %s,
            phone = %s,
            address = %s,
            degree = %s,
            program = %s
        WHERE id = %s
        """,
        (
            data["name"],
            data["age"],
            data["gender"],
            data["phone"],
            data["address"],
            data["degree"],
            data["program"],
            student_id
        )
    )

    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({
        "message": "Student updated successfully."
    })


# ---------------------------------------------------------------------
# DELETE - DELETE /students/<id>
# ---------------------------------------------------------------------
@app.route("/students/<int:student_id>", methods=["DELETE"])
def delete_student(student_id):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        "DELETE FROM students WHERE id = %s",
        (student_id,)
    )

    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({
        "message": "Student record deleted successfully."
    })


# ---------------------------------------------------------------------
# Run Flask server
# ---------------------------------------------------------------------
if __name__ == "__main__":
    app.run(debug=True, port=5000)
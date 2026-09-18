// =====================================================================
// App.js
//
// This is the whole frontend of our teaching app, kept in one file on
// purpose so it's easy to follow along in class.
//
// The flow to understand:
//   1. When the page loads, useEffect() asks Flask for all students (GET).
//   2. Filling the form and clicking "Add Student" sends that data to
//      Flask (POST), then we reload the list.
//   3. Clicking "Edit" copies a student's data back into the form. When
//      you then click "Save Changes", we send it to Flask (PUT).
//   4. Clicking "Delete" tells Flask to remove that student (DELETE).
//
// Every request uses the browser's built-in fetch() function -- no
// extra libraries needed.
// =====================================================================

import { useState, useEffect } from "react";
import "./App.css"
// The Flask backend runs on this address. Change this if you run Flask
// on a different port.
const API_URL = "http://127.0.0.1:5000/students";

// The empty shape of our form. We reuse this to clear the form after a
// save, and to fill it back in when "Edit" is clicked.
const emptyForm = {
  name: "",
  age: "",
  gender: "",
  phone: "",
  address: "",
  degree: "",
  program: "",
};

function App() {
  const [students, setStudents] = useState([]); // all student records from Oracle
  const [form, setForm] = useState(emptyForm); // current values typed in the form
  const [editingId, setEditingId] = useState(null); // null = adding, otherwise = editing this id
  const [message, setMessage] = useState(""); // small status text, e.g. after delete

  // -------------------------------------------------------------
  // Load all students from Flask. We call this once when the page
  // first loads, and again after every add / edit / delete so the
  // directory always matches what's in Oracle.
  // -------------------------------------------------------------
  const loadStudents = () => {
    fetch(API_URL)
      .then((response) => response.json())
      .then((data) => setStudents(data))
      .catch((error) => console.error("Error loading students:", error));
  };

  // useEffect with an empty [] dependency list runs once, when the
  // component first mounts -- perfect for "load the initial data".
  useEffect(() => {
    loadStudents();
  }, []);

  // -------------------------------------------------------------
  // Keeps the form state in sync as the user types in any field.
  // The `name` attribute on each <input> tells us which field to update.
  // -------------------------------------------------------------
  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  // -------------------------------------------------------------
  // Runs when the form is submitted (Add Student / Save Changes).
  // Decides whether to POST (new student) or PUT (editing one).
  // -------------------------------------------------------------
  const handleSubmit = (event) => {
    event.preventDefault(); // stop the browser from reloading the page

    if (editingId === null) {
      // CREATE: no id yet, so this is a brand-new student
      fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
        .then((response) => response.json())
        .then(() => {
          setMessage("Student added successfully.");
          setForm(emptyForm);
          loadStudents();
        })
        .catch((error) => console.error("Error adding student:", error));
    } else {
      // UPDATE: editingId tells Flask which row to change
      fetch(`${API_URL}/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
        .then((response) => response.json())
        .then(() => {
          setMessage("Student updated successfully.");
          setForm(emptyForm);
          setEditingId(null);
          loadStudents();
        })
        .catch((error) => console.error("Error updating student:", error));
    }
  };

  // -------------------------------------------------------------
  // Copies the clicked student's data into the form so it can be
  // edited, and remembers which id we're editing.
  // -------------------------------------------------------------
  const handleEdit = (student) => {
    setForm({
      name: student.name,
      age: student.age,
      gender: student.gender,
      phone: student.phone,
      address: student.address,
      degree: student.degree,
      program: student.program,
    });
    setEditingId(student.id);
    setMessage("");
  };

  // -------------------------------------------------------------
  // Cancels an in-progress edit and clears the form back to "Add" mode.
  // -------------------------------------------------------------
  const handleCancelEdit = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  // -------------------------------------------------------------
  // Deletes a student after a quick confirmation.
  // -------------------------------------------------------------
  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this student record?"
    );
    if (!confirmed) return;

    fetch(`${API_URL}/${id}`, { method: "DELETE" })
      .then((response) => response.json())
      .then(() => {
        setMessage("Student record deleted successfully.");
        loadStudents();
      })
      .catch((error) => console.error("Error deleting student:", error));
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1>Student Admission System</h1>
        <p>React &rarr; Flask &rarr; Oracle CRUD demo</p>
      </header>

      {message && <div className="status-banner">{message}</div>}

      <div className="layout">
        {/* ---------------- LEFT: Admission Form ---------------- */}
        <section className="card form-card">
          <h2>{editingId === null ? "Student Admission" : "Edit Student"}</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="field">
                <label htmlFor="name">Student Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Sri Ram"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="age">Age</label>
                <input
                  id="age"
                  name="age"
                  type="number"
                  min="15"
                  max="100"
                  value={form.age}
                  onChange={handleChange}
                  placeholder="e.g. 21"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="field">
                <label htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="e.g. 9876543210"
                  required
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                name="address"
                rows="2"
                value={form.address}
                onChange={handleChange}
                placeholder="e.g. Vijayawada, Andhra Pradesh"
              />
            </div>

            <div className="form-row">
              <div className="field">
                <label htmlFor="degree">Degree</label>
                <select
                  id="degree"
                  name="degree"
                  value={form.degree}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select</option>
                  <option value="B.Tech">B.Tech</option>
                  <option value="M.Tech">M.Tech</option>
                  <option value="MCA">MCA</option>
                  <option value="M.Sc">M.Sc</option>
                  <option value="B.Sc">B.Sc</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="program">Program</label>
                <select
                  id="program"
                  name="program"
                  value={form.program}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Information Technology">
                    Information Technology
                  </option>
                  <option value="Electronics">Electronics</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId === null ? "Add Student" : "Save Changes"}
              </button>
              {editingId !== null && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* ---------------- RIGHT: Student Directory ---------------- */}
        <section className="card directory-card">
          <h2>Student Directory</h2>

          {students.length === 0 ? (
            <p className="empty-state">No students yet. Add one to get started.</p>
          ) : (
            <div className="student-list">
              {students.map((student) => (
                <article className="student-row" key={student.id}>
                  <div className="student-id">#{student.id}</div>

                  <div className="student-info">
                    <h3>{student.name}</h3>
                    <div className="student-meta">
                      <span>{student.age} yrs</span>
                      <span>{student.gender}</span>
                      <span>{student.phone}</span>
                    </div>
                    <div className="student-meta">
                      <span className="pill">{student.degree}</span>
                      <span className="pill pill-alt">{student.program}</span>
                    </div>
                    {student.address && (
                      <p className="student-address">{student.address}</p>
                    )}
                  </div>

                  <div className="student-actions">
                    <button
                      className="btn btn-edit"
                      onClick={() => handleEdit(student)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-delete"
                      onClick={() => handleDelete(student.id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default App;

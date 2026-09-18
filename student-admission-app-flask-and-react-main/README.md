# Student Admission System — Teaching CRUD App

A minimal full-stack app for teaching how **React**, **Flask**, and **Oracle SQL**
talk to each other. Built for MCA / M.Sc Data Science students learning CRUD.

```
React (frontend)  <--fetch()-->  Flask (backend)  <--oracledb-->  Oracle SQL
```

## Project structure

```
student-admission-app/
├── backend/
│   ├── app.py            Flask app + the 4 CRUD routes
│   ├── db.py              Opens the Oracle connection
│   ├── schema.sql          Creates the `students` table
│   └── requirements.txt
├── frontend/
│   ├── public/index.html
│   └── src/
│       ├── App.js          All React UI + CRUD logic (one file, easy to read)
│       ├── App.css         Plain hand-written CSS (no frameworks)
│       └── index.js        Renders <App /> onto the page
└── README.md
```

## How a request flows, end to end

1. **Page loads** → React's `useEffect` calls `fetch("http://127.0.0.1:5000/students")`.
2. **Flask** (`app.py`, `GET /students`) runs a `SELECT` against Oracle via `db.py`.
3. **Oracle** returns rows → Flask converts them to a list of dictionaries → `jsonify()` sends JSON back.
4. **React** receives the JSON and stores it with `useState`, which re-renders the Student Directory.

Adding, editing, and deleting follow the same shape, just with `POST`, `PUT`,
and `DELETE` instead of `GET`, and Oracle's `INSERT` / `UPDATE` / `DELETE`
instead of `SELECT`.

## Setup

### 1. Database (Oracle)

1. Make sure you have an Oracle database running (Oracle XE works well for class).
2. Run `backend/schema.sql` in SQL*Plus or SQL Developer to create the `students` table.

### 2. Backend (Flask)

```bash
cd backend
pip install -r requirements.txt
```

Open `db.py` and edit `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, and
`DB_SERVICE_NAME` to match your Oracle setup.

```bash
python app.py
```

Flask now runs at `http://127.0.0.1:5000`.

### 3. Frontend (React)

```bash
cd frontend
npm install
npm start
```

React now runs at `http://localhost:3000` and talks to Flask automatically.

## Teaching notes

- All CRUD logic lives in **one** `App.js` file and **one** `app.py` file on
  purpose — no routing libraries, no state managers, no ORM. Just
  `useState`, `useEffect`, `fetch()`, Flask routes, and raw SQL.
- Every route in `app.py` and every handler in `App.js` has a comment
  explaining *why* it exists, not just what it does — good material to
  walk through line-by-line in class.
- `db.py` opens a new connection per request instead of pooling one.
  Simpler to reason about for beginners; mention connection pooling as
  a "next step" once they're comfortable with the basics.

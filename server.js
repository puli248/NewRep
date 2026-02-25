const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "", // your mysql password
    database: "campus hub live" // your database name
});

db.connect(err => {
    if (err) {
        console.error("Database connection failed:", err);
    } else {
        console.log("MySQL Connected");
    }
});

/* ================= REGISTER ================= */
app.post("/register", (req, res) => {
    const { fullName, indexNo, role, password } = req.body;

    if (!fullName || !indexNo || !role || !password) {
        return res.json({ success: false, message: "All fields required" });
    }

    db.query(
        "SELECT * FROM students WHERE index_no = ?", [indexNo],
        (err, results) => {

            if (results.length > 0) {
                return res.json({
                    success: false,
                    message: "Index number already registered"
                });
            }

            const sql = `
                INSERT INTO students (full_name, index_no, role, password)
                VALUES (?, ?, ?, ?)
            `;

            db.query(sql, [fullName, indexNo, role, password], (err) => {
                if (err) {
                    return res.json({ success: false, message: "Insert failed" });
                }

                res.json({ success: true });
            });
        }
    );
});

/* ================= LOGIN ================= */
app.post("/login", (req, res) => {
    const { indexNo, password } = req.body;

    db.query(
        "SELECT * FROM students WHERE index_no = ?", [indexNo],
        (err, results) => {
            if (err) return res.json({ success: false });

            if (results.length === 0) {
                return res.json({
                    success: false,
                    message: "User not found"
                });
            }

            const user = results[0];

            if (user.password !== password) {
                return res.json({
                    success: false,
                    message: "Incorrect password"
                });
            }

            res.json({
                success: true,
                user: user
            });
        }
    );
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
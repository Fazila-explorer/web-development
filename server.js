const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
  host: "localhost", // Replace with your host if needed
  user: "root", // Replace with your MySQL username
  password: "", // Replace with your MySQL password
  database: "login_db", // Ensure this database exists
});

db.connect((err) => {
  if (err) {
    console.log("Error connecting to the database:", err.message);
    process.exit(1); // Exit if connection fails
  } else {
    console.log("Connected to MySQL database");
  }
});

// Create User Table
app.get("/create-table", (req, res) => {
  const sql = `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255)
  )`;
  db.query(sql, (err) => {
    if (err) {
      console.error("Error creating table:", err.message);
      res.status(500).send("Error creating table");
    } else {
      res.send("User table created!");
    }
  });
});

// Register User
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).send({ success: false, message: "Email and password are required" });
  }

  const sql = "INSERT INTO users (email, password) VALUES (?, ?)";
  db.query(sql, [email, password], (err) => {
    if (err) {
      console.error("Error registering user:", err.message);
      if (err.code === "ER_DUP_ENTRY") {
        res.status(400).send({ success: false, message: "Email already exists" });
      } else {
        res.status(500).send({ success: false, message: "Error registering user" });
      }
    } else {
      res.send({ success: true, message: "User registered successfully" });
    }
  });
});

// Login User
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).send({ success: false, message: "Email and password are required" });
  }

  const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
  db.query(sql, [email, password], (err, results) => {
    if (err) {
      console.error("Error during login:", err.message);
      res.status(500).send({ success: false, message: "Error during login" });
    } else if (results.length > 0) {
      res.send({ success: true, message: "Login successful", user: results[0] });
    } else {
      res.status(401).send({ success: false, message: "Invalid credentials" });
    }
  });
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

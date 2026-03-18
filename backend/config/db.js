const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createConnection(
  process.env.DATABASE_URL
);

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to Railway MySQL database!");
  }
});

module.exports = db;
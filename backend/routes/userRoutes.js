const express = require("express");
const router = express.Router();
const db = require("../config/db"); // adjust path if needed
router.get("/", (req, res) => {

  const query = `
    SELECT 
      user_id AS id,
      name,
      email,
      role,
      status,
      created_at
    FROM users
  `;

  db.query(query, (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(result);
  });
});

module.exports = router;
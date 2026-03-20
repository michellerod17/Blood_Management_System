const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", (req, res) => {
  let notifications = [];

  // 🔴 LOW STOCK ALERT
  db.query(
    `SELECT blood_group, available_units FROM blood_stock WHERE available_units < 30`,
    (err, lowStock) => {
      if (err) {
        console.error("Low stock error:", err);
        return res.status(500).json({ error: "Server error" });
      }

      lowStock.forEach(item => {
        notifications.push({
          type: "CRITICAL",
          title: "Critical Stock Alert",
          message: `${item.blood_group} stock below 30 units`,
          time: "Recently"
        });
      });

      // 🟡 NEW HOSPITAL REGISTRATION
      db.query(
        `SELECT hospital_name FROM hospital ORDER BY hospital_id DESC LIMIT 2`,
        (err, hospitals) => {
          if (err) {
            console.error("Hospital error:", err);
            return res.status(500).json({ error: "Server error" });
          }

          hospitals.forEach(h => {
            notifications.push({
              type: "INFO",
              title: "New Registration",
              message: `${h.hospital_name} submitted registration`,
              time: "Recently"
            });
          });

          // 🔴 SECURITY ALERT
          notifications.push({
            type: "CRITICAL",
            title: "Security Alert",
            message: "Multiple failed login attempts detected",
            time: "2 hours ago"
          });

          // 🔵 SYSTEM UPDATE
          notifications.push({
            type: "INFO",
            title: "System Update",
            message: "System running smoothly",
            time: "Today"
          });

          // ✅ FINAL RESPONSE
          res.json(notifications);
        }
      );
    }
  );
});

module.exports = router;
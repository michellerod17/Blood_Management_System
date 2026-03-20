const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Get health checks for donor
router.get("/donor/:id", (req, res) => {
    const donorId = req.params.id;

    const sql = `
        SELECT *
        FROM health_check
        WHERE donor_id = ?
        ORDER BY check_date DESC
    `;

    db.query(sql, [donorId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Database error" });
        }

        res.json(results);
    });
});
// =============================
// GET ALL HEALTH CHECKS (ADMIN)
// =============================
router.get("/", (req, res) => {
    const sql = `
        SELECT 
            hc.check_id,
            d.name AS donor,
            d.donor_id,
            d.blood_group,
            hc.check_date,
            hc.weight,
            hc.blood_pressure,
            hc.hemoglobin,
            hc.eligibility_status
        FROM health_check hc
        JOIN donor d ON hc.donor_id = d.donor_id
        ORDER BY hc.check_date DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Database error" });
        }

        res.json(results);
    });
});
module.exports = router;
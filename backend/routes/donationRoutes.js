const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/donor/:id', (req, res) => {
    const donorId = req.params.id;

    const sql = `
         SELECT 
        dr.donation_id,
        dr.donation_date,
        dr.quantity,
        bb.bank_name,
        bb.city
    FROM donation_record dr
    JOIN blood_bank bb ON dr.bank_id = bb.bank_id
    WHERE dr.donor_id = ?
    ORDER BY dr.donation_date DESC
    `;

    db.query(sql, [donorId], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error" });
        }

        res.json(results);
    });
});
router.get('/', (req, res) => {

    const sql = `
        SELECT 
            dr.donation_id,
            dr.donation_date,
            dr.quantity,
            d.name AS donor_name,
            d.blood_group,
            bb.bank_name
        FROM donation_record dr
        JOIN donor d ON dr.donor_id = d.donor_id
        JOIN blood_bank bb ON dr.bank_id = bb.bank_id
        ORDER BY dr.donation_date DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error" });
        }

        res.json(results);
    });
});
module.exports = router;
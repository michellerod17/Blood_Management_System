
const express = require("express");
const router = express.Router();
const db = require("../config/db");
router.get("/", (req, res) => {

    const query = `
        SELECT 
            p.payment_id,
            p.payment_date,
            CAST(p.amount AS DECIMAL(10,2)) AS amount,
            LOWER(p.payment_status) AS payment_status,
            b.bank_name,
            h.hospital_name,
            p.request_id
        FROM payment p
        JOIN blood_bank b ON p.bank_id = b.bank_id
        JOIN hospital h ON p.hospital_id = h.hospital_id
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Server Error" });
        }
        res.json(results);
    });

});

module.exports = router;
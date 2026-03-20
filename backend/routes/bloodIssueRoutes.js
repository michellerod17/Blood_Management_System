const express = require("express");
const router = express.Router();
const db = require("../config/db");

// =============================
// GET ALL BLOOD ISSUES
// =============================
router.get("/", (req, res) => {
   const sql = `
SELECT 
    bi.issue_id,
    br.request_id,
    h.hospital_name AS hospital,
    bb.bank_name AS blood_bank,
    bi.units_issued,
    bi.issue_date
FROM blood_issue bi
JOIN blood_request br ON bi.request_id = br.request_id
JOIN hospital h ON br.hospital_id = h.hospital_id
JOIN blood_bank bb ON br.bank_id = bb.bank_id
ORDER BY bi.issue_date DESC
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
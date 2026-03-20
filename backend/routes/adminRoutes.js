const express = require("express");
const router = express.Router();
const db = require("../config/db");

console.log("Admin routes loaded");

// =============================
// TEST ROUTE
// =============================
router.get("/hello", (req, res) => {
  res.send("Admin route works");
});

// =============================
// ADMIN DASHBOARD STATISTICS
// =============================
router.get("/dashboard", (req, res) => {

  const query = `
    SELECT
      (SELECT COUNT(*) FROM donor) AS total_donors,
      (SELECT COUNT(*) FROM hospital) AS total_hospitals,
      (SELECT COUNT(*) FROM blood_bank) AS total_blood_banks,
      (SELECT COUNT(*) FROM blood_request) AS total_requests,
      (SELECT COUNT(*) FROM donation_record) AS total_donations
  `;

  db.query(query, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result[0]);
  });

});

// =============================
// GET ALL BLOOD REQUESTS (✅ FIXED)
// =============================
router.get("/requests", (req, res) => {

  const query = `
    SELECT 
      br.request_id AS id,
      h.hospital_name AS hospital,
      bb.bank_name AS blood_bank,
      p.name AS patient_name,
      p.blood_group,
      br.units_required AS quantity,
      br.status,
      br.request_date
    FROM blood_request br
    JOIN hospital h ON br.hospital_id = h.hospital_id
    LEFT JOIN patient p ON br.patient_id = p.patient_id
    LEFT JOIN blood_bank bb ON br.bank_id = bb.bank_id
    ORDER BY br.request_date DESC
  `;

  db.query(query, (err, result) => {
    if (err) {
      console.error("Requests error:", err);
      return res.status(500).json(err);
    }
    res.json(result);
  });

});

// =============================
// GET ALL APPROVALS
// =============================
router.get("/approvals", (req, res) => {

  const query = `
    SELECT 
      br.request_id AS id,
      br.hospital_id,
      h.hospital_name,
      p.name AS patient_name,
      br.patient_id,
      br.bank_id,
      br.request_date,
      br.units_required,
      br.status
    FROM blood_request br
    JOIN hospital h ON br.hospital_id = h.hospital_id
    LEFT JOIN patient p ON br.patient_id = p.patient_id
    ORDER BY br.request_date DESC
  `;

  db.query(query, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });

});

// =============================
// APPROVE REQUEST
// =============================
router.put("/approve/:id", (req, res) => {

  const query = `
    UPDATE blood_request
    SET status = 'approved'
    WHERE request_id = ?
  `;

  db.query(query, [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Request approved successfully" });
  });

});

// =============================
// REJECT REQUEST
// =============================
router.put("/reject/:id", (req, res) => {

  const query = `
    UPDATE blood_request
    SET status = 'rejected'
    WHERE request_id = ?
  `;

  db.query(query, [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Request rejected successfully" });
  });

});

// =============================
// GET ALL BLOOD BANKS
// =============================
router.get("/blood-banks", (req, res) => {

  const query = `
    SELECT 
      bb.bank_id,
      bb.bank_name AS name,
      bb.city,
      bb.contact_no,

      (
        SELECT COALESCE(SUM(available_units), 0)
        FROM blood_stock bs
        WHERE bs.bank_id = bb.bank_id
      ) AS units,

      (
        SELECT COUNT(*)
        FROM donation_record dr
        WHERE dr.bank_id = bb.bank_id
      ) AS donated

    FROM blood_bank bb
  `;

  db.query(query, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });

});

// =============================
// INVENTORY ROUTE
// =============================
router.get("/inventory", (req, res) => {

  const query = `
    SELECT 
      bb.bank_id,
      bb.bank_name,
      bb.city,
      bs.blood_group,
      bs.available_units
    FROM blood_bank bb
    JOIN blood_stock bs ON bb.bank_id = bs.bank_id
    ORDER BY bb.bank_id
  `;

  db.query(query, (err, result) => {
    if (err) {
      console.error("Inventory error:", err);
      return res.status(500).json(err);
    }

    res.json(result);
  });

});

module.exports = router;
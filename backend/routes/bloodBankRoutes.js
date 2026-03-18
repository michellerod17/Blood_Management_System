const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ─────────────────────────────────────────────
// BLOOD BANK PROFILE
// GET /blood-banks/          → list all banks
// GET /blood-banks/:id       → single bank profile
// PUT /blood-banks/:id       → update bank profile
// ─────────────────────────────────────────────

router.get("/", (req, res) => {
  db.query("SELECT * FROM blood_bank", (err, results) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    res.json(results);
  });
});

router.get("/:id", (req, res) => {
  db.query(
    "SELECT * FROM blood_bank WHERE bank_id = ?",
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      if (!results.length) return res.status(404).json({ message: "Blood bank not found" });
      res.json(results[0]);
    }
  );
});

router.put("/:id", (req, res) => {
  const { bank_name, city, contact_no } = req.body;
  db.query(
    "UPDATE blood_bank SET bank_name=?, city=?, contact_no=? WHERE bank_id=?",
    [bank_name, city, contact_no, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      res.json({ message: "Blood bank updated successfully" });
    }
  );
});

// ─────────────────────────────────────────────
// BLOOD STOCK (Inventory)
// GET  /blood-banks/:id/stock        → all stock for a bank
// PUT  /blood-banks/:id/stock/:group → update stock for a blood group
// ─────────────────────────────────────────────

router.get("/:id/stock", (req, res) => {
  db.query(
    "SELECT * FROM blood_stock WHERE bank_id = ? ORDER BY blood_group",
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      res.json(results);
    }
  );
});

router.put("/:id/stock/:group", (req, res) => {
  const { available_units, action } = req.body;
  // action: 'add' or 'remove'
  const operator = action === "remove" ? "-" : "+";
  db.query(
    `UPDATE blood_stock 
     SET available_units = available_units ${operator} ?, last_updated = CURDATE()
     WHERE bank_id = ? AND blood_group = ?`,
    [available_units, req.params.id, req.params.group],
    (err, result) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      if (result.affectedRows === 0) {
        // Insert if not exists
        db.query(
          "INSERT INTO blood_stock (bank_id, blood_group, available_units, last_updated) VALUES (?,?,?,CURDATE())",
          [req.params.id, req.params.group, available_units],
          (err2) => {
            if (err2) return res.status(500).json({ message: "DB error", error: err2 });
            res.json({ message: "Stock created and updated" });
          }
        );
      } else {
        res.json({ message: "Stock updated successfully" });
      }
    }
  );
});

// ─────────────────────────────────────────────
// DASHBOARD SUMMARY
// GET /blood-banks/:id/dashboard
// Returns: stock, pending requests, recent donations, donor stats, payments
// ─────────────────────────────────────────────

router.get("/:id/dashboard", (req, res) => {
  const bankId = req.params.id;

  const stockQ = "SELECT * FROM blood_stock WHERE bank_id = ?";
  const pendingReqQ = `
    SELECT br.*, h.hospital_name, p.name AS patient_name, p.blood_group
    FROM blood_request br
    JOIN hospital h ON br.hospital_id = h.hospital_id
    JOIN patient p ON br.patient_id = p.patient_id
    WHERE br.bank_id = ? AND br.status IN ('Pending','Processing')
    ORDER BY br.request_date DESC LIMIT 10`;
  const recentDonQ = `
    SELECT dr.*, d.name AS donor_name, d.blood_group
    FROM donation_record dr
    JOIN donor d ON dr.donor_id = d.donor_id
    WHERE dr.bank_id = ?
    ORDER BY dr.donation_date DESC LIMIT 5`;
  const donorStatsQ = "SELECT status, COUNT(*) as count FROM donor GROUP BY status";
  const pendingPayQ = `
    SELECT SUM(amount) as total, COUNT(*) as count 
    FROM payment WHERE bank_id = ? AND payment_status = 'Pending'`;
  const donationTrendQ = `
    SELECT DATE_FORMAT(donation_date,'%b') as month,
           COUNT(*) as donations,
           SUM(quantity) as quantity_ml
    FROM donation_record
    WHERE bank_id = ?
    GROUP BY MONTH(donation_date), DATE_FORMAT(donation_date,'%b')
    ORDER BY MONTH(donation_date)`;

  db.query(stockQ, [bankId], (err, stock) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    db.query(pendingReqQ, [bankId], (err, requests) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      db.query(recentDonQ, [bankId], (err, donations) => {
        if (err) return res.status(500).json({ message: "DB error", error: err });
        db.query(donorStatsQ, (err, donorStats) => {
          if (err) return res.status(500).json({ message: "DB error", error: err });
          db.query(pendingPayQ, [bankId], (err, pendingPay) => {
            if (err) return res.status(500).json({ message: "DB error", error: err });
            db.query(donationTrendQ, [bankId], (err, donationTrend) => {
              if (err) return res.status(500).json({ message: "DB error", error: err });
              res.json({
                stock,
                requests,
                donations,
                donorStats,
                pendingPayments: pendingPay[0],
                donationTrend,
              });
            });
          });
        });
      });
    });
  });
});

// ─────────────────────────────────────────────
// DONORS
// GET  /blood-banks/:id/donors          → all donors
// POST /blood-banks/:id/donors          → register new donor
// ─────────────────────────────────────────────

router.get("/:id/donors", (req, res) => {
  // All donors with their latest health check status
  db.query(
    `SELECT d.*,
       (SELECT hc.eligibility_status FROM health_check hc WHERE hc.donor_id = d.donor_id ORDER BY hc.check_date DESC LIMIT 1) AS eligibility_status,
       (SELECT COUNT(*) FROM donation_record dr WHERE dr.donor_id = d.donor_id AND dr.bank_id = ?) AS total_donations
     FROM donor d
     ORDER BY d.name`,
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      res.json(results);
    }
  );
});

router.post("/:id/donors", (req, res) => {
  const { name, age, gender, phone_no, blood_group, city } = req.body;
  db.query(
    `INSERT INTO donor (name, age, gender, phone_no, blood_group, city, status)
     VALUES (?, ?, ?, ?, ?, ?, 'active')`,
    [name, age, gender, phone_no, blood_group, city],
    (err, result) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      res.status(201).json({ message: "Donor registered", donor_id: result.insertId });
    }
  );
});

// ─────────────────────────────────────────────
// HEALTH CHECKS
// GET  /blood-banks/:id/health-checks   → all health checks for donors at this bank
// POST /blood-banks/:id/health-checks   → record a new health check
// ─────────────────────────────────────────────

router.get("/:id/health-checks", (req, res) => {
  db.query(
    `SELECT hc.*, d.name AS donor_name, d.blood_group
     FROM health_check hc
     JOIN donor d ON hc.donor_id = d.donor_id
     JOIN donation_record dr ON dr.donor_id = d.donor_id AND dr.bank_id = ?
     GROUP BY hc.check_id
     ORDER BY hc.check_date DESC`,
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      res.json(results);
    }
  );
});

router.post("/:id/health-checks", (req, res) => {
  const { donor_id, check_date, weight, blood_pressure, hemoglobin, eligibility_status } = req.body;
  db.query(
    `INSERT INTO health_check (donor_id, check_date, weight, blood_pressure, hemoglobin, eligibility_status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [donor_id, check_date, weight, blood_pressure, hemoglobin, eligibility_status],
    (err, result) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      // Also update donor status
      db.query(
        "UPDATE donor SET status = ? WHERE donor_id = ?",
        [eligibility_status === "Eligible" ? "active" : "inactive", donor_id],
        () => {}
      );
      res.status(201).json({ message: "Health check recorded", check_id: result.insertId });
    }
  );
});

// ─────────────────────────────────────────────
// DONATIONS
// GET  /blood-banks/:id/donations       → all donations at this bank
// POST /blood-banks/:id/donations       → record a new donation
// ─────────────────────────────────────────────

router.get("/:id/donations", (req, res) => {
  db.query(
    `SELECT dr.*, d.name AS donor_name, d.blood_group,
            hc.weight, hc.hemoglobin, hc.blood_pressure, hc.eligibility_status
     FROM donation_record dr
     JOIN donor d ON dr.donor_id = d.donor_id
     LEFT JOIN health_check hc ON dr.check_id = hc.check_id
     WHERE dr.bank_id = ?
     ORDER BY dr.donation_date DESC`,
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      res.json(results);
    }
  );
});

router.post("/:id/donations", (req, res) => {
  const { donor_id, check_id, donation_date, quantity } = req.body;
  const bankId = req.params.id;
  db.query(
    `INSERT INTO donation_record (donor_id, check_id, bank_id, donation_date, quantity)
     VALUES (?, ?, ?, ?, ?)`,
    [donor_id, check_id, bankId, donation_date, quantity],
    (err, result) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      // Get donor blood group to update stock
      db.query(
        "SELECT blood_group FROM donor WHERE donor_id = ?",
        [donor_id],
        (err2, donors) => {
          if (!err2 && donors.length) {
            const bg = donors[0].blood_group;
            db.query(
              `UPDATE blood_stock SET available_units = available_units + 1, last_updated = CURDATE()
               WHERE bank_id = ? AND blood_group = ?`,
              [bankId, bg],
              () => {}
            );
          }
          // Update donor last_donation_date
          db.query(
            "UPDATE donor SET last_donation_date = ? WHERE donor_id = ?",
            [donation_date, donor_id],
            () => {}
          );
        }
      );
      res.status(201).json({ message: "Donation recorded", donation_id: result.insertId });
    }
  );
});

// ─────────────────────────────────────────────
// BLOOD REQUESTS (Incoming from hospitals)
// GET /blood-banks/:id/requests         → all requests for this bank
// PUT /blood-banks/:id/requests/:reqId  → update request status
// ─────────────────────────────────────────────

router.get("/:id/requests", (req, res) => {
  db.query(
    `SELECT br.*, h.hospital_name, p.name AS patient_name, p.blood_group
     FROM blood_request br
     JOIN hospital h ON br.hospital_id = h.hospital_id
     JOIN patient p ON br.patient_id = p.patient_id
     WHERE br.bank_id = ?
     ORDER BY br.request_date DESC`,
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      res.json(results);
    }
  );
});

router.put("/:id/requests/:reqId", (req, res) => {
  const { status } = req.body;
  db.query(
    "UPDATE blood_request SET status = ? WHERE request_id = ? AND bank_id = ?",
    [status, req.params.reqId, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      res.json({ message: "Request status updated" });
    }
  );
});

// ─────────────────────────────────────────────
// BLOOD ISSUES
// GET  /blood-banks/:id/issues          → all blood issues for this bank
// POST /blood-banks/:id/issues          → issue blood for a request
// ─────────────────────────────────────────────

router.get("/:id/issues", (req, res) => {
  db.query(
    `SELECT bi.*, br.hospital_id, br.patient_id, br.units_required, br.bank_id,
            h.hospital_name, p.blood_group,
            py.payment_status, py.amount, py.payment_id
     FROM blood_issue bi
     JOIN blood_request br ON bi.request_id = br.request_id
     JOIN hospital h ON br.hospital_id = h.hospital_id
     JOIN patient p ON br.patient_id = p.patient_id
     LEFT JOIN payment py ON py.request_id = bi.request_id
     WHERE br.bank_id = ?
     ORDER BY bi.issue_date DESC`,
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      res.json(results);
    }
  );
});

router.post("/:id/issues", (req, res) => {
  const { request_id, issue_date, units_issued } = req.body;
  const bankId = req.params.id;

  // 1. Insert blood issue
  db.query(
    "INSERT INTO blood_issue (request_id, issue_date, units_issued) VALUES (?, ?, ?)",
    [request_id, issue_date, units_issued],
    (err, result) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      const issueId = result.insertId;

      // 2. Update request status to Fulfilled
      db.query(
        "UPDATE blood_request SET status = 'Fulfilled' WHERE request_id = ?",
        [request_id],
        () => {}
      );

      // 3. Deduct from blood stock
      db.query(
        `SELECT p.blood_group FROM blood_request br
         JOIN patient p ON br.patient_id = p.patient_id
         WHERE br.request_id = ?`,
        [request_id],
        (err2, rows) => {
          if (!err2 && rows.length) {
            db.query(
              `UPDATE blood_stock 
               SET available_units = GREATEST(0, available_units - ?), last_updated = CURDATE()
               WHERE bank_id = ? AND blood_group = ?`,
              [units_issued, bankId, rows[0].blood_group],
              () => {}
            );
          }
        }
      );

      // 4. Auto-create payment record
      db.query(
        `SELECT br.hospital_id FROM blood_request br WHERE br.request_id = ?`,
        [request_id],
        (err3, reqs) => {
          if (!err3 && reqs.length) {
            const amount = units_issued * 500; // ₹500 per unit
            db.query(
              `INSERT INTO payment (request_id, hospital_id, bank_id, payment_date, amount, payment_status)
               VALUES (?, ?, ?, ?, ?, 'Pending')`,
              [request_id, reqs[0].hospital_id, bankId, issue_date, amount],
              () => {}
            );
          }
        }
      );

      res.status(201).json({ message: "Blood issued successfully", issue_id: issueId });
    }
  );
});

// ─────────────────────────────────────────────
// PAYMENTS
// GET /blood-banks/:id/payments         → all payments for this bank
// PUT /blood-banks/:id/payments/:payId  → mark payment as paid
// ─────────────────────────────────────────────

router.get("/:id/payments", (req, res) => {
  db.query(
    `SELECT py.*, h.hospital_name
     FROM payment py
     JOIN hospital h ON py.hospital_id = h.hospital_id
     WHERE py.bank_id = ?
     ORDER BY py.payment_date DESC`,
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      res.json(results);
    }
  );
});

router.put("/:id/payments/:payId", (req, res) => {
  const { payment_status } = req.body;
  db.query(
    "UPDATE payment SET payment_status = ? WHERE payment_id = ? AND bank_id = ?",
    [payment_status, req.params.payId, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      res.json({ message: "Payment status updated" });
    }
  );
});

// ─────────────────────────────────────────────
// STOCK TREND  (for dashboard chart)
// GET /blood-banks/:id/stock-trend
// ─────────────────────────────────────────────

router.get("/:id/stock-trend", (req, res) => {
  // Returns last 7 days of net stock movement per blood group
  // Since we don't store history, we return current stock shaped for the chart
  db.query(
    "SELECT blood_group, available_units FROM blood_stock WHERE bank_id = ?",
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      // Build 7-day trend data (current value replicated — real history needs an audit table)
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const label = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
        const point = { date: label };
        results.forEach((r) => {
          point[r.blood_group] = r.available_units;
        });
        days.push(point);
      }
      res.json(days);
    }
  );
});

// ─────────────────────────────────────────────
// PAYMENT TREND  (for payments chart)
// GET /blood-banks/:id/payment-trend
// ─────────────────────────────────────────────

router.get("/:id/payment-trend", (req, res) => {
  db.query(
    `SELECT DATE_FORMAT(payment_date,'%b') as month,
            SUM(CASE WHEN payment_status='Paid' THEN amount ELSE 0 END) as received,
            SUM(CASE WHEN payment_status='Pending' THEN amount ELSE 0 END) as pending
     FROM payment
     WHERE bank_id = ?
     GROUP BY MONTH(payment_date), DATE_FORMAT(payment_date,'%b')
     ORDER BY MONTH(payment_date)`,
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      res.json(results);
    }
  );
});

module.exports = router;



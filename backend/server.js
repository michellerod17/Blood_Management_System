const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());


// =========================
// Import Routes
// =========================

const donorRoutes = require("./routes/donorRoutes");
const donationRoutes = require("./routes/donationRoutes");
const healthCheckRoutes = require("./routes/healthCheckRoutes");
const bloodBankRoutes = require("./routes/bloodBankRoutes");
const bloodRequestRoutes = require("./routes/bloodRequestRoutes");
const patientRoutes = require("./routes/patientRoutes");
const hospitalRoutes = require("./routes/hospitalRoutes");
const hospitalDashboardRoutes = require("./routes/hospitalDashboardRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminRoutes = require("./routes/adminRoutes");


// =========================
// Register Routes
// =========================

app.use("/donors", donorRoutes);

app.use("/donations", donationRoutes);

app.use("/health-checks", healthCheckRoutes);

app.use("/blood-banks", bloodBankRoutes);

app.use("/blood-requests", bloodRequestRoutes);

app.use("/patients", patientRoutes);

app.use("/hospitals", hospitalRoutes);

app.use("/hospital-dashboard", hospitalDashboardRoutes);

// Payment routes
app.use("/payments", paymentRoutes);

app.use("/api/admin", adminRoutes);

const bloodIssueRoutes = require("./routes/bloodIssueRoutes");

app.use("/blood-issues", bloodIssueRoutes);

const adminPaymentRoutes = require("./routes/adminPaymentRoutes.js");

app.use("/admin/payments", adminPaymentRoutes);

const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

const notificationRoutes = require("./routes/notifications");
app.use("/api/notifications", notificationRoutes);

// =========================
// Root Test Route
// =========================

app.get("/", (req, res) => {
  res.send("HEMA Backend Running 🚀");
});


// =========================
// Start Server
// =========================

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
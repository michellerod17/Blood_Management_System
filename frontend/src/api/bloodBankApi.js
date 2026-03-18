// src/api/bloodBankApi.js
// ─────────────────────────────────────────────────────────
// All blood bank API calls in one place.
// BANK_ID is hardcoded to 1 (your sample data uses bank_id = 1).
// When you add login, replace BANK_ID with the logged-in bank's ID.
// ─────────────────────────────────────────────────────────
 
const BASE = "http://localhost:5000";
export const BANK_ID = 1;
 
async function api(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "API error");
  }
  return res.json();
}
 
// ── Blood Bank Profile ────────────────────────────────────
export const getBloodBank = () => api(`/blood-banks/${BANK_ID}`);
export const updateBloodBank = (data) =>
  api(`/blood-banks/${BANK_ID}`, { method: "PUT", body: JSON.stringify(data) });
 
// ── Dashboard ─────────────────────────────────────────────
export const getDashboard = () => api(`/blood-banks/${BANK_ID}/dashboard`);
export const getStockTrend = () => api(`/blood-banks/${BANK_ID}/stock-trend`);
 
// ── Inventory / Stock ─────────────────────────────────────
export const getStock = () => api(`/blood-banks/${BANK_ID}/stock`);
export const updateStock = (bloodGroup, units, action) =>
  api(`/blood-banks/${BANK_ID}/stock/${encodeURIComponent(bloodGroup)}`, {
    method: "PUT",
    body: JSON.stringify({ available_units: units, action }),
  });
 
// ── Donors ────────────────────────────────────────────────
export const getDonors = () => api(`/blood-banks/${BANK_ID}/donors`);
export const registerDonor = (data) =>
  api(`/blood-banks/${BANK_ID}/donors`, { method: "POST", body: JSON.stringify(data) });
 
// ── Health Checks ─────────────────────────────────────────
export const getHealthChecks = () => api(`/blood-banks/${BANK_ID}/health-checks`);
export const createHealthCheck = (data) =>
  api(`/blood-banks/${BANK_ID}/health-checks`, { method: "POST", body: JSON.stringify(data) });
 
// ── Donations ─────────────────────────────────────────────
export const getDonations = () => api(`/blood-banks/${BANK_ID}/donations`);
export const recordDonation = (data) =>
  api(`/blood-banks/${BANK_ID}/donations`, { method: "POST", body: JSON.stringify(data) });
 
// ── Blood Requests ────────────────────────────────────────
export const getRequests = () => api(`/blood-banks/${BANK_ID}/requests`);
export const updateRequestStatus = (reqId, status) =>
  api(`/blood-banks/${BANK_ID}/requests/${reqId}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
 
// ── Blood Issues ──────────────────────────────────────────
export const getIssues = () => api(`/blood-banks/${BANK_ID}/issues`);
export const issueBlood = (data) =>
  api(`/blood-banks/${BANK_ID}/issues`, { method: "POST", body: JSON.stringify(data) });
 
// ── Payments ──────────────────────────────────────────────
export const getPayments = () => api(`/blood-banks/${BANK_ID}/payments`);
export const getPaymentTrend = () => api(`/blood-banks/${BANK_ID}/payment-trend`);
export const markPaymentPaid = (payId) =>
  api(`/blood-banks/${BANK_ID}/payments/${payId}`, {
    method: "PUT",
    body: JSON.stringify({ payment_status: "Paid" }),
  });
 

















































const db = require("../config/db");

const MAX_CAPACITY = 200;

// GET blood stock
exports.getBloodStock = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT blood_group, available_units FROM blood_stock");

    const stockWithCapacity = rows.map(row => ({
      blood_group: row.blood_group,
      available_units: row.available_units,
      capacity: MAX_CAPACITY
    }));

    res.json(stockWithCapacity);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching blood stock" });
  }
};
const express = require("express");
const bcrypt = require("bcrypt");
const connectDB = require("../db");

const router = express.Router();

// ===== REGISTER ADMIN =====
router.post("/register", async (req, res) => {
  const { cemetery_name, fullname, email, pass, confirmPass } = req.body;

  if (!cemetery_name || !fullname || !email || !pass || !confirmPass) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  if (pass !== confirmPass) {
    return res
      .status(400)
      .json({ success: false, message: "Passwords do not match" });
  }

  try {
    // ✅ Check if email already exists
    const checkQuery = "SELECT * FROM admin_accounts WHERE email = ?";
    connectDB.query(checkQuery, [email], async (err, result) => {
      if (err)
        return res
          .status(500)
          .json({ success: false, message: "Database error (check)" });

      if (result.length > 0) {
        return res
          .status(400)
          .json({ success: false, message: "Email already registered" });
      }

      // ✅ Hash password
      const hashedPass = await bcrypt.hash(pass, 10);

      // ✅ Insert new admin record
      const insertQuery = `
        INSERT INTO admin_accounts (cemetery_name, fullname, email, password_hash, created_at)
        VALUES (?, ?, ?, ?, NOW())
      `;
      const values = [cemetery_name, fullname, email, hashedPass];

      connectDB.query(insertQuery, values, (err, result) => {
        if (err)
          return res
            .status(500)
            .json({ success: false, message: "Database error (insert)" });

        res.json({
          success: true,
          message: "Admin registered successfully",
          admin: {
            admin_id: result.insertId,
            cemetery_name,
            fullname,
            email,
          },
        });
      });
    });
  } catch (err) {
    console.error("Error registering admin:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ===== LOGIN ADMIN =====
router.post("/login", (req, res) => {
  const { cemetery_name, email, pass } = req.body;

  if (!cemetery_name || !email || !pass) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  const query = "SELECT * FROM admin_accounts WHERE email = ?";
  connectDB.query(query, [email], async (err, result) => {
    if (err)
      return res.status(500).json({ success: false, message: "Server error" });

    if (result.length === 0)
      return res.json({ success: false, message: "Invalid email or password" });

    const admin = result[0];

    // ✅ Cemetery match check
    if (admin.cemetery_name !== cemetery_name) {
      return res.json({
        success: false,
        message: "Cemetery does not match this account",
      });
    }

    // ✅ Password check
    const isMatch = await bcrypt.compare(pass, admin.password_hash.toString());
    if (!isMatch)
      return res.json({ success: false, message: "Invalid email or password" });

    res.json({
      success: true,
      message: "Login successful",
      admin: {
        admin_id: admin.admin_id,
        cemetery_name: admin.cemetery_name,
        fullname: admin.fullname,
        email: admin.email,
      },
    });
  });
});

module.exports = router;

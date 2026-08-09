const express = require("express");
const router = express.Router();
const { admin, verifyPassword } = require("../data/admin");

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      status: "error",
      message: "Username dan password wajib diisi"
    });
  }

  if (username !== admin.username || !verifyPassword(password)) {
    return res.status(401).json({
      status: "error",
      message: "Username atau password salah"
    });
  }

  req.session.user = { username: admin.username };

  res.status(200).json({
    status: "success",
    message: "Login berhasil"
  });
});

router.post("/logout", (req, res) => {
  if (!req.session) {
    return res.status(200).json({ status: "success", message: "Logout berhasil" });
  }

  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        status: "error",
        message: "Gagal logout"
      });
    }
    res.clearCookie("connect.sid");
    res.status(200).json({
      status: "success",
      message: "Logout berhasil"
    });
  });
});

module.exports = router;
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/checkRole'); // Pastikan kamu sudah membuat file middleware checkRole

// Endpoint ini hanya bisa diakses oleh admin
router.get('/admin', authMiddleware, checkRole('admin'), (req, res) => {
  res.status(200).json({
    message: 'Welcome Admin',
    user: req.user // Data user yang sudah terautentikasi
  });
});

module.exports = router;

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const bcrypt = require('bcrypt');

// Get all users
router.get('/', authMiddleware, (req, res) => {
  const query = 'SELECT id, username, email FROM users';
  req.db.query(query, (err, users) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch users' });
    res.json(users);
  });
});

// Get user by ID
router.get('/:id', authMiddleware, (req, res) => {
  const { id } = req.params;  // Mengambil ID dari parameter URL
  const query = 'SELECT id, username, email FROM users WHERE id = ?';

  req.db.query(query, [id], (err, user) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch user' });
    if (user.length === 0) return res.status(404).json({ error: 'User not found' });

    res.json(user[0]);  // Mengembalikan data pengguna pertama (karena query mengembalikan array)
  });
});

// Update user
router.put('/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { username, email, password } = req.body;

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return res.status(500).json({ error: 'Error hashing password' });

    const query = 'UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?';
    req.db.query(query, [username, email, hashedPassword, id], (err, result) => {
      if (err) return res.status(500).json({ error: 'Failed to update user' });
      res.json({ message: 'User updated' });
    });
  });
});

// Delete user
router.delete('/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM users WHERE id = ?';

  req.db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to delete user' });
    res.json({ message: 'User deleted' });
  });
});

module.exports = router;

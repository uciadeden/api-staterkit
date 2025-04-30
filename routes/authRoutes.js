const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();

// Register user
router.post('/register', (req, res) => {
  const { username, email, password, role = 'user'} = req.body;

  // Validasi input
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }

  // Validasi format email menggunakan regular expression
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Validasi panjang password (misalnya minimal 6 karakter)
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  // Hash password
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return res.status(500).json({ error: 'Error hashing password' });

    // Simpan user ke database
    const query = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';
    req.db.query(query, [username, email, hashedPassword, role], (err, results) => {
    console.error('Error registering user:', err);  // Log error untuk debugging
      if (err) return res.status(400).json({ error: 'Error registering user' });
      res.status(201).json({ message: 'User created successfully', user: { id: results.insertId, username, email } });
    });
  });
});

// Login user
router.post('/login', (req, res) => { 
  const { email, password } = req.body;

  // Validasi input
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Query untuk mencari user berdasarkan email
  const query = 'SELECT * FROM users WHERE email = ?';
  req.db.query(query, [email], (err, results) => {
    if (err) {
      // Handle error jika ada masalah dengan query database
      return res.status(500).json({ error: 'Database query error' });
    }

    // Cek apakah user ditemukan
    if (results.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const dbUser = results[0];

    // Cek apakah password yang dimasukkan cocok dengan yang ada di database
    bcrypt.compare(password, dbUser.password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ error: 'Password comparison error' });
      }

      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid email or password' });
      }

      // Membuat token JWT dengan menambahkan role ke payload
      const token = jwt.sign(
        { 
          userId: dbUser.id, 
          username: dbUser.username, 
          email: dbUser.email, 
          role: dbUser.role  // Pastikan role ada di database
        },
        process.env.JWT_SECRET, 
        { expiresIn: '1d' }  // Token berlaku selama 1 hari
      );

      // Mengirimkan token ke client
      res.json({ token });
    });
  });
});

module.exports = router;

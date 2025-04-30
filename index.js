const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const authMiddleware = require('./middleware/authMiddleware');

dotenv.config();

const app = express();

// Middleware untuk parsing JSON body
app.use(express.json());  // Pastikan middleware ini terpasang

// Setup database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL database');
});

// Middleware untuk passing db ke request
app.use((req, res, next) => {
  req.db = db;
  next();
});

const checkRole = (role) => {
  return (req, res, next) => {
    const userRole = req.user.role; // role yang didapat dari JWT atau session
    
    if (userRole !== role) {
      return res.status(403).json({ error: 'Forbidden: Insufficient role' });
    }

    next(); // Jika role cocok, lanjutkan ke endpoint berikutnya
  };
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

const adminRoutes = require('./routes/adminRoutes'); // Ganti dengan path yang sesuai

// Pasang rute admin
app.use('/api', adminRoutes); // Semua route di adminRoutes.js akan diawali dengan '/api'


// Start server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


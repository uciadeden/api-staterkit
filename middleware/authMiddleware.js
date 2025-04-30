const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(403).json({ error: 'No token provided' });
  }

  try {
    // Verifikasi token dan ambil payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Menyimpan informasi user di req.user
    req.user = decoded;  // Pastikan 'decoded' berisi informasi yang benar (seperti role, userId)
    
    // Lanjutkan ke middleware berikutnya
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authMiddleware;

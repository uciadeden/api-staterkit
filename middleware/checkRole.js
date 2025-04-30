const checkRole = (role) => {
  return (req, res, next) => {
    const userRole = req.user.role; // role yang didapat dari JWT atau session
    
    if (userRole !== role) {
      return res.status(403).json({ error: 'Forbidden: Insufficient role' });
    }

    next(); // Jika role cocok, lanjutkan ke endpoint berikutnya
  };
};

module.exports = checkRole;
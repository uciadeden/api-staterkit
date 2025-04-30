const bcrypt = require('bcryptjs');

class User {
  constructor(db) {
    this.db = db;
  }

  // Registrasi user baru
  register(username, email, password, callback) {
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) return callback(err);
      
      const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
      this.db.query(query, [username, email, hashedPassword], (err, results) => {
        if (err) return callback(err);
        callback(null, { id: results.insertId, username, email });
      });
    });
  }

  // Validasi password
  static comparePassword(inputPassword, hashedPassword, callback) {
    bcrypt.compare(inputPassword, hashedPassword, (err, isMatch) => {
      if (err) return callback(err);
      callback(null, isMatch);
    });
  }

  // Menemukan user berdasarkan email
  findByEmail(email, callback) {
    const query = 'SELECT * FROM users WHERE email = ?';
    this.db.query(query, [email], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0]);
    });
  }
}

module.exports = User;

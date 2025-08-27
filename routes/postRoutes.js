const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const bcrypt = require('bcrypt');
const checkRole = require('../middleware/checkRole'); // Pastikan kamu sudah membuat file middleware checkRole


// Get all posts
router.get('/', authMiddleware, checkRole("admin"),(req, res) => {
  const page = parseInt(req.query.page) || 1; // default page = 1
  const limit = parseInt(req.query.limit) || 10; // default limit = 10
  // Hitung offset
  const offset = (page - 1) * limit;
  
  // Query untuk mengambil data dengan limit dan offset
  const query = 'SELECT id, name, description FROM posts WHERE deleted=0 LIMIT ? OFFSET ?';

  req.db.query(query, [limit, offset], (err, posts) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch posts' });
    
    // Hitung total jumlah post untuk menentukan jumlah halaman
    const countQuery = 'SELECT COUNT(*) AS total FROM posts WHERE deleted=0';
    req.db.query(countQuery, (err, countResult) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch post count' });

      const totalPosts = countResult[0].total;
      const totalPages = Math.ceil(totalPosts / limit); // Total halaman

      res.json({
        data: posts,
        pagination: {
          totalPosts,
          totalPages,
          currentPage: page,
          perPage: limit,
        },
      });
    });
  });
});

// Get post by ID
router.get('/:id', authMiddleware, (req, res) => {
  const { id } = req.params;  // Mengambil ID dari parameter URL
  const query = 'SELECT id, name, description FROM posts WHERE id = ? AND deleted=0';

  req.db.query(query, [id], (err, post) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch post' });
    if (post.length === 0) return res.status(404).json({ error: 'Post not found' });

    res.json(post[0]);  // Mengembalikan data post pertama (karena query mengembalikan array)
  });
});

// Create a new post (Insert)
router.post('/', authMiddleware, (req, res) => {
  const { name, description } = req.body;

  // Validasi input
  if (!name || !description) {
    return res.status(400).json({ error: 'Name and description are required' });
  }

  // Query untuk memasukkan data ke tabel 'posts'
  const query = 'INSERT INTO posts (name, description) VALUES (?, ?)';

  req.db.query(query, [name, description], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to create post' });
    }

    // Mengirimkan response dengan ID dari post yang baru dibuat
    res.status(201).json({ 
      message: 'Post created successfully', 
      postId: result.insertId 
    });
  });
});

// Update post
router.put('/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  const query = 'UPDATE posts SET name = ?, description = ? WHERE id = ? AND deleted=0';
  req.db.query(query, [name, description, id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to update post' });
    res.json({ message: 'Post updated' });
  });
});

// Delete post
router.delete('/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const query = 'UPDATE posts SET deleted=1 WHERE id = ?';

  req.db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to delete post' });
    res.json({ message: 'Post deleted' });
  });
});

module.exports = router;

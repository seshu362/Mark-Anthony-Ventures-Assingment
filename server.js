const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const { body, validationResult } = require("express-validator");

const app = express();
app.use(express.json());
app.use(cors());

// Connect to SQLite database
const db = new sqlite3.Database("blog.db", (err) => {
  if (err) console.error("Error connecting to database", err);
});

// Create tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT,
    userId INTEGER NOT NULL,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    postId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (postId) REFERENCES posts(id),
    FOREIGN KEY (userId) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    postId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    FOREIGN KEY (postId) REFERENCES posts(id),
    FOREIGN KEY (userId) REFERENCES users(id)
  )`);
});

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, "your_jwt_secret_key", { expiresIn: "1h" });
};

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

  jwt.verify(token, "your_jwt_secret_key", (err, decoded) => {
    if (err) return res.status(400).json({ error: "Invalid token." });
    req.userId = decoded.id;
    next();
  });
};

// User Signup with Validation
app.post(
  "/signup",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Invalid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
      [name, email, hashedPassword],
      function (err) {
        if (err) return res.status(400).json({ error: "Email already exists" });
        res.status(201).json({ id: this.lastID, name, email });
      }
    );
  }
);

// User Login with Validation
app.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
      if (err || !user) return res.status(404).json({ error: "User not found" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

      const token = generateToken(user.id);
      res.json({ token });
    });
  }
);

// Create a Post with Validation
app.post(
  "/posts",
  authenticateToken,
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("content").notEmpty().withMessage("Content is required"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { title, content, tags } = req.body;

    db.run(
      `INSERT INTO posts (title, content, tags, userId) VALUES (?, ?, ?, ?)`,
      [title, content, tags, req.userId],
      function (err) {
        if (err) return res.status(500).json({ error: "Failed to create post" });
        res.status(201).json({ id: this.lastID, title, content, tags, userId: req.userId });
      }
    );
  }
);

// Get All Posts with Pagination and Search/Filter
app.get("/posts", (req, res) => {
  const { page = 1, limit = 10, search, tag } = req.query;
  const offset = (page - 1) * limit;

  let query = `SELECT * FROM posts`;
  let conditions = [];
  let params = [];

  if (search) {
    conditions.push(`title LIKE ?`);
    params.push(`%${search}%`);
  }

  if (tag) {
    conditions.push(`tags LIKE ?`);
    params.push(`%${tag}%`);
  }

  if (conditions.length > 0) {
    query += ` WHERE ` + conditions.join(" AND ");
  }

  query += ` LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  db.all(query, params, (err, posts) => {
    if (err) return res.status(500).json({ error: "Failed to fetch posts" });
    res.json(posts);
  });
});

// Get a Single Post
app.get("/posts/:id", (req, res) => {
  const { id } = req.params;

  db.get(`SELECT * FROM posts WHERE id = ?`, [id], (err, post) => {
    if (err || !post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  });
});

// Update a Post
app.put("/posts/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, content, tags } = req.body;

  db.run(
    `UPDATE posts SET title = ?, content = ?, tags = ? WHERE id = ? AND userId = ?`,
    [title, content, tags, id, req.userId],
    function (err) {
      if (err) return res.status(500).json({ error: "Failed to update post" });
      if (this.changes === 0) return res.status(404).json({ error: "Post not found or unauthorized" });
      res.json({ message: "Post updated successfully" });
    }
  );
});

// Delete a Post
app.delete("/posts/:id", authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM posts WHERE id = ? AND userId = ?`, [id, req.userId], function (err) {
    if (err) return res.status(500).json({ error: "Failed to delete post" });
    if (this.changes === 0) return res.status(404).json({ error: "Post not found or unauthorized" });
    res.json({ message: "Post deleted successfully" });
  });
});

// Add a Comment
app.post("/comments", authenticateToken, (req, res) => {
  const { postId, content } = req.body;
  if (!postId || !content) return res.status(400).json({ error: "Post ID and content are required" });

  db.run(
    `INSERT INTO comments (postId, userId, content) VALUES (?, ?, ?)`,
    [postId, req.userId, content],
    function (err) {
      if (err) return res.status(500).json({ error: "Failed to add comment" });
      res.status(201).json({ id: this.lastID, postId, userId: req.userId, content });
    }
  );
});

// Get Comments for a Post
app.get("/posts/:id/comments", (req, res) => {
  const { id } = req.params;

  db.all(`SELECT * FROM comments WHERE postId = ?`, [id], (err, comments) => {
    if (err) return res.status(500).json({ error: "Failed to fetch comments" });
    res.json(comments);
  });
});

// Like a Post
app.post("/likes", authenticateToken, (req, res) => {
  const { postId } = req.body;
  if (!postId) return res.status(400).json({ error: "Post ID is required" });

  db.run(
    `INSERT INTO likes (postId, userId) VALUES (?, ?)`,
    [postId, req.userId],
    function (err) {
      if (err) return res.status(500).json({ error: "Failed to like post" });
      res.status(201).json({ id: this.lastID, postId, userId: req.userId });
    }
  );
});

// Get Likes for a Post
app.get("/posts/:id/likes", (req, res) => {
  const { id } = req.params;

  db.all(`SELECT * FROM likes WHERE postId = ?`, [id], (err, likes) => {
    if (err) return res.status(500).json({ error: "Failed to fetch likes" });
    res.json(likes);
  });
});

// Start server
app.listen(5000, () => console.log("Server running on port 5000"));
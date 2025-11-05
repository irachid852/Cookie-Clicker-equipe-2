// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'your_very_strong_secret_key_change_in_prod'; // 🔒 Change in production

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize SQLite database
const db = new sqlite3.Database('./cookieclicker.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL
      )
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS game_state (
        user_id INTEGER PRIMARY KEY,
        cookies REAL DEFAULT 0,
        farms INTEGER DEFAULT 0,
        factories INTEGER DEFAULT 0,
        boosters INTEGER DEFAULT 0,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
  }
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// Register
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(
      `INSERT INTO users (username, password_hash) VALUES (?, ?)`,
      [username, hashedPassword],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ error: 'Username already taken' });
          }
          return res.status(500).json({ error: 'Registration failed' });
        }
        db.run(`INSERT INTO game_state (user_id) VALUES (?)`, [this.lastID]);
        res.status(201).json({ message: 'User registered successfully' });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  db.get(`SELECT id, password_hash FROM users WHERE username = ?`, [username], async (err, user) => {
    if (err || !user) return res.status(401).json({ error: 'Invalid credentials' });
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, username });
  });
});

// Save
app.post('/api/save', authenticateToken, (req, res) => {
  const { cookies, farms, factories, boosters } = req.body;
  const userId = req.user.id;
  if (typeof cookies !== 'number' || typeof farms !== 'number' || typeof factories !== 'number' || typeof boosters !== 'number') {
    return res.status(400).json({ error: 'Invalid game state' });
  }
  const query = `
    INSERT INTO game_state (user_id, cookies, farms, factories, boosters)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      cookies = excluded.cookies,
      farms = excluded.farms,
      factories = excluded.factories,
      boosters = excluded.boosters
  `;
  db.run(query, [userId, cookies, farms, factories, boosters], function (err) {
    if (err) return res.status(500).json({ error: 'Save failed' });
    res.json({ success: true });
  });
});

// Load
app.get('/api/load', authenticateToken, (req, res) => {
  const userId = req.user.id;
  db.get(`SELECT cookies, farms, factories, boosters FROM game_state WHERE user_id = ?`, [userId], (err, row) => {
    if (err) return res.status(500).json({ error: 'Load failed' });
    res.json(row || { cookies: 0, farms: 0, factories: 0, boosters: 0 });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
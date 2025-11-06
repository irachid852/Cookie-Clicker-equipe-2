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
        cookiesEarned REAL DEFAULT 0,
        cursors INTEGER DEFAULT 0,
        grandmas INTEGER DEFAULT 0,
        farms INTEGER DEFAULT 0,
        mines INTEGER DEFAULT 0,
        factories INTEGER DEFAULT 0,
        ships INTEGER DEFAULT 0,
        alchemyLabs INTEGER DEFAULT 0,
        cursorBoost INTEGER DEFAULT 0,
        grandmaBoost INTEGER DEFAULT 0,
        farmBoost INTEGER DEFAULT 0,
        mineBoost INTEGER DEFAULT 0,
        factoryBoost INTEGER DEFAULT 0,
        shipBoost INTEGER DEFAULT 0,
        alchemyBoost INTEGER DEFAULT 0,
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
        // Créer un état de jeu vide pour le nouvel utilisateur
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
  const {
    cookies,
    cookiesEarned,
    cursors,
    grandmas,
    farms,
    mines,
    factories,
    ships,
    alchemyLabs,
    cursorBoost,
    grandmaBoost,
    farmBoost,
    mineBoost,
    factoryBoost,
    shipBoost,
    alchemyBoost
  } = req.body;

  const userId = req.user.id;

  // Validation basique
  const isValid = (
    typeof cookies === 'number' &&
    typeof cookiesEarned === 'number' && 
    Number.isInteger(cursors) && cursors >= 0 &&
    Number.isInteger(grandmas) && grandmas >= 0 &&
    Number.isInteger(farms) && farms >= 0 &&
    Number.isInteger(mines) && mines >= 0 &&
    Number.isInteger(factories) && factories >= 0 &&
    Number.isInteger(ships) && ships >= 0 &&
    Number.isInteger(alchemyLabs) && alchemyLabs >= 0 &&
    Number.isInteger(cursorBoost) && cursorBoost >= 0 && cursorBoost <= 4 &&
    Number.isInteger(grandmaBoost) && grandmaBoost >= 0 && grandmaBoost <= 4 &&
    Number.isInteger(farmBoost) && farmBoost >= 0 && farmBoost <= 4 &&
    Number.isInteger(mineBoost) && mineBoost >= 0 && mineBoost <= 4 &&
    Number.isInteger(factoryBoost) && factoryBoost >= 0 && factoryBoost <= 4 &&
    Number.isInteger(shipBoost) && shipBoost >= 0 && shipBoost <= 4 &&
    Number.isInteger(alchemyBoost) && alchemyBoost >= 0 && alchemyBoost <= 4
  );

  if (!isValid) {
    return res.status(400).json({ error: 'Invalid game state data' });
  }

  const query = `
    INSERT INTO game_state (
      user_id,
      cookies,
      cookiesEarned,
      cursors,
      grandmas,
      farms,
      mines,
      factories,
      ships,
      alchemyLabs,
      cursorBoost,
      grandmaBoost,
      farmBoost,
      mineBoost,
      factoryBoost,
      shipBoost,
      alchemyBoost
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      cookies = excluded.cookies,
      cookiesEarned = excluded.cookiesEarned,
      cursors = excluded.cursors,
      grandmas = excluded.grandmas,
      farms = excluded.farms,
      mines = excluded.mines,
      factories = excluded.factories,
      ships = excluded.ships,
      alchemyLabs = excluded.alchemyLabs,
      cursorBoost = excluded.cursorBoost,
      grandmaBoost = excluded.grandmaBoost,
      farmBoost = excluded.farmBoost,
      mineBoost = excluded.mineBoost,
      factoryBoost = excluded.factoryBoost,
      shipBoost = excluded.shipBoost,
      alchemyBoost = excluded.alchemyBoost
  `;

  db.run(query, [
    userId,
    cookies,
    cookiesEarned,
    cursors,
    grandmas,
    farms,
    mines,
    factories,
    ships,
    alchemyLabs,
    cursorBoost,
    grandmaBoost,
    farmBoost,
    mineBoost,
    factoryBoost,
    shipBoost,
    alchemyBoost
  ], function (err) {
    if (err) {
      console.error('Save error:', err);
      return res.status(500).json({ error: 'Save failed' });
    }
    res.json({ success: true });
  });
});

// Load
app.get('/api/load', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const query = `
    SELECT
      cookies,
      cookiesEarned,
      cursors,
      grandmas,
      farms,
      mines,
      factories,
      ships,
      alchemyLabs,
      cursorBoost,
      grandmaBoost,
      farmBoost,
      mineBoost,
      factoryBoost,
      shipBoost,
      alchemyBoost
    FROM game_state
    WHERE user_id = ?
  `;
  db.get(query, [userId], (err, row) => {
    if (err) {
      console.error('Load error:', err);
      return res.status(500).json({ error: 'Load failed' });
    }
    if (!row) {
      // Retourner un état par défaut si aucune sauvegarde
      return res.json({
        cookies: 0,
        cookiesEarned: 0,
        cursors: 0,
        grandmas: 0,
        farms: 0,
        mines: 0,
        factories: 0,
        ships: 0,
        alchemyLabs: 0,
        cursorBoost: 0,
        grandmaBoost: 0,
        farmBoost: 0,
        mineBoost: 0,
        factoryBoost: 0,
        shipBoost: 0,
        alchemyBoost: 0
      });
    }
    res.json(row);
  });
});

// Leaderboard: top 3 players by cookies (public)
app.get('/api/leaderboard', (req, res) => {
  const query = `
    SELECT 
      u.username AS username, 
      gs.cookiesEarned AS totalCookies
    FROM game_state gs
    JOIN users u ON gs.user_id = u.id
    WHERE gs.cookiesEarned > 0
    ORDER BY gs.cookiesEarned DESC
    LIMIT 3
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Leaderboard error:', err);
      return res.status(500).json({ error: 'Failed to retrieve leaderboard' });
    }
    const result = (rows || []).map(r => ({
      username: r.username || '—',
      totalCookies: typeof r.totalCookies === 'number' ? r.totalCookies : (r.totalCookies ? Number(r.totalCookies) : 0)
    }));
    res.json(result);
  });
});


app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

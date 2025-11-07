// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'your_very_strong_secret_key_change_in_prod'; // À modifier en production

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connexion à la base SQLite
const db = new sqlite3.Database('./cookieclicker.db', (err) => {
  if (err) {
    console.error('Échec de la connexion à la base :', err.message);
  } else {
    console.log('Connecté à la base SQLite.');

    // Création des tables si elles n’existent pas
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
        total_cookies REAL DEFAULT 0,  -- cumul de tous les cookies gagnés (classement)
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

// Middleware d’authentification JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"
  if (!token) return res.status(401).json({ error: 'Jeton d’accès requis' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Jeton invalide ou expiré' });
    req.user = user;
    next();
  });
}

// ─── API ───────────────────────────────────────────────

// Inscription
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Nom d’utilisateur et mot de passe requis' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Le mot de passe doit contenir ≥6 caractères' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(
      `INSERT INTO users (username, password_hash) VALUES (?, ?)`,
      [username, hashedPassword],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ error: 'Ce nom d’utilisateur est déjà pris' });
          }
          return res.status(500).json({ error: 'Échec de l’inscription' });
        }
        // Création de l’état de jeu vide (total_cookies = 0 par défaut)
        db.run(`INSERT INTO game_state (user_id) VALUES (?)`, [this.lastID]);
        res.status(201).json({ message: 'Inscription réussie' });
      }
    );
  } catch (err) {
    console.error('Erreur serveur (register) :', err);
    res.status(500).json({ error: 'Erreur interne' });
  }
});

// Connexion
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Nom d’utilisateur et mot de passe requis' });
  }

  db.get(`SELECT id, password_hash FROM users WHERE username = ?`, [username], async (err, user) => {
    if (err || !user) return res.status(401).json({ error: 'Identifiants invalides' });

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return res.status(401).json({ error: 'Identifiants invalides' });

    const token = jwt.sign({ id: user.id, username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, username });
  });
});

// Sauvegarde de l’état de jeu (authentifiée)
app.post('/api/save', authenticateToken, (req, res) => {
  const {
    cookies,
    total_cookies,
    cursors, grandmas, farms, mines, factories, ships, alchemyLabs,
    cursorBoost, grandmaBoost, farmBoost, mineBoost,
    factoryBoost, shipBoost, alchemyBoost
  } = req.body;

  const userId = req.user.id;

  // Validation basique des données
  const isValid = (
    typeof cookies === 'number' && cookies >= 0 &&
    typeof total_cookies === 'number' && total_cookies >= cookies && // cohérence logique
    [cursors, grandmas, farms, mines, factories, ships, alchemyLabs].every(n => Number.isInteger(n) && n >= 0) &&
    [cursorBoost, grandmaBoost, farmBoost, mineBoost, factoryBoost, shipBoost, alchemyBoost]
      .every(n => Number.isInteger(n) && n >= 0 && n <= 4)
  );

  if (!isValid) {
    return res.status(400).json({ error: 'Données de sauvegarde invalides' });
  }

  // Insertion ou mise à jour (UPSERT)
  const query = `
    INSERT INTO game_state (
      user_id, cookies, total_cookies,
      cursors, grandmas, farms, mines, factories, ships, alchemyLabs,
      cursorBoost, grandmaBoost, farmBoost, mineBoost,
      factoryBoost, shipBoost, alchemyBoost
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      cookies = excluded.cookies,
      total_cookies = excluded.total_cookies,
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
    userId, cookies, total_cookies,
    cursors, grandmas, farms, mines, factories, ships, alchemyLabs,
    cursorBoost, grandmaBoost, farmBoost, mineBoost,
    factoryBoost, shipBoost, alchemyBoost
  ], function (err) {
    if (err) {
      console.error('Erreur sauvegarde :', err);
      return res.status(500).json({ error: 'Échec de la sauvegarde' });
    }
    res.json({ success: true });
  });
});

// Chargement de l’état de jeu (authentifié)
app.get('/api/load', authenticateToken, (req, res) => {
  const userId = req.user.id;

  const query = `
    SELECT
      cookies, total_cookies,
      cursors, grandmas, farms, mines, factories, ships, alchemyLabs,
      cursorBoost, grandmaBoost, farmBoost, mineBoost,
      factoryBoost, shipBoost, alchemyBoost
    FROM game_state
    WHERE user_id = ?
  `;

  db.get(query, [userId], (err, row) => {
    if (err) {
      console.error('Erreur chargement :', err);
      return res.status(500).json({ error: 'Échec du chargement' });
    }
    if (!row) {
      // Nouvel utilisateur sans état → réponse par défaut
      return res.json({
        cookies: 0,
        total_cookies: 0,
        cursors: 0, grandmas: 0, farms: 0, mines: 0,
        factories: 0, ships: 0, alchemyLabs: 0,
        cursorBoost: 0, grandmaBoost: 0, farmBoost: 0,
        mineBoost: 0, factoryBoost: 0, shipBoost: 0, alchemyBoost: 0
      });
    }
    res.json(row);
  });
});

// Classement public (top 3 par total_cookies)
app.get('/api/leaderboard', (req, res) => {
  const query = `
    SELECT u.username, gs.total_cookies AS cookies
    FROM game_state gs
    JOIN users u ON gs.user_id = u.id
    ORDER BY gs.total_cookies DESC
    LIMIT 3
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Erreur classement :', err);
      return res.status(500).json({ error: 'Échec du chargement du classement' });
    }
    res.json(rows.map(r => ({
      username: r.username || '—',
      cookies: typeof r.cookies === 'number' ? r.cookies : 0
    })));
  });
});

// ─── Démarrage ──────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});

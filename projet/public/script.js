// Attente du chargement complet du DOM
document.addEventListener('DOMContentLoaded', () => {
  let authToken = null;

  // État du jeu
  let cookies = 0;
  let totalCookies = 0; // Cumul de tous les cookies gagnés (pour le classement)
  let cursors = 0;
  let grandmas = 0;
  let farms = 0;
  let mines = 0;
  let factories = 0;
  let ships = 0;
  let alchemyLabs = 0;

  // Niveaux des boosters (0 à 4 max)
  let cursorBoost = 0;
  let grandmaBoost = 0;
  let farmBoost = 0;
  let mineBoost = 0;
  let factoryBoost = 0;
  let shipBoost = 0;
  let alchemyBoost = 0;

  // Coûts de base
  const baseCursorCost = 15;
  const baseGrandmaCost = 100;
  const baseFarmCost = 500;
  const baseMineCost = 2000;
  const baseFactoryCost = 10000;
  const baseShipCost = 50000;
  const baseAlchemyLabCost = 250000;

  const baseCursorBoostCost = 500;
  const baseGrandmaBoostCost = 2000;
  const baseFarmBoostCost = 10000;
  const baseMineBoostCost = 50000;
  const baseFactoryBoostCost = 200000;
  const baseShipBoostCost = 1000000;
  const baseAlchemyBoostCost = 5000000;

  const audio = document.getElementById('click-sound');
  let soundEnabled = true;

  const cookieCounter = document.getElementById('cookie-counter');
  const cpsDisplay = document.getElementById('cps');
  const cookieElement = document.getElementById('cookie');
  cookieElement.draggable = false;
  const volumeSlider = document.getElementById('volume');

// Formatage pour les quantités discrètes (ex: cookies) — <1000 → entier
function formatNombreInt(num) {
  if (typeof num !== 'number' || !isFinite(num)) return '∞';
  if (num === 0) return '0';

  const sign = num < 0 ? '-' : '';
  num = Math.abs(num);

  const scales = [
    { limit: 1e63, suffix: 'Vg' },
    { limit: 1e60, suffix: 'N'  },
    { limit: 1e57, suffix: 'O'  },
    { limit: 1e54, suffix: 'Sp' },
    { limit: 1e51, suffix: 'Sx' },
    { limit: 1e48, suffix: 'Qd' },
    { limit: 1e45, suffix: 'Qa' },
    { limit: 1e42, suffix: 'T'  },
    { limit: 1e39, suffix: 'D'  },
    { limit: 1e36, suffix: 'U'  },
    { limit: 1e33, suffix: 'Dc' },
    { limit: 1e30, suffix: 'N'  },
    { limit: 1e27, suffix: 'O'  },
    { limit: 1e24, suffix: 'Sp' },
    { limit: 1e21, suffix: 'Sx' },
    { limit: 1e18, suffix: 'Qi' },
    { limit: 1e15, suffix: 'Qa' },
    { limit: 1e12, suffix: 'T'  },
    { limit: 1e9,  suffix: 'B'  },
    { limit: 1e6,  suffix: 'M'  },
    { limit: 1e3,  suffix: 'k'  },
  ];

  if (num < 1000) {
    // 👉 **Toujours entier ici**
    return sign + Math.floor(num).toString();
  }

  for (const { limit, suffix } of scales) {
    if (num >= limit) {
      const value = num / limit;
      let str = value.toFixed(2).replace(/\.?0+$/, '');
      return sign + str + suffix;
    }
  }
  return sign + Math.floor(num).toString(); // fallback
}

// Formatage pour les débits (ex: CPS) — <1000 → décimal autorisé (1 chiffre après la virgule si <10, 2 si <100, etc.)
function formatNombreFloat(num) {
  if (typeof num !== 'number' || !isFinite(num)) return '∞';
  if (num === 0) return '0';

  const sign = num < 0 ? '-' : '';
  num = Math.abs(num);

  const scales = [
    { limit: 1e63, suffix: 'Vg' },
    { limit: 1e60, suffix: 'N'  },
    { limit: 1e57, suffix: 'O'  },
    { limit: 1e54, suffix: 'Sp' },
    { limit: 1e51, suffix: 'Sx' },
    { limit: 1e48, suffix: 'Qd' },
    { limit: 1e45, suffix: 'Qa' },
    { limit: 1e42, suffix: 'T'  },
    { limit: 1e39, suffix: 'D'  },
    { limit: 1e36, suffix: 'U'  },
    { limit: 1e33, suffix: 'Dc' },
    { limit: 1e30, suffix: 'N'  },
    { limit: 1e27, suffix: 'O'  },
    { limit: 1e24, suffix: 'Sp' },
    { limit: 1e21, suffix: 'Sx' },
    { limit: 1e18, suffix: 'Qi' },
    { limit: 1e15, suffix: 'Qa' },
    { limit: 1e12, suffix: 'T'  },
    { limit: 1e9,  suffix: 'B'  },
    { limit: 1e6,  suffix: 'M'  },
    { limit: 1e3,  suffix: 'k'  },
  ];

  if (num < 1) {
    // Ex: 0.12 → affiche 0.12 (2 décimales max)
    let str = num.toFixed(2).replace(/0+$/, '');
    if (str[str.length - 1] === '.') str = str.slice(0, -1); // évite "0."
    return sign + str;
  } else if (num < 10) {
    // Ex: 2.345 → 2.34
    return sign + num.toFixed(2).replace(/\.?0+$/, '');
  } else if (num < 100) {
    // Ex: 12.345 → 12.3
    return sign + num.toFixed(1).replace(/\.?0+$/, '');
  } else if (num < 1000) {
    // Ex: 123.45 → 123
    return sign + Math.floor(num).toString(); // ou num.toFixed(0) si tu préfères garder .0 éventuel (mais on évite ici)
  }

  for (const { limit, suffix } of scales) {
    if (num >= limit) {
      const value = num / limit;
      let str = value.toFixed(2).replace(/\.?0+$/, '');
      return sign + str + suffix;
    }
  }

  return sign + num.toString();
}

  function showAuth(show) {
    document.getElementById('auth-screen').style.display = show ? 'flex' : 'none';
  }

  async function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const msg = document.getElementById('auth-message');
    msg.textContent = '';

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        authToken = data.token;
        await loadGameState();
        await leaderboard();
        showAuth(false);
      } else {
        msg.textContent = data.error || 'Échec de la connexion';
      }
    } catch (e) {
      msg.textContent = 'Erreur réseau';
    }
  }

  async function register() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const msg = document.getElementById('auth-message');
    msg.textContent = '';

    if (password.length < 6) {
      msg.textContent = 'Le mot de passe doit avoir ≥6 caractères';
      return;
    }

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        msg.textContent = 'Compte créé ! Connectez-vous.';
        msg.style.color = 'lightgreen';
      } else {
        msg.textContent = data.error || 'Échec de l’inscription';
        msg.style.color = 'red';
      }
    } catch (e) {
      msg.textContent = 'Erreur réseau';
    }
  }

  async function saveGameState() {
    if (!authToken) return;
    try {
      await fetch('/api/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ 
          cookies,
          total_cookies: totalCookies, // Envoi du cumul
          cursors, grandmas, farms, mines, factories, ships, alchemyLabs,
          cursorBoost, grandmaBoost, farmBoost, mineBoost,
          factoryBoost, shipBoost, alchemyBoost
        })
      });
    } catch (e) {
      console.warn('Échec de la sauvegarde:', e);
    }
  }

  async function loadGameState() {
    if (!authToken) return;
    try {
      const res = await fetch('/api/load', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (res.ok) {
        cookies = data.cookies || 0;
        totalCookies = data.total_cookies || cookies; // Par défaut : au moins les cookies actuels
        cursors = data.cursors || 0;
        grandmas = data.grandmas || 0;
        farms = data.farms || 0;
        mines = data.mines || 0;
        factories = data.factories || 0;
        ships = data.ships || 0;
        alchemyLabs = data.alchemyLabs || 0;
        cursorBoost = data.cursorBoost || 0;
        grandmaBoost = data.grandmaBoost || 0;
        farmBoost = data.farmBoost || 0;
        mineBoost = data.mineBoost || 0;
        factoryBoost = data.factoryBoost || 0;
        shipBoost = data.shipBoost || 0;
        alchemyBoost = data.alchemyBoost || 0;
        updateDisplay();
      }
    } catch (e) {
      console.warn('Échec du chargement:', e);
    }
  }

  async function leaderboard() {
    try {
      const res = await fetch('/api/leaderboard');
      if (!res.ok) return;
      const data = await res.json();
      const padData = [...data, {}, {}, {}].slice(0, 3); // Complète à 3 entrées

      document.getElementById('joueur1').textContent = padData[0].username || '—';
      document.getElementById('joueur2').textContent = padData[1].username || '—';
      document.getElementById('joueur3').textContent = padData[2].username || '—';

      document.getElementById('cookie1').textContent = padData[0].cookies ? formatNombreInt(padData[0].cookies) : '0';
      document.getElementById('cookie2').textContent = padData[1].cookies ? formatNombreInt(padData[1].cookies) : '0';
      document.getElementById('cookie3').textContent = padData[2].cookies ? formatNombreInt(padData[2].cookies) : '0';
    } catch (e) {
      console.warn('Échec du classement:', e);
    }
  }

  volumeSlider.addEventListener('input', () => {
    const vol = parseFloat(volumeSlider.value);
    audio.volume = vol;
    soundEnabled = vol > 0;
  });

  function playSound() {
    if (soundEnabled) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  }

  cookieElement.addEventListener('click', () => {
    const gain = 1 + cursors;
    cookies += gain;
    totalCookies += gain; // Mise à jour du cumul
    playSound();
    updateDisplay();
  });

  // Coût progressif des bâtiments (×1.10 à chaque achat)
  function getCost(base, owned) {
    return Math.ceil(base * Math.pow(1.10, owned));
  }

  // Coût des boosters (×10 par niveau)
  function getBoostCost(base, level) {
    if (level >= 4) return Infinity;
    return base * Math.pow(10, level);
  }

  // Production par seconde (CPS), avec boost ×2 par niveau
  function calculateCPS() {
    return (
      cursors * 0.1 * Math.pow(2, cursorBoost) +
      grandmas * 0.5 * Math.pow(2, grandmaBoost) +
      farms * 2 * Math.pow(2, farmBoost) +
      mines * 10 * Math.pow(2, mineBoost) +
      factories * 50 * Math.pow(2, factoryBoost) +
      ships * 200 * Math.pow(2, shipBoost) +
      alchemyLabs * 1000 * Math.pow(2, alchemyBoost)
    );
  }

  // === BÂTIMENTS ===
  window.buyCursor = () => {
    const cost = getCost(baseCursorCost, cursors);
    if (cookies >= cost) {
      cookies -= cost;
      cursors++;
      playSound();
      updateDisplay();
    }
  };

  window.buyGrandma = () => {
    const cost = getCost(baseGrandmaCost, grandmas);
    if (cookies >= cost) {
      cookies -= cost;
      grandmas++;
      playSound();
      updateDisplay();
    }
  };

  window.buyFarm = () => {
    const cost = getCost(baseFarmCost, farms);
    if (cookies >= cost) {
      cookies -= cost;
      farms++;
      playSound();
      updateDisplay();
    }
  };

  window.buyMine = () => {
    const cost = getCost(baseMineCost, mines);
    if (cookies >= cost) {
      cookies -= cost;
      mines++;
      playSound();
      updateDisplay();
    }
  };

  window.buyFactory = () => {
    const cost = getCost(baseFactoryCost, factories);
    if (cookies >= cost) {
      cookies -= cost;
      factories++;
      playSound();
      updateDisplay();
    }
  };

  window.buyShip = () => {
    const cost = getCost(baseShipCost, ships);
    if (cookies >= cost) {
      cookies -= cost;
      ships++;
      playSound();
      updateDisplay();
    }
  };

  window.buyAlchemyLab = () => {
    const cost = getCost(baseAlchemyLabCost, alchemyLabs);
    if (cookies >= cost) {
      cookies -= cost;
      alchemyLabs++;
      playSound();
      updateDisplay();
    }
  };

  // === BOOSTERS ===
  window.buyCursorBoost = () => {
    if (cursorBoost >= 4) return;
    const cost = getBoostCost(baseCursorBoostCost, cursorBoost);
    if (cookies >= cost) {
      cookies -= cost;
      cursorBoost++;
      playSound();
      updateDisplay();
    }
  };

  window.buyGrandmaBoost = () => {
    if (grandmaBoost >= 4) return;
    const cost = getBoostCost(baseGrandmaBoostCost, grandmaBoost);
    if (cookies >= cost) {
      cookies -= cost;
      grandmaBoost++;
      playSound();
      updateDisplay();
    }
  };

  // ... (les autres boosters suivent le même schéma — pas de commentaire redondant)

  window.buyFarmBoost = () => {
    if (farmBoost >= 4) return;
    const cost = getBoostCost(baseFarmBoostCost, farmBoost);
    if (cookies >= cost) {
      cookies -= cost;
      farmBoost++;
      playSound();
      updateDisplay();
    }
  };

  window.buyMineBoost = () => {
    if (mineBoost >= 4) return;
    const cost = getBoostCost(baseMineBoostCost, mineBoost);
    if (cookies >= cost) {
      cookies -= cost;
      mineBoost++;
      playSound();
      updateDisplay();
    }
  };

  window.buyFactoryBoost = () => {
    if (factoryBoost >= 4) return;
    const cost = getBoostCost(baseFactoryBoostCost, factoryBoost);
    if (cookies >= cost) {
      cookies -= cost;
      factoryBoost++;
      playSound();
      updateDisplay();
    }
  };

  window.buyShipBoost = () => {
    if (shipBoost >= 4) return;
    const cost = getBoostCost(baseShipBoostCost, shipBoost);
    if (cookies >= cost) {
      cookies -= cost;
      shipBoost++;
      playSound();
      updateDisplay();
    }
  };

  window.buyAlchemyBoost = () => {
    if (alchemyBoost >= 4) return;
    const cost = getBoostCost(baseAlchemyBoostCost, alchemyBoost);
    if (cookies >= cost) {
      cookies -= cost;
      alchemyBoost++;
      playSound();
      updateDisplay();
    }
  };

  // === AFFICHAGE ===
  function updateDisplay() {
    // Format entier pour les cookies
    cookieCounter.textContent = `Cookies : ${formatNombreInt(cookies)}`;

    // Format flottant pour le CPS (débit)
    const cps = calculateCPS();
    cpsDisplay.textContent = `Production : ${formatNombreFloat(cps)} cookies/sec`;
    // Coûts & titres des bâtiments
    document.getElementById('cursor-cost').textContent = formatNombreInt(getCost(baseCursorCost, cursors));
    document.getElementById('grandma-cost').textContent = formatNombreInt(getCost(baseGrandmaCost, grandmas));
    document.getElementById('farm-cost').textContent = formatNombreInt(getCost(baseFarmCost, farms));
    document.getElementById('mine-cost').textContent = formatNombreInt(getCost(baseMineCost, mines));
    document.getElementById('factory-cost').textContent = formatNombreInt(getCost(baseFactoryCost, factories));
    document.getElementById('ship-cost').textContent = formatNombreInt(getCost(baseShipCost, ships));
    document.getElementById('alchemy-cost').textContent = formatNombreInt(getCost(baseAlchemyLabCost, alchemyLabs));

    document.getElementById('cursor-title').textContent = `Curseur (${cursors})`;
    document.getElementById('grandma-title').textContent = `Grand-mère (${grandmas})`;
    document.getElementById('farm-title').textContent = `Ferme (${farms})`;
    document.getElementById('mine-title').textContent = `Mine (${mines})`;
    document.getElementById('factory-title').textContent = `Usine (${factories})`;
    document.getElementById('ship-title').textContent = `Navire (${ships})`;
    document.getElementById('alchemy-title').textContent = `Laboratoire d'Alchimie (${alchemyLabs})`;

    // Boosters : niveaux & coûts
    document.getElementById('cursor-boost-level').textContent = cursorBoost;
    document.getElementById('grandma-boost-level').textContent = grandmaBoost;
    document.getElementById('farm-boost-level').textContent = farmBoost;
    document.getElementById('mine-boost-level').textContent = mineBoost;
    document.getElementById('factory-boost-level').textContent = factoryBoost;
    document.getElementById('ship-boost-level').textContent = shipBoost;
    document.getElementById('alchemy-boost-level').textContent = alchemyBoost;

    document.getElementById('cursor-boost-cost').textContent = cursorBoost < 4 ? formatNombreInt(getBoostCost(baseCursorBoostCost, cursorBoost)) : 'Max';
    document.getElementById('grandma-boost-cost').textContent = grandmaBoost < 4 ? formatNombreInt(getBoostCost(baseGrandmaBoostCost, grandmaBoost)) : 'Max';
    // ... (idem pour les autres — pas de répétition)

    document.getElementById('farm-boost-cost').textContent = farmBoost < 4 ? formatNombreInt(getBoostCost(baseFarmBoostCost, farmBoost)) : 'Max';
    document.getElementById('mine-boost-cost').textContent = mineBoost < 4 ? formatNombreInt(getBoostCost(baseMineBoostCost, mineBoost)) : 'Max';
    document.getElementById('factory-boost-cost').textContent = factoryBoost < 4 ? formatNombreInt(getBoostCost(baseFactoryBoostCost, factoryBoost)) : 'Max';
    document.getElementById('ship-boost-cost').textContent = shipBoost < 4 ? formatNombreInt(getBoostCost(baseShipBoostCost, shipBoost)) : 'Max';
    document.getElementById('alchemy-boost-cost').textContent = alchemyBoost < 4 ? formatNombreInt(getBoostCost(baseAlchemyBoostCost, alchemyBoost)) : 'Max';

    // Désactivation des boutons si insuffisamment de cookies ou niveau max
    const buildingButtons2 = [
      { btn: document.getElementById('buy-cursor'), cost: getCost(baseCursorCost, cursors) },
      { btn: document.getElementById('buy-grandma'), cost: (getCost(baseGrandmaCost, grandmas)) },
      { btn: document.getElementById('buy-farm'), cost: (getCost(baseFarmCost, farms)) },
      { btn: document.getElementById('buy-mine'), cost: (getCost(baseMineCost, mines)) },
      { btn: document.getElementById('buy-factory'), cost: (getCost(baseFactoryCost, factories)) },
      { btn: document.getElementById('buy-ship'), cost: (getCost(baseShipCost, ships)) },
      { btn: document.getElementById('buy-alchemy'), cost: (getCost(baseAlchemyLabCost, alchemyLabs)) },
    ];

    const boostButtons2 = [
      { btn: document.getElementById('buy-cursor-boost'), cost: (getBoostCost(baseCursorBoostCost, cursorBoost)), level: cursorBoost },
      { btn: document.getElementById('buy-grandma-boost'), cost: (getBoostCost(baseGrandmaBoostCost, grandmaBoost)), level: grandmaBoost },
      { btn: document.getElementById('buy-farm-boost'), cost: (getBoostCost(baseFarmBoostCost, farmBoost)), level: farmBoost },
      { btn: document.getElementById('buy-mine-boost'), cost: (getBoostCost(baseMineBoostCost, mineBoost)), level: mineBoost },
      { btn: document.getElementById('buy-factory-boost'), cost: (getBoostCost(baseFactoryBoostCost, factoryBoost)), level: factoryBoost },
      { btn: document.getElementById('buy-ship-boost'), cost: (getBoostCost(baseShipBoostCost, shipBoost)), level: shipBoost },
      { btn: document.getElementById('buy-alchemy-boost'), cost: (getBoostCost(baseAlchemyBoostCost, alchemyBoost)), level: alchemyBoost },
    ];
    const buildingButtons = [
      { btn: document.getElementById('buy-cursor'), cost: formatNombreInt(getCost(baseCursorCost, cursors)) },
      { btn: document.getElementById('buy-grandma'), cost: formatNombreInt(getCost(baseGrandmaCost, grandmas)) },
      { btn: document.getElementById('buy-farm'), cost: formatNombreInt(getCost(baseFarmCost, farms)) },
      { btn: document.getElementById('buy-mine'), cost: formatNombreInt(getCost(baseMineCost, mines)) },
      { btn: document.getElementById('buy-factory'), cost: formatNombreInt(getCost(baseFactoryCost, factories)) },
      { btn: document.getElementById('buy-ship'), cost: formatNombreInt(getCost(baseShipCost, ships)) },
      { btn: document.getElementById('buy-alchemy'), cost: formatNombreInt(getCost(baseAlchemyLabCost, alchemyLabs)) },
    ];

    const boostButtons = [
      { btn: document.getElementById('buy-cursor-boost'), cost: formatNombreInt(getBoostCost(baseCursorBoostCost, cursorBoost)), level: cursorBoost },
      { btn: document.getElementById('buy-grandma-boost'), cost: formatNombreInt(getBoostCost(baseGrandmaBoostCost, grandmaBoost)), level: grandmaBoost },
      { btn: document.getElementById('buy-farm-boost'), cost: formatNombreInt(getBoostCost(baseFarmBoostCost, farmBoost)), level: farmBoost },
      { btn: document.getElementById('buy-mine-boost'), cost: formatNombreInt(getBoostCost(baseMineBoostCost, mineBoost)), level: mineBoost },
      { btn: document.getElementById('buy-factory-boost'), cost: formatNombreInt(getBoostCost(baseFactoryBoostCost, factoryBoost)), level: factoryBoost },
      { btn: document.getElementById('buy-ship-boost'), cost: formatNombreInt(getBoostCost(baseShipBoostCost, shipBoost)), level: shipBoost },
      { btn: document.getElementById('buy-alchemy-boost'), cost: formatNombreInt(getBoostCost(baseAlchemyBoostCost, alchemyBoost)), level: alchemyBoost },
    ];

    buildingButtons2.forEach(({ btn, cost }) => {
      if (btn) btn.disabled = cookies < cost;
    });

    boostButtons2.forEach(({ btn, cost, level }) => {
      if (btn) btn.disabled = level >= 4 || cookies < cost;
    });
  }

  // Production passive (10 fois par seconde)
  // on ajoute CPS / 10 à chaque étape pour obtenir le bon débit global
  setInterval(() => {
    const cps = calculateCPS();
    const gain = cps / 10;
    cookies += gain;
    totalCookies += gain; // Mise à jour du cumul
    updateDisplay();
  }, 100);

  // Sauvegarde manuelle
  document.getElementById('save-btn')?.addEventListener('click', () => {
    saveGameState();
    alert('Sauvegarde effectuée !');
  });

  // Sauvegarde automatique toutes les 15s
  setInterval(saveGameState, 15000);

  // Démarrage
  showAuth(true);

  // Exposition des fonctions globales (liées aux boutons HTML)
  window.login = login;
  window.register = register;
  window.buyCursor = buyCursor;
  window.buyGrandma = buyGrandma;
  window.buyFarm = buyFarm;
  window.buyMine = buyMine;
  window.buyFactory = buyFactory;
  window.buyShip = buyShip;
  window.buyAlchemyLab = buyAlchemyLab;
  window.buyCursorBoost = buyCursorBoost;
  window.buyGrandmaBoost = buyGrandmaBoost;
  window.buyFarmBoost = buyFarmBoost;
  window.buyMineBoost = buyMineBoost;
  window.buyFactoryBoost = buyFactoryBoost;
  window.buyShipBoost = buyShipBoost;
  window.buyAlchemyBoost = buyAlchemyBoost;
});

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  // Auth state
  let authToken = null;

  // Game state
  let cookies = 0;
  let cursors = 0;
  let grandmas = 0;
  let farms = 0;
  let mines = 0;
  let factories = 0;
  let ships = 0;
  let alchemyLabs = 0;

  // Boosters par bâtiment (0 à 4)
  let cursorBoost = 0;
  let grandmaBoost = 0;
  let farmBoost = 0;
  let mineBoost = 0;
  let factoryBoost = 0;
  let shipBoost = 0;
  let alchemyBoost = 0;

  // Coûts de base des bâtiments
  const baseCursorCost = 15;
  const baseGrandmaCost = 100;
  const baseFarmCost = 500;
  const baseMineCost = 2000;
  const baseFactoryCost = 10000;
  const baseShipCost = 50000;
  const baseAlchemyLabCost = 250000;

  // Coûts de base des boosters
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
  const volumeSlider = document.getElementById('volume');

  // Utilitaire : formater les grands nombres
  function formatNumber(num) {
    if (typeof num !== 'number' || !isFinite(num)) return '∞';
    if (num >= 1e15) return (num / 1e15).toFixed(2) + 'Q';
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'k';
    return Math.floor(num).toString();
  }

  // Auth UI
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
        msg.textContent = data.error || 'Login failed';
      }
    } catch (e) {
      msg.textContent = 'Connection error';
    }
  }

  async function register() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const msg = document.getElementById('auth-message');
    msg.textContent = '';

    if (password.length < 6) {
      msg.textContent = 'Password must be ≥6 characters';
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
        msg.textContent = '✅ Account created! Login now.';
        msg.style.color = 'lightgreen';
      } else {
        msg.textContent = data.error || 'Registration failed';
        msg.style.color = 'red';
      }
    } catch (e) {
      msg.textContent = 'Connection error';
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
          cookies, cursors, grandmas, farms, mines, factories, ships, alchemyLabs,
          cursorBoost, grandmaBoost, farmBoost, mineBoost,
          factoryBoost, shipBoost, alchemyBoost
        })
      });
    } catch (e) {
      console.warn('Save failed:', e);
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
      console.warn('Load failed:', e);
    }
  }

  async function leaderboard() {
    try {
      console.log("cool");
      const res = await fetch('/api/leaderboard', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (!res.ok) {
        const text = await res.text();
        console.warn('Leaderboard request failed', res.status, text);
        return;
      }
      const data = await res.json();
      console.log(data);
      console.log(data[0]["username"]);
      
      document.getElementById('joueur1').textContent = data[0]["username"]
      document.getElementById('joueur2').textContent = data[1]["username"]
      document.getElementById('joueur3').textContent = data[2]["username"]

      document.getElementById('cookie1').textContent = Math.round(data[0]["cookies"])
      document.getElementById('cookie2').textContent = Math.round(data[1]["cookies"])
      document.getElementById('cookie3').textContent = Math.round(data[2]["cookies"])      

    } catch (e) {
      console.warn('Leaderboard fetch failed:', e);
    }
  }

  // Game logic
  volumeSlider.addEventListener('input', () => {
    const vol = parseFloat(volumeSlider.value);
    audio.volume = vol;
    soundEnabled = vol > 0;
  });

  function playSound() {
    if (soundEnabled) {
      audio.currentTime = 0;
      audio.play().catch(e => console.log("Audio play failed:", e));
    }
  }

  cookieElement.addEventListener('click', () => {
    cookies += 1 + cursors;
    playSound();
    updateDisplay();
  });

  // Coût d'un bâtiment (progressif)
  function getCost(base, owned) {
    return Math.ceil(base * Math.pow(1.10, owned));
  }

  // Coût d'un booster (×10 à chaque niveau)
  function getBoostCost(base, level) {
    if (level >= 4) return Infinity;
    return base * Math.pow(10, level);
  }

  // Calcul de la production (CPS) avec boosters spécifiques
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

  // ========= BUILDINGS =========
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

  // ========= BOOSTERS PAR BÂTIMENT =========
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

  // ========= AFFICHAGE =========
  function updateDisplay() {
    cookieCounter.textContent = `Cookies : ${formatNumber(cookies)}`;
    const cps = calculateCPS();
    cpsDisplay.textContent = `Production : ${cps >= 1e6 ? (cps / 1e6).toFixed(2) + 'M' : cps.toFixed(1)} cookies/sec`;

    // Coûts des bâtiments
    document.getElementById('cursor-cost').textContent = formatNumber(getCost(baseCursorCost, cursors));
    document.getElementById('grandma-cost').textContent = formatNumber(getCost(baseGrandmaCost, grandmas));
    document.getElementById('farm-cost').textContent = formatNumber(getCost(baseFarmCost, farms));
    document.getElementById('mine-cost').textContent = formatNumber(getCost(baseMineCost, mines));
    document.getElementById('factory-cost').textContent = formatNumber(getCost(baseFactoryCost, factories));
    document.getElementById('ship-cost').textContent = formatNumber(getCost(baseShipCost, ships));
    document.getElementById('alchemy-cost').textContent = formatNumber(getCost(baseAlchemyLabCost, alchemyLabs));

    // Titres des bâtiments avec quantité
    document.getElementById('cursor-title').textContent = `Curseur (${cursors})`;
    document.getElementById('grandma-title').textContent = `Grand-mère (${grandmas})`;
    document.getElementById('farm-title').textContent = `Ferme (${farms})`;
    document.getElementById('mine-title').textContent = `Mine (${mines})`;
    document.getElementById('factory-title').textContent = `Usine (${factories})`;
    document.getElementById('ship-title').textContent = `Navire (${ships})`;
    document.getElementById('alchemy-title').textContent = `Laboratoire d'Alchimie (${alchemyLabs})`;

    // Boosters : niveaux et coûts
    document.getElementById('cursor-boost-level').textContent = cursorBoost;
    document.getElementById('grandma-boost-level').textContent = grandmaBoost;
    document.getElementById('farm-boost-level').textContent = farmBoost;
    document.getElementById('mine-boost-level').textContent = mineBoost;
    document.getElementById('factory-boost-level').textContent = factoryBoost;
    document.getElementById('ship-boost-level').textContent = shipBoost;
    document.getElementById('alchemy-boost-level').textContent = alchemyBoost;

    document.getElementById('cursor-boost-cost').textContent = 
      cursorBoost < 4 ? formatNumber(getBoostCost(baseCursorBoostCost, cursorBoost)) : 'Max';
    document.getElementById('grandma-boost-cost').textContent = 
      grandmaBoost < 4 ? formatNumber(getBoostCost(baseGrandmaBoostCost, grandmaBoost)) : 'Max';
    document.getElementById('farm-boost-cost').textContent = 
      farmBoost < 4 ? formatNumber(getBoostCost(baseFarmBoostCost, farmBoost)) : 'Max';
    document.getElementById('mine-boost-cost').textContent = 
      mineBoost < 4 ? formatNumber(getBoostCost(baseMineBoostCost, mineBoost)) : 'Max';
    document.getElementById('factory-boost-cost').textContent = 
      factoryBoost < 4 ? formatNumber(getBoostCost(baseFactoryBoostCost, factoryBoost)) : 'Max';
    document.getElementById('ship-boost-cost').textContent = 
      shipBoost < 4 ? formatNumber(getBoostCost(baseShipBoostCost, shipBoost)) : 'Max';
    document.getElementById('alchemy-boost-cost').textContent = 
      alchemyBoost < 4 ? formatNumber(getBoostCost(baseAlchemyBoostCost, alchemyBoost)) : 'Max';

    // Désactiver les boutons si insuffisant ou max
    const buildingButtons = [
      { btn: document.getElementById('buy-cursor'), cost: getCost(baseCursorCost, cursors) },
      { btn: document.getElementById('buy-grandma'), cost: getCost(baseGrandmaCost, grandmas) },
      { btn: document.getElementById('buy-farm'), cost: getCost(baseFarmCost, farms) },
      { btn: document.getElementById('buy-mine'), cost: getCost(baseMineCost, mines) },
      { btn: document.getElementById('buy-factory'), cost: getCost(baseFactoryCost, factories) },
      { btn: document.getElementById('buy-ship'), cost: getCost(baseShipCost, ships) },
      { btn: document.getElementById('buy-alchemy'), cost: getCost(baseAlchemyLabCost, alchemyLabs) },
    ];

    const boostButtons = [
      { btn: document.getElementById('buy-cursor-boost'), cost: getBoostCost(baseCursorBoostCost, cursorBoost), level: cursorBoost },
      { btn: document.getElementById('buy-grandma-boost'), cost: getBoostCost(baseGrandmaBoostCost, grandmaBoost), level: grandmaBoost },
      { btn: document.getElementById('buy-farm-boost'), cost: getBoostCost(baseFarmBoostCost, farmBoost), level: farmBoost },
      { btn: document.getElementById('buy-mine-boost'), cost: getBoostCost(baseMineBoostCost, mineBoost), level: mineBoost },
      { btn: document.getElementById('buy-factory-boost'), cost: getBoostCost(baseFactoryBoostCost, factoryBoost), level: factoryBoost },
      { btn: document.getElementById('buy-ship-boost'), cost: getBoostCost(baseShipBoostCost, shipBoost), level: shipBoost },
      { btn: document.getElementById('buy-alchemy-boost'), cost: getBoostCost(baseAlchemyBoostCost, alchemyBoost), level: alchemyBoost },
    ];

    buildingButtons.forEach(({ btn, cost }) => {
      if (btn) btn.disabled = cookies < cost;
    });

    boostButtons.forEach(({ btn, cost, level }) => {
      if (btn) btn.disabled = level >= 4 || cookies < cost;
    });
  }

  // Production passive
  setInterval(() => {
    const cps = calculateCPS();
    cookies += cps / 10;
    updateDisplay();
  }, 100);

  // Changement de titre
  document.getElementById('change-title-btn')?.addEventListener('click', () => {
    const newTitle = document.getElementById('title-input')?.value.trim();
    if (newTitle) {
      document.getElementById('game-title').textContent = newTitle;
    }
  });

  // Sauvegarde manuelle
  document.getElementById('save-btn')?.addEventListener('click', () => {
    saveGameState();
    alert('✅ Game saved!');
  });

  // Sauvegarde auto
  setInterval(saveGameState, 15000);

  // Démarrage
  showAuth(true);

  // Exposer les fonctions globales
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

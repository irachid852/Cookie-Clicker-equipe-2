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
  let multiplier2x = 0;
  let multiplier4x = 0;
  let multiplier10x = 0;

  // Base costs (much higher)
  const baseCursorCost = 15;
  const baseGrandmaCost = 100;
  const baseFarmCost = 500;
  const baseMineCost = 2000;
  const baseFactoryCost = 10000;
  const baseShipCost = 50000;
  const baseAlchemyLabCost = 250000;
  const baseMultiplier2xCost = 1000;
  const baseMultiplier4xCost = 20000;
  const baseMultiplier10xCost = 500000;

  const audio = document.getElementById('click-sound');
  let soundEnabled = true;

  const cookieCounter = document.getElementById('cookie-counter');
  const cpsDisplay = document.getElementById('cps');
  const cookieElement = document.getElementById('cookie');
  const volumeSlider = document.getElementById('volume');

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
          multiplier2x, multiplier4x, multiplier10x 
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
        multiplier2x = data.multiplier2x || 0;
        multiplier4x = data.multiplier4x || 0;
        multiplier10x = data.multiplier10x || 0;
        updateDisplay();
      }
    } catch (e) {
      console.warn('Load failed:', e);
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
    cookies += 1 + cursors; // cursor also gives +1 per click
    playSound();
    updateDisplay();
  });

  function getCost(base, owned) {
    return Math.ceil(base * Math.pow(1.25, owned)); // Steeper scaling
  }

  // ========= BUILDINGS =========
  window.buyCursor = function() {
    const cost = getCost(baseCursorCost, cursors);
    if (cookies >= cost) {
      cookies -= cost;
      cursors += 1;
      playSound();
      updateDisplay();
    }
  };

  window.buyGrandma = function() {
    const cost = getCost(baseGrandmaCost, grandmas);
    if (cookies >= cost) {
      cookies -= cost;
      grandmas += 1;
      playSound();
      updateDisplay();
    }
  };

  window.buyFarm = function() {
    const cost = getCost(baseFarmCost, farms);
    if (cookies >= cost) {
      cookies -= cost;
      farms += 1;
      playSound();
      updateDisplay();
    }
  };

  window.buyMine = function() {
    const cost = getCost(baseMineCost, mines);
    if (cookies >= cost) {
      cookies -= cost;
      mines += 1;
      playSound();
      updateDisplay();
    }
  };

  window.buyFactory = function() {
    const cost = getCost(baseFactoryCost, factories);
    if (cookies >= cost) {
      cookies -= cost;
      factories += 1;
      playSound();
      updateDisplay();
    }
  };

  window.buyShip = function() {
    const cost = getCost(baseShipCost, ships);
    if (cookies >= cost) {
      cookies -= cost;
      ships += 1;
      playSound();
      updateDisplay();
    }
  };

  window.buyAlchemyLab = function() {
    const cost = getCost(baseAlchemyLabCost, alchemyLabs);
    if (cookies >= cost) {
      cookies -= cost;
      alchemyLabs += 1;
      playSound();
      updateDisplay();
    }
  };

  // ========= BOOSTERS =========
  window.buyMultiplier2x = function() {
    const cost = getCost(baseMultiplier2xCost, multiplier2x);
    if (cookies >= cost) {
      cookies -= cost;
      multiplier2x += 1;
      playSound();
      updateDisplay();
    }
  };

  window.buyMultiplier4x = function() {
    const cost = getCost(baseMultiplier4xCost, multiplier4x);
    if (cookies >= cost) {
      cookies -= cost;
      multiplier4x += 1;
      playSound();
      updateDisplay();
    }
  };

  window.buyMultiplier10x = function() {
    const cost = getCost(baseMultiplier10xCost, multiplier10x);
    if (cookies >= cost) {
      cookies -= cost;
      multiplier10x += 1;
      playSound();
      updateDisplay();
    }
  };

  function calculateCPS() {
    const baseCPS =
      cursors * 0.1 +
      grandmas * 0.5 +
      farms * 2 +
      mines * 10 +
      factories * 50 +
      ships * 200 +
      alchemyLabs * 1000;

    let multiplier = 1;
    multiplier *= Math.pow(2, multiplier2x);
    multiplier *= Math.pow(4, multiplier4x);
    multiplier *= Math.pow(10, multiplier10x);

    return baseCPS * multiplier;
  }

  function updateDisplay() {
    cookieCounter.textContent = `Cookies : ${Math.floor(cookies)}`;
    const cps = calculateCPS();
    cpsDisplay.textContent = `Production : ${cps.toFixed(1)} cookies/sec`;

    // Update costs
    document.getElementById('cursor-cost').textContent = getCost(baseCursorCost, cursors);
    document.getElementById('grandma-cost').textContent = getCost(baseGrandmaCost, grandmas);
    document.getElementById('farm-cost').textContent = getCost(baseFarmCost, farms);
    document.getElementById('mine-cost').textContent = getCost(baseMineCost, mines);
    document.getElementById('factory-cost').textContent = getCost(baseFactoryCost, factories);
    document.getElementById('ship-cost').textContent = getCost(baseShipCost, ships);
    document.getElementById('alchemy-cost').textContent = getCost(baseAlchemyLabCost, alchemyLabs);
    document.getElementById('booster2x-cost').textContent = getCost(baseMultiplier2xCost, multiplier2x);
    document.getElementById('booster4x-cost').textContent = getCost(baseMultiplier4xCost, multiplier4x);
    document.getElementById('booster10x-cost').textContent = getCost(baseMultiplier10xCost, multiplier10x);

    // Update button states
    const buttons = [
      { btn: document.getElementById('buy-cursor'), cost: getCost(baseCursorCost, cursors) },
      { btn: document.getElementById('buy-grandma'), cost: getCost(baseGrandmaCost, grandmas) },
      { btn: document.getElementById('buy-farm'), cost: getCost(baseFarmCost, farms) },
      { btn: document.getElementById('buy-mine'), cost: getCost(baseMineCost, mines) },
      { btn: document.getElementById('buy-factory'), cost: getCost(baseFactoryCost, factories) },
      { btn: document.getElementById('buy-ship'), cost: getCost(baseShipCost, ships) },
      { btn: document.getElementById('buy-alchemy'), cost: getCost(baseAlchemyLabCost, alchemyLabs) },
      { btn: document.getElementById('buy-booster2x'), cost: getCost(baseMultiplier2xCost, multiplier2x) },
      { btn: document.getElementById('buy-booster4x'), cost: getCost(baseMultiplier4xCost, multiplier4x) },
      { btn: document.getElementById('buy-booster10x'), cost: getCost(baseMultiplier10xCost, multiplier10x) },
    ];

    buttons.forEach(({ btn, cost }) => {
      if (btn) btn.disabled = cookies < cost;
    });
  }

  // Passive production
  setInterval(() => {
    const cps = calculateCPS();
    cookies += cps / 10;
    updateDisplay();
  }, 100);

  // Title change
  document.getElementById('change-title-btn')?.addEventListener('click', () => {
    const newTitle = document.getElementById('title-input')?.value.trim();
    if (newTitle) {
      document.getElementById('game-title').textContent = newTitle;
    }
  });

  // Manual save
  document.getElementById('save-btn')?.addEventListener('click', () => {
    saveGameState();
    alert('✅ Game saved!');
  });

  // Auto-save
  setInterval(saveGameState, 15000);

  // Show login screen
  showAuth(true);

  // Expose functions to global scope
  window.login = login;
  window.register = register;
  window.buyCursor = buyCursor;
  window.buyGrandma = buyGrandma;
  window.buyFarm = buyFarm;
  window.buyMine = buyMine;
  window.buyFactory = buyFactory;
  window.buyShip = buyShip;
  window.buyAlchemyLab = buyAlchemyLab;
  window.buyMultiplier2x = buyMultiplier2x;
  window.buyMultiplier4x = buyMultiplier4x;
  window.buyMultiplier10x = buyMultiplier10x;
});

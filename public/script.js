// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  // Auth state
  let authToken = null;

  // Game state
  let cookies = 0;
  let farms = 0;
  let factories = 0;
  let boosters = 0;

  const baseFarmCost = 15;
  const baseFactoryCost = 100;
  const baseBoosterCost = 100;

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
        body: JSON.stringify({ cookies, farms, factories, boosters })
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
        farms = data.farms || 0;
        factories = data.factories || 0;
        boosters = data.boosters || 0;
        updateDisplay();
      }
    } catch (e) {
      console.warn('Load failed:', e);
    }
  }

  // Original game logic
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
    cookies += 1;
    playSound();
    updateDisplay();
  });

  function getCost(base, owned) {
    return Math.ceil(base * Math.pow(1.15, owned));
  }

  window.buyFarm = function() {
    const cost = getCost(baseFarmCost, farms);
    if (cookies >= cost) {
      cookies -= cost;
      farms += 1;
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

  window.buyBooster = function() {
    const cost = getCost(baseBoosterCost, boosters);
    if (cookies >= cost) {
      cookies -= cost;
      boosters += 1;
      playSound();
      updateDisplay();
    }
  };

  function calculateCPS() {
    const baseCPS = farms * 1 + factories * 5;
    const multiplier = Math.pow(2, boosters);
    return baseCPS * multiplier;
  }

  function updateDisplay() {
    cookieCounter.textContent = `Cookies : ${Math.floor(cookies)}`;
    const cps = calculateCPS();
    cpsDisplay.textContent = `Production : ${cps.toFixed(1)} cookies/sec`;

    document.getElementById('farm-cost').textContent = getCost(baseFarmCost, farms);
    document.getElementById('factory-cost').textContent = getCost(baseFactoryCost, factories);
    document.getElementById('booster-cost').textContent = getCost(baseBoosterCost, boosters);

    document.querySelectorAll('.upgrade-item button').forEach((btn, i) => {
      let cost;
      if (i === 0) cost = getCost(baseBoosterCost, boosters);
      else if (i === 1) cost = getCost(baseFarmCost, farms);
      else if (i === 2) cost = getCost(baseFactoryCost, factories);
      btn.disabled = cookies < cost;
    });
  }

  setInterval(() => {
    const cps = calculateCPS();
    cookies += cps / 10;
    updateDisplay();
  }, 100);

  document.getElementById('change-title-btn').addEventListener('click', () => {
    const newTitle = document.getElementById('title-input').value.trim();
    if (newTitle) {
      document.getElementById('game-title').textContent = newTitle;
    }
  });

  document.getElementById('save-btn').addEventListener('click', () => {
    saveGameState();
    alert('✅ Game saved!');
  });

  // Auto-save every 15 seconds
  setInterval(saveGameState, 15000);

  // Start with auth screen visible
  showAuth(true);

  // ✅ EXPOSE login/register TO GLOBAL SCOPE FOR onclick
  window.login = login;
  window.register = register;
});
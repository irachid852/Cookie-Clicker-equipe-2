// État du jeu
let cookies = 0;
let farms = 0;
let factories = 0;
let bank = 0;
let temple = 0;
let boosters = 0;

// Coûts de base
const baseFarmCost = 15;
const baseFactoryCost = 100;
const baseBoosterCost = 100;
const baseBankCost = 10000;
const basetempleCost = 100000;

// Audio
const audio = document.getElementById('click-sound');
let soundEnabled = true;
const cookieCounter = document.getElementById('cookie-counter');
const cpsDisplay = document.getElementById('cps');
const cookieElement = document.getElementById('cookie');
const volumeSlider = document.getElementById('volume');

// Fonction pour jouer un son
function playSound() {
  //Faire en sorte qu'on puisse mettre le son
}

//Mise à jour du volume global
volumeSlider.addEventListener('input', () => {
  const vol = parseFloat(volumeSlider.value);
  audio.volume = vol;
  soundEnabled = vol > 0;
});

// Click sur le cookie
cookieElement.addEventListener('click', () => {
  cookies += 1;
  playSound();
  updateDisplay();
});

// Calcul du coût exponentiel
function getCost_Prod(base, owned) {
  return Math.ceil(base * Math.pow(1.40, owned));
}

function getCost_Booster(base,owned) {
  return Math.ceil(base * Math.pow(5.0,owned))
}

// Acheter une ferme
function buyFarm() {
  const cost = getCost_Prod(baseFarmCost, farms);
  if (cookies >= cost) {
    cookies -= cost;
    farms += 1;
    playSound();
    updateDisplay();
  }
}

// Acheter une usine
function buyFactory() {
  const cost = getCost_Prod(baseFactoryCost, factories);
  if (cookies >= cost) {
    cookies -= cost;
    factories += 1;
    playSound();
    updateDisplay();
  }
}

// Acheter une banque
function buyBank() {
  const cost = getCost_Prod(baseBankCost, bank);
  if (cookies >= cost) {
    cookies -= cost;
    bank += 1;
    playSound();
    updateDisplay();
  }
}


// Acheter une banque
function buyBank() {
  const cost = getCost_Prod(baseBankCost, bank);
  if (cookies >= cost) {
    cookies -= cost;
    bank += 1;
    playSound();
    updateDisplay();
  }
}

// Acheter un booster
function buyBooster() {
  const cost = getCost_Booster(baseBoosterCost, boosters);
  if (cookies >= cost) {
    cookies -= cost;
    boosters += 1;
    playSound();
    updateDisplay();
  }
}

// Calcul de la production par seconde
function calculateCPS() {
  const baseCPS = farms * 1 + factories * 5 + bank * 100;
  const multiplier = Math.pow(2, boosters);
  return baseCPS * multiplier;
}

// Mise à jour de l'affichage
function updateDisplay() {
  cookieCounter.textContent = `Cookies : ${Math.floor(cookies)}`;
  const cps = calculateCPS();
  cpsDisplay.textContent = `Production : ${cps.toFixed(1)} cookies/sec`;
  //Mise à jour des coûts affichés
  document.getElementById('farm-cost').textContent = getCost_Prod(baseFarmCost, farms);
  document.getElementById('factory-cost').textContent = getCost_Prod(baseFactoryCost, factories);
  document.getElementById('booster-cost').textContent = getCost_Booster(baseBoosterCost, boosters);
  document.getElementById('bank-cost').textContent = getCost_Prod(baseBankCost, bank);
  //Visualisation de si on peut acheter les nouvelles usines ou non
  document.querySelectorAll('.upgrade-item button').forEach((btn, i) => {
    let cost;
    if (i === 0) cost = getCost(baseBoosterCost, boosters);
    else if (i === 1) cost = getCost(baseFarmCost, farms);
    else if (i === 2) cost = getCost(baseFactoryCost, factories);
    else if (i === 3) cost = getCost(baseBankCost, bank);
    btn.disabled = cookies < cost;
  });
}

//Production automatique
setInterval(() => {
  const cps = calculateCPS();
  cookies += cps / 10; // 10 fois par seconde on update
  updateDisplay();
}, 100);

// Réglages
document.getElementById('change-title-btn').addEventListener('click', () => {
  const newTitle = document.getElementById('title-input').value.trim();
  if (newTitle) {
    document.getElementById('game-title').textContent = newTitle;
  }
});

document.getElementById('save-btn').addEventListener('click', () => {
  //Il faut rajouter la fonctionnalité de sauvegarde
});

updateDisplay();

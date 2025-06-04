// Game State
let gameState = {
    bitcoin: 0,
    totalClicks: 0,
    bps: 0,
    godMode: false
};

// Upgrades Configuration
let upgrades = [
    {
        name: "CPU Miner",
        description: "Mined automatisch alle 5 Sekunden",
        baseCost: 15,
        cost: 15,
        owned: 0,
        bps: 0.2,
        type: 'autoClicker'
    },
    {
        name: "GPU Rig",
        description: "Leistungsstarkes Mining-Setup",
        baseCost: 100,
        cost: 100,
        owned: 0,
        bps: 1,
        type: 'autoClicker'
    },
    {
        name: "Mining Farm",
        description: "Industrielles Bitcoin Mining",
        baseCost: 1100,
        cost: 1100,
        owned: 0,
        bps: 8,
        type: 'autoClicker'
    },
    {
        name: "ASIC Center",
        description: "Spezialisierte Mining Hardware",
        baseCost: 12000,
        cost: 12000,
        owned: 0,
        bps: 47,
        type: 'autoClicker'
    },
    {
        name: "Mining Corporation",
        description: "Globales Mining-Imperium",
        baseCost: 130000,
        cost: 130000,
        owned: 0,
        bps: 260,
        type: 'autoClicker'
    },
    {
        name: "Click-Power",
        description: "Verdoppelt Bitcoin pro Klick",
        baseCost: 50,
        cost: 50,
        owned: 0,
        multiplier: 2,
        type: 'clickMultiplier'
    }
];

// Game Variables
let clickPower = 1;
let autoClickerIntervals = [];

// Check if bitcoin.png exists and replace the CSS bitcoin
function initializeBitcoin() {
    const bitcoinElement = document.getElementById('mainBitcoin');
    const img = new Image();
    img.onload = function() {
        // If bitcoin.png loads successfully, replace with image
        bitcoinElement.innerHTML = '';
        bitcoinElement.className = 'bitcoin-image';
        bitcoinElement.style.backgroundImage = 'url(assets/bitcoin.png)';
    };
    img.onerror = function() {
        // If bitcoin.png doesn't exist, keep the CSS version
        console.log('Bitcoin PNG not found, using CSS version');
    };
    img.src = 'assets/bitcoin.png';
}

// Display Functions
function updateDisplay() {
    document.getElementById('bitcoinCount').textContent = formatNumber(Math.floor(gameState.bitcoin)) + ' Bitcoin';
    document.getElementById('bpsDisplay').textContent = formatNumber(gameState.bps.toFixed(1)) + ' Bitcoin pro Sekunde';
    updateUpgradesDisplay();
    updateAutoClickersDisplay();
}

function formatNumber(num) {
    if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toString();
}

// Click Functions
function clickBitcoin(event) {
    let earnedBitcoin = clickPower;
    gameState.bitcoin += earnedBitcoin;
    gameState.totalClicks++;

    // Klick-Effekt anzeigen
    showClickEffect(event, '+' + earnedBitcoin);
    updateDisplay();
}

function showClickEffect(event, text) {
    const effect = document.createElement('div');
    effect.className = 'click-effect';
    effect.textContent = text;
    
    const rect = event.target.getBoundingClientRect();
    effect.style.left = (event.clientX - rect.left) + 'px';
    effect.style.top = (event.clientY - rect.top) + 'px';
    
    event.target.appendChild(effect);
    
    setTimeout(() => {
        if (effect.parentNode) {
            effect.parentNode.removeChild(effect);
        }
    }, 1000);
}

// Upgrade Functions
function updateUpgradesDisplay() {
    const upgradesList = document.getElementById('upgradesList');
    upgradesList.innerHTML = '';

    upgrades.forEach((upgrade, index) => {
        const upgradeDiv = document.createElement('div');
        upgradeDiv.className = 'upgrade' + (gameState.bitcoin < upgrade.cost ? ' disabled' : '');
        
        upgradeDiv.innerHTML = `
            <div class="upgrade-name">${upgrade.name}</div>
            <div style="font-size: 0.9em; margin: 5px 0;">${upgrade.description}</div>
            <div class="upgrade-cost">Kosten: ${formatNumber(upgrade.cost)}</div>
            ${upgrade.owned > 0 ? `<div class="upgrade-owned">${upgrade.owned}</div>` : ''}
        `;

        if (gameState.bitcoin >= upgrade.cost) {
            upgradeDiv.addEventListener('click', () => buyUpgrade(index));
        }

        upgradesList.appendChild(upgradeDiv);
    });
}

function buyUpgrade(index) {
    const upgrade = upgrades[index];
    if (gameState.bitcoin >= upgrade.cost) {
        gameState.bitcoin -= upgrade.cost;
        upgrade.owned++;

        if (upgrade.type === 'autoClicker') {
            gameState.bps += upgrade.bps;
            // Starte Auto-Clicker für dieses Upgrade
            startAutoClicker(upgrade);
        } else if (upgrade.type === 'clickMultiplier') {
            clickPower *= upgrade.multiplier;
        }

        // Erhöhe Kosten (1.15x multiplier)
        upgrade.cost = Math.ceil(upgrade.baseCost * Math.pow(1.15, upgrade.owned));

        updateDisplay();
    }
}

// Auto-Clicker Functions
function startAutoClicker(upgrade) {
    const interval = setInterval(() => {
        if (!gameState.godMode) {
            gameState.bitcoin += upgrade.bps * 5; // 5 Sekunden worth of production
        }
        updateDisplay();
    }, 5000); // Alle 5 Sekunden

    autoClickerIntervals.push(interval);
}

function updateAutoClickersDisplay() {
    const autoClickersDisplay = document.getElementById('autoClickersDisplay');
    const autoClickersList = document.getElementById('autoClickersList');
    
    const activeAutoClickers = upgrades.filter(u => u.type === 'autoClicker' && u.owned > 0);
    
    if (activeAutoClickers.length > 0) {
        autoClickersDisplay.style.display = 'block';
        autoClickersList.innerHTML = '';
        
        activeAutoClickers.forEach(upgrade => {
            const div = document.createElement('div');
            div.className = 'auto-clicker';
            div.innerHTML = `
                <div class="auto-clicker-dot"></div>
                ${upgrade.name} (${upgrade.owned}) - ${formatNumber(upgrade.bps * upgrade.owned)}/s
            `;
            autoClickersList.appendChild(div);
        });
    } else {
        autoClickersDisplay.style.display = 'none';
    }
}

// Passive Income Timer
setInterval(() => {
    if (!gameState.godMode) {
        gameState.bitcoin += gameState.bps;
    }
    updateDisplay();
}, 1000);

// Cheat Console
let cheatSequence = [];
const cheatCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];

function closeCheatConsole() {
    document.getElementById('cheatConsole').style.display = 'none';
}

function handleCheatInput(event) {
    if (event.key === 'Enter') {
        const input = event.target.value.toLowerCase().trim();
        const output = document.getElementById('cheatOutput');
        
        executeCheat(input, output);
        event.target.value = '';
    }
}

function executeCheat(command, output) {
    const parts = command.split(' ');
    const cmd = parts[0];
    const arg = parts[1];

    switch(cmd) {
        case 'bitcoin':
            const amount = parseInt(arg) || 1000;
            gameState.bitcoin += amount;
            output.textContent = `${amount} Bitcoin hinzugefügt!`;
            break;
        
        case 'reset':
            gameState.bitcoin = 0;
            gameState.bps = 0;
            gameState.totalClicks = 0;
            clickPower = 1;
            upgrades.forEach(u => {
                u.owned = 0;
                u.cost = u.baseCost;
            });
            autoClickerIntervals.forEach(clearInterval);
            autoClickerIntervals = [];
            output.textContent = 'Spiel zurückgesetzt!';
            break;
        
        case 'multiply':
            const multiplier = parseInt(arg) || 2;
            gameState.bitcoin *= multiplier;
            output.textContent = `Bitcoin mit ${multiplier} multipliziert!`;
            break;
        
        case 'maxupgrades':
            upgrades.forEach(upgrade => {
                upgrade.owned = 999999;
                if (upgrade.type === 'autoClicker') {
                    gameState.bps += upgrade.bps * 999999;
                }
            });
            output.textContent = 'Alle Upgrades maximiert!';
            break;
        
        case 'godmode':
            gameState.godMode = !gameState.godMode;
            if (gameState.godMode) {
                gameState.bitcoin = Infinity;
                output.textContent = 'God Mode aktiviert!';
            } else {
                output.textContent = 'God Mode deaktiviert!';
            }
            break;
        
        default:
            output.textContent = 'Unbekannter Befehl: ' + cmd;
    }
    
    updateDisplay();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Bitcoin (check for PNG)
    initializeBitcoin();

    // Bitcoin Click Event
    document.getElementById('mainBitcoin').addEventListener('click', clickBitcoin);

    // Cheat Code Detection
    document.addEventListener('keydown', (e) => {
        cheatSequence.push(e.code);
        if (cheatSequence.length > cheatCode.length) {
            cheatSequence.shift();
        }
        
        if (JSON.stringify(cheatSequence) === JSON.stringify(cheatCode)) {
            document.getElementById('cheatConsole').style.display = 'block';
            document.getElementById('cheatInput').focus();
            cheatSequence = [];
        }
    });

    // Initial display update
    updateDisplay();
});
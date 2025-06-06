// Game State
let gameState = {
    bitcoin: 0,
    totalClicks: 0,
    bps: 0,
    godMode: false,
    electricityCost: 0,
    reputation: 100,
    marketVolatility: 1.0,
    hackingProtection: 0,
    lastHackTime: 0
};

// Market volatility that affects Bitcoin value
let marketTimer = 0;
let currentMultiplier = 1.0;

// Upgrades Configuration - Much more expensive and slower progression
let upgrades = [
    {
        name: "Alter Laptop",
        description: "Langsamer CPU-Miner mit hohem Stromverbrauch",
        baseCost: 50,
        cost: 50,
        owned: 0,
        bps: 0.1,
        electricityCost: 0.05,
        type: 'autoClicker'
    },
    {
        name: "Gaming PC",
        description: "Bessere Performance, aber immer noch teuer",
        baseCost: 500,
        cost: 500,
        owned: 0,
        bps: 0.8,
        electricityCost: 0.3,
        type: 'autoClicker'
    },
    {
        name: "GPU Mining Rig",
        description: "Professionelles Setup mit hohen Kosten",
        baseCost: 5000,
        cost: 5000,
        owned: 0,
        bps: 4,
        electricityCost: 2,
        type: 'autoClicker'
    },
    {
        name: "ASIC Miner",
        description: "Spezialhardware - sehr teuer aber effizient",
        baseCost: 25000,
        cost: 25000,
        owned: 0,
        bps: 15,
        electricityCost: 5,
        type: 'autoClicker'
    },
    {
        name: "Mining Farm",
        description: "Industrielle Anlage mit enormen Kosten",
        baseCost: 150000,
        cost: 150000,
        owned: 0,
        bps: 80,
        electricityCost: 25,
        type: 'autoClicker'
    },
    {
        name: "Solar Panel",
        description: "Reduziert Stromkosten um 20%",
        baseCost: 1000,
        cost: 1000,
        owned: 0,
        electricityReduction: 0.2,
        type: 'efficiency'
    },
    {
        name: "Kühlsystem",
        description: "Verbessert Mining-Effizienz um 15%",
        baseCost: 2000,
        cost: 2000,
        owned: 0,
        efficiencyBoost: 0.15,
        type: 'efficiency'
    },
    {
        name: "Sicherheitssoftware",
        description: "Schutz vor Hackern und Malware",
        baseCost: 800,
        cost: 800,
        owned: 0,
        hackingProtection: 10,
        type: 'security'
    },
    {
        name: "Click-Optimierung",
        description: "Verbessert manuelles Mining (teuer!)",
        baseCost: 1500,
        cost: 1500,
        owned: 0,
        multiplier: 1.5,
        type: 'clickMultiplier'
    }
];

// Random Events
const randomEvents = [
    {
        name: "Stromausfall",
        description: "Ein Stromausfall reduziert deine Produktion für 30 Sekunden!",
        effect: () => {
            gameState.bps *= 0.1;
            setTimeout(() => {
                gameState.bps *= 10;
                showNotification("Strom ist wieder da!", "success");
            }, 30000);
        },
        probability: 0.002
    },
    {
        name: "Hacker-Angriff",
        description: "Hacker stehlen Bitcoin! Sicherheit ist wichtig.",
        effect: () => {
            const stolenAmount = Math.min(gameState.bitcoin * 0.1, gameState.bitcoin - gameState.hackingProtection * 100);
            if (stolenAmount > 0) {
                gameState.bitcoin -= stolenAmount;
                showNotification(`${formatNumber(stolenAmount)} Bitcoin gestohlen!`, "danger");
            } else {
                showNotification("Hacker-Angriff abgewehrt!", "success");
            }
        },
        probability: 0.001
    },
    {
        name: "Bitcoin Boom",
        description: "Der Bitcoin-Kurs steigt dramatisch!",
        effect: () => {
            currentMultiplier = 2.0;
            setTimeout(() => {
                currentMultiplier = 1.0;
                showNotification("Bitcoin-Boom vorbei", "info");
            }, 60000);
        },
        probability: 0.0005
    },
    {
        name: "Regulierung",
        description: "Neue Gesetze reduzieren deine Effizienz!",
        effect: () => {
            gameState.bps *= 0.8;
            showNotification("Mining durch Regulierung verlangsamt", "warning");
        },
        probability: 0.0008
    }
];

// Game Variables
let clickPower = 1;
let autoClickerIntervals = [];
let efficiencyMultiplier = 1.0;
let electricityReduction = 0;

// Notification System
function showNotification(message, type = "info") {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// Market Volatility System
function updateMarketVolatility() {
    marketTimer++;
    if (marketTimer % 30 === 0) { // Every 30 seconds
        const volatility = 0.7 + Math.random() * 0.6; // 0.7 to 1.3
        gameState.marketVolatility = volatility;
        
        if (volatility < 0.9) {
            showNotification("Bitcoin-Kurs fällt!", "warning");
        } else if (volatility > 1.1) {
            showNotification("Bitcoin-Kurs steigt!", "success");
        }
    }
}

// Random Events Check
function checkRandomEvents() {
    randomEvents.forEach(event => {
        if (Math.random() < event.probability) {
            showNotification(event.description, "warning");
            event.effect();
        }
    });
}

// Check if bitcoin.png exists and replace the CSS bitcoin
function initializeBitcoin() {
    const bitcoinElement = document.getElementById('mainBitcoin');
    const img = new Image();
    img.onload = function() {
        bitcoinElement.innerHTML = '';
        bitcoinElement.className = 'bitcoin-image';
        bitcoinElement.style.backgroundImage = 'url(assets/bitcoin.png)';
    };
    img.onerror = function() {
        console.log('Bitcoin PNG not found, using CSS version');
    };
    img.src = 'assets/bitcoin.png';
}

// Display Functions
function updateDisplay() {
    const effectiveBitcoin = Math.floor(gameState.bitcoin * gameState.marketVolatility * currentMultiplier);
    document.getElementById('bitcoinCount').textContent = formatNumber(effectiveBitcoin) + ' Bitcoin';
    
    const netBPS = Math.max(0, gameState.bps * efficiencyMultiplier - gameState.electricityCost * (1 - electricityReduction));
    document.getElementById('bpsDisplay').textContent = 
        formatNumber(netBPS.toFixed(1)) + ' Bitcoin/s (Netto)';
    
    // Update additional stats
    updateAdditionalStats();
    updateUpgradesDisplay();
    updateAutoClickersDisplay();
}

function updateAdditionalStats() {
    let statsHtml = `
        <div class="additional-stats">
            <div>⚡ Stromkosten: ${formatNumber(gameState.electricityCost * (1 - electricityReduction))} Bitcoin/s</div>
            <div>📈 Markt-Multiplikator: ${(gameState.marketVolatility * currentMultiplier).toFixed(2)}x</div>
            <div>🛡️ Sicherheit: ${gameState.hackingProtection}</div>
        </div>
    `;
    
    // Add stats div if it doesn't exist
    if (!document.querySelector('.additional-stats')) {
        const statsDiv = document.createElement('div');
        statsDiv.innerHTML = statsHtml;
        document.querySelector('.stats').appendChild(statsDiv.firstElementChild);
    } else {
        document.querySelector('.additional-stats').innerHTML = statsHtml.match(/<div class="additional-stats">(.*?)<\/div>/s)[1];
    }
}

function formatNumber(num) {
    if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toString();
}

// Click Functions - Now affected by market conditions
function clickBitcoin(event) {
    let earnedBitcoin = clickPower * gameState.marketVolatility * currentMultiplier;
    gameState.bitcoin += earnedBitcoin;
    gameState.totalClicks++;

    showClickEffect(event, '+' + formatNumber(earnedBitcoin));
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

// Upgrade Functions - Much more expensive progression
function updateUpgradesDisplay() {
    const upgradesList = document.getElementById('upgradesList');
    upgradesList.innerHTML = '';

    upgrades.forEach((upgrade, index) => {
        const canAfford = gameState.bitcoin >= upgrade.cost;
        const upgradeDiv = document.createElement('div');
        upgradeDiv.className = 'upgrade' + (canAfford ? '' : ' disabled');
        
        let additionalInfo = '';
        if (upgrade.electricityCost) {
            additionalInfo += `<div style="color: #ff6b6b;">⚡ Stromkosten: +${upgrade.electricityCost}/s</div>`;
        }
        if (upgrade.hackingProtection) {
            additionalInfo += `<div style="color: #4ecdc4;">🛡️ Sicherheit: +${upgrade.hackingProtection}</div>`;
        }
        
        upgradeDiv.innerHTML = `
            <div class="upgrade-name">${upgrade.name}</div>
            <div style="font-size: 0.9em; margin: 5px 0;">${upgrade.description}</div>
            ${additionalInfo}
            <div class="upgrade-cost">Kosten: ${formatNumber(upgrade.cost)} Bitcoin</div>
            ${upgrade.owned > 0 ? `<div class="upgrade-owned">${upgrade.owned}</div>` : ''}
        `;

        if (canAfford) {
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
            gameState.electricityCost += upgrade.electricityCost || 0;
            startAutoClicker(upgrade);
        } else if (upgrade.type === 'clickMultiplier') {
            clickPower *= upgrade.multiplier;
        } else if (upgrade.type === 'efficiency') {
            if (upgrade.electricityReduction) {
                electricityReduction = Math.min(0.8, electricityReduction + upgrade.electricityReduction);
            }
            if (upgrade.efficiencyBoost) {
                efficiencyMultiplier += upgrade.efficiencyBoost;
            }
        } else if (upgrade.type === 'security') {
            gameState.hackingProtection += upgrade.hackingProtection || 0;
        }

        // Much steeper cost increase (1.25x instead of 1.15x)
        upgrade.cost = Math.ceil(upgrade.baseCost * Math.pow(1.25, upgrade.owned));

        updateDisplay();
        showNotification(`${upgrade.name} gekauft!`, "success");
    }
}

// Auto-Clicker Functions
function startAutoClicker(upgrade) {
    const interval = setInterval(() => {
        if (!gameState.godMode) {
            const production = upgrade.bps * efficiencyMultiplier * gameState.marketVolatility * currentMultiplier;
            gameState.bitcoin += production;
        }
        updateDisplay();
    }, 1000); // Every second for more frequent updates

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
            const effectiveRate = upgrade.bps * upgrade.owned * efficiencyMultiplier;
            div.innerHTML = `
                <div class="auto-clicker-dot"></div>
                ${upgrade.name} (${upgrade.owned}) - ${formatNumber(effectiveRate)}/s
            `;
            autoClickersList.appendChild(div);
        });
    } else {
        autoClickersDisplay.style.display = 'none';
    }
}

// Main Game Loop - Now includes market volatility and random events
setInterval(() => {
    if (!gameState.godMode) {
        // Calculate net income (production minus electricity costs)
        const netIncome = Math.max(0, gameState.bps * efficiencyMultiplier * gameState.marketVolatility * currentMultiplier - 
                                  gameState.electricityCost * (1 - electricityReduction));
        gameState.bitcoin += netIncome;
    }
    
    updateMarketVolatility();
    checkRandomEvents();
    updateDisplay();
}, 1000);

// Cheat Console (modified for new game mechanics)
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
            gameState = {
                bitcoin: 0,
                totalClicks: 0,
                bps: 0,
                godMode: false,
                electricityCost: 0,
                reputation: 100,
                marketVolatility: 1.0,
                hackingProtection: 0,
                lastHackTime: 0
            };
            clickPower = 1;
            efficiencyMultiplier = 1.0;
            electricityReduction = 0;
            currentMultiplier = 1.0;
            upgrades.forEach(u => {
                u.owned = 0;
                u.cost = u.baseCost;
            });
            autoClickerIntervals.forEach(clearInterval);
            autoClickerIntervals = [];
            output.textContent = 'Spiel zurückgesetzt!';
            break;
        
        case 'boom':
            currentMultiplier = 5.0;
            gameState.marketVolatility = 1.5;
            output.textContent = 'Bitcoin-Boom ausgelöst!';
            break;
        
        case 'crash':
            currentMultiplier = 0.1;
            gameState.marketVolatility = 0.3;
            output.textContent = 'Markt-Crash ausgelöst!';
            break;
        
        case 'godmode':
            gameState.godMode = !gameState.godMode;
            if (gameState.godMode) {
                gameState.bitcoin = 999999999;
                output.textContent = 'God Mode aktiviert!';
            } else {
                output.textContent = 'God Mode deaktiviert!';
            }
            break;
        
        default:
            output.textContent = 'Befehle: bitcoin [zahl], reset, boom, crash, godmode';
    }
    
    updateDisplay();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    initializeBitcoin();
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

    updateDisplay();
    showNotification("Willkommen beim Bitcoin Empire! Vorsicht vor Stromkosten und Hackern!", "info");
});
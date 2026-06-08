// State management for Lucky Wheel
const state = {
    entries: [],          // {text, colorIdx} for consistent colors
    isSpinning: false,
    currentWinner: null,
    currentWinnerIdx: null
};

// DOM references
const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const entryInput = document.getElementById('entryInput');
const addBtn = document.getElementById('addBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const entryList = document.getElementById('entryList');
const countLabel = document.getElementById('countLabel');
const spinBtn = document.getElementById('spinBtn');
const winnerSection = document.getElementById('winnerSection');
const winnerText = document.getElementById('winnerText');
const deleteWinnerBtn = document.getElementById('deleteWinnerBtn');
const keepWinnerBtn = document.getElementById('keepWinnerBtn');
const emptyModal = document.getElementById('emptyModal');
const resetBtn = document.getElementById('resetBtn');
const confettiCanvas = document.getElementById('confettiCanvas');
const confettiCtx = confettiCanvas.getContext('2d');

// Rainbow colors
const COLORS = [
    '#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c',
    '#4dabf7', '#9775fa', '#f783ac', '#ff8787',
    '#ffc078', '#a9e34b', '#66d9e8', '#da77f2'
];

// Hash function to get consistent color index for any string
function getColorIndex(text) {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        hash = ((hash << 5) - hash) + text.charCodeAt(i);
        hash = hash & hash;
    }
    return Math.abs(hash) % COLORS.length;
}

// Init function
function init() {
    localStorage.removeItem('luckyWheelEntries');
    setupListeners();
    renderWheel();
    renderList();
    updateUI();
}

// Event listeners
function setupListeners() {
    addBtn.addEventListener('click', addEntries);
    entryInput.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            addEntries();
        }
    });
    shuffleBtn.addEventListener('click', shuffleEntries);
    spinBtn.addEventListener('click', spin);
    deleteWinnerBtn.addEventListener('click', deleteWinner);
    keepWinnerBtn.addEventListener('click', keepWinnerAndContinue);
    resetBtn.addEventListener('click', reset);
}

// Add multiple entries from textarea (each line = 1 entry)
function addEntries() {
    const text = entryInput.value.trim();
    if (!text) return;

    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    if (lines.length === 0) return;

    lines.forEach(line => {
        const colorIdx = getColorIndex(line);
        state.entries.push({ text: line, colorIdx });
    });

    entryInput.value = '';
    saveToStorage();
    renderWheel();
    renderList();
    updateUI();
}

// Shuffle entries
function shuffleEntries() {
    for (let i = state.entries.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [state.entries[i], state.entries[j]] = [state.entries[j], state.entries[i]];
    }
    saveToStorage();
    renderWheel();
    renderList();
}

// Remove single entry
function removeEntry(idx) {
    state.entries.splice(idx, 1);
    saveToStorage();
    renderWheel();
    renderList();
    updateUI();
}

// Render entry list UI
function renderList() {
    entryList.innerHTML = '';
    countLabel.textContent = `${state.entries.length} entries`;

    state.entries.forEach((entry, i) => {
        const li = document.createElement('li');
        li.className = 'entry-item';
        li.style.borderLeftColor = COLORS[entry.colorIdx];

        const span = document.createElement('span');
        span.className = 'entry-text';
        span.textContent = entry.text;

        const del = document.createElement('button');
        del.className = 'delete-btn';
        del.textContent = '×';
        del.onclick = () => removeEntry(i);

        li.appendChild(span);
        li.appendChild(del);
        entryList.appendChild(li);
    });
}

// Render wheel canvas with consistent colors
function renderWheel() {
    const size = canvas.width;
    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 10;
    ctx.clearRect(0, 0, size, size);

    if (state.entries.length === 0) {
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
        ctx.fillStyle = '#e5e7eb';
        ctx.fill();
        ctx.strokeStyle = '#d1d5db';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = '#9ca3af';
        ctx.font = '16px Segoe UI';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Thêm items để quay!', cx, cy);
        return;
    }

    const segAngle = (2 * Math.PI) / state.entries.length;

    state.entries.forEach((entry, i) => {
        const start = i * segAngle - Math.PI / 2;
        const end = start + segAngle;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, start, end);
        ctx.closePath();
        ctx.fillStyle = COLORS[entry.colorIdx];
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Text
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(start + segAngle / 2);
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Segoe UI';
        let display = entry.text;
        if (entry.text.length > 10) display = entry.text.slice(0, 8) + '...';
        ctx.fillText(display, radius - 20, 0);
        ctx.restore();
    });

    // Center circle
    ctx.beginPath();
    ctx.arc(cx, cy, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#667eea';
    ctx.font = 'bold 20px Segoe UI';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎡', cx, cy);
}

// Spin logic
function spin() {
    if (state.isSpinning || state.entries.length === 0) return;
    state.isSpinning = true;
    spinBtn.disabled = true;
    winnerSection.classList.remove('show');

    const winnerIdx = Math.floor(Math.random() * state.entries.length);
    const winner = state.entries[winnerIdx].text;
    const segAngle = (2 * Math.PI) / state.entries.length;

    // Extra spins (3-5 full rotations)
    const extraSpins = 3 + Math.floor(Math.random() * 3);

    // Calculate rotation to bring winner segment to TOP (pointer at 12 o'clock)
    const targetRotation = extraSpins * 2 * Math.PI - (winnerIdx + 0.5) * segAngle;

    const start = Date.now();
    const dur = 4000;

    function animate() {
        const elapsed = Date.now() - start;
        const prog = Math.min(elapsed / dur, 1);
        const ease = 1 - Math.pow(1 - prog, 3);

        canvas.style.transform = `rotate(${targetRotation * ease}rad)`;

        if (prog < 1) {
            requestAnimationFrame(animate);
        } else {
            state.isSpinning = false;
            state.currentWinner = winner;
            state.currentWinnerIdx = winnerIdx;
            showWinner(winner);
        }
    }
    animate();
}

// Show winner UI
function showWinner(winner) {
    startConfetti();
    winnerText.textContent = winner;
    winnerSection.classList.add('show');
    setTimeout(stopConfetti, 3000);
}

// Delete winner and remove from wheel
function deleteWinner() {
    if (state.currentWinner === null) return;

    state.entries.splice(state.currentWinnerIdx, 1);
    state.currentWinner = null;
    state.currentWinnerIdx = null;

    saveToStorage();
    renderWheel();
    renderList();
    updateUI();
    winnerSection.classList.remove('show');
}

// Keep winner and continue spinning
function keepWinnerAndContinue() {
    state.currentWinner = null;
    state.currentWinnerIdx = null;
    winnerSection.classList.remove('show');
    updateUI();
}

// Reset (clear all and start over)
function reset() {
    state.entries = [];
    state.currentWinner = null;
    state.currentWinnerIdx = null;
    canvas.style.transform = 'rotate(0rad)';
    emptyModal.classList.remove('show');
    winnerSection.classList.remove('show');
    saveToStorage();
    renderWheel();
    renderList();
    updateUI();
}

// Confetti animation
let confettiParticles = [];
let confettiAnimId = null;

function startConfetti() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
    confettiParticles = [];
    for (let i = 0; i < 150; i++) {
        confettiParticles.push({
            x: Math.random() * confettiCanvas.width,
            y: -20 - Math.random() * 100,
            size: Math.random() * 10 + 5,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            speedY: Math.random() * 3 + 2,
            speedX: (Math.random() - 0.5) * 2,
            rot: Math.random() * 360,
            rotSpeed: (Math.random() - 0.5) * 10
        });
    }
    animateConfetti();
}

function animateConfetti() {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    let alive = 0;
    confettiParticles.forEach(p => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.rot += p.rotSpeed;
        if (p.y < confettiCanvas.height) {
            alive++;
            confettiCtx.save();
            confettiCtx.translate(p.x, p.y);
            confettiCtx.rotate(p.rot * Math.PI / 180);
            confettiCtx.fillStyle = p.color;
            confettiCtx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
            confettiCtx.restore();
        }
    });
    if (alive > 0) confettiAnimId = requestAnimationFrame(animateConfetti);
}

function stopConfetti() {
    if (confettiAnimId) cancelAnimationFrame(confettiAnimId);
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
}

// UI updates
function updateUI() {
    spinBtn.disabled = state.entries.length === 0 || state.isSpinning;
}

// Persistence
function saveToStorage() {
    localStorage.setItem('luckyWheelEntries', JSON.stringify(state.entries));
}

function loadFromStorage() {
    const e = localStorage.getItem('luckyWheelEntries');
    if (e) state.entries = JSON.parse(e);
}

// Start app
init();
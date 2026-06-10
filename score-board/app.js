/**
 * Mâm Đền — App Tính Điểm Bida Online
 * Built by PHAN WUAN
 */
const $ = (s, p) => (p || document).querySelector(s);
const $$ = (s, p) => (p || document).querySelectorAll(s);
const show = el => (typeof el === 'string' ? $(el) : el)?.classList.remove('hidden');
const hide = el => (typeof el === 'string' ? $(el) : el)?.classList.add('hidden');

// ---- state ----
const DEF_SCORE = 3, MAX_SCORE = 12;
const COLORS = ['#f4493a', '#2196f3', '#4caf50', '#ff9800', '#9c27b0', '#00bcd4'];
const STORAGE = 'md_state', SETTINGS = 'md_cfg';

let G = { mode: null, nPlayers: 2, players: [], scoreN: DEF_SCORE, x2on: false, x2now: false, hist: [], pair: [] };
let cfg = { x2on: false, scoreN: DEF_SCORE };
let wakeLock = null;

// ---- helpers ----
function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

// ---- navigation ----
function goHome() { hide('#screenGame'); hide('#screenMode'); hide('#screenPlayers'); show('#screenHome'); }
function goMode() { hide('#screenHome'); show('#screenMode'); }
function backToMode() { hide('#screenPlayers'); show('#screenMode'); }
function selectMode(m) { G.mode = m; hide('#screenMode'); show('#screenPlayers'); }
function selectPlayers(n) { G.nPlayers = n; initPlayers(); startGame(); }

function initPlayers() {
  G.players = Array.from({ length: G.nPlayers }, (_, i) => ({ name: `Player ${i + 1}`, score: 0, color: COLORS[i], id: i }));
  G.hist = []; G.pair = []; G.x2now = false;
}

// ---- persistence ----
function save() { localStorage.setItem(STORAGE, JSON.stringify({ mode: G.mode, nPlayers: G.nPlayers, players: G.players, scoreN: G.scoreN, x2on: G.x2on, hist: G.hist, pair: G.pair })); }
function load() { try { const d = JSON.parse(localStorage.getItem(STORAGE)); if (!d) return false; Object.assign(G, d); G.x2now = false; return true; } catch { return false; } }
function saveCfg() { localStorage.setItem(SETTINGS, JSON.stringify(cfg)); }
function loadCfg() { try { const d = JSON.parse(localStorage.getItem(SETTINGS)); if (d) { cfg = d; G.x2on = cfg.x2on; G.scoreN = cfg.scoreN; } } catch {} }

// ---- wake lock ----
async function wakeOn() { if ('wakeLock' in navigator) try { wakeLock = await navigator.wakeLock.request('screen'); } catch {} }
document.addEventListener('visibilitychange', async () => { if (document.visibilityState === 'visible' && !$('#screenGame').classList.contains('hidden')) await wakeOn(); });

// ---- render cards ----
function renderCards() {
  const wrap = $('#gameCardsWrap'); wrap.innerHTML = '';
  G.players.forEach((p, i) => {
    const el = document.createElement('div');
    el.className = 'score-card' + (G.mode === 'mam' && G.pair.includes(i) ? ' selected' : '');
    el.dataset.pid = i;
    el.style.setProperty('--player-color', p.color);
    el.innerHTML = `
        <div class="score-card-name" onclick="renamePlayer(${i})"><span class="score-card-name-text">${esc(p.name)}</span> <span class="score-card-edit-icon">✏</span></div>
        <div class="score-card-body">
          ${G.mode !== 'mam' ? `<button class="score-card-btn score-card-minus" onclick="changeScore(${i},-1)">−</button>` : ''}
          <div class="score-card-score">${p.score}</div>
          ${G.mode !== 'mam' ? `<button class="score-card-btn score-card-plus" onclick="changeScore(${i},1)">＋</button>` : ''}
        </div>`;

    el.addEventListener('click', e => { if (!e.target.closest('button,.score-card-name') && G.mode === 'mam') mamClick(i); });
    wrap.appendChild(el);
  });
  if (G.mode === 'mam') updateMamPanel();
}

function updScores() { G.players.forEach((p, i) => { const c = $(`.score-card[data-pid="${i}"]`); if (c) { const s = c.querySelector('.score-card-score'); if (s) s.textContent = p.score; } }); }

// ---- score logic ----
function delta(pIdx, d) { G.players[pIdx].score += d; }
function histAdd(type, data) { G.hist.push({ time: Date.now(), type, data }); }

function changeScore(pIdx, d) {
  if (G.mode === 'race') {
    G.players[pIdx].score = Math.max(0, G.players[pIdx].score + d);
    histAdd('race', { p: pIdx, d });
  }
  G.x2now = false;
  updScores(); renderCards(); updateMamPanel(); save();
}

function mamClick(i) {
  if (G.pair.includes(i)) G.pair = G.pair.filter(x => x !== i);
  else { G.pair.push(i); if (G.pair.length > 2) G.pair.shift(); }
  renderCards(); updateMamPanel(); save();
}

function mamScore(d) {
  if (G.pair.length !== 2) return;
  const [a, b] = G.pair, v = G.x2now ? d * 2 : d;
  G.players[a].score += v;
  G.players[b].score -= v;
  histAdd('mam', { w: d > 0 ? a : b, l: d > 0 ? b : a, d: Math.abs(v) });
  G.x2now = false;
  updScores(); cancelMamSelect(); save();
}

// ---- undo ----
function undoMamScore() {
  if (!G.hist.length) return;
  const e = G.hist.pop();
  if (e.type === 'mam') { G.players[e.data.w].score -= e.data.d; G.players[e.data.l].score += e.data.d; }
  else if (e.type === 'race') { G.players[e.data.p].score -= e.data.d; }
  updScores(); renderCards(); updateMamPanel(); save();
}

// ---- mam panel ----
function updateMamPanel() {
  if (G.mode !== 'mam') { hide('#mamPanel'); return; }
  if (G.pair.length !== 2) { hide('#mamPanel'); return; }
  show('#mamPanel');
  const wrap = $('#mamBtnsWrap'), names = $('#mamSelectedNames');
  hide('#mamPlayersNote');
  let h = '';
  for (let i = G.scoreN; i >= 1; i--) h += `<button class="mam-btn mam-btn-neg" onclick="mamScore(${-i})">−${i}</button>`;
  for (let i = 1; i <= G.scoreN; i++) h += `<button class="mam-btn mam-btn-pos" onclick="mamScore(${i})">+${i}</button>`;
  wrap.innerHTML = h;
  names.innerHTML = G.pair.map((pid, idx) => {
    const p = G.players[pid];
    return `<span class="mam-name-tag" style="color:${p.color}">${esc(p.name)}</span>`;
  }).join(' <span class="mam-name-vs">vs</span> ');
  const xr = $('#mamX2Row');
  if (G.x2on) { show(xr); $('#mamX2Btn').classList.toggle('active', G.x2now); } else hide(xr);
}
function cancelMamSelect() { G.pair = []; renderCards(); updateMamPanel(); save(); }


// ---- x2 ----
function toggleX2() { G.x2now = !G.x2now; $('#mamX2Btn')?.classList.toggle('active', G.x2now); }
function toggleX2Setting() { cfg.x2on = $('#x2ToggleInput').checked; G.x2on = cfg.x2on; saveCfg(); updateMamPanel(); }
function toggleX2SettingGame() { cfg.x2on = $('#x2ToggleInputGame').checked; G.x2on = cfg.x2on; saveCfg(); updateMamPanel(); }
function openMamScoreModeSelector() { show('#mamScoreModeOverlay'); hide('#gameDropdown'); }
function closeMamScoreModeSelector() { hide('#mamScoreModeOverlay'); }
// ---- score count ----
function changeScoreCount(d) { const n = G.scoreN + d; if (n < 1 || n > MAX_SCORE) return; G.scoreN = cfg.scoreN = n; ['#scoreCountValGame','#scoreCountValSettings'].forEach(s => { const el = $(s); if (el) el.textContent = n; }); updateMamPanel(); saveCfg(); }

// ---- rename ----
function renamePlayer(i) { const n = prompt('Nhập tên:', G.players[i].name); if (n && n.trim()) { G.players[i].name = n.trim(); renderCards(); save(); } }

// ---- menu ----
function toggleMenu(e) { e.stopPropagation(); $('#gameDropdown').classList.toggle('hidden'); }
function confirmReset() { hide('#gameDropdown'); show('#resetConfirmOverlay'); }
function closeReset() { hide('#resetConfirmOverlay'); }
function doResetConfirmed() { G.players.forEach(p => p.score = 0); G.hist = []; G.pair = []; G.x2now = false; closeReset(); updScores(); renderCards(); updateMamPanel(); save(); }
function closeResetConfirm() { closeReset(); }
function confirmExit() { hide('#gameDropdown'); show('#confirmOverlay'); }
function closeConfirm() { hide('#confirmOverlay'); }
function doExitGame() { hide('#confirmOverlay'); hide('#screenGame'); G = { mode: null, nPlayers: 2, players: [], scoreN: cfg.scoreN, x2on: cfg.x2on, x2now: false, hist: [], pair: [] }; localStorage.removeItem(STORAGE); goHome(); }
document.addEventListener('click', e => { if (!$('#gameDropdown').classList.contains('hidden') && !e.target.closest('#gameDropdown,#menuBtn')) hide('#gameDropdown'); });

// ---- history ----
function toggleHistory() {
  console.log('toggleHistory called');
  const o = $('#historyOverlay');
  if (o.classList.contains('hidden')) { show(o); renderHist(); } else hide(o);
}
function renderHist() {
  const list = $('#historyList');
  if (!G.hist.length) { list.innerHTML = '<div class="history-empty">Chưa có điểm nào được ghi</div>'; return; }
  try {
    list.innerHTML = [...G.hist].reverse().map(e => {
      const t = new Date(e.time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      let d = '';
      if (e.type === 'race') {
        const p = G.players[e.data.p];
        if (p) {
          d = `<span style="color:${p.color}">${esc(p.name)}</span> ${e.data.d >= 0 ? '+' : ''}${e.data.d} điểm`;
        } else {
          d = `Player ${e.data.p} not found`;
        }
      } else if (e.type === 'mam') {
        const w = G.players[e.data.w];
        const l = G.players[e.data.l];
        if (w && l) {
          d = `<span style="color:${w.color}">${esc(w.name)}</span> +${e.data.d} · <span style="color:${l.color}">${esc(l.name)}</span> −${e.data.d}`;
        } else {
          d = `Players ${e.data.w} or ${e.data.l} not found`;
        }
      }
      return `<div class="history-item"><span class="history-time">${t}</span> <span class="history-desc">${d}</span></div>`;
    }).join('');
  } catch (err) {
    list.innerHTML = `<div class="history-error">Error rendering history: ${err.message}</div>`;
  }
}

// ---- settings ----
function openSettings() { $('#x2ToggleInput').checked = cfg.x2on; $('#scoreCountValSettings').textContent = cfg.scoreN; show('#settingsOverlay'); }
function closeSettings() { hide('#settingsOverlay'); }
// ---- game start ----
function startGame() {
  hide('#screenHome'); hide('#screenMode'); hide('#screenPlayers'); show('#screenGame');
  $('#gameModeLabel').textContent = G.mode === 'race' ? 'RACE' : 'MÂM';
  if (G.mode === 'mam') { show('#mamUndoBtn'); show('#mamPanel'); } else { hide('#mamUndoBtn'); hide('#mamPanel'); }
  renderCards(); updateMamPanel(); save(); wakeOn();
}

// ---- keyboard ----
document.addEventListener('keydown', e => { if (e.ctrlKey && e.key === 'z') { e.preventDefault(); if (!$('#screenGame').classList.contains('hidden')) undoMamScore(); } });

// ---- init ----
document.addEventListener('DOMContentLoaded', () => {
  loadCfg();
  G.x2on = cfg.x2on; G.scoreN = cfg.scoreN;
  if (load()) { startGame(); } else goHome();
});
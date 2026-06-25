const ROWS = 50, COLS = 50, WIN = 5;
let board = Array(ROWS * COLS).fill('');
let currentPlayer = 'X';
let gameOver = false;

const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');

/* ─── render ─── */
function render() {
  boardEl.innerHTML = '';
  board.forEach((v, i) => {
    const c = document.createElement('div');
    c.className = 'cell';
    c.textContent = v;
    c.addEventListener('click', () => handleClick(i));
    boardEl.appendChild(c);
  });
  statusEl.textContent = gameOver ? 'Game over! Click to restart.' : `Lượt: ${currentPlayer}`;
}

/* ─── click handling ─── */
function handleClick(i) {
  if (board[i] || gameOver) return;
  board[i] = currentPlayer;
  if (checkWin(currentPlayer)) { endGame(`${currentPlayer} thắng!`); return; }
  if (board.every(v => v)) { endGame('Hòa!'); return; }
  currentPlayer = 'O';
  render();
  setTimeout(botMove, 200);
}

function endGame(msg) {
  gameOver = true;
  statusEl.textContent = msg;
  rebuildCells();
  const btn = document.createElement('button');
  btn.textContent = 'Chơi lại';
  btn.addEventListener('click', restart);
  statusEl.appendChild(btn);
}

function rebuildCells() {
  boardEl.innerHTML = '';
  board.forEach((v) => {
    const c = document.createElement('div');
    c.className = 'cell';
    c.textContent = v;
    boardEl.appendChild(c);
  });
}

function restart() {
  board = Array(ROWS * COLS).fill('');
  currentPlayer = 'X';
  gameOver = false;
  render();
}

/* ─── win check (5 in a row) ─── */
function checkWin(p) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const i = r * COLS + c;
      if (board[i] !== p) continue;
      // →
      if (c <= COLS - WIN && [0,1,2,3,4].every(k => board[r*COLS + c + k] === p)) return true;
      // ↓
      if (r <= ROWS - WIN && [0,1,2,3,4].every(k => board[(r+k)*COLS + c] === p)) return true;
      // ↘
      if (r <= ROWS - WIN && c <= COLS - WIN && [0,1,2,3,4].every(k => board[(r+k)*COLS + c + k] === p)) return true;
      // ↙
      if (r <= ROWS - WIN && c >= WIN - 1 && [0,1,2,3,4].every(k => board[(r+k)*COLS + c - k] === p)) return true;
    }
  }
  return false;
}

/* ─── valid moves (radius‑2 from any piece) ─── */
function getValidMoves() {
  const occupied = board.map((v,i) => v ? i : -1).filter(i => i >= 0);
  if (!occupied.length) return [Math.floor((ROWS*COLS)/2)]; // center
  const set = new Set();
  for (const idx of occupied) {
    const r = Math.floor(idx / COLS);
    const c = idx % COLS;
    for (let dr = -2; dr <= 2; dr++) {
      for (let dc = -2; dc <= 2; dc++) {
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
        const ni = nr * COLS + nc;
        if (!board[ni]) set.add(ni);
      }
    }
  }
  return Array.from(set);
}

/* ─── evaluation heuristic ─── */
function evaluate(bd) {
  let score = 0;
  // count sequences of each length
  const dirs = [[0,1],[1,0],[1,1],[1,-1]];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      for (const [dr, dc] of dirs) {
        const p = bd[r*COLS + c];
        if (!p) continue;
        let len = 1;
        while (true) {
          const nr = r + dr*len, nc = c + dc*len;
          if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) break;
          if (bd[nr*COLS + nc] !== p) break;
          len++;
        }
        if (len >= 5) { score += p === 'O' ? 100000 : -100000; continue; }
        let open = 0;
        const bfr = r - dr, bfc = c - dc;
        if (bfr >= 0 && bfr < ROWS && bfc >= 0 && bfc < COLS && !bd[bfr*COLS + bfc]) open++;
        const aftR = r + dr*len, aftC = c + dc*len;
        if (aftR >= 0 && aftR < ROWS && aftC >= 0 && aftC < COLS && !bd[aftR*COLS + aftC]) open++;
        const v = p === 'O' ? 1 : -1;
        if (len === 4) score += v * 1000 * (open + 1);
        else if (len === 3) score += v * 50 * (open + 1);
        else if (len === 2) score += v * 10 * (open + 1);
      }
    }
  }
  return score;
}

/* ─── minimax αβ depth=3 ─── */
function minimax(bd, depth, alpha, beta, isMax) {
  if (depth === 0) return evaluate(bd);
  const candidates = getValidMovesSlice(bd, 20);
  if (!candidates.length) return evaluate(bd);

  if (isMax) {
    let best = -Infinity;
    for (const idx of candidates) {
      bd[idx] = 'O';
      if (checkWinQuick(bd, idx, 'O')) { bd[idx] = ''; return 1000000; }
      best = Math.max(best, minimax(bd, depth-1, alpha, beta, false));
      bd[idx] = '';
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const idx of candidates) {
      bd[idx] = 'X';
      if (checkWinQuick(bd, idx, 'X')) { bd[idx] = ''; return -1000000; }
      best = Math.min(best, minimax(bd, depth-1, alpha, beta, true));
      bd[idx] = '';
      beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    return best;
  }
}

/* quick win check after single move at idx */
function checkWinQuick(bd, idx, p) {
  const r = Math.floor(idx / COLS), c = idx % COLS;
  const dirs = [[0,1],[1,0],[1,1],[1,-1]];
  for (const [dr, dc] of dirs) {
    let cnt = 1;
    // forward
    for (let k = 1; k < WIN; k++) {
      const nr = r + dr*k, nc = c + dc*k;
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) break;
      if (bd[nr*COLS + nc] !== p) break;
      cnt++;
    }
    // backward
    for (let k = 1; k < WIN; k++) {
      const nr = r - dr*k, nc = c - dc*k;
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) break;
      if (bd[nr*COLS + nc] !== p) break;
      cnt++;
    }
    if (cnt >= WIN) return true;
  }
  return false;
}

/* get valid moves with optional limit */
function getValidMovesSlice(bd, max) {
  const occupied = bd.map((v,i) => v ? i : -1).filter(i => i >= 0);
  if (!occupied.length) {
    const center = Math.floor((ROWS*COLS)/2);
    return [center];
  }
  const set = new Set();
  for (const idx of occupied) {
    const r = Math.floor(idx / COLS);
    const c = idx % COLS;
    for (let dr = -2; dr <= 2; dr++) {
      for (let dc = -2; dc <= 2; dc++) {
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
        const ni = nr * COLS + nc;
        if (!bd[ni]) set.add(ni);
      }
    }
  }
  const arr = Array.from(set);
  if (arr.length <= max) return arr;
  // sort by heuristic desc (number of adjacent pieces)
  const scored = arr.map(i => ({i, s: nearbyCount(bd, i)}));
  scored.sort((a,b) => b.s - a.s);
  return scored.slice(0, max).map(x => x.i);
}

function nearbyCount(bd, idx) {
  const r = Math.floor(idx / COLS), c = idx % COLS;
  let cnt = 0;
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++) {
      if (dr===0 && dc===0) continue;
      const nr = r+dr, nc = c+dc;
      if (nr>=0 && nr<ROWS && nc>=0 && nc<COLS && bd[nr*COLS+nc]) cnt++;
    }
  return cnt;
}

/* ─── Bot AI ─── */
function botMove() {
  if (gameOver) return;
  const moves = getValidMoves();

  // 1) win immediately
  for (const idx of moves) {
    board[idx] = 'O';
    if (checkWin('O')) {
      if (board.every(v => v)) { endGame('Hòa!'); return; }
      endGame('Bot thắng!');
      return;
    }
    board[idx] = '';
  }

  // 2) block opponent
  for (const idx of moves) {
    board[idx] = 'X';
    if (checkWin('X')) {
      board[idx] = 'O';
      render();
      if (board.every(v => v)) { endGame('Hòa!'); return; }
      currentPlayer = 'X';
      return;
    }
    board[idx] = '';
  }

  // 3) minimax depth=3
  let bestScore = -Infinity, bestMove = moves[0];
  const candidates = getValidMovesSlice(board, 20);
  for (const idx of candidates) {
    board[idx] = 'O';
    const score = minimax(board, 3, -Infinity, Infinity, false);
    board[idx] = '';
    if (score > bestScore) { bestScore = score; bestMove = idx; }
  }

  board[bestMove] = 'O';
  if (checkWin('O')) { endGame('Bot thắng!'); return; }
  if (board.every(v => v)) { endGame('Hòa!'); return; }
  currentPlayer = 'X';
  render();
}

render();

/**
 * Socket.IO Client for Real-Time Match Sharing
 */

let socket = null;
let socketConnected = false;

// Configuration
const SOCKET_SERVER_URL = 'https://bida-board.onrender.com'; // Change to your server URL

// Initialize socket connection
function initSocket() {
  if (!socket) {
    socket = io(SOCKET_SERVER_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    // Connection events
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      socketConnected = true;
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      socketConnected = false;
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      socketConnected = false;
    });

    // Room events
    socket.on('room_created', (data) => {
      handleRoomCreated(data);
    });

    socket.on('room_state', (data) => {
      handleRoomState(data);
    });

    socket.on('score_updated', (data) => {
      handleScoreUpdated(data);
    });

    socket.on('undo_performed', (data) => {
      handleUndoPerformed(data);
    });

    socket.on('player_renamed', (data) => {
      handlePlayerRenamed(data);
    });

    socket.on('room_closed', () => {
      handleRoomClosed();
    });

    socket.on('game_reset', (data) => {
      handleGameReset(data);
    });

    socket.on('participant_joined', (data) => {
      console.log('Participant joined:', data.socketId);
    });

    socket.on('error', (data) => {
      handleSocketError(data);
    });
  }
}

// Create room
function emitCreateRoom() {
  if (!socketConnected) {
    showError('Socket chưa kết nối');
    return;
  }
  
  const gameState = serializeGameState();
  socket.emit('create_room', { gameState });
}

// Join room
function emitJoinRoom(roomId) {
  if (!socketConnected) {
    showError('Socket chưa kết nối');
    return;
  }
  
  socket.emit('join_room', { roomId });
}

// Emit score change
function emitScoreChange() {
  if (!G.roomId || G.isRemoteUpdate) return;
  
  const gameState = serializeGameState();
  socket.emit('score_change', { roomId: G.roomId, gameState });
}

// Emit undo
function emitUndoAction() {
  if (!G.roomId || G.isRemoteUpdate) return;
  
  const gameState = serializeGameState();
  socket.emit('undo_action', { roomId: G.roomId, gameState });
}

// Emit rename
function emitRenamePlayer(playerIndex, newName) {
  if (!G.roomId || G.isRemoteUpdate) return;
  
  socket.emit('rename_player', { 
    roomId: G.roomId, 
    playerIndex, 
    newName 
  });
}

// Leave room
function emitLeaveRoom() {
  if (!G.roomId) return;
  
  socket.emit('leave_room', { roomId: G.roomId });
  G.roomId = null;
  G.isHost = false;
}

// Reset game
function emitResetGame() {
  if (!G.roomId || G.isRemoteUpdate) return;
  
  const gameState = serializeGameState();
  socket.emit('reset_game', { roomId: G.roomId, gameState });
}

// Serialize game state
function serializeGameState() {
  return {
    mode: G.mode,
    nPlayers: G.nPlayers,
    players: G.players,
    scoreN: G.scoreN,
    x2on: G.x2on,
    x2now: G.x2now,
    hist: G.hist,
    pair: G.pair
  };
}

// Deserialize and apply game state
function applyGameState(gameState) {
  G.isRemoteUpdate = true;
  G.mode = gameState.mode;
  G.nPlayers = gameState.nPlayers;
  G.players = gameState.players;
  G.scoreN = gameState.scoreN;
  G.x2on = gameState.x2on;
  G.x2now = gameState.x2now;
  G.hist = gameState.hist;
  G.pair = gameState.pair;
  
  updScores();
  renderCards();
  updateMamPanel();
  
  G.isRemoteUpdate = false;
}

// Event handlers
function handleRoomCreated(data) {
  const roomId = data.roomId;
  G.roomId = roomId;
  G.isHost = true;
  
  console.log('Room created:', roomId);
  updateRoomBadge();
  showShareRoomOverlay(roomId);
}

function handleRoomState(data) {
  const { gameState, roomId } = data;
  G.roomId = roomId;
  G.isHost = false;
  
  console.log('Joined room:', roomId);
  
  // Apply game state first
  G.isRemoteUpdate = true;
  G.mode = gameState.mode;
  G.nPlayers = gameState.nPlayers;
  G.players = gameState.players;
  G.scoreN = gameState.scoreN;
  G.x2on = gameState.x2on;
  G.x2now = gameState.x2now;
  G.hist = gameState.hist;
  G.pair = gameState.pair;
  G.isRemoteUpdate = false;
  
  // Start the game and show the screen
  startGame();
}

function handleScoreUpdated(data) {
  const { gameState } = data;
  applyGameState(gameState);
}

function handleUndoPerformed(data) {
  const { gameState } = data;
  applyGameState(gameState);
}

function handlePlayerRenamed(data) {
  const { playerIndex, newName } = data;
  if (G.players[playerIndex]) {
    G.players[playerIndex].name = newName;
    renderCards();
  }
}

function handleRoomClosed() {
  console.log('Room closed by host');
  G.roomId = null;
  G.isHost = false;
  
  showNotification('Phòng đã đóng. Chủ phòng đã thoát.');
  
  setTimeout(() => {
    hide('#screenGame');
    G = { 
      mode: null, 
      nPlayers: 2, 
      players: [], 
      scoreN: cfg.scoreN, 
      x2on: cfg.x2on, 
      x2now: false, 
      hist: [], 
      pair: [],
      roomId: null,
      isHost: false,
      isRemoteUpdate: false
    };
    localStorage.removeItem(STORAGE);
    goHome();
  }, 2000);
}


function handleGameReset(data) {
  const { gameState } = data;
  console.log('Game reset by host');
  applyGameState(gameState);
}
function handleSocketError(data) {
  const { message } = data;
  console.error('Socket error:', message);
  
  // Map error messages to Vietnamese
  let errorMsg = message;
  if (message === 'Room not found') {
    errorMsg = 'Không tìm thấy phòng';
  } else if (message === 'Failed to join room') {
    errorMsg = 'Không thể vào phòng';
  } else if (message === 'Failed to create room') {
    errorMsg = 'Không thể tạo phòng';
  }
  
  showError(errorMsg);
}

// UI Helpers
function showNotification(msg) {
  const notif = document.createElement('div');
  notif.className = 'notification';
  notif.textContent = msg;
  document.body.appendChild(notif);
  
  setTimeout(() => notif.remove(), 3000);
}

function showError(msg) {
  const error = document.createElement('div');
  error.className = 'error-notification';
  error.textContent = msg;
  document.body.appendChild(error);
  
  setTimeout(() => error.remove(), 3000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  initSocket();
});

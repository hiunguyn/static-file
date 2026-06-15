const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors({
  origin: "*"
}));
app.use(express.json());

// In-memory room storage
const rooms = new Map();

// Generate random 6-character alphanumeric room code
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars (I, O, 0, 1)
  let code;
  do {
    code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  } while (rooms.has(code)); // Ensure uniqueness
  return code;
}

// Create a new room
function createRoom(gameState, hostSocketId) {
  const roomId = generateRoomCode();
  rooms.set(roomId, {
    roomId,
    hostSocketId,
    participants: [hostSocketId],
    gameState,
    createdAt: Date.now()
  });
  return roomId;
}

// Join existing room
function joinRoom(roomId, socketId) {
  const room = rooms.get(roomId);
  if (!room) return null;
  
  if (!room.participants.includes(socketId)) {
    room.participants.push(socketId);
  }
  return room;
}

// Broadcast to all participants in a room
function broadcastToRoom(roomId, event, data, excludeSocketId = null) {
  const room = rooms.get(roomId);
  if (!room) return;
  
  room.participants.forEach(socketId => {
    if (socketId !== excludeSocketId) {
      io.to(socketId).emit(event, data);
    }
  });
}

// Remove participant from room
function removeParticipant(socketId) {
  rooms.forEach((room, roomId) => {
    const index = room.participants.indexOf(socketId);
    if (index !== -1) {
      room.participants.splice(index, 1);
      
      // If host left, close the room
      if (socketId === room.hostSocketId) {
        broadcastToRoom(roomId, 'room_closed', {});
        rooms.delete(roomId);
        console.log(`Room ${roomId} closed (host disconnected)`);
      } else if (room.participants.length === 0) {
        // If no participants left, delete room
        rooms.delete(roomId);
        console.log(`Room ${roomId} deleted (no participants)`);
      }
    }
  });
}

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  // Create room
  socket.on('create_room', (data) => {
    try {
      const { gameState } = data;
      const roomId = createRoom(gameState, socket.id);
      socket.emit('room_created', { roomId });
      console.log(`Room created: ${roomId} by ${socket.id}`);
    } catch (error) {
      socket.emit('error', { message: 'Failed to create room' });
      console.error('Create room error:', error);
    }
  });
  
  // Join room
  socket.on('join_room', (data) => {
    try {
      const { roomId } = data;
      const room = joinRoom(roomId, socket.id);
      
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }
      
      socket.emit('room_state', { gameState: room.gameState, roomId });
      
      // Notify others in room
      broadcastToRoom(roomId, 'participant_joined', { socketId: socket.id }, socket.id);
      
      console.log(`Client ${socket.id} joined room ${roomId}`);
    } catch (error) {
      socket.emit('error', { message: 'Failed to join room' });
      console.error('Join room error:', error);
    }
  });
  
  // Score change
  socket.on('score_change', (data) => {
    try {
      const { roomId, gameState } = data;
      const room = rooms.get(roomId);
      
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }
      
      // Update stored game state
      room.gameState = gameState;
      
      // Broadcast to all participants (including sender for consistency)
      room.participants.forEach(socketId => {
        io.to(socketId).emit('score_updated', { gameState });
      });
      
      console.log(`Score updated in room ${roomId}`);
    } catch (error) {
      socket.emit('error', { message: 'Failed to update score' });
      console.error('Score change error:', error);
    }
  });
  
  // Undo action
  socket.on('undo_action', (data) => {
    try {
      const { roomId, gameState } = data;
      const room = rooms.get(roomId);
      
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }
      
      room.gameState = gameState;
      
      room.participants.forEach(socketId => {
        io.to(socketId).emit('undo_performed', { gameState });
      });
      
      console.log(`Undo performed in room ${roomId}`);
    } catch (error) {
      socket.emit('error', { message: 'Failed to undo' });
      console.error('Undo error:', error);
    }
  });
  
  // Rename player
  socket.on('rename_player', (data) => {
    try {
      const { roomId, playerIndex, newName } = data;
      const room = rooms.get(roomId);
      
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }
      
      // Update stored game state
      if (room.gameState.players[playerIndex]) {
        room.gameState.players[playerIndex].name = newName;
      }
      
      broadcastToRoom(roomId, 'player_renamed', { playerIndex, newName });
      
      console.log(`Player ${playerIndex} renamed in room ${roomId}`);
    } catch (error) {
      socket.emit('error', { message: 'Failed to rename player' });
      console.error('Rename error:', error);
    }
  });
  
  // Leave room
  socket.on('leave_room', (data) => {
    try {
      const { roomId } = data;
      const room = rooms.get(roomId);
      
      if (!room) return;
      
      // If host is leaving, close room for everyone
      if (socket.id === room.hostSocketId) {
        broadcastToRoom(roomId, 'room_closed', {});
        rooms.delete(roomId);
        console.log(`Room ${roomId} closed (host left)`);
      } else {
        // Remove participant
        const index = room.participants.indexOf(socket.id);
        if (index !== -1) {
          room.participants.splice(index, 1);
        }
        console.log(`Client ${socket.id} left room ${roomId}`);
      }
    } catch (error) {
      console.error('Leave room error:', error);
    }
  });
  
  // Handle disconnection
  
  // Reset game
  socket.on('reset_game', (data) => {
    try {
      const { roomId, gameState } = data;
      const room = rooms.get(roomId);
      
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }
      
      // Update stored game state
      room.gameState = gameState;
      
      // Broadcast to all participants
      room.participants.forEach(socketId => {
        io.to(socketId).emit('game_reset', { gameState });
      });
      
      console.log(`Game reset in room ${roomId}`);
    } catch (error) {
      socket.emit('error', { message: 'Failed to reset game' });
      console.error('Reset game error:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    removeParticipant(socket.id);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    rooms: rooms.size,
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});

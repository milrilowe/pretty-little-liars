import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { initializeGameState } from './gameState';
import { loadGameState, saveGameState } from './persistence';
import { setupSocketHandlers } from './socketHandlers';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*', // Configure this properly in production
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Initialize game state
const existingState = loadGameState();
initializeGameState(existingState);

// Setup socket handlers
setupSocketHandlers(io);

// Periodic state save (backup)
setInterval(() => {
  try {
    const state = require('./gameState').getGameState();
    saveGameState(state);
  } catch (error) {
    // State not initialized yet
  }
}, 30000); // Save every 30 seconds

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🎮 Game show server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
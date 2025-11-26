import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './db/index';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.CLIENT_URL 
      : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Game state (in-memory for now)
interface Player {
  id: string;
  name: string;
  currentVote: 'truth' | 'lie' | null;
}

interface GameState {
  status: 'lobby' | 'prompt-active' | 'voting-closed' | 'answer-revealed';
  players: Player[];
  currentPrompt: {
    text: string;
    correctAnswer: 'truth' | 'lie';
    timeLimit: number;
  } | null;
  roundEndTime: number | null;
  votes: {
    truth: number;
    lie: number;
  };
}

let gameState: GameState = {
  status: 'lobby',
  players: [],
  currentPrompt: null,
  roundEndTime: null,
  votes: { truth: 0, lie: 0 },
};

// WebSocket handlers
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Send current game state to new connection
  socket.emit('game:state', gameState);

  socket.on('player:join', ({ name }: { name: string }) => {
    const player: Player = {
      id: socket.id,
      name,
      currentVote: null,
    };
    gameState.players.push(player);
    socket.emit('player:joined', { playerId: socket.id });
    io.emit('game:state', gameState);
  });

  socket.on('vote:submit', ({ vote }: { vote: 'truth' | 'lie' }) => {
    const player = gameState.players.find((p) => p.id === socket.id);
    if (player && gameState.status === 'prompt-active') {
      player.currentVote = vote;
      gameState.votes[vote]++;
      io.emit('game:state', gameState);
    }
  });

  socket.on('disconnect', () => {
    gameState.players = gameState.players.filter((p) => p.id !== socket.id);
    io.emit('game:state', gameState);
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
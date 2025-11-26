import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { GameState, Vote } from '../types/game';

const SOCKET_URL = 'http://localhost:3000';

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      reconnectAttempts.current = 0;
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    newSocket.on('reconnect_attempt', (attempt) => {
      reconnectAttempts.current = attempt;
      console.log(`Reconnection attempt ${attempt}/${maxReconnectAttempts}`);
    });

    newSocket.on('game:state', (state: GameState) => {
      console.log('Received game state:', state);
      setGameState(state);
    });

    newSocket.on('player:joined', (data: { playerId: string }) => {
      console.log('Player joined with ID:', data.playerId);
      setPlayerId(data.playerId);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const joinGame = useCallback((name: string) => {
    if (socket) {
      console.log('Joining game with name:', name);
      socket.emit('player:join', { name });
    }
  }, [socket]);

  const submitVote = useCallback((vote: Vote) => {
    if (socket && playerId) {
      console.log('Submitting vote:', vote);
      socket.emit('vote:submit', { vote });
    }
  }, [socket, playerId]);

  const getTimeRemaining = useCallback((): number => {
    if (!gameState?.roundEndTime) return 0;
    const remaining = Math.max(0, Math.floor((gameState.roundEndTime - Date.now()) / 1000));
    return remaining;
  }, [gameState]);

  return {
    socket,
    gameState,
    isConnected,
    playerId,
    joinGame,
    submitVote,
    getTimeRemaining,
  };
}
import type { GameState, Vote } from '@pretty-little-liars/types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3001';

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

    newSocket.on('state:update', (data: { gameState: GameState }) => {
      console.log('Received game state:', data.gameState);
      setGameState(data.gameState);

      // Extract our player ID from the game state if we just joined
      if (!playerId && data.gameState.players) {
        const playerEntry = Object.entries(data.gameState.players).find(
          ([id]) => id === newSocket.id
        );
        if (playerEntry) {
          console.log('Found our player ID:', playerEntry[0]);
          setPlayerId(playerEntry[0]);
        }
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const joinGame = useCallback(
    (name: string) => {
      if (socket) {
        console.log('Joining game with name:', name);
        socket.emit('player:join', { playerName: name });
      }
    },
    [socket]
  );

  const submitVote = useCallback(
    (vote: Vote) => {
      if (socket && playerId) {
        console.log('Submitting vote:', vote);
        socket.emit('vote:submit', { vote });
      }
    },
    [socket, playerId]
  );

  const getTimeRemaining = useCallback((): number => {
    // TODO: Implement timer when server adds roundEndTime to GameState
    return 0;
  }, []);

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

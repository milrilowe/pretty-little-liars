import { useEffect, useState } from 'react';
import './App.css';
import { GameScreen } from './components/GameScreen';
import { JoinScreen } from './components/JoinScreen';
import { useSocket } from './hooks/useSocket';

function App() {
  const { gameState, isConnected, playerId, joinGame, submitVote, getTimeRemaining } = useSocket();

  const [playerName, setPlayerName] = useState<string>('');
  const [hasJoined, setHasJoined] = useState(false);

  // Check if player is already in the game (reconnection scenario)
  useEffect(() => {
    if (playerId && gameState && gameState.players) {
      const player = gameState.players[playerId];
      if (player) {
        setPlayerName(player.name);
        setHasJoined(true);
      }
    }
  }, [playerId, gameState]);

  const handleJoin = (name: string) => {
    setPlayerName(name);
    joinGame(name);
    setHasJoined(true);
  };

  // Show join screen if not joined or no player ID yet
  if (!hasJoined || !playerId) {
    return <JoinScreen onJoin={handleJoin} isConnected={isConnected} />;
  }

  // Show game screen once joined
  if (gameState) {
    return (
      <GameScreen
        gameState={gameState}
        playerId={playerId}
        playerName={playerName}
        onVote={submitVote}
        getTimeRemaining={getTimeRemaining}
      />
    );
  }

  // Loading state
  return (
    <div className="loading-screen">
      <div className="loading-spinner"></div>
      <p>Loading game...</p>
    </div>
  );
}

export default App;

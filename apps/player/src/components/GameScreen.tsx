import { useState, useEffect } from 'react';
import type { GameState, Vote } from '../types/game';
import './GameScreen.css';

interface GameScreenProps {
  gameState: GameState;
  playerId: string;
  playerName: string;
  onVote: (vote: Vote) => void;
  getTimeRemaining: () => number;
}

export function GameScreen({
  gameState,
  playerId,
  playerName,
  onVote,
  getTimeRemaining,
}: GameScreenProps) {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);

  // Get current player's vote
  const currentPlayer = gameState.players.find(p => p.id === playerId);
  const currentVote = currentPlayer?.currentVote;

  useEffect(() => {
    if (gameState.status === 'prompt-active' && gameState.roundEndTime) {
      const interval = setInterval(() => {
        const remaining = getTimeRemaining();
        setTimeRemaining(remaining);
        
        if (remaining === 0) {
          clearInterval(interval);
        }
      }, 100);

      return () => clearInterval(interval);
    } else {
      setTimeRemaining(0);
    }
  }, [gameState.status, gameState.roundEndTime, getTimeRemaining]);

  // Reset hasVoted when new prompt starts
  useEffect(() => {
    if (gameState.status === 'prompt-active' && !currentVote) {
      setHasVoted(false);
    }
  }, [gameState.status, currentVote]);

  const handleVote = (vote: Vote) => {
    if (!hasVoted && timeRemaining > 0 && gameState.status === 'prompt-active') {
      onVote(vote);
      setHasVoted(true);
    }
  };

  const isVotingActive = gameState.status === 'prompt-active' && timeRemaining > 0;
  const isVotingClosed = gameState.status === 'voting-closed' || (gameState.status === 'prompt-active' && timeRemaining === 0);
  const isAnswerRevealed = gameState.status === 'answer-revealed';

  const getStatusMessage = () => {
    if (gameState.status === 'lobby') {
      return 'Waiting for game to start...';
    }
    if (isAnswerRevealed) {
      return `The answer was: ${gameState.currentPrompt?.correctAnswer?.toUpperCase()}!`;
    }
    if (isVotingClosed) {
      return 'Voting closed! Waiting for results...';
    }
    if (currentVote && isVotingActive) {
      return `You voted ${currentVote.toUpperCase()}`;
    }
    return 'Cast your vote!';
  };

  const getTimerColor = () => {
    if (timeRemaining > 5) return '#4caf50';
    if (timeRemaining > 2) return '#ff9800';
    return '#f44336';
  };

  return (
    <div className="game-screen">
      <div className="game-header">
        <div className="player-info">
          <span className="player-badge">🎮</span>
          <span className="player-name">{playerName}</span>
        </div>
        <div className="player-count">
          {gameState.players.length} player{gameState.players.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="game-content">
        <div className="status-banner" data-status={gameState.status}>
          {getStatusMessage()}
        </div>

        {gameState.currentPrompt && (
          <>
            <div className="prompt-container">
              <div className="prompt-label">Statement</div>
              <div className="prompt-text">{gameState.currentPrompt.text}</div>
            </div>

            {gameState.status === 'prompt-active' && (
              <div className="timer-container">
                <div className="timer-circle" style={{ borderColor: getTimerColor() }}>
                  <span className="timer-value" style={{ color: getTimerColor() }}>
                    {timeRemaining}
                  </span>
                </div>
                <div className="timer-label">seconds remaining</div>
              </div>
            )}

            <div className="voting-container">
              <button
                className={`vote-button vote-truth ${currentVote === 'truth' ? 'selected' : ''}`}
                onClick={() => handleVote('truth')}
                disabled={!isVotingActive || hasVoted}
              >
                <span className="vote-icon">✓</span>
                <span className="vote-label">TRUTH</span>
                {currentVote === 'truth' && <span className="vote-check">✓</span>}
              </button>

              <button
                className={`vote-button vote-lie ${currentVote === 'lie' ? 'selected' : ''}`}
                onClick={() => handleVote('lie')}
                disabled={!isVotingActive || hasVoted}
              >
                <span className="vote-icon">✗</span>
                <span className="vote-label">LIE</span>
                {currentVote === 'lie' && <span className="vote-check">✓</span>}
              </button>
            </div>

            {(isVotingClosed || isAnswerRevealed) && (
              <div className="vote-results">
                <div className="vote-result-item">
                  <span className="vote-result-label">Truth</span>
                  <span className="vote-result-count">{gameState.votes.truth}</span>
                </div>
                <div className="vote-result-item">
                  <span className="vote-result-label">Lie</span>
                  <span className="vote-result-count">{gameState.votes.lie}</span>
                </div>
              </div>
            )}
          </>
        )}

        {!gameState.currentPrompt && gameState.status === 'lobby' && (
          <div className="waiting-container">
            <div className="waiting-icon">⏳</div>
            <p>Get ready! The game will start soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}
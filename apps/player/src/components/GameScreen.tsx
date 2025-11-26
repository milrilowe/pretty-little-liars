import { useState, useEffect } from 'react';
import type { GameState, Vote } from '@pretty-little-liars/types';
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

  // Get current player's vote from the votes record
  const currentVote = gameState.votes[playerId];

  useEffect(() => {
    if (gameState.phase === 'story') {
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
  }, [gameState.phase, getTimeRemaining]);

  // Reset hasVoted when new story starts
  useEffect(() => {
    if (gameState.phase === 'story' && !currentVote) {
      setHasVoted(false);
    }
  }, [gameState.phase, currentVote]);

  const handleVote = (vote: Vote) => {
    if (!hasVoted && gameState.phase === 'story' && !gameState.votesLocked) {
      onVote(vote);
      setHasVoted(true);
    }
  };

  const currentStory = gameState.comedians[gameState.currentComedianIndex]?.stories[gameState.currentStoryIndex];
  const currentComedian = gameState.comedians[gameState.currentComedianIndex];

  const isVotingActive = gameState.phase === 'story' && !gameState.votesLocked;
  const isResultsPhase = gameState.phase === 'results';
  const isRevealPhase = gameState.phase === 'reveal';
  const isLeaderboardPhase = gameState.phase === 'leaderboard';

  const getStatusMessage = () => {
    if (gameState.mode === 'setup') {
      return 'Waiting for game to start...';
    }
    if (isLeaderboardPhase) {
      return 'Round Complete - Check the Leaderboard!';
    }
    if (isRevealPhase) {
      return currentStory ? `The story was ${currentStory.isTrue ? 'TRUE' : 'A LIE'}!` : 'Revealing answer...';
    }
    if (isResultsPhase) {
      return 'Voting closed! Tallying results...';
    }
    if (currentVote && isVotingActive) {
      return `You voted ${currentVote.toUpperCase()}`;
    }
    if (isVotingActive) {
      return 'Cast your vote!';
    }
    return 'Get ready for the next story...';
  };

  const getTimerColor = () => {
    if (timeRemaining > 5) return '#4caf50';
    if (timeRemaining > 2) return '#ff9800';
    return '#f44336';
  };

  // Calculate vote distribution
  const voteDistribution = {
    truth: Object.values(gameState.votes).filter(v => v === 'truth').length,
    lie: Object.values(gameState.votes).filter(v => v === 'lie').length,
  };

  return (
    <div className="game-screen">
      <div className="game-header">
        <div className="player-info">
          <span className="player-badge">🎮</span>
          <span className="player-name">{playerName}</span>
        </div>
        <div className="player-count">
          {Object.keys(gameState.players).length} player{Object.keys(gameState.players).length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="game-content">
        <div className="status-banner" data-status={gameState.phase}>
          {getStatusMessage()}
        </div>

        {currentStory && currentComedian && (
          <>
            <div className="prompt-container">
              <div className="prompt-label">{currentComedian.name}'s Story</div>
              <div className="prompt-text">{currentStory.text}</div>
            </div>

            {gameState.phase === 'story' && (
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

            {(isResultsPhase || isRevealPhase) && (
              <div className="vote-results">
                <div className="vote-result-item">
                  <span className="vote-result-label">Truth</span>
                  <span className="vote-result-count">{voteDistribution.truth}</span>
                </div>
                <div className="vote-result-item">
                  <span className="vote-result-label">Lie</span>
                  <span className="vote-result-count">{voteDistribution.lie}</span>
                </div>
              </div>
            )}
          </>
        )}

        {gameState.mode === 'setup' && (
          <div className="waiting-container">
            <div className="waiting-icon">⏳</div>
            <p>Get ready! The game will start soon...</p>
          </div>
        )}

        {isLeaderboardPhase && gameState.players && (
          <div className="waiting-container">
            <div className="waiting-icon">🏆</div>
            <p>Check out your score on the display screen!</p>
            <div className="player-score">
              Your Score: {gameState.players[playerId]?.totalScore || 0}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
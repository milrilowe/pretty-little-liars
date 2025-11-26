import { Vote, VoteDistribution, LeaderboardEntry } from '@pretty-little-liars/types';
import { getGameState } from './gameState';

export function calculateVoteDistribution(votes: Record<string, Vote>): VoteDistribution {
  const distribution = {
    truth: 0,
    lie: 0,
    total: 0,
  };
  
  for (const vote of Object.values(votes)) {
    if (vote === 'truth') {
      distribution.truth++;
    } else {
      distribution.lie++;
    }
    distribution.total++;
  }
  
  return distribution;
}

export function calculateScores(
  votes: Record<string, Vote>,
  correctAnswer: boolean
): Record<string, number> {
  const scores: Record<string, number> = {};
  
  if (Object.keys(votes).length === 0) {
    return scores;
  }
  
  // Count how many got it right
  let correctCount = 0;
  const totalVotes = Object.keys(votes).length;
  
  for (const vote of Object.values(votes)) {
    const wasCorrect = (vote === 'truth' && correctAnswer) || (vote === 'lie' && !correctAnswer);
    if (wasCorrect) {
      correctCount++;
    }
  }
  
  // Calculate difficulty multiplier (inverse of percent correct)
  const percentCorrect = correctCount / totalVotes;
  const basePoints = 1000;
  
  // If everyone gets it wrong, give 0 points
  if (correctCount === 0) {
    for (const playerId of Object.keys(votes)) {
      scores[playerId] = 0;
    }
    return scores;
  }
  
  // Award points based on difficulty (fewer correct = more points)
  const points = Math.round(basePoints * (1 - percentCorrect));
  
  // Award to correct players only
  for (const [playerId, vote] of Object.entries(votes)) {
    const wasCorrect = (vote === 'truth' && correctAnswer) || (vote === 'lie' && !correctAnswer);
    scores[playerId] = wasCorrect ? points : 0;
  }
  
  return scores;
}

export function applyScoresToPlayers(roundScores: Record<string, number>): void {
  const gameState = getGameState();
  
  for (const [playerId, points] of Object.entries(roundScores)) {
    if (gameState.players[playerId]) {
      gameState.players[playerId].totalScore += points;
    }
  }
  
  gameState.roundScores = roundScores;
}

export function getLeaderboard(limit: number = 5): LeaderboardEntry[] {
  const gameState = getGameState();
  
  const entries: LeaderboardEntry[] = Object.values(gameState.players)
    .map(player => ({
      playerId: player.id,
      playerName: player.name,
      totalScore: player.totalScore,
      rank: 0, // Will be set after sorting
    }))
    .sort((a, b) => b.totalScore - a.totalScore);
  
  // Assign ranks
  entries.forEach((entry, index) => {
    entry.rank = index + 1;
  });
  
  return entries.slice(0, limit);
}

export function getPlayerRank(playerId: string): { rank: number; total: number } {
  const gameState = getGameState();
  
  const sortedPlayers = Object.values(gameState.players)
    .sort((a, b) => b.totalScore - a.totalScore);
  
  const rank = sortedPlayers.findIndex(p => p.id === playerId) + 1;
  
  return {
    rank,
    total: sortedPlayers.length,
  };
}
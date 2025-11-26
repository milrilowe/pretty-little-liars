import { v4 as uuidv4 } from 'uuid';
import { Comedian, GameState, Player } from '@pretty-little-liars/types';

let gameState: GameState | null = null;

export function createNewGameState(): GameState {
  return {
    sessionId: uuidv4(),
    mode: 'setup',
    comedians: [],
    currentComedianIndex: 0,
    currentStoryIndex: 0,
    phase: 'story',
    players: {},
    votes: {},
    votesLocked: false,
    roundScores: {},
  };
}

export function initializeGameState(state?: GameState): void {
  gameState = state || createNewGameState();
}

export function getGameState(): GameState {
  if (!gameState) {
    throw new Error('Game state not initialized');
  }
  return gameState;
}

export function updateGameState(updates: Partial<GameState>): GameState {
  if (!gameState) {
    throw new Error('Game state not initialized');
  }
  gameState = { ...gameState, ...updates };
  return gameState;
}

export function addPlayer(playerId: string, playerName: string): Player {
  if (!gameState) {
    throw new Error('Game state not initialized');
  }
  
  const player: Player = {
    id: playerId,
    name: playerName,
    connected: true,
    totalScore: 0,
  };
  
  gameState.players[playerId] = player;
  return player;
}

export function removePlayer(playerId: string): void {
  if (!gameState) {
    throw new Error('Game state not initialized');
  }
  delete gameState.players[playerId];
}

export function updatePlayerConnection(playerId: string, connected: boolean): void {
  if (!gameState?.players[playerId]) {
    return;
  }
  gameState.players[playerId].connected = connected;
}

export function submitVote(playerId: string, vote: 'truth' | 'lie'): void {
  if (!gameState) {
    throw new Error('Game state not initialized');
  }
  
  if (gameState.votesLocked) {
    throw new Error('Votes are locked');
  }
  
  gameState.votes[playerId] = vote;
}

export function getCurrentStory() {
  if (!gameState) {
    throw new Error('Game state not initialized');
  }
  
  const comedian = gameState.comedians[gameState.currentComedianIndex];
  if (!comedian) return null;
  
  const story = comedian.stories[gameState.currentStoryIndex];
  return story || null;
}

export function getCurrentComedian() {
  if (!gameState) {
    throw new Error('Game state not initialized');
  }
  
  return gameState.comedians[gameState.currentComedianIndex] || null;
}

export function addComedian(comedian: Omit<Comedian, 'id'>): Comedian {
  if (!gameState) {
    throw new Error('Game state not initialized');
  }
  
  const newComedian: Comedian = {
    ...comedian,
    id: uuidv4(),
  };
  
  gameState.comedians.push(newComedian);
  return newComedian;
}

export function updateComedian(comedianId: string, updates: Partial<Omit<Comedian, 'id'>>): void {
  if (!gameState) {
    throw new Error('Game state not initialized');
  }
  
  const index = gameState.comedians.findIndex(c => c.id === comedianId);
  if (index === -1) {
    throw new Error('Comedian not found');
  }
  
  gameState.comedians[index] = {
    ...gameState.comedians[index],
    ...updates,
  };
}

export function addStory(comedianId: string, text: string, isTrue: boolean): void {
  if (!gameState) {
    throw new Error('Game state not initialized');
  }
  
  const comedian = gameState.comedians.find(c => c.id === comedianId);
  if (!comedian) {
    throw new Error('Comedian not found');
  }
  
  comedian.stories.push({
    id: uuidv4(),
    text,
    isTrue,
  });
}

export function updateStory(storyId: string, text: string, isTrue: boolean): void {
  if (!gameState) {
    throw new Error('Game state not initialized');
  }
  
  for (const comedian of gameState.comedians) {
    const story = comedian.stories.find(s => s.id === storyId);
    if (story) {
      story.text = text;
      story.isTrue = isTrue;
      return;
    }
  }
  
  throw new Error('Story not found');
}

export function deleteStory(storyId: string): void {
  if (!gameState) {
    throw new Error('Game state not initialized');
  }
  
  for (const comedian of gameState.comedians) {
    const index = comedian.stories.findIndex(s => s.id === storyId);
    if (index !== -1) {
      comedian.stories.splice(index, 1);
      return;
    }
  }
  
  throw new Error('Story not found');
}

export function resetVotes(): void {
  if (!gameState) {
    throw new Error('Game state not initialized');
  }
  
  gameState.votes = {};
  gameState.votesLocked = false;
  gameState.roundScores = {};
}

export function nextSlide(): boolean {
  if (!gameState) {
    throw new Error('Game state not initialized');
  }
  
  const comedian = gameState.comedians[gameState.currentComedianIndex];
  if (!comedian) return false;
  
  // Move to next story
  if (gameState.currentStoryIndex < comedian.stories.length - 1) {
    gameState.currentStoryIndex++;
    gameState.phase = 'story';
    resetVotes();
    return true;
  }
  
  // Move to next comedian
  if (gameState.currentComedianIndex < gameState.comedians.length - 1) {
    gameState.currentComedianIndex++;
    gameState.currentStoryIndex = 0;
    gameState.phase = 'leaderboard';
    resetVotes();
    return true;
  }
  
  // Game over
  return false;
}

export function jumpToSlide(comedianIndex: number, storyIndex: number): void {
  if (!gameState) {
    throw new Error('Game state not initialized');
  }
  
  if (comedianIndex < 0 || comedianIndex >= gameState.comedians.length) {
    throw new Error('Invalid comedian index');
  }
  
  const comedian = gameState.comedians[comedianIndex];
  if (storyIndex < 0 || storyIndex >= comedian.stories.length) {
    throw new Error('Invalid story index');
  }
  
  gameState.currentComedianIndex = comedianIndex;
  gameState.currentStoryIndex = storyIndex;
  gameState.phase = 'story';
  resetVotes();
}
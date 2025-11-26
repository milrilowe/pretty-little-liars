// Game modes and phases
export type GameMode = 'setup' | 'live' | 'paused';
export type GamePhase = 'story' | 'results' | 'reveal' | 'leaderboard';
export type Vote = 'truth' | 'lie';
export type ClientRole = 'manager' | 'display' | 'player';

// Story and Comedian
export interface Story {
  id: string;
  text: string;
  isTrue: boolean;
}

export interface Comedian {
  id: string;
  name: string;
  instagram: string;
  photoUrl?: string;
  stories: Story[];
}

// Player
export interface Player {
  id: string;
  name: string;
  connected: boolean;
  totalScore: number;
}

// Game State
export interface GameState {
  sessionId: string;
  mode: GameMode;

  // Game setup
  comedians: Comedian[];

  // Live game state
  currentComedianIndex: number;
  currentStoryIndex: number;
  phase: GamePhase;

  // Players
  players: Record<string, Player>;

  // Current round
  votes: Record<string, Vote>;
  votesLocked: boolean;
  roundScores: Record<string, number>;
}

// Vote Distribution
export interface VoteDistribution {
  truth: number;
  lie: number;
  total: number;
}

// Leaderboard
export interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  totalScore: number;
  rank: number;
}

// Socket Event Payloads
export interface ManagerConnectPayload {
  role: 'manager';
}

export interface DisplayConnectPayload {
  role: 'display';
  sessionId: string;
}

export interface PlayerJoinPayload {
  role: 'player';
  sessionId: string;
  playerName: string;
}

export interface GameSetupPayload {
  comedians: Comedian[];
}

export interface SlideJumpPayload {
  comedianIndex: number;
  storyIndex: number;
}

export interface StoryEditPayload {
  storyId: string;
  text: string;
  isTrue: boolean;
}

export interface ComedianEditPayload {
  comedianId: string;
  name: string;
  instagram: string;
  photoUrl?: string;
}

export interface StoryAddPayload {
  comedianId: string;
  text: string;
  isTrue: boolean;
}

export interface StoryDeletePayload {
  storyId: string;
}

export interface VoteSubmitPayload {
  vote: Vote;
}

export interface StateUpdatePayload {
  gameState: GameState;
}

export interface VotesLockedPayload {
  distribution: VoteDistribution;
}

export interface RevealAnswerPayload {
  isTrue: boolean;
  pointsAwarded: Record<string, number>;
}

export interface LeaderboardShowPayload {
  topPlayers: LeaderboardEntry[];
}

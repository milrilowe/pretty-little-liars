export type GameStatus = 'lobby' | 'prompt-active' | 'voting-closed' | 'answer-revealed';

export type Vote = 'truth' | 'lie';

export interface Player {
  id: string;
  name: string;
  currentVote: Vote | null;
}

export interface Prompt {
  text: string;
  correctAnswer: Vote;
  timeLimit: number;
}

export interface GameState {
  status: GameStatus;
  players: Player[];
  currentPrompt: Prompt | null;
  roundEndTime: number | null;
  votes: {
    truth: number;
    lie: number;
  };
}
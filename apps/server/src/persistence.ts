import fs from 'fs';
import path from 'path';
import { GameState } from '@pretty-little-liars/types';

const STATE_FILE = path.join(__dirname, '../game-state.json');

export function saveGameState(state: GameState): void {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
    console.log('Game state saved successfully');
  } catch (error) {
    console.error('Error saving game state:', error);
  }
}

export function loadGameState(): GameState | undefined {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const data = fs.readFileSync(STATE_FILE, 'utf-8');
      const state = JSON.parse(data) as GameState;
      console.log('Game state loaded successfully');
      return state;
    }
  } catch (error) {
    console.error('Error loading game state:', error);
  }
  
  return undefined;
}

export function deleteGameState(): void {
  try {
    if (fs.existsSync(STATE_FILE)) {
      fs.unlinkSync(STATE_FILE);
      console.log('Game state deleted successfully');
    }
  } catch (error) {
    console.error('Error deleting game state:', error);
  }
}
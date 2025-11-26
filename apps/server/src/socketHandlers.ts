import { Server, Socket } from 'socket.io';
import {
  getGameState,
  updateGameState,
  addPlayer,
  updatePlayerConnection,
  submitVote,
  getCurrentStory,
  getCurrentComedian,
  updateComedian,
  addStory,
  updateStory,
  deleteStory,
  nextSlide,
  jumpToSlide,
  resetVotes,
  initializeGameState,
} from './gameState';
import {
  calculateVoteDistribution,
  calculateScores,
  applyScoresToPlayers,
  getLeaderboard,
  getPlayerRank,
} from './scoring';
import { saveGameState } from './persistence';
import {
  PlayerJoinPayload,
  GameSetupPayload,
  VoteSubmitPayload,
  SlideJumpPayload,
  StoryEditPayload,
  ComedianEditPayload,
  StoryAddPayload,
  StoryDeletePayload,
} from '@pretty-little-liars/types';

let managerSocket: Socket | null = null;
let displaySocket: Socket | null = null;
const playerSockets = new Map<string, Socket>();

export function setupSocketHandlers(io: Server): void {
  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);
    
    // Manager connection
    socket.on('manager:connect', () => {
      console.log('Manager connected');
      managerSocket = socket;
      socket.emit('state:update', { gameState: getGameState() });
    });
    
    // Display connection
    socket.on('display:connect', () => {
      console.log('Display connected');
      displaySocket = socket;
      socket.emit('state:update', { gameState: getGameState() });
    });
    
    // Player connection
    socket.on('player:join', (payload: PlayerJoinPayload) => {
      console.log('Player joining:', payload.playerName);
      
      try {
        const player = addPlayer(socket.id, payload.playerName);
        playerSockets.set(socket.id, socket);
        
        // Send state to new player
        socket.emit('state:update', { gameState: getGameState() });
        
        // Notify everyone
        broadcastStateUpdate(io);
        
        console.log('Player joined:', player.name);
      } catch (error) {
        console.error('Error adding player:', error);
        socket.emit('error', { message: 'Failed to join game' });
      }
    });
    
    // Game setup
    socket.on('game:setup', (payload: GameSetupPayload) => {
      console.log('Setting up game with', payload.comedians.length, 'comedians');
      
      try {
        updateGameState({ comedians: payload.comedians });
        saveGameState(getGameState());
        broadcastStateUpdate(io);
      } catch (error) {
        console.error('Error setting up game:', error);
      }
    });
    
    // Game control
    socket.on('game:start', () => {
      console.log('Starting game');
      
      try {
        updateGameState({ mode: 'live', phase: 'story' });
        saveGameState(getGameState());
        broadcastStateUpdate(io);
      } catch (error) {
        console.error('Error starting game:', error);
      }
    });
    
    socket.on('game:pause', () => {
      console.log('Pausing game');
      updateGameState({ mode: 'paused' });
      broadcastStateUpdate(io);
    });
    
    socket.on('game:resume', () => {
      console.log('Resuming game');
      updateGameState({ mode: 'live' });
      broadcastStateUpdate(io);
    });
    
    // Slide navigation
    socket.on('slide:next', () => {
      console.log('Next slide');
      
      try {
        const hasNext = nextSlide();
        if (hasNext) {
          saveGameState(getGameState());
          broadcastStateUpdate(io);
        } else {
          console.log('No more slides - game ended');
          updateGameState({ mode: 'setup', phase: 'story' });
          broadcastStateUpdate(io);
        }
      } catch (error) {
        console.error('Error advancing slide:', error);
      }
    });
    
    socket.on('slide:jump', (payload: SlideJumpPayload) => {
      console.log('Jumping to slide:', payload);
      
      try {
        jumpToSlide(payload.comedianIndex, payload.storyIndex);
        saveGameState(getGameState());
        broadcastStateUpdate(io);
      } catch (error) {
        console.error('Error jumping to slide:', error);
        socket.emit('error', { message: 'Invalid slide position' });
      }
    });
    
    // Phase advancement
    socket.on('phase:advance', () => {
      const state = getGameState();
      console.log('Advancing phase from:', state.phase);
      
      try {
        if (state.phase === 'story') {
          // Lock votes and show results
          updateGameState({ votesLocked: true, phase: 'results' });
          const distribution = calculateVoteDistribution(state.votes);
          io.emit('votes:locked', { distribution });
          
        } else if (state.phase === 'results') {
          // Reveal answer and calculate scores
          const story = getCurrentStory();
          if (story) {
            const roundScores = calculateScores(state.votes, story.isTrue);
            applyScoresToPlayers(roundScores);
            updateGameState({ phase: 'reveal' });
            
            io.emit('reveal:answer', {
              isTrue: story.isTrue,
              pointsAwarded: roundScores,
            });
          }
          
        } else if (state.phase === 'reveal') {
          // Show leaderboard
          updateGameState({ phase: 'leaderboard' });
          const leaderboard = getLeaderboard(5);
          io.emit('leaderboard:show', { topPlayers: leaderboard });
        }
        
        saveGameState(getGameState());
        broadcastStateUpdate(io);
      } catch (error) {
        console.error('Error advancing phase:', error);
      }
    });
    
    // Editing
    socket.on('comedian:edit', (payload: ComedianEditPayload) => {
      console.log('Editing comedian:', payload.comedianId);
      
      try {
        updateComedian(payload.comedianId, {
          name: payload.name,
          instagram: payload.instagram,
          photoUrl: payload.photoUrl,
        });
        saveGameState(getGameState());
        broadcastStateUpdate(io);
      } catch (error) {
        console.error('Error editing comedian:', error);
      }
    });
    
    socket.on('story:edit', (payload: StoryEditPayload) => {
      console.log('Editing story:', payload.storyId);
      
      try {
        updateStory(payload.storyId, payload.text, payload.isTrue);
        saveGameState(getGameState());
        broadcastStateUpdate(io);
      } catch (error) {
        console.error('Error editing story:', error);
      }
    });
    
    socket.on('story:add', (payload: StoryAddPayload) => {
      console.log('Adding story to comedian:', payload.comedianId);
      
      try {
        addStory(payload.comedianId, payload.text, payload.isTrue);
        saveGameState(getGameState());
        broadcastStateUpdate(io);
      } catch (error) {
        console.error('Error adding story:', error);
      }
    });
    
    socket.on('story:delete', (payload: StoryDeletePayload) => {
      console.log('Deleting story:', payload.storyId);
      
      try {
        deleteStory(payload.storyId);
        saveGameState(getGameState());
        broadcastStateUpdate(io);
      } catch (error) {
        console.error('Error deleting story:', error);
      }
    });
    
    // Voting
    socket.on('vote:submit', (payload: VoteSubmitPayload) => {
      console.log('Vote submitted:', socket.id, payload.vote);
      
      try {
        submitVote(socket.id, payload.vote);
        // Don't broadcast full state, just acknowledge
        socket.emit('vote:acknowledged');
        
        // Update manager with vote count
        if (managerSocket) {
          const state = getGameState();
          const voteCount = Object.keys(state.votes).length;
          const totalPlayers = Object.keys(state.players).length;
          managerSocket.emit('vote:count', { voteCount, totalPlayers });
        }
      } catch (error) {
        console.error('Error submitting vote:', error);
        socket.emit('error', { message: 'Failed to submit vote' });
      }
    });
    
    // Disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
      if (socket === managerSocket) {
        managerSocket = null;
      } else if (socket === displaySocket) {
        displaySocket = null;
      } else if (playerSockets.has(socket.id)) {
        playerSockets.delete(socket.id);
        updatePlayerConnection(socket.id, false);
        broadcastStateUpdate(io);
      }
    });
  });
}

function broadcastStateUpdate(io: Server): void {
  const state = getGameState();
  io.emit('state:update', { gameState: state });
}
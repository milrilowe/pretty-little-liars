# Gameshow Server

WebSocket server for the Truth/Lie comedy gameshow.

## Setup

```bash
npm install
npm run dev
```

## Architecture

- **Express** - HTTP server
- **Socket.io** - WebSocket communication
- **TypeScript** - Type safety
- **File-based persistence** - Game state saved to `game-state.json`

## Socket Events

### Manager → Server
- `manager:connect` - Connect as manager
- `game:setup` - Save game configuration
- `game:start` - Start live game
- `game:pause` / `game:resume` - Pause/resume game
- `slide:next` - Advance to next slide
- `slide:jump` - Jump to specific slide
- `phase:advance` - Move to next phase (story → results → reveal → leaderboard)
- `comedian:edit` - Update comedian info
- `story:edit` - Update story
- `story:add` - Add new story
- `story:delete` - Delete story

### Display → Server
- `display:connect` - Connect as display

### Player → Server
- `player:join` - Join game with name
- `vote:submit` - Submit truth/lie vote

### Server → All Clients
- `state:update` - Full game state sync
- `votes:locked` - Voting ended, show distribution
- `reveal:answer` - Show correct answer and scores
- `leaderboard:show` - Display top players
- `vote:count` - Current vote count (manager only)

## Game State Structure

```typescript
{
  sessionId: string,
  mode: 'setup' | 'live' | 'paused',
  comedians: [...],
  currentComedianIndex: number,
  currentStoryIndex: number,
  phase: 'story' | 'results' | 'reveal' | 'leaderboard',
  players: {...},
  votes: {...},
  votesLocked: boolean,
  roundScores: {...}
}
```

## Scoring

Points are awarded based on difficulty (inverse of percentage correct):
- If only 10% got it right: ~900 points
- If 50% got it right: 500 points
- If everyone got it right: ~100 points
- If everyone got it wrong: 0 points

## Development

```bash
npm run dev     # Development with hot reload
npm run build   # Build for production
npm start       # Run production build
```

## Port

Default: `3001` (configurable via `PORT` env variable)
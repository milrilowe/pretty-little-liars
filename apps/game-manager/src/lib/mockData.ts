import type { Comedian, GameState } from '@pretty-little-liars/types'

export const mockComedians: Comedian[] = [
  {
    id: 'comedian-1',
    name: 'Sarah Johnson',
    instagram: '@sarahjcomedy',
    photoUrl: 'https://via.placeholder.com/150',
    stories: [
      {
        id: 'story-1-1',
        text: 'I once accidentally joined a flash mob thinking it was a protest',
        isTrue: true,
      },
      {
        id: 'story-1-2',
        text: 'I got stuck in an elevator with my ex for 3 hours',
        isTrue: false,
      },
      {
        id: 'story-1-3',
        text: 'I accidentally dyed my hair green the day before my wedding',
        isTrue: true,
      },
    ],
  },
  {
    id: 'comedian-2',
    name: 'Mike Chen',
    instagram: '@mikechen',
    photoUrl: 'https://via.placeholder.com/150',
    stories: [
      {
        id: 'story-2-1',
        text: 'I once ate 50 chicken nuggets on a dare',
        isTrue: false,
      },
      {
        id: 'story-2-2',
        text: 'My dog stole my lunch and brought it to a neighbor',
        isTrue: true,
      },
    ],
  },
]

export const mockGameState: GameState = {
  sessionId: 'mock-session',
  mode: 'setup',
  comedians: mockComedians,
  currentComedianIndex: 0,
  currentStoryIndex: 0,
  phase: 'story',
  players: {},
  votes: {},
  votesLocked: false,
  roundScores: {},
}

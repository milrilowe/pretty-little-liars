import { useEffect, useState, useCallback, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import type {
  GameState,
  Comedian,
  Story,
  ComedianEditPayload,
  StoryEditPayload,
  StoryAddPayload,
  StoryDeletePayload,
} from '@pretty-little-liars/types'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected'

export function useGameSocket() {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>('disconnected')
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    console.log('Connecting to server:', SOCKET_URL)
    setConnectionStatus('connecting')

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socketRef.current = socket

    // Connection events
    socket.on('connect', () => {
      console.log('Connected to server')
      setConnectionStatus('connected')
      // Identify as manager
      socket.emit('manager:connect')
    })

    socket.on('disconnect', () => {
      console.log('Disconnected from server')
      setConnectionStatus('disconnected')
    })

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error)
      setConnectionStatus('disconnected')
    })

    // Game state updates
    socket.on('state:update', (payload: { gameState: GameState }) => {
      console.log('State update received:', payload.gameState.phase)
      setGameState(payload.gameState)
    })

    // Vote count updates
    socket.on(
      'vote:count',
      (payload: { voteCount: number; totalPlayers: number }) => {
        console.log('Vote count:', payload)
        // Update vote count in real-time if needed
      },
    )

    return () => {
      console.log('Cleaning up socket connection')
      socket.disconnect()
    }
  }, [])

  // Game control actions
  const startGame = useCallback(() => {
    if (socketRef.current?.connected) {
      console.log('Starting game')
      socketRef.current.emit('game:start')
    }
  }, [])

  const advancePhase = useCallback(() => {
    if (socketRef.current?.connected) {
      console.log('Advancing phase')
      socketRef.current.emit('phase:advance')
    }
  }, [])

  const nextSlide = useCallback(() => {
    if (socketRef.current?.connected) {
      console.log('Next slide')
      socketRef.current.emit('slide:next')
    }
  }, [])

  // Comedian management
  const updateComedian = useCallback(
    (comedianId: string, updates: Partial<Comedian>) => {
      if (socketRef.current?.connected) {
        const payload: ComedianEditPayload = {
          comedianId,
          name: updates.name!,
          instagram: updates.instagram!,
          photoUrl: updates.photoUrl,
        }
        socketRef.current.emit('comedian:edit', payload)
      }
    },
    [],
  )

  const deleteComedian = useCallback((comedianId: string) => {
    if (socketRef.current?.connected && gameState) {
      // Delete all stories first
      const comedian = gameState.comedians.find((c) => c.id === comedianId)
      if (comedian) {
        comedian.stories.forEach((story) => {
          socketRef.current!.emit('story:delete', { storyId: story.id })
        })
      }
      // Then update comedians without this one
      const updatedComedians = gameState.comedians.filter(
        (c) => c.id !== comedianId,
      )
      socketRef.current.emit('game:setup', { comedians: updatedComedians })
    }
  }, [gameState])

  const addComedian = useCallback((comedian: Comedian) => {
    if (socketRef.current?.connected && gameState) {
      const updatedComedians = [...gameState.comedians, comedian]
      socketRef.current.emit('game:setup', { comedians: updatedComedians })
    }
  }, [gameState])

  // Story management
  const updateStory = useCallback((storyId: string, updates: Partial<Story>) => {
    if (socketRef.current?.connected && gameState) {
      // Find the story to get its current values
      let currentStory: Story | undefined
      for (const comedian of gameState.comedians) {
        const story = comedian.stories.find((s) => s.id === storyId)
        if (story) {
          currentStory = story
          break
        }
      }

      if (currentStory) {
        const payload: StoryEditPayload = {
          storyId,
          text: updates.text ?? currentStory.text,
          isTrue: updates.isTrue ?? currentStory.isTrue,
        }
        socketRef.current.emit('story:edit', payload)
      }
    }
  }, [gameState])

  const addStory = useCallback((comedianId: string, story: Story) => {
    if (socketRef.current?.connected) {
      const payload: StoryAddPayload = {
        comedianId,
        text: story.text,
        isTrue: story.isTrue,
      }
      socketRef.current.emit('story:add', payload)
    }
  }, [])

  const deleteStory = useCallback((storyId: string) => {
    if (socketRef.current?.connected) {
      const payload: StoryDeletePayload = { storyId }
      socketRef.current.emit('story:delete', payload)
    }
  }, [])

  const moveStory = useCallback((storyId: string, direction: 'up' | 'down') => {
    if (socketRef.current?.connected && gameState) {
      // Find the comedian and story
      for (const comedian of gameState.comedians) {
        const storyIndex = comedian.stories.findIndex((s) => s.id === storyId)
        if (storyIndex !== -1) {
          const newStories = [...comedian.stories]
          const targetIndex =
            direction === 'up' ? storyIndex - 1 : storyIndex + 1

          if (targetIndex >= 0 && targetIndex < newStories.length) {
            // Swap stories
            ;[newStories[storyIndex], newStories[targetIndex]] = [
              newStories[targetIndex],
              newStories[storyIndex],
            ]

            // Update the comedian with new story order
            const updatedComedian = { ...comedian, stories: newStories }
            const updatedComedians = gameState.comedians.map((c) =>
              c.id === comedian.id ? updatedComedian : c,
            )

            socketRef.current.emit('game:setup', { comedians: updatedComedians })
          }
          break
        }
      }
    }
  }, [gameState])

  return {
    gameState,
    connectionStatus,
    isConnected: connectionStatus === 'connected',
    startGame,
    advancePhase,
    nextSlide,
    updateComedian,
    deleteComedian,
    addComedian,
    updateStory,
    addStory,
    deleteStory,
    moveStory,
  }
}

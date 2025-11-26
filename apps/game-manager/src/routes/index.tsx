import { createFileRoute } from '@tanstack/react-router'
import React from 'react'
import CreatorMode from '../components/CreatorMode'
import DirectorMode from '../components/DirectorMode'
import ConnectionStatus from '../components/ConnectionStatus'
import { useGameSocket } from '../hooks/useGameSocket'
import type { Comedian } from '@pretty-little-liars/types'

export const Route = createFileRoute('/')({
  component: GameManager,
})

function GameManager() {
  const {
    gameState,
    connectionStatus,
    startGame,
    advancePhase,
    nextSlide,
    updateComedian,
    deleteComedian,
    addComedian,
    updateStory,
    addStory,
    deleteStory,
  } = useGameSocket()

  const [mode, setMode] = React.useState<'creator' | 'director'>('creator')

  const handleEnterDirectorMode = () => {
    setMode('director')
  }

  const handleExitDirectorMode = () => {
    setMode('creator')
  }

  const handleAdvanceGame = () => {
    if (!gameState) return

    // Start game
    if (gameState.mode === 'setup') {
      startGame()
      return
    }

    const currentComedian = gameState.comedians[gameState.currentComedianIndex]
    const isLastStory =
      gameState.currentStoryIndex === currentComedian.stories.length - 1
    const isLastComedian =
      gameState.currentComedianIndex === gameState.comedians.length - 1

    // Advance through phases
    switch (gameState.phase) {
      case 'story':
        if (!gameState.votesLocked) {
          // Lock votes (this triggers phase:advance on server which moves to results)
          advancePhase()
        } else {
          // Move to reveal
          advancePhase()
        }
        break

      case 'results':
        // Move to reveal (shows answer and scores)
        advancePhase()
        break

      case 'reveal':
        // Show leaderboard
        advancePhase()
        break

      case 'leaderboard':
        // Move to next slide or end
        if (isLastStory && isLastComedian) {
          // Game over - this will reset to setup
          nextSlide()
        } else {
          nextSlide()
        }
        break
    }
  }

  const handleUpdateComedians = (comedians: Comedian[]) => {
    if (!gameState) return

    // Find differences and apply individual updates
    const oldComedians = gameState.comedians

    // Check for deleted comedians
    oldComedians.forEach((oldComedian) => {
      if (!comedians.find((c) => c.id === oldComedian.id)) {
        deleteComedian(oldComedian.id)
      }
    })

    // Check for new or updated comedians
    comedians.forEach((comedian) => {
      const oldComedian = oldComedians.find((c) => c.id === comedian.id)

      if (!oldComedian) {
        // New comedian
        addComedian(comedian)
      } else {
        // Check for updates
        if (
          oldComedian.name !== comedian.name ||
          oldComedian.instagram !== comedian.instagram ||
          oldComedian.photoUrl !== comedian.photoUrl
        ) {
          updateComedian(comedian.id, {
            name: comedian.name,
            instagram: comedian.instagram,
            photoUrl: comedian.photoUrl,
          })
        }

        // Check for story changes
        oldComedian.stories.forEach((oldStory) => {
          if (!comedian.stories.find((s) => s.id === oldStory.id)) {
            deleteStory(oldStory.id)
          }
        })

        comedian.stories.forEach((story) => {
          const oldStory = oldComedian.stories.find((s) => s.id === story.id)

          if (!oldStory) {
            // New story
            addStory(comedian.id, story)
          } else {
            // Check for updates
            if (
              oldStory.text !== story.text ||
              oldStory.isTrue !== story.isTrue
            ) {
              updateStory(story.id, {
                text: story.text,
                isTrue: story.isTrue,
              })
            }
          }
        })
      }
    })
  }

  // Show loading state while connecting
  if (!gameState) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
          <p className="text-lg text-muted-foreground">
            Connecting to server...
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Status: {connectionStatus}
          </p>
        </div>
      </div>
    )
  }

  // Calculate locked indices based on game state
  const lockedComedianIndex =
    gameState.mode === 'setup' ? -1 : gameState.currentComedianIndex
  const lockedStoryIndex =
    gameState.mode === 'setup' ? -1 : gameState.currentStoryIndex

  if (mode === 'director') {
    return (
      <>
        <ConnectionStatus status={connectionStatus} />
        <DirectorMode
          gameState={gameState}
          onAdvanceGame={handleAdvanceGame}
          onExitDirectorMode={handleExitDirectorMode}
        />
      </>
    )
  }

  return (
    <>
      <ConnectionStatus status={connectionStatus} />
      <CreatorMode
        comedians={gameState.comedians}
        onUpdateComedians={handleUpdateComedians}
        lockedComedianIndex={lockedComedianIndex}
        lockedStoryIndex={lockedStoryIndex}
        onEnterDirectorMode={handleEnterDirectorMode}
      />
    </>
  )
}

import React from 'react'
import { Play, Eye, Users, X } from 'lucide-react'
import type { GameState, GamePhase, Comedian } from '@pretty-little-liars/types'

interface DirectorModeProps {
  gameState: GameState
  onAdvanceGame: () => void
  onExitDirectorMode: () => void
}

export default function DirectorMode({
  gameState,
  onAdvanceGame,
  onExitDirectorMode,
}: DirectorModeProps) {
  const currentComedian = gameState.comedians[gameState.currentComedianIndex]
  const currentStory = currentComedian?.stories[gameState.currentStoryIndex]
  const playerCount = Object.keys(gameState.players).length
  const voteCount = Object.keys(gameState.votes).length

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <div className="bg-card border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-card-foreground">
            Director Mode
          </h1>
          <Breadcrumb
            comedian={currentComedian}
            storyIndex={gameState.currentStoryIndex}
            phase={gameState.phase}
          />
        </div>
        <button
          onClick={onExitDirectorMode}
          className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:opacity-90 transition-opacity"
        >
          <X size={16} />
          Exit
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Preview Panel */}
        <div className="flex-1 bg-card border border-border rounded-lg overflow-hidden flex flex-col">
          <div className="p-3 border-b border-border bg-muted flex items-center gap-2">
            <Eye size={16} className="text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              Display Preview
            </span>
          </div>
          <div className="flex-1 p-8 overflow-y-auto">
            <DisplayPreview
              comedian={currentComedian}
              story={currentStory}
              phase={gameState.phase}
              mode={gameState.mode}
            />
          </div>
        </div>

        {/* Control Panel */}
        <div className="w-96 flex flex-col gap-4">
          {/* Stats */}
          <div className="bg-card border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-card-foreground">
              <Users size={16} />
              <span className="font-medium">Players: {playerCount}</span>
            </div>
            {gameState.phase === 'story' && !gameState.votesLocked && (
              <div className="text-sm text-muted-foreground">
                Votes received: {voteCount} / {playerCount}
              </div>
            )}
            {gameState.votesLocked && (
              <VoteDistribution votes={gameState.votes} />
            )}
          </div>

          {/* Action Button */}
          <div className="flex-1 flex items-center justify-center">
            <ActionButton
              gameState={gameState}
              onAdvance={onAdvanceGame}
              currentComedian={currentComedian}
              currentStory={currentStory}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

interface BreadcrumbProps {
  comedian: Comedian | undefined
  storyIndex: number
  phase: GamePhase
}

function Breadcrumb({ comedian, storyIndex, phase }: BreadcrumbProps) {
  if (!comedian) {
    return (
      <div className="text-sm text-muted-foreground">
        Ready to start
      </div>
    )
  }

  const phaseLabel = {
    story: 'Voting',
    reveal: 'Reveal',
    results: 'Results',
    leaderboard: 'Leaderboard',
  }[phase]

  return (
    <div className="text-sm text-muted-foreground flex items-center gap-2">
      <span>{comedian.name}</span>
      <span>›</span>
      <span>Story {storyIndex + 1}</span>
      <span>›</span>
      <span className="text-foreground font-medium">{phaseLabel}</span>
    </div>
  )
}

interface DisplayPreviewProps {
  comedian: Comedian | undefined
  story: { text: string; isTrue: boolean } | undefined
  phase: GamePhase
  mode: 'setup' | 'live' | 'paused'
}

function DisplayPreview({ comedian, story, phase, mode }: DisplayPreviewProps) {
  if (mode === 'setup') {
    return (
      <div className="h-full flex items-center justify-center text-center">
        <div>
          <Play size={64} className="mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Ready to Start
          </h2>
          <p className="text-muted-foreground">
            Click "Start Game" to begin
          </p>
        </div>
      </div>
    )
  }

  if (!comedian || !story) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">No content</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col items-center justify-center text-center space-y-8">
      {/* Comedian Info */}
      <div>
        <h2 className="text-4xl font-bold text-foreground mb-2">
          {comedian.name}
        </h2>
        <p className="text-xl text-muted-foreground">{comedian.instagram}</p>
      </div>

      {/* Story */}
      <div className="max-w-2xl">
        <p className="text-3xl text-foreground leading-relaxed">{story.text}</p>
      </div>

      {/* Phase Indicator */}
      {phase === 'story' && (
        <div className="text-xl text-muted-foreground">
          Vote: Truth or Lie?
        </div>
      )}
      {phase === 'reveal' && (
        <div className="text-4xl font-bold">
          {story.isTrue ? (
            <span className="text-green-500">TRUTH</span>
          ) : (
            <span className="text-red-500">LIE</span>
          )}
        </div>
      )}
    </div>
  )
}

interface ActionButtonProps {
  gameState: GameState
  onAdvance: () => void
  currentComedian: Comedian | undefined
  currentStory: { text: string; isTrue: boolean } | undefined
}

function ActionButton({
  gameState,
  onAdvance,
  currentComedian,
  currentStory,
}: ActionButtonProps) {
  const getButtonConfig = () => {
    // Game not started
    if (gameState.mode === 'setup') {
      return {
        label: 'Start Game',
        description: 'Begin the show',
        variant: 'primary' as const,
      }
    }

    // Check if we're done
    const isLastComedian =
      gameState.currentComedianIndex === gameState.comedians.length - 1
    const isLastStory =
      currentComedian &&
      gameState.currentStoryIndex === currentComedian.stories.length - 1

    // Phase-based button
    switch (gameState.phase) {
      case 'story':
        if (gameState.votesLocked) {
          return {
            label: 'Reveal Answer',
            description: 'Show if it was truth or lie',
            variant: 'primary' as const,
          }
        }
        return {
          label: 'Lock Votes',
          description: `${Object.keys(gameState.votes).length} / ${Object.keys(gameState.players).length} votes`,
          variant: 'secondary' as const,
        }

      case 'reveal':
        return {
          label: 'Show Results',
          description: 'Display points awarded',
          variant: 'primary' as const,
        }

      case 'results':
        if (isLastStory && isLastComedian) {
          return {
            label: 'Final Leaderboard',
            description: 'Show final standings',
            variant: 'primary' as const,
          }
        }
        if (isLastStory) {
          return {
            label: 'Next Comedian',
            description: `Start ${gameState.comedians[gameState.currentComedianIndex + 1]?.name}`,
            variant: 'primary' as const,
          }
        }
        return {
          label: 'Next Story',
          description: `Story ${gameState.currentStoryIndex + 2}`,
          variant: 'primary' as const,
        }

      case 'leaderboard':
        return {
          label: 'End Game',
          description: 'Return to Creator Mode',
          variant: 'secondary' as const,
        }

      default:
        return {
          label: 'Continue',
          description: '',
          variant: 'primary' as const,
        }
    }
  }

  const config = getButtonConfig()

  return (
    <button
      onClick={onAdvance}
      className={`w-full py-8 px-6 rounded-lg font-bold text-2xl transition-opacity hover:opacity-90 ${
        config.variant === 'primary'
          ? 'bg-primary text-primary-foreground'
          : 'bg-secondary text-secondary-foreground'
      }`}
    >
      <div>{config.label}</div>
      {config.description && (
        <div className="text-sm font-normal mt-2 opacity-80">
          {config.description}
        </div>
      )}
    </button>
  )
}

function VoteDistribution({ votes }: { votes: Record<string, 'truth' | 'lie'> }) {
  const distribution = Object.values(votes).reduce(
    (acc, vote) => {
      acc[vote]++
      return acc
    },
    { truth: 0, lie: 0 },
  )

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-card-foreground">
        Vote Distribution
      </div>
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>Truth: {distribution.truth}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span>Lie: {distribution.lie}</span>
        </div>
      </div>
    </div>
  )
}

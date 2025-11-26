import { createFileRoute } from '@tanstack/react-router'
import React from 'react'
import CreatorMode from '../components/CreatorMode'
import { mockComedians } from '../lib/mockData'
import type { Comedian } from '@pretty-little-liars/types'

export const Route = createFileRoute('/')({
  component: GameManager,
})

function GameManager() {
  const [comedians, setComedians] = React.useState<Comedian[]>(mockComedians)
  const [mode, setMode] = React.useState<'creator' | 'director'>('creator')

  // Mock locked indices - these would come from game state
  // -1 means nothing is locked yet (game hasn't started)
  const [lockedComedianIndex] = React.useState(-1)
  const [lockedStoryIndex] = React.useState(-1)

  const handleEnterDirectorMode = () => {
    setMode('director')
    // TODO: This will be implemented in the next phase
    alert('Director Mode coming soon!')
  }

  if (mode === 'director') {
    // TODO: Implement Director Mode
    return <div>Director Mode - Coming Soon</div>
  }

  return (
    <CreatorMode
      comedians={comedians}
      onUpdateComedians={setComedians}
      lockedComedianIndex={lockedComedianIndex}
      lockedStoryIndex={lockedStoryIndex}
      onEnterDirectorMode={handleEnterDirectorMode}
    />
  )
}

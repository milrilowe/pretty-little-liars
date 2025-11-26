import React from 'react'
import GameStructureSidebar from './GameStructureSidebar'
import EditingPanel from './EditingPanel'
import type { Comedian, Story } from '@pretty-little-liars/types'

interface CreatorModeProps {
  comedians: Comedian[]
  onUpdateComedians: (comedians: Comedian[]) => void
  lockedComedianIndex: number
  lockedStoryIndex: number
  onEnterDirectorMode: () => void
}

export default function CreatorMode({
  comedians,
  onUpdateComedians,
  lockedComedianIndex,
  lockedStoryIndex,
  onEnterDirectorMode,
}: CreatorModeProps) {
  const [selectedItem, setSelectedItem] = React.useState<{
    type: 'comedian' | 'story'
    id: string
  } | null>(null)

  const handleAddComedian = () => {
    const newComedian: Comedian = {
      id: `comedian-${Date.now()}`,
      name: 'New Comedian',
      instagram: '@newcomedian',
      stories: [],
    }
    onUpdateComedians([...comedians, newComedian])
    setSelectedItem({ type: 'comedian', id: newComedian.id })
  }

  const handleUpdateComedian = (id: string, updates: Partial<Comedian>) => {
    onUpdateComedians(
      comedians.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    )
  }

  const handleDeleteComedian = (id: string) => {
    onUpdateComedians(comedians.filter((c) => c.id !== id))
    if (selectedItem?.type === 'comedian' && selectedItem.id === id) {
      setSelectedItem(null)
    }
  }

  const handleUpdateStory = (storyId: string, updates: Partial<Story>) => {
    onUpdateComedians(
      comedians.map((c) => ({
        ...c,
        stories: c.stories.map((s) =>
          s.id === storyId ? { ...s, ...updates } : s,
        ),
      })),
    )
  }

  const handleDeleteStory = (storyId: string) => {
    onUpdateComedians(
      comedians.map((c) => ({
        ...c,
        stories: c.stories.filter((s) => s.id !== storyId),
      })),
    )
    if (selectedItem?.type === 'story' && selectedItem.id === storyId) {
      setSelectedItem(null)
    }
  }

  const handleAddStory = (comedianId: string) => {
    const newStory: Story = {
      id: `story-${Date.now()}`,
      text: 'New story...',
      isTrue: true,
    }
    onUpdateComedians(
      comedians.map((c) =>
        c.id === comedianId
          ? { ...c, stories: [...c.stories, newStory] }
          : c,
      ),
    )
    setSelectedItem({ type: 'story', id: newStory.id })
  }

  const handleMoveStory = (storyId: string, direction: 'up' | 'down') => {
    onUpdateComedians(
      comedians.map((comedian) => {
        const storyIndex = comedian.stories.findIndex((s) => s.id === storyId)
        if (storyIndex === -1) return comedian

        const newStories = [...comedian.stories]
        const targetIndex = direction === 'up' ? storyIndex - 1 : storyIndex + 1

        if (targetIndex < 0 || targetIndex >= newStories.length) return comedian

        ;[newStories[storyIndex], newStories[targetIndex]] = [
          newStories[targetIndex],
          newStories[storyIndex],
        ]

        return { ...comedian, stories: newStories }
      }),
    )
  }

  const isItemLocked = (comedianId: string, storyId?: string) => {
    const comedianIndex = comedians.findIndex((c) => c.id === comedianId)
    if (comedianIndex === -1) return false

    if (storyId) {
      const comedian = comedians[comedianIndex]
      const storyIndex = comedian.stories.findIndex((s) => s.id === storyId)
      return (
        comedianIndex < lockedComedianIndex ||
        (comedianIndex === lockedComedianIndex &&
          storyIndex <= lockedStoryIndex)
      )
    }

    return comedianIndex < lockedComedianIndex
  }

  return (
    <div className="flex h-screen bg-background">
      <GameStructureSidebar
        comedians={comedians}
        selectedItem={selectedItem}
        onSelectItem={setSelectedItem}
        onAddComedian={handleAddComedian}
        lockedComedianIndex={lockedComedianIndex}
        lockedStoryIndex={lockedStoryIndex}
      />
      <div className="flex-1 flex flex-col">
        <div className="border-b border-border p-4 flex items-center justify-between bg-card">
          <h1 className="text-xl font-bold text-card-foreground">
            Creator Mode
          </h1>
          <button
            onClick={onEnterDirectorMode}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity font-medium"
          >
            Enter Director Mode
          </button>
        </div>
        <EditingPanel
          selectedItem={selectedItem}
          comedians={comedians}
          onUpdateComedian={handleUpdateComedian}
          onUpdateStory={handleUpdateStory}
          onDeleteComedian={handleDeleteComedian}
          onDeleteStory={handleDeleteStory}
          onAddStory={handleAddStory}
          onMoveStory={handleMoveStory}
          isItemLocked={isItemLocked}
        />
      </div>
    </div>
  )
}

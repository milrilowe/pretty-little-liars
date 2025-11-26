import { ChevronDown, ChevronRight, Plus, Lock } from 'lucide-react'
import type { Comedian } from '@pretty-little-liars/types'

interface GameStructureSidebarProps {
  comedians: Comedian[]
  selectedItem: { type: 'comedian' | 'story'; id: string } | null
  onSelectItem: (item: { type: 'comedian' | 'story'; id: string }) => void
  onAddComedian: () => void
  lockedComedianIndex: number
  lockedStoryIndex: number
}

export default function GameStructureSidebar({
  comedians,
  selectedItem,
  onSelectItem,
  onAddComedian,
  lockedComedianIndex,
  lockedStoryIndex,
}: GameStructureSidebarProps) {
  const isItemLocked = (comedianIndex: number, storyIndex?: number) => {
    if (storyIndex !== undefined) {
      // Check if story is locked
      return (
        comedianIndex < lockedComedianIndex ||
        (comedianIndex === lockedComedianIndex && storyIndex <= lockedStoryIndex)
      )
    }
    // Check if comedian is locked
    return comedianIndex < lockedComedianIndex
  }

  return (
    <div className="w-80 bg-sidebar border-r border-sidebar-border flex flex-col h-screen">
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="text-lg font-semibold text-sidebar-foreground">
          Game Structure
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {comedians.map((comedian, comedianIndex) => (
          <ComedianTreeItem
            key={comedian.id}
            comedian={comedian}
            comedianIndex={comedianIndex}
            isSelected={
              selectedItem?.type === 'comedian' && selectedItem.id === comedian.id
            }
            selectedStoryId={
              selectedItem?.type === 'story' ? selectedItem.id : null
            }
            onSelectComedian={() =>
              onSelectItem({ type: 'comedian', id: comedian.id })
            }
            onSelectStory={(storyId) =>
              onSelectItem({ type: 'story', id: storyId })
            }
            isLocked={isItemLocked(comedianIndex)}
            isStoryLocked={(storyIndex) =>
              isItemLocked(comedianIndex, storyIndex)
            }
          />
        ))}
      </div>

      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={onAddComedian}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-sidebar-primary text-sidebar-primary-foreground rounded-md hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          Add Comedian
        </button>
      </div>
    </div>
  )
}

interface ComedianTreeItemProps {
  comedian: Comedian
  comedianIndex: number
  isSelected: boolean
  selectedStoryId: string | null
  onSelectComedian: () => void
  onSelectStory: (storyId: string) => void
  isLocked: boolean
  isStoryLocked: (storyIndex: number) => boolean
}

function ComedianTreeItem({
  comedian,
  comedianIndex,
  isSelected,
  selectedStoryId,
  onSelectComedian,
  onSelectStory,
  isLocked,
  isStoryLocked,
}: ComedianTreeItemProps) {
  const [isExpanded, setIsExpanded] = React.useState(true)

  return (
    <div className="mb-2">
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors ${
          isSelected
            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
            : 'hover:bg-sidebar-accent/50 text-sidebar-foreground'
        } ${isLocked ? 'opacity-60' : ''}`}
        onClick={onSelectComedian}
      >
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsExpanded(!isExpanded)
          }}
          className="p-0.5 hover:bg-sidebar-accent-foreground/10 rounded"
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        <span className="font-medium flex-1">
          {comedianIndex + 1}. {comedian.name}
        </span>
        {isLocked && <Lock size={14} className="text-sidebar-foreground/50" />}
      </div>

      {isExpanded && (
        <div className="ml-6 mt-1 space-y-1">
          {comedian.stories.map((story, storyIndex) => (
            <div
              key={story.id}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer transition-colors text-sm ${
                selectedStoryId === story.id
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'hover:bg-sidebar-accent/50 text-sidebar-foreground'
              } ${isStoryLocked(storyIndex) ? 'opacity-60' : ''}`}
              onClick={() => onSelectStory(story.id)}
            >
              <span className="flex-1">
                Story {storyIndex + 1}: {story.text.substring(0, 40)}
                {story.text.length > 40 ? '...' : ''}
              </span>
              {isStoryLocked(storyIndex) && (
                <Lock size={12} className="text-sidebar-foreground/50" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

import React from 'react'

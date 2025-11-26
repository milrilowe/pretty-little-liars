import { Save, Trash2, Plus, Lock, MoveUp, MoveDown } from 'lucide-react'
import type { Comedian, Story } from '@pretty-little-liars/types'

interface EditingPanelProps {
  selectedItem: { type: 'comedian' | 'story'; id: string } | null
  comedians: Comedian[]
  onUpdateComedian: (id: string, updates: Partial<Comedian>) => void
  onUpdateStory: (storyId: string, updates: Partial<Story>) => void
  onDeleteComedian: (id: string) => void
  onDeleteStory: (storyId: string) => void
  onAddStory: (comedianId: string) => void
  onMoveStory: (storyId: string, direction: 'up' | 'down') => void
  isItemLocked: (comedianId: string, storyId?: string) => boolean
}

export default function EditingPanel({
  selectedItem,
  comedians,
  onUpdateComedian,
  onUpdateStory,
  onDeleteComedian,
  onDeleteStory,
  onAddStory,
  onMoveStory,
  isItemLocked,
}: EditingPanelProps) {
  if (!selectedItem) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background text-muted-foreground">
        <div className="text-center">
          <p className="text-lg">Select an item to edit</p>
          <p className="text-sm mt-2">
            Choose a comedian or story from the sidebar
          </p>
        </div>
      </div>
    )
  }

  if (selectedItem.type === 'comedian') {
    const comedian = comedians.find((c) => c.id === selectedItem.id)
    if (!comedian) return null

    const locked = isItemLocked(comedian.id)

    return (
      <ComedianEditor
        comedian={comedian}
        onUpdate={onUpdateComedian}
        onDelete={onDeleteComedian}
        onAddStory={onAddStory}
        isLocked={locked}
      />
    )
  }

  // Story editor
  const { comedian, story, storyIndex, canMoveUp, canMoveDown } =
    findStory(comedians, selectedItem.id) || {}

  if (!comedian || !story) return null

  const locked = isItemLocked(comedian.id, story.id)

  return (
    <StoryEditor
      comedian={comedian}
      story={story}
      storyIndex={storyIndex!}
      onUpdate={onUpdateStory}
      onDelete={onDeleteStory}
      onMove={onMoveStory}
      isLocked={locked}
      canMoveUp={canMoveUp!}
      canMoveDown={canMoveDown!}
    />
  )
}

interface ComedianEditorProps {
  comedian: Comedian
  onUpdate: (id: string, updates: Partial<Comedian>) => void
  onDelete: (id: string) => void
  onAddStory: (comedianId: string) => void
  isLocked: boolean
}

function ComedianEditor({
  comedian,
  onUpdate,
  onDelete,
  onAddStory,
  isLocked,
}: ComedianEditorProps) {
  const [name, setName] = React.useState(comedian.name)
  const [instagram, setInstagram] = React.useState(comedian.instagram)
  const [photoUrl, setPhotoUrl] = React.useState(comedian.photoUrl || '')

  const hasChanges =
    name !== comedian.name ||
    instagram !== comedian.instagram ||
    photoUrl !== (comedian.photoUrl || '')

  const handleSave = () => {
    onUpdate(comedian.id, { name, instagram, photoUrl })
  }

  const handleReset = () => {
    setName(comedian.name)
    setInstagram(comedian.instagram)
    setPhotoUrl(comedian.photoUrl || '')
  }

  return (
    <div className="flex-1 bg-background p-8 overflow-y-auto">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-foreground">
            Edit Comedian
          </h1>
          {isLocked && (
            <div className="flex items-center gap-2 text-muted-foreground bg-muted px-3 py-1.5 rounded-md">
              <Lock size={16} />
              <span className="text-sm">Locked</span>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLocked}
              className="w-full px-4 py-2 bg-input border border-border rounded-md text-foreground disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Instagram Handle
            </label>
            <input
              type="text"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              disabled={isLocked}
              className="w-full px-4 py-2 bg-input border border-border rounded-md text-foreground disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Photo URL (Optional)
            </label>
            <input
              type="text"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              disabled={isLocked}
              className="w-full px-4 py-2 bg-input border border-border rounded-md text-foreground disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {!isLocked && (
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                <Save size={16} />
                Save Changes
              </button>
              {hasChanges && (
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:opacity-90 transition-opacity"
                >
                  Reset
                </button>
              )}
            </div>
          )}

          <div className="pt-6 border-t border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">
                Stories ({comedian.stories.length})
              </h2>
              {!isLocked && (
                <button
                  onClick={() => onAddStory(comedian.id)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md hover:opacity-90 transition-opacity"
                >
                  <Plus size={16} />
                  Add Story
                </button>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Click on a story in the sidebar to edit it
            </p>
          </div>

          {!isLocked && (
            <div className="pt-6 border-t border-destructive/20">
              <button
                onClick={() => onDelete(comedian.id)}
                className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:opacity-90 transition-opacity"
              >
                <Trash2 size={16} />
                Delete Comedian
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface StoryEditorProps {
  comedian: Comedian
  story: Story
  storyIndex: number
  onUpdate: (storyId: string, updates: Partial<Story>) => void
  onDelete: (storyId: string) => void
  onMove: (storyId: string, direction: 'up' | 'down') => void
  isLocked: boolean
  canMoveUp: boolean
  canMoveDown: boolean
}

function StoryEditor({
  comedian,
  story,
  storyIndex,
  onUpdate,
  onDelete,
  onMove,
  isLocked,
  canMoveUp,
  canMoveDown,
}: StoryEditorProps) {
  const [text, setText] = React.useState(story.text)
  const [isTrue, setIsTrue] = React.useState(story.isTrue)

  const hasChanges = text !== story.text || isTrue !== story.isTrue

  const handleSave = () => {
    onUpdate(story.id, { text, isTrue })
  }

  const handleReset = () => {
    setText(story.text)
    setIsTrue(story.isTrue)
  }

  return (
    <div className="flex-1 bg-background p-8 overflow-y-auto">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-muted-foreground">
              {comedian.name} - Story {storyIndex + 1}
            </p>
            <h1 className="text-3xl font-bold text-foreground">Edit Story</h1>
          </div>
          <div className="flex items-center gap-2">
            {!isLocked && (
              <>
                <button
                  onClick={() => onMove(story.id, 'up')}
                  disabled={!canMoveUp}
                  className="p-2 bg-secondary text-secondary-foreground rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  title="Move up"
                >
                  <MoveUp size={16} />
                </button>
                <button
                  onClick={() => onMove(story.id, 'down')}
                  disabled={!canMoveDown}
                  className="p-2 bg-secondary text-secondary-foreground rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  title="Move down"
                >
                  <MoveDown size={16} />
                </button>
              </>
            )}
            {isLocked && (
              <div className="flex items-center gap-2 text-muted-foreground bg-muted px-3 py-1.5 rounded-md">
                <Lock size={16} />
                <span className="text-sm">Locked</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Story Text
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isLocked}
              rows={4}
              className="w-full px-4 py-2 bg-input border border-border rounded-md text-foreground disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Answer
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={isTrue}
                  onChange={() => setIsTrue(true)}
                  disabled={isLocked}
                  className="w-4 h-4 text-primary focus:ring-ring disabled:cursor-not-allowed"
                />
                <span className="text-foreground">Truth</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={!isTrue}
                  onChange={() => setIsTrue(false)}
                  disabled={isLocked}
                  className="w-4 h-4 text-primary focus:ring-ring disabled:cursor-not-allowed"
                />
                <span className="text-foreground">Lie</span>
              </label>
            </div>
          </div>

          {!isLocked && (
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                <Save size={16} />
                Save Changes
              </button>
              {hasChanges && (
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:opacity-90 transition-opacity"
                >
                  Reset
                </button>
              )}
            </div>
          )}

          {!isLocked && (
            <div className="pt-6 border-t border-destructive/20">
              <button
                onClick={() => onDelete(story.id)}
                className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:opacity-90 transition-opacity"
              >
                <Trash2 size={16} />
                Delete Story
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function findStory(comedians: Comedian[], storyId: string) {
  for (const comedian of comedians) {
    const storyIndex = comedian.stories.findIndex((s) => s.id === storyId)
    if (storyIndex !== -1) {
      return {
        comedian,
        story: comedian.stories[storyIndex],
        storyIndex,
        canMoveUp: storyIndex > 0,
        canMoveDown: storyIndex < comedian.stories.length - 1,
      }
    }
  }
  return null
}

import React from 'react'

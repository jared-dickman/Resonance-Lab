// Empty state pattern - component with no data
// Based on: app/components/threads/ThreadList.stories.tsx

import type {Meta, StoryObj} from '@storybook/react'
import {ThreadList} from './ThreadList'
import {expect, within} from 'storybook/test'

export const NoThreads: StoryObj<typeof ThreadList> = {
  args: {
    threads: [], // Empty array
  },
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement)

    await step('Shows empty state message', async () => {
      expect(canvas.getByText(/no threads/i)).toBeInTheDocument()
    })
  },
}

export const NullData: StoryObj<typeof ThreadList> = {
  args: {
    threads: undefined, // Null/undefined prop
  },
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement)

    await step('Handles null gracefully', async () => {
      expect(canvas.getByText(/no threads/i)).toBeInTheDocument()
    })
  },
}
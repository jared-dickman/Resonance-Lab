// Overflow state pattern - long text and many items
// Based on: codebase patterns

import type {StoryObj} from '@storybook/react'
import {expect, within} from 'storybook/test'

export const VeryLongText: StoryObj = {
  args: {
    title: 'A'.repeat(200), // Very long text
    description: 'B'.repeat(500),
  },
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement)

    await step('Truncates long title', async () => {
      const title = canvas.getByTestId('title')
      expect(title).toHaveClass('truncate')
    })

    await step('Shows description with ellipsis', async () => {
      const desc = canvas.getByTestId('description')
      expect(desc).toHaveClass('line-clamp-3')
    })
  },
}

export const ManyItems: StoryObj = {
  args: {
    items: Array.from({length: 100}, (_, i) => ({id: `item-${i}`, name: `Item ${i}`})),
  },
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement)

    await step('Shows scrollable list', async () => {
      const list = canvas.getByTestId('item-list')
      expect(list).toHaveClass('overflow-y-auto')
    })
  },
}
// Loading state pattern - delayed API responses
// Based on: llm/rules/testing-storybook.md

import type {StoryObj} from '@storybook/react'
import {http, HttpResponse, delay} from 'msw'
import {mockBlogResponse} from '@/app/testing/fixtures/blogs/blog-fixtures'
import {expect, waitFor, within} from 'storybook/test'

export const SlowApi: StoryObj = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/blogs', async () => {
          await delay(2000) // 2 second delay
          return HttpResponse.json([mockBlogResponse])
        }),
      ],
    },
  },
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement)

    await step('Shows loading spinner', async () => {
      expect(canvas.getByTestId('spinner')).toBeInTheDocument()
    })

    await step('Shows content after load', async () => {
      await waitFor(() => expect(canvas.queryByTestId('spinner')).not.toBeInTheDocument())
    })
  },
}
// Error state pattern - API failures
// Based on: llm/rules/testing-storybook.md

import {API_ERROR_MESSAGES} from '@/app/config/constants'
import type {StoryObj} from '@storybook/react'
import {http, HttpResponse} from 'msw'
import {expect, within} from 'storybook/test'

export const ApiError500: StoryObj = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/items', () => {
          return HttpResponse.json({error: 'Internal server error'}, {status: 500})
        }),
      ],
    },
  },
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement)

    await step('Shows error alert', async () => {
      await expect(canvas.getByRole('alert')).toBeInTheDocument()
    })
  },
}

export const ApiError404: StoryObj = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/items', () => {
          return HttpResponse.json({error: API_ERROR_MESSAGES.notFound}, {status: 404})
        }),
      ],
    },
  },
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement)

    await step('Shows permission error', async () => {
      await expect(canvas.getByText(/not found/i)).toBeInTheDocument()
    })
  },
}


// export const ApiError403: StoryObj = {} //NEVER USE 403 ONLY 404

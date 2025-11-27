# Storybook - Component Testing

## Core Pattern
Test component states and interactions in isolation using MSW and play functions. Always use fixtures.

## Basic Story
```ts
import type {Meta, StoryObj} from '@storybook/react'
import {BlogCard} from './BlogCard'
import {mockBlogResponse} from '@/app/testing/fixtures/blogs/blog-fixtures'

const meta: Meta<typeof BlogCard> = {
  title: 'Components/BlogCard',
  component: BlogCard,
}
export default meta
type Story = StoryObj<typeof BlogCard>

export const Default: Story = {
  args: {blog: mockBlogResponse},
}
```

## Play Functions
```ts
import {within, userEvent, expect} from 'storybook/test'

export const Interactive: Story = {
  args: {blog: mockBlogResponse},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByTestId('edit-button'))
    await expect(canvas.getByRole('dialog')).toBeInTheDocument()
  },
}
```

## MSW Mocking
```ts
import {http, HttpResponse} from 'msw'
import {mockMessageResponse, MessageText} from '@/app/testing/fixtures/messages/message-fixtures'

export const WithApiResponse: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post('/api/webhook', () => HttpResponse.json(mockMessageResponse)),
      ],
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)
    await userEvent.type(canvas.getByTestId('chat-input'), MessageText.query)
    await userEvent.click(canvas.getByTestId('send-button'))
    await expect(canvas.getByText(MessageText.output)).toBeInTheDocument()
  },
}
```

## Error & Loading States
```ts
// Error
export const WithError: Story = {
  parameters: {
    msw: {handlers: [http.post('/api/blog-posts', () => HttpResponse.json({error: 'Failed'}, {status: 500}))]},
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByTestId('create-button'))
    await expect(canvas.getByRole('alert')).toHaveTextContent('Failed')
  },
}

// Loading
export const Loading: Story = {
  parameters: {
    msw: {handlers: [http.get('/api/blogs', async () => { await delay(1000); return HttpResponse.json([mockBlogResponse]) })]},
  },
}
```

## Rules
Always use fixtures from `@/app/testing/fixtures`, mock all API calls with MSW, test user-visible behavior in play functions, one story per component state/variant

## Anti-Patterns
- ❌ Hardcoded text, no MSW handlers (hitting real APIs), testing internal state, inline mock data

## Validation
- [ ] Fixtures for all test data, MSW handlers for all API calls, play functions test user interactions, user-visible behavior tested

## Read Full File If
Setting up component stories or complex interaction testing.
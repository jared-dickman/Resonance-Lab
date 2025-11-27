# Storybook - Component Testing

**Goal**: Test component states and interactions in isolation

**When to use**: UI components with multiple states/variants

**Focus**: Component behavior, not full user workflows

---

## Core Principle

Test component states and user interactions in isolation.

Use **MSW** to mock API responses.
Use **play functions** to test interactions.
Use **fixtures** for consistent test data.
- Import `apiRoutes` constants (full `/api/...` paths) for all API handlers.

---

## Using Fixtures in Storybook

```typescript
import {mockMessageResponse, MessageText} from '@/app/testing/fixtures/messages/message-fixtures'
import {apiRoutes} from '@/app/config/apiRoutes'
import {http, HttpResponse} from 'msw'
import {within, userEvent, expect} from 'storybook/test'

export const WithApiResponse: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post(apiRoutes.webhook, () => {
          return HttpResponse.json(mockMessageResponse)
        }),
      ],
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)
    const input = canvas.getByTestId('chat-input')
    const submitButton = canvas.getByTestId('send-button')

    // Use fixture constants
    await userEvent.type(input, MessageText.query)
    await userEvent.click(submitButton)

    // Assert with fixture constants
    await expect(canvas.getByText(MessageText.output)).toBeInTheDocument()
  },
}
```

---

## Story Structure

### Basic Story

```typescript
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
  args: {
    blog: mockBlogResponse,
  },
}
```

### With Play Function

```typescript
export const Interactive: Story = {
  args: {
    blog: mockBlogResponse,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)

    // Click edit button
    await userEvent.click(canvas.getByTestId('edit-button'))

    // Verify modal opens
    await expect(canvas.getByRole('dialog')).toBeInTheDocument()
  },
}
```

---

## MSW Mocking

### Mock Single API

```typescript
import {http, HttpResponse} from 'msw'
import {apiRoutes} from '@/app/config/apiRoutes'
import {mockUserResponse} from '@/app/testing/fixtures/users/user-fixtures'

export const WithUser: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get(apiRoutes.userDetail(':id'), () => {
          return HttpResponse.json(mockUserResponse)
        }),
      ],
    },
  },
}
```

### Mock Multiple APIs

```typescript
export const WithMultipleApis: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get(apiRoutes.userDetail(':id'), () => {
          return HttpResponse.json(mockUserResponse)
        }),
        http.get(apiRoutes.companies, () => {
          return HttpResponse.json([mockCompanyResponse])
        }),
      ],
    },
  },
}
```

### Mock Error State

```typescript
export const WithError: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post(apiRoutes.blogPosts, () => {
          return HttpResponse.json(
            {error: 'Failed to create'},
            {status: 500}
          )
        }),
      ],
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)

    await userEvent.click(canvas.getByTestId('create-button'))

    // Verify error message
    await expect(canvas.getByRole('alert')).toHaveTextContent('Failed to create')
  },
}
```

---

## Common Patterns

### Form Submission
```typescript
export const SubmitForm: Story = {
  parameters: {
    msw: {handlers: [http.post(apiRoutes.blogPosts, () => HttpResponse.json(mockBlogResponse))]},
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)
    await userEvent.type(canvas.getByLabel('Title'), BlogText.title)
    await userEvent.click(canvas.getByTestId('submit-button'))
    await expect(canvas.getByText('Blog created')).toBeInTheDocument()
  },
}
```

### Loading State
```typescript
export const Loading: Story = {
  parameters: {
    msw: {handlers: [http.get(apiRoutes.blogPosts, async () => {
      await delay(1000)
      return HttpResponse.json([mockBlogResponse])
    })]},
  },
  play: async ({canvasElement}) => {
    await expect(within(canvasElement).getByTestId('spinner')).toBeInTheDocument()
    await waitFor(() => expect(within(canvasElement).getByText(BlogText.title)).toBeInTheDocument())
  },
}
```

### Component with Session/Query
```typescript
const meta: Meta<typeof Modal> = {
  parameters: {
    msw: {handlers: [
      http.get(apiRoutes.authSession, () => HttpResponse.json({currentCompanyId: '123'})),
      http.get(apiRoutes.analytics, () => HttpResponse.json(mockResponse)),
    ]},
  },
}
```

---

## Anti-Patterns

❌ Hardcoded text - use fixtures
❌ No MSW handlers - always mock APIs
❌ Testing internal state - test user-visible behavior
❌ Inline mock data - use centralized fixtures

---

## Browser Compatibility Debugging

**Symptom**: Infinite loading spinner, console: `Module 'crypto' has been externalized for browser compatibility`

**Cause**: Vite externalizes Node.js modules (crypto, fs, path). Test fixtures importing these break browser bundle.

**Fix**: Create shim in `.storybook/[module]-shim.ts` (native browser API + fallback), alias in Vite config `viteFinal`. Reference: `.storybook/crypto-shim.ts`

**Critical**: Clear cache after config changes: `rm -rf node_modules/.cache/storybook`

**Don't**: Use globalThis polyfills (side effects)

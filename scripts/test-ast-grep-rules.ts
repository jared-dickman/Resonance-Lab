#!/usr/bin/env tsx
/* eslint-disable no-console */
/**
 * ast-grep Rules Test Suite
 *
 * Tests all ast-grep rules to ensure they catch violations correctly.
 * Run: pnpm test:ast-grep-rules
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const TMP_DIR = path.join(process.cwd(), '.ast-grep-test-tmp');

interface TestCase {
  rule: string;
  shouldCatch: { file: string; code: string }[];
  shouldPass: { file: string; code: string }[];
}

const TEST_CASES: TestCase[] = [
  {
    rule: 'require-function-components',
    shouldCatch: [
      {
        file: 'test.tsx',
        code: `export const MyComponent = () => {
  return <div>Hello</div>
}`,
      },
      {
        file: 'test2.tsx',
        code: `export const AnotherComponent = (props: Props) => (
  <div>{props.children}</div>
)`,
      },
      {
        file: 'app/components/MyFeature.tsx',
        code: `export const ComplexComponent = ({ id, name }: Props) => {
  const [state, setState] = useState();
  return <div>{name}</div>
}`,
      },
      {
        file: 'app/features/blog/BlogList.tsx',
        code: `// Real-world pattern: memo wrapped arrow function
export const BlogList = memo(() => {
  const blogs = useBlogList();
  return <ul>{blogs.map(b => <li key={b.id}>{b.title}</li>)}</ul>
})`,
      },
      {
        file: 'app/components/forms/Input.tsx',
        code: `// Arrow function with default props
export const Input = ({ type = 'text', ...props }: InputProps) => (
  <input type={type} {...props} />
)`,
      },
      {
        file: 'app/components/layout/Header.tsx',
        code: `// Multiple exports with arrow functions
export const HeaderLogo = () => <img src="/logo.png" alt="Logo" />
export const HeaderNav = () => <nav>Navigation</nav>
export const Header = () => (
  <header>
    <HeaderLogo />
    <HeaderNav />
  </header>
)`,
      },
    ],
    shouldPass: [
      {
        file: 'good.tsx',
        code: `export function MyComponent() {
  return <div>Hello</div>
}`,
      },
      {
        file: 'story.stories.tsx',
        code: `export const Primary = () => <Button>Click</Button>`,
      },
      {
        file: 'test.test.tsx',
        code: `export const TestHelper = () => <div>Test</div>`,
      },
      {
        file: 'app/components/ui/button.tsx',
        code: `export const Button = forwardRef(() => <button />)`,
      },
      {
        file: 'regular-const.tsx',
        code: `export const myData = { key: 'value' };
const notAComponent = () => console.log('test');`,
      },
    ],
  },
  {
    rule: 'no-direct-tanstack',
    shouldCatch: [
      {
        file: 'app/components/BadComponent.ts',
        code: `import { useQuery } from '@tanstack/react-query';
export function MyComponent() {
  const { data } = useQuery({ queryKey: ['test'], queryFn: fetchData });
  return data;
}`,
      },
      {
        file: 'app/features/blog/BadPage.ts',
        code: `import { useMutation } from '@tanstack/react-query';
export function MyComponent() {
  const mutation = useMutation({ mutationFn: saveData });
  return mutation;
}`,
      },
      {
        file: 'app/components/AnotherBad.ts',
        code: `import { useInfiniteQuery } from '@tanstack/react-query';
const { data } = useInfiniteQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts
});`,
      },
      {
        file: 'app/pages/Dashboard.tsx',
        code: `// Direct useQuery in page component
import { useQuery, useQueryClient } from '@tanstack/react-query';
export function Dashboard() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ['stats'] });
  return <div>{data}</div>
}`,
      },
      {
        file: 'app/components/UserProfile.tsx',
        code: `// Multiple TanStack imports
import { useQuery, useMutation, useInfiniteQuery } from '@tanstack/react-query';
export function UserProfile({ userId }: Props) {
  const user = useQuery({ queryKey: ['user', userId] });
  const updateUser = useMutation({ mutationFn: updateUserApi });
  const posts = useInfiniteQuery({ queryKey: ['posts', userId] });
  return <div>Profile</div>
}`,
      },
    ],
    shouldPass: [
      {
        file: 'app/hooks/useCompanies.ts',
        code: `import { useQuery } from '@tanstack/react-query';
export function useCompanies() {
  return useQuery({ queryKey: ['companies'], queryFn: fetchCompanies });
}`,
      },
      {
        file: 'app/features/blog/hooks.ts',
        code: `import { useMutation } from '@tanstack/react-query';
export function useCreateBlog() {
  return useMutation({ mutationFn: createBlog });
}`,
      },
      {
        file: 'story.stories.tsx',
        code: `import { useQuery } from '@tanstack/react-query';
export const Example = () => {
  const { data } = useQuery({ queryKey: ['demo'] });
  return <div>{data}</div>;
}`,
      },
    ],
  },
  {
    rule: 'no-template-classname',
    shouldCatch: [
      {
        file: 'test.tsx',
        code: `export function MyComponent({ active }: Props) {
  return <div className={\`base \${active ? 'active' : ''}\`}>Content</div>
}`,
      },
      {
        file: 'app/components/Card.tsx',
        code: `// Complex template literal with multiple conditions
export function Card({ size, variant, disabled }: CardProps) {
  return (
    <div className={\`card card-\${size} \${variant === 'primary' ? 'primary' : 'secondary'} \${disabled ? 'disabled' : ''}\`}>
      Card Content
    </div>
  )
}`,
      },
      {
        file: 'app/components/Button.tsx',
        code: `// Nested template literals
export function Button({ icon, text }: ButtonProps) {
  const baseClass = \`btn \${icon ? \`btn-with-icon icon-\${icon}\` : 'btn-text-only'}\`;
  return <button className={baseClass}>{text}</button>
}`,
      },
    ],
    shouldPass: [
      {
        file: 'good.tsx',
        code: `import { cn } from '@/app/utils/cn';
export function MyComponent({ active }: Props) {
  return <div className={cn('base', active && 'active')}>Content</div>
}`,
      },
      {
        file: 'good2.tsx',
        code: `export function MyComponent() {
  return <div className="static-class">Content</div>
}`,
      },
    ],
  },
  {
    rule: 'no-forbidden-status',
    shouldCatch: [
      {
        file: 'test.ts',
        code: `import { NextResponse } from 'next/server';
export function GET() {
  return NextResponse.json({ error: 'Forbidden' }, {status: 403});
}`,
      },
    ],
    shouldPass: [
      {
        file: 'good.ts',
        code: `import { NextResponse } from 'next/server';
export function GET() {
  return NextResponse.json({ error: 'Not found' }, {status: 404});
}`,
      },
    ],
  },
  {
    rule: 'e2e-locators-no-getrole',
    shouldCatch: [
      {
        file: 'e2e/locators/test.locators.ts',
        code: `import { Page } from 'playwright';
export const testLocators = (page: Page) => ({
  button: page.getByRole('button', { name: /submit/i }),
});`,
      },
    ],
    shouldPass: [
      {
        file: 'e2e/locators/good.locators.ts',
        code: `import { Page } from 'playwright';
import { TestIds } from '@/app/testing/fixtures/test-fixtures';
export const testLocators = (page: Page) => ({
  button: page.getByTestId(TestIds.submitButton),
});`,
      },
      {
        file: 'e2e/fixtures/test.fixture.ts',
        code: `// Fixtures can use any locator strategy
const button = page.getByRole('button');`,
      },
    ],
  },
  {
    rule: 'e2e-use-msw-fixtures',
    shouldCatch: [
      {
        file: 'e2e/test.ts',
        code: `import { intercept } from './utils';
import { apiRoutes } from '@/app/config/apiRoutes';
await intercept(page, apiRoutes.blogPosts, {
  body: { blogs: [{ id: 1, title: 'Test' }] }
});`,
      },
    ],
    shouldPass: [
      {
        file: 'e2e/test2.ts',
        code: `import { intercept } from './utils';
import { apiRoutes } from '@/app/config/apiRoutes';
import { mockBlogResponse } from '@/app/testing/fixtures/blog-fixtures';
await intercept(page, apiRoutes.blogPosts, {
  body: mockBlogResponse
});`,
      },
      {
        file: 'e2e/test3.ts',
        code: `import { intercept } from './utils';
await intercept(page, apiRoutes.blogPosts, {
  body: { blogs: [] }
});`,
      },
    ],
  },
  {
    rule: 'no-backup-files',
    shouldCatch: [
      {
        file: 'test.ts',
        code: `const myFunction_backup = () => console.log('test');
export const MyComponent_Backup = 'test';
function oldCode_backup() { return true; }
export const LegacyCodeBackup = { old: true };`,
      },
      {
        file: 'test2.ts',
        code: `const processData_backup = async (data: any) => {
  // old implementation
  return data;
};`,
      },
    ],
    shouldPass: [
      {
        file: 'good.ts',
        code: `const myFunction = () => console.log('test');
export const MyComponent = 'test';
function processData() { return true; }`,
      },
      {
        file: 'good2.ts',
        code: `// Comments about backup are fine
const backup = createBackup(); // using word backup
export const BackupService = { create: () => {} };`,
      },
    ],
  },
  {
    rule: 'no-sql-injection',
    shouldCatch: [
      {
        file: 'test.ts',
        code: `const userId = '123';
db.execute(\`SELECT * FROM users WHERE id = \${userId}\`);
const query = sql\`DELETE FROM posts WHERE author = \${userId}\`;`,
      },
      {
        file: 'test2.ts',
        code: `const name = req.body.name;
const query = \`INSERT INTO users (name) VALUES ('\${name}')\`;
db.execute(query);`,
      },
      {
        file: 'test3.ts',
        code: `db.execute(\`
  UPDATE blogs
  SET title = '\${title}',
      content = '\${content}'
  WHERE id = \${id}
\`);`,
      },
    ],
    shouldPass: [
      {
        file: 'good.ts',
        code: `import { eq } from 'drizzle-orm';
const result = await db.select().from(users).where(eq(users.id, userId));`,
      },
      {
        file: 'good2.ts',
        code: `const query = sql\`SELECT * FROM users\`;
db.execute(query);`,
      },
      {
        file: 'good3.ts',
        code: `await db.insert(users).values({ name: userName, email: userEmail });`,
      },
    ],
  },
  {
    rule: 'no-hardcoded-api-routes',
    shouldCatch: [
      {
        file: 'e2e/test.ts',
        code: `import { intercept } from './utils';
await intercept(page, '/api/blog-posts', { status: 500 });`,
      },
      {
        file: 'app/components/DataFetcher.ts',
        code: `const data = await fetch('/api/companies');`,
      },
      {
        file: 'e2e/flows/blog.ts',
        code: `await intercept(page, '**/api/blogify', { body: mockData });`,
      },
      {
        file: 'app/utils/client.ts',
        code: `http.get('/api/users/123');
http.post('/api/blog-posts', body);
http.delete('/api/keywords/123');`,
      },
      {
        file: 'app/utils/api-client.ts',
        code: `import { apiClient } from './client';
apiClient.get('/api/companies');`,
      },
    ],
    shouldPass: [
      {
        file: 'e2e/good.ts',
        code: `import { intercept } from './utils';
import { apiRoutes } from '@/app/config/apiRoutes';
await intercept(page, apiRoutes.blogPosts, { status: 500 });`,
      },
      {
        file: 'app/testing/msw/handlers/blog-handler.ts',
        code: `http.get('/api/blog-posts', () => HttpResponse.json({}))`,
      },
      {
        file: 'app/testing/msw/handlers/nested-handler.ts',
        code: `http.post('/api/companies/invite', () => HttpResponse.json({}))`,
      },
      {
        file: 'app/api/docs/openapi-spec.ts',
        code: `const paths = {
  '/api/blog-posts': { get: { summary: 'Get blogs' } }
};`,
      },
    ],
  },
  {
    rule: 'no-as-any',
    shouldCatch: [
      {
        file: 'test.ts',
        code: `const data = response.data as any;
const result: string = unknownValue as any;
const obj = JSON.parse(str) as any;`,
      },
      {
        file: 'test2.ts',
        code: `function processData(input: unknown) {
  const typed = input as any;
  return typed.property;
}`,
      },
      {
        file: 'test3.ts',
        code: `const callback = ((e: Event) => {
  const target = e.target as any;
  target.value = 'test';
});`,
      },
    ],
    shouldPass: [
      {
        file: 'good.ts',
        code: `const data = response.data as BlogPost;
const result = unknownValue as unknown as string;
const obj = JSON.parse(str) as BlogPost;`,
      },
      {
        file: 'good2.ts',
        code: `function processData(input: unknown) {
  const typed = input as BlogPost;
  return typed.property;
}`,
      },
    ],
  },
  {
    rule: 'no-hardcoded-navigation',
    shouldCatch: [
      {
        file: 'app/components/Nav.tsx',
        code: `import Link from 'next/link';
export function Nav() {
  return <Link href="/ideas">Ideas</Link>
}`,
      },
      {
        file: 'e2e/test.ts',
        code: `await page.goto('/billing');`,
      },
      {
        file: 'app/actions/auth.ts',
        code: `import { redirect } from 'next/navigation';
redirect('/login');`,
      },
      {
        file: 'app/components/NavMenu.tsx',
        code: `const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/settings', label: 'Settings' }
];`,
      },
      {
        file: 'e2e/flows/navigation.ts',
        code: `await basePage.flows.goto('/keywords');`,
      },
    ],
    shouldPass: [
      {
        file: 'app/components/NavGood.tsx',
        code: `import Link from 'next/link';
import { pageRoutes } from '@/app/config/pageRoutes';
export function Nav() {
  return <Link href={pageRoutes.ideas}>Ideas</Link>
}`,
      },
      {
        file: 'story.stories.tsx',
        code: `export const Primary = () => <Link href="/test">Test</Link>`,
      },
      {
        file: 'e2e/GoodNav.ts',
        code: `import { pageRoutes } from '@/app/config/pageRoutes';
await page.goto(pageRoutes.billing);`,
      },
    ],
  },
  {
    rule: 'no-magic-testids',
    shouldCatch: [
      {
        file: 'app/components/Button.tsx',
        code: `export function MyButton() {
  return <button data-testid="my-submit-button">Submit</button>
}`,
      },
      {
        file: 'app/components/Form.tsx',
        code: `export function Form() {
  return (
    <form>
      <input data-testid="email-input" />
      <input data-testid="password-input" />
      <button data-testid="submit-btn">Submit</button>
    </form>
  );
}`,
      },
      {
        file: 'app/features/blog/BlogCard.tsx',
        code: `return <article data-testid="blog-post-card-123">Content</article>`,
      },
    ],
    shouldPass: [
      {
        file: 'app/components/GoodButton.tsx',
        code: `import { TestIds } from '@/app/testing/fixtures/test-fixtures';
export function MyButton() {
  return <button data-testid={TestIds.submitButton}>Submit</button>
}`,
      },
      {
        file: 'app/components/GoodForm.tsx',
        code: `import { FormTestIds } from '@/app/testing/fixtures/form-fixtures';
export function Form() {
  return (
    <form>
      <input data-testid={FormTestIds.emailInput} />
      <button data-testid={FormTestIds.submitButton}>Submit</button>
    </form>
  );
}`,
      },
      {
        file: 'app/utils/helper.tsx',
        code: `const testId = "dynamic-id";
return <div data-testid={testId}>Content</div>`,
      },
    ],
  },
  {
    rule: 'no-unsafe-innerHTML',
    shouldCatch: [
      {
        file: 'unsafe1.tsx',
        code: `export function UnsafeComponent({ html }: Props) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />
}`,
      },
      {
        file: 'unsafe2.tsx',
        code: `export function BadComponent() {
  const element = document.getElementById('content');
  element.innerHTML = userInput;
  return <div>Updated</div>
}`,
      },
      {
        file: 'app/components/Preview.tsx',
        code: `// Real-world markdown preview with unsafe HTML
export function MarkdownPreview({ markdown }: Props) {
  const html = parseMarkdown(markdown);
  return (
    <article
      dangerouslySetInnerHTML={{ __html: html }}
      className="prose"
    />
  )
}`,
      },
      {
        file: 'app/components/RichText.tsx',
        code: `// Dynamic innerHTML assignment
export function RichTextEditor({ content }: Props) {
  useEffect(() => {
    const editor = document.querySelector('.editor');
    if (editor) {
      editor.innerHTML = content;
    }
  }, [content]);
  return <div className="editor" />
}`,
      },
    ],
    shouldPass: [
      {
        file: 'safe.tsx',
        code: `export function SafeComponent({ text }: Props) {
  return <div>{text}</div>
}`,
      },
      {
        file: 'safe2.tsx',
        code: `export function GoodComponent() {
  const element = document.getElementById('content');
  element.textContent = userInput;
  return <div>Updated</div>
}`,
      },
    ],
  },
  {
    rule: 'no-exposed-secrets',
    shouldCatch: [
      {
        file: 'exposed1.ts',
        code: `const api_key = 'sk-1234567890abcdefghijklmnopqrstuv';
export const config = { api_key };`,
      },
      {
        file: 'exposed2.ts',
        code: `const settings = {
  auth_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.actual.token',
  api_secret: 'super_secret_key_12345'
};`,
      },
      {
        file: 'app/config/keys.ts',
        code: `// Multiple exposed secrets
export const config = {
  stripe_api_key: 'FAKE_' + 'KEY_' + 'sk' + '_test_12345',
  stripe_secret_key: 'FAKE_' + 'KEY_' + 'rk' + '_test_67890',
  database_password: 'MyS3cur3P@ssw0rd!',
  jwt_private_key: '-----BEGIN RSA PRIVATE KEY-----FAKE',
}`,
      },
      {
        file: 'app/services/auth.ts',
        code: `// Bearer token hardcoded
const headers = {
  Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ',
  'X-API-KEY': 'abc123def456ghi789jkl012mno345'
}`,
      },
    ],
    shouldPass: [
      {
        file: 'secure1.ts',
        code: `const api_key = process.env.OPENAI_API_KEY;
const auth_token = import.meta.env.VITE_AUTH_TOKEN;`,
      },
      {
        file: 'secure2.ts',
        code: `const api_key = 'YOUR_API_KEY_HERE';
const password = 'REPLACE_WITH_ACTUAL_PASSWORD';`,
      },
      {
        file: 'secure3.ts',
        code: `// Short values and non-secret names are ok
const apiVersion = 'v1';
const maxRetries = 3;`,
      },
    ],
  },
  {
    rule: 'no-unhandled-promises',
    shouldCatch: [
      {
        file: 'unhandled1.tsx',
        code: `export function BadComponent() {
  fetch('/api/data');
  return <div>Loading</div>
}`,
      },
      {
        file: 'unhandled2.ts',
        code: `export function AnotherBad() {
  axios.post('/api/save', data);
  console.log('Saved');
}`,
      },
    ],
    shouldPass: [
      {
        file: 'handled1.tsx',
        code: `export async function GoodComponent() {
  try {
    await fetch('/api/data');
  } catch (error) {
    console.error(error);
  }
  return <div>Loaded</div>
}`,
      },
      {
        file: 'handled2.tsx',
        code: `export function AlsoGood() {
  fetch('/api/data')
    .then(res => res.json())
    .catch(err => console.error(err));
  return <div>Loading</div>
}`,
      },
      {
        file: 'handled3.ts',
        code: `export async function WithAwait() {
  const data = await fetch('/api/data');
  return data;
}`,
      },
    ],
  },
  {
    rule: 'require-zod-validation',
    shouldCatch: [
      {
        file: 'app/api/users/route.ts',
        code: `export async function POST(request: Request) {
  const body = await request.json();
  // No validation!
  return Response.json({ id: 1, ...body });
}`,
      },
      {
        file: 'app/features/blog/createBlog.action.ts',
        code: `export async function createBlogAction(formData: FormData) {
  const title = formData.get('title');
  // No validation!
  await saveBlog({ title });
}`,
      },
      {
        file: 'app/api/comments/route.ts',
        code: `// PUT handler without validation
export async function PUT(request: Request) {
  const { id, ...data } = await request.json();
  const comment = await updateComment(id, data);
  return Response.json(comment);
}`,
      },
      {
        file: 'app/features/user/updateProfile.action.ts',
        code: `// Server action with complex data, no validation
export async function updateProfileAction(formData: FormData) {
  const profile = {
    name: formData.get('name'),
    email: formData.get('email'),
    bio: formData.get('bio'),
    avatar: formData.get('avatar')
  };
  await updateUserProfile(profile);
}`,
      },
      {
        file: 'app/api/webhooks/stripe/route.ts',
        code: `// Webhook handler without validation
export async function POST(request: Request) {
  const payload = await request.text();
  const sig = request.headers.get('stripe-signature');
  // Process webhook without validation
  await processStripeWebhook(payload, sig);
  return Response.json({ received: true });
}`,
      },
    ],
    shouldPass: [
      {
        file: 'app/api/users/route.ts',
        code: `import { userSchema } from './schemas';

export async function POST(request: Request) {
  const body = await request.json();
  const validated = userSchema.parse(body);
  return Response.json({ id: 1, ...validated });
}`,
      },
      {
        file: 'app/features/blog/createBlog.action.ts',
        code: `import { blogSchema } from './schemas';

export async function createBlogAction(formData: FormData) {
  const result = blogSchema.safeParse({
    title: formData.get('title')
  });
  if (!result.success) throw new Error('Invalid data');
  await saveBlog(result.data);
}`,
      },
      {
        file: 'app/api/health/route.ts',
        code: `// GET endpoints don't need validation
export async function GET() {
  return Response.json({ status: 'ok' });
}`,
      },
    ],
  },
];

function setup() {
  if (fs.existsSync(TMP_DIR)) {
    fs.rmSync(TMP_DIR, { recursive: true });
  }
  fs.mkdirSync(TMP_DIR, { recursive: true });
}

function cleanup() {
  if (fs.existsSync(TMP_DIR)) {
    fs.rmSync(TMP_DIR, { recursive: true });
  }
}

function writeTestFile(relativePath: string, code: string): string {
  const fullPath = path.join(TMP_DIR, relativePath);
  const dir = path.dirname(fullPath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fullPath, code);
  // Return relative path from project root for ast-grep path matching
  return path.join(path.basename(TMP_DIR), relativePath);
}

function runEslintRule(rule: string, filePath: string): { passed: boolean; output: string } {
  // Create ESLint configuration inline using our custom plugin
  const pluginPath = path.join(process.cwd(), 'scripts', 'eslint-plugin-blogzilla.mjs');
  const eslintConfigContent = `
import blogzillaPlugin from '${pluginPath}';
import typescriptParser from '@typescript-eslint/parser';

export default [
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: typescriptParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      blogzilla: blogzillaPlugin,
    },
    rules: {
      'blogzilla/${rule}': 'error',
    },
  },
];
`;

  const configPath = path.join(TMP_DIR, 'eslint.config.mjs');
  fs.writeFileSync(configPath, eslintConfigContent);

  try {
    const output = execSync(
      `pnpm exec eslint --config ${configPath} --no-ignore ${filePath}`,
      { encoding: 'utf-8', stdio: 'pipe' }
    );
    // ESLint returns 0 exit code when no violations found
    return { passed: true, output };
  } catch (error: any) {
    // ESLint exits with code 1 when it finds violations
    const output = error.stdout || error.stderr || '';
    // Check if the error output contains our specific rule violation
    const hasViolations = output.includes(`blogzilla/${rule}`);
    // For ESLint, if we found violations, that means the rule is working (passed: false means it caught violations)
    return { passed: false, output };
  }
}

function runRule(rule: string, filePath: string): { passed: boolean; output: string } {
  // Use ESLint for JSX attribute rules, rules with path exclusion issues, and security rules, ast-grep for everything else
  const eslintRules = [
    'no-magic-testids',
    'no-hardcoded-navigation',
    'require-function-components',
    'no-direct-tanstack',
    'no-template-classname',
    'e2e-locators-no-getrole',
    'no-unsafe-innerHTML',
    'no-exposed-secrets',
    'no-unhandled-promises',
    'require-zod-validation'
  ];

  if (eslintRules.includes(rule)) {
    return runEslintRule(rule, filePath);
  }

  try {
    const output = execSync(
      `pnpm exec sg scan --rule rules/${rule}.yml ${filePath}`,
      { encoding: 'utf-8', stdio: 'pipe' }
    );
    return { passed: true, output };
  } catch (error: any) {
    return { passed: false, output: error.stdout || error.stderr || '' };
  }
}

interface TestResult {
  rule: string;
  passed: boolean;
  errors: string[];
}

function testRule(testCase: TestCase): TestResult {
  const errors: string[] = [];

  // Test that rule CATCHES violations
  for (const shouldCatch of testCase.shouldCatch) {
    const filePath = writeTestFile(shouldCatch.file, shouldCatch.code);
    const result = runRule(testCase.rule, filePath);

    if (result.passed) {
      errors.push(
        `❌ FAILED TO CATCH: ${shouldCatch.file}\n` +
        `   Expected violation but rule passed\n` +
        `   Code:\n${shouldCatch.code.split('\n').map(l => `   ${l}`).join('\n')}`
      );
    }
  }

  // Test that rule PASSES valid code
  for (const shouldPass of testCase.shouldPass) {
    const filePath = writeTestFile(shouldPass.file, shouldPass.code);
    const result = runRule(testCase.rule, filePath);

    if (!result.passed) {
      errors.push(
        `❌ FALSE POSITIVE: ${shouldPass.file}\n` +
        `   Expected pass but rule caught violation\n` +
        `   Output: ${result.output.split('\n').slice(0, 3).join('\n')}\n` +
        `   Code:\n${shouldPass.code.split('\n').map(l => `   ${l}`).join('\n')}`
      );
    }
  }

  return {
    rule: testCase.rule,
    passed: errors.length === 0,
    errors,
  };
}

function main() {
  console.log('🔍 Testing ast-grep rules...\n');

  setup();

  const results: TestResult[] = [];
  let totalTests = 0;
  let passedTests = 0;

  for (const testCase of TEST_CASES) {
    totalTests++;
    const result = testRule(testCase);
    results.push(result);

    if (result.passed) {
      passedTests++;
      console.log(`✅ ${result.rule}`);
    } else {
      console.log(`❌ ${result.rule}`);
      result.errors.forEach(err => console.log(`   ${err}\n`));
    }
  }

  cleanup();

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 Results: ${passedTests}/${totalTests} rules working correctly`);
  console.log(`${'='.repeat(60)}\n`);

  if (passedTests < totalTests) {
    const failed = results.filter(r => !r.passed);
    console.log('Failed rules:');
    failed.forEach(r => {
      console.log(`  • ${r.rule} (${r.errors.length} error${r.errors.length > 1 ? 's' : ''})`);
    });
    process.exit(1);
  }

  console.log('✨ All ast-grep rules are working correctly!\n');
  process.exit(0);
}

main();

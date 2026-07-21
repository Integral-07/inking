import { afterEach, describe, expect, it } from 'vitest'
import app from './index'
import { signUpTestUser, testEnv } from '../test/env'

describe('POST /api/extract', () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('returns 400 when url is missing', async () => {
    const res = await app.request('/api/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })

    expect(res.status).toBe(400)
  })

  it('extracts title, content and category from a page', async () => {
    globalThis.fetch = (async () =>
      new Response(
        `<html><head><title>Example Docs Page</title></head>
         <body><article><p>Hello world, this is the article body used for testing extraction.</p></article></body></html>`,
        { status: 200, headers: { 'Content-Type': 'text/html' } },
      )) as typeof fetch

    const res = await app.request('/api/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://docs.example.com/page' }),
    })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.sourceDomain).toBe('docs.example.com')
    expect(body.category).toBe('docs')
    expect(body.content).toContain('Hello world')
  })
})

describe('/api/articles', () => {
  it('rejects requests without an Authorization header', async () => {
    const res = await app.request('/api/articles')
    expect(res.status).toBe(401)
  })

  it('creates, lists and fetches an article for the authenticated user, isolated by RLS', async () => {
    const token = await signUpTestUser(`test-${crypto.randomUUID()}@example.com`)
    const authHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

    const createRes = await app.request(
      '/api/articles',
      {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ title: 'Test article', content: 'Some body text' }),
      },
      testEnv,
    )
    expect(createRes.status).toBe(201)
    const created = await createRes.json()
    expect(created.title).toBe('Test article')
    expect(created.category).toBe('other')

    const listRes = await app.request('/api/articles', { headers: authHeaders }, testEnv)
    expect(listRes.status).toBe(200)
    const list = await listRes.json()
    expect(list.some((article: { id: string }) => article.id === created.id)).toBe(true)

    const getRes = await app.request(`/api/articles/${created.id}`, { headers: authHeaders }, testEnv)
    expect(getRes.status).toBe(200)
    expect((await getRes.json()).title).toBe('Test article')

    const otherToken = await signUpTestUser(`other-${crypto.randomUUID()}@example.com`)
    const otherRes = await app.request(
      `/api/articles/${created.id}`,
      { headers: { Authorization: `Bearer ${otherToken}` } },
      testEnv,
    )
    expect(otherRes.status).toBe(404)
  })

  it('returns 404 for an article that does not belong to the caller or does not exist', async () => {
    const token = await signUpTestUser(`test-${crypto.randomUUID()}@example.com`)
    const res = await app.request(
      '/api/articles/00000000-0000-0000-0000-000000000000',
      { headers: { Authorization: `Bearer ${token}` } },
      testEnv,
    )
    expect(res.status).toBe(404)
  })
})

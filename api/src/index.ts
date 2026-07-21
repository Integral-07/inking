import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { authMiddleware } from './middleware/auth'
import { extractArticle } from './lib/readabilityExtractor'
import { inferCategory } from './lib/categoryInference'
import { ArticleRepository } from './repositories/article'
import { WritingRepository } from './repositories/writing'
import { addArticle, listArticles, getArticle } from './usecases/article'
import { getWriting, saveWriting } from './usecases/writing'
import type { AppEnv } from './env'

const app = new Hono<AppEnv>()

app.use('*', cors())

// No auth required: pure URL -> extracted text, no DB access.
app.post('/api/extract', async (c) => {
  const { url } = await c.req.json<{ url?: string }>()
  if (!url) return c.json({ error: 'url is required' }, 400)

  try {
    const extracted = await extractArticle(url)
    return c.json({ ...extracted, category: inferCategory(extracted.sourceDomain) })
  } catch (err) {
    return c.json({ error: err instanceof Error ? err.message : 'extraction failed' }, 422)
  }
})

app.get('/api/articles', authMiddleware, async (c) => {
  const repo = new ArticleRepository(c.get('supabase'))
  return c.json(await listArticles(repo))
})

app.post('/api/articles', authMiddleware, async (c) => {
  const repo = new ArticleRepository(c.get('supabase'))
  const body = await c.req.json<{ url?: string; title?: string; content?: string }>()

  try {
    const article = await addArticle(repo, body)
    return c.json(article, 201)
  } catch (err) {
    return c.json({ error: err instanceof Error ? err.message : 'failed to add article' }, 422)
  }
})

app.get('/api/articles/:id', authMiddleware, async (c) => {
  const repo = new ArticleRepository(c.get('supabase'))
  const article = await getArticle(repo, c.req.param('id'))
  if (!article) return c.json({ error: 'not found' }, 404)
  return c.json(article)
})

app.get('/api/writings/:articleId', authMiddleware, async (c) => {
  const repo = new WritingRepository(c.get('supabase'))
  const writing = await getWriting(repo, c.req.param('articleId'))
  return c.json(writing)
})

app.put('/api/writings/:articleId', authMiddleware, async (c) => {
  const repo = new WritingRepository(c.get('supabase'))
  const { contentMarkdown } = await c.req.json<{ contentMarkdown?: string }>()

  try {
    const writing = await saveWriting(repo, c.req.param('articleId'), contentMarkdown ?? '')
    return c.json(writing)
  } catch (err) {
    return c.json({ error: err instanceof Error ? err.message : 'failed to save writing' }, 422)
  }
})

export default app

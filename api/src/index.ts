import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { authMiddleware } from './middleware/auth'
import { extractArticle } from './lib/readabilityExtractor'
import { inferCategory } from './lib/categoryInference'
import { lookupWebSearch } from './lib/webSearch'
import { lookupWiktionary } from './lib/wiktionary'
import { ArticleRepository } from './repositories/article'
import { WritingRepository } from './repositories/writing'
import { VocabRepository } from './repositories/vocab'
import { addArticle, listArticles, getArticle } from './usecases/article'
import { listWritings, getWriting, saveWriting } from './usecases/writing'
import { addVocabEntry, listVocabEntries, getVocabEntry, updateVocabEntry } from './usecases/vocab'
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

// No auth required: pure term -> definition/excerpt, no DB access.
// Tries Wiktionary first (covers function words and idiomatic phrases the
// primary dictionary API misses), then falls back to a Wikipedia excerpt.
app.get('/api/lookup', async (c) => {
  const term = c.req.query('term')
  if (!term) return c.json({ error: 'term is required' }, 400)

  try {
    const wiktionary = await lookupWiktionary(term)
    if (wiktionary) {
      return c.json({
        text: `(${wiktionary.partOfSpeech.toLowerCase()}) ${wiktionary.definition}`,
        source: 'Wiktionary',
        sourceUrl: `https://en.wiktionary.org/wiki/${encodeURIComponent(term.trim().replace(/\s+/g, '_'))}`,
      })
    }

    const result = await lookupWebSearch(term)
    return c.json(result)
  } catch (err) {
    return c.json({ error: err instanceof Error ? err.message : 'lookup failed' }, 502)
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

app.get('/api/vocab', authMiddleware, async (c) => {
  const repo = new VocabRepository(c.get('supabase'))
  return c.json(await listVocabEntries(repo))
})

app.post('/api/vocab', authMiddleware, async (c) => {
  const repo = new VocabRepository(c.get('supabase'))
  const body = await c.req.json<{ term?: string; articleId?: string | null; definition?: string; contextQuote?: string }>()

  if (!body.term?.trim()) return c.json({ error: 'term is required' }, 400)

  try {
    const entry = await addVocabEntry(repo, {
      term: body.term.trim(),
      articleId: body.articleId ?? null,
      definition: body.definition,
      contextQuote: body.contextQuote,
    })
    return c.json(entry, 201)
  } catch (err) {
    return c.json({ error: err instanceof Error ? err.message : 'failed to add vocab entry' }, 422)
  }
})

app.get('/api/vocab/:id', authMiddleware, async (c) => {
  const repo = new VocabRepository(c.get('supabase'))
  const entry = await getVocabEntry(repo, c.req.param('id'))
  if (!entry) return c.json({ error: 'not found' }, 404)
  return c.json(entry)
})

app.patch('/api/vocab/:id', authMiddleware, async (c) => {
  const repo = new VocabRepository(c.get('supabase'))
  const body = await c.req.json<{ definition?: string; notes?: string }>()

  try {
    const entry = await updateVocabEntry(repo, c.req.param('id'), body)
    return c.json(entry)
  } catch (err) {
    return c.json({ error: err instanceof Error ? err.message : 'failed to update vocab entry' }, 422)
  }
})

app.get('/api/writings', authMiddleware, async (c) => {
  const repo = new WritingRepository(c.get('supabase'))
  return c.json(await listWritings(repo))
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

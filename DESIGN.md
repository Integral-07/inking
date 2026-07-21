# Inkling (Marginalia)

英文記事を読みながら気になった単語・表現を単語帳に貯め、記事について感想文を書くアプリ。

`.html` はUIデザインの方向性を示すモックアップ（実装はここから起こす）。

## 技術スタック

- フロントエンド: React + Vite（SPA）
- バックエンド: Hono on Cloudflare Workers
- データ/認証: Supabase（Postgres + Auth）。DBアクセスはすべてHono経由。
- 記事本文抽出: `linkedom`（Workers上で動くDOM実装）+ `@mozilla/readability`
  （`jsdom`はNode API依存でWorkersでは動かないため不使用）
- 辞書自動定義: Free Dictionary API（CORS許可あり、バックエンドを介さずUIから直接呼び出し）

## アーキテクチャ

```
UI (React, Vite)
  ├─ lib/supabaseClient.ts : ログイン/セッション管理のみ（Auth専用）
  ├─ lib/apiClient.ts      : Hono APIへの薄いfetchラッパー（Bearer付与）
  └─ hooks/                : 画面操作単位のロジック（apiClient経由でAPIを呼ぶ）

API (Hono, Cloudflare Workers)
  ├─ middleware/auth.ts    : Authorizationヘッダを検証し後続へ転送
  ├─ index.ts              : 全ルート定義（HTTPの入出力変換のみ、ロジックは書かない）
  ├─ usecases/             : ビジネスロジック本体（repositoriesを呼ぶ）
  └─ repositories/         : Supabaseへの読み書きだけを担当
```

Honoはservice role keyを持たず、リクエストごとにユーザーのSupabase JWTをそのまま
`supabase-js`クライアントに渡す。RLS（Row Level Security）が`user_id`で行を絞り込むため、
Workers側に強い権限のシークレットを置かずに済む。

ルールはシンプルに:
- `index.ts`（ルート）はHTTPの入出力変換のみ。ビジネスロジックを書かない
- `usecases/`がビジネスロジック本体（単語の統合ルール、カテゴリ推定など）を持ち、`repositories/`を呼ぶ
- `repositories/`はSupabaseのクエリだけに専念
- UI側の`hooks/`が画面操作の単位（記事追加、単語保存、自動保存）をまとめ、`components/`はそれを呼ぶだけの見た目担当

## データモデル（Supabase / Postgres）

```sql
create table articles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  url text,
  title text not null,
  source_domain text,
  category text,          -- 'news' | 'docs' | 'other'（ドメインから自動推定、手動変更可）
  content text,           -- Readabilityで抽出した本文
  added_at timestamptz default now()
);

create table vocab_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  article_id uuid references articles(id) on delete set null,
  term text not null,
  definition text,
  notes text,
  context_quote text,     -- 最初に選択した際の文脈のみ保持
  review_count int default 1,  -- カードの「×N」= 選択・出現回数
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, lower(term))  -- 同じ単語は統合してカウントアップ
);

create table writings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  article_id uuid references articles(id) on delete cascade,
  content_markdown text default '',
  updated_at timestamptz default now(),
  unique (user_id, article_id)
);
```

全テーブルRLSで `user_id = auth.uid()` に制限。

## API（Hono）

| Method/Path | 用途 |
|---|---|
| `POST /api/extract` | `{ url }` → `{ title, content, sourceDomain, category }`（DBアクセスなし） |
| `GET/POST /api/articles` | 一覧取得 / 新規追加（extract結果を保存） |
| `GET /api/articles/:id` | 記事詳細 |
| `GET/POST /api/vocab` | 一覧取得 / 追加（upsert、既存語ならreview_count++） |
| `GET/PATCH /api/vocab/:id` | 詳細取得 / 定義・メモ更新 |
| `GET/PUT /api/writings/:articleId` | 感想文の取得 / 自動保存（upsert） |

## フロントエンド ルーティング

| Path | 画面 |
|---|---|
| `/` | 01 Library |
| `/article/:id` | 02 Reading |
| `/vocab` | 03 Vocabulary |
| `/vocab/:id` | 04 Word detail |
| `/article/:id/write` | 05 Writing |
| `/login` | Supabase magic-link認証 |

## 主要フロー

**A. 記事追加**
URLを`/api/extract`に送信 → linkedom+Readabilityで本文抽出、ドメインからカテゴリ自動推定
→ フロントでプレビュー確認後`/api/articles`にPOSTして保存。抽出失敗時は本文貼り付けUIにフォールバック。

**B. 選択→単語帳（核となる操作）**
`article-text`内で`mouseup`/`touchend`時に`window.getSelection()`を検知 → 選択範囲近くに
`.select-pop`（"＋ink this"）を表示 → クリックで選択語をキャプチャし、単語を含む文を`context_quote`として抽出
→ 単語(1語)のみFree Dictionary APIをUIから直接呼んで定義を自動プリフィル
→ `/api/vocab`にPOST（バックエンドでupsert、既存語（大小文字無視）なら`review_count`++、
`context_quote`は初回のみ保持）→ 画面下部の`float-badge`カウントをリアルタイム更新。

**C. Vocabulary一覧**
`/api/vocab`から取得しクライアント側検索フィルタ。カードの✕スタンプ = `review_count`。

**D. Word detail**
定義・メモをインライン編集、blur時にデバウンスして`/api/vocab/:id`にPATCH。
「ink it」ボタン = 編集内容の確定保存。

**E. Writing**
左＝原文（読み取り専用）、右＝Markdownエディタ＋プレビュー切替。入力後デバウンスで
`/api/writings/:articleId`にPUT。モバイルはタブ切替（モックアップのJSロジックをReact stateに移植）。

## プロジェクト構成

```
inking/
  api/                      # Hono on Cloudflare Workers
    src/
      index.ts              # Honoアプリ本体 + 全ルート定義
      usecases/
        addArticle.ts
        listArticles.ts
        addVocabEntry.ts
        updateVocabEntry.ts
        listVocabEntries.ts
        saveWriting.ts
      repositories/
        articleRepository.ts
        vocabRepository.ts
        writingRepository.ts
      lib/
        readabilityExtractor.ts
        supabaseClient.ts
      middleware/
        auth.ts
      types.ts
    wrangler.toml

  ui/                       # Vite + React SPA
    src/
      components/
        Sidebar.tsx
        ArticleContent.tsx / SelectionPopover.tsx / InklingBadge.tsx
        VocabCard.tsx / VocabSearch.tsx
        WriteShell.tsx / MarkdownEditor.tsx / MarkdownPreview.tsx
      pages/
        Library.tsx / Reading.tsx / Vocab.tsx / VocabDetail.tsx / Write.tsx / Login.tsx
      hooks/
        useAddArticle.ts
        useSelectionToVocab.ts
        useAutosaveWriting.ts
      lib/
        supabaseClient.ts    # Auth専用
        apiClient.ts         # backend(Hono)呼び出しの薄いfetchラッパー(Bearer付与)
      types.ts
    vite.config.ts

  .html                      # 元のUIモックアップ
  README.md
```

## 確定した設計判断

- カテゴリタグ: 固定セット(News/Docs/Other)を自動推定
- 単語の統合: 複数記事で同じ単語を選択しても1エントリに統合し回数をカウント
- 辞書自動定義: 単語(1語)のみ自動、フレーズは手入力。UIから直接Free Dictionary APIを呼ぶ
- Hono実行環境: Cloudflare Workers
- Supabaseの役割: DB/Authのみ。全APIアクセスはHono経由、RLSに絞り込みを一任（service role keyは使わない）
- フロントエンド: Vite + React（SPA）
- ルーティング(Hono)は`index.ts`に集約し、`usecases/`と`repositories/`で層を分ける

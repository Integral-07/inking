# Inkling (Marginalia)

英文記事を読みながら気になった単語・表現を単語帳に貯め、記事について感想文を書くアプリ。

設計・アーキテクチャの詳細は [DESIGN.md](./DESIGN.md) を参照。

## 構成

npm workspaces によるモノレポ。

```
inking/
  api/                # Hono on Cloudflare Workers（バックエンド）
  ui/                 # Vite + React SPA（フロントエンド）
  packages/
    shared-types/     # api/uiで共有するDTO型（Article, VocabEntry, Writing）
  supabase/           # DBスキーマのマイグレーションとローカルスタック設定
  .html               # UIデザインの方向性を示す初期モックアップ（参照用）
  DESIGN.md           # アーキテクチャ・設計判断
```

## 必要なもの

- Node.js 22+
- Docker（ローカルSupabaseスタック用）

## セットアップ

```bash
npm install

# ローカルSupabaseスタック（Postgres + Auth + PostgREST）をDockerで起動
npx supabase start
```

`npx supabase status` で表示される `API_URL` / `ANON_KEY` を使って `ui/.env` を作成する。

```bash
cp ui/.env.example ui/.env
# ui/.env を supabase status の値で編集
```

`api/wrangler.jsonc` の `vars` はデフォルトでローカルSupabase（`http://127.0.0.1:54321`）を向いているので、
ローカル開発では特に変更不要。

## 開発サーバー

```bash
npm run dev -w api   # http://localhost:8787
npm run dev -w ui    # http://localhost:5173
```

## テスト

```bash
npm run test -w api
```

`api`のテストはローカルSupabaseスタックに対して実行するエンドポイントテスト（`npx supabase start`が起動している必要がある）。

## 型チェック / ビルド

```bash
npm run typecheck -w api
npm run build -w ui   # 型チェック + vite build
```

## DBスキーマの変更

`supabase/migrations/` にマイグレーションを追加し、ローカルに反映する場合は以下を実行。

```bash
npx supabase db reset
```

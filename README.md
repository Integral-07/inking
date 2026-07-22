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

## CI/CD

`.github/workflows/ci-cd.yml` で以下を実行する。

- PR・push時: `api`の型チェック、`ui`のビルド（型チェック込み）、`api`のテスト（ローカルSupabaseをCI上で起動）
- `main`へのpush時（上記が全て通った場合のみ）: 本番Supabaseへのマイグレーション適用 → `api`をCloudflare Workersへデプロイ → `ui`をCloudflare Pagesへデプロイ

GitHubリポジトリの Settings → Secrets and variables → Actions に以下を登録しておく。

| Secret | 用途 |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Workers/Pagesへのデプロイ権限を持つAPIトークン |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflareのアカウント ID |
| `SUPABASE_ACCESS_TOKEN` | `supabase link`/`db push`用の個人アクセストークン |
| `SUPABASE_PROJECT_REF` | 本番Supabaseプロジェクトのref |
| `SUPABASE_DB_PASSWORD` | 本番SupabaseのDBパスワード |
| `PROD_SUPABASE_URL` | 本番SupabaseのAPI URL（`api`のsecret設定・`ui`のビルド両方で使用） |
| `PROD_SUPABASE_ANON_KEY` | 本番Supabaseのanon key（同上） |
| `PROD_API_BASE_URL` | デプロイ済み`api`のURL（`ui`のビルド時に埋め込む） |

`ui`をCloudflare Pagesへ初回デプロイする前に、`wrangler pages project create inkling` を一度手動で実行してプロジェクトを作成しておく必要がある。

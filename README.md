# Task Manager Frontend

## 概要

Task Manager の研修用フロントエンドです。  
Next.js (App Router) + TypeScript で構成されています。

## 前提条件

- Docker Desktop
- Docker Compose v2
- `task_manager_back` が起動していること

## セットアップ

```bash
cp .env.example .env
```

`.env` に以下を設定してください。

- `NEXTAUTH_SECRET`
- `ENCRYPTION_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXT_PUBLIC_API_BASE_URL`（例: `http://host.docker.internal:8000`）

起動:

```bash
docker compose up -d
```

## 動作確認

- `http://localhost:3000` でログイン画面が表示される
- Googleログイン後にダッシュボードへ遷移できる
- Summary / UpcomingTasks / RecentEmails（モック）が表示される

## 品質チェック

```bash
docker compose exec nextjs-app npm run lint
docker compose exec nextjs-app npm run format:check
docker compose exec nextjs-app npm run type-check
docker compose exec nextjs-app npm run build
docker compose exec nextjs-app npm test
```

## 補足

- スケルトン期間中は `GET /api/v1/tasks` 未実装のため、タスク一覧でエラー表示になることがあります（想定挙動）。

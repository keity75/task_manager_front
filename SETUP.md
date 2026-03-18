# Task Manager Frontend - セットアップガイド

## 概要

このプロジェクトは、Next.js 15 (TypeScript) + Tailwind CSS + Radix UIを使用したTask Managerフロントエンドアプリケーションです。Docker環境で開発できるよう設定されています。

## 技術スタック

- **Next.js 15**
- **React 19**
- **TypeScript 5**
- **Tailwind CSS 4**
- **Radix UI** コンポーネント群
- **Node.js 20** (LTS)

## 前提条件

以下のソフトウェアがインストールされている必要があります：

- [Docker](https://www.docker.com/get-started) (最新版)
- [Docker Compose](https://docs.docker.com/compose/install/) (最新版)
- [Git](https://git-scm.com/) (最新版)

### Dockerのインストール確認

```bash
docker --version
docker compose version
```

## 開発環境の選択

このプロジェクトでは、2つの開発環境の構築方法を提供しています：

1. **Dev Containers（推奨）**: VS Codeでコンテナ内で直接開発できる方法
2. **Docker Compose**: docker composeを使用する方法

### Dev Containersを使用する場合（推奨）

Dev Containersを使用すると、VS Code内でコンテナ環境で直接開発でき、環境の一貫性が保たれます。

#### 前提条件

- [VS Code](https://code.visualstudio.com/) (最新版)
- [Dev Containers拡張機能](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

#### セットアップ手順

1. VS Codeでこのプロジェクトを開く
2. コマンドパレット（`Cmd+Shift+P` / `Ctrl+Shift+P`）を開く
3. 「Dev Containers: Reopen in Container」を選択
4. 初回のみ、コンテナのビルドとnpmパッケージのインストールが自動で実行されます（数分かかる場合があります）
5. コンテナが起動すると、自動的に開発サーバーが起動します

#### 動作確認

ブラウザで以下のURLにアクセスしてください：

```
http://localhost:3000
```

ログイン画面が表示されれば、フロントエンドの起動は成功です。

#### コンテナ内でのコマンド実行

Dev Containersを使用している場合、ターミナルで直接コマンドを実行できます：

```bash
# npmコマンドの実行
npm run build
npm run lint
npm run format
```

### Docker Composeを使用する場合

## 環境構築手順（Docker Compose使用時）

### 1. リポジトリのクローン

```bash
git clone <your-repository-url>
cd task_manager_front
```

### 2. 環境変数ファイルの作成

```bash
cp .env.example .env
```

`.env` に以下を設定してください：

- `NEXTAUTH_SECRET`
- `ENCRYPTION_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXT_PUBLIC_API_BASE_URL`（Docker環境では `http://host.docker.internal:8000`）

### 3. Dockerコンテナの起動

```bash
docker compose up
```

初回起動時は、npmパッケージのインストールが自動で実行されます。完了まで数分かかる場合があります。

### 4. 動作確認

ブラウザで以下のURLにアクセスしてください：

```
http://localhost:3000
```

ログイン画面が表示されれば、環境構築は成功です。

## 開発

### ホットリロード機能

- ソースコード（`.tsx`、`.ts`、`.css`ファイルなど）を編集・保存すると、自動的にブラウザがリロードされます
- Next.js 15のFast Refreshが有効になっています

### ファイル構造

```
task_manager_front/
├── src/                    # Next.js App Router / components / lib
├── .devcontainer/          # Dev Containers設定（Dev Containers使用時）
├── Dockerfile              # Docker設定
├── docker-compose.yml      # Docker Compose設定
├── package.json            # 依存関係
├── next.config.mjs         # Next.js設定
├── tsconfig.json           # TypeScript設定
├── tailwind.config.ts      # Tailwind CSS設定
├── postcss.config.mjs      # PostCSS設定
├── .dockerignore           # Docker除外ファイル
├── .gitignore              # Git除外ファイル
└── SETUP.md                # このファイル
```

## コマンド

### Docker Composeコマンド

```bash
# コンテナ起動
docker compose up

# バックグラウンドで起動
docker compose up -d

# コンテナ停止
docker compose down

# コンテナ再ビルド
docker compose up --build

# ログ確認
docker compose logs -f
```

### コンテナ内でのコマンド実行

```bash
# コンテナ内でシェルを実行
docker compose exec nextjs-app sh

# npmコマンドの実行（nodeユーザーとして実行されます）
docker compose exec nextjs-app npm run build
docker compose exec nextjs-app npm run lint
docker compose exec nextjs-app npm run format:check
docker compose exec nextjs-app npm run type-check
docker compose exec nextjs-app npm test
```

## トラブルシューティング

### Dev Containers関連

#### コンテナが起動しない場合

VS Codeのコマンドパレットから「Dev Containers: Rebuild Container」を実行してください。

または、手動でコンテナを再ビルド：

```bash
docker compose down
docker compose build --no-cache
```

#### 拡張機能がインストールされない場合

VS Codeのコマンドパレットから「Dev Containers: Rebuild Container」を実行してください。

#### ポート転送が機能しない場合

VS Codeのポートタブでポート3000が転送されているか確認してください。自動転送されない場合は、手動でポートを転送できます。

#### 権限エラーが発生する場合

Dockerfileの更新により、現在は非rootユーザー（node）として実行されるよう設定されており、権限エラーは発生しにくくなっています。
それでも問題が発生する場合は、コンテナを再ビルドしてください：

```bash
docker compose down
docker compose build --no-cache
docker compose up
```

### Docker Compose関連

#### ポート3000が既に使用されている場合

```bash
# ポート3000を使用しているプロセスを確認
lsof -nP -iTCP:3000 -sTCP:LISTEN
```

競合しているプロセスまたはコンテナを停止後、再起動してください。

#### コンテナが起動しない場合

```bash
# コンテナと不要リソースを削除
docker compose down
docker system prune -f

# 再ビルドして起動
docker compose up --build
```

#### node_modulesの競合エラー

```bash
# コンテナ停止
docker compose down

# コンテナ再起動
docker compose up
```

#### キャッシュクリア

```bash
# Dockerのビルドキャッシュをクリア
docker builder prune

# Next.jsのキャッシュをクリア
docker compose exec nextjs-app rm -rf .next
```

## ネットワーク設定

このプロジェクトは `app-network` というDockerネットワークを使用しています。バックエンドを同時に起動する場合は、`NEXT_PUBLIC_API_BASE_URL` の値を確認してください。

## 研修向け補足

- ダッシュボードは `Task Summary` と `UpcomingTasks`（読み取り専用）を表示します。
- `RecentEmails` はモック表示です。
- バックエンドスケルトンの進行段階によっては `GET /api/v1/tasks` が未実装で、タスク一覧にエラーメッセージが表示されることがあります（想定挙動）。

# KnowHub

KnowHubは、社内で発生する「わからない」を気軽に投稿・共有できるナレッジ共有アプリです。 

新入社員や若手社員が質問しやすい環境を作り、回答内容を組織のナレッジとして蓄積することで、同じ質問の繰り返しや知識の属人化を防ぐことを目的としています。

AIによる質問文整理サポートを行い、質問者が内容を言語化しやすくすることも特徴です。

---

## 🚀 技術スタック

### フロントエンド

| 項目 | 内容 |
|------|------|
| Framework | React (Vite) |
| Language | TypeScript |
| UI Library | MUI (Material UI) |
| Tooling | Prettier |

### バックエンド

| 項目 | 内容 |
|------|------|
| Runtime | Node.js |
| Framework | Express |
| Language | TypeScript |
| Database | Supabase |
| API | REST API (JSON形式) |

---

## 🛠 セットアップ手順

### 1. リポジトリのクローン

```bash
git clone https://github.com/ユーザー名/リポジトリ名.git
cd リポジトリ名
```

### 2. バックエンドのセットアップ

```bash
cd backend
npm install
```

`backend/.env` を作成し、以下の内容を設定してください：

```env
PORT=5000
SUPABASE_URL=あなたのURL
SUPABASE_ANON_KEY=あなたのキー
```

### 3. フロントエンドのセットアップ

```bash
cd ../frontend
npm install
```

`frontend/.env.local` を作成し、以下の内容を設定してください：

```env
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=あなたのURL
VITE_SUPABASE_ANON_KEY=あなたのキー
```

---

## 🏃 実行方法

2つのターミナルを開き、それぞれで以下のコマンドを実行します。

**バックエンドサーバー** (`http://localhost:3002`)

```bash
cd backend
npm run dev
```

**フロントエンドサーバー** (`http://localhost:5173`)

```bash
cd frontend
npm run dev
```

---

## 📂 ディレクトリ構成

```
.
├── backend/            # Expressプロジェクト
│   ├── src/            # TypeScriptソースファイル
│   ├── dist/           # コンパイル後のJS（Git除外）
│   ├── .env            # 環境変数（Git除外）
│   └── tsconfig.json   # TypeScript設定
├── frontend/           # Reactプロジェクト
│   ├── src/            # コンポーネント、ページ、ロジック
│   ├── .env.local      # 環境変数（Git除外）
│   └── vite.config.ts  # Vite設定
└── README.md           # このファイル
```

---

## 🤝 チーム開発ルール

- **ブランチ名**: `feature/機能名` の形式で作成してください
- **プルリクエスト**: 必ず1人以上のレビューを経てから `main` ブランチへマージします
- **コード整形**: 保存時に Prettier が自動適用されるよう、VS Code の設定を推奨します

---

## 🎨 デザイン

[Figma設計ドキュメント](#)

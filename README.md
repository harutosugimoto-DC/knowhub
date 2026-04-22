# KnowHub

プロジェクトの概要をここに記述します（例：ナレッジ共有・管理プラットフォーム）。

## 🚀 技術スタック

### フロントエンド
- **Framework**: React (Vite)
- **Language**: TypeScript
- **UI Library**: MUI (Material UI)
- **Tooling**: Prettier

### バックエンド
- **Runtime**: Node.js
- **Framework**: Express
- **Language**: TypeScript
- **Database**: Supabase
- **API**: REST API (JSON形式)

---

## 🛠 セットアップ手順

### 1. リポジトリのクローン
```bash
git clone [https://github.com/ユーザー名/リポジトリ名.git](https://github.com/ユーザー名/リポジトリ名.git)
cd リポジトリ名
2. バックエンドのセットアップ
Bash
cd backend
npm install
backend/.env を作成し、以下の内容を設定してください：

Plaintext
PORT=5000
SUPABASE_URL=あなたのURL
SUPABASE_ANON_KEY=あなたのキー
3. フロントエンドのセットアップ
Bash
cd ../frontend
npm install
frontend/.env.local を作成し、以下の内容を設定してください：

Plaintext
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=あなたのURL
VITE_SUPABASE_ANON_KEY=あなたのキー
🏃‍♂️ 実行方法
2つのターミナルを開き、それぞれのディレクトリで以下のコマンドを実行します。

バックエンドサーバー (http://localhost:5000)

Bash
cd backend
npm run dev
フロントエンドサーバー (http://localhost:5173)

Bash
cd frontend
npm run dev
📂 ディレクトリ構成
Plaintext
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
🤝 チーム開発ルール
ブランチ名: feature/機能名 のように作成してください。

プルリクエスト: 必ず1人以上のレビューを経てから main ブランチへマージします。

コード整形: 保存時に Prettier が自動適用されるように VS Code の設定を推奨します。

🎨 デザイン
Figma設計ドキュメント
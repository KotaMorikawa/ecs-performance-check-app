# ECS Performance Check App

Next.js 15.3.4の主要機能をAWS ECS環境で動作させ、パフォーマンスメトリクスを可視化するデモアプリケーション。

## システムアーキテクチャ

### AWS ECSサイドカーパターン構成

3つのコンテナを1つのECSタスクで実行する特殊な構成：

- **Next.js Container** (port 3000): メインアプリケーション、SSR/SSG/ISR処理
- **Hono Backend Container** (port 8000): バックエンドサーバー、ビジネスロジック
- **PostgreSQL Container** (port 5432): データベースサーバー

### 内部通信フロー

```
ユーザー → CloudFront → ALB → Next.js Container (3000)
                                     ↓ localhost:8000
                               Hono Container (8000)
                                     ↓ localhost:5432
                               PostgreSQL Container (5432)
```

## 主要開発コマンド

### ローカル開発

```bash
# Docker Compose 環境起動
npm run dev
# または
npm run dev:docker

# 個別サービス開発
npm run dev:frontend    # Next.js 開発サーバー (3000)
npm run dev:backend    # Hono バックエンドサーバー (8000)

# データベース操作
npm run db:migrate     # Prisma マイグレーション
npm run db:seed        # テストデータ投入
```

### ビルド・品質チェック

```bash
# ビルド
npm run build          # 全体ビルド
npm run build:frontend # Next.js ビルド (standalone出力)
npm run build:backend  # Hono バックエンドビルド

# 品質チェック（実装完了前に必須実行）
npm run lint           # ESLint
npm run typecheck      # TypeScript型チェック
npm run test           # 全テスト実行
npm run test:e2e       # E2Eテスト
```

### Dockerクリーンアップ

```bash
# Docker Composeサービス停止・削除
npm run docker:down

# 完全クリーンアップ（コンテナ・イメージ・ボリューム・キャッシュ削除）
npm run docker:clean

# 完全リセット（システム全体のDocker要素削除）
npm run docker:reset
```

### デプロイメント

```bash
# AWS デプロイ
npm run deploy:ecr     # ECR イメージプッシュ
npm run deploy:ecs     # ECS サービスデプロイ
npm run deploy:all     # フルデプロイ
```

## 実装されたNext.js 15.3.4機能

### ルーティング機能

1. **基本的なApp Router** (`/features/routing/basic`)
   - Next.js 15.3.4のApp Routerデモ
   - パフォーマンスメトリクス表示
   - 他機能へのナビゲーション

2. **動的ルーティング** (`/features/routing/dynamic/[id]`)
   - URLパラメータ`[id]`による動的ページ生成
   - リアルタイムデータ読み込みシミュレーション
   - パラメータ情報の表示

3. **ネストされたレイアウト** (`/features/routing/nested-layout`)
   - 階層的なレイアウト組み合わせ
   - レイアウト継承の可視化
   - 共通要素の管理

4. **ローディング・エラーハンドリング** (`/features/routing/loading-error`)
   - `loading.tsx`による自動ローディングUI
   - `error.tsx`によるエラーバウンダリ
   - 手動ローディング状態管理

5. **ルートグループ** (`/features/routing/public`, `/features/routing/admin`)
   - `(route-groups)`によるURL構造に影響しないフォルダ構成
   - パブリックエリアと管理エリアのデモ
   - 認証状態のシミュレーション

6. **並列・インターセプトルート** (`/features/routing/parallel-intercept`)
   - Parallel Routesによる複数スロット同時レンダリング
   - Intercepting Routesによるモーダル表示
   - 高度なルーティングパターンのデモ

### パフォーマンス監視機能

全機能ページで以下メトリクスをリアルタイム表示：

- **Core Web Vitals**: LCP、CLS、INP、FCP、TTFB測定
- **レンダリング時間**: サーバー・クライアント別計測
- **ネットワーク統計**: リクエスト数、応答時間
- **キャッシュ効率**: Next.js・CloudFront別ヒット率
- **コンテナ間通信**: localhost通信レイテンシー

## ファイル構成

```
ecs-performance-check-app/
├── apps/
│   ├── frontend/                    # Next.js アプリケーション
│   │   ├── app/
│   │   │   ├── features/routing/    # ルーティング機能デモ
│   │   │   ├── components/          # 共通コンポーネント
│   │   │   ├── hooks/               # カスタムフック
│   │   │   └── api/                 # API Routes
│   │   └── __tests__/               # テストファイル
│   └── backend/                     # Hono バックエンドサーバー
│       ├── src/routes/              # APIエンドポイント
│       └── prisma/                  # データベーススキーマ
├── infrastructure/
│   ├── docker/
│   │   └── docker-compose.yml       # ローカル開発環境
│   ├── ecs/                         # ECS設定
│   └── scripts/                     # デプロイスクリプト
└── package.json                     # モノレポ管理
```

## 技術スタック

### フロントエンド
- **Next.js 15.3.4**: App Router、Server Actions、SSR/SSG/ISR
- **React 18**: コンポーネント開発
- **TypeScript**: 型安全性
- **Tailwind CSS**: ユーティリティファーストCSS
- **web-vitals**: Core Web Vitals測定

### バックエンド
- **Hono**: 高性能バックエンドframework
- **PostgreSQL 15**: リレーショナルデータベース
- **Prisma**: ORM・型安全データアクセス

### インフラ・デプロイ
- **AWS ECS Fargate**: コンテナオーケストレーション
- **Amazon EFS**: PostgreSQL データ永続化
- **Docker**: コンテナ化・開発環境

## テスト

### テスト実行
```bash
# 全テスト実行
npm run test

# E2Eテスト実行
npm run test:e2e
```

### テストカバレッジ
- **テストファイル**: 10個
- **テストケース**: 77個
- **全機能**: ルーティング、パフォーマンス、エラーハンドリング

## 品質基準

### デプロイ前必須チェック
- **Lighthouse Score**: 90点以上
- **Core Web Vitals**: 全項目で良好評価
- **TypeScript**: 型エラー0件
- **ESLint**: ルール違反0件
- **テスト**: 全テストパス

### パフォーマンス目標
- **CloudFront Hit Rate**: 80%以上
- **コンテナ間通信**: 1ms未満レイテンシー
- **ファーストロードJS**: 131kB以下

## 開発開始方法

1. **環境セットアップ**
   ```bash
   git clone <repository>
   cd ecs-performance-check-app
   npm install
   ```

2. **Docker環境起動**
   ```bash
   npm run dev:docker
   ```

3. **アクセス確認**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8000
   - Database: localhost:5432

4. **機能確認**
   - http://localhost:3000/features/routing/basic からスタート

## トラブルシューティング

### Dockerクリーンアップ
```bash
# 段階的クリーンアップ
npm run docker:down   # サービス停止のみ
npm run docker:clean  # 完全クリーンアップ
npm run docker:reset  # 完全リセット
```

### よくある問題
- **ポート競合**: 3000, 8000, 5432ポートが使用済みでないか確認
- **Docker容量不足**: `npm run docker:clean`で容量確保
- **データベース接続エラー**: PostgreSQLコンテナの起動確認

## ライセンス

MIT
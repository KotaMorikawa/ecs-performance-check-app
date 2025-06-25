# 実装要件仕様書 (REQUIREMENTS.md)

このドキュメントでは、ECS Performance Check App の詳細な実装要件を定義します。

## 🎯 実装目標

Next.js 15.3.4 の主要機能を AWS ECS 環境で完全に動作させ、各機能のパフォーマンスメトリクスを可視化するデモアプリケーションを構築する。バックエンドは ECS サイドカーパターンで Hono + PostgreSQL を使用し、AWS 内で完結する構成とする。

## 🏗️ システムアーキテクチャ

本システムは、**AWS**インフラストラクチャ内で完結する構成で構築します。

### 全体構成図

```
┌──────────────────────────────────────────────────────────────┐
│                         ユーザー                              │
└────────────────────┬─────────────────────────────────────────┘
                     │
        ┌────────────▼────────────┐
        │   Amazon CloudFront     │ (CDN: 静的アセット配信) --- [S3]
        └────────────┬────────────┘
                     │
┌────────────────────│────────────────────────────────────────┐
│   ┌────────────────▼────────────┐                          │
│   │ Application Load Balancer   │ (トラフィック分散)        │
│   └────────────────┬────────────┘                          │
│                    │                                        │
│   ┌────────────────▼────────────────────────────┐          │
│   │    AWS Fargate (ECS Task)                   │          │
│   │    ┌─────────────────────────────────┐     │          │
│   │    │ Next.js Container (port 3000)   │     │          │
│   │    │ - SSR/SSG/ISR                   │     │          │
│   │    │ - App Router                    │     │          │
│   │    └──────────┬──────────────────────┘     │          │
│   │               │ localhost:8000              │          │
│   │    ┌──────────▼──────────────────────┐     │          │
│   │    │ Hono API Container (port 8000)  │     │          │
│   │    │ - RESTful API                   │     │          │
│   │    │ - Business Logic                │     │          │
│   │    └──────────┬──────────────────────┘     │          │
│   │               │ localhost:5432              │          │
│   │    ┌──────────▼──────────────────────┐     │          │
│   │    │ PostgreSQL Container (port 5432)│     │          │
│   │    │ - Data Persistence              │     │          │
│   │    └─────────────────────────────────┘     │          │
│   │               │                             │          │
│   │    ┌──────────▼──────────────────────┐     │          │
│   │    │ EFS Volume Mount                │     │          │
│   │    │ - PostgreSQL Data               │     │          │
│   │    └─────────────────────────────────┘     │          │
│   └─────────────────────────────────────────────┘          │
│                                                            │
│   プライベートサブネット（NAT Gateway不要）                   │
└────────────────────────────────────────────────────────────┘
```

### AWS 構成詳細

#### インフラストラクチャ層

- **Amazon CloudFront**:
  - 静的アセット（JS、CSS、画像）のグローバル配信
  - エッジロケーションでのキャッシュ
  - SSL/TLS 終端
  - S3 オリジンからの静的ファイル配信
- **Application Load Balancer (ALB)**:
  - 複数の Fargate タスクへのトラフィック分散
  - ヘルスチェックによる自動フェイルオーバー
  - Next.js コンテナ（3000 番ポート）への転送
- **Amazon S3**:
  - 静的アセット保存（画像、フォント、アイコン等）
  - ユーザーアップロードファイルの永続保存
  - CloudFront のオリジンとして機能
  - バージョニングとライフサイクル管理
- **VPC 構成**:
  - パブリックサブネット: ALB 配置
  - プライベートサブネット: Fargate タスク配置
  - **NAT Gateway 不要**: 外部通信が発生しない設計（S3 は VPC エンドポイント経由）

#### コンテナ構成（ECS サイドカーパターン）

- **AWS Fargate (ECS)**:
  - 3 つのコンテナを 1 つのタスクで実行
  - オートスケーリング対応（シングルタスク推奨）
  - サーバーレスコンテナ管理
- **Next.js Container**:
  - メインアプリケーション（3000 番ポート）
  - SSR/SSG/ISR 処理
  - 静的アセット配信
- **Hono API Container**:
  - API サーバー（8000 番ポート）
  - ビジネスロジック実装
  - データベース接続管理
- **PostgreSQL Container**:
  - データベースサーバー（5432 番ポート）
  - トランザクション管理
  - データ永続化

#### ストレージ層

- **Amazon EFS**:
  - PostgreSQL データの永続化
  - アクセスポイントによるセキュアなマウント
  - 自動バックアップ
- **Amazon S3**:
  - 静的アセットストレージ（`/public`フォルダの内容）
  - ユーザーアップロードファイル保存
  - CloudFront との統合
  - ライフサイクルポリシーによるコスト最適化

### 責任分担

| レイヤー                 | コンテナ/サービス  | 責任範囲                               |
| ------------------------ | ------------------ | -------------------------------------- |
| **プレゼンテーション層** | Next.js            | UI/UX、SSR/SSG/ISR、ルーティング       |
| **API 層**               | Hono               | ビジネスロジック、認証、バリデーション |
| **データ層**             | PostgreSQL         | データ永続化、トランザクション         |
| **キャッシュ層**         | Next.js/CloudFront | 静的・動的コンテンツキャッシュ         |
| **ファイル管理**         | S3/EFS             | 静的アセット（S3）、DB ファイル（EFS） |

### データフロー

1. **ユーザーリクエスト** → CloudFront → ALB → Next.js Container
2. **API リクエスト** → Next.js → localhost:8000 → Hono Container
3. **データ操作** → Hono → localhost:5432 → PostgreSQL
4. **レスポンス** → 逆順で返却
5. **リバリデーション** → Hono → Next.js `/api/revalidate` → キャッシュ更新

## 📋 機能別詳細要件

### 1. ルーティング機能 (`/features/routing`)

#### 必須実装項目

- **基本 App Router**: `/features/routing/basic` - App Router の基本動作
- **動的ルート**: `/features/routing/dynamic/[id]` - パラメータ取得とページ生成
- **Catch-all**: `/features/routing/catchall/[...slug]` - 複数セグメント対応
- **ルートグループ**: `/features/routing/(admin)/dashboard` - UI に影響しない組織化
- **パラレルルート**: `/features/routing/@analytics` - 同時表示セクション
- **インターセプトルート**: `/features/routing/(.)modal` - モーダル実装
- **ネストレイアウト**: 階層的レイアウト構成

#### 技術要件

- すべてのルートパターンで SSR 対応
- 動的ルート生成時のパフォーマンス測定
- ルート間ナビゲーションの速度測定
- エラーハンドリング（404、500）の実装
- CloudFront 経由でのルーティング動作確認

### 2. Server Actions (`/features/server-actions`)

#### 必須実装項目

- **ローカル API 連携**: Server Actions から Hono API を呼び出し
- **プログレッシブエンハンスメント**: JavaScript 無効時の動作保証
- **リアルタイムバリデーション**: クライアント・サーバー連携検証
- **楽観的更新**: `useOptimistic`フックの活用
- **エラーハンドリング**: try-catch、Error Boundary の実装

#### 技術要件

- CSRF 保護の実装
- バリデーションエラーの適切な表示
- 非同期処理時の UI 状態管理
- localhost 通信によるレスポンス時間の測定と表示
- コンテナ間通信の最適化

### 3. データフェッチング (`/features/data-fetching`)

#### 必須実装項目

- **SSG 実装**: `generateStaticParams`による静的生成
- **SSR 実装**: Hono API からのサーバーサイドデータ取得
- **ISR 実装**: `revalidate`による段階的更新
- **並列フェッチ**: `Promise.all`による効率的データ取得
- **クライアントフェッチ**: `useEffect`、SWR パターン
- **コンポーネント別キャッシュ**: 各コンポーネントで異なるキャッシュ戦略

#### 技術要件

- データ取得エラーの適切な処理
- ローディング状態の管理
- データ更新時の再取得戦略
- API 応答時間の測定
- Next.js fetch オプションによるキャッシュ制御
- CloudFront 経由での静的アセット配信確認

### 4. キャッシュとリバリデート (`/features/caching`)

#### 必須実装項目

- **Data Cache**: Next.js `fetch`のキャッシュ機能実演
- **Full Route Cache**: ページ全体のキャッシュ管理
- **Router Cache**: クライアントサイドキャッシュ
- **CloudFront Cache**: 静的アセットのエッジキャッシュ
- **オンデマンドリバリデート**:
  - `revalidatePath`による特定パス更新
  - `revalidateTag`によるタグベース更新
  - Hono API からの通知受信
- **時間ベースリバリデート**: `revalidate`オプション設定
- **キャッシュ戦略比較**: 各階層でのキャッシュパフォーマンス比較

#### 技術要件

- キャッシュヒット率の可視化（Next.js、CloudFront 別）
- リバリデート実行時間の測定
- メモリ使用量の監視
- キャッシュ無効化の確認機能
- localhost 通信によるリバリデート処理
- CloudFront キャッシュの無効化 API 連携

### 5. ストリーミングと Suspense (`/features/streaming`)

#### 必須実装項目

- **基本 Suspense**: `loading.tsx`ファイルの活用
- **コンポーネントレベル Suspense**: 個別ローディング状態
- **ネスト Suspense**: 階層的ローディング制御
- **エラーバウンダリ**: `error.tsx`による例外処理
- **スケルトン UI**: 段階的コンテンツ表示
- **ストリーミング SSR**: サーバーからの段階的送信

#### 技術要件

- 初回レンダリング時間の測定
- コンポーネント単位の読み込み時間
- エラー発生時の復旧機能
- ネットワーク状況に応じた表示制御
- ALB 経由でのストリーミング動作確認

### 6. Middleware (`/features/middleware-demo`)

#### 必須実装項目

- **リクエスト検証**: ヘッダー、認証情報の確認
- **リダイレクト処理**: 条件付きページ遷移
- **リライト処理**: URL 変換とプロキシ機能
- **ヘッダー追加**: レスポンス時の動的ヘッダー設定
- **地域別ルーティング**: CloudFront の Geo 情報活用
- **内部 API 認証**: コンテナ間通信の認証処理

#### 技術要件

- ミドルウェア実行時間の測定
- セキュリティヘッダーの適切な設定
- パフォーマンスへの影響分析
- エッジ環境での動作確認
- ALB ヘルスチェックの除外処理

### 7. 画像最適化 (`/features/image-optimization`)

#### 必須実装項目

- **基本最適化**: `next/image`の自動最適化
- **レスポンシブ画像**: `sizes`プロパティによる対応
- **優先度制御**: `priority`による読み込み順序
- **プレースホルダー**: `placeholder="blur"`の活用
- **遅延読み込み**: 画面外画像の効率的読み込み
- **CloudFront 配信**: 最適化画像の CDN 配信

#### 技術要件

- 画像読み込み時間の測定
- 帯域幅使用量の監視
- 異なるデバイスでの表示確認
- Core Web Vitals への影響測定
- CloudFront キャッシュヒット率の確認

### 8. メタデータ API (`/features/metadata`)

#### 必須実装項目

- **静的メタデータ**: `metadata`オブジェクトによる設定
- **動的メタデータ**: `generateMetadata`関数の実装
- **OpenGraph 設定**: ソーシャルメディア最適化
- **Twitter Cards**: Twitter 用メタデータ
- **構造化データ**: JSON-LD による SEO 強化
- **ファビコン設定**: 各種アイコンの適切な配置

#### 技術要件

- SEO スコアの測定
- ソーシャルメディアでの表示確認
- 検索エンジンクローラーでの検証
- メタデータ生成パフォーマンスの測定

## 🏗 共通実装要件

### パフォーマンス監視

各機能には以下のメトリクス表示を実装：

- **レンダリング時間**: サーバー・クライアント別測定
- **ネットワーク統計**: リクエスト数、サイズ、応答時間
- **キャッシュ効率**: ヒット率、ミス率の可視化（Next.js、CloudFront 別）
- **メモリ使用量**: コンポーネント別リソース消費
- **Core Web Vitals**: LCP、FID、CLS、INP の測定
- **AWS メトリクス**: ALB レスポンス時間、Fargate リソース使用率
- **コンテナ間通信**: localhost 通信のレイテンシー測定

### UI/UX 要件

- **コード表示機能**: 実装コードのトグル表示
- **インタラクティブデモ**: 各機能の体験可能な実装
- **レスポンシブ対応**: モバイル・デスクトップ両対応
- **アクセシビリティ**: WCAG 2.1 AA 準拠
- **ダークモード**: テーマ切り替え機能

### エラーハンドリング

- **error.tsx**: 各機能セクションでの例外処理
- **not-found.tsx**: 404 エラーの適切な表示
- **global-error.tsx**: アプリケーション全体のエラー管理
- **エラー境界**: コンポーネントレベルでの例外隔離
- **ALB エラー**: 5xx 系エラーの適切なハンドリング
- **コンテナエラー**: 各コンテナのヘルスチェックとリカバリー

## 🛠 Next.js API Route 要件

### 必須 API エンドポイント（最小限）

#### 1. リバリデート受信 API

- **`/api/revalidate`**: Hono API からのリバリデート通知受信
  - POST: `{ path?: string, tag?: string, secret: string }`
  - Next.js キャッシュの無効化実行
  - CloudFront キャッシュの無効化トリガー
  - レスポンス: 実行結果とステータス

#### 2. ヘルスチェック API

- **`/api/health`**: ALB ヘルスチェック用
  - GET: アプリケーション正常性確認
  - 外部依存なしの軽量レスポンス

#### 3. キャッシュ状態確認 API（開発用）

- **`/api/cache-status`**: 現在のキャッシュ状態確認
  - GET: 開発環境でのデバッグ情報取得

## 🌩️ Hono API 要件（ECS サイドカー）

### データ操作 API

#### 1. 投稿管理 API

- **`/api/posts`**: 投稿データの CRUD 操作
  - GET: 全投稿一覧取得（ページネーション対応）
  - POST: 新規投稿作成 + Next.js リバリデート通知
  - PUT: 投稿更新 + Next.js リバリデート通知
  - DELETE: 投稿削除 + Next.js リバリデート通知

#### 2. ユーザー管理 API

- **`/api/users`**: ユーザーデータ管理
  - GET: ユーザー情報取得
  - POST: ユーザー作成
  - PUT: ユーザー情報更新

#### 3. ファイルアップロード API

- **`/api/upload`**: S3 へのファイルアップロード
  - POST: 画像・ファイルのアップロード処理
  - S3 へ直接アップロード（署名付き URL 使用）
  - レスポンス: S3 URL

#### 4. 認証 API

- **`/api/auth`**: 認証処理
  - POST `/login`: ログイン処理
  - POST `/logout`: ログアウト処理
  - GET `/verify`: トークン検証

### 運用・監視 API

#### 1. ヘルスチェック API

- **`/health`**: サービス正常性確認
  - GET: PostgreSQL 接続状態の確認

#### 2. メトリクス API

- **`/api/metrics`**: パフォーマンスメトリクス
  - GET: API 使用状況、レスポンス時間統計

### API 設計要件

#### セキュリティ

- **認証**: Bearer トークンによる保護（内部通信用）
- **localhost 通信**: 外部公開不要でセキュア
- **レート制限**: 過剰なリクエストの制限
- **入力検証**: リクエストボディの厳密な検証

#### レスポンス形式

- 統一された JSON レスポンス形式
- 適切な HTTP ステータスコード
- エラー時の詳細なメッセージ

#### Next.js との連携

- データ更新時の自動リバリデート通知
- localhost 通信による高速連携
- 環境変数による接続設定

## 🐳 AWS ECS 対応要件

### ECS タスク定義

```json
{
  "family": "nextjs-performance-app",
  "networkMode": "awsvpc",
  "cpu": "1024",
  "memory": "2048",
  "requiresCompatibilities": ["FARGATE"],
  "containerDefinitions": [
    {
      "name": "nextjs",
      "image": "${ECR_URI}/nextjs:latest",
      "cpu": 512,
      "memory": 768,
      "essential": true,
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        { "name": "API_URL", "value": "http://localhost:8000" },
        { "name": "NODE_ENV", "value": "production" },
        { "name": "S3_BUCKET_NAME", "value": "${S3_BUCKET_NAME}" },
        { "name": "CLOUDFRONT_URL", "value": "${CLOUDFRONT_URL}" }
      ],
      "dependsOn": [
        {
          "containerName": "api",
          "condition": "START"
        }
      ]
    },
    {
      "name": "api",
      "image": "${ECR_URI}/hono-api:latest",
      "cpu": 256,
      "memory": 512,
      "essential": true,
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "DATABASE_URL",
          "value": "postgresql://postgres:${DB_PASSWORD}@localhost:5432/appdb"
        },
        { "name": "NEXTJS_URL", "value": "http://localhost:3000" },
        { "name": "REVALIDATE_SECRET", "value": "${REVALIDATE_SECRET}" },
        { "name": "S3_BUCKET_NAME", "value": "${S3_BUCKET_NAME}" },
        { "name": "AWS_REGION", "value": "ap-northeast-1" }
      ],
      "dependsOn": [
        {
          "containerName": "postgres",
          "condition": "HEALTHY"
        }
      ]
    },
    {
      "name": "postgres",
      "image": "postgres:15-alpine",
      "cpu": 256,
      "memory": 768,
      "essential": true,
      "portMappings": [
        {
          "containerPort": 5432,
          "protocol": "tcp"
        }
      ],
      "environment": [
        { "name": "POSTGRES_USER", "value": "postgres" },
        { "name": "POSTGRES_PASSWORD", "value": "${DB_PASSWORD}" },
        { "name": "POSTGRES_DB", "value": "appdb" },
        { "name": "PGDATA", "value": "/var/lib/postgresql/data/pgdata" }
      ],
      "mountPoints": [
        {
          "sourceVolume": "postgres-data",
          "containerPath": "/var/lib/postgresql/data"
        }
      ],
      "healthCheck": {
        "command": ["CMD-SHELL", "pg_isready -U postgres"],
        "interval": 10,
        "timeout": 5,
        "retries": 5,
        "startPeriod": 30
      }
    }
  ],
  "volumes": [
    {
      "name": "postgres-data",
      "efsVolumeConfiguration": {
        "fileSystemId": "${EFS_ID}",
        "transitEncryption": "ENABLED",
        "authorizationConfig": {
          "accessPointId": "${EFS_ACCESS_POINT_ID}"
        }
      }
    }
  ]
}
```

### コンテナ最適化

- **Standalone 出力**: `next.config.js`での設定
- **ヘルスチェック**: ALB 用エンドポイント実装（`/api/health`）
- **ログ戦略**: CloudWatch Logs への構造化ログ出力
- **環境変数**: ECS タスク定義での管理
  - データベース接続情報
  - リバリデート秘密鍵
  - S3 バケット名
  - CloudFront Distribution ID
- **IAM ロール**:
  - S3 アクセス権限（読み書き）
  - CloudFront 無効化権限
  - CloudWatch Logs 書き込み権限

### Fargate タスク設定

- **CPU/メモリ**: 適切なリソース割り当て（合計 1vCPU、2GB）
- **スケーリング**: シングルタスク推奨（PostgreSQL 制約）
- **ロールベースアクセス**: IAM ロールによる権限管理
- **シークレット管理**: AWS Secrets Manager 統合

### ネットワーク構成

- **VPC 設定**: パブリック/プライベートサブネット
- **セキュリティグループ**:
  - ALB からのインバウンド（3000 番ポート）
  - 内部通信のみ（外部通信不要）
- **VPC エンドポイント**:
  - S3 エンドポイント（ゲートウェイ型）
  - CloudWatch Logs エンドポイント
- **NAT Gateway**: 不要（VPC エンドポイント経由で通信）

### CloudFront 設定

- **オリジン設定**:
  - ALB（動的コンテンツ）
  - S3 バケット（静的コンテンツ）
- **キャッシュビヘイビア**:
  - `/public/*`: S3 オリジン、長期キャッシュ
  - `/_next/static/*`: S3 オリジン、長期キャッシュ
  - `/api/*`: ALB オリジン、キャッシュ無効
  - その他: ALB オリジン、短期キャッシュ
- **圧縮**: 自動圧縮の有効化
- **カスタムエラーページ**: 404、500 エラーの処理

### EFS 設定

- **ファイルシステム**: PostgreSQL データ永続化用
- **アクセスポイント**:
  - Path: `/postgres`
  - UID/GID: 999（postgres ユーザー）
  - パーミッション: 700
- **暗号化**: 転送時・保存時の暗号化
- **バックアップ**: 日次スナップショット

## 📊 品質保証要件

### テスト戦略

- **Unit Testing**: 各機能の単体テスト
- **Integration Testing**: コンテナ間連携テスト
- **E2E Testing**: CloudFront 経由でのエンドツーエンドテスト
- **Load Testing**: ALB + Fargate の負荷テスト（シングルタスク前提）

### コード品質

- **TypeScript**: 厳密な型チェック
- **ESLint**: コード品質の自動チェック
- **Prettier**: コードフォーマットの統一
- **Husky**: Git hook による品質保証

### パフォーマンス基準

- **Lighthouse Score**: 90 点以上を目標
- **Core Web Vitals**: 全項目で良好評価
- **Bundle Size**: 適切なサイズ管理
- **Runtime Performance**: 60fps 維持
- **CloudFront Hit Rate**: 80%以上
- **コンテナ間通信**: 1ms 未満のレイテンシー

### 監視・アラート

- **CloudWatch**: メトリクス収集とアラート
- **Container Insights**: コンテナメトリクス
- **CloudWatch Logs Insights**: ログ分析
- **カスタムメトリクス**: localhost 通信の監視

## 🗂 ファイル構成要件

### モノレポ構造

```
nextjs-ecs-performance/
├── apps/
│   ├── frontend/        # Next.jsアプリケーション
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── lib/
│   │   │   └── types/
│   │   ├── public/
│   │   ├── Dockerfile
│   │   ├── next.config.js
│   │   └── package.json
│   └── api/            # Hono APIサーバー
│       ├── src/
│       │   ├── routes/
│       │   ├── middleware/
│       │   ├── services/
│       │   └── index.ts
│       ├── prisma/
│       │   └── schema.prisma
│       ├── Dockerfile
│       └── package.json
├── infrastructure/
│   ├── cdk/            # AWS CDK
│   │   ├── bin/
│   │   │   └── app.ts
│   │   ├── lib/
│   │   │   ├── stacks/
│   │   │   │   ├── network-stack.ts
│   │   │   │   ├── storage-stack.ts
│   │   │   │   ├── ecs-stack.ts
│   │   │   │   └── cdn-stack.ts
│   │   │   └── constructs/
│   │   │       ├── ecs-service.ts
│   │   │       └── database.ts
│   │   ├── cdk.json
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── docker/
│       └── docker-compose.yml
├── .github/
│   └── workflows/
│       └── deploy.yml
└── package.json
```

### Next.js 側ディレクトリ構造

```
apps/frontend/src/
├── app/
│   ├── features/
│   │   ├── routing/
│   │   ├── server-actions/
│   │   ├── data-fetching/
│   │   ├── caching/
│   │   ├── streaming/
│   │   ├── middleware-demo/
│   │   ├── image-optimization/
│   │   └── metadata/
│   ├── api/
│   │   ├── revalidate/
│   │   ├── health/
│   │   └── cache-status/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   ├── performance/
│   └── common/
├── lib/
│   ├── api-client.ts    # localhost:8000への接続
│   ├── performance.ts
│   └── constants.ts
└── middleware.ts
```

### Hono API 側ディレクトリ構造

```
apps/api/src/
├── index.ts
├── routes/
│   ├── auth.ts
│   ├── posts.ts
│   ├── users.ts
│   ├── upload.ts
│   └── metrics.ts
├── middleware/
│   ├── auth.ts
│   ├── cors.ts
│   └── rateLimit.ts
├── services/
│   ├── database.ts      # Prismaクライアント
│   ├── revalidation.ts  # Next.jsリバリデート
│   └── cache.ts
└── types/
    └── index.ts
```

### 命名規則

- **ファイル名**: kebab-case
- **コンポーネント名**: PascalCase
- **関数名**: camelCase
- **定数**: UPPER_SNAKE_CASE
- **型定義**: PascalCase

## 🔧 開発環境要件

### 必須ツール

- Node.js 18.17.0 以上
- npm 9.0.0 以上
- Docker Desktop
- AWS CLI v2
- AWS CDK v2
- VS Code（推奨）

### ローカル開発環境

```yaml
# docker-compose.yml
version: "3.8"
services:
  nextjs:
    build: ./apps/frontend
    ports:
      - "3000:3000"
    environment:
      - API_URL=http://api:8000
    depends_on:
      - api

  api:
    build: ./apps/api
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:devpassword@postgres:5432/appdb
    depends_on:
      postgres:
        condition: service_healthy

  postgres:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=devpassword
      - POSTGRES_DB=appdb
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

### AWS 設定

- AWS アカウント
- 適切な IAM 権限
- VPC、サブネット事前設定
- EFS ファイルシステム
- S3 バケット（静的アセット用）
- CloudFront ディストリビューション
- Route 53（オプション）

### 推奨拡張機能

- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- TypeScript Importer
- Prettier - Code formatter
- ESLint
- AWS Toolkit
- Prisma

## 📈 実装優先順位

### Phase 1 (高優先度)

1. ローカル開発環境構築（Docker Compose）
2. CDK プロジェクト初期化と Network Stack 作成
3. Storage Stack（S3、EFS）構築
4. 基本的な CRUD API 実装（Hono + PostgreSQL）
5. Next.js 基本ページと API 連携

### Phase 2 (中優先度)

1. ECS Stack（Fargate、ALB）デプロイ
2. CDN Stack（CloudFront）設定
3. キャッシュとリバリデート機能
4. Server Actions 実装
5. CI/CD パイプライン構築

### Phase 3 (低優先度)

1. 全ルーティング機能
2. ストリーミングと Suspense
3. Middleware 実装
4. 画像最適化
5. メタデータ API
6. 監視・アラート設定

## 🚀 デプロイメント（AWS CDK）

### CDK プロジェクト構成

```
infrastructure/cdk/
├── bin/
│   └── app.ts                 # CDKアプリケーションエントリポイント
├── lib/
│   ├── stacks/
│   │   ├── network-stack.ts   # VPC、サブネット、セキュリティグループ
│   │   ├── storage-stack.ts   # S3、EFS
│   │   ├── ecs-stack.ts       # ECS、Fargate、ALB
│   │   └── cdn-stack.ts       # CloudFront
│   └── constructs/
│       ├── ecs-service.ts     # ECSサービス構成
│       └── database.ts        # PostgreSQLコンテナ設定
├── cdk.json
├── tsconfig.json
└── package.json
```

### 主要な CDK スタック実装例

#### Network Stack

```typescript
// lib/stacks/network-stack.ts
import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";

export class NetworkStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.vpc = new ec2.Vpc(this, "VPC", {
      maxAzs: 2,
      natGateways: 0, // NAT Gateway不要
      subnetConfiguration: [
        {
          name: "Public",
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
        {
          name: "Private",
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          cidrMask: 24,
        },
      ],
    });

    // S3 VPCエンドポイント
    this.vpc.addGatewayEndpoint("S3Endpoint", {
      service: ec2.GatewayVpcEndpointAwsService.S3,
    });

    // CloudWatch Logs VPCエンドポイント
    this.vpc.addInterfaceEndpoint("CloudWatchLogsEndpoint", {
      service: ec2.InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS,
    });
  }
}
```

#### ECS Stack

```typescript
// lib/stacks/ecs-stack.ts
import * as cdk from "aws-cdk-lib";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as iam from "aws-cdk-lib/aws-iam";

export class EcsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: EcsStackProps) {
    super(scope, id, props);

    const cluster = new ecs.Cluster(this, "Cluster", {
      vpc: props.vpc,
      containerInsights: true,
    });

    const taskDefinition = new ecs.FargateTaskDefinition(this, "TaskDef", {
      memoryLimitMiB: 2048,
      cpu: 1024,
    });

    // Task Role (S3アクセス権限)
    taskDefinition.addToTaskRolePolicy(
      new iam.PolicyStatement({
        actions: ["s3:GetObject", "s3:PutObject"],
        resources: [`${props.s3Bucket.bucketArn}/*`],
      })
    );

    // Next.js Container
    const nextjsContainer = taskDefinition.addContainer("nextjs", {
      image: ecs.ContainerImage.fromEcrRepository(props.nextjsRepo),
      cpu: 512,
      memoryLimitMiB: 768,
      environment: {
        API_URL: "http://localhost:8000",
        NODE_ENV: "production",
        S3_BUCKET_NAME: props.s3Bucket.bucketName,
        CLOUDFRONT_URL: props.cloudfrontUrl,
      },
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: "nextjs",
      }),
    });

    nextjsContainer.addPortMappings({
      containerPort: 3000,
      protocol: ecs.Protocol.TCP,
    });

    // Hono API Container
    const apiContainer = taskDefinition.addContainer("api", {
      image: ecs.ContainerImage.fromEcrRepository(props.apiRepo),
      cpu: 256,
      memoryLimitMiB: 512,
      environment: {
        DATABASE_URL: "postgresql://postgres:devpassword@localhost:5432/appdb",
        NEXTJS_URL: "http://localhost:3000",
        S3_BUCKET_NAME: props.s3Bucket.bucketName,
      },
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: "api",
      }),
    });

    apiContainer.addPortMappings({
      containerPort: 8000,
      protocol: ecs.Protocol.TCP,
    });

    // PostgreSQL Container
    const postgresContainer = taskDefinition.addContainer("postgres", {
      image: ecs.ContainerImage.fromRegistry("postgres:15-alpine"),
      cpu: 256,
      memoryLimitMiB: 768,
      environment: {
        POSTGRES_USER: "postgres",
        POSTGRES_PASSWORD: "devpassword",
        POSTGRES_DB: "appdb",
        PGDATA: "/var/lib/postgresql/data/pgdata",
      },
      healthCheck: {
        command: ["CMD-SHELL", "pg_isready -U postgres"],
        interval: cdk.Duration.seconds(10),
        timeout: cdk.Duration.seconds(5),
        retries: 5,
        startPeriod: cdk.Duration.seconds(30),
      },
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: "postgres",
      }),
    });

    // EFSマウント
    taskDefinition.addVolume({
      name: "postgres-data",
      efsVolumeConfiguration: {
        fileSystemId: props.fileSystem.fileSystemId,
        transitEncryption: "ENABLED",
        authorizationConfig: {
          accessPointId: props.accessPoint.accessPointId,
        },
      },
    });

    postgresContainer.addMountPoints({
      sourceVolume: "postgres-data",
      containerPath: "/var/lib/postgresql/data",
      readOnly: false,
    });

    // コンテナ依存関係
    apiContainer.addContainerDependencies({
      container: postgresContainer,
      condition: ecs.ContainerDependencyCondition.HEALTHY,
    });

    nextjsContainer.addContainerDependencies({
      container: apiContainer,
      condition: ecs.ContainerDependencyCondition.START,
    });

    // ECSサービス
    const service = new ecs.FargateService(this, "Service", {
      cluster,
      taskDefinition,
      desiredCount: 1,
      assignPublicIp: false,
      securityGroups: [props.securityGroup],
    });

    // ALB設定
    const targetGroup = props.alb.addTargets("ECS", {
      port: 3000,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targets: [service],
      healthCheck: {
        path: "/api/health",
        interval: cdk.Duration.seconds(30),
      },
    });
  }
}
```

### デプロイコマンド

```bash
# CDK初期化
cd infrastructure/cdk
npm install
npx cdk bootstrap

# スタックのデプロイ（順序が重要）
npx cdk deploy NetworkStack
npx cdk deploy StorageStack
npx cdk deploy EcsStack
npx cdk deploy CdnStack

# 一括デプロイ
npx cdk deploy --all

# 差分確認
npx cdk diff

# 削除
npx cdk destroy --all
```

### GitHub Actions CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-northeast-1

      - name: Build and push Docker images
        run: |
          # ECRログイン
          aws ecr get-login-password | docker login --username AWS --password-stdin $ECR_REGISTRY

          # Next.jsイメージビルド
          docker build -t nextjs-app ./apps/frontend
          docker tag nextjs-app:latest $ECR_REGISTRY/nextjs-app:latest
          docker push $ECR_REGISTRY/nextjs-app:latest

          # Hono APIイメージビルド
          docker build -t hono-api ./apps/api
          docker tag hono-api:latest $ECR_REGISTRY/hono-api:latest
          docker push $ECR_REGISTRY/hono-api:latest

      - name: Deploy CDK
        run: |
          cd infrastructure/cdk
          npm ci
          npx cdk deploy --all --require-approval never
```

### 環境別設定

```typescript
// cdk.json
{
  "app": "npx ts-node --prefer-ts-exts bin/app.ts",
  "context": {
    "dev": {
      "account": "123456789012",
      "region": "ap-northeast-1",
      "desiredCount": 1,
      "instanceType": "t3.small"
    },
    "prod": {
      "account": "123456789012",
      "region": "ap-northeast-1",
      "desiredCount": 2,
      "instanceType": "t3.medium"
    }
  }
}
```

各フェーズで実装完了後は必ず品質保証プロセスを実行し、次フェーズに進む前にすべてのテストがパスすることを確認してください。

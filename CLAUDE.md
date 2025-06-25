# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 開発ルール

### 基本原則

1. **探索-計画-実装-テスト-コミット**のワークフローを厳守する
2. **TDD（テスト駆動開発）**をデフォルトとして採用
3. **型安全性**を最優先とし、TypeScriptの厳密な型定義を行う
4. **パフォーマンス監視**を全機能に組み込む

### コーディング規約

#### 命名規則
- **ファイル名**: kebab-case（例: `user-profile.tsx`）
- **コンポーネント名**: PascalCase（例: `UserProfile`）
- **関数名**: camelCase（例: `getUserData`）
- **定数**: UPPER_SNAKE_CASE（例: `API_BASE_URL`）
- **型定義**: PascalCase（例: `UserData`）
- **インターフェース**: PascalCaseで`I`プレフィックスは不要

#### TypeScript規約
```typescript
// 明示的な型定義を優先
const user: User = { id: 1, name: "John" };

// 関数の戻り値型を明示
function getUser(id: number): Promise<User> {
  // ...
}

// strictNullChecksを活用
function processData(data: string | null): string {
  if (!data) throw new Error("Data is required");
  return data.toUpperCase();
}
```

#### インポート順序
1. React/Next.js関連
2. 外部ライブラリ
3. 内部モジュール（絶対パス）
4. 相対パスインポート
5. スタイル

```typescript
// 例
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { UserProfile } from './user-profile';
import styles from './page.module.css';
```

#### コンポーネント構成とファイル配置

##### 基本ディレクトリ構造
```
app/
├── [segment]/                # 各機能セグメント
│   ├── page.tsx             # ページコンポーネント
│   ├── loading.tsx          # ローディングUI
│   ├── _components/         # セグメント固有UIコンポーネント
│   ├── _containers/         # データ取得・統合レイヤー
│   │   ├── container.tsx    # Server Component（データ取得）
│   │   └── presentational.tsx # Client Component（レイアウト・UI）
│   ├── _actions/            # セグメント特化 Server Actions
│   └── _lib/               # セグメント特化ユーティリティ
│
├── components/ui/           # プロジェクト共通コンポーネント
└── lib/                    # プロジェクト共通ライブラリ
```

##### ファイル命名規則

**必須事項**: 以下の命名規則を厳守する

- `_containers/container.tsx` - Server Componentでデータ取得用
- `_containers/presentational.tsx` - Client Componentでレイアウト・UI・ユーザー操作ロジック用
- `_components/` - セグメント内専用のUIコンポーネント用ディレクトリ

**禁止事項**: 以下の命名は使用禁止

- ❌ `*.container.tsx` (セグメント名を含む冗長な命名)
- ❌ `*.presentational.tsx` (セグメント名を含む冗長な命名)
- ❌ `_components/presentational.tsx` (presentationalは_containers/に配置)

##### 責務分離パターン

```typescript
// _containers/container.tsx (Server Component)
import { PresentationalComponent } from './presentational';

export function ContainerComponent() {
  // Server Componentでデータ取得
  const serverData = await fetchData();
  
  return <PresentationalComponent data={serverData} />;
}

// _containers/presentational.tsx (Client Component)
'use client';

import { useState } from 'react';

interface Props {
  data: ServerData;
}

export function PresentationalComponent({ data }: Props) {
  // Client側のUI状態管理
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div>
      {/* UIレンダリング */}
    </div>
  );
}
```

##### 配置判断基準

**使用範囲による判断**:
- 単一セグメント内のみ → `app/[segment]/_components/`
- プロジェクト共通 → `app/components/ui/`

**責務による判断**:
- データ取得・統合 → `_containers/container.tsx`
- レイアウト・UI・ユーザー操作 → `_containers/presentational.tsx`
- 再利用可能なUIパーツ → `_components/`

### 開発フロー

#### ブランチ戦略
```bash
# 機能開発
git checkout -b feat/user-authentication

# バグ修正
git checkout -b fix/login-validation

# リファクタリング
git checkout -b refactor/api-client-cleanup

# ドキュメント
git checkout -b docs/api-documentation
```

#### コミットメッセージ規約
```bash
# フォーマット: type: 簡潔な説明（日本語）

feat: ユーザー認証機能を追加
fix: ログインバリデーションエラーを修正
refactor: APIクライアントを簡素化
test: ユーザー認証のテストを追加
docs: API仕様書を更新
style: コードフォーマットを修正
perf: 画像読み込みパフォーマンスを改善
chore: 依存関係を更新
```

### テスト戦略

#### TDD実行プロセス
1. 失敗するテストを先に書く
2. テストをパスする最小限のコードを実装
3. リファクタリング
4. 繰り返し

#### テストファイル構成
```typescript
// __tests__/features/user-auth.test.ts
describe('User Authentication', () => {
  describe('Login', () => {
    it('should login with valid credentials', async () => {
      // Arrange
      const credentials = { email: 'test@example.com', password: 'password' };
      
      // Act
      const result = await login(credentials);
      
      // Assert
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
    });
  });
});
```

#### カバレッジ目標
- 全体: 80%以上
- クリティカルパス: 100%
- ユーティリティ関数: 100%

### エラーハンドリング

#### 標準エラー処理パターン
```typescript
// カスタムエラークラス
export class AppError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// エラーハンドリング
try {
  const data = await fetchData();
  return { success: true, data };
} catch (error) {
  console.error(`[${new Date().toISOString()}] Error:`, error);
  
  if (error instanceof AppError) {
    return { success: false, error: error.message, code: error.code };
  }
  
  return { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' };
}
```

#### ログ出力規約
```typescript
// 構造化ログ
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  level: 'INFO',
  service: 'nextjs',
  message: 'User logged in',
  userId: user.id,
  metadata: { ip: request.ip }
}));
```

### セキュリティガイドライン

#### 環境変数管理
```typescript
// 型安全な環境変数アクセス
const env = {
  API_URL: process.env.API_URL || 'http://localhost:8000',
  DATABASE_URL: process.env.DATABASE_URL!,
  REVALIDATE_SECRET: process.env.REVALIDATE_SECRET!,
} as const;

// 検証
if (!env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}
```

#### 認証・認可
- JWTトークンをhttpOnlyクッキーで管理
- CSRF保護を全フォームに実装
- Rate limitingを全APIエンドポイントに適用

### パフォーマンス最適化

#### 必須実装項目
1. 全ページでCore Web Vitalsを測定・表示
2. 画像は必ずnext/imageを使用
3. 動的インポートでコード分割
4. React.memoとuseMemoで再レンダリング最適化

#### メトリクス収集
```typescript
// パフォーマンス測定HOC
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>
) {
  return function WrappedComponent(props: P) {
    useEffect(() => {
      const startTime = performance.now();
      
      return () => {
        const endTime = performance.now();
        console.log(`Component render time: ${endTime - startTime}ms`);
      };
    }, []);
    
    return <Component {...props} />;
  };
}
```

### Docker開発環境

#### 必須確認事項
- 全コンテナが正常起動することを確認
- ヘルスチェックがパスすることを確認
- コンテナ間通信（localhost）が機能することを確認

### 品質チェックリスト

#### PR作成前に必ず確認
- [ ] `npm run lint`でエラーがないこと
- [ ] `npm run typecheck`で型エラーがないこと
- [ ] `npm run test`で全テストがパスすること
- [ ] `npm run build`が成功すること
- [ ] 新機能にはテストが追加されていること
- [ ] パフォーマンスメトリクスが実装されていること

## プロジェクト概要

**ECS Performance Check App** は、Next.js 15.3.4の主要機能をAWS ECS環境で動作させ、パフォーマンスメトリクスを可視化するデモアプリケーションです。

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

### インフラストラクチャ

- **CloudFront**: 静的アセット配信、エッジキャッシュ
- **ALB**: トラフィック分散
- **ECS Fargate**: サーバーレスコンテナ実行
- **EFS**: PostgreSQLデータ永続化

## ファイル構成（モノレポ）

```
ecs-performance-check-app/
├── apps/
│   ├── frontend/                    # Next.js アプリケーション
│   │   ├── src/app/
│   │   │   ├── features/            # 8つの機能デモ
│   │   │   │   ├── routing/         # App Router パターン
│   │   │   │   ├── server-actions/  # Server Actions デモ
│   │   │   │   ├── data-fetching/   # SSG/SSR/ISR
│   │   │   │   ├── caching/         # 多層キャッシュ戦略
│   │   │   │   ├── streaming/       # Suspense & ストリーミング
│   │   │   │   ├── middleware-demo/ # Middleware 機能
│   │   │   │   ├── image-optimization/ # Next/Image
│   │   │   │   └── metadata/        # SEO & メタデータ
│   │   │   ├── api/
│   │   │   │   ├── revalidate/      # Hono からのリバリデート受信
│   │   │   │   ├── health/          # ALB ヘルスチェック
│   │   │   │   └── cache-status/    # キャッシュ状態確認
│   │   │   └── components/
│   │   ├── next.config.js           # Standalone 出力設定
│   │   └── Dockerfile
│   └── backend/                     # Hono バックエンドサーバー
│       ├── src/
│       │   ├── routes/              # バックエンドエンドポイント
│       │   ├── services/            # Next.js リバリデート通知
│       │   └── index.ts
│       ├── prisma/schema.prisma     # データベーススキーマ
│       └── Dockerfile
├── infrastructure/
│   ├── ecs/task-definition.json     # 3コンテナ定義
│   ├── docker/docker-compose.yml    # ローカル開発環境
│   └── scripts/deploy.sh
└── package.json                     # モノレポ管理
```

## 主要開発コマンド

### ローカル開発

```bash
# Docker Compose 環境起動
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

### デプロイメント

```bash
# AWS デプロイ
npm run deploy:ecr     # ECR イメージプッシュ
npm run deploy:ecs     # ECS サービスデプロイ
npm run deploy:all     # フルデプロイ
```

## 技術スタック

### フロントエンド
- **Next.js 15.3.4**: App Router、Server Actions、SSR/SSG/ISR
- **React 18**: コンポーネント開発
- **TypeScript**: 型安全性
- **Tailwind CSS**: ユーティリティファーストCSS

### バックエンド
- **Hono**: 高性能バックエンドframework
- **PostgreSQL 15**: リレーショナルデータベース
- **Prisma**: ORM・型安全データアクセス

### インフラ・デプロイ
- **AWS ECS Fargate**: コンテナオーケストレーション
- **Amazon EFS**: PostgreSQL データ永続化
- **Docker**: コンテナ化・開発環境

## 重要な実装要件

### パフォーマンス監視（全機能で必須）

各機能デモページには以下メトリクス表示を実装：

- **Core Web Vitals**: LCP、FID、CLS、INP測定
- **レンダリング時間**: サーバー・クライアント別
- **キャッシュ効率**: Next.js・CloudFront別ヒット率
- **ネットワーク統計**: リクエスト数、応答時間
- **コンテナ間通信**: localhost通信レイテンシー

### キャッシュ・リバリデート連携

- **Next.js**: `revalidatePath`, `revalidateTag`
- **Hono Backend**: データ更新時にNext.js `/api/revalidate`へ通知
- **CloudFront**: 静的アセットの無効化API連携

### ECS 特有の制約

- **localhost通信**: コンテナ間でlocalhost経由通信
- **NAT Gateway不要**: 完全内部通信構成
- **シングルタスク**: PostgreSQL制約によるスケール制限
- **ヘルスチェック**: ALB用 `/api/health` エンドポイント

### 品質基準（デプロイ前必須）

- **Lighthouse Score**: 90点以上
- **Core Web Vitals**: 全項目で良好評価
- **CloudFront Hit Rate**: 80%以上
- **コンテナ間通信**: 1ms未満レイテンシー

## 特別な開発パターン

### Server Actions と Hono API 連携

```typescript
// Server Action から localhost:8000 の Hono API を呼び出し
async function createPost(formData: FormData) {
  'use server'
  
  const response = await fetch('http://localhost:8000/api/posts', {
    method: 'POST',
    body: JSON.stringify(data)
  })
  
  // Hono側で自動的にNext.jsリバリデート通知
}
```

### データフェッチング戦略

- **SSG**: `generateStaticParams` でビルド時生成
- **SSR**: サーバーでHono バックエンドから取得
- **ISR**: `revalidate`による段階的更新
- **クライアント**: SWRパターンでHono バックエンド連携

### Docker 開発環境

```yaml
# docker-compose.yml でECS環境を再現
services:
  nextjs:
    ports: ["3000:3000"]
    environment:
      - API_URL=http://api:8000
  api:
    ports: ["8000:8000"] 
    environment:
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/appdb
  postgres:
    ports: ["5432:5432"]
```

## 現在の実装状況

**プロジェクト状態**: 初期段階（要件定義完了、実装未開始）

**次の実装ステップ**:
1. モノレポ構造セットアップ
2. Docker Compose 開発環境構築
3. Next.js + Hono + PostgreSQL 基本セットアップ
4. 各機能デモの段階的実装
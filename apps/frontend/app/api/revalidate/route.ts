import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

interface RevalidateRequest {
  path?: string;
  tag?: string;
  secret?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as RevalidateRequest;
    const { path, tag, secret } = body;

    // シークレットキーの検証
    const revalidateSecret = process.env.REVALIDATE_SECRET;
    if (!revalidateSecret || secret !== revalidateSecret) {
      console.error('[Revalidate] Invalid or missing secret');
      return NextResponse.json(
        { error: 'Invalid secret' },
        { status: 401 }
      );
    }

    // パスまたはタグのいずれかが必要
    if (!path && !tag) {
      return NextResponse.json(
        { error: 'Either path or tag must be provided' },
        { status: 400 }
      );
    }

    const results: { revalidated: string[]; errors: string[] } = {
      revalidated: [],
      errors: []
    };

    // パスベースのリバリデート
    if (path) {
      try {
        revalidatePath(path);
        results.revalidated.push(`path: ${path}`);
        console.log(`[Revalidate] Successfully revalidated path: ${path}`);
      } catch (error) {
        const errorMessage = `Failed to revalidate path ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        results.errors.push(errorMessage);
        console.error('[Revalidate]', errorMessage);
      }
    }

    // タグベースのリバリデート
    if (tag) {
      try {
        revalidateTag(tag);
        results.revalidated.push(`tag: ${tag}`);
        console.log(`[Revalidate] Successfully revalidated tag: ${tag}`);
      } catch (error) {
        const errorMessage = `Failed to revalidate tag ${tag}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        results.errors.push(errorMessage);
        console.error('[Revalidate]', errorMessage);
      }
    }

    // レスポンス作成
    const responseData = {
      revalidated: results.revalidated.length > 0 ? results.revalidated : undefined,
      errors: results.errors.length > 0 ? results.errors : undefined,
      timestamp: new Date().toISOString(),
    };

    // エラーがある場合は部分的成功として207を返す
    const statusCode = results.errors.length > 0 ? 207 : 200;

    return NextResponse.json(responseData, { status: statusCode });

  } catch (error) {
    console.error('[Revalidate API Error]:', error);
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// GET メソッドで現在のリバリデート設定情報を取得
export async function GET() {
  return NextResponse.json({
    service: 'nextjs-revalidate-api',
    version: '1.0.0',
    supportedMethods: ['POST'],
    requiredFields: ['secret', 'path or tag'],
    example: {
      path: '/features/data-fetching',
      tag: 'posts',
      secret: 'your-secret-key'
    },
    timestamp: new Date().toISOString(),
  });
}
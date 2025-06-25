import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // バックエンドAPIのヘルスチェック
    const backendHealthCheck = async () => {
      try {
        const response = await fetch(`${process.env.API_URL || 'http://localhost:8000'}/health`, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
          },
        });
        
        if (!response.ok) {
          return { status: 'error', message: 'Backend API unhealthy' };
        }
        
        const data = await response.json() as { status: string; database: string };
        return { 
          status: data.status === 'ok' ? 'healthy' : 'unhealthy',
          database: data.database 
        };
      } catch (error) {
        return { 
          status: 'error', 
          message: error instanceof Error ? error.message : 'Unknown error' 
        };
      }
    };

    const backendHealth = await backendHealthCheck();

    // Next.js アプリケーションの基本ヘルスチェック
    const healthData = {
      status: backendHealth.status === 'healthy' ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      service: 'nextjs-frontend',
      version: process.env.npm_package_version || '0.1.0',
      backend: backendHealth,
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
    };

    // ヘルスチェック結果に応じてステータスコードを設定
    const statusCode = healthData.status === 'ok' ? 200 : 503;

    return NextResponse.json(healthData, { status: statusCode });
  } catch (error) {
    console.error('[Health Check Error]:', error);
    
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        service: 'nextjs-frontend',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
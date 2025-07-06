import { FileText, Home, Menu, Settings, User } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface NestedLayoutProps {
  children: ReactNode;
}

export default function NestedLayout({ children }: NestedLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 共通ヘッダー */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Menu className="h-6 w-6 text-gray-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Nested Layout Demo</h1>
              <Badge variant="secondary" className="ml-3">
                Layout Layer 2
              </Badge>
            </div>
            <nav data-testid="shared-navigation" className="flex space-x-4">
              <a
                href="/"
                className="flex items-center text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                <Home className="h-4 w-4 mr-1" />
                ホーム
              </a>
              <a
                href="/features"
                className="flex items-center text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                <FileText className="h-4 w-4 mr-1" />
                ドキュメント
              </a>
              <a
                href="/settings"
                className="flex items-center text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                <Settings className="h-4 w-4 mr-1" />
                設定
              </a>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* サイドバー */}
          <aside className="lg:col-span-1">
            <Card data-testid="sidebar-content">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  サイドバー
                </CardTitle>
              </CardHeader>
              <CardContent>
                <nav className="space-y-2">
                  <a
                    href="/features/routing/basic"
                    className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Basic Routing
                  </a>
                  <a
                    href="/features/routing/nested-layout"
                    className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 bg-blue-50 text-blue-700"
                  >
                    Nested Layout
                  </a>
                  <a
                    href="/features/routing/dynamic/1"
                    className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Dynamic Routes
                  </a>
                  <a
                    href="/features/routing/loading-error"
                    className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Loading States
                  </a>
                </nav>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">レイアウト情報</h4>
                  <div className="space-y-2 text-xs text-gray-600">
                    <div>ルートレイアウト: app/layout.tsx</div>
                    <div>ネストレイアウト: app/features/routing/nested-layout/layout.tsx</div>
                    <div>ページ: app/features/routing/nested-layout/page.tsx</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* メインコンテンツエリア */}
          <main className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="mb-4">
                <Badge variant="outline" className="mb-2">
                  Nested Layout Content
                </Badge>
                <div className="text-sm text-gray-500">
                  このコンテンツエリアはネストされたレイアウト内でレンダリングされます
                </div>
              </div>
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

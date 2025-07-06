import { Shield, Users } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

interface RouteGroupLayoutProps {
  children: ReactNode;
}

export default function RouteGroupLayout({ children }: RouteGroupLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Route Group Header */}
      <header className="bg-white shadow-sm border-b border-purple-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Route Groups Demo</h1>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    (route-groups)
                  </Badge>
                  <span className="text-xs text-gray-500">URLに影響しないルートグループ</span>
                </div>
              </div>
            </div>

            <nav className="flex space-x-4">
              <a
                href="/features/routing/(route-groups)/public"
                className="flex items-center text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                <Users className="h-4 w-4 mr-1" />
                Public
              </a>
              <a
                href="/features/routing/(route-groups)/admin"
                className="flex items-center text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                <Shield className="h-4 w-4 mr-1" />
                Admin
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-purple-200 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Route Groups の仕組み</h2>
            <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
              <p className="text-sm text-purple-800">
                <code className="bg-purple-100 px-2 py-1 rounded text-xs">(route-groups)</code>{" "}
                という括弧付きフォルダは、
                URLパスには含まれませんが、レイアウトやorganizationのために使用できます。
              </p>
              <div className="mt-3 space-y-1 text-xs text-purple-700">
                <div>📁 app/features/routing/(route-groups)/admin → /features/routing/admin</div>
                <div>📁 app/features/routing/(route-groups)/public → /features/routing/public</div>
              </div>
            </div>
          </div>

          {children}
        </div>
      </main>
    </div>
  );
}

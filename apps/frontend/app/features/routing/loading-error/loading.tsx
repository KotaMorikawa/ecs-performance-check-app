import { RefreshCw } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
          <div className="flex items-center space-x-3">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            <h2 className="text-2xl font-semibold text-gray-900">ページを読み込み中...</h2>
          </div>

          <p className="text-gray-600 text-center max-w-md">
            Next.js 15.3.4のローディングUIが表示されています。
            このコンポーネントはページのコンテンツが読み込まれる間に自動的に表示されます。
          </p>

          <div className="w-full max-w-xs">
            <div className="bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full animate-pulse"
                style={{ width: "60%" }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-2 text-center">読み込み中...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

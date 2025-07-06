"use client";

interface SimpleCodeDisplayProps {
  code: string;
  language?: string;
  title?: string;
}

export function SimpleCodeDisplay({ code, language = "tsx", title }: SimpleCodeDisplayProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      {title && (
        <div className="bg-gray-50 px-3 py-2 border-b">
          <span className="text-sm font-medium text-gray-700">{title}</span>
          <span className="ml-2 text-xs text-gray-500">{language}</span>
        </div>
      )}
      <div className="bg-white p-4 overflow-x-auto">
        <pre className="text-sm">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

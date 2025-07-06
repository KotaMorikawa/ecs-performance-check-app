"use client";

import { Check, Code2, Copy, Eye, EyeOff, FileText } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface CodeFile {
  filename: string;
  language: string;
  content: string;
  description: string;
}

interface CodeDisplayProps {
  title: string;
  description: string;
  files: CodeFile[];
}

export function CodeDisplay({ title, description, files }: CodeDisplayProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(0);
  const [copiedStates, setCopiedStates] = useState<Record<number, boolean>>({});

  const copyToClipboard = async (content: string, index: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedStates((prev) => ({ ...prev, [index]: true }));
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [index]: false }));
      }, 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  const formatCode = (code: string) => {
    // シンプルなコードフォーマット（本来はsyntax highlighterを使用）
    return code.split("\n").map((line, index) => (
      <div key={`line-${index}-${line.slice(0, 20)}`} className="flex">
        <span className="text-gray-400 select-none w-8 text-right pr-2 text-xs">{index + 1}</span>
        <span className="flex-1 font-mono text-sm">{line || " "}</span>
      </div>
    ));
  };

  if (!isVisible) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Code2 className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="font-semibold text-gray-900">ソースコード</h3>
                <p className="text-sm text-gray-600">この機能の実装コードを確認できます</p>
              </div>
            </div>
            <Button onClick={() => setIsVisible(true)} className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              コードを表示
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5" />
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Button
            onClick={() => setIsVisible(false)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <EyeOff className="h-4 w-4" />
            閉じる
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* ファイルタブ */}
          <div className="flex flex-wrap gap-2">
            {files.map((file, index) => (
              <Button
                key={file.filename}
                onClick={() => setSelectedFile(index)}
                variant={selectedFile === index ? "default" : "outline"}
                size="sm"
                className="flex items-center gap-2"
              >
                <FileText className="h-3 w-3" />
                {file.filename}
                <Badge variant="secondary" className="text-xs">
                  {file.language}
                </Badge>
              </Button>
            ))}
          </div>

          {/* 選択されたファイルの内容 */}
          {files[selectedFile] && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{files[selectedFile].filename}</h4>
                  <p className="text-sm text-gray-600">{files[selectedFile].description}</p>
                </div>
                <Button
                  onClick={() => copyToClipboard(files[selectedFile].content, selectedFile)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {copiedStates[selectedFile] ? (
                    <>
                      <Check className="h-4 w-4 text-green-600" />
                      コピー済み
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      コピー
                    </>
                  )}
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-3 py-2 border-b">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    <span className="text-sm text-gray-600 ml-2">
                      {files[selectedFile].filename}
                    </span>
                  </div>
                </div>
                <div className="bg-white p-4 overflow-x-auto max-h-96">
                  <div className="text-sm">{formatCode(files[selectedFile].content)}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

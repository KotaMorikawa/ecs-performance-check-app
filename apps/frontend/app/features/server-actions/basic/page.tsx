import type { Metadata } from "next";
import { ServerActionsContainer } from "./_containers/container";

export const metadata: Metadata = {
  title: "Server Actions デモ - ECS Performance Check",
  description:
    "Next.js 15.3.4のServer Actionsを使用したサーバーサイドアクション機能とProgressive Enhancementのデモ",
  keywords: ["Next.js", "Server Actions", "Progressive Enhancement", "JavaScript", "フォーム"],
  openGraph: {
    title: "Server Actions デモ",
    description: "JavaScript無効環境でも動作するServer Actionsフォーム",
    type: "website",
  },
};

export default function ServerActionsPage() {
  return <ServerActionsContainer />;
}

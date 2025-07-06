import { SsrContainer } from "./_containers/container";

// メタデータ
export const metadata = {
  title: "SSR Data Fetching Demo",
  description: "Server-Side Rendering demonstration with real-time data",
};

export default async function SsrPage() {
  return <SsrContainer />;
}

import { BasicRoutingPresentational } from "./presentational";

export function BasicRoutingContainer() {
  // Server Componentでデータ取得
  const serverData = {
    timestamp: new Date().toISOString(),
    serverRenderTime: Date.now(),
  };

  return <BasicRoutingPresentational serverData={serverData} />;
}

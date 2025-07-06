import { IsrContainer } from "./_containers/container";

// メタデータ
export const metadata = {
  title: "ISR Data Fetching Demo",
  description: "Incremental Static Regeneration demonstration with time-based revalidation",
};

export default async function IsrPage() {
  return <IsrContainer />;
}

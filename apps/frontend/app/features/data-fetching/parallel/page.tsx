import { ParallelContainer } from './_containers/container';

// メタデータ
export const metadata = {
  title: 'Parallel Data Fetching Demo',
  description: 'Parallel data fetching with Promise.all demonstration',
};

export default async function ParallelPage() {
  return <ParallelContainer />;
}
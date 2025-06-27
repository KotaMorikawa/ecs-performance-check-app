import Link from 'next/link';

// メタデータ
export const metadata = {
  title: 'SSG Data Fetching Demo',
  description: 'Static Site Generation demonstration with generateStaticParams',
};

export default async function SsgIndexPage() {
  // カテゴリー一覧を取得してリンクを生成
  const API_BASE_URL = process.env.API_URL || 'http://localhost:8000';
  
  let categories = [];
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const result = await response.json();
      categories = result.data || [];
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">SSG Data Fetching Demo</h1>
      <p className="text-gray-600 mb-8">
        Static Site Generation (SSG) with generateStaticParams demonstration.
        Each category page is pre-generated at build time.
      </p>
      
      <h2 className="text-xl font-semibold mb-4">Available Categories:</h2>
      <div className="space-y-2">
        {categories.map((category: { id: number; name: string; slug: string }) => (
          <Link
            key={category.id}
            href={`/features/data-fetching/ssg/${category.slug}` as const}
            className="block p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <span className="font-medium">{category.name}</span>
            <span className="text-sm text-gray-500 ml-2">({category.slug})</span>
          </Link>
        ))}
      </div>
      
      {categories.length === 0 && (
        <p className="text-yellow-600">
          No categories available. Make sure the backend is running.
        </p>
      )}
    </div>
  );
}
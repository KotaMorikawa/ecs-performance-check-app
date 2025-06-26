import { SsgContainer } from './_containers/container';

// メタデータ
export const metadata = {
  title: 'SSG Category Page',
  description: 'Static Site Generation demonstration with generateStaticParams',
};

// SSG用の静的パラメータ生成
export async function generateStaticParams() {
  try {
    const API_BASE_URL = process.env.API_URL || 'http://localhost:8000';
    
    const response = await fetch(`${API_BASE_URL}/api/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch categories for generateStaticParams:', response.statusText);
      return [];
    }

    const result = await response.json();
    const categories = result.data || [];

    return categories.map((category: { slug: string }) => ({
      category: category.slug,
    }));
  } catch (error) {
    console.error('Error in generateStaticParams:', error);
    return [];
  }
}

interface SsgPageProps {
  params: Promise<{
    category: string;
  }>;
}

export default async function SsgPage({ params }: SsgPageProps) {
  const { category } = await params;
  return <SsgContainer category={category} />;
}
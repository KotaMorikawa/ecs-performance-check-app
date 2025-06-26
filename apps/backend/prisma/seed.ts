import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 シードデータの投入を開始...');

  // カテゴリを作成
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'technology' },
      update: {},
      create: {
        name: 'Technology',
        slug: 'technology',
        description: 'Latest tech news and tutorials',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'design' },
      update: {},
      create: {
        name: 'Design',
        slug: 'design',
        description: 'UI/UX design patterns and inspiration',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'business' },
      update: {},
      create: {
        name: 'Business',
        slug: 'business',
        description: 'Business strategies and insights',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'development' },
      update: {},
      create: {
        name: 'Development',
        slug: 'development',
        description: 'Software development best practices',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'marketing' },
      update: {},
      create: {
        name: 'Marketing',
        slug: 'marketing',
        description: 'Digital marketing tips and strategies',
      },
    }),
  ]);

  console.log(`✅ ${categories.length}個のカテゴリを作成しました`);

  // テストユーザーを作成
  const user1 = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {
      bio: 'Senior Full-Stack Developer with 10+ years of experience',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
      role: 'ADMIN',
      lastActiveAt: new Date(),
    },
    create: {
      email: 'john@example.com',
      name: 'John Doe',
      bio: 'Senior Full-Stack Developer with 10+ years of experience',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
      role: 'ADMIN',
      lastActiveAt: new Date(),
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'jane@example.com' },
    update: {
      bio: 'UX Designer passionate about creating beautiful interfaces',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
      role: 'USER',
      lastActiveAt: new Date(),
    },
    create: {
      email: 'jane@example.com',
      name: 'Jane Smith',
      bio: 'UX Designer passionate about creating beautiful interfaces',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
      role: 'USER',
      lastActiveAt: new Date(),
    },
  });

  console.log('✅ ユーザーを作成しました');

  // タグを作成
  const nextjsTag = await prisma.tag.upsert({
    where: { name: 'Next.js' },
    update: {},
    create: { name: 'Next.js' },
  });

  const performanceTag = await prisma.tag.upsert({
    where: { name: 'Performance' },
    update: {},
    create: { name: 'Performance' },
  });

  const ecsTag = await prisma.tag.upsert({
    where: { name: 'ECS' },
    update: {},
    create: { name: 'ECS' },
  });

  const reactTag = await prisma.tag.upsert({
    where: { name: 'React' },
    update: {},
    create: { name: 'React' },
  });

  console.log('✅ タグを作成しました');

  // テスト投稿を作成
  const posts = [
    {
      title: 'Next.js 15.3.4の新機能',
      content: 'Next.js 15.3.4で追加された新機能について詳しく解説します。App Router、Server Actions、Suspense等の新機能により、より効率的なアプリケーション開発が可能になりました。',
      slug: 'nextjs-15-3-4-new-features',
      published: true,
      authorId: user1.id,
      tagIds: [nextjsTag.id, reactTag.id],
      categoryId: categories[0].id,
    },
    {
      title: 'AWS ECSでのパフォーマンス最適化',
      content: 'AWS ECS環境でのNext.jsアプリケーションのパフォーマンス最適化について実践的な手法を紹介します。',
      slug: 'aws-ecs-performance-optimization',
      published: true,
      authorId: user2.id,
      tagIds: [ecsTag.id, performanceTag.id],
      categoryId: categories[3].id,
    },
    {
      title: 'Core Web Vitalsの測定と改善',
      content: 'Core Web Vitalsの各指標（LCP、FID、CLS、INP）の測定方法と改善手法について解説します。',
      slug: 'core-web-vitals-measurement',
      published: true,
      authorId: user1.id,
      tagIds: [performanceTag.id, nextjsTag.id],
      categoryId: categories[0].id,
    },
    {
      title: 'Docker Composeによる開発環境構築',
      content: 'Next.js、Hono、PostgreSQLを組み合わせたDocker Compose環境の構築方法を説明します。',
      slug: 'docker-compose-development-setup',
      published: false,
      authorId: user2.id,
      tagIds: [ecsTag.id],
      categoryId: categories[3].id,
    },
    {
      title: 'Prismaを使用したデータベース設計',
      content: 'Prismaを活用したスキーマ設計とマイグレーション、シードデータの管理について説明します。',
      slug: 'prisma-database-design',
      published: true,
      authorId: user1.id,
      tagIds: [nextjsTag.id],
      categoryId: categories[3].id,
    },
  ];

  for (const postData of posts) {
    const { tagIds, categoryId, ...postInfo } = postData;
    
    const post = await prisma.post.upsert({
      where: { slug: postInfo.slug },
      update: {},
      create: {
        ...postInfo,
        tags: {
          connect: tagIds.map(id => ({ id }))
        },
        categories: {
          connect: { id: categoryId }
        }
      },
    });
    
    console.log(`✅ 投稿「${post.title}」を作成しました`);
  }

  // パフォーマンスメトリクスのサンプルデータ
  const performanceMetrics = [
    { page: '/features/routing/basic', metric: 'LCP', value: 1.2 },
    { page: '/features/routing/basic', metric: 'FID', value: 8.5 },
    { page: '/features/routing/basic', metric: 'CLS', value: 0.02 },
    { page: '/features/routing/basic', metric: 'INP', value: 120 },
    { page: '/', metric: 'LCP', value: 0.9 },
    { page: '/', metric: 'FID', value: 12.3 },
    { page: '/', metric: 'CLS', value: 0.01 },
    { page: '/', metric: 'INP', value: 95 },
  ];

  for (const metric of performanceMetrics) {
    await prisma.performanceMetric.create({
      data: {
        ...metric,
        userAgent: 'Test Agent',
        connectionType: '4g',
      },
    });
  }

  console.log('✅ パフォーマンスメトリクスのサンプルデータを作成しました');

  // キャッシュメトリクスのサンプルデータ
  const cacheMetrics = [
    { type: 'nextjs', key: '/', hit: true, responseTime: 45 },
    { type: 'nextjs', key: '/features/routing/basic', hit: false, responseTime: 120 },
    { type: 'cloudfront', key: '/static/images/hero.jpg', hit: true, responseTime: 23 },
    { type: 'api', key: '/api/posts', hit: false, responseTime: 89 },
  ];

  for (const metric of cacheMetrics) {
    await prisma.cacheMetric.create({
      data: metric,
    });
  }

  console.log('✅ キャッシュメトリクスのサンプルデータを作成しました');

  console.log('🎉 シードデータの投入が完了しました');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ シードデータの投入に失敗しました:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
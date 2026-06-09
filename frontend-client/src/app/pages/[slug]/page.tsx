import { apiFetch, type ApiRes } from '@/lib/api';
import { notFound } from 'next/navigation';

interface StaticPage {
  id: string;
  slug: string;
  titleEn: string;
  contentEn: string;
}

interface Props { params: Promise<{ slug: string }> }

export default async function StaticPageView({ params }: Props) {
  const { slug } = await params;
  let page: StaticPage | null = null;
  try {
    const res = await apiFetch<ApiRes<StaticPage>>(`/public/pages/${slug}`, { next: { revalidate: 300 } });
    page = res.data;
  } catch { notFound(); }
  if (!page) notFound();

  return (
    <div className="container-main py-8 max-w-3xl">
      <h1 className="text-2xl font-extrabold mb-6">{page.titleEn}</h1>
      <div className="prose max-w-none text-sm leading-relaxed" style={{ color: 'var(--color-text-dim)' }}
        dangerouslySetInnerHTML={{ __html: page.contentEn }} />
    </div>
  );
}

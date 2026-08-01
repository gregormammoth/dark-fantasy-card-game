import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MarkdownBody } from '@/components/site/MarkdownBody';
import { PageHero, PageShell } from '@/components/site/PageBits';
import { getDoc, getDocs } from '@/lib/content';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getDocs('blog').map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDoc('blog', slug);
  if (!doc) return {};
  return { title: doc.title, description: doc.description };
}

export default async function BlogDocPage({ params }: Props) {
  const { slug } = await params;
  const doc = getDoc('blog', slug);
  if (!doc) notFound();

  return (
    <PageShell>
      <PageHero eyebrow="BLOG" title={doc.title} description={doc.description} />
      <MarkdownBody content={doc.body} />
    </PageShell>
  );
}

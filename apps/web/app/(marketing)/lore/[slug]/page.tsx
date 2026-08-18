import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MarkdownBody } from '@/components/site/MarkdownBody';
import { PageShell } from '@/components/site/PageBits';
import { SiteDetailHero } from '@/components/site/SitePageHero';
import { getDoc, getDocs } from '@/lib/content';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getDocs('lore').map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDoc('lore', slug);
  if (!doc) return {};
  return { title: doc.title, description: doc.description };
}

export default async function LoreDocPage({ params }: Props) {
  const { slug } = await params;
  const doc = getDoc('lore', slug);
  if (!doc) notFound();

  return (
    <PageShell>
      <SiteDetailHero kind="lore" title={doc.title} description={doc.description} />
      <MarkdownBody content={doc.body} />
    </PageShell>
  );
}

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MarkdownBody } from '@/components/site/MarkdownBody';
import { PageShell } from '@/components/site/PageBits';
import { SiteDetailHero } from '@/components/site/SitePageHero';
import { getDoc, getDocs } from '@/lib/content';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getDocs('patch-notes').map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDoc('patch-notes', slug);
  if (!doc) return {};
  return { title: doc.title, description: doc.description };
}

export default async function PatchNotePage({ params }: Props) {
  const { slug } = await params;
  const doc = getDoc('patch-notes', slug);
  if (!doc) notFound();

  return (
    <PageShell>
      <SiteDetailHero kind="patch" title={doc.title} description={doc.description} />
      <MarkdownBody content={doc.body} />
    </PageShell>
  );
}

import type { Metadata } from 'next';
import { MarkdownBody } from '@/components/site/MarkdownBody';
import { PageShell } from '@/components/site/PageBits';
import { SiteDocHero } from '@/components/site/SitePageHero';
import { getSingleton } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Roadmap',
  description:
    'Hollowfort Beta roadmap — playable prison slice live; deploy, feedback, balance, and content localization still open.',
};

export default function RoadmapPage() {
  const doc = getSingleton('roadmap');
  return (
    <PageShell>
      <SiteDocHero page="roadmap" title={doc?.title} description={doc?.description} />
      {doc ? <MarkdownBody content={doc.body} /> : null}
    </PageShell>
  );
}

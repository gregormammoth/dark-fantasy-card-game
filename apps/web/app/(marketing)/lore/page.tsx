import type { Metadata } from 'next';
import { ContentCard, PageShell } from '@/components/site/PageBits';
import { SiteIndexHero } from '@/components/site/SitePageHero';
import { getDocs } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Lore',
  description:
    'Lore of Hollowfort Prison — a fortress of executions, a failed ritual, and a deck that is also your flesh.',
};

export default function LoreIndexPage() {
  const docs = getDocs('lore');
  return (
    <PageShell>
      <SiteIndexHero page="lore" />
      <div className="grid gap-4 md:grid-cols-2">
        {docs.map((doc) => (
          <ContentCard
            key={doc.slug}
            href={`/lore/${doc.slug}`}
            title={doc.title}
            description={doc.description}
            meta={doc.date}
          />
        ))}
      </div>
    </PageShell>
  );
}

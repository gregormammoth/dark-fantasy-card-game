import type { Metadata } from 'next';
import { ContentCard, PageHero, PageShell } from '@/components/site/PageBits';
import { getDocs } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Regions',
  description: 'Handcrafted locations you can explore in Hollowfort.',
};

export default function RegionsPage() {
  const docs = getDocs('regions');
  return (
    <PageShell>
      <PageHero
        eyebrow="THE REALM"
        title="Regions"
        description="Each region is authored content — maps, encounters, and story — not a procedural blur."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {docs.map((doc) => (
          <ContentCard
            key={doc.slug}
            href={`/regions/${doc.slug}`}
            title={doc.title}
            description={doc.description}
          />
        ))}
      </div>
    </PageShell>
  );
}

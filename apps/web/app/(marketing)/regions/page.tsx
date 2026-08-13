import type { Metadata } from 'next';
import { ContentCard, PageHero, PageShell } from '@/components/site/PageBits';
import { getDocs } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Regions',
  description:
    'Hollowfort Prison — sixteen handcrafted rooms, three faction branches, and an Exit Gate that opens after you pick a side.',
};

export default function RegionsPage() {
  const docs = getDocs('regions');
  return (
    <PageShell>
      <PageHero
        eyebrow="THE REALM"
        title="Regions"
        description="Hollowfort Prison is the Beta region — sixteen authored rooms, not a procedural blur."
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

import type { Metadata } from 'next';
import { ContentCard, PageHero, PageShell } from '@/components/site/PageBits';
import { getDocs } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Patch Notes',
  description: 'What changed in each Hollowfort release.',
};

export default function PatchNotesPage() {
  const docs = getDocs('patch-notes');
  return (
    <PageShell>
      <PageHero
        eyebrow="CHANGES"
        title="Patch Notes"
        description="Release-by-release notes for the platform and game."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {docs.map((doc) => (
          <ContentCard
            key={doc.slug}
            href={`/patch-notes/${doc.slug}`}
            title={doc.title}
            description={doc.description}
            meta={doc.date}
          />
        ))}
      </div>
    </PageShell>
  );
}

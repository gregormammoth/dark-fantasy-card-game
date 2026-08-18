import type { Metadata } from 'next';
import { ContentCard, PageShell } from '@/components/site/PageBits';
import { SiteIndexHero } from '@/components/site/SitePageHero';
import { getDocs } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Patch Notes',
  description:
    'Hollowfort patch notes — platform shell, prison slice, skills, quests, crowns, and reward reveals.',
};

export default function PatchNotesPage() {
  const docs = getDocs('patch-notes');
  return (
    <PageShell>
      <SiteIndexHero page="patchNotes" />
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

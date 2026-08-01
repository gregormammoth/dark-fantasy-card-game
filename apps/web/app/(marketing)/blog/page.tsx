import type { Metadata } from 'next';
import { ContentCard, PageHero, PageShell } from '@/components/site/PageBits';
import { getDocs } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Development notes and world dispatches from Hollowfort.',
};

export default function BlogPage() {
  const docs = getDocs('blog');
  return (
    <PageShell>
      <PageHero eyebrow="DISPATCHES" title="Blog" description="Build notes and world news." />
      <div className="grid gap-4 md:grid-cols-2">
        {docs.map((doc) => (
          <ContentCard
            key={doc.slug}
            href={`/blog/${doc.slug}`}
            title={doc.title}
            description={doc.description}
            meta={doc.date}
          />
        ))}
      </div>
    </PageShell>
  );
}

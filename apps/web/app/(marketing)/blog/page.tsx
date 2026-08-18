import type { Metadata } from 'next';
import { ContentCard, PageShell } from '@/components/site/PageBits';
import { SiteIndexHero } from '@/components/site/SitePageHero';
import { getDocs } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Development notes from Hollowfort — prison slice updates, progression, and Beta shipping notes.',
};

export default function BlogPage() {
  const docs = getDocs('blog');
  return (
    <PageShell>
      <SiteIndexHero page="blog" />
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

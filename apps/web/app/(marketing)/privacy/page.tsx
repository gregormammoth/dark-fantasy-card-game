import type { Metadata } from 'next';
import { MarkdownBody } from '@/components/site/MarkdownBody';
import { PageShell } from '@/components/site/PageBits';
import { SiteDocHero } from '@/components/site/SitePageHero';
import { getDoc } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Hollowfort handles guest play, cloud saves, and analytics during Beta.',
};

export default function PrivacyPage() {
  const doc = getDoc('legal', 'privacy');
  return (
    <PageShell>
      <SiteDocHero page="privacy" title={doc?.title} description={doc?.description} />
      {doc ? <MarkdownBody content={doc.body} /> : null}
    </PageShell>
  );
}

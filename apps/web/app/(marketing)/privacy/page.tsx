import type { Metadata } from 'next';
import { MarkdownBody } from '@/components/site/MarkdownBody';
import { PageHero, PageShell } from '@/components/site/PageBits';
import { getDoc } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Hollowfort handles data during early development.',
};

export default function PrivacyPage() {
  const doc = getDoc('legal', 'privacy');
  return (
    <PageShell>
      <PageHero title={doc?.title ?? 'Privacy'} description={doc?.description} />
      {doc ? <MarkdownBody content={doc.body} /> : null}
    </PageShell>
  );
}

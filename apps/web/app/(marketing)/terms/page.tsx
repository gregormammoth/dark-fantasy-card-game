import type { Metadata } from 'next';
import { MarkdownBody } from '@/components/site/MarkdownBody';
import { PageHero, PageShell } from '@/components/site/PageBits';
import { getDoc } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms for using the Hollowfort website and game client.',
};

export default function TermsPage() {
  const doc = getDoc('legal', 'terms');
  return (
    <PageShell>
      <PageHero title={doc?.title ?? 'Terms'} description={doc?.description} />
      {doc ? <MarkdownBody content={doc.body} /> : null}
    </PageShell>
  );
}

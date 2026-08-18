import type { Metadata } from 'next';
import { MarkdownBody } from '@/components/site/MarkdownBody';
import { PageShell } from '@/components/site/PageBits';
import { SiteDocHero } from '@/components/site/SitePageHero';
import { getDoc } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms for using the Hollowfort website and game client.',
};

export default function TermsPage() {
  const doc = getDoc('legal', 'terms');
  return (
    <PageShell>
      <SiteDocHero page="terms" title={doc?.title} description={doc?.description} />
      {doc ? <MarkdownBody content={doc.body} /> : null}
    </PageShell>
  );
}

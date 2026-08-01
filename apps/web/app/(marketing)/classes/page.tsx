import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero, PageShell } from '@/components/site/PageBits';
import { homeClassShowcase } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Classes',
  description: 'Four class paths — specialise or hybridise through your deck.',
};

export default function ClassesPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="CHOOSE YOUR PATH"
        title="Four Classes. One Deck."
        description="Each played card grants experience to its class. Build a specialist — or a hybrid."
      />
      <div className="grid gap-6 sm:grid-cols-2">
        {homeClassShowcase.map((item) => (
          <article
            key={item.id}
            className="overflow-hidden rounded-2xl bg-[linear-gradient(180deg,#161110,#100c0b)]"
            style={{ border: `1px solid ${item.borderColor}` }}
          >
            <div className="relative h-[200px]">
              <img src={item.image} alt="" className="h-full w-full object-cover object-top" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgba(12,9,8,.94))]" />
              <div
                className="absolute bottom-3.5 left-5 font-cinzel text-xl tracking-[0.06em]"
                style={{ color: item.color }}
              >
                {item.name}
              </div>
            </div>
            <div className="px-5 pt-4 pb-5">
              <p className="text-[13px] leading-relaxed text-[#a99c8d]">{item.blurb}</p>
              <p className="mt-3 text-[11px] tracking-[0.12em] text-[#8a7f72]">{item.tag}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-10">
        <Link
          href="/play"
          className="inline-block rounded-[10px] bg-[linear-gradient(180deg,#f0cd7e,#c9a24a)] px-7 py-3.5 font-cinzel text-[13px] tracking-[0.14em] text-[#1a1208] transition hover:brightness-110"
        >
          PLAY NOW
        </Link>
      </div>
    </PageShell>
  );
}

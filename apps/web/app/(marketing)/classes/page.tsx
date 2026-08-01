import type { Metadata } from 'next';
import { PageHero, PageShell } from '@/components/site/PageBits';

const classes = [
  {
    id: 'fighter',
    name: 'Fighter',
    blurb: 'Steel and stance. Attack lines that punish openings and hold the line.',
  },
  {
    id: 'rogue',
    name: 'Rogue',
    blurb: 'Precision and poison. Soften targets, then carve through exposed decks.',
  },
  {
    id: 'wizard',
    name: 'Wizard',
    blurb: 'Arcane pressure. Barriers, burns, and tempo swings from the back line.',
  },
  {
    id: 'survivor',
    name: 'Survivor',
    blurb: 'Endure the prison. Scrap tools, desperate defenses, and hard-won grit.',
  },
];

export const metadata: Metadata = {
  title: 'Classes',
  description: 'Four class paths — specialise or hybridise through your deck.',
};

export default function ClassesPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="PATHS"
        title="Classes"
        description="Each played card grants experience to its class. Build a specialist — or a hybrid."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {classes.map((item) => (
          <article
            key={item.id}
            className="border border-[rgba(201,162,74,.16)] bg-[linear-gradient(180deg,#161110,#100c0b)] px-5 py-5"
          >
            <h2 className="font-cinzel text-xl tracking-[0.08em] text-ember-400">{item.name}</h2>
            <p className="mt-3 text-parchment-400">{item.blurb}</p>
          </article>
        ))}
      </div>
    </PageShell>
  );
}

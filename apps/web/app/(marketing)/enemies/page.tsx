import type { Metadata } from 'next';
import enemiesData from '@dark-fantasy/content/enemies.json';
import type { EnemyCatalogFile } from '@dark-fantasy/shared/types/enemy';
import { PageHero, PageShell } from '@/components/site/PageBits';

export const metadata: Metadata = {
  title: 'Enemies',
  description:
    'Twelve Hollowfort foes across intro, common, and elite bands — guards, beasts, ritualists, and three branch bosses.',
};

const GROUP_LABEL: Record<string, string> = {
  warrior: 'Warrior',
  cutthroat: 'Cutthroat',
  ritualist: 'Ritualist',
  beast: 'Beast',
  undead: 'Undead',
  brute: 'Brute',
};

export default function EnemiesPage() {
  const catalog = enemiesData as EnemyCatalogFile;
  const enemies = catalog.enemies;

  return (
    <PageShell>
      <PageHero
        eyebrow="FOES"
        title="Enemies"
        description="Early rooms teach the loop. Later rooms and branch bosses play from their own card groups — not one shared deck."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {enemies.map((enemy) => (
          <article
            key={enemy.id}
            className="overflow-hidden border border-[rgba(201,162,74,.16)] bg-[linear-gradient(180deg,#161110,#100c0b)]"
          >
            {enemy.image ? (
              <div className="relative h-[180px]">
                <img src={enemy.image} alt="" className="h-full w-full object-cover object-top" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(12,9,8,.94))]" />
              </div>
            ) : null}
            <div className="px-5 py-5">
              <p className="text-[10px] tracking-[0.2em] text-ember-500">
                {enemy.band.toUpperCase()}
                {enemy.group ? ` · ${GROUP_LABEL[enemy.group] ?? enemy.group}` : ''}
              </p>
              <h2 className="mt-2 font-cinzel text-xl text-parchment-100">{enemy.name}</h2>
              <p className="mt-1 text-[11px] tracking-[0.12em] text-[#8a7f72]">{enemy.tier}</p>
              {enemy.description ? (
                <p className="mt-3 text-sm leading-relaxed text-parchment-400">{enemy.description}</p>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </PageShell>
  );
}

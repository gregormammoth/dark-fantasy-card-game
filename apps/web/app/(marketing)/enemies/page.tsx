import type { Metadata } from 'next';
import enemiesData from '@dark-fantasy/content/enemies.json';
import type { EnemyCatalogFile } from '@dark-fantasy/shared/types/enemy';
import { EnemiesPageContent } from '@/components/site/EnemiesPageContent';

export const metadata: Metadata = {
  title: 'Enemies',
  description:
    'Twelve Hollowfort foes across intro, common, and elite bands — guards, beasts, ritualists, and three branch bosses.',
};

export default function EnemiesPage() {
  const catalog = enemiesData as EnemyCatalogFile;
  return <EnemiesPageContent enemies={catalog.enemies} />;
}

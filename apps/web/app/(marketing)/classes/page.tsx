import type { Metadata } from 'next';
import { ClassesPageContent } from '@/components/site/ClassesPageContent';

export const metadata: Metadata = {
  title: 'Classes',
  description:
    'Five class paths in Hollowfort — Warrior, Rogue, Wizard, Survivor, and Seeker. Specialise or hybridise through your deck.',
};

export default function ClassesPage() {
  return <ClassesPageContent />;
}

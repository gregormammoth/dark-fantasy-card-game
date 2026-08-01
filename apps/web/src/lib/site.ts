export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? 'Hollowfort',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  description:
    'A dark fantasy deckbuilder of prison escapes, class progression, and deadly card combat.',
  playPath: '/play',
};

export const siteNav = [
  { href: '/', label: 'Home' },
  { href: '/play', label: 'Play' },
  { href: '/about', label: 'About' },
  { href: '/lore', label: 'Lore' },
  { href: '/regions', label: 'Regions' },
  { href: '/cards', label: 'Cards' },
  { href: '/classes', label: 'Classes' },
  { href: '/enemies', label: 'Enemies' },
  { href: '/blog', label: 'Blog' },
  { href: '/roadmap', label: 'Roadmap' },
  { href: '/patch-notes', label: 'Patch Notes' },
] as const;

export const legalNav = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
] as const;

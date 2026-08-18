export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? 'Hollowfort',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  description:
    'Escape Hollowfort Prison in a dark fantasy deckbuilder. Five classes, thirty cards, quests, crowns, and one continuous run from cell to gate.',
  playPath: '/play',
};

export const primaryNav = [
  { href: '/', key: 'home' },
  { href: '/play', key: 'play' },
  { href: '/about', key: 'about' },
  { href: '/lore', key: 'lore' },
  { href: '/regions', key: 'regions' },
  { href: '/cards', key: 'cards' },
  { href: '/classes', key: 'classes' },
  { href: '/enemies', key: 'enemies' },
] as const;

export const secondaryNav = [
  { href: '/blog', key: 'blog' },
  { href: '/roadmap', key: 'roadmap' },
  { href: '/patch-notes', key: 'patchNotes' },
] as const;

export const siteNav = [...primaryNav, ...secondaryNav] as const;

export const legalNav = [
  { href: '/privacy', key: 'privacy' },
  { href: '/terms', key: 'terms' },
] as const;

export const homeStats = [
  { value: '5', key: 'classes' },
  { value: '30', key: 'cards' },
  { value: '16', key: 'rooms' },
  { value: '3', key: 'factions' },
] as const;

export const homeClassShowcase = [
  {
    id: 'warrior',
    href: '/classes',
    color: '#5b86c4',
    borderColor: 'rgba(91,134,196,.35)',
    glow: 'rgba(91,134,196,.35)',
    image: '/characters/player_fighter.glb',
  },
  {
    id: 'rogue',
    href: '/classes',
    color: '#6fb681',
    borderColor: 'rgba(74,150,94,.35)',
    glow: 'rgba(74,150,94,.35)',
    image: '/characters/player_rogue.glb',
  },
  {
    id: 'wizard',
    href: '/classes',
    color: '#9b83d9',
    borderColor: 'rgba(122,90,190,.35)',
    glow: 'rgba(122,90,190,.35)',
    image: '/characters/player_wizard.glb',
  },
  {
    id: 'survivor',
    href: '/classes',
    color: '#e0524a',
    borderColor: 'rgba(224,82,74,.35)',
    glow: 'rgba(224,82,74,.35)',
    image: '/characters/player_survivor.glb',
  },
  {
    id: 'seeker',
    href: '/classes',
    color: '#c9a24a',
    borderColor: 'rgba(201,162,74,.35)',
    glow: 'rgba(201,162,74,.35)',
    image: '/characters/player.glb',
  },
] as const;

export const homeFeatureKeys = ['progression', 'combat', 'exploration'] as const;

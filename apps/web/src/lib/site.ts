export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? 'Hollowfort',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  description:
    'Escape Hollowfort Prison in a dark fantasy deckbuilder. Five classes, thirty cards, quests, crowns, and one continuous run from cell to gate.',
  playPath: '/play',
};

export const primaryNav = [
  { href: '/', label: 'Home' },
  { href: '/play', label: 'Play' },
  { href: '/about', label: 'About' },
  { href: '/lore', label: 'Lore' },
  { href: '/regions', label: 'Regions' },
  { href: '/cards', label: 'Cards' },
  { href: '/classes', label: 'Classes' },
  { href: '/enemies', label: 'Enemies' },
] as const;

export const secondaryNav = [
  { href: '/blog', label: 'Blog' },
  { href: '/roadmap', label: 'Roadmap' },
  { href: '/patch-notes', label: 'Patch Notes' },
] as const;

export const siteNav = [...primaryNav, ...secondaryNav] as const;

export const legalNav = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
] as const;

export const homeStats = [
  { value: '5', label: 'CLASSES TO MASTER' },
  { value: '30', label: 'PLAYER CARDS' },
  { value: '16', label: 'PRISON ROOMS' },
  { value: '3', label: 'FACTION PATHS' },
] as const;

export const homeClassShowcase = [
  {
    id: 'warrior',
    name: 'Warrior',
    href: '/classes',
    color: '#5b86c4',
    borderColor: 'rgba(91,134,196,.35)',
    glow: 'rgba(91,134,196,.35)',
    image: '/characters/player_fighter.png',
    blurb: 'Heavy strikes, raised shields, and reckless swings built to outlast anything below.',
    tag: 'MELEE · DEFENCE',
  },
  {
    id: 'rogue',
    name: 'Rogue',
    href: '/classes',
    color: '#6fb681',
    borderColor: 'rgba(74,150,94,.35)',
    glow: 'rgba(74,150,94,.35)',
    image: '/characters/player_rogue.png',
    blurb: 'Backstabs, poison, and smoke — vanish before the guards ever see you.',
    tag: 'STEALTH · TEMPO',
  },
  {
    id: 'wizard',
    name: 'Wizard',
    href: '/classes',
    color: '#9b83d9',
    borderColor: 'rgba(122,90,190,.35)',
    glow: 'rgba(122,90,190,.35)',
    image: '/characters/player_wizard.png',
    blurb: 'Arcane bolts, barriers, and tempo swings — control the field before it closes in.',
    tag: 'RANGED · CONTROL',
  },
  {
    id: 'survivor',
    name: 'Survivor',
    href: '/classes',
    color: '#e0524a',
    borderColor: 'rgba(224,82,74,.35)',
    glow: 'rgba(224,82,74,.35)',
    image: '/characters/player_survivor.png',
    blurb: 'Scrap tools, desperate defenses, and hard-won grit from the prison itself.',
    tag: 'ENDURE · SCRAP',
  },
  {
    id: 'seeker',
    name: 'Seeker',
    href: '/classes',
    color: '#c9a24a',
    borderColor: 'rgba(201,162,74,.35)',
    glow: 'rgba(201,162,74,.35)',
    image: '/characters/player.png',
    blurb: 'Mark weak points, dig for answers, then strike where the armor fails.',
    tag: 'MARK · EXPLOIT',
  },
] as const;

export const homeFeatures = [
  {
    tag: 'PROGRESSION',
    title: 'Cards And Skills Grow Together',
    desc: 'Class XP unlocks improved cards. Player levels let you raise max shield, combo, mana, deck, or draw — without binding skills to a class.',
  },
  {
    tag: 'COMBAT',
    title: 'Your Deck Is Your Life',
    desc: 'Stack combos, read the preview, then burn through shields and barriers. Damage eats cards. The last card is the last breath.',
  },
  {
    tag: 'EXPLORATION',
    title: 'Quests, Crowns, And Loyalty',
    desc: 'Sixteen rooms, faction kill-quests, and a Smuggler who sells restoratives. Your hand and shield carry from corridor into the fight.',
  },
] as const;

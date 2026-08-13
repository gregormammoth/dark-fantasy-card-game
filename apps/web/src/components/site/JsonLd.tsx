import { siteConfig } from '@/lib/site';

export function JsonLd() {
  const data = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteConfig.name,
      url: siteConfig.url,
      description: siteConfig.description,
      potentialAction: {
        '@type': 'PlayAction',
        target: `${siteConfig.url}${siteConfig.playPath}`,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'VideoGame',
      name: siteConfig.name,
      url: siteConfig.url,
      description: siteConfig.description,
      genre: ['Deckbuilding', 'Dark Fantasy', 'Roguelike'],
      gamePlatform: 'Web browser',
      playMode: 'SinglePlayer',
      applicationCategory: 'Game',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

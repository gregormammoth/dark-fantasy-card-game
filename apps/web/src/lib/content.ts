import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

export type SiteDoc = {
  slug: string;
  title: string;
  description: string;
  date?: string;
  body: string;
};

const contentRoot = path.join(process.cwd(), 'content');

function readCollection(collection: string): SiteDoc[] {
  const dir = path.join(contentRoot, collection);
  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), 'utf8');
      const { data, content } = matter(raw);
      return {
        slug: file.replace(/\.md$/, ''),
        title: String(data.title ?? file),
        description: String(data.description ?? ''),
        date: data.date ? String(data.date) : undefined,
        body: content.trim(),
      };
    })
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
}

export function getDocs(collection: string): SiteDoc[] {
  return readCollection(collection);
}

export function getDoc(collection: string, slug: string): SiteDoc | null {
  return readCollection(collection).find((doc) => doc.slug === slug) ?? null;
}

export function getSingleton(collection: string): SiteDoc | null {
  const docs = readCollection(collection);
  return docs[0] ?? null;
}

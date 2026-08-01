import Link from 'next/link';

export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-10 border-b border-[rgba(201,162,74,.16)] pb-8">
      {eyebrow ? (
        <p className="mb-3 font-cinzel text-[11px] tracking-[0.32em] text-ember-500">{eyebrow}</p>
      ) : null}
      <h1 className="font-cinzel text-4xl tracking-[0.1em] text-parchment-100 sm:text-5xl">
        {title}
      </h1>
      {description ? <p className="mt-4 max-w-2xl text-parchment-400">{description}</p> : null}
    </div>
  );
}

export function ContentCard({
  href,
  title,
  description,
  meta,
}: {
  href: string;
  title: string;
  description: string;
  meta?: string;
}) {
  return (
    <Link
      href={href}
      className="block border border-[rgba(201,162,74,.16)] bg-[linear-gradient(180deg,#161110,#100c0b)] px-5 py-5 transition hover:-translate-y-0.5 hover:border-ember-500/40"
    >
      {meta ? (
        <p className="mb-2 text-[10px] tracking-[0.2em] text-parchment-500">{meta}</p>
      ) : null}
      <h2 className="font-cinzel text-lg tracking-[0.08em] text-parchment-100">{title}</h2>
      <p className="mt-2 text-sm text-parchment-400">{description}</p>
    </Link>
  );
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-6xl px-6 py-14">{children}</div>;
}

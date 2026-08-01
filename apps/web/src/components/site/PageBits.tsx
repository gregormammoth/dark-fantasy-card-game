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
    <div className="mb-12 border-b border-[rgba(201,162,74,.16)] pb-9">
      {eyebrow ? (
        <p className="mb-3 text-[11px] tracking-[0.28em] text-[#8a7f72]">{eyebrow}</p>
      ) : null}
      <h1 className="font-cinzel text-4xl leading-tight tracking-[0.04em] text-[#f0dfcb] sm:text-[42px]">
        {title}
      </h1>
      {description ? (
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[#a99c8d]">{description}</p>
      ) : null}
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
      className="block rounded-[14px] border border-[rgba(201,162,74,.16)] bg-[linear-gradient(180deg,#161110,#100c0b)] px-5 py-5 transition duration-200 hover:-translate-y-1 hover:border-[rgba(224,181,82,.4)]"
    >
      {meta ? (
        <p className="mb-2 text-[10px] tracking-[0.2em] text-[#8a7f72]">{meta}</p>
      ) : null}
      <h2 className="font-cinzel text-lg tracking-[0.06em] text-[#f0dfcb]">{title}</h2>
      <p className="mt-2 text-[13px] leading-relaxed text-[#a99c8d]">{description}</p>
    </Link>
  );
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[1180px] px-6 py-14 lg:px-10 lg:py-[70px]">{children}</div>
  );
}

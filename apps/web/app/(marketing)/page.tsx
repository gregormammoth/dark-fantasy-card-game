import Link from 'next/link';
import { HomeHero } from '@/components/site/HomeHero';
import { ParallaxFrame } from '@/components/site/ParallaxFrame';
import { RevealOnScroll } from '@/components/site/RevealOnScroll';
import { TiltCard } from '@/components/site/TiltCard';
import {
  homeClassShowcase,
  homeFeatures,
  homeStats,
} from '@/lib/site';

export default function HomePage() {
  return (
    <div className="overflow-x-clip bg-[#0b0908] text-[#e8ddcf]">
      <HomeHero />

      <RevealOnScroll className="relative z-[5] mx-auto -mt-16 max-w-[1180px] px-6 lg:px-10">
        <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-[rgba(201,162,74,.22)] bg-[rgba(20,16,15,.82)] shadow-[0_40px_90px_-30px_#000] backdrop-blur-[10px] md:grid-cols-4">
          {homeStats.map((stat, index) => (
            <div
              key={stat.label}
              className={`px-5 py-[26px] text-center transition-colors duration-200 hover:bg-[rgba(224,181,82,.05)] ${index < homeStats.length - 1 ? 'border-[rgba(201,162,74,.14)] md:border-r' : ''} ${index % 2 === 0 ? 'border-[rgba(201,162,74,.14)] max-md:border-r' : ''} ${index < 2 ? 'max-md:border-b' : ''}`}
            >
              <div className="font-cinzel text-[26px] text-ember-400">{stat.value}</div>
              <div className="mt-1.5 text-[11px] tracking-[0.14em] text-[#8a7f72]">{stat.label}</div>
            </div>
          ))}
        </div>
      </RevealOnScroll>

      <section
        id="about"
        className="mx-auto mt-[130px] grid max-w-[1180px] items-center gap-[60px] px-6 lg:grid-cols-[1.1fr_1fr] lg:px-10"
      >
        <div className="flex flex-col gap-[18px]">
          <p className="text-[11px] tracking-[0.28em] text-[#8a7f72]">THE LORE</p>
          <h2 className="font-cinzel text-4xl leading-snug text-[#f0dfcb]">
            A prison built
            <br />
            from broken oaths
          </h2>
          <p className="text-[15px] leading-relaxed text-[#a99c8d]">
            Centuries ago the crown sealed its heretics beneath Hollowfort&apos;s walls. Now the
            wards are failing. Every prisoner who escapes carries a deck of stolen magic — the only
            currency that matters in the dark below.
          </p>
          <div>
            <Link
              href="/regions/hollowfort-prison"
              className="border-b border-[rgba(224,181,82,.4)] pb-0.5 text-[13px] tracking-[0.06em] text-ember-400 transition hover:text-[#f0c979]"
            >
              Explore the prison floorplan →
            </Link>
          </div>
        </div>
        <ParallaxFrame
          multiplier={0.06}
          className="relative h-[340px] overflow-hidden rounded-2xl border border-[rgba(201,162,74,.2)] shadow-[0_30px_70px_-30px_#000]"
        >
          <img
            src="/locations/courtyard.png"
            alt=""
            className="h-full w-full object-cover object-center"
          />
        </ParallaxFrame>
      </section>

      <RevealOnScroll>
        <section id="classes" className="mx-auto mt-[150px] max-w-[1180px] px-6 lg:px-10">
          <div className="mb-[34px] flex flex-col gap-4 sm:flex-row sm:items-baseline sm:justify-between">
            <div>
              <p className="mb-2.5 text-[11px] tracking-[0.28em] text-[#8a7f72]">CHOOSE YOUR PATH</p>
              <h2 className="font-cinzel text-[34px] text-[#f0dfcb]">Five Classes. One Deck.</h2>
            </div>
            <Link
              href="/classes"
              className="border-b border-[rgba(201,162,74,.3)] pb-0.5 text-[13px] tracking-[0.06em] text-[#c7bba9] transition hover:text-[#f0c979]"
            >
              View progression →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {homeClassShowcase.map((item) => (
              <TiltCard
                key={item.id}
                href={item.href}
                glow={item.glow}
                borderColor={item.borderColor}
              >
                <div className="relative h-[220px]">
                  <img src={item.image} alt="" className="h-full w-full object-cover object-top" />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(12,9,8,.92))]" />
                  <div
                    className="absolute bottom-3.5 left-[18px] font-cinzel text-xl tracking-[0.06em]"
                    style={{ color: item.color }}
                  >
                    {item.name}
                  </div>
                </div>
                <div className="flex flex-col gap-2.5 px-5 pt-[18px] pb-[22px]">
                  <p className="text-[13px] leading-relaxed text-[#a99c8d]">{item.blurb}</p>
                  <p className="mt-1 text-[11px] tracking-[0.12em] text-[#8a7f72]">{item.tag}</p>
                </div>
              </TiltCard>
            ))}
          </div>
        </section>
      </RevealOnScroll>

      <RevealOnScroll>
        <section
          id="regions"
          className="mx-auto mt-[150px] grid max-w-[1180px] items-center gap-[60px] px-6 lg:grid-cols-[1fr_1.1fr] lg:px-10"
        >
          <ParallaxFrame
            multiplier={-0.05}
            className="relative h-[380px] overflow-hidden rounded-2xl border border-[rgba(201,162,74,.2)] shadow-[0_30px_70px_-30px_#000]"
          >
            <img
              src="/world/world-map.png"
              alt=""
              className="h-full w-full object-cover object-[center_30%]"
            />
          </ParallaxFrame>
          <div className="flex flex-col gap-[18px]">
            <p className="text-[11px] tracking-[0.28em] text-[#8a7f72]">THE WORLD</p>
            <h2 className="font-cinzel text-4xl leading-snug text-[#f0dfcb]">Chart your escape</h2>
            <p className="text-[15px] leading-relaxed text-[#a99c8d]">
              Sixteen handcrafted rooms, three faction bosses, and an Exit Gate that only opens after
              you pick a side. Your exploration hand, deck, and shield carry into every fight.
            </p>
            <div className="mt-1.5 flex flex-wrap gap-4">
              <Link
                href="/play"
                className="rounded-[9px] bg-[linear-gradient(180deg,#f0cd7e,#c9a24a)] px-[22px] py-3 font-cinzel text-xs tracking-[0.12em] text-[#1a1208] transition-[transform,filter] duration-200 hover:-translate-y-0.5 hover:brightness-[1.08]"
              >
                OPEN WORLD MAP
              </Link>
              <Link
                href="/enemies"
                className="rounded-[9px] border border-[rgba(201,162,74,.4)] px-[22px] py-3 font-cinzel text-xs tracking-[0.12em] text-[#e8ddcf] transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-ember-400"
              >
                SEE COMBAT
              </Link>
            </div>
          </div>
        </section>
      </RevealOnScroll>

      <RevealOnScroll className="mx-auto mt-[150px] max-w-[1180px] px-6 lg:px-10">
        <div className="grid gap-[22px] md:grid-cols-3">
          {homeFeatures.map((feature) => (
            <div
              key={feature.tag}
              className="rounded-[14px] border border-[rgba(201,162,74,.16)] bg-[linear-gradient(180deg,#141110,#0f0c0b)] px-6 py-[26px] transition-[transform,border-color] duration-200 hover:-translate-y-[5px] hover:border-[rgba(201,162,74,.4)]"
            >
              <p className="text-[10px] tracking-[0.2em] text-ember-400">{feature.tag}</p>
              <h3 className="mt-2.5 font-cinzel text-lg text-[#f0dfcb]">{feature.title}</h3>
              <p className="mt-2.5 text-[13px] leading-relaxed text-[#a99c8d]">{feature.desc}</p>
            </div>
          ))}
        </div>
      </RevealOnScroll>

      <section className="mx-auto mt-[150px] max-w-[1180px] px-6 lg:px-10">
        <div className="relative overflow-hidden rounded-[20px] border border-[rgba(201,162,74,.3)] bg-[radial-gradient(900px_300px_at_50%_-30%,rgba(201,162,74,.16),transparent),linear-gradient(180deg,#171210,#0d0a09)] px-8 py-[70px] text-center sm:px-[60px]">
          <div className="pointer-events-none absolute top-[-20%] left-[-6%] h-[300px] w-[300px] animate-[glow_7s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle,rgba(201,162,74,.18),transparent_70%)] blur-[6px]" />
          <p className="relative text-[11px] tracking-[0.3em] text-[#8a7f72]">YOUR RUN WAITS IN THE CELL</p>
          <h2 className="relative mt-3.5 font-cinzel text-[42px] text-[#f3e6d6]">Begin your escape</h2>
          <p className="relative mx-auto mt-3.5 max-w-[480px] text-[15px] text-[#a99c8d]">
            Name a prisoner, spend class XP, pick combat skills, and find the door out of Hollowfort.
          </p>
          <Link
            href="/play"
            className="relative mt-7 inline-block rounded-[10px] bg-[linear-gradient(180deg,#f0cd7e,#c9a24a)] px-[38px] py-[17px] font-cinzel text-sm tracking-[0.16em] text-[#1a1208] shadow-[0_20px_50px_-18px_rgba(201,162,74,.6)] transition-[transform,filter] duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:brightness-[1.08]"
          >
            ENTER HOLLOWFORT
          </Link>
        </div>
      </section>

      <div className="h-[110px]" />
    </div>
  );
}

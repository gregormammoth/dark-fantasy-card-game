import { useMemo, useState, type MouseEvent } from 'react';
import worldMapData from '@/data/worldMap.json';
import type { WorldLocationDefinition, WorldMapDefinition } from '@/types/world';
import { iconSizeForCategory, worldCategoryMeta } from '@/lib/worldTheme';

const worldMap = worldMapData as WorldMapDefinition;

interface WorldMapScreenProps {
  onEnterLocation: (locationId: string) => void;
}

export function WorldMapScreen({ onEnterLocation }: WorldMapScreenProps) {
  const [selectedId, setSelectedId] = useState<string | null>(worldMap.startLocationId);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  const locations = worldMap.locations;
  const enabledCount = locations.filter((location) => location.enabled).length;
  const selected = locations.find((location) => location.id === selectedId) ?? null;

  const legend = useMemo(() => {
    const seen = new Set<string>();
    const items: Array<{ label: string; color: string }> = [];
    for (const location of locations) {
      if (seen.has(location.category)) {
        continue;
      }
      seen.add(location.category);
      const meta = worldCategoryMeta[location.category];
      items.push({ label: meta.label, color: meta.color });
    }
    return items;
  }, [locations]);

  const smokeSpots = [
    { x: (270 / worldMap.mapWidth) * 100, y: 62.5 },
    { x: (510 / worldMap.mapWidth) * 100, y: 46.9 },
    { x: (420 / worldMap.mapWidth) * 100, y: 18.5 },
  ];
  const snowflakes = Array.from({ length: 14 }, (_, i) => ({
    x: (i * 37) % 100,
    size: 2 + (i % 3),
    dur: 4 + (i % 5),
    delay: (i * 0.37) % 4,
  }));
  const sparks = Array.from({ length: 10 }, (_, i) => ({
    x: (i * 53) % 100,
    y: (i * 29) % 100,
    size: 2 + (i % 3),
    color: i % 2 === 0 ? '#7ee6c8' : '#f0d98a',
    dur: 2.4 + (i % 4) * 0.6,
    delay: (i * 0.4) % 3,
  }));
  const flagSpots = [
    { x: 78.8, y: 14.2, color: '#e0b552' },
    { x: 51.4, y: 24.4, color: '#c9a24a' },
    { x: 27.3, y: 18.6, color: '#8fae6a' },
  ];
  const birdSpots = [
    { y: 8, dur: 26, delay: 0 },
    { y: 16, dur: 32, delay: 4 },
    { y: 11, dur: 40, delay: 9 },
  ];
  const shipSpots = [
    { x: 4, y: 68, dur: 3.2 },
    { x: 7.5, y: 92, dur: 4.1 },
  ];

  function onMapMove(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const py = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    setParallax({ x: px, y: py });
  }

  function renderNode(location: WorldLocationDefinition) {
    const meta = worldCategoryMeta[location.category];
    const locked = !location.enabled;
    const isCurrent = location.id === worldMap.startLocationId && location.enabled;
    const markerColor = locked ? '#5a5147' : meta.color;
    const iconSize = iconSizeForCategory(location.category);
    const xPct = (location.x / worldMap.mapWidth) * 100;
    const yPct = (location.y / worldMap.mapHeight) * 100;

    return (
      <button
        key={location.id}
        type="button"
        onClick={() => setSelectedId(location.id)}
        className="absolute z-[12] flex -translate-x-1/2 -translate-y-full flex-col items-center gap-1 transition-transform duration-150 hover:-translate-y-[108%] hover:scale-110"
        style={{ left: `${xPct}%`, top: `${yPct}%` }}
      >
        <div
          className="relative flex items-center justify-center rounded-full border-2"
          style={{
            width: iconSize,
            height: iconSize,
            background: `${markerColor}22`,
            borderColor: markerColor,
            boxShadow: isCurrent
              ? '0 0 0 3px rgba(224,181,82,.5), 0 0 26px -2px rgba(224,181,82,.8)'
              : location.enabled
                ? `0 0 16px -4px ${markerColor}aa`
                : 'none',
          }}
        >
          <span
            className="inline-block"
            style={{
              width: '40%',
              height: '40%',
              background: markerColor,
              clipPath: 'polygon(50% 0,100% 50%,50% 100%,0 50%)',
            }}
          />
          {locked && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-[rgba(201,162,74,.4)] bg-[#1a1512] text-[9px] text-[#8a7f72]">
              🔒
            </span>
          )}
        </div>
        <span
          className="whitespace-nowrap rounded-[5px] border px-2 py-0.5 font-cinzel text-[12px] tracking-wide [text-shadow:0_1px_4px_#000]"
          style={{
            color: locked ? '#7a7166' : '#f3ead8',
            background: 'rgba(9,7,6,.72)',
            borderColor: `${markerColor}33`,
          }}
        >
          {location.name}
        </span>
        {isCurrent && (
          <span className="animate-[herebob_1.6s_ease-in-out_infinite] whitespace-nowrap rounded-md bg-[#e0b552] px-1.5 py-0.5 font-cinzel text-[9px] tracking-[.14em] text-[#1a1208]">
            YOU ARE HERE
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1500px] flex-col gap-3.5 px-5 py-6 text-[#e8ddcf]">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="font-cinzel text-[20px] tracking-wider text-[#e8ddcf]">
            {worldMap.name}
          </span>
          <span className="text-[12px] text-[#8a7f72]">Choose a region to explore</span>
        </div>
        <span className="font-cinzel text-[16px] tracking-[.3em] text-[#b8917f]">FAST TRAVEL</span>
        <span className="text-[10px] tracking-[.18em] text-[#8a7f72]">
          {enabledCount} / {locations.length} AVAILABLE
        </span>
      </div>

      <div
        className="relative w-full overflow-hidden rounded-[14px] border border-[rgba(201,162,74,.18)] bg-[#0a0706]"
        style={{ aspectRatio: `${worldMap.mapWidth} / ${worldMap.mapHeight}` }}
        onMouseMove={onMapMove}
        onMouseLeave={() => setParallax({ x: 0, y: 0 })}
      >
        <img
          src={worldMap.image}
          alt=""
          className="absolute inset-0 z-[1] h-full w-full object-cover"
          style={{
            filter: 'brightness(.95) contrast(1.1) saturate(.94)',
            transform: `scale(1.06) translate(${parallax.x * 6}px, ${parallax.y * 4}px)`,
            transition: 'transform .08s linear',
          }}
          draggable={false}
        />

        <div className="pointer-events-none absolute left-[-10%] top-[8%] z-[2] h-[22%] w-[46%] animate-[shadowDriftA_70s_ease-in-out_infinite_alternate] bg-[radial-gradient(ellipse,rgba(0,0,0,.28),transparent_70%)] blur-[14px]" />
        <div className="pointer-events-none absolute left-[20%] top-[38%] z-[2] h-[18%] w-[40%] animate-[shadowDriftA_95s_ease-in-out_infinite_alternate-reverse] bg-[radial-gradient(ellipse,rgba(0,0,0,.22),transparent_70%)] blur-[16px]" />

        <div className="pointer-events-none absolute inset-0 z-[3] animate-[dayNight_100s_ease-in-out_infinite] mix-blend-multiply" />
        <div className="pointer-events-none absolute inset-0 z-[4] animate-[starsFade_100s_ease-in-out_infinite] bg-[radial-gradient(1px_1px_at_12%_8%,#fff,transparent),radial-gradient(1px_1px_at_22%_15%,#fff,transparent),radial-gradient(1.5px_1.5px_at_35%_6%,#fff,transparent),radial-gradient(1px_1px_at_48%_12%,#fff,transparent),radial-gradient(1.5px_1.5px_at_62%_5%,#fff,transparent),radial-gradient(1px_1px_at_74%_10%,#fff,transparent),radial-gradient(1px_1px_at_85%_7%,#fff,transparent),radial-gradient(1.5px_1.5px_at_92%_14%,#fff,transparent)] opacity-0" />

        <div className="pointer-events-none absolute left-0 top-[2%] z-[6] h-[16%] w-[38%] animate-[cloudDriftA_60s_ease-in-out_infinite_alternate] bg-[radial-gradient(ellipse,rgba(255,255,255,.5),transparent_70%)] blur-[10px]" />
        <div className="pointer-events-none absolute left-[40%] top-[12%] z-[6] h-[12%] w-[30%] animate-[cloudDriftB_75s_ease-in-out_infinite_alternate] bg-[radial-gradient(ellipse,rgba(255,255,255,.4),transparent_70%)] blur-[9px]" />
        <div className="pointer-events-none absolute left-[68%] top-0 z-[6] h-[15%] w-[34%] animate-[cloudDriftA_85s_ease-in-out_infinite_alternate-reverse] bg-[radial-gradient(ellipse,rgba(255,255,255,.45),transparent_70%)] blur-[11px]" />

        <div className="pointer-events-none absolute bottom-0 left-[-8%] z-[5] h-[16%] w-[70%] animate-[fogDrift_46s_ease-in-out_infinite] bg-[linear-gradient(0deg,rgba(200,205,210,.28),transparent)] blur-[10px]" />
        <div className="pointer-events-none absolute bottom-[4%] left-[74%] z-[5] h-[20%] w-[38%] animate-[fogDrift_38s_ease-in-out_infinite_reverse] bg-[linear-gradient(0deg,rgba(150,140,160,.3),transparent)] blur-[9px]" />

        <div className="pointer-events-none absolute left-[8%] top-[82%] z-[7] h-[70px] w-[70px] animate-[torchFlicker_2.4s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle,rgba(255,140,50,.5),transparent_70%)]" />
        <div className="pointer-events-none absolute left-[26%] top-[14%] z-[7] h-[90px] w-[90px] animate-[torchFlicker_3.1s_ease-in-out_infinite_.6s] rounded-full bg-[radial-gradient(circle,rgba(255,150,60,.4),transparent_70%)]" />

        {smokeSpots.map((spot, index) => (
          <div
            key={`smoke-${index}`}
            className="pointer-events-none absolute z-[7]"
            style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
          >
            <span className="absolute h-[7px] w-[7px] animate-[smokeRise_4.6s_ease-out_infinite] rounded-full bg-[rgba(210,206,198,.55)] blur-[1px]" />
            <span className="absolute h-[6px] w-[6px] animate-[smokeRise_4.6s_ease-out_infinite_1.5s] rounded-full bg-[rgba(210,206,198,.5)] blur-[1px]" />
            <span className="absolute h-[6px] w-[6px] animate-[smokeRise_4.6s_ease-out_infinite_3s] rounded-full bg-[rgba(210,206,198,.45)] blur-[1px]" />
          </div>
        ))}

        {flagSpots.map((flag, index) => (
          <div
            key={`flag-${index}`}
            className="pointer-events-none absolute z-[8] h-[22px] w-0.5 bg-[#c9bdae]"
            style={{ left: `${flag.x}%`, top: `${flag.y}%` }}
          >
            <span
              className="absolute left-0.5 top-0 h-[9px] w-[14px] origin-top-left animate-[flagWave_1.7s_ease-in-out_infinite]"
              style={{
                background: flag.color,
                clipPath: 'polygon(0 0,100% 25%,0 50%)',
              }}
            />
          </div>
        ))}

        {birdSpots.map((bird, index) => (
          <div
            key={`bird-${index}`}
            className="pointer-events-none absolute left-0 z-[9]"
            style={{
              top: `${bird.y}%`,
              animation: `birdFly ${bird.dur}s linear infinite ${bird.delay}s`,
            }}
          >
            <span className="relative inline-block h-1.5 w-3.5 opacity-60">
              <span className="absolute left-0 top-[3px] block h-0.5 w-2 rotate-[25deg] rounded-sm bg-[#2a2620]" />
              <span className="absolute right-0 top-[3px] block h-0.5 w-2 -rotate-[25deg] rounded-sm bg-[#2a2620]" />
            </span>
          </div>
        ))}

        {shipSpots.map((ship, index) => (
          <div
            key={`ship-${index}`}
            className="pointer-events-none absolute z-[9]"
            style={{
              left: `${ship.x}%`,
              top: `${ship.y}%`,
              animation: `shipBob ${ship.dur}s ease-in-out infinite`,
            }}
          >
            <div className="relative left-0.5 h-0 w-0 border-l-[7px] border-r-[7px] border-b-[16px] border-l-transparent border-r-transparent border-b-[rgba(230,224,210,.65)]" />
            <div className="-mt-0.5 h-[5px] w-5 rounded-b-lg bg-[#3a3128]" />
          </div>
        ))}

        <div className="pointer-events-none absolute inset-0 z-[10] shadow-[inset_0_0_160px_40px_rgba(0,0,0,.6)]" />

        <div className="pointer-events-none absolute left-[16%] top-0 z-[11] h-[26%] w-[18%] overflow-hidden">
          {snowflakes.map((flake, index) => (
            <span
              key={`snow-${index}`}
              className="absolute -top-[6%] rounded-full bg-[rgba(255,255,255,.85)]"
              style={{
                left: `${flake.x}%`,
                width: flake.size,
                height: flake.size,
                animation: `snowFall ${flake.dur}s linear infinite ${flake.delay}s`,
              }}
            />
          ))}
        </div>

        <div className="pointer-events-none absolute left-[80%] top-[22%] z-[11] h-[22%] w-[18%] overflow-visible">
          {sparks.map((spark, index) => (
            <span
              key={`spark-${index}`}
              className="absolute rounded-full"
              style={{
                left: `${spark.x}%`,
                top: `${spark.y}%`,
                width: spark.size,
                height: spark.size,
                background: spark.color,
                boxShadow: `0 0 6px 1px ${spark.color}`,
                animation: `sparkFloat ${spark.dur}s ease-in-out infinite ${spark.delay}s`,
              }}
            />
          ))}
        </div>

        {locations.map(renderNode)}

        <div className="absolute bottom-4 left-4 z-[14] flex max-w-[340px] flex-wrap gap-x-3.5 gap-y-2 rounded-[10px] border border-[rgba(201,162,74,.22)] bg-[rgba(10,8,7,.78)] px-3 py-2">
          {legend.map((item) => (
            <span
              key={item.label}
              className="inline-flex items-center gap-1.5 text-[10px] tracking-wide text-[#b7ab9c]"
            >
              <span
                className="inline-block h-2 w-2"
                style={{
                  background: item.color,
                  clipPath: 'polygon(50% 0,100% 50%,50% 100%,0 50%)',
                }}
              />
              {item.label}
            </span>
          ))}
        </div>

        {selected && (
          <div className="absolute bottom-0 right-0 top-0 z-[20] flex w-[360px] animate-[slidein_.2s_ease-out] flex-col border-l border-[rgba(201,162,74,.24)] bg-[linear-gradient(180deg,rgba(15,11,10,.97),rgba(9,7,6,.99))] shadow-[-30px_0_60px_-20px_rgba(0,0,0,.7)]">
            <div className="border-b border-[rgba(201,162,74,.16)] px-[22px] py-5">
              <span
                className="text-[10px] tracking-[.24em]"
                style={{ color: worldCategoryMeta[selected.category].color }}
              >
                {worldCategoryMeta[selected.category].label}
              </span>
              <div className="mt-1.5 font-cinzel text-[21px] leading-tight text-[#f3ead8]">
                {selected.name}
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-[22px] py-[18px]">
              <p className="m-0 text-[13px] italic leading-relaxed text-[#c7bba9]">
                {selected.flavor}
              </p>
              {selected.threat && (
                <div className="flex items-center gap-3 rounded-[10px] border-l-[3px] border-[#d6443a] bg-[rgba(214,68,58,.1)] px-3 py-2.5">
                  <div>
                    <div className="text-[13px] text-[#ffd9d2]">{selected.threat.name}</div>
                    <div className="mt-0.5 text-[10px] tracking-wider text-[#c99]">
                      {selected.threat.tier}
                    </div>
                  </div>
                </div>
              )}
              {!selected.enabled && (
                <div className="rounded-[10px] border border-[rgba(201,162,74,.2)] bg-[rgba(255,255,255,.03)] px-3 py-2.5 text-[12px] leading-relaxed text-[#8a7f72]">
                  This region is sealed for now. Escape the Prison Fortress first.
                </div>
              )}
            </div>
            <div className="flex gap-2.5 border-t border-[rgba(201,162,74,.14)] px-[22px] py-4">
              {selected.enabled ? (
                <button
                  type="button"
                  onClick={() => onEnterLocation(selected.id)}
                  className="flex-1 rounded-[10px] border border-[rgba(224,181,82,.5)] bg-[linear-gradient(180deg,rgba(224,181,82,.2),rgba(90,68,19,.3))] px-3 py-3 font-cinzel text-[13px] tracking-wider text-[#f3e2d6] transition hover:brightness-110"
                >
                  ENTER REGION
                </button>
              ) : (
                <span className="flex-1 rounded-[10px] border border-[rgba(201,162,74,.2)] px-3 py-3 text-center text-[11px] tracking-wider text-[#8a7f72]">
                  LOCKED
                </span>
              )}
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="w-[46px] rounded-[10px] border border-[rgba(201,162,74,.24)] text-[#8a7f72] transition hover:text-[#e8ddcf]"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

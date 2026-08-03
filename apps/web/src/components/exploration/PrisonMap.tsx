import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import type { ExplorationContext, LocationDefinition, LocationStatus } from '@dark-fantasy/shared/types/exploration';
import {
  getLocationStatus,
  isLocationVisible,
  listMapEdges,
  isLocationLocked,
  isCorridorBlocked,
} from '@dark-fantasy/game-engine/engine/exploration/map';
import { locationTypeColors, roomSizeFor } from '@/lib/explorationTheme';

interface PrisonMapProps {
  context: ExplorationContext;
  onSelect: (locationId: string) => void;
}

function markerColor(location: LocationDefinition, status: LocationStatus): string {
  if (status === 'distant') {
    return '#4a4640';
  }
  return locationTypeColors[location.type];
}

const MAP_WIDTH = 1840;
const MAP_HEIGHT = 900;

const dustMotes = Array.from({ length: 10 }, (_, i) => ({
  x: (i * 97) % 100,
  y: 40 + ((i * 53) % 55),
  size: 2 + (i % 3),
  dx: (i % 2 ? 1 : -1) * (8 + i * 2),
  dur: 6 + (i % 5) * 1.6,
  delay: (i * 0.5) % 5,
}));

export function PrisonMap({ context, onSelect }: PrisonMapProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = viewportRef.current;
    if (!node) {
      return;
    }
    const sync = () => {
      const rect = node.getBoundingClientRect();
      setViewport({ w: rect.width, h: rect.height });
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const stage = useMemo(() => {
    if (viewport.w <= 0 || viewport.h <= 0) {
      return { width: 0, height: 0, cover: 1, panX: 0, panY: 0 };
    }
    const cover = Math.max(viewport.w / MAP_WIDTH, viewport.h / MAP_HEIGHT);
    const width = MAP_WIDTH * cover;
    const height = MAP_HEIGHT * cover;
    const overflowX = Math.max(0, width - viewport.w);
    const overflowY = Math.max(0, height - viewport.h);
    return {
      width,
      height,
      cover,
      panX: -overflowX / 2 - (parallax.x * overflowX) / 2,
      panY: -overflowY / 2 - (parallax.y * overflowY) / 2,
    };
  }, [viewport.w, viewport.h, parallax.x, parallax.y]);

  const allVisible = useMemo(
    () =>
      Object.values(context.locations).filter((location) =>
        isLocationVisible(context, location.id),
      ),
    [context.locations],
  );

  const byId = useMemo(
    () => Object.fromEntries(allVisible.map((location) => [location.id, location])),
    [allVisible],
  );

  const edges = useMemo(() => {
    return listMapEdges(context)
      .map(([a, b]) => {
        const na = byId[a];
        const nb = byId[b];
        if (!na || !nb) {
          return null;
        }
        const dx = nb.position.x - na.position.x;
        const dy = nb.position.y - na.position.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        const aStatus = getLocationStatus(context, a);
        const bStatus = getLocationStatus(context, b);
        const bothVisited = aStatus === 'visited' && bStatus === 'visited';
        const oneVisited = aStatus === 'visited' || bStatus === 'visited';
        const secret = na.secret || nb.secret;
        const baseColor = bothVisited
          ? secret
            ? '#6a5a97'
            : '#8a744a'
          : oneVisited
            ? '#4a463f'
            : '#332f2a';
        return {
          key: `${a}:${b}`,
          a,
          b,
          left: na.position.x,
          top: na.position.y,
          width: len,
          angle,
          thick: secret ? 4 : 6,
          marginTop: secret ? -2 : -3,
          gradient: `linear-gradient(90deg, ${baseColor}00 0%, ${baseColor} 14%, ${baseColor} 86%, ${baseColor}00 100%)`,
          baseOpacity: bothVisited ? 0.8 : oneVisited ? 0.5 : 0.24,
        };
      })
      .filter(Boolean) as Array<{
      key: string;
      a: string;
      b: string;
      left: number;
      top: number;
      width: number;
      angle: number;
      thick: number;
      marginTop: number;
      gradient: string;
      baseOpacity: number;
    }>;
  }, [byId, context]);

  const visitedCount = Object.values(context.locations).filter((l) => l.visited).length;
  const totalCount = Object.keys(context.locations).length;
  const hasSelection = !!context.selectedLocationId;
  const current = context.locations[context.currentLocationId];

  function onMapMove(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const py = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    setParallax({
      x: Math.max(-1, Math.min(1, px)),
      y: Math.max(-1, Math.min(1, py)),
    });
  }

  return (
    <div
      ref={viewportRef}
      className="relative h-[660px] overflow-hidden rounded-[14px] border border-[rgba(201,162,74,.18)] bg-[radial-gradient(1000px_700px_at_24%_10%,#241a14,#0c0908_68%)]"
      onMouseMove={onMapMove}
      onMouseLeave={() => setParallax({ x: 0, y: 0 })}
    >
      <div
        className="absolute left-0 top-0 will-change-transform"
        style={{
          width: stage.width || '100%',
          height: stage.height || '100%',
          transform: `translate3d(${stage.panX}px, ${stage.panY}px, 0)`,
          transition: 'transform 140ms ease-out',
        }}
      >
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{
            width: MAP_WIDTH,
            height: MAP_HEIGHT,
            transform: `scale(${stage.cover})`,
          }}
        >
          <img
            src="/locations/prison-floorplan.png"
            alt=""
            className="pointer-events-none absolute inset-0 z-0 h-full w-full max-w-none object-cover"
            style={{
              filter: 'grayscale(.55) brightness(.9) contrast(1.08) blur(.8px)',
              opacity: 0.45,
            }}
            draggable={false}
          />

          <div className="pointer-events-none absolute left-6 top-6 h-[120px] w-[120px] animate-[flicker_4s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle,rgba(224,140,60,.22),transparent_70%)]" />
          <div className="pointer-events-none absolute bottom-10 right-[340px] h-[160px] w-[160px] animate-[flicker_5.4s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle,rgba(214,68,58,.14),transparent_70%)]" />

          <div className="pointer-events-none absolute bottom-0 left-[-6%] z-[2] h-[22%] w-[60%] animate-[fogDrift_34s_ease-in-out_infinite] bg-[linear-gradient(0deg,rgba(150,150,160,.16),transparent)] blur-[8px]" />
          <div className="pointer-events-none absolute bottom-[6%] right-[-4%] z-[2] h-[18%] w-[44%] animate-[fogDrift_28s_ease-in-out_infinite_reverse] bg-[linear-gradient(0deg,rgba(120,120,140,.14),transparent)] blur-[7px]" />

          {dustMotes.map((mote, index) => (
            <span
              key={`dust-${index}`}
              className="pointer-events-none absolute z-[2] rounded-full bg-[rgba(224,190,140,.55)] blur-[0.5px]"
              style={{
                left: `${mote.x}%`,
                top: `${mote.y}%`,
                width: mote.size,
                height: mote.size,
                ['--dx' as string]: `${mote.dx}px`,
                animation: `dustFloat ${mote.dur}s ease-in infinite ${mote.delay}s`,
              }}
            />
          ))}

          {edges.map((edge) => {
            const hovered =
              !!hoveredId && (hoveredId === edge.a || hoveredId === edge.b);
            return (
              <div
                key={edge.key}
                className="absolute z-[1] rounded-[3px] transition-[opacity,filter] duration-250"
                style={{
                  left: edge.left,
                  top: edge.top,
                  width: edge.width,
                  height: edge.thick,
                  marginTop: edge.marginTop,
                  transformOrigin: '0 50%',
                  transform: `rotate(${edge.angle}deg)`,
                  background: edge.gradient,
                  opacity: hovered ? 1 : edge.baseOpacity,
                  filter: hovered
                    ? 'brightness(1.6) drop-shadow(0 0 6px rgba(224,181,82,.6))'
                    : 'none',
                  boxShadow:
                    'inset 0 1px 0 rgba(255,255,255,.05), inset 0 -1px 2px rgba(0,0,0,.6)',
                }}
              />
            );
          })}

          {allVisible.map((location) => {
            const status = getLocationStatus(context, location.id);
            const locked =
            isLocationLocked(context, location.id) || isCorridorBlocked(context, location.id);
            const [w, h] = roomSizeFor(location.type);
            const color = locked ? '#5a534a' : markerColor(location, status);
            const isCurrent = location.id === context.currentLocationId;
            const isSelected = location.id === context.selectedLocationId;
            const isReachable = status === 'reachable' && !locked;
            const isDistant = status === 'distant';
            const showInfo = !isDistant && !locked;
            const hasThreat = location.enemies.some((enemy) => !enemy.defeated);

            return (
              <button
                key={location.id}
                type="button"
                onClick={() => onSelect(location.id)}
                onMouseEnter={() => setHoveredId(location.id)}
                onMouseLeave={() =>
                  setHoveredId((currentId) =>
                    currentId === location.id ? null : currentId,
                  )
                }
                className="absolute z-[3] overflow-hidden rounded-xl transition-[filter,transform,box-shadow] duration-[180ms] hover:brightness-[1.22] hover:saturate-105 hover:-translate-y-[3px] hover:scale-[1.045] hover:shadow-[0_0_0_2px_rgba(224,181,82,.65),0_14px_30px_-10px_rgba(0,0,0,.7),0_0_34px_-6px_rgba(224,181,82,.55)]"
                style={{
                  left: location.position.x - w / 2,
                  top: location.position.y - h / 2,
                  width: w,
                  height: h,
                  border: `${location.secret ? '1px dashed' : '1.5px solid'} ${color}${status === 'visited' ? 'aa' : '55'}`,
                  opacity: locked ? 0.45 : isDistant ? 0.55 : 1,
                  filter: locked
                    ? 'grayscale(1) brightness(.4)'
                    : isDistant
                      ? 'grayscale(1) brightness(.55) blur(.5px)'
                      : 'none',
                  boxShadow: isCurrent
                    ? '0 0 0 2px rgba(224,181,82,.6), 0 0 34px -2px rgba(224,181,82,.85)'
                    : isSelected
                      ? `0 0 0 1px ${color}`
                      : status === 'visited' && !locked
                        ? `0 0 26px -6px ${color}99`
                        : 'none',
                  background: '#1a1512',
                }}
              >
                {showInfo && location.image && (
                  <img
                    src={location.image}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                    draggable={false}
                  />
                )}
                {(isDistant || locked) && (
                  <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,rgba(0,0,0,.5)_0_8px,rgba(0,0,0,.3)_8px_16px)]" />
                )}
                <div
                  className="absolute inset-0"
                  style={{
                    background: showInfo
                      ? 'linear-gradient(180deg, rgba(10,8,7,0) 30%, rgba(9,7,6,.92) 100%), linear-gradient(0deg, rgba(0,0,0,.15), rgba(0,0,0,.15))'
                      : 'linear-gradient(160deg, rgba(20,17,15,.9), rgba(10,8,7,.94))',
                  }}
                />
                <div className="relative z-[2] flex h-full flex-col items-center justify-center gap-1 px-1.5">
                  <span
                    className="inline-block"
                    style={{
                      width: location.type === 'boss' || location.type === 'gate' ? 22 : 16,
                      height: location.type === 'boss' || location.type === 'gate' ? 22 : 16,
                      background: color,
                      clipPath: 'polygon(50% 0,100% 50%,50% 100%,0 50%)',
                      boxShadow: `0 0 14px -2px ${color}`,
                    }}
                  />
                  <span className="px-1 text-center font-cinzel text-[13px] tracking-wide text-[#f3ead8] [text-shadow:0_2px_6px_rgba(0,0,0,.9)]">
                    {locked ? 'SEALED' : showInfo ? location.name : '???'}
                  </span>
                  {hasThreat && showInfo && (
                    <span className="text-[9px] tracking-[.14em] text-[#ff8f85] [text-shadow:0_1px_4px_#000]">
                      {location.enemies.find((e) => !e.defeated)?.tier}
                    </span>
                  )}
                </div>
                {hasThreat && showInfo && (
                  <span className="absolute left-1.5 top-1.5 z-[4] flex h-6 w-6 animate-[tpulse_2s_ease-in-out_infinite] items-center justify-center rounded-md border-2 border-[#ff6a5c] bg-[rgba(120,16,14,.92)]">
                    <span className="absolute h-0.5 w-3 rotate-45 bg-[#ffd9d2]" />
                    <span className="absolute h-0.5 w-3 -rotate-45 bg-[#ffd9d2]" />
                  </span>
                )}
                {isReachable && (
                  <div className="pointer-events-none absolute inset-0 z-[5] animate-[reachPulse_2.4s_ease-in-out_infinite] rounded-xl" />
                )}
                {isCurrent && (
                  <>
                    <div className="pointer-events-none absolute inset-0 z-[5] animate-[herepulse_1.8s_ease-in-out_infinite] rounded-xl border-2 border-[#e0b552] shadow-[inset_0_0_0_2px_rgba(224,181,82,.3)]" />
                    <div className="pointer-events-none absolute left-1/2 top-[-19px] z-[6] flex -translate-x-1/2 animate-[herebob_1.6s_ease-in-out_infinite] flex-col items-center gap-[3px]">
                      <span className="h-[9px] w-[9px] animate-[lanternFlicker_1.3s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle,#ffe1a8,#e0b552_60%,transparent_100%)] shadow-[0_0_10px_3px_rgba(224,181,82,.8)]" />
                    </div>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 z-[8] shadow-[inset_0_0_120px_28px_rgba(0,0,0,.55)]" />

      <div
        className="pointer-events-none absolute left-5 top-4 z-[9] flex items-center justify-between transition-[right] duration-200"
        style={{ right: hasSelection ? 390 : 20 }}
      >
        <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-[rgba(201,162,74,.25)] bg-[rgba(10,8,7,.72)] py-2 pl-2 pr-4">
          <div className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-[rgba(201,162,74,.35)] bg-[#1a1512] font-cinzel text-[10px] text-[#e0b552]">
            UP
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-cinzel text-[12px] tracking-wide text-[#e8ddcf]">
              Unnamed Prisoner
            </span>
            <span className="text-[11px] text-[#b7ab9c]">
              Actions {context.actionsRemaining}/{context.maxActions} · Turn {context.turnCount}
            </span>
          </div>
        </div>
        <span className="font-cinzel text-[15px] tracking-[.34em] text-[#b8917f]">
          {context.mapName.toUpperCase().replace(/\s+/g, '\u00a0')}
        </span>
        <span className="text-[10px] tracking-[.18em] text-[#8a7f72]">
          {visitedCount} / {totalCount} EXPLORED
        </span>
      </div>

      <div className="pointer-events-none absolute bottom-5 left-5 z-[9] box-border h-[140px] w-[220px] rounded-[10px] border border-[rgba(201,162,74,.28)] bg-[rgba(10,8,7,.82)] p-2.5">
        <span className="text-[8px] tracking-[.2em] text-[#8a7f72]">
          HOLLOWFORT — FIRST FORTRESS
        </span>
        <div className="relative mt-1.5 h-[98px] w-full rounded-md border border-dashed border-[rgba(201,162,74,.2)]">
          {allVisible.map((location) => {
            const status = getLocationStatus(context, location.id);
            const locked =
            isLocationLocked(context, location.id) || isCorridorBlocked(context, location.id);
            const color = locked ? '#5a534a' : markerColor(location, status);
            return (
              <span
                key={`mini-${location.id}`}
                className="absolute h-[5px] w-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  left: `${(location.position.x / MAP_WIDTH) * 100}%`,
                  top: `${(location.position.y / MAP_HEIGHT) * 100}%`,
                  background: color,
                  opacity: locked || status === 'distant' ? 0.45 : 1,
                }}
              />
            );
          })}
          {current && (
            <span
              className="absolute h-[11px] w-[11px] -translate-x-1/2 -translate-y-1/2 animate-[herepulse_1.8s_ease-in-out_infinite] rounded-full border-2 border-[#e0b552]"
              style={{
                left: `${(current.position.x / MAP_WIDTH) * 100}%`,
                top: `${(current.position.y / MAP_HEIGHT) * 100}%`,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

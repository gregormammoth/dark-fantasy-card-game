import type { ExplorationContext, LocationDefinition, LocationStatus } from '@/types/exploration';
import {
  getLocationStatus,
  isLocationVisible,
  listMapEdges,
} from '@/engine/exploration/map';
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

export function PrisonMap({ context, onSelect }: PrisonMapProps) {
  const locations = Object.values(context.locations).filter((location) =>
    isLocationVisible(context, location.id),
  );
  const byId = Object.fromEntries(locations.map((location) => [location.id, location]));
  const edges = listMapEdges(context)
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
      return {
        key: `${a}:${b}`,
        left: na.position.x,
        top: na.position.y,
        width: len,
        angle,
        color: bothVisited ? (secret ? '#9a7ae0' : '#c9a24a') : oneVisited ? '#5a5147' : '#3a3630',
        opacity: bothVisited ? 0.85 : oneVisited ? 0.55 : 0.22,
      };
    })
    .filter(Boolean) as Array<{
    key: string;
    left: number;
    top: number;
    width: number;
    angle: number;
    color: string;
    opacity: number;
  }>;

  const visitedCount = Object.values(context.locations).filter((l) => l.visited).length;
  const totalCount = Object.keys(context.locations).length;

  return (
    <div className="relative h-[560px] overflow-hidden rounded-[14px] border border-[rgba(201,162,74,.18)] bg-[radial-gradient(1000px_700px_at_24%_10%,#241a14,#0c0908_68%)]">
      <div className="pointer-events-none absolute inset-0 z-[8] shadow-[inset_0_0_160px_36px_rgba(0,0,0,.75)]" />
      <div className="pointer-events-none absolute left-6 top-6 h-[120px] w-[120px] animate-[flicker_4s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle,rgba(224,140,60,.22),transparent_70%)]" />

      <div className="absolute left-5 right-5 top-4 z-[9] flex items-center justify-between">
        <div className="flex items-center gap-3 rounded-full border border-[rgba(201,162,74,.25)] bg-[rgba(10,8,7,.72)] py-2 pl-2 pr-4">
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
          {context.mapName.toUpperCase()}
        </span>
        <span className="text-[10px] tracking-[.18em] text-[#8a7f72]">
          {visitedCount} / {totalCount} EXPLORED
        </span>
      </div>

      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ width: 1500, height: 900, transform: 'scale(0.62)' }}
      >
        {edges.map((edge) => (
          <div
            key={edge.key}
            className="absolute z-[1] h-[2px]"
            style={{
              left: edge.left,
              top: edge.top,
              width: edge.width,
              transformOrigin: '0 50%',
              transform: `rotate(${edge.angle}deg)`,
              background: edge.color,
              opacity: edge.opacity,
            }}
          />
        ))}

        {locations.map((location) => {
          const status = getLocationStatus(context, location.id);
          const [w, h] = roomSizeFor(location.type);
          const color = markerColor(location, status);
          const isCurrent = location.id === context.currentLocationId;
          const isSelected = location.id === context.selectedLocationId;
          const showInfo = status !== 'distant';
          const hasThreat = location.enemies.some((enemy) => !enemy.defeated);

          return (
            <button
              key={location.id}
              type="button"
              onClick={() => onSelect(location.id)}
              className="absolute z-[3] overflow-hidden rounded-xl transition-[filter,transform] duration-150 hover:brightness-110 hover:-translate-y-0.5"
              style={{
                left: location.position.x - w / 2,
                top: location.position.y - h / 2,
                width: w,
                height: h,
                border: `${location.secret ? '1px dashed' : '1.5px solid'} ${color}${status === 'visited' ? 'aa' : '55'}`,
                opacity: status === 'distant' ? 0.4 : 1,
                boxShadow: isCurrent
                  ? '0 0 0 2px rgba(224,181,82,.5), 0 0 30px -4px rgba(224,181,82,.7)'
                  : isSelected
                    ? `0 0 0 1px ${color}`
                    : status === 'visited'
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
              <div
                className="absolute inset-0"
                style={{
                  background: showInfo
                    ? 'linear-gradient(180deg, rgba(10,8,7,.08) 20%, rgba(9,7,6,.88) 100%)'
                    : 'linear-gradient(160deg, rgba(20,17,15,.9), rgba(10,8,7,.94))',
                }}
              />
              <div className="relative z-[2] flex h-full flex-col items-center justify-end gap-1 px-1.5 pb-2.5">
                {!showInfo || !location.image ? (
                  <span
                    className="inline-block"
                    style={{
                      width: location.type === 'boss' ? 22 : 16,
                      height: location.type === 'boss' ? 22 : 16,
                      background: color,
                      clipPath: 'polygon(50% 0,100% 50%,50% 100%,0 50%)',
                      boxShadow: `0 0 14px -2px ${color}`,
                    }}
                  />
                ) : null}
                <span className="px-1 text-center font-cinzel text-[13px] tracking-wide text-[#f3ead8] [text-shadow:0_2px_6px_rgba(0,0,0,.9)]">
                  {showInfo ? location.name : '???'}
                </span>
                {hasThreat && showInfo && (
                  <span className="text-[9px] tracking-[.14em] text-[#ff8f85]">
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
              {isCurrent && (
                <>
                  <div className="pointer-events-none absolute inset-0 z-[5] animate-[herepulse_1.8s_ease-in-out_infinite] rounded-xl border-2 border-[#e0b552] shadow-[inset_0_0_0_2px_rgba(224,181,82,.3)]" />
                  <div className="pointer-events-none absolute left-1/2 top-[-15px] z-[6] flex -translate-x-1/2 animate-[herebob_1.6s_ease-in-out_infinite] flex-col items-center gap-0.5">
                    <span className="whitespace-nowrap rounded-md bg-[#e0b552] px-1.5 py-0.5 font-cinzel text-[9px] tracking-[.16em] text-[#1a1208] shadow-[0_4px_10px_-2px_rgba(0,0,0,.6)]">
                      YOU ARE HERE
                    </span>
                    <span className="h-0 w-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-[#e0b552]" />
                  </div>
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

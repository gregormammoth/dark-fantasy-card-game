import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type { ExplorationContext, LocationDefinition, LocationStatus } from '@dark-fantasy/shared/types/exploration';
import type { PlayerGender } from '@dark-fantasy/shared/types/player';
import {
  getLocationStatus,
  isLocationVisible,
  listMapEdges,
  isLocationLocked,
  isCorridorBlocked,
} from '@dark-fantasy/game-engine/engine/exploration/map';
import { isEnemyAvailable } from '@dark-fantasy/game-engine/engine/exploration/locationEncounters';
import { isNpcAvailable } from '@dark-fantasy/game-engine/engine/exploration/quests';
import { getPlayerPortraitForDeck } from '@dark-fantasy/game-engine';
import { locationTypeColors, roomSizeFor } from '@/lib/explorationTheme';

function getOccupantCard(
  context: ExplorationContext,
  location: LocationDefinition,
): { image: string; border: string } | null {
  const enemy = location.enemies.find(
    (item) => !item.defeated && isEnemyAvailable(context, item) && item.image,
  );
  if (enemy?.image) {
    return { image: enemy.image, border: '#ff6a5c' };
  }
  const npc = location.npcs.find((item) => isNpcAvailable(context, item) && item.image);
  if (npc?.image) {
    return { image: npc.image, border: '#8fb0e0' };
  }
  return null;
}

interface PrisonMapProps {
  context: ExplorationContext;
  playerGender: PlayerGender;
  onSelect: (locationId: string) => void;
}

function markerColor(location: LocationDefinition, status: LocationStatus): string {
  if (status === 'distant') {
    return '#4a4640';
  }
  return locationTypeColors[location.type];
}

const MAP_WIDTH = 2240;
const MAP_HEIGHT = 900;
const ZOOM_DEFAULT = 1.55;
const ZOOM_MIN = 1;
const ZOOM_MAX = 2.45;
const ZOOM_STEP = 0.2;
const PANEL_WIDTH = 370;
const DRAG_THRESHOLD = 14;
const CAMERA_EASE_MS = 360;

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

const dustMotes = Array.from({ length: 10 }, (_, i) => ({
  x: (i * 97) % 100,
  y: 40 + ((i * 53) % 55),
  size: 2 + (i % 3),
  dx: (i % 2 ? 1 : -1) * (8 + i * 2),
  dur: 6 + (i % 5) * 1.6,
  delay: (i * 0.5) % 5,
}));

function clamp(value: number, min: number, max: number): number {
  if (max < min) {
    return (min + max) / 2;
  }
  return Math.max(min, Math.min(max, value));
}

export function PrisonMap({ context, playerGender, onSelect }: PrisonMapProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(ZOOM_DEFAULT);
  const [dragging, setDragging] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    moved: boolean;
  } | null>(null);
  const panLimitsRef = useRef({ minX: 0, maxX: 0, minY: 0, maxY: 0 });
  const centerOnPlayerRef = useRef<(animate: boolean) => void>(() => undefined);
  const didInitialCenterRef = useRef(false);
  const cameraAnimFrameRef = useRef<number | null>(null);
  const cameraLiveRef = useRef({ zoomLevel: ZOOM_DEFAULT, pan: { x: 0, y: 0 } });
  const zoomTargetRef = useRef(ZOOM_DEFAULT);

  function cancelCameraAnimation() {
    if (cameraAnimFrameRef.current !== null) {
      cancelAnimationFrame(cameraAnimFrameRef.current);
      cameraAnimFrameRef.current = null;
    }
  }

  function setCameraImmediate(nextZoom: number, nextPan: { x: number; y: number }) {
    cancelCameraAnimation();
    zoomTargetRef.current = nextZoom;
    cameraLiveRef.current = { zoomLevel: nextZoom, pan: nextPan };
    setZoomLevel(nextZoom);
    setPan(nextPan);
  }

  function animateCameraTo(nextZoom: number, nextPan: { x: number; y: number }) {
    cancelCameraAnimation();
    zoomTargetRef.current = nextZoom;
    const from = {
      zoomLevel: cameraLiveRef.current.zoomLevel,
      pan: { ...cameraLiveRef.current.pan },
    };
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / CAMERA_EASE_MS);
      const e = easeOutCubic(t);
      const zoom = from.zoomLevel + (nextZoom - from.zoomLevel) * e;
      const next = {
        x: from.pan.x + (nextPan.x - from.pan.x) * e,
        y: from.pan.y + (nextPan.y - from.pan.y) * e,
      };
      cameraLiveRef.current = { zoomLevel: zoom, pan: next };
      setZoomLevel(zoom);
      setPan(next);
      if (t < 1) {
        cameraAnimFrameRef.current = requestAnimationFrame(tick);
        return;
      }
      cameraAnimFrameRef.current = null;
      cameraLiveRef.current = { zoomLevel: nextZoom, pan: nextPan };
      setZoomLevel(nextZoom);
      setPan(nextPan);
    };

    cameraAnimFrameRef.current = requestAnimationFrame(tick);
  }

  const hasSelection = !!context.selectedLocationId;
  const current = context.locations[context.currentLocationId];

  const layout = useMemo(() => {
    if (viewport.w <= 0 || viewport.h <= 0) {
      return { width: 0, height: 0, zoom: 1, fit: 1, minX: 0, maxX: 0, minY: 0, maxY: 0 };
    }
    const fit = Math.max(viewport.w / MAP_WIDTH, viewport.h / MAP_HEIGHT);
    const zoom = fit * zoomLevel;
    const width = MAP_WIDTH * zoom;
    const height = MAP_HEIGHT * zoom;
    return {
      width,
      height,
      zoom,
      fit,
      minX: viewport.w - width,
      maxX: 0,
      minY: viewport.h - height,
      maxY: 0,
    };
  }, [viewport.w, viewport.h, zoomLevel]);

  panLimitsRef.current = {
    minX: layout.minX,
    maxX: layout.maxX,
    minY: layout.minY,
    maxY: layout.maxY,
  };

  const centerOnPlayer = useCallback(
    (animate: boolean) => {
      if (viewport.w <= 0 || viewport.h <= 0 || layout.fit <= 0) {
        return;
      }
      const liveZoomLevel = cameraLiveRef.current.zoomLevel;
      const zoom = layout.fit * liveZoomLevel;
      const width = MAP_WIDTH * zoom;
      const height = MAP_HEIGHT * zoom;
      const minX = viewport.w - width;
      const minY = viewport.h - height;
      const panelInset = hasSelection ? PANEL_WIDTH : 0;
      const centerX = (viewport.w - panelInset) / 2;
      const centerY = viewport.h / 2;
      const focusX = current?.position.x ?? MAP_WIDTH / 2;
      const focusY = current?.position.y ?? MAP_HEIGHT / 2;
      const next = {
        x: clamp(centerX - focusX * zoom, minX, 0),
        y: clamp(centerY - focusY * zoom, minY, 0),
      };
      if (animate) {
        animateCameraTo(liveZoomLevel, next);
      } else {
        setCameraImmediate(liveZoomLevel, next);
      }
    },
    [
      viewport.w,
      viewport.h,
      layout.fit,
      hasSelection,
      current?.position.x,
      current?.position.y,
    ],
  );

  centerOnPlayerRef.current = centerOnPlayer;

  function applyZoom(delta: number) {
    const level = clamp(zoomTargetRef.current + delta, ZOOM_MIN, ZOOM_MAX);
    if (Math.abs(level - zoomTargetRef.current) < 0.001) {
      return;
    }
    if (viewport.w <= 0 || viewport.h <= 0 || layout.fit <= 0) {
      setCameraImmediate(level, cameraLiveRef.current.pan);
      return;
    }
    const live = cameraLiveRef.current;
    const panelInset = hasSelection ? PANEL_WIDTH : 0;
    const centerX = (viewport.w - panelInset) / 2;
    const centerY = viewport.h / 2;
    const liveZoom = layout.fit * live.zoomLevel;
    const worldX = (centerX - live.pan.x) / liveZoom;
    const worldY = (centerY - live.pan.y) / liveZoom;
    const nextZoom = layout.fit * level;
    const nextWidth = MAP_WIDTH * nextZoom;
    const nextHeight = MAP_HEIGHT * nextZoom;
    const minX = viewport.w - nextWidth;
    const minY = viewport.h - nextHeight;
    animateCameraTo(level, {
      x: clamp(centerX - worldX * nextZoom, minX, 0),
      y: clamp(centerY - worldY * nextZoom, minY, 0),
    });
  }

  useEffect(() => {
    return () => cancelCameraAnimation();
  }, []);

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

  useEffect(() => {
    centerOnPlayerRef.current(true);
  }, [context.currentLocationId]);

  useEffect(() => {
    if (viewport.w > 0 && viewport.h > 0 && !didInitialCenterRef.current) {
      didInitialCenterRef.current = true;
      centerOnPlayerRef.current(false);
    }
  }, [viewport.w, viewport.h]);

  useEffect(() => {
    if (cameraAnimFrameRef.current !== null) {
      return;
    }
    setPan((currentPan) => {
      const next = {
        x: clamp(currentPan.x, layout.minX, layout.maxX),
        y: clamp(currentPan.y, layout.minY, layout.maxY),
      };
      cameraLiveRef.current = { ...cameraLiveRef.current, pan: next };
      return next;
    });
  }, [layout.minX, layout.maxX, layout.minY, layout.maxY, hasSelection]);

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

  const playerPortrait = useMemo(
    () =>
      getPlayerPortraitForDeck(
        [...context.deck, ...context.hand, ...context.discard].map(
          (card) => card.definition.id,
        ),
        playerGender,
      ),
    [context.deck, context.hand, context.discard, playerGender],
  );

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) {
      return;
    }
    cancelCameraAnimation();
    const live = cameraLiveRef.current;
    zoomTargetRef.current = live.zoomLevel;
    setZoomLevel(live.zoomLevel);
    setPan(live.pan);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      origX: live.pan.x,
      origY: live.pan.y,
      moved: false,
    };
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!drag.moved && (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD)) {
      drag.moved = true;
      setDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    if (!drag.moved) {
      return;
    }
    const limits = panLimitsRef.current;
    const next = {
      x: clamp(drag.origX + dx, limits.minX, limits.maxX),
      y: clamp(drag.origY + dy, limits.minY, limits.maxY),
    };
    cameraLiveRef.current = { ...cameraLiveRef.current, pan: next };
    setPan(next);
  }

  function endDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }
    dragRef.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function selectLocation(locationId: string) {
    onSelect(locationId);
  }

  return (
    <div
      ref={viewportRef}
      className={`relative h-[660px] overflow-hidden rounded-[14px] border border-[rgba(201,162,74,.18)] bg-[radial-gradient(1000px_700px_at_24%_10%,#241a14,#0c0908_68%)] ${
        dragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <div
        className="absolute left-0 top-0 origin-top-left will-change-transform"
        style={{
          width: MAP_WIDTH,
          height: MAP_HEIGHT,
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${layout.zoom})`,
        }}
      >
        <div
          className="absolute left-0 top-0"
          style={{
            width: MAP_WIDTH,
            height: MAP_HEIGHT,
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
            const liveEnemy = location.enemies.find(
              (enemy) => !enemy.defeated && isEnemyAvailable(context, enemy),
            );
            const hasThreat = !!liveEnemy;
            const occupant = showInfo ? getOccupantCard(context, location) : null;
            const showQuestBadge = showInfo && !!location.quest;

            return (
              <button
                key={location.id}
                type="button"
                data-map-room="true"
                onClick={() => selectLocation(location.id)}
                onPointerDown={(event) => event.stopPropagation()}
                onMouseEnter={() => setHoveredId(location.id)}
                onMouseLeave={() =>
                  setHoveredId((currentId) =>
                    currentId === location.id ? null : currentId,
                  )
                }
                className="absolute z-[3] cursor-pointer overflow-visible rounded-md transition-[filter,transform,box-shadow] duration-[180ms] hover:brightness-[1.22] hover:saturate-105 hover:-translate-y-[3px] hover:scale-[1.045] hover:shadow-[0_0_0_2px_rgba(224,181,82,.65),0_14px_30px_-10px_rgba(0,0,0,.7),0_0_34px_-6px_rgba(224,181,82,.55)]"
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
                <div className="absolute inset-0 z-[1] overflow-hidden rounded-md">
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
                        {liveEnemy?.tier}
                      </span>
                    )}
                  </div>
                  {isReachable && (
                    <div className="pointer-events-none absolute inset-0 z-[5] animate-[reachPulse_2.4s_ease-in-out_infinite] rounded-md" />
                  )}
                  {isCurrent && (
                    <div className="pointer-events-none absolute inset-0 z-[5] animate-[herepulse_1.8s_ease-in-out_infinite] rounded-md border-2 border-[#e0b552] shadow-[inset_0_0_0_2px_rgba(224,181,82,.3)]" />
                  )}
                </div>
                {showQuestBadge && (
                  <span className="absolute left-1.5 top-1.5 z-[4] h-[13px] w-[13px] animate-[qpulse_2s_ease-in-out_infinite] rounded-full border-2 border-[#12100f] bg-[#e0b552]" />
                )}
                {occupant && (
                  <span
                    className="pointer-events-none absolute -right-[9px] -top-[11px] z-[6] h-[56px] w-[44px] rotate-[7deg] overflow-hidden rounded-md border-2 bg-[#0c0908] shadow-[0_8px_18px_-6px_rgba(0,0,0,.85),0_0_0_1px_rgba(0,0,0,.4)]"
                    style={{ borderColor: occupant.border }}
                  >
                    <img
                      src={occupant.image}
                      alt=""
                      className="h-full w-full object-cover object-top"
                      draggable={false}
                    />
                  </span>
                )}
                {isCurrent && showInfo && (
                  <span className="pointer-events-none absolute -bottom-4 -left-3 z-[7] h-[76px] w-[60px] -rotate-[8deg] overflow-hidden rounded-md border-2 border-[#e0b552] bg-[#0c0908] shadow-[0_16px_28px_-8px_rgba(0,0,0,.9),0_0_0_1px_rgba(0,0,0,.5),0_0_22px_-3px_rgba(224,181,82,.65)]">
                    <img
                      src={playerPortrait}
                      alt=""
                      className="h-full w-full object-cover object-top"
                      draggable={false}
                    />
                  </span>
                )}
                {isCurrent && (
                  <div className="pointer-events-none absolute left-1/2 top-[-19px] z-[6] flex -translate-x-1/2 animate-[herebob_1.6s_ease-in-out_infinite] flex-col items-center gap-[3px]">
                    <span className="h-[9px] w-[9px] animate-[lanternFlicker_1.3s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle,#ffe1a8,#e0b552_60%,transparent_100%)] shadow-[0_0_10px_3px_rgba(224,181,82,.8)]" />
                  </div>
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
          <img
            src={playerPortrait}
            alt=""
            className="h-[38px] w-[38px] rounded-full border border-[rgba(201,162,74,.35)] object-cover object-top"
            draggable={false}
          />
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

      <div className="pointer-events-none absolute bottom-5 left-5 z-[9] box-border h-[140px] w-[220px] rounded-[5px] border border-[rgba(201,162,74,.28)] bg-[rgba(10,8,7,.82)] p-2.5">
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

      <div
        className="pointer-events-none absolute bottom-5 z-[9] flex flex-col gap-1.5 transition-[right] duration-200"
        style={{ right: hasSelection ? 390 : 20 }}
      >
        <div className="pointer-events-auto flex flex-col overflow-hidden rounded-[5px] border border-[rgba(201,162,74,.28)] bg-[rgba(10,8,7,.88)] shadow-[0_12px_28px_-12px_#000]">
          <button
            type="button"
            aria-label="Zoom in"
            disabled={zoomLevel >= ZOOM_MAX - 0.001}
            onClick={() => applyZoom(ZOOM_STEP)}
            onPointerDown={(event) => event.stopPropagation()}
            className="flex h-9 w-9 items-center justify-center border-b border-[rgba(201,162,74,.16)] font-cinzel text-[18px] text-[#e0b552] transition hover:bg-[rgba(224,181,82,.12)] disabled:cursor-not-allowed disabled:opacity-35"
          >
            +
          </button>
          <button
            type="button"
            aria-label="Zoom out"
            disabled={zoomLevel <= ZOOM_MIN + 0.001}
            onClick={() => applyZoom(-ZOOM_STEP)}
            onPointerDown={(event) => event.stopPropagation()}
            className="flex h-9 w-9 items-center justify-center font-cinzel text-[18px] text-[#e0b552] transition hover:bg-[rgba(224,181,82,.12)] disabled:cursor-not-allowed disabled:opacity-35"
          >
            −
          </button>
        </div>
        <button
          type="button"
          aria-label="Center on player"
          title="Center on player"
          onClick={() => centerOnPlayer(true)}
          onPointerDown={(event) => event.stopPropagation()}
          className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-[5px] border border-[rgba(201,162,74,.28)] bg-[rgba(10,8,7,.88)] text-[#e0b552] shadow-[0_12px_28px_-12px_#000] transition hover:bg-[rgba(224,181,82,.12)]"
        >
          <span className="h-2.5 w-2.5 rounded-full border-2 border-[#e0b552] bg-[radial-gradient(circle,#ffe1a8,#e0b552_70%,transparent_100%)] shadow-[0_0_8px_2px_rgba(224,181,82,.55)]" />
        </button>
      </div>
    </div>
  );
}

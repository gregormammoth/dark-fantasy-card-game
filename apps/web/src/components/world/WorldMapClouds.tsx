import { worldCloudLayers } from '@/data/worldClouds';

interface WorldMapCloudsProps {
  parallax: { x: number; y: number };
}

const driftAnim: Record<'A' | 'B' | 'C', string> = {
  A: 'cloudDriftA',
  B: 'cloudDriftB',
  C: 'cloudDriftA',
};

export function WorldMapClouds({ parallax }: WorldMapCloudsProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-[6] overflow-hidden">
      {worldCloudLayers.map((cloud, index) => {
        const px = parallax.x * 14 * cloud.depth;
        const py = parallax.y * 7 * cloud.depth;
        const reverse = cloud.drift === 'C';
        return (
          <div
            key={`${cloud.src}-${index}`}
            className="absolute will-change-transform"
            style={{
              left: cloud.left,
              top: cloud.top,
              width: cloud.width,
              opacity: cloud.opacity,
              transform: `translate3d(${px}px, ${py}px, 0)`,
            }}
          >
            <div
              className="will-change-transform"
              style={{
                animation: `${driftAnim[cloud.drift]} ${cloud.duration}s linear infinite ${
                  reverse ? 'alternate-reverse' : 'alternate'
                } ${cloud.delay}s`,
              }}
            >
              <img
                src={cloud.src}
                alt=""
                className="block h-auto w-full select-none"
                draggable={false}
                style={{
                  transform: cloud.flip ? 'scaleX(-1)' : undefined,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export interface WorldCloudLayer {
  src: string;
  left: string;
  top: string;
  width: string;
  opacity: number;
  depth: number;
  drift: 'A' | 'B' | 'C';
  duration: number;
  delay: number;
  flip?: boolean;
}

export const worldCloudLayers: WorldCloudLayer[] = [
  {
    src: '/world/clouds/cloud-1.png',
    left: '-8%',
    top: '-2%',
    width: '32%',
    opacity: 0.78,
    depth: 0.45,
    drift: 'A',
    duration: 90,
    delay: -18,
  },
  {
    src: '/world/clouds/cloud-3.png',
    left: '-4%',
    top: '4%',
    width: '24%',
    opacity: 0.72,
    depth: 0.55,
    drift: 'B',
    duration: 95,
    delay: -55,
  },
  {
    src: '/world/clouds/cloud-8.png',
    left: '10%',
    top: '-4%',
    width: '18%',
    opacity: 0.7,
    depth: 0.7,
    drift: 'C',
    duration: 78,
    delay: -48,
    flip: true,
  },
  {
    src: '/world/clouds/cloud-2.png',
    left: '2%',
    top: '8%',
    width: '20%',
    opacity: 0.75,
    depth: 0.35,
    drift: 'B',
    duration: 100,
    delay: -40,
  },
  {
    src: '/world/clouds/cloud-6.png',
    left: '33%',
    top: '-2%',
    width: '16%',
    opacity: 0.68,
    depth: 0.4,
    drift: 'A',
    duration: 85,
    delay: -12,
  },
  {
    src: '/world/clouds/cloud-7.png',
    left: '57%',
    top: '-3%',
    width: '18%',
    opacity: 0.7,
    depth: 0.38,
    drift: 'C',
    duration: 92,
    delay: -8,
  },
  {
    src: '/world/clouds/cloud-9.png',
    left: '88%',
    top: '-1%',
    width: '16%',
    opacity: 0.72,
    depth: 0.42,
    drift: 'B',
    duration: 88,
    delay: -30,
  },
  {
    src: '/world/clouds/cloud-4.png',
    left: '90%',
    top: '1%',
    width: '22%',
    opacity: 0.76,
    depth: 0.6,
    drift: 'A',
    duration: 84,
    delay: -35,
  },
  {
    src: '/world/clouds/cloud-5.png',
    left: '86%',
    top: '9%',
    width: '20%',
    opacity: 0.74,
    depth: 0.65,
    drift: 'B',
    duration: 80,
    delay: -22,
  },
];

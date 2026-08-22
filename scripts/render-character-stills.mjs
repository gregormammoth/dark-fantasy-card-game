import { createServer } from 'node:http';
import { readFile, mkdir, copyFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '../tests/e2e/node_modules/@playwright/test/index.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const charactersDir = path.join(root, 'apps/web/public/characters');
const stillsDir = path.join(charactersDir, 'stills');
const threeRoot = path.join(root, 'apps/web/node_modules/three');

const html = `<!DOCTYPE html>
<html>
<body style="margin:0;background:transparent">
<canvas id="c" width="512" height="640"></canvas>
<script type="importmap">
{"imports":{"three":"/three/build/three.module.js","three/addons/":"/three/examples/jsm/"}}
</script>
<script type="module">
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
renderer.setSize(512, 640, false);
renderer.setPixelRatio(1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.82;
renderer.setClearColor(0x000000, 0);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(26, 512 / 640, 0.1, 80);

const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);

window.renderModel = async (url) => {
  while (scene.children.length) {
    scene.remove(scene.children[0]);
  }
  const gltf = await loader.loadAsync(url);
  const model = gltf.scene;
  model.traverse((node) => {
    if (node.isMesh) {
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });
  scene.add(model);
  model.updateWorldMatrix(true, true);
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const vFov = (camera.fov * Math.PI) / 180;
  const distH = size.y / 2 / Math.tan(vFov / 2);
  const distW = size.x / 2 / (Math.tan(vFov / 2) * camera.aspect);
  const distance = Math.max(distH, distW) * 1.08;
  camera.position.set(center.x, center.y, center.z + distance);
  camera.lookAt(center);
  camera.near = Math.max(0.05, distance / 80);
  camera.far = Math.max(40, distance * 40);
  camera.updateProjectionMatrix();

  const aim = new THREE.Vector3(center.x, center.y + size.y * 0.12, center.z);
  const key = new THREE.SpotLight('#f4f6fa', 48, 9, 0.38, 0.42, 2);
  key.position.set(aim.x + 0.28, aim.y + 2.15, aim.z + 1.55);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.bias = -0.00018;
  key.shadow.normalBias = 0.035;
  key.target.position.copy(aim);
  scene.add(key);
  scene.add(key.target);
  const bounce = new THREE.SpotLight('#d8dee8', 4.2, 6, 0.72, 0.95, 2);
  bounce.position.set(aim.x - 1.15, aim.y + 0.35, aim.z + 0.85);
  bounce.target.position.set(aim.x, aim.y - 0.22, aim.z);
  scene.add(bounce);
  scene.add(bounce.target);
  scene.add(new THREE.HemisphereLight('#8b97a8', '#121018', 0.22));

  for (let i = 0; i < 6; i += 1) {
    renderer.render(scene, camera);
  }
  return canvas.toDataURL('image/webp', 0.86);
};
</script>
</body>
</html>
`;

function mime(filePath) {
  if (filePath.endsWith('.js')) {
    return 'text/javascript';
  }
  if (filePath.endsWith('.wasm')) {
    return 'application/wasm';
  }
  if (filePath.endsWith('.glb')) {
    return 'model/gltf-binary';
  }
  return 'application/octet-stream';
}

async function startServer() {
  const server = createServer(async (req, res) => {
    try {
      if (req.url === '/' || req.url === '/index.html') {
        res.writeHead(200, { 'content-type': 'text/html' });
        res.end(html);
        return;
      }
      if (req.url.startsWith('/three/')) {
        const filePath = path.join(threeRoot, req.url.slice('/three/'.length));
        const data = await readFile(filePath);
        res.writeHead(200, { 'content-type': mime(filePath) });
        res.end(data);
        return;
      }
      if (req.url.startsWith('/models/')) {
        const filePath = path.join(charactersDir, decodeURIComponent(req.url.slice('/models/'.length)));
        const data = await readFile(filePath);
        res.writeHead(200, { 'content-type': mime(filePath) });
        res.end(data);
        return;
      }
      res.writeHead(404);
      res.end();
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  return { server, origin: `http://127.0.0.1:${port}` };
}

function stillName(file) {
  if (
    file === 'player_fighter.glb' ||
    file === 'player_rogue.glb' ||
    file === 'player_wizard.glb' ||
    file === 'player_survivor.glb'
  ) {
    return 'player.webp';
  }
  if (file.startsWith('player_woman_')) {
    return 'player_woman.webp';
  }
  return file.replace(/\.glb$/i, '.webp');
}

async function main() {
  await mkdir(stillsDir, { recursive: true });
  const glbs = (await readdir(charactersDir)).filter((name) => name.endsWith('.glb')).sort();
  const { server, origin } = await startServer();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 512, height: 640 } });
  await page.goto(origin, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => typeof window.renderModel === 'function');

  const rendered = new Set();
  for (const file of glbs) {
    const outName = stillName(file);
    const outPath = path.join(stillsDir, outName);
    if (rendered.has(outName)) {
      continue;
    }
    const srcStat = await stat(path.join(charactersDir, file));
    if (srcStat.size < 1000) {
      continue;
    }
    process.stdout.write(`rendering ${file} -> stills/${outName}\n`);
    const dataUrl = await page.evaluate(async (url) => window.renderModel(url), `/models/${file}`);
    if (typeof dataUrl !== 'string' || !dataUrl.includes(',')) {
      throw new Error(`Failed to render ${file}`);
    }
    const base64 = dataUrl.split(',')[1];
    await writeFile(outPath, Buffer.from(base64, 'base64'));
    rendered.add(outName);
  }

  const aliases = [
    ['player_fighter.webp', 'player.webp'],
    ['player_rogue.webp', 'player.webp'],
    ['player_wizard.webp', 'player.webp'],
    ['player_survivor.webp', 'player.webp'],
    ['player_woman_fighter.webp', 'player_woman.webp'],
    ['player_woman_rogue.webp', 'player_woman.webp'],
    ['player_woman_wizard.webp', 'player_woman.webp'],
    ['player_woman_survivor.webp', 'player_woman.webp'],
  ];
  for (const [alias, source] of aliases) {
    await copyFile(path.join(stillsDir, source), path.join(stillsDir, alias));
  }

  await browser.close();
  server.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

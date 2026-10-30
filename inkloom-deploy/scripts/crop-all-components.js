const fs = require('fs');
const path = require('path');
const { decodePngRgba, cropRgba, encodePng } = require('./png-utils');

const outDir = path.join(__dirname, '../public/assets/components');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const img = decodePngRgba(path.join(__dirname, '../public/assets/reference/media_1793109237641_23eee29b.png'));

const components = [
  { id: 'document', name: 'Document Stack', x: 20, y: 76, w: 48, h: 62 },
  { id: 'text-extraction', name: 'Text Extraction', x: 79, y: 64, w: 44, h: 44 },
  { id: 'text-chunks', name: 'Text Chunks', x: 132, y: 64, w: 45, h: 44 },
  { id: 'text-store', name: 'Text Store', x: 198, y: 64, w: 46, h: 46 },
  { id: 'pages-to-images', name: 'Pages to Images', x: 77, y: 110, w: 47, h: 44 },
  { id: 'image-encoding', name: 'Image Encoding', x: 127, y: 110, w: 43, h: 44 },
  { id: 'image-summary', name: 'Image + Summary (LLM)', x: 173, y: 110, w: 55, h: 44 },
  { id: 'image-store', name: 'Image Store', x: 232, y: 110, w: 46, h: 46 },
  { id: 'retriever-p1', name: 'Retriever (Phase 1)', x: 284, y: 84, w: 48, h: 56 },
  
  // Phase 2 components
  { id: 'user-query', name: 'User Query', x: 20, y: 190, w: 48, h: 48 },
  { id: 'retriever-p2', name: 'Retriever (Phase 2)', x: 84, y: 190, w: 44, h: 48 },
  { id: 'topk-text-chunks', name: 'Top-K Text Chunks', x: 138, y: 176, w: 80, h: 36 },
  { id: 'topk-image-chunks', name: 'Top-K Image Chunks', x: 140, y: 215, w: 80, h: 35 },
  { id: 'agent-summary', name: 'Agent (Generate Summary)', x: 110, y: 252, w: 56, h: 36 },
  { id: 'image-summaries', name: 'Image Summaries', x: 170, y: 252, w: 72, h: 36 },
  { id: 'combined-context', name: 'Combined Context', x: 238, y: 198, w: 74, h: 46 },
  { id: 'mu-llm', name: 'Mu-LLM Model', x: 322, y: 198, w: 45, h: 46 },
  { id: 'final-response', name: 'Final Response', x: 374, y: 200, w: 52, h: 46 },

  // Banners & badges
  { id: 'phase1-banner', name: 'Phase 1 Banner', x: 110, y: 44, w: 200, h: 22 },
  { id: 'phase2-banner', name: 'Phase 2 Banner', x: 120, y: 154, w: 205, h: 22 }
];

const meta = [];

components.forEach(comp => {
  const cropped = cropRgba(img, comp.x, comp.y, comp.w, comp.h);
  const pngBuf = encodePng(comp.w, comp.h, cropped);
  const filename = `${comp.id}.png`;
  fs.writeFileSync(path.join(outDir, filename), pngBuf);
  meta.push({
    ...comp,
    file: `/assets/components/${filename}`,
    size: pngBuf.length
  });
  console.log(`Cropped: ${comp.id} (${comp.w}x${comp.h}) -> ${filename}`);
});

fs.writeFileSync(path.join(outDir, 'components-manifest.json'), JSON.stringify(meta, null, 2));
console.log('Manifest written to components-manifest.json');

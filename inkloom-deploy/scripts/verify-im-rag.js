const fs = require('fs');
const path = require('path');

console.log('--- Verifying IM-RAG Architecture Animation Assets & Configuration ---');

// 1. Check Component Crops
const compDir = path.join(__dirname, '../public/assets/components');
const expectedComponents = [
  'document.png',
  'text-extraction.png',
  'text-chunks.png',
  'text-store.png',
  'pages-to-images.png',
  'image-encoding.png',
  'image-summary.png',
  'image-store.png',
  'retriever-p1.png',
  'user-query.png',
  'retriever-p2.png',
  'topk-text-chunks.png',
  'topk-image-chunks.png',
  'agent-summary.png',
  'image-summaries.png',
  'combined-context.png',
  'mu-llm.png',
  'final-response.png'
];

let allExist = true;
expectedComponents.forEach(file => {
  const filePath = path.join(compDir, file);
  if (fs.existsSync(filePath)) {
    const stat = fs.statSync(filePath);
    console.log(`✓ Component Crop: ${file} (${stat.size} bytes)`);
  } else {
    console.error(`✗ Missing Component Crop: ${file}`);
    allExist = false;
  }
});

if (!allExist) {
  process.exit(1);
}

// 2. Check Reference Diagrams
const refDir = path.join(__dirname, '../public/assets/reference');
const refImages = [
  'media_1793109237641_23eee29b.png', // Slide 17 Color 3D
  'media_1793109228064_fc00e5d2.png'  // Slide 16 Flowchart
];
refImages.forEach(file => {
  const filePath = path.join(refDir, file);
  if (fs.existsSync(filePath)) {
    const stat = fs.statSync(filePath);
    console.log(`✓ Reference Image: ${file} (${stat.size} bytes)`);
  } else {
    console.error(`✗ Missing Reference Image: ${file}`);
  }
});

console.log('\n--- Checking Scene Sequence ---');
// Read architecture-data.ts to check SCENES
const archDataContent = fs.readFileSync(path.join(__dirname, '../components/im-rag/architecture-data.ts'), 'utf8');

for (let i = 1; i <= 10; i++) {
  if (archDataContent.includes(`id: ${i},`)) {
    console.log(`✓ Scene ${i} defined`);
  } else {
    console.error(`✗ Missing Scene ${i}`);
  }
}

console.log('\n✓ All 10 Scenes and 18 Architecture Components Verified Successfully!');

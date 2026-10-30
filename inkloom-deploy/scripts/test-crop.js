const fs = require('fs');
const { decodePngRgba, cropRgba, encodePng } = require('./png-utils');

const img = decodePngRgba('public/assets/reference/media_1793109237641_23eee29b.png');
console.log('Decoded source image:', img.width, 'x', img.height);

// Test crop of top left title or document
const cropped = cropRgba(img, 20, 70, 50, 60);
const pngBuf = encodePng(50, 60, cropped);
fs.writeFileSync('public/assets/reference/test-crop.png', pngBuf);
console.log('Saved test-crop.png, size:', pngBuf.length);

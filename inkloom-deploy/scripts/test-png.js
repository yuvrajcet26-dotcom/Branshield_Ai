const fs = require('fs');
const zlib = require('zlib');

function decodePng(filePath) {
  const buf = fs.readFileSync(filePath);
  let pos = 8; // skip PNG signature
  let width, height, bitDepth, colorType;
  const idatChunks = [];

  while (pos < buf.length) {
    const length = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + length);
    pos += 12 + length;

    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      console.log({ width, height, bitDepth, colorType });
    } else if (type === 'IDAT') {
      idatChunks.push(data);
    } else if (type === 'IEND') {
      break;
    }
  }

  const allIdat = Buffer.concat(idatChunks);
  const uncompressed = zlib.inflateSync(allIdat);
  console.log('Uncompressed length:', uncompressed.length, 'expected ~', height * (1 + width * 4));
}

decodePng('public/assets/reference/media_1793109237641_23eee29b.png');

const fs = require('fs');
const zlib = require('zlib');

function encodePng(width, height, rgbaBuffer) {
  // 1. Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // 2. IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bits per channel
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // deflate
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // no interlace
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // 3. IDAT
  // add filter byte (0) to each row
  const rowSize = width * 4;
  const filtered = Buffer.alloc(height * (rowSize + 1));
  for (let y = 0; y < height; y++) {
    filtered[y * (rowSize + 1)] = 0; // filter type 0
    rgbaBuffer.copy(filtered, y * (rowSize + 1) + 1, y * rowSize, (y + 1) * rowSize);
  }
  const compressed = zlib.deflateSync(filtered);
  const idatChunk = makeChunk('IDAT', compressed);

  // 4. IEND
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(12 + len);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const crc = crc32(buf.subarray(4, 8 + len));
  buf.writeInt32BE(crc, 8 + len);
  return buf;
}

// Simple CRC32 implementation
const crcTable = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}
function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return c ^ -1;
}

function decodePngRgba(filePath) {
  const buf = fs.readFileSync(filePath);
  let pos = 8;
  let width, height;
  const idatChunks = [];

  while (pos < buf.length) {
    const length = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + length);
    pos += 12 + length;

    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
    } else if (type === 'IDAT') {
      idatChunks.push(data);
    } else if (type === 'IEND') break;
  }

  const raw = zlib.inflateSync(Buffer.concat(idatChunks));
  // Unfilter scanlines
  const rowBytes = width * 4;
  const rgba = Buffer.alloc(width * height * 4);
  let rawPos = 0;

  for (let y = 0; y < height; y++) {
    const filter = raw[rawPos++];
    const rowStart = y * rowBytes;
    for (let x = 0; x < rowBytes; x++) {
      let b = raw[rawPos++];
      if (filter === 0) {
        rgba[rowStart + x] = b;
      } else if (filter === 1) { // Sub
        const left = x >= 4 ? rgba[rowStart + x - 4] : 0;
        rgba[rowStart + x] = (b + left) & 0xff;
      } else if (filter === 2) { // Up
        const up = y > 0 ? rgba[(y - 1) * rowBytes + x] : 0;
        rgba[rowStart + x] = (b + up) & 0xff;
      } else if (filter === 3) { // Average
        const left = x >= 4 ? rgba[rowStart + x - 4] : 0;
        const up = y > 0 ? rgba[(y - 1) * rowBytes + x] : 0;
        rgba[rowStart + x] = (b + Math.floor((left + up) / 2)) & 0xff;
      } else if (filter === 4) { // Paeth
        const left = x >= 4 ? rgba[rowStart + x - 4] : 0;
        const up = y > 0 ? rgba[(y - 1) * rowBytes + x] : 0;
        const upLeft = (y > 0 && x >= 4) ? rgba[(y - 1) * rowBytes + x - 4] : 0;
        const p = left + up - upLeft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - upLeft);
        let pr;
        if (pa <= pb && pa <= pc) pr = left;
        else if (pb <= pc) pr = up;
        else pr = upLeft;
        rgba[rowStart + x] = (b + pr) & 0xff;
      }
    }
  }

  return { width, height, rgba };
}

function cropRgba(source, sx, sy, sw, sh) {
  const dest = Buffer.alloc(sw * sh * 4);
  for (let y = 0; y < sh; y++) {
    const srcOffset = ((sy + y) * source.width + sx) * 4;
    const destOffset = y * sw * 4;
    source.rgba.copy(dest, destOffset, srcOffset, srcOffset + sw * 4);
  }
  return dest;
}

module.exports = { decodePngRgba, cropRgba, encodePng };

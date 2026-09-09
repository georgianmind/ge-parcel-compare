// Generates simple flat placeholder icons (parcel box on Georgian-red field)
// without any image dependencies — raw PNG encoding via zlib.
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';

function crc32(buf) {
  let c, table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  let crc = 0xffffffff;
  for (const b of buf) crc = table[(crc ^ b) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function png(size, pixelFn) {
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0; // filter none
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = pixelFn(x / size, y / size);
      const o = y * (size * 4 + 1) + 1 + x * 4;
      raw[o] = r; raw[o + 1] = g; raw[o + 2] = b; raw[o + 3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// Rounded red square, white parcel box with a tape cross.
function pixel(u, v) {
  const RED = [218, 41, 28, 255]; // Georgian flag red
  const WHITE = [255, 255, 255, 255];
  const r = 0.18;
  const cx = Math.min(u, 1 - u), cy = Math.min(v, 1 - v);
  if (cx < r && cy < r && (cx - r) ** 2 + (cy - r) ** 2 > r ** 2) return [0, 0, 0, 0];
  // parcel: box from 0.22..0.78 horizontally, 0.30..0.80 vertically
  if (u > 0.22 && u < 0.78 && v > 0.3 && v < 0.8) {
    // tape: vertical stripe + lid line
    if (Math.abs(u - 0.5) < 0.05 || Math.abs(v - 0.42) < 0.035) return RED;
    return WHITE;
  }
  return RED;
}

mkdirSync('public/icons', { recursive: true });
for (const size of [16, 48, 128]) {
  writeFileSync(`public/icons/icon${size}.png`, png(size, pixel));
}
console.log('icons written');

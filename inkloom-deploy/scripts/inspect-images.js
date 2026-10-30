const fs = require('fs');
const files = ["media_1793109228064_fc00e5d2.png", "media_1793109237641_23eee29b.png", "media_1793109263269_b38108a0.png"];
files.forEach(f => {
  const p = "public/assets/reference/" + f;
  const buf = fs.readFileSync(p);
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  console.log(f, w, "x", h, "size:", buf.length);
});

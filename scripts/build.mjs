import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { deflateSync } from "node:zlib";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const source = path.join(root, "src");
const dist = path.join(root, "dist");
const productionApi = "https://labs.wiplash.ai/cruddy-weather/api/*";
const developmentHosts = ["http://127.0.0.1:8792/*", "http://localhost:8792/*"];
const baseManifest = JSON.parse(await readFile(path.join(source, "manifest.json"), "utf8"));

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4); length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4); checksum.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([length, typeBuffer, data, checksum]);
}

function icon(size) {
  const rows = [];
  const inEllipse = (x, y, cx, cy, rx, ry) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
  const inPoop = (x, y) => inEllipse(x, y, .5, .77, .44, .2)
    || inEllipse(x, y, .29, .7, .23, .2)
    || inEllipse(x, y, .71, .7, .23, .2)
    || inEllipse(x, y, .5, .59, .35, .25)
    || inEllipse(x, y, .51, .43, .27, .21)
    || inEllipse(x, y, .57, .28, .17, .17)
    || (y > .08 && y < .31 && x > .51 && x < .68 - (y - .08) * .24);
  const borderWidth = Math.max(1.25 / size, .018);
  for (let y = 0; y < size; y += 1) {
    const row = Buffer.alloc(1 + size * 4); row[0] = 0;
    for (let x = 0; x < size; x += 1) {
      const nx = (x + .5) / size; const ny = (y + .5) / size;
      const inside = inPoop(nx, ny);
      const nearEdge = inside && [
        [borderWidth, 0], [-borderWidth, 0], [0, borderWidth], [0, -borderWidth],
      ].some(([dx, dy]) => !inPoop(nx + dx, ny + dy));
      let color = inside ? [255, 42, 152, 255] : [0, 0, 0, 0];
      if (nearEdge) color = [22, 11, 17, 255];
      const leftEye = inside && inEllipse(nx, ny, .39, .62, .105, .115);
      const rightEye = inside && inEllipse(nx, ny, .62, .62, .105, .115);
      const leftPupil = inEllipse(nx, ny, .41, .64, .042, .055);
      const rightPupil = inEllipse(nx, ny, .6, .64, .042, .055);
      const mouth = inside && inEllipse(nx, ny, .505, .79, .18, .1) && ny > .735;
      const tongue = mouth && inEllipse(nx, ny, .505, .845, .11, .05);
      const highlight = inside && inEllipse(nx, ny, .39, .37, .045, .085);
      if (highlight) color = [255, 130, 197, 255];
      if (leftEye || rightEye) color = [255, 255, 255, 255];
      if (leftPupil || rightPupil || mouth) color = [22, 11, 17, 255];
      if (tongue) color = [255, 130, 197, 255];
      for (let channel = 0; channel < 4; channel += 1) row[1 + x * 4 + channel] = color[channel];
    }
    rows.push(row);
  }
  const header = Buffer.alloc(13); header.writeUInt32BE(size, 0); header.writeUInt32BE(size, 4); header[8] = 8; header[9] = 6;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk("IHDR", header), chunk("IDAT", deflateSync(Buffer.concat(rows))), chunk("IEND", Buffer.alloc(0))]);
}

async function buildTarget(browser, { development = false } = {}) {
  const output = path.join(dist, browser);
  await cp(source, output, { recursive: true });
  await mkdir(path.join(output, "assets", "icons"), { recursive: true });
  for (const size of [16, 32, 48, 64, 96, 128, 300, 512]) {
    await writeFile(path.join(output, "assets", "icons", `icon${size}.png`), icon(size));
  }

  const manifest = structuredClone(baseManifest);
  if (browser !== "firefox") delete manifest.browser_specific_settings;
  if (browser === "opera") manifest.permissions = manifest.permissions.filter((permission) => permission !== "search");
  if (["firefox", "opera"].includes(browser)) manifest.permissions = manifest.permissions.filter((permission) => permission !== "favicon");
  if (development) {
    manifest.name = "Cruddy Weather Dev";
    manifest.short_name = "Cruddy Dev";
    manifest.host_permissions = [productionApi, ...developmentHosts];
  } else {
    manifest.host_permissions = [productionApi];
  }
  await writeFile(path.join(output, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  const runtimeConfig = {
    environment: development ? "development" : "production",
    apiOrigin: development ? "http://127.0.0.1:8792/" : "https://labs.wiplash.ai/cruddy-weather/api/",
    searchMode: browser === "opera" ? "direct" : "browser",
    searchPickerMode: browser === "firefox" ? "installed" : browser === "opera" ? "fixed-google" : "browser-default",
    faviconMode: ["firefox"].includes(browser) ? "top-sites" : ["opera"].includes(browser) ? "fallback" : "extension",
  };
  await writeFile(path.join(output, "shared", "runtime-config.js"), `globalThis.CruddyWeatherConfig = Object.freeze(${JSON.stringify(runtimeConfig, null, 2)});\n`);
  return manifest;
}

await rm(dist, { recursive: true, force: true });
const manifests = await Promise.all([
  buildTarget("chrome"),
  buildTarget("edge"),
  buildTarget("opera"),
  buildTarget("firefox"),
  buildTarget("dev-chrome", { development: true }),
]);

for (const manifest of manifests) {
  if (manifest.manifest_version !== 3) throw new Error("Manifest V3 is required.");
}
console.log(`Built Cruddy Weather ${baseManifest.version} for Chrome, Edge, Opera, and Firefox plus dist/dev-chrome/.`);

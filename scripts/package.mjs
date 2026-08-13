import { createWriteStream } from "node:fs";
import { mkdir, readFile, rm } from "node:fs/promises";
import path from "node:path";
import archiver from "archiver";

const root = path.resolve(import.meta.dirname, "..");
const manifest = JSON.parse(await readFile(path.join(root, "src", "manifest.json"), "utf8"));
const artifactDir = path.join(root, "artifacts", "packages");
const targets = [
  ["chrome", `cruddy-weather-chrome-v${manifest.version}.zip`],
  ["edge", `cruddy-weather-edge-v${manifest.version}.zip`],
  ["opera", `cruddy-weather-opera-v${manifest.version}.zip`],
  ["firefox", `cruddy-weather-firefox-v${manifest.version}.xpi`],
];

await rm(artifactDir, { recursive: true, force: true });
await mkdir(artifactDir, { recursive: true });

for (const [browser, filename] of targets) {
  const source = path.join(root, "dist", browser);
  const destination = path.join(artifactDir, filename);
  await new Promise((resolve, reject) => {
    const output = createWriteStream(destination);
    const archive = archiver("zip", { zlib: { level: 9 } });
    output.on("close", resolve);
    output.on("error", reject);
    archive.on("error", reject);
    archive.pipe(output);
    archive.directory(source, false);
    archive.finalize();
  });
}

console.log(`Created ${targets.length} unsigned store archives in ${artifactDir}.`);

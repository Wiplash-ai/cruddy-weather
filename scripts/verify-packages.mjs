import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const sourceManifest = JSON.parse(await readFile(path.join(root, "src", "manifest.json"), "utf8"));
const version = sourceManifest.version;
const productionBrowsers = ["chrome", "edge", "opera", "firefox"];

for (const browser of productionBrowsers) {
  const manifestPath = path.join(root, "dist", browser, "manifest.json");
  const raw = await readFile(manifestPath, "utf8");
  const manifest = JSON.parse(raw);
  if (manifest.version !== version) throw new Error(`${browser} version drifted.`);
  if (raw.includes("localhost") || raw.includes("127.0.0.1")) throw new Error(`${browser} contains a development host.`);
  const runtimeConfig = await readFile(path.join(root, "dist", browser, "shared", "runtime-config.js"), "utf8");
  if (runtimeConfig.includes("localhost") || runtimeConfig.includes("127.0.0.1") || !runtimeConfig.includes("https://labs.wiplash.ai/cruddy-weather/api/")) {
    throw new Error(`${browser} contains an invalid production runtime origin.`);
  }
  if (manifest.host_permissions.length !== 1 || manifest.host_permissions[0] !== "https://labs.wiplash.ai/cruddy-weather/api/*") {
    throw new Error(`${browser} has unexpected production host permissions.`);
  }
  if (browser === "firefox") {
    if (manifest.browser_specific_settings?.gecko?.id !== "cruddy-weather@wiplash.ai") throw new Error("Firefox ID is missing.");
  } else if (manifest.browser_specific_settings) {
    throw new Error(`${browser} contains Firefox-only manifest settings.`);
  }
  if (browser === "opera" && manifest.permissions.includes("search")) throw new Error("Opera contains its unsupported search permission.");
  if (browser !== "opera" && !manifest.permissions.includes("search")) throw new Error(`${browser} is missing browser search integration.`);
  if (["chrome", "edge"].includes(browser) && !manifest.permissions.includes("favicon")) throw new Error(`${browser} is missing local favicon integration.`);
  if (["firefox", "opera"].includes(browser) && manifest.permissions.includes("favicon")) throw new Error(`${browser} contains an unsupported favicon permission.`);
  const expectedSearchPicker = browser === "firefox" ? "installed" : browser === "opera" ? "fixed-google" : "browser-default";
  if (!runtimeConfig.includes(`searchPickerMode: "${expectedSearchPicker}"`) && !runtimeConfig.includes(`"searchPickerMode": "${expectedSearchPicker}"`)) {
    throw new Error(`${browser} contains the wrong search picker mode.`);
  }

  const extension = browser === "firefox" ? "xpi" : "zip";
  const archive = path.join(root, "artifacts", "packages", `cruddy-weather-${browser}-v${version}.${extension}`);
  await access(archive);
  if ((await stat(archive)).size < 10_000) throw new Error(`${browser} archive is suspiciously small.`);
}

const devManifest = JSON.parse(await readFile(path.join(root, "dist", "dev-chrome", "manifest.json"), "utf8"));
if (!devManifest.host_permissions.some((permission) => permission.includes("127.0.0.1"))) throw new Error("Development Chrome is missing local API access.");
if (!devManifest.name.endsWith("Dev")) throw new Error("Development Chrome is not visibly marked as development.");
const devRuntimeConfig = await readFile(path.join(root, "dist", "dev-chrome", "shared", "runtime-config.js"), "utf8");
if (!devRuntimeConfig.includes("http://127.0.0.1:8792/")) throw new Error("Development Chrome is not configured for the local API.");
if (!devManifest.permissions.includes("favicon")) throw new Error("Development Chrome is missing local favicon integration.");

console.log("Verified production manifests, local-only development access, and all four store archives.");

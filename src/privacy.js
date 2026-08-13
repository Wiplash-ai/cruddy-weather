import { getSettings, saveSettings } from "./shared/settings.js";

let settings = await getSettings();

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.textContent = theme === "light" ? "☾" : "☀";
    button.title = theme === "light" ? "Turn the lights off" : "Turn the lights on";
    button.setAttribute("aria-label", button.title);
  });
}

applyTheme(settings.theme);
document.querySelectorAll("[data-theme-toggle]").forEach((button) => button.addEventListener("click", async () => {
  settings = await saveSettings({ theme: settings.theme === "dark" ? "light" : "dark" });
  applyTheme(settings.theme);
}));

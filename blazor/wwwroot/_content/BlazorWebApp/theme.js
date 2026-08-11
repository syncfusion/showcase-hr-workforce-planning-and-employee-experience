// ESM module for ThemeService. Sits under _content/BlazorWebApp/ so the
// IJSObjectReference path "./_content/BlazorWebApp/theme.js" resolves at runtime.

const DARK_QUERY = "(prefers-color-scheme: dark)";
const DARK_STYLESHEET_ID = "sf-dark-theme";
const DARK_STYLESHEET_HREF = "_content/Syncfusion.Blazor.Themes/tailwind3-dark.css";

function readStored(key) {
    try { return localStorage.getItem(key); } catch { return null; }
}

function writeStored(key, value) {
    try { localStorage.setItem(key, value); } catch { /* ignore */ }
}

function setDarkStylesheet(enabled) {
    var existing = document.getElementById(DARK_STYLESHEET_ID);
    if (enabled) {
        if (!existing) {
            var link = document.createElement("link");
            link.id = DARK_STYLESHEET_ID;
            link.rel = "stylesheet";
            link.href = DARK_STYLESHEET_HREF;
            document.head.appendChild(link);
        }
    } else if (existing) {
        existing.remove();
    }
}

function apply(resolved) {
    document.documentElement.dataset.theme = resolved;
    document.body.classList.toggle("e-dark-mode", resolved === "dark");
    setDarkStylesheet(resolved === "dark");
}

let mediaListener = null;
let dotnetRef = null;

export function subscribe(ref, storageKey) {
    dotnetRef = ref;
    if (mediaListener) {
        matchMedia(DARK_QUERY).removeEventListener("change", mediaListener);
    }
    mediaListener = (e) => {
        const resolved = e.matches ? "dark" : "light";
        // Only forward when user is in "system" mode; the server decides based on
        // the persisted mode, so this is a hint that the OS preference changed.
        const persisted = readStored(storageKey);
        if (persisted === "system") {
            dotnetRef.invokeMethodAsync("OnSystemThemeChangedAsync", e.matches);
        }
    };
    matchMedia(DARK_QUERY).addEventListener("change", mediaListener);
}

export { readStored, writeStored, apply };

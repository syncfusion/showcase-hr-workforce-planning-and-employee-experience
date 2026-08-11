// ESM module for clipboard support — imported by DetailPanel.razor
// via IJSRuntime to copy Quick Action "Copy Employee Email" payloads
// and generic AI message previews to the user's clipboard.
//
// Returns `true` on success, `false` otherwise (no clipboard API,
// permission denied, non-secure context, etc.). The Blazor caller
// surfaces a visible-text fallback when this returns false so the
// user never loses the value they were trying to copy.

export async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch {
        // Permission denied or non-secure context — fall through to
        // the legacy execCommand path below.
    }

    // Legacy fallback for browsers without navigator.clipboard
    // (Safari < 13.1, older Firefox, non-secure contexts). Creates a
    // hidden <textarea>, selects it, copies, then removes the node.
    try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.top = "0";
        textarea.style.left = "0";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(textarea);
        return ok;
    } catch {
        return false;
    }
}

"use strict";
function probeDocumentOperability() {
  try {
    const root = document.documentElement ?? document.body;
    if (!root) return false;
    const probe = document.createElement("div");
    probe.style.display = "none";
    root.appendChild(probe);
    const ok = probe.isConnected;
    probe.remove();
    return ok;
  } catch {
    return false;
  }
}

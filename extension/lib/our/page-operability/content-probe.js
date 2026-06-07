"use strict";
// ../lib/our/page-operability/content-probe.ts
var PROBE_DOCUMENT_OPERABILITY = "PROBE_DOCUMENT_OPERABILITY";
function isProbeDocumentOperabilityMessage(message) {
  if (typeof message !== "object" || message === null) return false;
  return message.type === PROBE_DOCUMENT_OPERABILITY;
}
var probeListenerRegistered = false;
function registerDocumentOperabilityProbeListener() {
  if (probeListenerRegistered) return;
  probeListenerRegistered = true;
  ext.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!isProbeDocumentOperabilityMessage(message)) return;
    sendResponse(probeDocumentOperability());
    return true;
  });
}

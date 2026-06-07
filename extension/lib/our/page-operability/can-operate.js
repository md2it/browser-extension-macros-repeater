"use strict";
function scriptingTarget(tabId, frameId) {
  return frameId !== void 0 && frameId !== 0 ? { tabId, frameIds: [frameId] } : { tabId };
}
function messageOptions(frameId) {
  return frameId !== void 0 && frameId !== 0 ? { frameId } : void 0;
}
// Do not cache this result: navigation can change operability within the same tab.
async function canOperateOnTab(tabId, frameId) {
  if (!Number.isInteger(tabId)) return false;
  try {
    const response = await ext.tabs.sendMessage(
      tabId,
      { type: PROBE_DOCUMENT_OPERABILITY },
      messageOptions(frameId),
    );
    if (response === true) return true;
    if (response === false) return false;
  } catch {
    // Fall through to scripting probe.
  }
  try {
    const [result] = await ext.scripting.executeScript({
      target: scriptingTarget(tabId, frameId),
      func: probeDocumentOperability,
    });
    return result?.result === true;
  } catch {
    // Communication failures cover restricted pages and missing host permissions.
    return false;
  }
}

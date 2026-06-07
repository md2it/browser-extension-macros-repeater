"use strict";
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
    return response === true;
  } catch {
    // Communication failures cover restricted pages and missing content scripts.
    return false;
  }
}

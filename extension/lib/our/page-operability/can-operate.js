"use strict";
// ../lib/our/page-operability/can-operate.ts
function messageOptions(frameId) {
  return frameId !== void 0 && frameId !== 0 ? { frameId } : void 0;
}
// Состояние определяется отдельно для каждой вкладки и не кэшируется:
// каждый вызов заново опрашивает content script указанной вкладки.
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
    // Ошибка связи с content script означает, что страница недоступна
    // (системные страницы, защищённые сайты, нет внедрённого скрипта).
    return false;
  }
}

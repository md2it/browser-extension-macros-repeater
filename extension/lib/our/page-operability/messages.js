"use strict";
// ../lib/our/page-operability/messages.ts
var BLOCKED_NOTICE_DISMISSED = "BLOCKED_NOTICE_DISMISSED";
function isBlockedNoticeDismissedMessage(message) {
  if (typeof message !== "object" || message === null) return false;
  const m = message;
  return m.type === BLOCKED_NOTICE_DISMISSED && typeof m.tabId === "number";
}

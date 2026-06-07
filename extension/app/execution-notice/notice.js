"use strict";

async function showExecutionErrorNotice(tabId, kind, windowId) {
  const locale = await restrictedPageNoticeLocale();
  const payload = {
    text: executionErrorNoticeText(kind, locale),
    locale,
    dismissMs: EXECUTION_NOTICE_MIN_MS,
  };
  await showBlockedNotice(tabId, EXECUTION_NOTICE_CONFIG, payload, windowId);
}

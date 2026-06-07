"use strict";
async function showRestrictedNotice(tabId, windowId) {
  const locale = await restrictedPageNoticeLocale();
  const payload = {
    text: restrictedPageNoticeText(locale),
    locale,
    dismissMs: RESTRICTED_NOTICE_MIN_MS,
  };
  await showBlockedNotice(tabId, RESTRICTED_NOTICE_CONFIG, payload, windowId);
}

"use strict";
// src/page-operability/notice.ts

// Открывает отдельный popup с уведомлением о недоступной странице.
// Состояние не кэшируется: текст пересобирается при каждом показе.
async function showRestrictedNotice(tabId, windowId) {
  const locale = await restrictedPageNoticeLocale();
  const payload = {
    text: restrictedPageNoticeText(locale),
    locale,
    dismissMs: RESTRICTED_NOTICE_MIN_MS,
  };
  await showBlockedNotice(tabId, RESTRICTED_NOTICE_CONFIG, payload, windowId);
}

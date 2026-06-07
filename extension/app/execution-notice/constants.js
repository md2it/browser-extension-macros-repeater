"use strict";

const EXECUTION_ERROR_NOTICE_MESSAGES = {
  "stopped": {
    en: "Macro stopped",
    es: "Macro detenida",
    fr: "Macro arrêtée",
    de: "Makro gestoppt",
    ru: "Макрос остановлен",
    zh: "宏已停止",
    ar: "تم إيقاف الماكرو",
  },
  "user-click": {
    en: "Macro stopped by the user",
    es: "Macro detenida por el usuario",
    fr: "Macro arrêtée par l'utilisateur",
    de: "Makro vom Benutzer gestoppt",
    ru: "Макрос остановлен пользователем",
    zh: "宏已被用户停止",
    ar: "أوقف المستخدم الماكرو",
  },
  "element-not-found": {
    en: "Element not found: the saved element is missing or no longer matches its selector",
    es: "Elemento no encontrado: falta o ya no coincide con su selector",
    fr: "Élément introuvable : absent ou ne correspondant plus au sélecteur",
    de: "Element nicht gefunden: fehlt oder entspricht nicht mehr dem Selektor",
    ru: "Элемент не найден: сохранённый элемент отсутствует или больше не определяется по селектору",
    zh: "未找到元素：已保存元素不存在或不再匹配选择器",
    ar: "لم يتم العثور على العنصر: العنصر المحفوظ مفقود أو لم يعد يطابق المحدد",
  },
  "empty-steps": {
    en: "The macro has no steps",
    es: "La macro no tiene pasos",
    fr: "La macro ne contient aucune étape",
    de: "Das Makro enthält keine Schritte",
    ru: "В макросе нет шагов",
    zh: "宏没有步骤",
    ar: "لا يحتوي الماكرو على خطوات",
  },
  "failed": {
    en: "Could not run the macro",
    es: "No se pudo ejecutar la macro",
    fr: "Impossible d'exécuter la macro",
    de: "Makro konnte nicht ausgeführt werden",
    ru: "Не удалось выполнить макрос",
    zh: "无法运行宏",
    ar: "تعذر تشغيل الماكرو",
  },
};

const EXECUTION_NOTICE_POPUP = "execution-notice.html";
const EXECUTION_NOTICE_MIN_MS = 4000;
const EXECUTION_NOTICE_SESSION_KEY = "executionErrorNotice";
const EXECUTION_NOTICE_CONFIG = {
  popupHtml: EXECUTION_NOTICE_POPUP,
  sessionKey: EXECUTION_NOTICE_SESSION_KEY,
  logLabel: "Macros Repeater",
};

function executionErrorNoticeText(kind, locale) {
  const messages = EXECUTION_ERROR_NOTICE_MESSAGES[kind] ?? EXECUTION_ERROR_NOTICE_MESSAGES["failed"];
  return messages[locale] ?? messages.en;
}

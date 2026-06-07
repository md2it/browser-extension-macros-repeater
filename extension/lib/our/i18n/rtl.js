var RTL_LOCALES = new Set(["ar"]);

function isRtlLocale(locale) {
  return RTL_LOCALES.has(locale);
}

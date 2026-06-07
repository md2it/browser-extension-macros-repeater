var WELCOME_BODY_MIN_VAR = "--welcome-body-min";
var WELCOME_PROBE_WIDTH = "360px";
var PANEL_HEADER_STYLE_ID = "dd-panel-header-styles";

function ensurePanelHeaderStyles() {
  if (document.getElementById(PANEL_HEADER_STYLE_ID)) return;
  const css = [
    ".dd-panel-header{flex:0 0 auto;padding:1.125rem 1.125rem 0}",
    ".dd-panel-divider{flex:0 0 auto;width:90%;height:1px;margin-inline:auto;background:#012292}",
    ".dd-panel-title-row{display:grid;grid-template-columns:1fr;grid-template-areas:'stack';align-items:center}",
    ".dd-panel-logo,.dd-panel-heading{grid-area:stack}",
    ".dd-panel-logo{display:flex;align-items:stretch;align-self:stretch;justify-self:start;line-height:0;z-index:1}",
    ".dd-panel-logo svg{display:block;height:100%;width:auto;aspect-ratio:1;flex-shrink:0}",
    ".dd-panel-heading{justify-self:center;align-self:center;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.12rem;min-width:0;max-width:100%;font-size:.82rem}",
    ".dd-panel-title{margin:0;font-size:inherit;font-weight:800;letter-spacing:.14em;text-align:center;text-transform:uppercase;color:#012292}",
    ".dd-panel-subtitle{margin:0;font-size:.68rem;font-weight:500;letter-spacing:.02em;line-height:1.2;white-space:nowrap;text-align:center;color:#666}"
  ].join("\n");
  const style = document.createElement("style");
  style.id = PANEL_HEADER_STYLE_ID;
  style.textContent = css;
  document.head.append(style);
}

var welcomeHeaderEl = null;
var welcomeBodyMinPx = null;
var welcomePinHintRtl = false;

function stepIcon(iconHtml) {
  const span = document.createElement("span");
  span.className = "step-icon";
  span.innerHTML = iconHtml;
  span.setAttribute("aria-hidden", "true");
  return span;
}

function stepWithIcon(text, iconHtml) {
  const li = document.createElement("li");
  li.append(document.createTextNode(text + " "), stepIcon(iconHtml));
  return li;
}

function stepWithExtension(text, iconSvg, name) {
  const li = document.createElement("li");
  const icon = document.createElement("span");
  icon.className = "step-icon step-icon--ext";
  icon.setAttribute("aria-hidden", "true");
  if (iconSvg) icon.innerHTML = iconSvg;
  li.append(document.createTextNode(text + " "), icon, document.createTextNode(" " + name));
  return li;
}

function createAboutItem(item) {
  const li = document.createElement("li");
  li.className = "about-item";
  const mark = document.createElement("span");
  mark.className = "about-icon";
  mark.setAttribute("aria-hidden", "true");
  if (item.iconHtml) mark.innerHTML = item.iconHtml;
  const label = document.createElement(item.href ? "a" : "span");
  label.className = "about-text";
  label.textContent = item.text;
  if (item.href) {
    label.href = item.href;
    label.target = "_blank";
    label.rel = "noopener noreferrer";
    label.style.color = "inherit";
  }
  li.append(mark, label);
  return li;
}

function mergeWelcomeLocale(base, localeCode) {
  const localePayload = base.perLocale?.[localeCode];
  if (!localePayload) return base;
  return Object.assign({}, base, localePayload, { locale: localeCode });
}

function mountWelcomeHeader(data) {
  if (welcomeHeaderEl) {
    welcomeHeaderEl.querySelector(".dd-panel-title").textContent = data.headerTitle;
    welcomeHeaderEl.querySelector(".dd-panel-subtitle").textContent = data.headerSubtitle;
    return;
  }
  const mount = document.getElementById("welcome-header-mount");
  if (!mount) return;
  welcomeHeaderEl = createPanelHeader({
    title: data.headerTitle,
    subtitle: data.headerSubtitle,
    logoSvg: data.headerLogoSvg
  });
  mount.replaceWith(welcomeHeaderEl, createPanelDivider());
}

function fillLangRow(langRow, data, onSelect) {
  if (!data.hasLocales || !Array.isArray(data.locales)) return;
  langRow.setAttribute("aria-label", data.langAriaLabel ?? "");
  langRow.replaceChildren();
  for (const code of data.locales) {
    const langBtn = document.createElement("button");
    langBtn.type = "button";
    langBtn.className = "dd-chip dd-lang-btn";
    langBtn.textContent = data.localeLabels?.[code] ?? code;
    langBtn.classList.toggle("is-active", code === data.locale);
    if (onSelect) {
      langBtn.addEventListener("click", () => onSelect(code));
    }
    langRow.appendChild(langBtn);
  }
}

function populateWelcomeBody(body, data) {
  const langBlock = document.createElement("div");
  langBlock.className = "lang-block";
  const langRow = document.createElement("div");
  langRow.className = "dd-lang-row";
  langRow.id = "lang-row";
  langRow.setAttribute("role", "group");
  fillLangRow(langRow, data);
  langBlock.appendChild(langRow);

  const pinSep = document.createElement("hr");
  pinSep.className = "welcome-sep";
  pinSep.id = "pin-sep";

  const pinBlock = document.createElement("div");
  pinBlock.className = "pin-block";
  const pinHeading = document.createElement("p");
  pinHeading.className = "pin-heading";
  pinHeading.id = "pin-heading";
  pinHeading.textContent = data.pinHeading;
  const steps = document.createElement("ol");
  steps.className = "pin-steps";
  steps.id = "pin-steps";
  steps.append(
    stepWithIcon(data.pinStep1, data.puzzleIcon),
    stepWithExtension(data.pinStep2, data.iconSvg, data.extensionName),
    stepWithIcon(data.pinStep3, data.pinIcon)
  );
  pinBlock.append(pinHeading, steps);

  const nodes = [langBlock, pinSep, pinBlock];

  const aboutItems = data.aboutItems;
  if (data.hasAbout && Array.isArray(aboutItems) && aboutItems.length > 0) {
    const aboutSep = document.createElement("hr");
    aboutSep.className = "welcome-sep";
    aboutSep.id = "about-sep";
    const aboutHeading = document.createElement("p");
    aboutHeading.className = "about-heading";
    aboutHeading.id = "about-heading";
    aboutHeading.textContent = data.aboutHeading;
    const aboutList = document.createElement("ul");
    aboutList.className = "about-list";
    aboutList.id = "about-list";
    aboutList.append(...aboutItems.map(createAboutItem));
    nodes.push(aboutSep, aboutHeading, aboutList);
  }

  body.replaceChildren(...nodes);
}

function renderWelcomeContent(data, config) {
  document.documentElement.lang = localeToHtmlLang(data.locale);
  welcomePinHintRtl = data.dir === "rtl" || config.isRtlLocale(data.locale);
  document.documentElement.dir = welcomePinHintRtl ? "rtl" : "ltr";
  mountWelcomeHeader(data);
  const body = document.querySelector(".welcome-body");
  if (body) populateWelcomeBody(body, data);
}

function syncLangButtons(data, config) {
  const langRow = document.getElementById("lang-row");
  if (!langRow) return;
  fillLangRow(langRow, data, (code) => {
    void switchWelcomeLocale(data, code, config);
  });
}

async function switchWelcomeLocale(base, localeCode, config) {
  if (localeCode === base.locale) return;
  await ext.storage.local.set({
    [config.localeStorageKey]: localeCode,
    [config.localeUserSelectedKey]: true
  });
  const next = mergeWelcomeLocale(base, localeCode);
  renderWelcomeContent(next, config);
  syncLangButtons(next, config);
  requestAnimationFrame(() => positionPinHint());
}

function measureWelcomeBodyHeight(base, localeCode) {
  const data = mergeWelcomeLocale(base, localeCode);
  const shell = document.createElement("div");
  shell.className = "welcome";
  shell.style.cssText = "position:fixed;left:-9999px;width:" + WELCOME_PROBE_WIDTH + ";visibility:hidden;pointer-events:none;";
  const body = document.createElement("div");
  body.className = "welcome-body";
  shell.appendChild(body);
  document.body.appendChild(shell);
  populateWelcomeBody(body, data);
  const height = body.getBoundingClientRect().height;
  shell.remove();
  return height;
}

function measureMaxWelcomeBodyHeight(base) {
  let max = 0;
  for (const code of base.locales ?? []) {
    max = Math.max(max, measureWelcomeBodyHeight(base, code));
  }
  return max;
}

function applyWelcomeBodyMinHeight(base) {
  const body = document.querySelector(".welcome-body");
  if (!body) return;
  if (welcomeBodyMinPx == null) {
    welcomeBodyMinPx = measureMaxWelcomeBodyHeight(base);
  }
  body.style.setProperty(WELCOME_BODY_MIN_VAR, welcomeBodyMinPx + "px");
}

var PIN_HINT_EDGE = 24;
var PIN_HINT_EDGE_RATIO = 0.2;

function positionPinHint() {
  const hint = document.getElementById("pin-hint");
  const welcome = document.querySelector(".welcome");
  if (!hint || !welcome || hint.hidden || hint.getAttribute("aria-hidden") === "true") return;
  const rect = welcome.getBoundingClientRect();
  const rtl = welcomePinHintRtl;
  const viewportCornerX = rtl ? PIN_HINT_EDGE : window.innerWidth - PIN_HINT_EDGE;
  const gap = rtl ? Math.max(0, rect.left - PIN_HINT_EDGE) : Math.max(0, viewportCornerX - rect.right);
  const x = rtl ? PIN_HINT_EDGE + gap * PIN_HINT_EDGE_RATIO : viewportCornerX - gap * PIN_HINT_EDGE_RATIO;
  hint.style.direction = "ltr";
  hint.style.transform = "translateX(-50%)";
  hint.style.left = Math.round(x) + "px";
  hint.style.right = "auto";
}

function bindPinHintPosition() {
  const welcome = document.querySelector(".welcome");
  if (!welcome) return;
  const reposition = () => positionPinHint();
  window.addEventListener("resize", reposition, { passive: true });
  if (typeof ResizeObserver !== "undefined") {
    const observer = new ResizeObserver(reposition);
    observer.observe(welcome);
  }
  requestAnimationFrame(reposition);
}

function syncPinHintVariant(pinned) {
  const hint = document.getElementById("pin-hint");
  const guide = document.getElementById("pin-hint-guide");
  const pinnedBlock = document.getElementById("pin-hint-pinned");
  if (!hint || !guide || !pinnedBlock) return;
  hint.hidden = false;
  hint.setAttribute("aria-hidden", "false");
  guide.hidden = pinned;
  pinnedBlock.hidden = !pinned;
  requestAnimationFrame(() => positionPinHint());
}

function setupPinHint(data, config) {
  const arrowEl = document.getElementById("pin-hint-arrow");
  const pinEl = document.getElementById("pin-hint-pin");
  const heartEl = document.getElementById("pin-hint-heart");
  if (arrowEl && data.arrowUpIcon) arrowEl.innerHTML = data.arrowUpIcon;
  if (pinEl && data.pinHintIcon) pinEl.innerHTML = data.pinHintIcon;
  if (heartEl && data.heartIcon) heartEl.innerHTML = data.heartIcon;
  const pinned = data.isPinned === true;
  syncPinHintVariant(pinned);
  bindPinHintPosition();
  ext.runtime.onMessage.addListener((message) => {
    if (message?.type === config.pinStatusChangedMessageType && message.pinned) {
      syncPinHintVariant(true);
    }
  });
  if (!pinned) {
    void ext.runtime.sendMessage({ type: config.watchPinStatusMessageType });
  }
}

async function bootstrapWelcomePage(config) {
  ensurePanelHeaderStyles();
  const result = await ext.storage.session.get(config.sessionDataKey);
  const welcomeData = result?.[config.sessionDataKey];
  if (!welcomeData?.locale) return;
  const data = welcomeData;
  renderWelcomeContent(data, config);
  applyWelcomeBodyMinHeight(data);
  syncLangButtons(data, config);
  setupPinHint(data, config);
}

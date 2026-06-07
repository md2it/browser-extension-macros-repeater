
function badgeColorToHex(color) {
  return `#${color.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function interpolateBadgeColor(startColor, endColor, progress) {
  return badgeColorToHex(startColor.map((channel, index) =>
    Math.round(channel + (endColor[index] - channel) * progress)
  ));
}

function getBadgeAnimationTextColor(colors, frame) {
  const totalFrames = BADGE_ANIMATION_STEPS * 2;
  const normalizedFrame = ((frame % totalFrames) + totalFrames) % totalFrames;
  const step = normalizedFrame < BADGE_ANIMATION_STEPS
    ? normalizedFrame + 1
    : totalFrames - normalizedFrame;

  if (colors.length === 2) {
    return interpolateBadgeColor(
      colors[0],
      colors[1],
      (step - 1) / (BADGE_ANIMATION_STEPS - 1)
    );
  }

  const middleStep = Math.floor(BADGE_ANIMATION_STEPS / 2);
  if (step <= middleStep) {
    return interpolateBadgeColor(
      colors[0],
      colors[1],
      (step - 1) / (middleStep - 1)
    );
  }
  return interpolateBadgeColor(
    colors[1],
    colors[2],
    (step - middleStep) / (BADGE_ANIMATION_STEPS - middleStep)
  );
}

function clearBadgeAnimation() {
  if (badgeAnimationIntervalId !== null) {
    clearInterval(badgeAnimationIntervalId);
    badgeAnimationIntervalId = null;
  }
  badgeAnimationFrame = 0;
  badgeAnimationMode = null;
}

async function setActiveBadgeVisual(mode) {
  const isCreateMode = mode === "create";
  const colors = isCreateMode ? CREATE_BADGE_TEXT_COLORS : RUN_BADGE_TEXT_COLORS;
  const backgroundColor = isCreateMode
    ? CREATE_BADGE_BACKGROUND_COLOR
    : RUN_BADGE_BACKGROUND_COLOR;

  await ext.action.setBadgeBackgroundColor({ color: backgroundColor });
  if (typeof ext.action.setBadgeTextColor === "function") {
    await ext.action.setBadgeTextColor({
      color: getBadgeAnimationTextColor(colors, badgeAnimationFrame)
    });
  }
  await ext.action.setBadgeText({ text: ACTIVE_BADGE_TEXT });
}

function ensureBadgeAnimation(mode) {
  if (badgeAnimationIntervalId !== null && badgeAnimationMode === mode) {
    return;
  }

  clearBadgeAnimation();
  badgeAnimationMode = mode;
  const totalFrames = BADGE_ANIMATION_STEPS * 2;

  badgeAnimationIntervalId = setInterval(() => {
    badgeAnimationFrame = (badgeAnimationFrame + 1) % totalFrames;
    void setActiveBadgeVisual(mode);
  }, BADGE_ANIMATION_STEP_MS);
}

async function syncActionBadge() {
  clearShortcutHintTimer();

  const session = await readSession();
  if (session?.isActive) {
    ensureBadgeAnimation("create");
    await setActiveBadgeVisual("create");
    return;
  }

  const executionState = await getRuntimeExecutionState();
  if (executionState?.isRunning) {
    ensureBadgeAnimation("run");
    await setActiveBadgeVisual("run");
    return;
  }

  clearBadgeAnimation();
  await setActionBadgeText("");
}

async function showShortcutHintBadge() {
  const session = await readSession();
  const executionState = await getRuntimeExecutionState();
  if (session?.isActive || executionState?.isRunning) {
    await syncActionBadge();
    return;
  }

  clearShortcutHintTimer();
  clearBadgeAnimation();
  await ext.action.setBadgeText({ text: SHORTCUT_HINT_BADGE_TEXT });
  await ext.action.setBadgeBackgroundColor({ color: SHORTCUT_HINT_BADGE_BACKGROUND_COLOR });
  if (typeof ext.action.setBadgeTextColor === "function") {
    await ext.action.setBadgeTextColor({ color: SHORTCUT_HINT_BADGE_TEXT_COLOR });
  }
  shortcutHintTimerId = setTimeout(() => {
    shortcutHintTimerId = null;
    void syncActionBadge();
  }, SHORTCUT_HINT_DURATION_MS);
}

async function startDefaultMacroFromTab(tabId) {
  if (!Number.isInteger(tabId)) {
    return { ok: false, error: "tab_id_required" };
  }

  const defaultMacroId = await readDefaultMacroId();
  if (!defaultMacroId) {
    return { ok: false, error: "default_macro_missing" };
  }

  const macros = await readMacros();
  const macro = macros.find((item) => item.id === defaultMacroId);
  if (!macro) {
    return { ok: false, error: "default_macro_missing" };
  }

  const macroMode = macro.mode === "element" ? "element" : "position";
  const steps = Array.isArray(macro.steps)
    ? macro.steps
      .map((step) => {
        if (typeof step === "string") return step;
        if (step && typeof step === "object") {
          return macroMode === "element" ? (step.selector ?? "") : (step.position ?? "");
        }
        return "";
      })
      .filter((step) => step && step.trim())
    : [];
  const macroName = typeof macro.name === "string" && macro.name.trim() ? macro.name.trim() : "macros";
  if (!steps.length) {
    // Запуск по хоткею без открытого popup: сохраняем событие,
    // чтобы уведомление "В макросе нет шагов" показалось при открытии popup.
    await writeExecutionLastEvent({ kind: "empty-steps", macroName });
    return { ok: false, error: "empty_steps" };
  }
  const repeatsRaw = Number(macro.repeats);
  const repeats = Number.isFinite(repeatsRaw) && repeatsRaw > 0 ? Math.floor(repeatsRaw) : 1;
  return startExecutionOnTab({
    tabId,
    macroId: macro.id,
    macroName,
    repeats,
    trackMoves: Boolean(macro.displayMoves ?? macro.trackMoves),
    steps
  });
}

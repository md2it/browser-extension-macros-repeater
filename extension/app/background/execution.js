
async function startExecutionOnTab({ tabId, macroId, macroName, repeats, trackMoves, executionSpeed, steps }) {
  const currentState = await getRuntimeExecutionState();
  if (currentState?.isRunning) {
    return { ok: false, error: "already_running", state: currentState };
  }

  if (!Number.isInteger(tabId)) {
    return { ok: false, error: "tab_id_required" };
  }

  // Проверяем доступность страницы повторно непосредственно перед исполнением.
  if (!(await canOperateOnTab(tabId))) {
    await showRestrictedNotice(tabId);
    return { ok: false, error: "page_blocked" };
  }

  if (!Array.isArray(steps) || !steps.length) {
    return { ok: false, error: "empty_steps" };
  }

  const totalSteps = steps.length * repeats;
  const state = {
    isRunning: true,
    macroId,
    macroName,
    tabId,
    repeats,
    startedAt: Date.now(),
    completedSteps: 0,
    totalSteps,
    remainingMs: totalSteps * 1000
  };
  await writeExecutionState(state);
  await syncActionBadge();

  try {
    const tabResponse = await ext.tabs.sendMessage(tabId, {
      type: "execution-run",
      macroId,
      macroName,
      repeats,
      steps,
      trackMoves,
      executionSpeed: executionSpeed ?? 1
    });
    if (!tabResponse?.ok) {
      await clearExecutionState();
      await syncActionBadge();
      return { ok: false, error: tabResponse?.error ?? "execution_run_failed" };
    }
  } catch {
    await clearExecutionState();
    await syncActionBadge();
    return { ok: false, error: "tab_unreachable" };
  }

  return {
    ok: true,
    state: {
      isRunning: true,
      macroId: state.macroId,
      macroName: state.macroName,
      tabId: state.tabId,
      repeats: state.repeats,
      startedAt: state.startedAt,
      completedSteps: state.completedSteps,
      totalSteps: state.totalSteps,
      remainingMs: state.remainingMs
    }
  };
}

async function setActionBadgeText(text) {
  await ext.action.setBadgeText({ text });
  if (text) {
    await ext.action.setBadgeBackgroundColor({ color: BADGE_BACKGROUND_COLOR });
    if (typeof ext.action.setBadgeTextColor === "function") {
      await ext.action.setBadgeTextColor({ color: BADGE_TEXT_COLOR });
    }
  }
}

function clearShortcutHintTimer() {
  if (shortcutHintTimerId !== null) {
    clearTimeout(shortcutHintTimerId);
    shortcutHintTimerId = null;
  }
}

async function getRuntimeExecutionState() {
  const state = await readExecutionState();
  if (!state?.isRunning) {
    return null;
  }

  return {
    isRunning: true,
    macroId: state.macroId ?? null,
    macroName: typeof state.macroName === "string" ? state.macroName : "macros",
    tabId: Number.isInteger(state.tabId) ? state.tabId : null,
    repeats: Number.isFinite(Number(state.repeats)) ? Number(state.repeats) : 1,
    startedAt: Number(state.startedAt) || Date.now(),
    completedSteps: Number.isFinite(Number(state.completedSteps)) ? Number(state.completedSteps) : 0,
    totalSteps: Number.isFinite(Number(state.totalSteps)) ? Number(state.totalSteps) : 0,
    remainingMs: Number.isFinite(Number(state.remainingMs)) ? Number(state.remainingMs) : 0
  };
}

// Сопоставляет сообщение об остановке исполнения с типом негативного события.
function resolveStopEventKind(message) {
  if (message?.type === "execution-user-click-interrupt") {
    return "user-click";
  }
  switch (message?.reason) {
    case "target_not_found":
      return "element-not-found";
    case "user_stop":
      return "stopped";
    default:
      return "failed";
  }
}

async function stopExecutionWithEvent(event) {
  await clearExecutionState();
  await writeExecutionLastEvent(event);
  await syncActionBadge();
}

async function sendRecordingListenerMessage(tabId, message) {
  if (!Number.isInteger(tabId)) {
    return { ok: false, error: "tab_id_required" };
  }

  try {
    const response = await ext.tabs.sendMessage(tabId, message);
    return response?.ok ? { ok: true } : { ok: false, error: response?.error ?? "listener_message_failed" };
  } catch {
    return { ok: false, error: "tab_unreachable" };
  }
}

// Открывает обычный popup расширения для конкретной вкладки.
// Временный popup назначается только этой вкладке и сбрасывается после открытия.
async function openMainPopup(tabId, windowId) {
  if (!ext.action || typeof ext.action.openPopup !== "function") {
    return false;
  }

  let winId = windowId;
  if (winId === void 0 && Number.isInteger(tabId)) {
    try {
      const tab = await ext.tabs.get(tabId);
      winId = tab.windowId;
    } catch {}
  }

  try {
    if (Number.isInteger(tabId)) {
      await ext.action.setPopup({ tabId, popup: "popup.html" });
    }
    await ext.action.openPopup(winId !== void 0 ? { windowId: winId } : undefined);
    return true;
  } catch {
    return false;
  } finally {
    if (Number.isInteger(tabId)) {
      await ext.action.setPopup({ tabId, popup: "" });
    }
  }
}

// Клик по иконке: проверяем активную вкладку и открываем обычный popup
// либо отдельный popup с уведомлением о недоступной странице.
async function handleActionClick(tab) {
  const tabId = Number.isInteger(tab?.id) ? tab.id : null;
  if (tabId === null) {
    return;
  }

  if (await canOperateOnTab(tabId)) {
    await openMainPopup(tabId, tab.windowId);
    return;
  }

  await showRestrictedNotice(tabId, tab.windowId);
}

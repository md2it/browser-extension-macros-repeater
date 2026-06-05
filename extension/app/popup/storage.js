function getDisplayMovesValue(macro) {
  return Boolean(macro?.displayMoves ?? macro?.trackMoves);
}

function setEditDisplayMoves(enabled) {
  const displayMovesEnabled = Boolean(enabled);
  refs.editDisplayMoves.checked = displayMovesEnabled;
  refs.editDisplayMovesIcon.innerHTML = displayMovesEnabled ? iconSet.eye : iconSet.eyeOff;
  refs.editDisplayMovesToggle.classList.toggle("display-moves-off", !displayMovesEnabled);
  const displayMovesTitle = displayMovesEnabled ? "Display moves: on" : "Display moves: off";
  refs.editDisplayMovesToggle.setAttribute("title", displayMovesTitle);
  refs.editDisplayMovesToggle.setAttribute("aria-label", displayMovesTitle);
  refs.editDisplayMovesToggle.setAttribute("aria-pressed", String(displayMovesEnabled));
}

function setEditDefault(enabled) {
  const isDefault = Boolean(enabled);
  refs.editDefault.checked = isDefault;
  refs.editDefaultIcon.innerHTML = iconSet.star;
  refs.editDefaultToggle.classList.toggle("active", isDefault);
  refs.editDefaultToggle.setAttribute("aria-pressed", String(isDefault));
}

function buildDefaultMacroName() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 5);
  return `Macro ${date} ${time}`;
}

function createMacroId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `macro-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function sendRuntimeMessage(message) {
  return new Promise((resolve) => {
    ext.runtime.sendMessage(message, (response) => {
      if (ext.runtime.lastError) {
        resolve({ ok: false });
        return;
      }

      resolve(response ?? { ok: false });
    });
  });
}

async function getActiveTab() {
  const tabs = await ext.tabs.query({ active: true, currentWindow: true });
  return tabs[0] ?? null;
}

async function readMacrosFromStorage() {
  try {
    const data = await ext.storage.local.get(STORAGE_KEY);
    const storedMacros = data?.[STORAGE_KEY];
    if (!Array.isArray(storedMacros)) {
      return [];
    }

    return storedMacros
      .filter((item) => item && typeof item.id === "string" && typeof item.name === "string")
      .map((item) => ({
        ...item,
        displayMoves: Boolean(item.displayMoves ?? item.trackMoves),
        trackMoves: Boolean(item.trackMoves)
      }));
  } catch {
    return [];
  }
}

async function readDefaultMacroIdFromStorage() {
  try {
    const data = await ext.storage.local.get(DEFAULT_MACRO_ID_KEY);
    return typeof data?.[DEFAULT_MACRO_ID_KEY] === "string" ? data[DEFAULT_MACRO_ID_KEY] : null;
  } catch {
    return null;
  }
}

async function persistMacros() {
  await ext.storage.local.set({ [STORAGE_KEY]: macros });
}

async function persistDefaultMacroId() {
  await ext.storage.local.set({ [DEFAULT_MACRO_ID_KEY]: defaultMacroId });
}

async function loadMacros() {
  const storedMacros = await readMacrosFromStorage();
  macros.length = 0;
  macros.push(...storedMacros);

  defaultMacroId = await readDefaultMacroIdFromStorage();
  if (defaultMacroId && !macros.some((macro) => macro.id === defaultMacroId)) {
    defaultMacroId = null;
    await persistDefaultMacroId();
  }
}

async function cleanupLegacyTrackMovesSetting() {
  await ext.storage.local.remove("track_moves_enabled");
}

async function setDefaultMacro(macroId, enabled = true) {
  const macro = macros.find((item) => item.id === macroId);
  if (!macro) {
    setStatus("Macros не найден.");
    return;
  }

  defaultMacroId = enabled ? macroId : null;
  await persistDefaultMacroId();
  render();
  setStatus(enabled ? `Дефолтный macros: ${macro.name}` : "Дефолтный macros не задан.");
}

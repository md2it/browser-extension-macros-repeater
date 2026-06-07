
async function init() {
  await cleanupLegacyTrackMovesSetting();
  await initializeLocale();
  await readSettingsFromStorage();
  syncSettingsUI();
  syncPopupLocale();
  await loadMacros();
  const createdMacro = await completeCreateModeIfNeeded();
  render();
  const executionStatus = await refreshExecutionStatus();
  if (createdMacro) {
    openEditModal(createdMacro.id);
    setStatus(t("createCompleted"));
    return;
  }

  // refreshExecutionStatus уже выставил статус по недавнему событию или
  // активному исполнению — не перезаписываем подсказкой.
  if (executionStatus?.lastEvent?.kind) {
    return;
  }

  if (executionStatus?.state?.isRunning) {
    return;
  }

  setStatus(t("initialHint"));
}

init();

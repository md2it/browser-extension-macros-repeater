
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
    openEditModal(createdMacro.id, { selectAll: true });
    setStatus(t("createCompleted"));
    return;
  }

  // Do not replace a recent event or active execution status with the initial hint.
  if (executionStatus?.lastEvent?.kind) {
    return;
  }

  if (executionStatus?.state?.isRunning) {
    return;
  }

  setStatus(t("initialHint"));
}

init();

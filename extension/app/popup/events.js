
refs.list.addEventListener("click", (event) => {
  const target = event.target.closest("button");
  if (!target) {
    return;
  }

  const macroId = target.dataset.id;
  const action = target.dataset.action;
  if (!macroId || !action) {
    return;
  }

  if (action === "run") {
    void startExecution(macroId);
    return;
  }

  if (action === "edit") {
    openEditModal(macroId);
    return;
  }

  if (action === "set-default") {
    void setDefaultMacro(macroId, macroId !== defaultMacroId);
    return;
  }

  if (action === "toggle-display-moves") {
    const macro = macros.find((item) => item.id === macroId);
    if (!macro) {
      setStatus("Macros не найден.");
      return;
    }

    const nextDisplayMoves = !getDisplayMovesValue(macro);
    macro.displayMoves = nextDisplayMoves;
    macro.trackMoves = nextDisplayMoves;
    void persistMacros().then(() => {
      render();
      setStatus(`Display moves ${nextDisplayMoves ? "включен" : "выключен"} для "${macro.name}".`);
    });
    return;
  }

  if (action === "delete") {
    openDeleteModal(macroId);
  }
});

refs.newMacroBtn.addEventListener("click", () => {
  openRecordModeModal();
});

refs.stopExecutionBtn.addEventListener("click", () => {
  void stopExecution();
});

refs.editDisplayMovesToggle.addEventListener("click", () => {
  setEditDisplayMoves(!refs.editDisplayMoves.checked);
});

refs.editDefaultToggle.addEventListener("click", () => {
  setEditDefault(!refs.editDefault.checked);
});

refs.saveEditBtn.addEventListener("click", async () => {
  const name = refs.editName.value.trim();
  if (!name) {
    setStatus("Введите название macros.");
    return;
  }

  const repeats = Number(refs.editRepeats.value);
  const validRepeats = Number.isFinite(repeats) && repeats > 0 ? repeats : 1;
  const displayMoves = Boolean(refs.editDisplayMoves.checked);

  if (state.modalMode === "edit" && state.editMacroId) {
    const macro = macros.find((item) => item.id === state.editMacroId);
    if (!macro) {
      setStatus("Macros не найден для сохранения.");
      closeEditModal();
      return;
    }

    macro.name = name;
    macro.repeats = validRepeats;
    macro.displayMoves = displayMoves;
    macro.trackMoves = displayMoves;
    if (!Array.isArray(macro.steps)) {
      macro.steps = [];
    }
    await persistMacros();
    const nextDefaultMacroId = refs.editDefault.checked ? macro.id : null;
    if (defaultMacroId === macro.id || nextDefaultMacroId === macro.id) {
      defaultMacroId = nextDefaultMacroId;
      await persistDefaultMacroId();
    }
    closeEditModal();
    render();
    setStatus("Macros обновлен.");
    return;
  }

  if (state.modalMode !== "create") {
    setStatus("Сохранение недоступно: режим не выбран.");
    return;
  }

  const createdMacro = {
    id: createMacroId(),
    name,
    repeats: validRepeats,
    displayMoves,
    trackMoves: displayMoves,
    steps: []
  };
  macros.unshift(createdMacro);
  await persistMacros();
  if (refs.editDefault.checked) {
    defaultMacroId = createdMacro.id;
    await persistDefaultMacroId();
  }
  closeEditModal();
  render();
  setStatus("Macros сохранен и добавлен в список.");
});

refs.cancelEditBtn.addEventListener("click", () => {
  closeEditModal();
  setStatus("Редактирование отменено.");
});

refs.confirmDeleteBtn.addEventListener("click", async () => {
  const idx = macros.findIndex((item) => item.id === state.deleteMacroId);
  if (idx < 0) {
    return;
  }

  const deletedMacro = macros[idx];
  macros.splice(idx, 1);
  if (deletedMacro && deletedMacro.id === defaultMacroId) {
    defaultMacroId = null;
    await persistDefaultMacroId();
  }
  await persistMacros();
  closeDeleteModal();
  render();
  setStatus("Macros удален.");
});

refs.cancelDeleteBtn.addEventListener("click", () => {
  closeDeleteModal();
  setStatus("Удаление отменено.");
});

refs.recordCoordsBtn.addEventListener("click", () => {
  void startCreateMode("coordinates");
});

refs.recordSelectorsBtn.addEventListener("click", () => {
  void startCreateMode("selectors");
});

refs.recordCancelBtn.addEventListener("click", () => {
  closeRecordModeModal();
  setStatus("Создание macros отменено.");
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }

  const didClose = closeModalByEscape();
  if (didClose) {
    event.preventDefault();
    event.stopPropagation();
  }
});

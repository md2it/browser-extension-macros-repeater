
registerDocumentOperabilityProbeListener();

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || typeof message.type !== "string") {
    sendResponse({ ok: false, error: "invalid_message" });
    return;
  }

  if (message.type === "execution-run") {
    void runExecution(message)
      .then((result) => sendResponse(result))
      .catch(() => sendResponse({ ok: false, error: "run_failed" }));
    return true;
  }

  if (message.type === "execution-stop") {
    if (!executionState.isRunning) {
      sendResponse({ ok: true, wasRunning: false });
      return;
    }

    executionState.stopRequested = true;
    stopExecutionClickListener();
    sendResponse({ ok: true, wasRunning: true });
    return;
  }

  if (message.type === "recording-listener-start") {
    startRecordingClickListener();
    sendResponse({ ok: true });
    return;
  }

  if (message.type === "recording-listener-stop") {
    stopRecordingClickListener();
    sendResponse({ ok: true });
    return;
  }

  // Проверку доступности страницы обрабатывает отдельный слушатель
  // (registerDocumentOperabilityProbeListener) — здесь её игнорируем.
  if (message.type === PROBE_DOCUMENT_OPERABILITY) {
    return;
  }

  sendResponse({ ok: false, error: "unknown_message_type" });
});

document.addEventListener(
  "keydown",
  (event) => {
    if (event.key === "Escape") {
      if (executionState.isRunning) {
        executionState.stopRequested = true;
        void sendRuntimeMessage({ type: "shortcut-stop-execution" });
      }
      return;
    }

    if (isPrefixShortcut(event)) {
      shortcutState.isPrefixDown = true;
      return;
    }

    if (shortcutState.isWaitingForAction && isPrefixActionKey(event)) {
      stopWaitingForShortcutAction();
      void sendRuntimeMessage({ type: "shortcut-run-default" });
    }
  },
  true
);

void sendRuntimeMessage({ type: "recording-status" }).then((response) => {
  if (response?.ok && response.isActive) {
    startRecordingClickListener();
  }
});

document.addEventListener(
  "keyup",
  (event) => {
    if (!shortcutState.isPrefixDown) {
      return;
    }
    // Ждём, пока модификаторы (Cmd/Ctrl + Shift) будут полностью отпущены.
    // На macOS keyup буквенной клавиши подавляется, пока удержан Cmd,
    // поэтому ориентируемся на отпускание модификаторов, а не самой буквы.
    if (isPrefixChordHeld(event)) {
      return;
    }
    shortcutState.isPrefixDown = false;
    startWaitingForShortcutAction();
  },
  true
);

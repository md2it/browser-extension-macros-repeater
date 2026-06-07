var welcomePinWatchers = new Map();

function stopWelcomePinWatcher(tabId) {
  const stop = welcomePinWatchers.get(tabId);
  if (stop) stop();
  welcomePinWatchers.delete(tabId);
}

function notifyWelcomePinned(tabId, messageType) {
  ext.tabs.sendMessage(tabId, { type: messageType, pinned: true }).catch(() => {});
  stopWelcomePinWatcher(tabId);
}

function watchWelcomePinStatus(tabId, config) {
  stopWelcomePinWatcher(tabId);
  isActionOnToolbar(ext.action).then((pinned) => {
    if (pinned === true) notifyWelcomePinned(tabId, config.pinStatusChangedMessageType);
  });
  const stop = onActionToolbarChanged(ext.action, (pinned) => {
    if (!pinned) return;
    notifyWelcomePinned(tabId, config.pinStatusChangedMessageType);
  });
  welcomePinWatchers.set(tabId, stop);
}

async function openWelcomeTab(config, data) {
  await ext.storage.session.set({ [config.sessionDataKey]: data });
  try {
    await ext.tabs.create({ url: ext.runtime.getURL(config.pageHtml), active: true });
  } catch (err) {
    console.error("[" + config.logLabel + "] welcome tab failed:", err);
  }
}

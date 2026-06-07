function stopWelcomePinWatcher2(tabId) {
  stopWelcomePinWatcher(tabId);
}

function watchWelcomePinStatus2(tabId) {
  watchWelcomePinStatus(tabId, WELCOME_PIN_WATCH_CONFIG);
}

async function showWelcome() {
  const locale = await getLocaleForWelcome();
  const manifest = ext.runtime.getManifest();
  const isPinned = await isActionOnToolbar(ext.action);
  await openWelcomeTab(
    WELCOME_TAB_CONFIG,
    buildWelcomeData(locale, manifest.name, { isPinned })
  );
}

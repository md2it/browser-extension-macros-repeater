async function isActionOnToolbar(action) {
  if (typeof action.getUserSettings !== "function") return null;
  try {
    const settings = await action.getUserSettings();
    return settings.isOnToolbar === true;
  } catch {
    return null;
  }
}

function onActionToolbarChanged(action, listener) {
  const handler = (change) => {
    if (typeof change.isOnToolbar === "boolean") {
      listener(change.isOnToolbar);
    }
  };
  if (typeof action.onUserSettingsChanged?.addListener === "function") {
    action.onUserSettingsChanged.addListener(handler);
    return () => action.onUserSettingsChanged?.removeListener(handler);
  }
  let stopped = false;
  const poll = async () => {
    while (!stopped) {
      const pinned = await isActionOnToolbar(action);
      if (pinned === true) { listener(true); return; }
      await new Promise((resolve) => globalThis.setTimeout(resolve, 750));
    }
  };
  void poll();
  return () => { stopped = true; };
}

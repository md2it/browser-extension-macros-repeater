const RECORDING_SESSION_KEY = "recording_session";

function buildMacroName(domain) {
  const date = new Date().toISOString().slice(0, 10);
  return `${domain} ${date}`;
}

function getDomainFromUrl(rawUrl) {
  if (typeof rawUrl !== "string" || !rawUrl) {
    return "unknown";
  }

  try {
    const url = new URL(rawUrl);
    return url.hostname.replace(/^www\./, "") || "unknown";
  } catch {
    return "unknown";
  }
}

async function readSession() {
  const data = await chrome.storage.local.get(RECORDING_SESSION_KEY);
  return data?.[RECORDING_SESSION_KEY] ?? null;
}

async function writeSession(session) {
  await chrome.storage.local.set({ [RECORDING_SESSION_KEY]: session });
}

async function clearSession() {
  await chrome.storage.local.remove(RECORDING_SESSION_KEY);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || typeof message.type !== "string") {
    sendResponse({ ok: false, error: "invalid_message" });
    return;
  }

  if (message.type === "recording-start") {
    (async () => {
      const mode = message.mode === "selectors" ? "selectors" : "coordinates";
      const tabId = Number.isInteger(message.tabId) ? message.tabId : null;
      if (tabId === null) {
        sendResponse({ ok: false, error: "tab_id_required" });
        return;
      }

      const session = {
        isActive: true,
        mode,
        tabId,
        domain: getDomainFromUrl(message.url),
        steps: []
      };

      await writeSession(session);
      sendResponse({ ok: true });
    })().catch(() => sendResponse({ ok: false, error: "start_failed" }));

    return true;
  }

  if (message.type === "recording-stop") {
    (async () => {
      const session = await readSession();
      if (!session?.isActive) {
        sendResponse({ ok: true, hasSession: false });
        return;
      }

      await clearSession();
      sendResponse({
        ok: true,
        hasSession: true,
        mode: session.mode,
        macroName: buildMacroName(session.domain),
        steps: Array.isArray(session.steps) ? session.steps : []
      });
    })().catch(() => sendResponse({ ok: false, error: "stop_failed" }));

    return true;
  }

  if (message.type === "recording-click") {
    (async () => {
      const session = await readSession();
      if (!session?.isActive) {
        sendResponse({ ok: true, ignored: true, reason: "inactive" });
        return;
      }

      if (!sender?.tab || sender.tab.id !== session.tabId) {
        sendResponse({ ok: true, ignored: true, reason: "other_tab" });
        return;
      }

      const steps = Array.isArray(session.steps) ? session.steps : [];
      if (session.mode === "selectors") {
        if (typeof message.selector !== "string" || !message.selector.trim()) {
          sendResponse({ ok: true, ignored: true, reason: "invalid_selector" });
          return;
        }

        steps.push(message.selector.trim());
      } else {
        const x = Number(message.x);
        const y = Number(message.y);
        if (!Number.isFinite(x) || !Number.isFinite(y)) {
          sendResponse({ ok: true, ignored: true, reason: "invalid_coords" });
          return;
        }

        steps.push(`${Math.round(x)},${Math.round(y)}`);
      }

      await writeSession({ ...session, steps });
      sendResponse({ ok: true });
    })().catch(() => sendResponse({ ok: false, error: "record_failed" }));

    return true;
  }

  if (message.type === "recording-status") {
    (async () => {
      const session = await readSession();
      sendResponse({ ok: true, isActive: Boolean(session?.isActive) });
    })().catch(() => sendResponse({ ok: false, isActive: false }));

    return true;
  }

  sendResponse({ ok: false, error: "unknown_message_type" });
});

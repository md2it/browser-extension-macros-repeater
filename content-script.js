function buildSelector(element) {
  if (!(element instanceof Element)) {
    return "";
  }

  if (element.id) {
    return `#${CSS.escape(element.id)}`;
  }

  const parts = [];
  let current = element;

  while (current && current.nodeType === Node.ELEMENT_NODE && parts.length < 6) {
    const tagName = current.tagName.toLowerCase();
    const parent = current.parentElement;
    if (!parent) {
      parts.unshift(tagName);
      break;
    }

    const sameTagSiblings = Array.from(parent.children).filter(
      (child) => child.tagName === current.tagName
    );
    const index = sameTagSiblings.indexOf(current) + 1;
    const part = sameTagSiblings.length > 1 ? `${tagName}:nth-of-type(${index})` : tagName;
    parts.unshift(part);

    current = parent;
  }

  return parts.join(" > ");
}

function getEventElement(event) {
  if (event.target instanceof Element) {
    return event.target;
  }

  if (typeof event.composedPath === "function") {
    const path = event.composedPath();
    const firstElement = path.find((item) => item instanceof Element);
    if (firstElement instanceof Element) {
      return firstElement;
    }
  }

  return null;
}

const HUMAN_MM_IN_PX = 4;
const HUMAN_STEP_MIN_DELAY_MS = 500;
const HUMAN_STEP_MAX_DELAY_MS = 1000;
const HUMAN_MOVE_MIN_DELAY_MS = 8;
const HUMAN_MOVE_MAX_DELAY_MS = 22;
const VIEWPORT_EDGE_PADDING = 2;

const executionState = {
  isRunning: false,
  stopRequested: false,
  token: 0,
  lastPoint: null
};

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function normalizeViewportPoint(point) {
  const maxX = Math.max(VIEWPORT_EDGE_PADDING, window.innerWidth - VIEWPORT_EDGE_PADDING);
  const maxY = Math.max(VIEWPORT_EDGE_PADDING, window.innerHeight - VIEWPORT_EDGE_PADDING);
  return {
    x: clamp(point.x, VIEWPORT_EDGE_PADDING, maxX),
    y: clamp(point.y, VIEWPORT_EDGE_PADDING, maxY)
  };
}

function getInitialPoint() {
  return normalizeViewportPoint({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2
  });
}

function parseCoordinateStep(step) {
  if (typeof step !== "string") {
    return null;
  }

  const match = step.trim().match(/^(-?\d+)\s*,\s*(-?\d+)$/);
  if (!match) {
    return null;
  }

  const x = Number(match[1]);
  const y = Number(match[2]);
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return null;
  }

  return normalizeViewportPoint({ x, y });
}

function getRandomPointInElement(element) {
  const rect = element.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) {
    return null;
  }

  return normalizeViewportPoint({
    x: randomBetween(rect.left, rect.right),
    y: randomBetween(rect.top, rect.bottom)
  });
}

function resolveStepPoint(step) {
  const coordinatePoint = parseCoordinateStep(step);
  if (coordinatePoint) {
    return coordinatePoint;
  }

  if (typeof step !== "string" || !step.trim()) {
    return null;
  }

  let element = null;
  try {
    element = document.querySelector(step);
  } catch {
    return null;
  }

  if (!(element instanceof Element)) {
    return null;
  }

  return getRandomPointInElement(element);
}

function buildHumanPath(startPoint, endPoint) {
  const from = normalizeViewportPoint(startPoint);
  const to = normalizeViewportPoint(endPoint);
  const deltaX = to.x - from.x;
  const deltaY = to.y - from.y;
  const distance = Math.hypot(deltaX, deltaY);
  const segments = clamp(Math.round(distance / 16) + 8, 10, 48);
  const deviation = clamp(distance * 0.05, 1.5, 8);
  const path = [];

  for (let index = 1; index <= segments; index += 1) {
    const t = index / segments;
    const ease = t * t * (3 - 2 * t);
    const waveX = Math.sin(t * Math.PI * 2) * randomBetween(-deviation, deviation);
    const waveY = Math.cos(t * Math.PI * 2) * randomBetween(-deviation, deviation);
    path.push(
      normalizeViewportPoint({
        x: from.x + deltaX * ease + waveX,
        y: from.y + deltaY * ease + waveY
      })
    );
  }

  path[path.length - 1] = to;
  return path;
}

function dispatchMouseMove(point) {
  const normalized = normalizeViewportPoint(point);
  const target = document.elementFromPoint(normalized.x, normalized.y) || document.documentElement;
  const init = {
    bubbles: true,
    cancelable: true,
    composed: true,
    clientX: normalized.x,
    clientY: normalized.y,
    screenX: window.screenX + normalized.x,
    screenY: window.screenY + normalized.y
  };

  target.dispatchEvent(
    new PointerEvent("pointermove", {
      ...init,
      pointerId: 1,
      pointerType: "mouse",
      isPrimary: true,
      buttons: 0
    })
  );
  target.dispatchEvent(
    new MouseEvent("mousemove", {
      ...init,
      buttons: 0
    })
  );
}

function dispatchMouseClick(point) {
  const normalized = normalizeViewportPoint(point);
  const target = document.elementFromPoint(normalized.x, normalized.y) || document.documentElement;
  const init = {
    bubbles: true,
    cancelable: true,
    composed: true,
    clientX: normalized.x,
    clientY: normalized.y,
    screenX: window.screenX + normalized.x,
    screenY: window.screenY + normalized.y,
    button: 0,
    buttons: 1,
    detail: 1
  };

  target.dispatchEvent(
    new PointerEvent("pointerdown", {
      ...init,
      pointerId: 1,
      pointerType: "mouse",
      isPrimary: true
    })
  );
  target.dispatchEvent(new MouseEvent("mousedown", init));
  target.dispatchEvent(
    new PointerEvent("pointerup", {
      ...init,
      pointerId: 1,
      pointerType: "mouse",
      isPrimary: true,
      buttons: 0
    })
  );
  target.dispatchEvent(new MouseEvent("mouseup", { ...init, buttons: 0 }));
  target.dispatchEvent(new MouseEvent("click", { ...init, buttons: 0 }));
}

function applyClickOffset(point) {
  return normalizeViewportPoint({
    x: point.x + randomBetween(-HUMAN_MM_IN_PX, HUMAN_MM_IN_PX),
    y: point.y + randomBetween(-HUMAN_MM_IN_PX, HUMAN_MM_IN_PX)
  });
}

function shouldStop(token) {
  return !executionState.isRunning || executionState.stopRequested || executionState.token !== token;
}

async function runStep(token, fromPoint, step) {
  const stepPoint = resolveStepPoint(step);
  if (!stepPoint) {
    return fromPoint;
  }

  const path = buildHumanPath(fromPoint, stepPoint);
  for (const point of path) {
    if (shouldStop(token)) {
      return point;
    }

    dispatchMouseMove(point);
    await sleep(randomBetween(HUMAN_MOVE_MIN_DELAY_MS, HUMAN_MOVE_MAX_DELAY_MS));
  }

  if (shouldStop(token)) {
    return stepPoint;
  }

  const clickPoint = applyClickOffset(stepPoint);
  dispatchMouseClick(clickPoint);
  return clickPoint;
}

async function runExecution(payload) {
  if (executionState.isRunning) {
    return { ok: false, error: "already_running" };
  }

  const macroId = typeof payload?.macroId === "string" ? payload.macroId : "";
  const macroName = typeof payload?.macroName === "string" && payload.macroName.trim() ? payload.macroName.trim() : "macros";
  const repeats = Number.isFinite(Number(payload?.repeats)) && Number(payload.repeats) > 0 ? Math.floor(Number(payload.repeats)) : 1;
  const steps = Array.isArray(payload?.steps) ? payload.steps.filter((step) => typeof step === "string" && step.trim()) : [];
  if (steps.length === 0) {
    return { ok: false, error: "empty_steps" };
  }

  executionState.isRunning = true;
  executionState.stopRequested = false;
  executionState.token += 1;
  const token = executionState.token;
  executionState.lastPoint = executionState.lastPoint ?? getInitialPoint();
  const totalSteps = repeats * steps.length;
  let completedSteps = 0;

  void chrome.runtime.sendMessage({
    type: "execution-progress",
    macroId,
    macroName,
    completedSteps,
    totalSteps,
    remainingMs: totalSteps * HUMAN_STEP_MAX_DELAY_MS
  });

  (async () => {
    try {
      for (let repeatIndex = 0; repeatIndex < repeats; repeatIndex += 1) {
        for (const step of steps) {
          if (shouldStop(token)) {
            throw new Error("stopped");
          }

          executionState.lastPoint = await runStep(token, executionState.lastPoint ?? getInitialPoint(), step);
          completedSteps += 1;
          const remainingSteps = Math.max(0, totalSteps - completedSteps);

          void chrome.runtime.sendMessage({
            type: "execution-progress",
            macroId,
            macroName,
            completedSteps,
            totalSteps,
            remainingMs: remainingSteps * HUMAN_STEP_MAX_DELAY_MS
          });

          if (remainingSteps > 0) {
            await sleep(randomBetween(HUMAN_STEP_MIN_DELAY_MS, HUMAN_STEP_MAX_DELAY_MS));
          }
        }
      }

      void chrome.runtime.sendMessage({
        type: "execution-completed",
        macroId,
        macroName
      });
    } catch (error) {
      const stopReason = error instanceof Error && error.message === "stopped" ? "user_stop" : "execution_error";
      void chrome.runtime.sendMessage({
        type: "execution-stopped",
        macroId,
        macroName,
        reason: stopReason
      });
    } finally {
      if (executionState.token === token) {
        executionState.isRunning = false;
        executionState.stopRequested = false;
      }
    }
  })();

  return { ok: true };
}

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
    sendResponse({ ok: true, wasRunning: true });
    return;
  }

  sendResponse({ ok: false, error: "unknown_message_type" });
});

document.addEventListener(
  "click",
  (event) => {
    if (executionState.isRunning && event.isTrusted) {
      executionState.stopRequested = true;
      void chrome.runtime.sendMessage({ type: "execution-user-click-interrupt" });
      return;
    }

    const target = getEventElement(event);
    const selector = target ? buildSelector(target) : "";

    void chrome.runtime.sendMessage({
      type: "recording-click",
      x: event.clientX,
      y: event.clientY,
      selector
    });
  },
  true
);

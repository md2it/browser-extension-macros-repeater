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

document.addEventListener(
  "click",
  (event) => {
    const target = event.target instanceof Element ? event.target : null;
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

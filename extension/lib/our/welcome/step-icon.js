function welcomeStepIcon(raw, size) {
  if (size === undefined) size = 14;
  return raw.replace("<svg ", '<svg width="' + size + '" height="' + size + '" ');
}

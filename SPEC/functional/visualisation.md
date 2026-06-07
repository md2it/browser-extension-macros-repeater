# VISUALISATION

## GENERAL

Two modes are supported:
- Visible
	- Renders and animates the pointer
	- Injects elements into the DOM
- Stealth
	- No visualisation
	- No DOM injection

## VISIBLE

The goal is to show every click and movement of the virtual pointer:

- Minimal overlay using a filled Lucide mouse-pointer icon, `#f00`, 24x24 px
- Represents virtual cursor movement
- On click, changes for 50 ms to mouse-pointer-click, `#f00`, 36x36 px, then returns to the default state

## STEALTH

The goal is to prevent websites from classifying the extension's behavior as automated:

- Does not inject elements into the DOM, except when click visualisation is enabled
- Does not perform obviously suspicious actions
- Is not detected by website security scripts
- Cursor movements and clicks imitate human behavior with slight randomness and unevenness
- Websites should not detect that the extension is present

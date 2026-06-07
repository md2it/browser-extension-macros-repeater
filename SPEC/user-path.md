# USER JOURNEY

## CREATING A MACRO

1. Launch the extension
2. Enable macro creation mode
3. Click items on the page
4. Disable macro creation mode
5. Optionally configure additional macro settings

## EXECUTING A MACRO

1. Open the extension popup
2. Start a specific macro
3. The macro runs:
   1. The popup closes
   2. The cursor moves to the first point or element that has not yet been clicked
   3. Click
   4. Repeat steps 3.2-3.3 for each remaining step
   5. Exit the loop after all steps have been clicked
4. The extension completes automatically:
   1. The popup opens with information that the macro has completed

### User interruption
- Any user click in the browser interrupts an executing macro
- Switching to another OS window outside the browser does not affect execution
- Clicks outside the browser do not affect execution

### Launch by shortcut
- If a default macro exists, the shortcut starts it. Step 1 is omitted, step 2 is the shortcut itself, and the remaining steps are unchanged

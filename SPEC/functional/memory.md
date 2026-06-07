# MEMORY USAGE

## GOAL

- Store only the data required by the functional and UI capabilities
- Protect memory efficiency and privacy

## STORED DATA

### Persistent

- Macro list and settings: name, repeat count, steps, and display mode
- Which macro is the default

### Temporary (for the session)

- Active recording state: whether recording is active, the tab where it is active, and the steps collected so far
- Active execution state: whether execution is active, which macro is running, completed step count, and remaining step count
- Result of the latest execution: completed successfully, stopped, or failed. Stored until the popup is opened for the first time, then deleted

## DELETED DATA

- Deleting a macro removes all of its data, including default status if assigned
- Recording session data is removed when recording ends
- Execution session data is removed when execution ends
- Obsolete settings from previous extension versions are removed automatically

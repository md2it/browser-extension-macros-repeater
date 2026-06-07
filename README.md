# MACROS REPEATER

=-=-=-=-=-=-=-=-= | [DE](./READMIES/DE.md) | EN | [ES](./READMIES/ES.md) | [FR](./READMIES/FR.md) | [RU](./READMIES/RU.md) | [中文](./READMIES/ZH.md) | [عربي](./READMIES/AR.md) | =-=-=-=-=-=-=-=-=

## INSTALLATION

### Stores

Store versions are not published yet.

### Development mode

Load the entire [`extension`](./extension) directory as an unpacked extension.

## DESCRIPTION

Macros Repeater records clicks on a web page and repeats them later.

Create a macro once, configure how it should run, and launch it from the extension popup or with a keyboard shortcut. Macros can target recorded coordinates or page elements.

## KEY FEATURES

- Record click sequences on web pages
- Run macros in Position or Element mode
- Visible and Stealth execution
- Repeat a complete macro up to 999 times
- Four execution speed settings
- Set one macro as default and launch it with a shortcut
- Edit, delete, and reorder saved macros
- Light and dark themes

## PRIVACY

- No data collection
- No tracking
- No network requests
- Macros and settings are stored locally in the browser

## INTERFACE LANGUAGES

- English
- Russian
- Spanish
- French
- German
- Simplified Chinese
- Arabic

## USAGE

### Create a macro

1. Open the extension popup
2. Start macro creation
3. Click the required points or elements on the page
4. Click the extension icon again
5. Name and configure the macro, then save it

### Run a macro

1. Open the extension popup
2. Start the required macro
3. The extension repeats the recorded clicks and reports the result

A user click or `Esc` stops execution. A default macro can also be launched with `Ctrl+Shift+X` → `M` or, on Mac, `Cmd+Shift+X` → `M`.

See [all user paths](./SPEC/user-path.md) for more details.

## LIMITATIONS

- Browser extensions cannot operate on browser system pages or protected websites
- Element mode depends on recorded elements remaining available on the page
- Position mode depends on the relevant content remaining at the recorded coordinates
- Website changes may prevent an older macro from completing
- The extension records and repeats clicks only

## LICENSE

[MIT License](./LICENSE)

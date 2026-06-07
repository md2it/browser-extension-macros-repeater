# RESPONSES TO MODERATOR QUESTIONS


## Single purpose
Macros Repeater records a user-defined sequence of clicks on the current web page and repeats that sequence when the user starts the saved macro. Users can configure the target mode, visibility, repeat count, and execution speed, and can stop execution at any time. Macros and preferences are stored locally in the browser. The extension does not collect data, track users, or send page content to any server.

## Permission justification
- `storage`
  Save macros and preferences locally, including recorded click coordinates and element selectors, macro names, repeat counts, execution options, language, theme, and the default macro. Keep short-lived recording and execution state so the extension can coordinate its popup, background process, and the active page. No data is uploaded or shared.

- `tabs`
  Identify the active tab when the user opens the extension or starts a macro, communicate with the content script in that tab, stop active recording or execution, and open extension-owned notification or welcome pages when required. The extension does not read browsing history or send tab information to external services.

- `host_permissions` (`<all_urls>`)
  Users may need to record and repeat clicks on any website they choose, including localhost, development environments, and public web pages. The content script records clicks only while the user has explicitly started recording and executes only a macro the user explicitly starts. It does not intercept network requests, collect credentials, or transmit page content.

const STORAGE_KEY = "macros_list";
const DEFAULT_MACRO_ID_KEY = "default_macro_id";
const macros = [];
let defaultMacroId = null;

const state = {
  modalMode: null,
  editMacroId: null,
  deleteMacroId: null,
  executionPollTimer: null
};

const refs = {
  popup: document.querySelector(".popup-shell"),
  menu: document.querySelector(".popup-menu"),
  menuButtons: document.querySelectorAll(".popup-menu-btn"),
  pages: document.querySelectorAll("[data-page-content]"),
  list: document.getElementById("macros-list"),
  status: document.getElementById("status-line"),
  stopExecutionBtn: document.getElementById("stop-execution-btn"),
  newMacroBtn: document.getElementById("new-macro-btn"),
  editModal: document.getElementById("edit-modal"),
  editModalTitle: document.getElementById("edit-modal-title"),
  editName: document.getElementById("edit-name"),
  editRepeats: document.getElementById("edit-repeats"),
  editDisplayMovesToggle: document.getElementById("edit-display-moves-toggle"),
  editDisplayMovesIcon: document.getElementById("edit-display-moves-icon"),
  editDisplayMoves: document.getElementById("edit-display-moves"),
  editDefaultToggle: document.getElementById("edit-default-toggle"),
  editDefaultIcon: document.getElementById("edit-default-icon"),
  editDefault: document.getElementById("edit-default"),
  editSteps: document.getElementById("edit-steps"),
  deleteModal: document.getElementById("delete-modal"),
  deleteMacroName: document.getElementById("delete-macro-name"),
  saveEditBtn: document.getElementById("save-edit-btn"),
  cancelEditBtn: document.getElementById("cancel-edit-btn"),
  confirmDeleteBtn: document.getElementById("confirm-delete-btn"),
  cancelDeleteBtn: document.getElementById("cancel-delete-btn"),
  recordModeModal: document.getElementById("record-mode-modal"),
  recordCoordsBtn: document.getElementById("record-coords-btn"),
  recordSelectorsBtn: document.getElementById("record-selectors-btn"),
  recordCancelBtn: document.getElementById("record-cancel-btn")
};

const iconSet = globalThis.macrosRepeaterLucideIcons;

// Centralized editor mode state
// Editor mode is toggled via the TopBar button and persisted in localStorage

export function isEditorMode() {
  return localStorage.getItem("xps-editor-mode") === "true";
}

export function setEditorMode(enabled) {
  localStorage.setItem("xps-editor-mode", enabled ? "true" : "false");
  window.dispatchEvent(new CustomEvent("xps-editor-mode-change", { detail: { enabled } }));
}

export function toggleEditorMode() {
  const next = !isEditorMode();
  setEditorMode(next);
  return next;
}
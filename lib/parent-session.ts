import {
  clearPrototypeSessionState,
  clearLegacyPersistentPrototypeState,
} from "@/lib/services/local-state";

const SESSION_KEY =
  "liio-parent-session";

export function startParentSession() {
  clearLegacyPersistentPrototypeState();

  window.sessionStorage.setItem(
    SESSION_KEY,
    "active",
  );
}

export function endParentSession() {
  clearPrototypeSessionState();
}

export function isParentSessionActive() {
  return (
    window.sessionStorage.getItem(
      SESSION_KEY,
    ) === "active"
  );
}

export function restoreParentSessionIfAllowed(
  hasProfile: boolean,
) {
  return (
    hasProfile &&
    isParentSessionActive()
  );
}

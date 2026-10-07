import {
  clearPrototypeSessionState,
  purgeLegacyPersistentPrototypeState,
} from "@/lib/services/local-state";

const SESSION_KEY =
  "liio-parent-session";

export function startParentSession() {
  purgeLegacyPersistentPrototypeState();

  window.sessionStorage.setItem(
    SESSION_KEY,
    "active",
  );

  document.cookie =
    "liio_parent_session=; Path=/; Max-Age=0; SameSite=Lax";
}

export function endParentSession() {
  clearPrototypeSessionState();
}

export function isParentSessionActive() {
  purgeLegacyPersistentPrototypeState();

  return (
    window.sessionStorage.getItem(
      SESSION_KEY,
    ) === "active"
  );
}

export function restoreParentSessionIfAllowed(
  hasProfile: boolean,
) {
  if (isParentSessionActive()) {
    return true;
  }

  if (!hasProfile) {
    return false;
  }

  startParentSession();
  return true;
}

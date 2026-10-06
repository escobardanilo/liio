const SESSION_COOKIE = "liio_parent_session";
const SIGNED_OUT_KEY = "liio-parent-signed-out";
const LEGACY_SESSION_KEY = "liio-parent-session";

function hasCookie(name: string, value: string) {
  return document.cookie
    .split(";")
    .map((part) => part.trim())
    .some((part) => part === `${name}=${value}`);
}

export function startParentSession() {
  document.cookie =
    `${SESSION_COOKIE}=active; Path=/; SameSite=Lax`;

  window.localStorage.removeItem(SIGNED_OUT_KEY);
  window.localStorage.removeItem(LEGACY_SESSION_KEY);
  window.sessionStorage.removeItem(LEGACY_SESSION_KEY);
}

export function endParentSession() {
  document.cookie =
    `${SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;

  window.localStorage.setItem(SIGNED_OUT_KEY, "true");
  window.localStorage.removeItem(LEGACY_SESSION_KEY);
  window.sessionStorage.removeItem(LEGACY_SESSION_KEY);
}

export function isParentSessionActive() {
  if (hasCookie(SESSION_COOKIE, "active")) {
    return true;
  }

  const legacyLocalSession =
    window.localStorage.getItem(LEGACY_SESSION_KEY) === "active";

  const legacyTabSession =
    window.sessionStorage.getItem(LEGACY_SESSION_KEY) === "active";

  if (legacyLocalSession || legacyTabSession) {
    startParentSession();
    return true;
  }

  return false;
}

export function restoreParentSessionIfAllowed(hasProfile: boolean) {
  if (isParentSessionActive()) {
    return true;
  }

  if (!hasProfile) {
    return false;
  }

  const explicitlySignedOut =
    window.localStorage.getItem(SIGNED_OUT_KEY) === "true";

  if (explicitlySignedOut) {
    return false;
  }

  startParentSession();
  return true;
}

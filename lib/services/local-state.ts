import type {
  ParentProfile,
} from "@/lib/domain/family";

export type ActiveChildProfile = {
  childId: string | null;
  name: string | null;
  initial: string;
  age: number;
  pairedAt: string;
};

export type StoredPairingCode = {
  code: string;
  expiresAt: string;
};

const PARENT_PROFILE_KEY =
  "liio-parent-profile";
const SELECTED_CHILD_KEY =
  "liio-selected-child-id";
const ACTIVE_CHILD_KEY =
  "liio-active-child-profile";
const FAMILY_CODE_KEY =
  "liio-family-device-code";

const PERSISTENT_KEYS_TO_KEEP = new Set([
  "liio-ui-language",
]);

let legacyStoragePurged = false;

export function purgeLegacyPersistentPrototypeState() {
  if (legacyStoragePurged) {
    return;
  }

  legacyStoragePurged = true;

  try {
    const keys: string[] = [];

    for (
      let index = 0;
      index < window.localStorage.length;
      index += 1
    ) {
      const key =
        window.localStorage.key(index);

      if (
        key?.startsWith("liio-") &&
        !PERSISTENT_KEYS_TO_KEEP.has(key)
      ) {
        keys.push(key);
      }
    }

    for (const key of keys) {
      window.localStorage.removeItem(key);
    }

    document.cookie =
      "liio_parent_session=; Path=/; Max-Age=0; SameSite=Lax";
  } catch {
    // Prototype state still works from sessionStorage.
  }
}

function readJson<T>(
  key: string,
): T | null {
  purgeLegacyPersistentPrototypeState();

  try {
    const raw =
      window.sessionStorage.getItem(key);

    return raw
      ? (JSON.parse(raw) as T)
      : null;
  } catch {
    return null;
  }
}

export function clearPrototypeSessionState() {
  try {
    const keys: string[] = [];

    for (
      let index = 0;
      index < window.sessionStorage.length;
      index += 1
    ) {
      const key =
        window.sessionStorage.key(index);

      if (key?.startsWith("liio-")) {
        keys.push(key);
      }
    }

    for (const key of keys) {
      window.sessionStorage.removeItem(key);
    }
  } catch {
    // Nothing else to clear.
  }

  purgeLegacyPersistentPrototypeState();

  document.cookie =
    "liio_parent_session=; Path=/; Max-Age=0; SameSite=Lax";
}

export function getParentProfile() {
  return readJson<ParentProfile>(
    PARENT_PROFILE_KEY,
  );
}

export function saveParentProfile(
  profile: ParentProfile,
) {
  purgeLegacyPersistentPrototypeState();

  window.sessionStorage.setItem(
    PARENT_PROFILE_KEY,
    JSON.stringify(profile),
  );
}

export function getSelectedChildId() {
  purgeLegacyPersistentPrototypeState();

  return window.sessionStorage.getItem(
    SELECTED_CHILD_KEY,
  );
}

export function setSelectedChildId(
  childId: string | null,
) {
  purgeLegacyPersistentPrototypeState();

  if (childId) {
    window.sessionStorage.setItem(
      SELECTED_CHILD_KEY,
      childId,
    );
    return;
  }

  window.sessionStorage.removeItem(
    SELECTED_CHILD_KEY,
  );
}

export function getActiveChildProfile() {
  return readJson<ActiveChildProfile>(
    ACTIVE_CHILD_KEY,
  );
}

export function saveActiveChildProfile(
  profile: ActiveChildProfile,
) {
  purgeLegacyPersistentPrototypeState();

  window.sessionStorage.setItem(
    ACTIVE_CHILD_KEY,
    JSON.stringify(profile),
  );
}

export function getStoredPairingCode() {
  return readJson<StoredPairingCode>(
    FAMILY_CODE_KEY,
  );
}

export function saveStoredPairingCode(
  code: StoredPairingCode,
) {
  purgeLegacyPersistentPrototypeState();

  window.sessionStorage.setItem(
    FAMILY_CODE_KEY,
    JSON.stringify(code),
  );
}

export function clearStoredPairingCode() {
  purgeLegacyPersistentPrototypeState();

  window.sessionStorage.removeItem(
    FAMILY_CODE_KEY,
  );
}

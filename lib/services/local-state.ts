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

function readJson<T>(key: string): T | null {
  try {
    const raw =
      window.localStorage.getItem(key);

    return raw
      ? (JSON.parse(raw) as T)
      : null;
  } catch {
    return null;
  }
}

export function getParentProfile() {
  return readJson<ParentProfile>(
    PARENT_PROFILE_KEY,
  );
}

export function saveParentProfile(
  profile: ParentProfile,
) {
  window.localStorage.setItem(
    PARENT_PROFILE_KEY,
    JSON.stringify(profile),
  );
}

export function getSelectedChildId() {
  return window.localStorage.getItem(
    SELECTED_CHILD_KEY,
  );
}

export function setSelectedChildId(
  childId: string | null,
) {
  if (childId) {
    window.localStorage.setItem(
      SELECTED_CHILD_KEY,
      childId,
    );
    return;
  }

  window.localStorage.removeItem(
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
  window.localStorage.setItem(
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
  window.localStorage.setItem(
    FAMILY_CODE_KEY,
    JSON.stringify(code),
  );
}

export function clearStoredPairingCode() {
  window.localStorage.removeItem(
    FAMILY_CODE_KEY,
  );
}

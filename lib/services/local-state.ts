import type {
  FamilyIdentity,
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

const LANGUAGE_KEY =
  "liio-ui-language";

const PARENT_PROFILE_KEY =
  "liio-parent-profile";

const FAMILY_IDENTITY_KEY =
  "liio-family-identity";

const CHILDREN_KEY =
  "liio-parent-child-profiles";

const SELECTED_CHILD_KEY =
  "liio-selected-child-id";

const ACTIVE_CHILD_KEY =
  "liio-active-child-profile";

const FAMILY_CODE_KEY =
  "liio-family-device-code";

const DEVICE_KEY =
  "liio-device-identity";

function readJson<T>(
  key: string,
): T | null {
  try {
    const raw =
      window.sessionStorage.getItem(
        key,
      );

    return raw
      ? (JSON.parse(raw) as T)
      : null;
  } catch {
    return null;
  }
}

function writeJson(
  key: string,
  value: unknown,
) {
  window.sessionStorage.setItem(
    key,
    JSON.stringify(value),
  );
}

function removeLiioKeysFrom(
  storage: Storage,
  keepLanguage: boolean,
) {
  const keys: string[] = [];

  for (
    let index = 0;
    index < storage.length;
    index += 1
  ) {
    const key =
      storage.key(index);

    if (
      key?.startsWith("liio-") &&
      !(
        keepLanguage &&
        key === LANGUAGE_KEY
      )
    ) {
      keys.push(key);
    }
  }

  for (const key of keys) {
    storage.removeItem(key);
  }
}

export function clearLegacyPersistentPrototypeState() {
  try {
    removeLiioKeysFrom(
      window.localStorage,
      true,
    );
  } catch {
    // localStorage may be unavailable.
  }

  document.cookie =
    "liio_parent_session=; Path=/; Max-Age=0; SameSite=Lax";
}

export function resetPrototypeFamilyContext() {
  try {
    removeLiioKeysFrom(
      window.sessionStorage,
      false,
    );
  } catch {
    // sessionStorage may be unavailable.
  }

  clearLegacyPersistentPrototypeState();
}

export function clearPrototypeSessionState() {
  resetPrototypeFamilyContext();
}

export function getParentProfile() {
  return readJson<ParentProfile>(
    PARENT_PROFILE_KEY,
  );
}

export function saveParentProfile(
  profile: ParentProfile,
) {
  writeJson(
    PARENT_PROFILE_KEY,
    profile,
  );
}

export function getFamilyIdentity() {
  return readJson<FamilyIdentity>(
    FAMILY_IDENTITY_KEY,
  );
}

export function saveFamilyIdentity(
  identity: FamilyIdentity,
) {
  writeJson(
    FAMILY_IDENTITY_KEY,
    identity,
  );
}

export function getChildrenSnapshot() {
  return (
    readJson<
      Array<{
        id: string;
        name: string;
        age: number;
      }>
    >(CHILDREN_KEY) ?? []
  );
}

export function saveChildrenSnapshot(
  children: Array<{
    id: string;
    name: string;
    age: number;
  }>,
) {
  writeJson(
    CHILDREN_KEY,
    children,
  );
}

export function getSelectedChildId() {
  return (
    window.sessionStorage.getItem(
      SELECTED_CHILD_KEY,
    )
  );
}

export function setSelectedChildId(
  childId: string | null,
) {
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
  profile:
    ActiveChildProfile,
) {
  writeJson(
    ACTIVE_CHILD_KEY,
    profile,
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
  writeJson(
    FAMILY_CODE_KEY,
    code,
  );
}

export function clearStoredPairingCode() {
  window.sessionStorage.removeItem(
    FAMILY_CODE_KEY,
  );
}

export function clearDeviceIdentity() {
  window.sessionStorage.removeItem(
    DEVICE_KEY,
  );
}


export function purgeLegacyPersistentPrototypeState() {
  clearLegacyPersistentPrototypeState();
}

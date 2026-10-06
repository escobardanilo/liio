import { getLiioSupabaseBrowserClient } from "@/lib/data/supabase-browser";
import type {
  ChildProfile,
  FamilyIdentity,
  LiioLanguage,
  ParentProfile,
} from "@/lib/domain/family";
import { assertChildAge } from "@/lib/domain/family";
import { createOpaqueSecret } from "@/lib/security/opaque-secret";

const FAMILY_KEY = "liio-family-identity";
const PARENT_KEY = "liio-parent-profile";
const CHILDREN_KEY = "liio-parent-child-profiles";

function readJson<T>(key: string): T | null {
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getLocalParentProfile() {
  return readJson<ParentProfile>(PARENT_KEY);
}

export function getLocalFamilyIdentity() {
  return readJson<FamilyIdentity>(FAMILY_KEY);
}

export function getLocalChildren() {
  return readJson<ChildProfile[]>(CHILDREN_KEY) ?? [];
}

export function saveLocalChildren(children: ChildProfile[]) {
  writeJson(CHILDREN_KEY, children);
}

export async function ensureFamilyIdentity(
  parent: ParentProfile,
  language: LiioLanguage,
): Promise<FamilyIdentity> {
  const existing = getLocalFamilyIdentity();
  const supabase = getLiioSupabaseBrowserClient();

  if (existing?.mode === "remote") {
    return existing;
  }

  const ownerSecret =
    existing?.ownerSecret ?? createOpaqueSecret();

  if (supabase) {
    const { data, error } = await supabase.rpc(
      "liio_create_family",
      {
        p_owner_secret: ownerSecret,
        p_parent_name: parent.name,
        p_language: language,
      },
    );

    if (!error && typeof data === "string") {
      const identity: FamilyIdentity = {
        familyId: data,
        ownerSecret,
        mode: "remote",
      };

      writeJson(FAMILY_KEY, identity);

      const localChildren = getLocalChildren();

      for (const child of localChildren) {
        await supabase.rpc("liio_upsert_child", {
          p_family_id: identity.familyId,
          p_owner_secret: identity.ownerSecret,
          p_child_id: null,
          p_name: child.name,
          p_age: child.age,
        });
      }

      const { data: remoteChildren } =
        await supabase.rpc(
          "liio_list_children_owner",
          {
            p_family_id: identity.familyId,
            p_owner_secret:
              identity.ownerSecret,
          },
        );

      if (Array.isArray(remoteChildren)) {
        saveLocalChildren(
          remoteChildren as ChildProfile[],
        );
      }

      return identity;
    }
  }

  if (existing) {
    const localIdentity: FamilyIdentity = {
      ...existing,
      mode: "local",
    };

    writeJson(FAMILY_KEY, localIdentity);
    return localIdentity;
  }

  const fallbackIdentity: FamilyIdentity = {
    familyId: crypto.randomUUID(),
    ownerSecret,
    mode: "local",
  };

  writeJson(FAMILY_KEY, fallbackIdentity);
  return fallbackIdentity;
}

export async function listChildren(): Promise<ChildProfile[]> {
  const identity = getLocalFamilyIdentity();
  const supabase = getLiioSupabaseBrowserClient();

  if (identity && supabase) {
    const { data, error } = await supabase.rpc("liio_list_children_owner", {
      p_family_id: identity.familyId,
      p_owner_secret: identity.ownerSecret,
    });

    if (!error && Array.isArray(data)) {
      const children = data as ChildProfile[];
      saveLocalChildren(children);
      return children;
    }
  }

  return getLocalChildren();
}

export async function upsertChild(
  child: Omit<ChildProfile, "id"> & { id?: string | null },
): Promise<ChildProfile> {
  assertChildAge(child.age);

  const identity = getLocalFamilyIdentity();
  const supabase = getLiioSupabaseBrowserClient();

  if (identity && supabase) {
    const { data, error } = await supabase.rpc("liio_upsert_child", {
      p_family_id: identity.familyId,
      p_owner_secret: identity.ownerSecret,
      p_child_id: child.id ?? null,
      p_name: child.name.trim(),
      p_age: child.age,
    });

    if (!error && Array.isArray(data) && data[0]) {
      const saved = data[0] as ChildProfile;
      const localChildren = getLocalChildren();
      const next = child.id
        ? localChildren.map((item) => (item.id === saved.id ? saved : item))
        : [...localChildren.filter((item) => item.id !== saved.id), saved];

      saveLocalChildren(next);
      return saved;
    }
  }

  const saved: ChildProfile = {
    id: child.id ?? crypto.randomUUID(),
    name: child.name.trim(),
    age: child.age,
  };

  const localChildren = getLocalChildren();
  const exists = localChildren.some((item) => item.id === saved.id);
  const next = exists
    ? localChildren.map((item) => (item.id === saved.id ? saved : item))
    : [...localChildren, saved];

  saveLocalChildren(next);
  return saved;
}

export async function deleteChild(childId: string) {
  const identity = getLocalFamilyIdentity();
  const supabase = getLiioSupabaseBrowserClient();

  if (identity && supabase) {
    await supabase.rpc("liio_delete_child", {
      p_family_id: identity.familyId,
      p_owner_secret: identity.ownerSecret,
      p_child_id: childId,
    });
  }

  saveLocalChildren(
    getLocalChildren().filter((child) => child.id !== childId),
  );
}

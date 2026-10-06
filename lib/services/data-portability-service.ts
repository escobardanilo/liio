import {
  getLocalFamilyIdentity,
  listChildren,
} from "@/lib/services/family-service";
import {
  getParentProfile,
} from "@/lib/services/local-state";
import {
  loadTimeSettings,
} from "@/lib/services/settings-service";
import {
  listActivity,
} from "@/lib/services/activity-service";
import { getLiioSupabaseBrowserClient } from "@/lib/data/supabase-browser";

export async function exportLiioFamilyData() {
  const parent = getParentProfile();
  const children = await listChildren();

  const childData = await Promise.all(
    children.map(async (child) => ({
      ...child,
      settings: await loadTimeSettings(
        child.id,
      ),
      activity: await listActivity(
        child.id,
      ),
    })),
  );

  return {
    product: "liio",
    exportedAt: new Date().toISOString(),
    parent,
    children: childData,
  };
}

export function downloadJson(
  filename: string,
  data: unknown,
) {
  const blob = new Blob(
    [JSON.stringify(data, null, 2)],
    {
      type: "application/json",
    },
  );

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  anchor.click();

  URL.revokeObjectURL(url);
}

export async function deleteLiioFamilyData() {
  const identity =
    getLocalFamilyIdentity();

  const supabase =
    getLiioSupabaseBrowserClient();

  if (
    identity?.mode === "remote" &&
    supabase
  ) {
    await supabase.rpc(
      "liio_delete_family",
      {
        p_family_id: identity.familyId,
        p_owner_secret:
          identity.ownerSecret,
      },
    );
  }

  const keys: string[] = [];

  for (
    let index = 0;
    index < window.localStorage.length;
    index += 1
  ) {
    const key =
      window.localStorage.key(index);

    if (key?.startsWith("liio-")) {
      keys.push(key);
    }
  }

  for (const key of keys) {
    window.localStorage.removeItem(key);
  }

  document.cookie =
    "liio_parent_session=; Path=/; Max-Age=0; SameSite=Lax";
}

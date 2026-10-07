import {
  getLocalFamilyIdentity,
  listChildren,
} from "@/lib/services/family-service";
import {
  clearPrototypeSessionState,
  getParentProfile,
  purgeLegacyPersistentPrototypeState,
} from "@/lib/services/local-state";
import {
  loadTimeSettings,
} from "@/lib/services/settings-service";
import {
  listActivity,
} from "@/lib/services/activity-service";
import { getLiioSupabaseBrowserClient } from "@/lib/data/supabase-browser";

export async function exportLiioFamilyData() {
  const parent =
    getParentProfile();

  const children =
    await listChildren();

  const childData =
    await Promise.all(
      children.map(
        async (child) => ({
          ...child,
          settings:
            await loadTimeSettings(
              child.id,
            ),
          activity:
            await listActivity(
              child.id,
            ),
        }),
      ),
    );

  return {
    product: "liio",
    exportedAt:
      new Date()
        .toISOString(),
    parent,
    children: childData,
  };
}

export function downloadJson(
  filename: string,
  data: unknown,
) {
  const blob = new Blob(
    [
      JSON.stringify(
        data,
        null,
        2,
      ),
    ],
    {
      type:
        "application/json",
    },
  );

  const url =
    URL.createObjectURL(blob);

  const anchor =
    document.createElement("a");

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
    identity?.mode ===
      "remote" &&
    supabase
  ) {
    await supabase.rpc(
      "liio_delete_family",
      {
        p_family_id:
          identity.familyId,
        p_owner_secret:
          identity.ownerSecret,
      },
    );
  }

  clearPrototypeSessionState();
  purgeLegacyPersistentPrototypeState();
}

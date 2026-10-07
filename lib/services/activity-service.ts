import { getLiioSupabaseBrowserClient } from "@/lib/data/supabase-browser";
import { getLocalFamilyIdentity } from "@/lib/services/family-service";
import {
  purgeLegacyPersistentPrototypeState,
} from "@/lib/services/local-state";

export type ActivityEvent = {
  id: string;
  eventType: string;
  behavior?: string | null;
  durationMs?: number | null;
  success?: boolean | null;
  promptVersion?: string | null;
  createdAt: string;
};

export async function listActivity(
  childId: string,
): Promise<ActivityEvent[]> {
  purgeLegacyPersistentPrototypeState();

  const identity =
    getLocalFamilyIdentity();

  const supabase =
    getLiioSupabaseBrowserClient();

  if (identity && supabase) {
    const { data, error } =
      await supabase.rpc(
        "liio_list_activity_owner",
        {
          p_family_id:
            identity.familyId,
          p_owner_secret:
            identity.ownerSecret,
          p_child_id: childId,
          p_limit: 50,
        },
      );

    if (
      !error &&
      Array.isArray(data)
    ) {
      return data.map(
        (row) => ({
          id: String(row.id),
          eventType:
            row.event_type
              as string,
          behavior:
            row.behavior
              as string | null,
          durationMs:
            row.duration_ms
              as number | null,
          success:
            row.success
              as boolean | null,
          promptVersion:
            row.prompt_version
              as string | null,
          createdAt:
            row.created_at
              as string,
        }),
      );
    }
  }

  try {
    const stored =
      window.sessionStorage.getItem(
        `liio-activity-${childId}`,
      );

    if (!stored) {
      return [];
    }

    const legacy =
      JSON.parse(stored)
        as Array<{
          id: string;
          durationMinutes?: number;
          title?: string;
        }>;

    return legacy.map(
      (item) => ({
        id: item.id,
        eventType:
          item.title ??
          "learning",
        durationMs:
          (
            item.durationMinutes ??
            0
          ) * 60_000,
        success: true,
        createdAt:
          new Date()
            .toISOString(),
      }),
    );
  } catch {
    return [];
  }
}

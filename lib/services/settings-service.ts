import { getLiioSupabaseBrowserClient } from "@/lib/data/supabase-browser";
import { getLocalFamilyIdentity } from "@/lib/services/family-service";
import {
  purgeLegacyPersistentPrototypeState,
} from "@/lib/services/local-state";

export type TimeSettingsRecord = {
  minutes: number;
  quietStart: string;
  quietEnd: string;
  homework: boolean;
  voice: boolean;
  createWorld: boolean;
  paused: boolean;
};

export const defaultTimeSettings:
  TimeSettingsRecord = {
    minutes: 60,
    quietStart: "20:00",
    quietEnd: "07:00",
    homework: true,
    voice: true,
    createWorld: false,
    paused: false,
  };

function storageKey(
  childId: string,
) {
  return `liio-time-settings-${childId}`;
}

export async function loadTimeSettings(
  childId: string,
): Promise<TimeSettingsRecord> {
  purgeLegacyPersistentPrototypeState();

  const identity =
    getLocalFamilyIdentity();

  const supabase =
    getLiioSupabaseBrowserClient();

  if (identity && supabase) {
    const { data, error } =
      await supabase.rpc(
        "liio_get_time_limits",
        {
          p_family_id:
            identity.familyId,
          p_owner_secret:
            identity.ownerSecret,
          p_child_id: childId,
        },
      );

    if (
      !error &&
      Array.isArray(data) &&
      data[0]
    ) {
      const row = data[0];

      const settings:
        TimeSettingsRecord = {
          minutes:
            row.daily_minutes
              as number,
          quietStart:
            String(
              row.quiet_start,
            ).slice(0, 5),
          quietEnd:
            String(
              row.quiet_end,
            ).slice(0, 5),
          homework:
            row.homework_enabled
              as boolean,
          voice:
            row.voice_enabled
              as boolean,
          createWorld:
            row.create_world_enabled
              as boolean,
          paused:
            row.paused as boolean,
        };

      window.sessionStorage.setItem(
        storageKey(childId),
        JSON.stringify(
          settings,
        ),
      );

      return settings;
    }
  }

  try {
    const stored =
      window.sessionStorage.getItem(
        storageKey(childId),
      );

    if (stored) {
      return {
        ...defaultTimeSettings,
        ...(JSON.parse(
          stored,
        ) as Partial<
          TimeSettingsRecord
        >),
      };
    }
  } catch {
    // Fall through to defaults.
  }

  return defaultTimeSettings;
}

export async function saveTimeSettings(
  childId: string,
  settings:
    TimeSettingsRecord,
) {
  purgeLegacyPersistentPrototypeState();

  window.sessionStorage.setItem(
    storageKey(childId),
    JSON.stringify(settings),
  );

  const identity =
    getLocalFamilyIdentity();

  const supabase =
    getLiioSupabaseBrowserClient();

  if (!identity || !supabase) {
    return;
  }

  await supabase.rpc(
    "liio_update_time_limits",
    {
      p_family_id:
        identity.familyId,
      p_owner_secret:
        identity.ownerSecret,
      p_child_id: childId,
      p_daily_minutes:
        settings.minutes,
      p_quiet_start:
        settings.quietStart,
      p_quiet_end:
        settings.quietEnd,
      p_homework_enabled:
        settings.homework,
      p_voice_enabled:
        settings.voice,
      p_create_world_enabled:
        settings.createWorld,
      p_paused:
        settings.paused,
    },
  );
}

export async function saveFamilyLanguage(
  language:
    "pt" | "en" | "es" | "de",
) {
  const identity =
    getLocalFamilyIdentity();

  const supabase =
    getLiioSupabaseBrowserClient();

  if (!identity || !supabase) {
    return;
  }

  await supabase.rpc(
    "liio_set_language",
    {
      p_family_id:
        identity.familyId,
      p_owner_secret:
        identity.ownerSecret,
      p_language: language,
    },
  );
}

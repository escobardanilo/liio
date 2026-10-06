import { getLiioSupabaseBrowserClient } from "@/lib/data/supabase-browser";
import type {
  ChildProfile,
  DeviceIdentity,
  PairingCode,
} from "@/lib/domain/family";
import { createOpaqueSecret } from "@/lib/security/opaque-secret";
import {
  createPairingCode as createLegacyPairingCode,
  decodePairingCode,
} from "@/lib/device-code";
import {
  getLocalChildren,
  getLocalFamilyIdentity,
} from "@/lib/services/family-service";

const DEVICE_KEY = "liio-device-identity";
const LEGACY_CODE_KEY = "liio-family-device-code";

export async function createFamilyPairingCode(): Promise<PairingCode> {
  const identity = getLocalFamilyIdentity();
  const supabase = getLiioSupabaseBrowserClient();

  if (identity && supabase) {
    const { data, error } = await supabase.rpc("liio_create_pairing_code", {
      p_family_id: identity.familyId,
      p_owner_secret: identity.ownerSecret,
    });

    if (!error && Array.isArray(data) && data[0]) {
      return {
        code: data[0].code as string,
        expiresAt: data[0].expires_at as string,
      };
    }
  }

  const firstChild = getLocalChildren()[0];

  if (!firstChild) {
    throw new Error("No child profiles available.");
  }

  const fallback = createLegacyPairingCode(
    firstChild.name,
    firstChild.age,
  );

  const stored = {
    code: fallback.code,
    expiresAt: new Date(fallback.expiresAt).toISOString(),
  };

  window.localStorage.setItem(
    LEGACY_CODE_KEY,
    JSON.stringify(stored),
  );

  return stored;
}

export async function resolvePairingCode(
  code: string,
): Promise<ChildProfile[]> {
  const supabase = getLiioSupabaseBrowserClient();

  if (supabase) {
    const { data, error } = await supabase.rpc("liio_pairing_children", {
      p_code: code,
    });

    if (!error && Array.isArray(data)) {
      return data as ChildProfile[];
    }
  }

  if (!decodePairingCode(code)) {
    throw new Error("Invalid or expired code.");
  }

  return getLocalChildren();
}

export async function activateDevice(
  code: string,
  child: ChildProfile,
): Promise<DeviceIdentity> {
  const supabase = getLiioSupabaseBrowserClient();
  const token = createOpaqueSecret();

  if (supabase) {
    const { data, error } = await supabase.rpc("liio_activate_device", {
      p_code: code,
      p_child_id: child.id,
      p_device_token: token,
    });

    if (!error && Array.isArray(data) && data[0]) {
      const identity: DeviceIdentity = {
        token,
        familyId: data[0].family_id as string,
        childId: data[0].child_id as string,
        childName: data[0].child_name as string,
        childAge: data[0].child_age as number,
        expiresAt: data[0].expires_at as string,
      };

      window.localStorage.setItem(
        DEVICE_KEY,
        JSON.stringify(identity),
      );

      return identity;
    }
  }

  const fallback: DeviceIdentity = {
    token,
    familyId: getLocalFamilyIdentity()?.familyId ?? "local",
    childId: child.id,
    childName: child.name,
    childAge: child.age,
    expiresAt: new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000,
    ).toISOString(),
  };

  window.localStorage.setItem(
    DEVICE_KEY,
    JSON.stringify(fallback),
  );

  return fallback;
}

export function getDeviceIdentity() {
  try {
    const raw = window.localStorage.getItem(DEVICE_KEY);
    return raw ? (JSON.parse(raw) as DeviceIdentity) : null;
  } catch {
    return null;
  }
}

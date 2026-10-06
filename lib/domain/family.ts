export type LiioLanguage = "pt" | "en" | "es" | "de";

export type ParentProfile = {
  id: string;
  name: string;
  method: "apple" | "google" | "email" | "passkey" | "family";
  createdAt: string;
  updatedAt: string;
};

export type ChildProfile = {
  id: string;
  name: string;
  age: number;
};

export type FamilyIdentity = {
  familyId: string;
  ownerSecret: string;
};

export type DeviceIdentity = {
  token: string;
  familyId: string;
  childId: string;
  childName: string;
  childAge: number;
  expiresAt: string;
};

export type PairingCode = {
  code: string;
  expiresAt: string;
};

export function assertChildAge(age: number) {
  if (!Number.isInteger(age) || age < 6 || age > 15) {
    throw new Error("Child age must be between 6 and 15.");
  }
}

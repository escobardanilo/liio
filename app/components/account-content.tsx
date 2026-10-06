"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { endParentSession } from "@/lib/parent-session";

type AuthMethod = "apple" | "google" | "email" | "passkey" | "family";

type ParentProfile = {
  id: string;
  name: string;
  method: AuthMethod;
  createdAt: string;
  updatedAt: string;
};

const PROFILE_STORAGE_KEY = "liio-parent-profile";

const methodLabels: Record<AuthMethod, string> = {
  apple: "Apple",
  google: "Google",
  email: "E-mail",
  passkey: "Passkey",
  family: "Family profile",
};

export function AccountContent({
  onClose,
}: {
  onClose?: () => void;
}) {
  const router = useRouter();

  const [profile, setProfile] = useState<ParentProfile | null>(null);

  useEffect(() => {
    try {
      const storedProfile = window.localStorage.getItem(PROFILE_STORAGE_KEY);

      if (storedProfile) {
        setProfile(JSON.parse(storedProfile) as ParentProfile);
      }
    } catch {
      setProfile(null);
    }
  }, []);

  const initial = useMemo(() => {
    const name = profile?.name?.trim();

    if (!name) {
      return "P";
    }

    return name.charAt(0).toUpperCase();
  }, [profile]);

  function handleLogout() {
    endParentSession();

    if (onClose) {
      onClose();
    }

    router.push("/home-01");
  }

  return (
    <div className="account-content">
      {onClose ? (
        <button
          className="icon-button"
          type="button"
          onClick={onClose}
          aria-label="Close account menu"
        >
          <X size={30} strokeWidth={2.4} />
        </button>
      ) : (
        <Link
          className="icon-button"
          href="/parents-home"
          aria-label="Close account menu"
        >
          <X size={30} strokeWidth={2.4} />
        </Link>
      )}

      <h1>Account</h1>

      <div className="account-profile-card">
        <div className="account-avatar">
          {initial}
        </div>

        <div className="account-profile-card__copy">
          <strong>
            {profile?.name ?? "Parent"}
          </strong>

          <span>
            {profile
              ? `${methodLabels[profile.method]} · Prototype account`
              : "Prototype account"}
          </span>
        </div>
      </div>

      <section className="account-section">
        <p className="section-label">Plan</p>

        <div className="account-row">
          <div className="account-row__stack">
            <strong>liio Family</strong>
            <span>Prototype plan · No billing</span>
          </div>
        </div>
      </section>

      <section className="account-section">
        <p className="section-label">
          Your child&apos;s data
        </p>

        <div className="account-row">
          <strong>Download everything</strong>
          <ChevronRight size={24} color="#645b6e" />
        </div>

        <div className="account-row account-row--danger">
          <strong>Delete everything</strong>
          <ChevronRight size={24} />
        </div>
      </section>

      <section className="account-section">
        <p className="section-label">Support</p>

        <div className="account-row">
          <strong>Help</strong>
          <ChevronRight size={24} color="#645b6e" />
        </div>

        <div className="account-row">
          <strong>Terms &amp; Privacy</strong>
          <ChevronRight size={24} color="#645b6e" />
        </div>
      </section>

      <button
        className="logout-button primary-button"
        type="button"
        onClick={handleLogout}
      >
        Log out
      </button>
    </div>
  );
}

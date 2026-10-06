"use client";

import Link from "next/link";
import { liioCopy } from "@/lib/i18n/catalog";
import { useRouter } from "next/navigation";
import { ChevronRight, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { endParentSession } from "@/lib/parent-session";
import { useLiioLanguage } from "./use-liio-language";

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

const copy = liioCopy.account;


export function AccountContent({
  onClose,
}: {
  onClose?: () => void;
}) {
  const router = useRouter();
  const { language } = useLiioLanguage();
  const t = copy[language];

  const [profile, setProfile] =
    useState<ParentProfile | null>(null);

  useEffect(() => {
    try {
      const storedProfile =
        window.localStorage.getItem(
          PROFILE_STORAGE_KEY,
        );

      if (storedProfile) {
        setProfile(
          JSON.parse(
            storedProfile,
          ) as ParentProfile,
        );
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

      <h1>{t.account}</h1>

      <div className="account-profile-card">
        <div className="account-avatar">
          {initial}
        </div>

        <div className="account-profile-card__copy">
          <strong>
            {profile?.name ?? t.parent}
          </strong>

          <span>
            {profile
              ? `${methodLabels[profile.method]} · ${t.prototypeAccount}`
              : t.prototypeAccount}
          </span>
        </div>
      </div>

      <section className="account-section">
        <p className="section-label">
          {t.plan}
        </p>

        <div className="account-row">
          <div className="account-row__stack">
            <strong>{t.family}</strong>
            <span>{t.planSub}</span>
          </div>
        </div>
      </section>

      <section className="account-section">
        <p className="section-label">
          {t.data}
        </p>

        <div className="account-row">
          <strong>{t.download}</strong>
          <ChevronRight
            size={24}
            color="#645b6e"
          />
        </div>

        <div className="account-row account-row--danger">
          <strong>{t.delete}</strong>
          <ChevronRight size={24} />
        </div>
      </section>

      <section className="account-section">
        <p className="section-label">
          {t.support}
        </p>

        <div className="account-row">
          <strong>{t.help}</strong>
          <ChevronRight
            size={24}
            color="#645b6e"
          />
        </div>

        <div className="account-row">
          <strong>{t.terms}</strong>
          <ChevronRight
            size={24}
            color="#645b6e"
          />
        </div>
      </section>

      <button
        className="logout-button primary-button"
        type="button"
        onClick={handleLogout}
      >
        {t.logout}
      </button>
    </div>
  );
}

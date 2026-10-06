"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Mail, X } from "lucide-react";
import { BackButton, Brand, MobileShell } from "../components/ui";
import styles from "./page.module.css";

type AuthMethod = "apple" | "google" | "email" | "passkey" | "family";

type ParentProfile = {
  id: string;
  name: string;
  method: AuthMethod;
  createdAt: string;
  updatedAt: string;
};

const PROFILE_STORAGE_KEY = "liio-parent-profile";
const SESSION_STORAGE_KEY = "liio-parent-session";

const methodLabels: Record<AuthMethod, string> = {
  apple: "Apple",
  google: "Google",
  email: "E-mail",
  passkey: "Passkey",
  family: "Family",
};

function AppleIcon() {
  return (
    <svg
      className={styles.appleIcon}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.49-1.31 2.97-2.53 4.08ZM12.03 7.25c-.15-1.67 1.24-3.05 2.8-3.18.22 1.93-1.75 3.37-2.8 3.18Z"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg
      className={styles.googleIcon}
      viewBox="0 0 48 48"
      aria-hidden="true"
    >
      <path
        fill="#FFC107"
        d="M43.611 20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.047 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-4Z"
      />
      <path
        fill="#FF3D00"
        d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.047 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691Z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44Z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20H42v-.083H24v8h11.303a12.07 12.07 0 0 1-4.087 5.655l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-4Z"
      />
    </svg>
  );
}

export default function ResponsibleAreaPage() {
  const router = useRouter();

  const [selectedMethod, setSelectedMethod] = useState<AuthMethod | null>(null);
  const [name, setName] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    try {
      const storedProfile = window.localStorage.getItem(PROFILE_STORAGE_KEY);
      const activeSession =
        window.sessionStorage.getItem(SESSION_STORAGE_KEY) === "active";
      const legacySession =
        window.localStorage.getItem(SESSION_STORAGE_KEY) === "active";

      if (storedProfile && (activeSession || legacySession)) {
        if (legacySession) {
          window.sessionStorage.setItem(SESSION_STORAGE_KEY, "active");
          window.localStorage.removeItem(SESSION_STORAGE_KEY);
        }

        router.replace("/parents-home");
        return;
      }
    } catch {
      // If storage is unavailable, show the prototype sign-in screen.
    }

    setCheckingSession(false);
  }, [router]);

  function openProfileSetup(method: AuthMethod) {
    let savedName = "";

    try {
      const storedProfile = window.localStorage.getItem(PROFILE_STORAGE_KEY);

      if (storedProfile) {
        const profile = JSON.parse(storedProfile) as ParentProfile;
        savedName = profile.name ?? "";
      }
    } catch {
      savedName = "";
    }

    setName(savedName);
    setSelectedMethod(method);
  }

  function closeProfileSetup() {
    setSelectedMethod(null);
  }

  function handleContinue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedName = name.trim();

    if (!normalizedName || !selectedMethod) {
      return;
    }

    let existingProfile: ParentProfile | null = null;

    try {
      const storedProfile = window.localStorage.getItem(PROFILE_STORAGE_KEY);

      if (storedProfile) {
        existingProfile = JSON.parse(storedProfile) as ParentProfile;
      }
    } catch {
      existingProfile = null;
    }

    const now = new Date().toISOString();

    const profile: ParentProfile = {
      id: existingProfile?.id ?? crypto.randomUUID(),
      name: normalizedName,
      method: selectedMethod,
      createdAt: existingProfile?.createdAt ?? now,
      updatedAt: now,
    };

    window.localStorage.setItem(
      PROFILE_STORAGE_KEY,
      JSON.stringify(profile),
    );

    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, "active");

    router.push("/parents-home");
  }

  if (checkingSession) {
    return (
      <MobileShell className={styles.shell}>
        <section className={styles.page} />
      </MobileShell>
    );
  }

  return (
    <MobileShell className={styles.shell}>
      <section className={styles.page}>
        <div className={styles.top}>
          <BackButton href="/home-01" />
          <Brand small />
        </div>

        <h1 className={styles.heading}>Parents Area</h1>

        <p className={styles.subheading}>
          Sign in to create and manage profiles
        </p>

        <div className={styles.authList}>
          <button
            className={styles.authButton}
            type="button"
            onClick={() => openProfileSetup("apple")}
          >
            <span className={styles.iconSlot}>
              <AppleIcon />
            </span>

            <span className={styles.label}>Continuar com Apple</span>

            <span className={styles.balanceSlot} aria-hidden="true" />
          </button>

          <button
            className={styles.authButton}
            type="button"
            onClick={() => openProfileSetup("google")}
          >
            <span className={styles.iconSlot}>
              <GoogleIcon />
            </span>

            <span className={styles.label}>Continuar com Google</span>

            <span className={styles.balanceSlot} aria-hidden="true" />
          </button>

          <button
            className={styles.authButton}
            type="button"
            onClick={() => openProfileSetup("email")}
          >
            <span className={styles.iconSlot}>
              <Mail size={28} strokeWidth={2.1} />
            </span>

            <span className={styles.label}>Entrar com e-mail</span>

            <span className={styles.balanceSlot} aria-hidden="true" />
          </button>

          <button
            className={styles.authButton}
            type="button"
            onClick={() => openProfileSetup("passkey")}
          >
            <span className={styles.iconSlot}>
              <KeyRound size={28} strokeWidth={2.15} />
            </span>

            <span className={styles.label}>Usar passkey</span>

            <span className={styles.balanceSlot} aria-hidden="true" />
          </button>
        </div>

        <button
          className={styles.createFamily}
          type="button"
          onClick={() => openProfileSetup("family")}
        >
          Create family
        </button>

        {selectedMethod ? (
          <div className={styles.modalBackdrop}>
            <section
              className={styles.modal}
              role="dialog"
              aria-modal="true"
              aria-labelledby="parent-profile-title"
            >
              <div className={styles.modalHeader}>
                <div>
                  <span className={styles.modalEyebrow}>
                    {methodLabels[selectedMethod]}
                  </span>

                  <h2 id="parent-profile-title">
                    Create your profile
                  </h2>
                </div>

                <button
                  className={styles.closeButton}
                  type="button"
                  onClick={closeProfileSetup}
                  aria-label="Close"
                >
                  <X size={24} strokeWidth={2.2} />
                </button>
              </div>

              <p className={styles.modalDescription}>
                Tell Liio how we should identify you in the Parents Area.
              </p>

              <form
                className={styles.profileForm}
                onSubmit={handleContinue}
              >
                <label>
                  <span>Your name</span>

                  <input
                    type="text"
                    value={name}
                    maxLength={40}
                    autoFocus
                    autoComplete="name"
                    placeholder="Your name"
                    onChange={(event) => setName(event.target.value)}
                  />
                </label>

                <p className={styles.prototypeNote}>
                  Prototype access — no external account will be connected.
                </p>

                <button
                  className={styles.continueButton}
                  type="submit"
                  disabled={!name.trim()}
                >
                  Continue
                </button>
              </form>
            </section>
          </div>
        ) : null}
      </section>
    </MobileShell>
  );
}

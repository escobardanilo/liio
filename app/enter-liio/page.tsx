"use client";

import { FormEvent, useState } from "react";
import { liioCopy } from "@/lib/i18n/catalog";
import { useRouter } from "next/navigation";
import { KeyRound, UserRound } from "lucide-react";
import {
  activateDevice,
  resolvePairingCode,
} from "@/lib/services/pairing-service";
import {
  saveActiveChildProfile,
  setSelectedChildId,
} from "@/lib/services/local-state";
import {
  normalizePairingCode,
} from "@/lib/device-code";
import { useLiioLanguage } from "../components/use-liio-language";
import { BackButton, Brand, MobileShell } from "../components/ui";
import styles from "./page.module.css";

type ChildProfile = {
  id: string;
  name: string;
  age: number;
};


const copy = liioCopy.enter;


export default function EnterLiioPage() {
  const router = useRouter();
  const { language } = useLiioLanguage();
  const t = copy[language];

  const [code, setCode] = useState("");
  const [validatedCode, setValidatedCode] = useState("");
  const [error, setError] = useState("");
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [step, setStep] = useState<"code" | "profile">("code");
  const [busy, setBusy] = useState(false);

  function handleChange(value: string) {
    const normalized = normalizePairingCode(value);
    const formatted =
      normalized.length > 3
        ? `${normalized.slice(0, 3)}-${normalized.slice(3)}`
        : normalized;

    setCode(formatted);
    setError("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const profiles = await resolvePairingCode(code);

      if (!profiles.length) {
        setError(t.noProfiles);
        return;
      }

      setValidatedCode(code);
      setChildren(profiles);
      setStep("profile");
    } catch {
      setError(t.invalid);
    } finally {
      setBusy(false);
    }
  }

  async function chooseChild(child: ChildProfile) {
    setBusy(true);
    setError("");

    try {
      const device = await activateDevice(
        validatedCode,
        child,
      );

      const activeProfile = {
        childId: device.childId,
        name: device.childName,
        initial: device.childName
          .charAt(0)
          .toUpperCase(),
        age: device.childAge,
        pairedAt: new Date().toISOString(),
      };

      saveActiveChildProfile(
        activeProfile,
      );

      setSelectedChildId(
        device.childId,
      );

      router.push("/homework");
    } catch {
      setError(t.invalid);
      setStep("code");
    } finally {
      setBusy(false);
    }
  }

  return (
    <MobileShell className={styles.shell}>
      <section className={styles.page}>
        <div className={styles.top}>
          <BackButton href="/home-01" />
          <Brand small />
        </div>

        <div className={styles.content}>
          {step === "code" ? (
            <>
              <div className={styles.icon}>
                <KeyRound size={34} strokeWidth={2} />
              </div>

              <h1>{t.enterTitle}</h1>

              <p>{t.instruction}</p>

              <form
                className={styles.form}
                onSubmit={handleSubmit}
              >
                <label htmlFor="liio-code">
                  {t.deviceCode}
                </label>

                <input
                  id="liio-code"
                  value={code}
                  autoFocus
                  autoComplete="off"
                  inputMode="text"
                  maxLength={7}
                  placeholder="ABC-123"
                  onChange={(event) =>
                    handleChange(event.target.value)
                  }
                />

                {error ? (
                  <p className={styles.error} role="alert">
                    {error}
                  </p>
                ) : (
                  <p className={styles.helper}>
                    {t.expires}
                  </p>
                )}

                <button
                  className={styles.continueButton}
                  type="submit"
                  disabled={
                    busy ||
                    normalizePairingCode(code).length !== 6
                  }
                >
                  {busy ? "…" : t.continue}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className={styles.icon}>
                <UserRound size={34} strokeWidth={2} />
              </div>

              <h1>{t.who}</h1>

              <p>{t.choose}</p>

              <div className={styles.profileList}>
                {children.map((child) => (
                  <button
                    key={child.id}
                    className={styles.profileCard}
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      void chooseChild(child)
                    }
                  >
                    <span className={styles.avatar}>
                      {child.name
                        .charAt(0)
                        .toUpperCase()}
                    </span>

                    <span className={styles.profileCopy}>
                      <strong>{child.name}</strong>
                      <small>
                        {child.age} {t.years}
                      </small>
                    </span>
                  </button>
                ))}
              </div>

              {error ? (
                <p className={styles.error} role="alert">
                  {error}
                </p>
              ) : null}

              <button
                className={styles.changeCodeButton}
                type="button"
                disabled={busy}
                onClick={() => {
                  setStep("code");
                  setValidatedCode("");
                  setCode("");
                  setError("");
                }}
              >
                {t.otherCode}
              </button>
            </>
          )}
        </div>
      </section>
    </MobileShell>
  );
}

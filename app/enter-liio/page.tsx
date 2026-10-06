"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import {
  decodePairingCode,
  normalizePairingCode,
} from "@/lib/device-code";
import { BackButton, Brand, MobileShell } from "../components/ui";
import styles from "./page.module.css";

type CodeMap = Record<
  string,
  {
    childId: string;
    childName: string;
    age: number;
  }
>;

const CODE_MAP_KEY = "liio-device-code-map";
const ACTIVE_CHILD_KEY = "liio-active-child-profile";

export default function EnterLiioPage() {
  const router = useRouter();

  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  function handleChange(value: string) {
    const normalized = normalizePairingCode(value);
    const formatted =
      normalized.length > 3
        ? `${normalized.slice(0, 3)}-${normalized.slice(3)}`
        : normalized;

    setCode(formatted);
    setError("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const decoded = decodePairingCode(code);

    if (!decoded) {
      setError("This code is invalid or has expired.");
      return;
    }

    const normalized = normalizePairingCode(code);
    let mappedProfile: CodeMap[string] | undefined;

    try {
      const storedMap = window.localStorage.getItem(CODE_MAP_KEY);

      if (storedMap) {
        const codeMap = JSON.parse(storedMap) as CodeMap;
        mappedProfile = codeMap[normalized];
      }
    } catch {
      mappedProfile = undefined;
    }

    const activeProfile = {
      childId: mappedProfile?.childId ?? null,
      name: mappedProfile?.childName ?? null,
      initial: decoded.initial,
      age: mappedProfile?.age ?? decoded.age,
      pairedAt: new Date().toISOString(),
    };

    window.localStorage.setItem(
      ACTIVE_CHILD_KEY,
      JSON.stringify(activeProfile),
    );

    if (mappedProfile?.childId) {
      window.localStorage.setItem(
        "liio-selected-child-id",
        mappedProfile.childId,
      );
    }

    router.push("/homework");
  }

  return (
    <MobileShell className={styles.shell}>
      <section className={styles.page}>
        <div className={styles.top}>
          <BackButton href="/home-01" />
          <Brand small />
        </div>

        <div className={styles.content}>
          <div className={styles.icon}>
            <KeyRound size={34} strokeWidth={2} />
          </div>

          <h1>Enter LIIO</h1>

          <p>
            Ask a parent or family member for the code generated in
            <strong> Devices &amp; codes</strong>.
          </p>

          <form className={styles.form} onSubmit={handleSubmit}>
            <label htmlFor="liio-code">Device code</label>

            <input
              id="liio-code"
              value={code}
              autoFocus
              autoComplete="off"
              inputMode="text"
              maxLength={7}
              placeholder="ABC-123"
              onChange={(event) => handleChange(event.target.value)}
            />

            {error ? (
              <p className={styles.error} role="alert">
                {error}
              </p>
            ) : (
              <p className={styles.helper}>
                Codes are temporary and expire after 10 minutes.
              </p>
            )}

            <button
              className={styles.continueButton}
              type="submit"
              disabled={normalizePairingCode(code).length !== 6}
            >
              Continue
            </button>
          </form>
        </div>
      </section>
    </MobileShell>
  );
}

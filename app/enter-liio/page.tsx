"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, UserRound } from "lucide-react";
import {
  decodePairingCode,
  normalizePairingCode,
} from "@/lib/device-code";
import { BackButton, Brand, MobileShell } from "../components/ui";
import styles from "./page.module.css";

type ChildProfile = {
  id: string;
  name: string;
  age: number;
};

const CHILDREN_KEY = "liio-parent-child-profiles";
const ACTIVE_CHILD_KEY = "liio-active-child-profile";
const SELECTED_CHILD_KEY = "liio-selected-child-id";

export default function EnterLiioPage() {
  const router = useRouter();

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [step, setStep] = useState<"code" | "profile">("code");

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

    try {
      const storedChildren = window.localStorage.getItem(CHILDREN_KEY);

      if (!storedChildren) {
        setError("No child profiles are available for this family.");
        return;
      }

      const parsedChildren = JSON.parse(storedChildren) as ChildProfile[];

      if (!Array.isArray(parsedChildren) || parsedChildren.length === 0) {
        setError("No child profiles are available for this family.");
        return;
      }

      setChildren(parsedChildren);
      setStep("profile");
      setError("");
    } catch {
      setError("liio could not load the family profiles.");
    }
  }

  function chooseChild(child: ChildProfile) {
    const activeProfile = {
      childId: child.id,
      name: child.name,
      initial: child.name.charAt(0).toUpperCase(),
      age: child.age,
      pairedAt: new Date().toISOString(),
    };

    window.localStorage.setItem(
      ACTIVE_CHILD_KEY,
      JSON.stringify(activeProfile),
    );

    window.localStorage.setItem(
      SELECTED_CHILD_KEY,
      child.id,
    );

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
          {step === "code" ? (
            <>
              <div className={styles.icon}>
                <KeyRound size={34} strokeWidth={2} />
              </div>

              <h1>Enter liio</h1>

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
            </>
          ) : (
            <>
              <div className={styles.icon}>
                <UserRound size={34} strokeWidth={2} />
              </div>

              <h1>Who&apos;s using liio?</h1>

              <p>
                Choose the child profile that will use liio on this device.
              </p>

              <div className={styles.profileList}>
                {children.map((child) => (
                  <button
                    key={child.id}
                    className={styles.profileCard}
                    type="button"
                    onClick={() => chooseChild(child)}
                  >
                    <span className={styles.avatar}>
                      {child.name.charAt(0).toUpperCase()}
                    </span>

                    <span className={styles.profileCopy}>
                      <strong>{child.name}</strong>
                      <small>{child.age} years old</small>
                    </span>
                  </button>
                ))}
              </div>

              <button
                className={styles.changeCodeButton}
                type="button"
                onClick={() => {
                  setStep("code");
                  setCode("");
                  setError("");
                }}
              >
                Use another code
              </button>
            </>
          )}
        </div>
      </section>
    </MobileShell>
  );
}

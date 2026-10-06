"use client";

import { Share2, Smartphone } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  createPairingCode,
  decodePairingCode,
} from "@/lib/device-code";
import { BackButton, MobileShell } from "../components/ui";

type ChildProfile = {
  id: string;
  name: string;
  age: number;
};

type StoredCode = {
  code: string;
  expiresAt: number;
};

const CHILDREN_KEY = "liio-parent-child-profiles";
const FAMILY_CODE_KEY = "liio-family-device-code";

export default function DeviceCodesPage() {
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [storedCode, setStoredCode] = useState<StoredCode | null>(null);
  const [now, setNow] = useState(Date.now());
  const [copied, setCopied] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const storedChildren =
        window.localStorage.getItem(CHILDREN_KEY);

      if (storedChildren) {
        const parsedChildren = JSON.parse(
          storedChildren,
        ) as ChildProfile[];

        if (Array.isArray(parsedChildren)) {
          setChildren(parsedChildren);
        }
      }

      const savedCode =
        window.localStorage.getItem(FAMILY_CODE_KEY);

      if (savedCode) {
        const parsedCode =
          JSON.parse(savedCode) as StoredCode;

        const isValid =
          parsedCode.expiresAt > Date.now() &&
          decodePairingCode(parsedCode.code) !== null;

        if (isValid) {
          setStoredCode(parsedCode);
        } else {
          window.localStorage.removeItem(
            FAMILY_CODE_KEY,
          );
        }
      }
    } catch {
      setChildren([]);
      setStoredCode(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const secondsRemaining = useMemo(() => {
    if (!storedCode) {
      return 0;
    }

    return Math.max(
      0,
      Math.ceil(
        (storedCode.expiresAt - now) / 1000,
      ),
    );
  }, [now, storedCode]);

  useEffect(() => {
    if (
      storedCode &&
      secondsRemaining === 0
    ) {
      window.localStorage.removeItem(
        FAMILY_CODE_KEY,
      );
      setStoredCode(null);
    }
  }, [secondsRemaining, storedCode]);

  function generateCode() {
    const firstChild = children[0];

    if (!firstChild) {
      return;
    }

    const pairingCode = createPairingCode(
      firstChild.name,
      firstChild.age,
    );

    const nextCode: StoredCode = {
      code: pairingCode.code,
      expiresAt: pairingCode.expiresAt,
    };

    window.localStorage.setItem(
      FAMILY_CODE_KEY,
      JSON.stringify(nextCode),
    );

    setStoredCode(nextCode);
    setCopied(false);
  }

  async function shareCode() {
    if (!storedCode) {
      return;
    }

    const message =
      `Enter this Liio family code: ${storedCode.code}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Liio family code",
          text: message,
        });

        return;
      }

      await navigator.clipboard.writeText(
        storedCode.code,
      );

      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  if (!ready) {
    return (
      <MobileShell>
        <section className="detail-page device-page" />
      </MobileShell>
    );
  }

  const minutes =
    Math.floor(secondsRemaining / 60);

  const seconds = String(
    secondsRemaining % 60,
  ).padStart(2, "0");

  return (
    <MobileShell>
      <section className="detail-page device-page">
        <BackButton href="/parents-home" />

        <h1>Devices &amp; codes</h1>

        {children.length > 0 ? (
          <>
            <p className="detail-subtitle">
              Generate a temporary family code. After entering it,
              the child chooses their profile.
            </p>

            <div
              className="qr-card"
              style={{
                height: 150,
                marginTop: 34,
              }}
            >
              <Smartphone
                size={62}
                strokeWidth={1.6}
                color="#6d4aff"
              />
            </div>

            {storedCode ? (
              <>
                <p className="device-helper">
                  Enter this code in{" "}
                  <strong>Enter LIIO</strong>
                </p>

                <div className="device-code">
                  {storedCode.code}
                </div>

                <p className="expires">
                  Expires in {minutes}:{seconds}
                </p>

                <button
                  className="primary-button share-code"
                  type="button"
                  onClick={shareCode}
                >
                  <Share2 size={20} />
                  {copied
                    ? "Code copied"
                    : "Share code"}
                </button>

                <button
                  className="new-code"
                  type="button"
                  onClick={generateCode}
                >
                  Generate new code
                </button>
              </>
            ) : (
              <button
                className="primary-button share-code"
                type="button"
                onClick={generateCode}
                style={{ marginTop: 28 }}
              >
                Generate code
              </button>
            )}

            <p className="device-note">
              Prototype code · valid for 10 minutes.
            </p>
          </>
        ) : (
          <section className="privacy-card card">
            <strong>No child profiles yet</strong>

            <span>
              Add at least one child in the Parents Area before
              generating a family device code.
            </span>
          </section>
        )}
      </section>
    </MobileShell>
  );
}

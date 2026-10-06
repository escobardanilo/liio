"use client";

import { Share2, Smartphone } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  createPairingCode,
  decodePairingCode,
  normalizePairingCode,
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

type CodeMap = Record<
  string,
  {
    childId: string;
    childName: string;
    age: number;
  }
>;

const CHILDREN_KEY = "liio-parent-child-profiles";
const SELECTED_CHILD_KEY = "liio-selected-child-id";
const CODE_MAP_KEY = "liio-device-code-map";

export default function DeviceCodesPage() {
  const [child, setChild] = useState<ChildProfile | null>(null);
  const [storedCode, setStoredCode] = useState<StoredCode | null>(null);
  const [now, setNow] = useState(Date.now());
  const [copied, setCopied] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const storedChildren = window.localStorage.getItem(CHILDREN_KEY);
      const selectedId =
        window.localStorage.getItem(SELECTED_CHILD_KEY);

      if (storedChildren) {
        const children = JSON.parse(storedChildren) as ChildProfile[];
        const selectedChild =
          children.find((profile) => profile.id === selectedId) ??
          children[0] ??
          null;

        setChild(selectedChild);

        if (selectedChild) {
          const savedCode = window.localStorage.getItem(
            `liio-device-code-${selectedChild.id}`,
          );

          if (savedCode) {
            const parsedCode = JSON.parse(savedCode) as StoredCode;
            const isValid =
              parsedCode.expiresAt > Date.now() &&
              decodePairingCode(parsedCode.code) !== null;

            if (isValid) {
              setStoredCode(parsedCode);
            } else {
              window.localStorage.removeItem(
                `liio-device-code-${selectedChild.id}`,
              );
            }
          }
        }
      }
    } catch {
      setChild(null);
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
      Math.ceil((storedCode.expiresAt - now) / 1000),
    );
  }, [now, storedCode]);

  useEffect(() => {
    if (
      storedCode &&
      secondsRemaining === 0 &&
      child
    ) {
      window.localStorage.removeItem(
        `liio-device-code-${child.id}`,
      );
      setStoredCode(null);
    }
  }, [child, secondsRemaining, storedCode]);

  function generateCode() {
    if (!child) {
      return;
    }

    const pairingCode = createPairingCode(child.name, child.age);

    const nextCode: StoredCode = {
      code: pairingCode.code,
      expiresAt: pairingCode.expiresAt,
    };

    window.localStorage.setItem(
      `liio-device-code-${child.id}`,
      JSON.stringify(nextCode),
    );

    let codeMap: CodeMap = {};

    try {
      const storedMap = window.localStorage.getItem(CODE_MAP_KEY);

      if (storedMap) {
        codeMap = JSON.parse(storedMap) as CodeMap;
      }
    } catch {
      codeMap = {};
    }

    codeMap[normalizePairingCode(pairingCode.code)] = {
      childId: child.id,
      childName: child.name,
      age: child.age,
    };

    window.localStorage.setItem(
      CODE_MAP_KEY,
      JSON.stringify(codeMap),
    );

    setStoredCode(nextCode);
    setCopied(false);
  }

  async function shareCode() {
    if (!storedCode || !child) {
      return;
    }

    const message =
      `Enter this Liio code for ${child.name}: ${storedCode.code}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Liio device code",
          text: message,
        });

        return;
      }

      await navigator.clipboard.writeText(storedCode.code);
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

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = String(secondsRemaining % 60).padStart(2, "0");

  return (
    <MobileShell>
      <section className="detail-page device-page">
        <BackButton href="/parents-home" />

        <h1>Devices &amp; codes</h1>

        {child ? (
          <>
            <p className="detail-subtitle">
              Generate a temporary code for {child.name} to enter Liio.
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
                  Enter this code in <strong>Enter LIIO</strong>
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
                  {copied ? "Code copied" : "Share code"}
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
            <strong>No child selected</strong>
            <span>
              Add a child profile before generating a device code.
            </span>
          </section>
        )}
      </section>
    </MobileShell>
  );
}

"use client";

import { Share2, Smartphone } from "lucide-react";
import { liioCopy } from "@/lib/i18n/catalog";
import { useEffect, useMemo, useState } from "react";
import { listChildren } from "@/lib/services/family-service";
import { createFamilyPairingCode } from "@/lib/services/pairing-service";
import { useLiioLanguage } from "../components/use-liio-language";
import { BackButton, MobileShell } from "../components/ui";

type ChildProfile = {
  id: string;
  name: string;
  age: number;
};

type StoredCode = {
  code: string;
  expiresAt: string;
};

const FAMILY_CODE_KEY = "liio-family-device-code";

const copy = liioCopy.deviceCodes;


export default function DeviceCodesPage() {
  const { language } = useLiioLanguage();
  const t = copy[language];

  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [storedCode, setStoredCode] = useState<StoredCode | null>(null);
  const [now, setNow] = useState(Date.now());
  const [copied, setCopied] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const loadedChildren = await listChildren();

        if (cancelled) {
          return;
        }

        setChildren(loadedChildren);

        const savedCode =
          window.localStorage.getItem(FAMILY_CODE_KEY);

        if (savedCode) {
          const parsed = JSON.parse(savedCode) as StoredCode;

          if (new Date(parsed.expiresAt).getTime() > Date.now()) {
            setStoredCode(parsed);
          } else {
            window.localStorage.removeItem(FAMILY_CODE_KEY);
          }
        }
      } finally {
        if (!cancelled) {
          setReady(true);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
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
        (new Date(storedCode.expiresAt).getTime() - now) / 1000,
      ),
    );
  }, [now, storedCode]);

  useEffect(() => {
    if (storedCode && secondsRemaining === 0) {
      window.localStorage.removeItem(FAMILY_CODE_KEY);
      setStoredCode(null);
    }
  }, [secondsRemaining, storedCode]);

  async function generateCode() {
    setBusy(true);
    setError("");
    setCopied(false);

    try {
      const next = await createFamilyPairingCode();

      window.localStorage.setItem(
        FAMILY_CODE_KEY,
        JSON.stringify(next),
      );

      setStoredCode(next);
      setNow(Date.now());
    } catch {
      setError(t.error);
    } finally {
      setBusy(false);
    }
  }

  async function shareCode() {
    if (!storedCode) {
      return;
    }

    const message = t.shareMessage(storedCode.code);

    try {
      if (navigator.share) {
        await navigator.share({
          title: t.shareTitle,
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

        <h1>{t.title}</h1>

        {children.length > 0 ? (
          <>
            <p className="detail-subtitle">{t.subtitle}</p>

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
                  {t.enter} <strong>{t.enterLiio}</strong>
                </p>

                <div className="device-code">
                  {storedCode.code}
                </div>

                <p className="expires">
                  {t.expires} {minutes}:{seconds}
                </p>

                <button
                  className="primary-button share-code"
                  type="button"
                  onClick={shareCode}
                >
                  <Share2 size={20} />
                  {copied ? t.copied : t.share}
                </button>

                <button
                  className="new-code"
                  type="button"
                  disabled={busy}
                  onClick={() => void generateCode()}
                >
                  {busy ? "…" : t.newCode}
                </button>
              </>
            ) : (
              <button
                className="primary-button share-code"
                type="button"
                disabled={busy}
                onClick={() => void generateCode()}
                style={{ marginTop: 28 }}
              >
                {busy ? "…" : t.generate}
              </button>
            )}

            {error ? (
              <p className="device-note" role="alert">
                {error}
              </p>
            ) : (
              <p className="device-note">{t.note}</p>
            )}
          </>
        ) : (
          <section className="privacy-card card">
            <strong>{t.noProfiles}</strong>
            <span>{t.noProfilesHint}</span>
          </section>
        )}
      </section>
    </MobileShell>
  );
}

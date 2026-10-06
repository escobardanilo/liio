"use client";

import { Share2, Smartphone } from "lucide-react";
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

const copy = {
  en: {
    title: "Devices & codes",
    subtitle:
      "Generate a temporary family code. After entering it, the child chooses their profile.",
    enter: "Enter this code in",
    enterLiio: "Enter liio",
    expires: "Expires in",
    share: "Share code",
    copied: "Code copied",
    newCode: "Generate new code",
    generate: "Generate code",
    note: "One-time family code · valid for 10 minutes.",
    noProfiles: "No child profiles yet",
    noProfilesHint:
      "Add at least one child in the Parents Area before generating a family device code.",
    shareTitle: "liio family code",
    shareMessage: (code: string) =>
      `Enter this liio family code: ${code}`,
    error: "liio could not generate a code right now.",
  },
  pt: {
    title: "Dispositivos e códigos",
    subtitle:
      "Gera um código temporário da família. Depois de o inserir, a criança escolhe o seu perfil.",
    enter: "Introduz este código em",
    enterLiio: "Entrar no liio",
    expires: "Expira em",
    share: "Partilhar código",
    copied: "Código copiado",
    newCode: "Gerar novo código",
    generate: "Gerar código",
    note: "Código único da família · válido por 10 minutos.",
    noProfiles: "Ainda não existem perfis de crianças",
    noProfilesHint:
      "Adiciona pelo menos uma criança na Área dos responsáveis antes de gerar um código da família.",
    shareTitle: "Código da família liio",
    shareMessage: (code: string) =>
      `Introduz este código da família liio: ${code}`,
    error: "liio não conseguiu gerar um código agora.",
  },
  es: {
    title: "Dispositivos y códigos",
    subtitle:
      "Genera un código temporal de familia. Después de introducirlo, el niño elige su perfil.",
    enter: "Introduce este código en",
    enterLiio: "Entrar en liio",
    expires: "Caduca en",
    share: "Compartir código",
    copied: "Código copiado",
    newCode: "Generar nuevo código",
    generate: "Generar código",
    note: "Código familiar de un solo uso · válido durante 10 minutos.",
    noProfiles: "Aún no hay perfiles infantiles",
    noProfilesHint:
      "Añade al menos un niño en el Área de responsables antes de generar un código de familia.",
    shareTitle: "Código de familia liio",
    shareMessage: (code: string) =>
      `Introduce este código de familia liio: ${code}`,
    error: "liio no pudo generar un código ahora.",
  },
  de: {
    title: "Geräte & Codes",
    subtitle:
      "Erzeuge einen temporären Familiencode. Danach wählt das Kind sein Profil aus.",
    enter: "Diesen Code eingeben bei",
    enterLiio: "liio betreten",
    expires: "Läuft ab in",
    share: "Code teilen",
    copied: "Code kopiert",
    newCode: "Neuen Code erzeugen",
    generate: "Code erzeugen",
    note: "Einmaliger Familiencode · 10 Minuten gültig.",
    noProfiles: "Noch keine Kinderprofile",
    noProfilesHint:
      "Füge im Elternbereich mindestens ein Kind hinzu, bevor du einen Familiencode erzeugst.",
    shareTitle: "liio-Familiencode",
    shareMessage: (code: string) =>
      `Gib diesen liio-Familiencode ein: ${code}`,
    error: "liio konnte gerade keinen Code erzeugen.",
  },
} as const;

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

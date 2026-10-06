"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, UserRound } from "lucide-react";
import {
  activateDevice,
  resolvePairingCode,
} from "@/lib/services/pairing-service";
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

const ACTIVE_CHILD_KEY = "liio-active-child-profile";
const SELECTED_CHILD_KEY = "liio-selected-child-id";

const copy = {
  en: {
    enterTitle: "Enter liio",
    instruction:
      "Ask a parent or family member for the code generated in Devices & codes.",
    deviceCode: "Device code",
    expires: "Codes are temporary and expire after 10 minutes.",
    continue: "Continue",
    invalid: "This code is invalid or has expired.",
    noProfiles: "No child profiles are available for this family.",
    loadError: "liio could not load the family profiles.",
    who: "Who's using liio?",
    choose: "Choose the child profile that will use liio on this device.",
    years: "years old",
    otherCode: "Use another code",
  },
  pt: {
    enterTitle: "Entrar no liio",
    instruction:
      "Pede ao responsável o código gerado em Dispositivos e códigos.",
    deviceCode: "Código do dispositivo",
    expires: "Os códigos são temporários e expiram após 10 minutos.",
    continue: "Continuar",
    invalid: "Este código é inválido ou expirou.",
    noProfiles: "Não existem perfis de crianças disponíveis nesta família.",
    loadError: "liio não conseguiu carregar os perfis da família.",
    who: "Quem vai usar o liio?",
    choose: "Escolhe o perfil da criança que vai usar o liio neste dispositivo.",
    years: "anos",
    otherCode: "Usar outro código",
  },
  es: {
    enterTitle: "Entrar en liio",
    instruction:
      "Pide a un responsable el código generado en Dispositivos y códigos.",
    deviceCode: "Código del dispositivo",
    expires: "Los códigos son temporales y caducan después de 10 minutos.",
    continue: "Continuar",
    invalid: "Este código no es válido o ha caducado.",
    noProfiles: "No hay perfiles infantiles disponibles para esta familia.",
    loadError: "liio no pudo cargar los perfiles de la familia.",
    who: "¿Quién va a usar liio?",
    choose: "Elige el perfil del niño que usará liio en este dispositivo.",
    years: "años",
    otherCode: "Usar otro código",
  },
  de: {
    enterTitle: "liio betreten",
    instruction:
      "Bitte eine erziehungsberechtigte Person um den Code aus Geräte & Codes.",
    deviceCode: "Gerätecode",
    expires: "Codes sind temporär und laufen nach 10 Minuten ab.",
    continue: "Weiter",
    invalid: "Dieser Code ist ungültig oder abgelaufen.",
    noProfiles: "Für diese Familie sind keine Kinderprofile verfügbar.",
    loadError: "liio konnte die Familienprofile nicht laden.",
    who: "Wer benutzt liio?",
    choose: "Wähle das Kinderprofil aus, das liio auf diesem Gerät verwendet.",
    years: "Jahre alt",
    otherCode: "Anderen Code verwenden",
  },
} as const;

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

      window.localStorage.setItem(
        ACTIVE_CHILD_KEY,
        JSON.stringify(activeProfile),
      );

      window.localStorage.setItem(
        SELECTED_CHILD_KEY,
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

"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, UserRound } from "lucide-react";
import {
  decodePairingCode,
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

const CHILDREN_KEY = "liio-parent-child-profiles";
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
      setError(t.invalid);
      return;
    }

    try {
      const storedChildren = window.localStorage.getItem(CHILDREN_KEY);

      if (!storedChildren) {
        setError(t.noProfiles);
        return;
      }

      const parsedChildren = JSON.parse(storedChildren) as ChildProfile[];

      if (!Array.isArray(parsedChildren) || parsedChildren.length === 0) {
        setError(t.noProfiles);
        return;
      }

      setChildren(parsedChildren);
      setStep("profile");
      setError("");
    } catch {
      setError(t.loadError);
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

              <h1>{t.enterTitle}</h1>

              <p>{t.instruction}</p>

              <form className={styles.form} onSubmit={handleSubmit}>
                <label htmlFor="liio-code">{t.deviceCode}</label>

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
                    {t.expires}
                  </p>
                )}

                <button
                  className={styles.continueButton}
                  type="submit"
                  disabled={normalizePairingCode(code).length !== 6}
                >
                  {t.continue}
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
                    onClick={() => chooseChild(child)}
                  >
                    <span className={styles.avatar}>
                      {child.name.charAt(0).toUpperCase()}
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

              <button
                className={styles.changeCodeButton}
                type="button"
                onClick={() => {
                  setStep("code");
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

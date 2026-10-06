"use client";

import Link from "next/link";
import { ChevronRight, LockKeyhole } from "lucide-react";
import { useEffect, useState } from "react";
import { MobileShell } from "../components/ui";
import styles from "./page.module.css";

type Language = "pt" | "en" | "es" | "de";

const LANGUAGE_STORAGE_KEY = "liio-ui-language";

const copy: Record<
  Language,
  {
    question: string;
    childTitle: string;
    childText: string;
    parentTitle: string;
    parentText: string;
  }
> = {
  pt: {
    question: "Quem vai entrar?",
    childTitle: "Entrar no LIIO",
    childText: "Para crianças e adolescentes",
    parentTitle: "Área dos responsáveis",
    parentText: "Gerir perfis, permissões e segurança",
  },
  en: {
    question: "Who is signing in?",
    childTitle: "Enter LIIO",
    childText: "For children and teens",
    parentTitle: "Parents Area",
    parentText: "Manage profiles, permissions and security",
  },
  es: {
    question: "¿Quién va a entrar?",
    childTitle: "Entrar en LIIO",
    childText: "Para niños y adolescentes",
    parentTitle: "Área de responsables",
    parentText: "Gestionar perfiles, permisos y seguridad",
  },
  de: {
    question: "Wer meldet sich an?",
    childTitle: "LIIO betreten",
    childText: "Für Kinder und Jugendliche",
    parentTitle: "Bereich für Eltern",
    parentText: "Profile, Berechtigungen und Sicherheit verwalten",
  },
};

const languages: Language[] = ["pt", "en", "es", "de"];

export default function EntryPage() {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    try {
      const storedLanguage = window.localStorage.getItem(
        LANGUAGE_STORAGE_KEY,
      ) as Language | null;

      if (
        storedLanguage &&
        languages.includes(storedLanguage)
      ) {
        setLanguage(storedLanguage);
      }
    } catch {
      setLanguage("en");
    }
  }, []);

  function handleLanguageChange(nextLanguage: Language) {
    setLanguage(nextLanguage);

    try {
      window.localStorage.setItem(
        LANGUAGE_STORAGE_KEY,
        nextLanguage,
      );
    } catch {
      // ignore prototype storage errors
    }
  }

  const t = copy[language];

  return (
    <MobileShell className={styles.shell}>
      <section className={styles.page}>
        <div className={styles.backgroundDecor} aria-hidden="true">
          <div className={styles.cloud} />
          <span className={styles.sparkleA}>✦</span>
          <span className={styles.sparkleB}>✦</span>
          <span className={styles.sparkleC}>✦</span>
          <span className={styles.strokeA} />
          <span className={styles.strokeB} />
          <span className={styles.strokeC} />
          <span className={styles.blobLeft} />
          <span className={styles.blobRight} />
        </div>

        <header className={styles.header}>
          <div className={styles.logoWrap}>
            <span className={styles.logo}>liio</span>
          </div>

          <nav
            className={styles.languageSwitch}
            aria-label="Language selector"
          >
            {languages.map((item) => (
              <button
                key={item}
                type="button"
                className={`${styles.languageButton} ${
                  language === item ? styles.languageButtonActive : ""
                }`}
                onClick={() => handleLanguageChange(item)}
              >
                {item.toUpperCase()}
              </button>
            ))}
          </nav>
        </header>

        <div className={styles.hero}>
          <h1>{t.question}</h1>
        </div>

        <div className={styles.cards}>
          <Link
            className={`${styles.card} ${styles.primaryCard}`}
            href="/enter-liio"
          >
            <div className={styles.childIllustration} aria-hidden="true">
              <div className={styles.childAura} />
              <div className={styles.childBody} />
              <div className={styles.childNeck} />
              <div className={styles.childFace} />
              <div className={styles.childEar} />
              <div className={styles.childHairBack} />
              <div className={styles.childHairFront} />
              <div className={styles.childHairSide} />
              <div className={styles.childEyeLeft} />
              <div className={styles.childEyeRight} />
              <div className={styles.childSmile} />
              <div className={styles.childArm} />
              <div className={styles.childHand} />
            </div>

            <div className={styles.cardCopy}>
              <strong>{t.childTitle}</strong>
              <span>{t.childText}</span>
            </div>

            <span className={styles.arrowCircle}>
              <ChevronRight size={24} strokeWidth={2.8} />
            </span>
          </Link>

          <Link
            className={`${styles.card} ${styles.secondaryCard}`}
            href="/responsible-area"
          >
            <div className={styles.lockWrap} aria-hidden="true">
              <div className={styles.lockCircle}>
                <LockKeyhole size={40} strokeWidth={2.1} />
              </div>
            </div>

            <div className={styles.cardCopySecondary}>
              <strong>{t.parentTitle}</strong>
              <span>{t.parentText}</span>
            </div>

            <span className={styles.arrowCircleSecondary}>
              <ChevronRight size={24} strokeWidth={2.8} />
            </span>
          </Link>
        </div>
      </section>
    </MobileShell>
  );
}
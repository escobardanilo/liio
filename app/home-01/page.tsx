"use client";

import Link from "next/link";
import { ChevronRight, LockKeyhole } from "lucide-react";
import {
  liioLanguages,
  useLiioLanguage,
} from "../components/use-liio-language";
import { MobileShell } from "../components/ui";
import styles from "./page.module.css";

const copy = {
  en: {
    question: "Who is signing in?",
    childTitle: "Enter liio",
    childText: "For children and teens",
    parentTitle: "Parents Area",
    parentText: "Manage profiles, permissions and security",
  },
  pt: {
    question: "Quem vai entrar?",
    childTitle: "Entrar no liio",
    childText: "Para crianças e adolescentes",
    parentTitle: "Área dos responsáveis",
    parentText: "Gerir perfis, permissões e segurança",
  },
  es: {
    question: "¿Quién va a entrar?",
    childTitle: "Entrar en liio",
    childText: "Para niños y adolescentes",
    parentTitle: "Área de responsables",
    parentText: "Gestionar perfiles, permisos y seguridad",
  },
  de: {
    question: "Wer meldet sich an?",
    childTitle: "liio betreten",
    childText: "Für Kinder und Jugendliche",
    parentTitle: "Elternbereich",
    parentText: "Profile, Berechtigungen und Sicherheit verwalten",
  },
} as const;

export default function EntryPage() {
  const { language, setLanguage } = useLiioLanguage();
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
            {liioLanguages.map((item) => (
              <button
                key={item}
                type="button"
                className={`${styles.languageButton} ${
                  language === item
                    ? styles.languageButtonActive
                    : ""
                }`}
                onClick={() => setLanguage(item)}
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
            <div
              className={styles.childIllustration}
              aria-hidden="true"
            >
              <img
                className={styles.kidsImage}
                src="/images/kids-liio.png"
                alt=""
              />
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

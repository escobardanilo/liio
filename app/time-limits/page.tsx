"use client";

import { useEffect, useState } from "react";
import { useLiioLanguage } from "../components/use-liio-language";
import { TimeSettings } from "../components/time-settings";
import { BackButton, MobileShell } from "../components/ui";

type ChildProfile = {
  id: string;
  name: string;
  age: number;
};

const CHILDREN_KEY = "liio-parent-child-profiles";
const SELECTED_CHILD_KEY = "liio-selected-child-id";

const copy = {
  en: {
    title: "Time & limits",
    settingsFor: (name: string) => `Settings for ${name}`,
    noChild: "No child selected",
    noChildHint:
      "Add a child profile in the Parents Area before configuring limits.",
  },
  pt: {
    title: "Tempo e limites",
    settingsFor: (name: string) => `Definições de ${name}`,
    noChild: "Nenhuma criança selecionada",
    noChildHint:
      "Adiciona um perfil de criança na Área dos responsáveis antes de configurares limites.",
  },
  es: {
    title: "Tiempo y límites",
    settingsFor: (name: string) => `Ajustes de ${name}`,
    noChild: "Ningún niño seleccionado",
    noChildHint:
      "Añade un perfil infantil en el Área de responsables antes de configurar límites.",
  },
  de: {
    title: "Zeit & Limits",
    settingsFor: (name: string) => `Einstellungen für ${name}`,
    noChild: "Kein Kind ausgewählt",
    noChildHint:
      "Füge im Elternbereich ein Kinderprofil hinzu, bevor du Limits konfigurierst.",
  },
} as const;

export default function TimeLimitsPage() {
  const { language } = useLiioLanguage();
  const t = copy[language];

  const [child, setChild] =
    useState<ChildProfile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const storedChildren =
        window.localStorage.getItem(CHILDREN_KEY);

      const selectedId =
        window.localStorage.getItem(
          SELECTED_CHILD_KEY,
        );

      if (storedChildren) {
        const children = JSON.parse(
          storedChildren,
        ) as ChildProfile[];

        const selectedChild =
          children.find(
            (profile) =>
              profile.id === selectedId,
          ) ??
          children[0] ??
          null;

        setChild(selectedChild);
      }
    } catch {
      setChild(null);
    } finally {
      setReady(true);
    }
  }, []);

  if (!ready) {
    return (
      <MobileShell>
        <section className="detail-page" />
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <section className="detail-page">
        <BackButton href="/parents-home" />

        <h1>{t.title}</h1>

        {child ? (
          <>
            <p className="detail-subtitle">
              {t.settingsFor(child.name)}
            </p>

            <div style={{ marginTop: 28 }}>
              <TimeSettings childId={child.id} />
            </div>
          </>
        ) : (
          <section className="privacy-card card">
            <strong>{t.noChild}</strong>
            <span>{t.noChildHint}</span>
          </section>
        )}
      </section>
    </MobileShell>
  );
}

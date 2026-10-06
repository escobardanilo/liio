"use client";

import { useEffect, useMemo, useState } from "react";
import { liioCopy } from "@/lib/i18n/catalog";
import { listActivity, type ActivityEvent } from "@/lib/services/activity-service";
import { listChildren } from "@/lib/services/family-service";
import { useLiioLanguage } from "../components/use-liio-language";
import { BackButton, MobileShell } from "../components/ui";

type ChildProfile = {
  id: string;
  name: string;
  age: number;
};

const SELECTED_CHILD_KEY = "liio-selected-child-id";
const copy = liioCopy.activity;

function activityTitle(
  event: ActivityEvent,
  language: "pt" | "en" | "es" | "de",
) {
  if (event.behavior === "GUIDE") {
    return {
      pt: "Orientação de tarefa",
      en: "Guided homework",
      es: "Tarea guiada",
      de: "Geführte Hausaufgabe",
    }[language];
  }

  if (event.behavior === "CHECK") {
    return {
      pt: "Verificação de raciocínio",
      en: "Reasoning check",
      es: "Revisión de razonamiento",
      de: "Lösungsweg geprüft",
    }[language];
  }

  return {
    pt: "Explicação",
    en: "Explanation",
    es: "Explicación",
    de: "Erklärung",
  }[language];
}

export default function ActivityPage() {
  const { language } = useLiioLanguage();
  const t = copy[language];

  const [child, setChild] =
    useState<ChildProfile | null>(null);
  const [events, setEvents] =
    useState<ActivityEvent[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const children = await listChildren();
        const selectedId =
          window.localStorage.getItem(
            SELECTED_CHILD_KEY,
          );

        const selectedChild =
          children.find(
            (profile) =>
              profile.id === selectedId,
          ) ??
          children[0] ??
          null;

        if (cancelled) {
          return;
        }

        setChild(selectedChild);

        if (selectedChild) {
          const loadedEvents =
            await listActivity(
              selectedChild.id,
            );

          if (!cancelled) {
            setEvents(loadedEvents);
          }
        }
      } catch {
        if (!cancelled) {
          setChild(null);
          setEvents([]);
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

  const totals = useMemo(() => {
    const totalDurationMs = events.reduce(
      (total, event) =>
        total + (event.durationMs ?? 0),
      0,
    );

    return {
      minutes: Math.floor(
        totalDurationMs / 60_000,
      ),
      questions: events.filter(
        (event) =>
          event.eventType ===
          "homework_response",
      ).length,
      worlds: events.filter(
        (event) =>
          event.eventType ===
          "world_created",
      ).length,
    };
  }, [events]);

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

        <h1>{child?.name ?? t.activity}</h1>

        {child ? (
          <>
            <div className="segmented">
              <button
                className="segment segment--active"
                type="button"
              >
                {t.today}
              </button>

              <button
                className="segment"
                type="button"
              >
                {t.week}
              </button>
            </div>

            <div className="stats">
              <div className="stat">
                <strong>
                  {totals.minutes < 60
                    ? `${totals.minutes}m`
                    : `${Math.floor(
                        totals.minutes / 60,
                      )}h ${totals.minutes % 60}m`}
                </strong>
                <span>{t.time}</span>
              </div>

              <div className="stat">
                <strong>
                  {totals.questions}
                </strong>
                <span>{t.questions}</span>
              </div>

              <div className="stat">
                <strong>
                  {totals.worlds}
                </strong>
                <span>{t.worlds}</span>
              </div>
            </div>

            <section className="sessions">
              <p className="section-label">
                {t.sessions}
              </p>

              {events.length === 0 ? (
                <section className="privacy-card card">
                  <strong>
                    {t.noActivity}
                  </strong>
                  <span>
                    {t.sessionHint(
                      child.name,
                    )}
                  </span>
                </section>
              ) : (
                events.map((event) => (
                  <div
                    className="session-row"
                    key={event.id}
                  >
                    <span
                      className="session-dot"
                      style={{
                        background:
                          event.success === false
                            ? "#ff6961"
                            : "#6d4aff",
                      }}
                    />

                    <div className="session-copy">
                      <strong>
                        {activityTitle(
                          event,
                          language,
                        )}
                      </strong>

                      <span>
                        {new Intl.DateTimeFormat(
                          language === "pt"
                            ? "pt-PT"
                            : language === "es"
                              ? "es-ES"
                              : language === "de"
                                ? "de-DE"
                                : "en-GB",
                          {
                            dateStyle:
                              "medium",
                            timeStyle:
                              "short",
                          },
                        ).format(
                          new Date(
                            event.createdAt,
                          ),
                        )}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </section>

            <section className="privacy-card card">
              <strong>
                {child.age < 13
                  ? t.under13(
                      child.name,
                      child.age,
                    )
                  : t.teen(
                      child.name,
                      child.age,
                    )}
              </strong>

              <span>
                {child.age < 13
                  ? t.under13Hint
                  : t.teenHint}
              </span>
            </section>
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

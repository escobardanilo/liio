"use client";

import { useEffect, useMemo, useState } from "react";
import { liioCopy } from "@/lib/i18n/catalog";
import { useLiioLanguage } from "../components/use-liio-language";
import { BackButton, MobileShell } from "../components/ui";

type ChildProfile = {
  id: string;
  name: string;
  age: number;
};

type ActivitySession = {
  id: string;
  title: string;
  meta: string;
  durationMinutes: number;
  questions?: number;
  worlds?: number;
  color?: string;
};

const CHILDREN_KEY = "liio-parent-child-profiles";
const SELECTED_CHILD_KEY = "liio-selected-child-id";

const copy = liioCopy.activity;


export default function ActivityPage() {
  const { language } = useLiioLanguage();
  const t = copy[language];

  const [child, setChild] =
    useState<ChildProfile | null>(null);
  const [sessions, setSessions] =
    useState<ActivitySession[]>([]);
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

        if (selectedChild) {
          const storedSessions =
            window.localStorage.getItem(
              `liio-activity-${selectedChild.id}`,
            );

          if (storedSessions) {
            const parsedSessions = JSON.parse(
              storedSessions,
            ) as ActivitySession[];

            if (Array.isArray(parsedSessions)) {
              setSessions(parsedSessions);
            }
          }
        }
      }
    } catch {
      setChild(null);
      setSessions([]);
    } finally {
      setReady(true);
    }
  }, []);

  const totals = useMemo(() => {
    return sessions.reduce(
      (accumulator, session) => ({
        minutes:
          accumulator.minutes +
          (session.durationMinutes ?? 0),
        questions:
          accumulator.questions +
          (session.questions ?? 0),
        worlds:
          accumulator.worlds +
          (session.worlds ?? 0),
      }),
      {
        minutes: 0,
        questions: 0,
        worlds: 0,
      },
    );
  }, [sessions]);

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
                <strong>{totals.worlds}</strong>
                <span>{t.worlds}</span>
              </div>
            </div>

            <section className="sessions">
              <p className="section-label">
                {t.sessions}
              </p>

              {sessions.length === 0 ? (
                <section className="privacy-card card">
                  <strong>
                    {t.noActivity}
                  </strong>
                  <span>
                    {t.sessionHint(child.name)}
                  </span>
                </section>
              ) : (
                sessions.map((session) => (
                  <div
                    className="session-row"
                    key={session.id}
                  >
                    <span
                      className="session-dot"
                      style={{
                        background:
                          session.color ??
                          "#6d4aff",
                      }}
                    />

                    <div className="session-copy">
                      <strong>
                        {session.title}
                      </strong>
                      <span>{session.meta}</span>
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

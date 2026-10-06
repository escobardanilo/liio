"use client";

import { useEffect, useState } from "react";
import { liioCopy } from "@/lib/i18n/catalog";
import { listChildren } from "@/lib/services/family-service";
import { getSelectedChildId } from "@/lib/services/local-state";
import { useLiioLanguage } from "../components/use-liio-language";
import { TimeSettings } from "../components/time-settings";
import { DetailHeader, EmptyState, MobileShell } from "../components/ui";

type ChildProfile = {
  id: string;
  name: string;
  age: number;
};


const copy = liioCopy.timeLimits;


export default function TimeLimitsPage() {
  const { language } = useLiioLanguage();
  const t = copy[language];

  const [child, setChild] =
    useState<ChildProfile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const children = await listChildren();

        const selectedId =
          getSelectedChildId();

        const selectedChild =
          children.find(
            (profile) =>
              profile.id === selectedId,
          ) ??
          children[0] ??
          null;

        if (!cancelled) {
          setChild(selectedChild);
        }
      } catch {
        if (!cancelled) {
          setChild(null);
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
        <DetailHeader
          href="/parents-home"
          title={t.title}
          subtitle={child ? t.settingsFor(child.name) : undefined}
        />

        {child ? (
          <>
            <div style={{ marginTop: 28 }}>
              <TimeSettings childId={child.id} />
            </div>
          </>
        ) : (
          <EmptyState
            title={t.noChild}
            description={t.noChildHint}
          />
        )}
      </section>
    </MobileShell>
  );
}

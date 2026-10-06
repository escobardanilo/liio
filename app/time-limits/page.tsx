"use client";

import { useEffect, useState } from "react";
import { TimeSettings } from "../components/time-settings";
import { BackButton, MobileShell } from "../components/ui";

type ChildProfile = {
  id: string;
  name: string;
  age: number;
};

const CHILDREN_KEY = "liio-parent-child-profiles";
const SELECTED_CHILD_KEY = "liio-selected-child-id";

export default function TimeLimitsPage() {
  const [child, setChild] = useState<ChildProfile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const storedChildren = window.localStorage.getItem(CHILDREN_KEY);
      const selectedId =
        window.localStorage.getItem(SELECTED_CHILD_KEY);

      if (storedChildren) {
        const children = JSON.parse(storedChildren) as ChildProfile[];
        const selectedChild =
          children.find((profile) => profile.id === selectedId) ??
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

        <h1>Time &amp; limits</h1>

        {child ? (
          <>
            <p className="detail-subtitle">
              Settings for {child.name}
            </p>

            <div style={{ marginTop: 28 }}>
              <TimeSettings childId={child.id} />
            </div>
          </>
        ) : (
          <section className="privacy-card card">
            <strong>No child selected</strong>
            <span>
              Add a child profile in the Parents Area before configuring
              limits.
            </span>
          </section>
        )}
      </section>
    </MobileShell>
  );
}

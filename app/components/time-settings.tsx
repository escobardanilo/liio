"use client";

import { Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";

type Settings = {
  minutes: number;
  quietStart: string;
  quietEnd: string;
  homework: boolean;
  voice: boolean;
  createWorld: boolean;
  paused: boolean;
};

const defaultSettings: Settings = {
  minutes: 60,
  quietStart: "20:00",
  quietEnd: "07:00",
  homework: true,
  voice: true,
  createWorld: false,
  paused: false,
};

export function TimeSettings({ childId }: { childId: string }) {
  const storageKey = `liio-time-settings-${childId}`;

  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);

      if (stored) {
        setSettings({
          ...defaultSettings,
          ...(JSON.parse(stored) as Partial<Settings>),
        });
      }
    } catch {
      setSettings(defaultSettings);
    } finally {
      setReady(true);
    }
  }, [storageKey]);

  function updateSettings(patch: Partial<Settings>) {
    setSettings((current) => {
      const next = {
        ...current,
        ...patch,
      };

      window.localStorage.setItem(storageKey, JSON.stringify(next));

      return next;
    });
  }

  if (!ready) {
    return null;
  }

  return (
    <>
      <div className="setting-card">
        <div className="setting-card__copy">
          <strong>Daily limit</strong>
          <span>{settings.minutes} min</span>
        </div>

        <div className="stepper">
          <button
            type="button"
            onClick={() =>
              updateSettings({
                minutes: Math.max(15, settings.minutes - 15),
              })
            }
            aria-label="Decrease daily limit"
          >
            <Minus size={25} />
          </button>

          <button
            type="button"
            onClick={() =>
              updateSettings({
                minutes: Math.min(180, settings.minutes + 15),
              })
            }
            aria-label="Increase daily limit"
          >
            <Plus size={28} />
          </button>
        </div>
      </div>

      <div
        className="setting-card"
        style={{
          marginTop: 14,
          alignItems: "flex-start",
          gap: 16,
        }}
      >
        <div className="setting-card__copy">
          <strong>Quiet hours</strong>
          <span style={{ fontSize: 16, marginTop: 8 }}>
            {settings.quietStart} – {settings.quietEnd}
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gap: 7,
            width: 118,
          }}
        >
          <input
            type="time"
            value={settings.quietStart}
            aria-label="Quiet hours start"
            onChange={(event) =>
              updateSettings({
                quietStart: event.target.value,
              })
            }
            style={{
              width: "100%",
              height: 38,
              padding: "0 8px",
              border: "1.5px solid #e8e1d7",
              borderRadius: 11,
              background: "#fff",
              color: "#191426",
            }}
          />

          <input
            type="time"
            value={settings.quietEnd}
            aria-label="Quiet hours end"
            onChange={(event) =>
              updateSettings({
                quietEnd: event.target.value,
              })
            }
            style={{
              width: "100%",
              height: 38,
              padding: "0 8px",
              border: "1.5px solid #e8e1d7",
              borderRadius: 11,
              background: "#fff",
              color: "#191426",
            }}
          />
        </div>
      </div>

      <section className="settings-list">
        <p className="section-label">What Liio can do</p>

        <ToggleRow
          title="Homework mode"
          description="Guides step by step, never gives the answer"
          value={settings.homework}
          onChange={(value) =>
            updateSettings({
              homework: value,
            })
          }
        />

        <ToggleRow
          title="Voice replies"
          description="Liio can talk out loud"
          value={settings.voice}
          onChange={(value) =>
            updateSettings({
              voice: value,
            })
          }
        />

        <ToggleRow
          title="Create world"
          description="Stories, ideas and drawings"
          value={settings.createWorld}
          onChange={(value) =>
            updateSettings({
              createWorld: value,
            })
          }
        />
      </section>

      <button
        className="pause-outline"
        type="button"
        onClick={() =>
          updateSettings({
            paused: !settings.paused,
          })
        }
      >
        {settings.paused ? "Resume Liio" : "Pause Liio now"}
      </button>
    </>
  );
}

function ToggleRow({
  title,
  description,
  value,
  onChange,
}: {
  title: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="toggle-row">
      <div className="toggle-row__copy">
        <strong>{title}</strong>
        <span>{description}</span>
      </div>

      <button
        className={`toggle ${value ? "toggle--on" : ""}`}
        type="button"
        role="switch"
        aria-checked={value}
        aria-label={title}
        onClick={() => onChange(!value)}
      />
    </div>
  );
}

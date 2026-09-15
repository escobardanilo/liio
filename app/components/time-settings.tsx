"use client";

import { ChevronRight, Minus, Plus } from "lucide-react";
import { useState } from "react";

export function TimeSettings() {
  const [minutes, setMinutes] = useState(60), [homework, setHomework] = useState(true), [voice, setVoice] = useState(true), [create, setCreate] = useState(false);
  return <>
    <div className="setting-card"><div className="setting-card__copy"><strong>Daily limit</strong><span>{minutes} min</span></div><div className="stepper"><button onClick={() => setMinutes(v => Math.max(15, v - 15))} aria-label="Decrease daily limit"><Minus size={25} /></button><button onClick={() => setMinutes(v => Math.min(180, v + 15))} aria-label="Increase daily limit"><Plus size={28} /></button></div></div>
    <button className="setting-card" style={{ width: "100%", textAlign: "left" }}><div className="setting-card__copy"><strong>Quiet hours</strong><span>20:00 – 07:00</span></div><ChevronRight size={28} color="#645b6e" /></button>
    <section className="settings-list"><p className="section-label">What Liio can do</p><ToggleRow title="Homework mode" description="Guides step by step, never gives the answer" value={homework} onChange={setHomework} /><ToggleRow title="Voice replies" description="Liio can talk out loud" value={voice} onChange={setVoice} /><ToggleRow title="Create world" description="Stories, ideas and drawings" value={create} onChange={setCreate} /></section>
    <button className="pause-outline">Pause Liio now</button>
  </>;
}

function ToggleRow({ title, description, value, onChange }: { title: string; description: string; value: boolean; onChange: (value: boolean) => void }) {
  return <div className="toggle-row"><div className="toggle-row__copy"><strong>{title}</strong><span>{description}</span></div><button className={`toggle ${value ? "toggle--on" : ""}`} role="switch" aria-checked={value} aria-label={title} onClick={() => onChange(!value)} /></div>;
}

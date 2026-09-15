import { BackButton, MobileShell } from "../components/ui";

const sessions = [
  ["#3091ff", "Homework — fractions", "Today 17:20 · 24 min"],
  ["#ffb224", "Practice — times tables", "Today 16:05 · 12 min"],
  ["#13be91", "Learn — why volcanoes erupt", "Yesterday 19:40 · 18 min"],
  ["#ff6961", "Create — a story about a turtle", "Yesterday 18:04 · 9 min"],
];

export default function ActivityPage() {
  return <MobileShell><section className="detail-page"><BackButton href="/parents-home" /><h1>Andrew</h1>
    <div className="segmented"><button className="segment">Today</button><button className="segment segment--active">This week</button></div>
    <div className="stats"><div className="stat"><strong>2h 40</strong><span>time</span></div><div className="stat"><strong>38</strong><span>questions</span></div><div className="stat"><strong>4</strong><span>worlds</span></div></div>
    <section className="sessions"><p className="section-label">Sessions</p>{sessions.map(([color, title, meta]) => <div className="session-row" key={title}><span className="session-dot" style={{ background: color }} /><div className="session-copy"><strong>{title}</strong><span>{meta}</span></div></div>)}</section>
    <section className="privacy-card card"><strong>Andrew is 9 — you see everything</strong><span>From 13, Liio shows you topics and alerts, not full conversations.</span></section>
  </section></MobileShell>;
}

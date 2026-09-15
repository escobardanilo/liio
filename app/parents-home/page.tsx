import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { MobileShell } from "../components/ui";
import { ParentsDrawer } from "../components/parents-drawer";

export default function ParentsHomePage() {
  return <MobileShell><section className="parent-page">
    <header className="parent-header"><h1>Parents</h1><ParentsDrawer /></header>
    <div className="profiles">
      <div className="profile profile--active"><div className="profile__avatar">A</div><span>Andrew</span></div>
      <div className="profile"><div className="profile__avatar">S</div><span>Sofia</span></div>
      <button className="profile" aria-label="Add child profile"><span className="profile__avatar profile__avatar--add"><Plus size={31} /></span><span>Add</span></button>
    </div>
    <section className="live-card"><div className="live-card__eyebrow"><span className="live-card__dot" />LIVE NOW</div><h2>Andrew is using Liio</h2><div className="live-card__bottom"><span className="live-card__activity">Homework · 12 min</span><button className="pause-pill">Pause</button></div></section>
    <section className="usage-card card"><p className="section-label">Today</p><strong>34 of 60 min</strong><div className="progress"><span /></div></section>
    <button className="review-card tap-card" style={{ width: "100%", textAlign: "left" }}><span className="review-card__dot" /><span className="review-card__copy"><strong>1 message to review</strong><span>Yesterday, 18:04</span></span><ChevronRight size={28} color="#645b6e" /></button>
    <section className="manage"><p className="section-label">Manage</p><nav>
      <Link className="row-link" href="/activity"><span>Activity</span><ChevronRight size={28} color="#645b6e" /></Link>
      <Link className="row-link" href="/time-limits"><span>Time &amp; limits</span><ChevronRight size={28} color="#645b6e" /></Link>
      <Link className="row-link" href="/device-codes"><span>Devices &amp; codes</span><ChevronRight size={28} color="#645b6e" /></Link>
    </nav></section>
  </section></MobileShell>;
}

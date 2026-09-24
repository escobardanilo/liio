import Link from "next/link";
import { ArrowRight, HardHat, ShieldCheck } from "lucide-react";
import { DemoBadge, SonBrand } from "./components/son-shell";

export default function HomePage() {
  return (
    <main className="entry-screen">
      <header className="entry-header"><SonBrand /><DemoBadge /></header>
      <section className="entry-hero">
        <div className="entry-hero__copy">
          <p className="eyebrow">Industrial operations intelligence</p>
          <h1>Operational knowledge,<br />when the team needs it.</h1>
          <p>SON helps operators, technicians and supervisors understand procedures, investigate issues and make better-informed operational decisions.</p>
        </div>
        <div className="entry-options" aria-label="Choose workspace">
          <Link className="entry-option entry-option--primary" href="/operations"><span className="entry-option__icon"><HardHat size={24} /></span><span><strong>Operator Workspace</strong><small>Ask, investigate and follow procedures</small></span><ArrowRight size={21} /></Link>
          <Link className="entry-option" href="/supervisor"><span className="entry-option__icon"><ShieldCheck size={24} /></span><span><strong>Supervisor Area</strong><small>Monitor operations, alerts and escalations</small></span><ArrowRight size={21} /></Link>
        </div>
      </section>
      <footer className="entry-footer"><span>SON</span><span>System Operations Navigator</span><span>Demo environment · No production systems connected</span></footer>
    </main>
  );
}

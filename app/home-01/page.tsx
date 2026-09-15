import Link from "next/link";
import { ChevronRight, LockKeyhole } from "lucide-react";
import { Brand, MobileShell } from "../components/ui";
import { Mascot } from "../components/mascot";

export default function EntryPage() {
  return <MobileShell className="app-shell--lavender"><section className="select-page">
    <Brand small />
    <h1 className="select-page__title">Who is signing in?</h1>
    <Link className="entry-card entry-card--child tap-card" href="/homework">
      <div className="entry-card__mascot"><Mascot width={112} height={96} /></div>
      <div className="entry-card__copy"><strong>Enter LIIO</strong><span>For children and teens</span></div>
      <span className="entry-card__arrow"><ChevronRight size={22} strokeWidth={3} /></span>
    </Link>
    <Link className="entry-card entry-card--parent tap-card" href="/responsible-area">
      <div className="entry-card__lock"><LockKeyhole size={43} strokeWidth={2.2} /></div>
      <div className="entry-card__copy"><strong>Parents Area</strong><span>Manage profiles, permissions<br />and security</span></div>
      <span className="entry-card__arrow"><ChevronRight size={22} strokeWidth={3} /></span>
    </Link>
  </section></MobileShell>;
}

import Link from "next/link";
import { Activity, AlertTriangle, ArrowLeft, Boxes, FileClock, Radio, Users } from "lucide-react";
import { DemoBadge, SonBrand } from "../components/son-shell";

const metrics = [["Active Sessions", "3", Radio], ["Operators", "12", Users], ["Equipment", "28", Boxes], ["Open Alerts", "2", AlertTriangle]] as const;

export default function SupervisorPage() {
  return <main className="supervisor-page">
    <header className="supervisor-topbar"><SonBrand /><div><DemoBadge /><Link href="/operations"><ArrowLeft size={17} />Operator Workspace</Link></div></header>
    <section className="supervisor-content"><div className="page-heading"><div><p className="eyebrow">Supervisor Area</p><h1>Operations overview</h1><p>Local demonstration data for team and asset visibility.</p></div></div>
      <div className="metric-grid">{metrics.map(([label, value, Icon]) => <article key={label}><span><Icon size={19} /></span><strong>{value}</strong><small>{label}</small></article>)}</div>
      <div className="supervisor-grid"><section className="panel live-operations"><div className="panel-heading"><div><p className="eyebrow">Active sessions</p><h2>Live operations</h2></div></div><article><span className="live-indicator" /><div><strong>Operator 04 is troubleshooting Conveyor L3</strong><p>Error E42 · Started 8 minutes ago</p></div><span className="status status--in-progress">In progress</span></article><article><span className="live-indicator" /><div><strong>Operator 02 is reviewing a startup procedure</strong><p>Packaging Line · SOP-PK-002</p></div><span className="status status--completed">Reviewing</span></article></section><section className="panel escalation-panel"><div className="panel-heading"><div><p className="eyebrow">Escalations</p><h2>Needs attention</h2></div></div><article><AlertTriangle size={20} /><div><strong>Pump P-204</strong><p>Pressure observation requires authorized review.</p></div></article><article><AlertTriangle size={20} /><div><strong>Conveyor L3</strong><p>Repeated E42 alarm in demo session.</p></div></article></section></div>
      <div className="supervisor-grid supervisor-grid--lower"><section className="panel compact-list"><div className="panel-heading"><div><p className="eyebrow">Procedures accessed</p><h2>Document activity</h2></div><FileClock size={20} /></div><p><strong>SOP-PK-002</strong><span>6 views today</span></p><p><strong>MP-22</strong><span>3 views today</span></p><p><strong>SOP-L3-014</strong><span>2 views today</span></p></section><section className="panel compact-list"><div className="panel-heading"><div><p className="eyebrow">Activity history</p><h2>Latest events</h2></div><Activity size={20} /></div><p><strong>Observation escalated</strong><span>09:31</span></p><p><strong>Procedure completed</strong><span>09:18</span></p><p><strong>Knowledge accessed</strong><span>08:54</span></p></section></div>
    </section>
  </main>;
}

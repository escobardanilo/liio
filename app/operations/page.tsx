import Link from "next/link";
import { ArrowRight, Bot, Boxes, FileText, MessageSquareWarning, Wrench } from "lucide-react";
import { DemoBadge, PageHeading, SonShell } from "../components/son-shell";

const actions = [
  { href: "/assistant", label: "Ask SON", description: "Get operational guidance", icon: Bot, primary: true },
  { href: "/assistant", label: "Troubleshoot", description: "Investigate an issue step by step", icon: Wrench },
  { href: "/knowledge", label: "Procedures", description: "Browse controlled documents", icon: FileText },
  { href: "/equipment", label: "Equipment", description: "View asset information", icon: Boxes },
  { href: "/report-issue", label: "Report Issue", description: "Create a local demo report", icon: MessageSquareWarning },
];

const activity = [
  ["Conveyor L3", "Error E42 investigation", "8 min ago", "In progress"],
  ["Packaging Line", "Startup procedure", "42 min ago", "Completed"],
  ["Pump P-204", "Pressure inspection", "Yesterday", "Escalated"],
];

export default function OperationsPage() {
  return <SonShell active="operations">
    <PageHeading eyebrow="Operator workspace" title="Good morning." description="What do you need help with?" action={<DemoBadge />} />
    <section className="action-grid" aria-label="Operational actions">{actions.map(({ href, label, description, icon: Icon, primary }) => <Link className={`action-card ${primary ? "action-card--primary" : ""}`} href={href} key={label}><span className="action-card__icon"><Icon size={22} strokeWidth={1.9} /></span><span><strong>{label}</strong><small>{description}</small></span><ArrowRight size={18} /></Link>)}</section>
    <section className="panel recent-panel"><div className="panel-heading"><div><p className="eyebrow">Demo data</p><h2>Recent activity</h2></div><Link href="/activity">View all <ArrowRight size={15} /></Link></div><div className="activity-table" role="table" aria-label="Recent demo activity"><div className="activity-table__header" role="row"><span>Asset</span><span>Activity</span><span>Updated</span><span>Status</span></div>{activity.map(([asset, item, time, status]) => <div className="activity-table__row" role="row" key={`${asset}-${item}`}><strong>{asset}</strong><span>{item}</span><span>{time}</span><span className={`status status--${status.toLowerCase().replace(" ", "-")}`}>{status}</span></div>)}</div></section>
  </SonShell>;
}

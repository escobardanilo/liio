import { AlertTriangle, CheckCircle2, FileText, Wrench } from "lucide-react";
import { DemoBadge, PageHeading, SonShell } from "../components/son-shell";

const events = [
  { time: "09:42", title: "Troubleshooting started", detail: "Operator 04 · Conveyor L3 · Error E42", type: "Investigation", icon: Wrench },
  { time: "09:18", title: "Procedure completed", detail: "Operator 02 · Packaging Line · SOP-PK-002", type: "Completed", icon: CheckCircle2 },
  { time: "Yesterday", title: "Observation escalated", detail: "Pump P-204 · Pressure outside expected range", type: "Escalation", icon: AlertTriangle },
  { time: "Yesterday", title: "Document accessed", detail: "Conveyor_X200_Manual.pdf · Page 83", type: "Knowledge", icon: FileText },
];

export default function ActivityPage() {
  return <SonShell active="activity"><PageHeading eyebrow="Activity" title="Operational history" description="A local timeline of demonstration sessions and events." action={<DemoBadge />} /><section className="panel timeline">{events.map(({ time, title, detail, type, icon: Icon }) => <article className="timeline__item" key={`${time}-${title}`}><span className="timeline__icon"><Icon size={18} /></span><div><strong>{title}</strong><p>{detail}</p><small>{time}</small></div><span className="event-type">{type}</span></article>)}</section></SonShell>;
}

import { BookCopy, FileCheck2, FileCog, FileText, ScrollText, ShieldAlert } from "lucide-react";
import { DemoBadge, PageHeading, SonShell } from "../components/son-shell";

const categories = [
  ["Manuals", "Equipment operation and reference", BookCopy, "12 demo files"],
  ["SOPs", "Standard operating procedures", ScrollText, "8 demo files"],
  ["Work Instructions", "Task-level instructions", FileCheck2, "15 demo files"],
  ["Safety Procedures", "Controlled safety guidance", ShieldAlert, "6 demo files"],
  ["Technical Datasheets", "Asset specifications", FileCog, "9 demo files"],
  ["Maintenance Records", "Service history and notes", FileText, "24 demo records"],
] as const;

const demoDocuments = [
  ["SOP-L3-014", "Conveyor L3 restart and inspection", "SOP · Revision 4"],
  ["Conveyor_X200_Manual.pdf", "X200 conveyor technical manual", "Manual · 112 pages"],
  ["MP-22", "Scheduled belt tension inspection", "Maintenance procedure"],
];

export default function KnowledgePage() {
  return <SonShell active="knowledge">
    <PageHeading eyebrow="Knowledge" title="Operational knowledge base" description="A RAG-ready interface for controlled industrial documents." action={<DemoBadge />} />
    <div className="notice"><strong>Demonstration content only.</strong><span>No document retrieval pipeline is connected. SON will not claim to have accessed these files.</span></div>
    <section className="knowledge-grid">{categories.map(([title, description, Icon, count]) => <article className="knowledge-card" key={title}><Icon size={22} /><div><strong>{title}</strong><span>{description}</span><small>{count}</small></div></article>)}</section>
    <section className="panel"><div className="panel-heading"><div><p className="eyebrow">Static examples</p><h2>Recently accessed</h2></div></div><div className="document-list">{demoDocuments.map(([code, title, meta]) => <article key={code}><span className="document-icon"><FileText size={20} /></span><div><strong>{title}</strong><span>{code}</span></div><small>{meta}</small></article>)}</div></section>
  </SonShell>;
}

"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { DemoBadge, PageHeading } from "./son-shell";

export function IssueReportForm() {
  const [submitted, setSubmitted] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSubmitted(true); };
  if (submitted) return <section className="report-page"><PageHeading eyebrow="Report issue" title="Demo report recorded" description="This confirmation is local only. No production workflow or external system was contacted." action={<DemoBadge />} /><div className="report-success"><CheckCircle2 size={32} /><h2>Report ready for review</h2><p>An authorized supervisor would review and route this observation in a connected deployment.</p><Link className="primary-link" href="/operations">Return to Operations</Link></div></section>;
  return <section className="report-page"><Link className="back-link" href="/operations"><ArrowLeft size={18} />Back to Operations</Link><PageHeading eyebrow="Report issue" title="Record an operational observation" description="Capture a local demonstration report for supervisor review." action={<DemoBadge />} /><form className="report-form" onSubmit={submit}><label>Equipment or area<input name="asset" required placeholder="e.g. Conveyor L3" /></label><label>Issue category<select name="category" defaultValue=""><option value="" disabled>Select a category</option><option>Alarm or fault</option><option>Unexpected observation</option><option>Procedure question</option><option>Safety concern</option></select></label><label className="report-form__wide">Observation<textarea name="observation" required rows={5} placeholder="Describe what you observed. Do not perform an unsafe intervention." /></label><div className="report-form__wide notice"><strong>Local demonstration only.</strong><span>This form does not notify a real supervisor or create a production ticket.</span></div><button className="primary-link report-submit" type="submit">Record demo report</button></form></section>;
}

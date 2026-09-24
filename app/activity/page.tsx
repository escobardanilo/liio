"use client";

import { AlertTriangle, CheckCircle2, FileText, Wrench } from "lucide-react";
import type { TranslationKey } from "../../lib/i18n/translations";
import { useLocale } from "../components/locale-provider";
import { DemoBadge, PageHeading, SonShell } from "../components/son-shell";

const events = [
  { time: "09:42", title: "activity.troubleshooting", detail: "activity.troubleshootingDetail", type: "activity.investigation", icon: Wrench },
  { time: "09:18", title: "activity.procedure", detail: "activity.procedureDetail", type: "status.completed", icon: CheckCircle2 },
  { time: "time.yesterday", title: "activity.escalated", detail: "activity.escalatedDetail", type: "status.escalated", icon: AlertTriangle },
  { time: "time.yesterday", title: "activity.document", detail: null, type: "activity.knowledge", icon: FileText },
] satisfies Array<{ time: string; title: TranslationKey; detail: TranslationKey | null; type: TranslationKey; icon: typeof Wrench }>;

export default function ActivityPage() {
  const { t } = useLocale();
  return <SonShell active="activity"><PageHeading eyebrow={t("activity.eyebrow")} title={t("activity.title")} description={t("activity.description")} action={<DemoBadge />} /><section className="panel timeline">{events.map(({ time, title, detail, type, icon: Icon }) => <article className="timeline__item" key={`${time}-${title}`}><span className="timeline__icon"><Icon size={18} /></span><div><strong>{t(title)}</strong><p>{detail ? t(detail) : "Conveyor_X200_Manual.pdf · Page 83"}</p><small>{time.includes(".") ? t(time as TranslationKey) : time}</small></div><span className="event-type">{t(type)}</span></article>)}</section></SonShell>;
}

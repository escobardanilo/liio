"use client";

import Link from "next/link";
import { ArrowRight, Bot, Boxes, FileText, MessageSquareWarning, Wrench } from "lucide-react";
import type { TranslationKey } from "../../lib/i18n/translations";
import { useLocale } from "./locale-provider";
import { DemoBadge, PageHeading } from "./son-shell";

const actions: Array<{ href: string; label: TranslationKey; description: TranslationKey; icon: typeof Bot; primary?: boolean }> = [
  { href: "/assistant", label: "action.ask", description: "action.askDesc", icon: Bot, primary: true },
  { href: "/assistant", label: "action.troubleshoot", description: "action.troubleshootDesc", icon: Wrench },
  { href: "/knowledge", label: "action.procedures", description: "action.proceduresDesc", icon: FileText },
  { href: "/equipment", label: "action.equipment", description: "action.equipmentDesc", icon: Boxes },
  { href: "/report-issue", label: "action.report", description: "action.reportDesc", icon: MessageSquareWarning },
];

const activity: Array<[string, TranslationKey, TranslationKey, TranslationKey]> = [
  ["Conveyor L3", "recent.e42", "time.8min", "status.progress"],
  ["Packaging Line", "recent.startup", "time.42min", "status.completed"],
  ["Pump P-204", "recent.pressure", "time.yesterday", "status.escalated"],
];

export function OperationsOverview() {
  const { t } = useLocale();
  return <>
    <PageHeading eyebrow={t("overview.eyebrow")} title={t("overview.title")} description={t("overview.description")} action={<DemoBadge />} />
    <section className="action-grid" aria-label={t("overview.actions")}>{actions.map(({ href, label, description, icon: Icon, primary }) => <Link className={`action-card ${primary ? "action-card--primary" : ""}`} href={href} key={label}><span className="action-card__icon"><Icon size={22} strokeWidth={1.9} /></span><span><strong>{t(label)}</strong><small>{t(description)}</small></span><ArrowRight size={18} /></Link>)}</section>
    <section className="panel recent-panel"><div className="panel-heading"><div><p className="eyebrow">{t("common.demoData")}</p><h2>{t("recent.title")}</h2></div><Link href="/activity">{t("recent.viewAll")} <ArrowRight size={15} /></Link></div><div className="activity-table" role="table"><div className="activity-table__header" role="row"><span>{t("recent.asset")}</span><span>{t("recent.activity")}</span><span>{t("recent.updated")}</span><span>{t("recent.status")}</span></div>{activity.map(([asset, item, time, status]) => <div className="activity-table__row" role="row" key={`${asset}-${item}`}><strong>{asset}</strong><span>{t(item)}</span><span>{t(time)}</span><span className={`status status--${status.split(".")[1]}`}>{t(status)}</span></div>)}</div></section>
  </>;
}

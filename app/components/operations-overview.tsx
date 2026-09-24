"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Bot, Boxes, FileText, MessageSquareWarning, TriangleAlert, Wrench } from "lucide-react";
import { FormEvent, useState } from "react";
import type { TranslationKey } from "../../lib/i18n/translations";
import { useLocale } from "./locale-provider";
import { DemoBadge, PageHeading } from "./son-shell";

const activity: Array<[string, TranslationKey, TranslationKey, TranslationKey]> = [["Conveyor L3", "recent.e42", "time.8min", "status.progress"], ["Packaging Line", "recent.startup", "time.42min", "status.completed"], ["Pump P-204", "recent.pressure", "time.yesterday", "status.escalated"]];
const tools: Array<[string, TranslationKey, typeof Wrench]> = [["/assistant", "action.troubleshoot", Wrench], ["/knowledge", "action.procedures", FileText], ["/equipment", "action.equipment", Boxes], ["/report-issue", "action.report", MessageSquareWarning]];

export function OperationsOverview() {
  const { t } = useLocale(); const router = useRouter(); const [command, setCommand] = useState("");
  const submitCommand = (event: FormEvent) => { event.preventDefault(); const value = command.trim(); if (!value) return; sessionStorage.setItem("son-command", value); router.push("/assistant"); };
  return <div className="overview-console">
    <PageHeading eyebrow={t("overview.eyebrow")} title={t("overview.operationalTitle")} description={t("overview.operationalDescription")} action={<DemoBadge />} />
    <form className="command-bar" onSubmit={submitCommand}><Bot size={22} /><div><strong>{t("overview.askTitle")}</strong><input value={command} onChange={(event) => setCommand(event.target.value)} placeholder={t("assistant.placeholder")} aria-label={t("assistant.placeholder")} /></div><button type="submit" disabled={!command.trim()}>{t("overview.openAssistant")}<ArrowRight size={17} /></button></form>
    <div className="overview-grid"><section className="overview-metrics"><article><span>{t("overview.activeInvestigations")}</span><strong>2</strong><small>{t("overview.updatedNow")}</small></article><article><span>{t("overview.escalations")}</span><strong>1</strong><small>{t("overview.requiresReview")}</small></article></section><section className="panel attention-panel"><div className="panel-heading"><div><p className="eyebrow">{t("common.demoData")}</p><h2>{t("overview.attention")}</h2></div><TriangleAlert size={19} /></div><div className="attention-list"><div><span><strong>Conveyor L3</strong><small>CV-L3 · {t("equipment.material")}</small></span><span className="status status--attention">{t("equipment.attention")}</span></div><div><span><strong>Pump P-204</strong><small>P-204 · {t("equipment.utilities")}</small></span><span className="status status--inspection">{t("equipment.inspection")}</span></div></div></section></div>
    <section className="panel operations-table-panel"><div className="panel-heading"><div><p className="eyebrow">{t("common.demoData")}</p><h2>{t("overview.activeRecent")}</h2></div><Link href="/activity">{t("recent.viewAll")} <ArrowRight size={15} /></Link></div><div className="activity-table" role="table"><div className="activity-table__header" role="row"><span>{t("recent.asset")}</span><span>{t("recent.activity")}</span><span>{t("recent.status")}</span><span>{t("recent.updated")}</span></div>{activity.map(([asset, item, time, status]) => <div className="activity-table__row" role="row" key={`${asset}-${item}`}><strong>{asset}</strong><span>{t(item)}</span><span className={`status status--${status.split(".")[1]}`}>{t(status)}</span><span>{t(time)}</span></div>)}</div></section>
    <section className="quick-tools"><span>{t("overview.quickTools")}</span>{tools.map(([href, label, Icon]) => <Link href={href} key={label}><Icon size={16} />{t(label)}</Link>)}</section>
  </div>;
}

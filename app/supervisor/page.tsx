"use client";

import { Activity, AlertTriangle, Boxes, FileClock, Radio, Users } from "lucide-react";
import type { TranslationKey } from "../../lib/i18n/translations";
import { useLocale } from "../components/locale-provider";
import { DemoBadge, PageHeading, SonShell } from "../components/son-shell";

const metrics: Array<[TranslationKey, string, typeof Radio]> = [
  ["supervisor.activeSessions", "3", Radio], ["supervisor.operators", "12", Users], ["nav.equipment", "28", Boxes], ["supervisor.openAlerts", "2", AlertTriangle],
];

export default function SupervisorPage() {
  const { t } = useLocale();
  return <SonShell active="supervisor">
    <PageHeading eyebrow={t("supervisor.eyebrow")} title={t("supervisor.title")} description={t("supervisor.description")} action={<DemoBadge />} />
    <div className="metric-grid">{metrics.map(([label, value, Icon]) => <article key={label}><span><Icon size={19} /></span><strong>{value}</strong><small>{t(label)}</small></article>)}</div>
    <div className="supervisor-grid"><section className="panel live-operations"><div className="panel-heading"><div><p className="eyebrow">{t("supervisor.activeSessions")}</p><h2>{t("supervisor.live")}</h2></div></div><article><span className="live-indicator" /><div><strong>{t("supervisor.session1")}</strong><p>{t("supervisor.session1Meta")}</p></div><span className="status status--in-progress">{t("status.progress")}</span></article><article><span className="live-indicator" /><div><strong>{t("supervisor.session2")}</strong><p>Packaging Line · SOP-PK-002</p></div><span className="status status--completed">{t("supervisor.reviewing")}</span></article></section>
      <section className="panel escalation-panel"><div className="panel-heading"><div><p className="eyebrow">{t("supervisor.escalations")}</p><h2>{t("supervisor.attention")}</h2></div></div><article><AlertTriangle size={20} /><div><strong>Pump P-204</strong><p>{t("supervisor.pump")}</p></div></article><article><AlertTriangle size={20} /><div><strong>Conveyor L3</strong><p>{t("supervisor.conveyor")}</p></div></article></section></div>
    <div className="supervisor-grid supervisor-grid--lower"><section className="panel compact-list"><div className="panel-heading"><div><p className="eyebrow">{t("supervisor.procedures")}</p><h2>{t("supervisor.documentActivity")}</h2></div><FileClock size={20} /></div><p><strong>SOP-PK-002</strong><span>{t("supervisor.views6")}</span></p><p><strong>MP-22</strong><span>{t("supervisor.views3")}</span></p><p><strong>SOP-L3-014</strong><span>{t("supervisor.views2")}</span></p></section><section className="panel compact-list"><div className="panel-heading"><div><p className="eyebrow">{t("supervisor.history")}</p><h2>{t("supervisor.latest")}</h2></div><Activity size={20} /></div><p><strong>{t("activity.escalated")}</strong><span>09:31</span></p><p><strong>{t("activity.procedure")}</strong><span>09:18</span></p><p><strong>{t("supervisor.knowledgeAccessed")}</strong><span>08:54</span></p></section></div>
  </SonShell>;
}

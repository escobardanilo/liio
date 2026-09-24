"use client";

import { BookCopy, FileCheck2, FileCog, FileText, ScrollText, ShieldAlert } from "lucide-react";
import type { TranslationKey } from "../../lib/i18n/translations";
import { useLocale } from "../components/locale-provider";
import { DemoBadge, PageHeading, SonShell } from "../components/son-shell";

const categories = [
  ["knowledge.manuals", "knowledge.manualsDesc", BookCopy, "knowledge.demoFiles", 12],
  ["knowledge.sops", "knowledge.sopsDesc", ScrollText, "knowledge.demoFiles", 8],
  ["knowledge.instructions", "knowledge.instructionsDesc", FileCheck2, "knowledge.demoFiles", 15],
  ["knowledge.safety", "knowledge.safetyDesc", ShieldAlert, "knowledge.demoFiles", 6],
  ["knowledge.datasheets", "knowledge.datasheetsDesc", FileCog, "knowledge.demoFiles", 9],
  ["knowledge.records", "knowledge.recordsDesc", FileText, "knowledge.demoRecords", 24],
] as const satisfies ReadonlyArray<readonly [TranslationKey, TranslationKey, typeof BookCopy, TranslationKey, number]>;

const demoDocuments = [
  ["SOP-L3-014", "knowledge.docConveyor", "knowledge.revision"], ["Conveyor_X200_Manual.pdf", "knowledge.docManual", "knowledge.pages"], ["MP-22", "knowledge.docBelt", "knowledge.maintenanceProcedure"],
] as const satisfies ReadonlyArray<readonly [string, TranslationKey, TranslationKey]>;

export default function KnowledgePage() {
  const { t } = useLocale();
  return <SonShell active="knowledge">
    <PageHeading eyebrow={t("knowledge.eyebrow")} title={t("knowledge.title")} description={t("knowledge.description")} action={<DemoBadge />} />
    <div className="notice"><strong>{t("knowledge.noticeTitle")}</strong><span>{t("knowledge.notice")}</span></div>
    <section className="knowledge-grid">{categories.map(([title, description, Icon, countKey, count]) => <article className="knowledge-card" key={title}><Icon size={22} /><div><strong>{t(title)}</strong><span>{t(description)}</span><small>{t(countKey, { count })}</small></div></article>)}</section>
    <section className="panel"><div className="panel-heading"><div><p className="eyebrow">{t("knowledge.static")}</p><h2>{t("knowledge.recent")}</h2></div></div><div className="document-list">{demoDocuments.map(([code, title, meta]) => <article key={code}><span className="document-icon"><FileText size={20} /></span><div><strong>{t(title)}</strong><span>{code}</span></div><small>{t(meta)}</small></article>)}</div></section>
  </SonShell>;
}

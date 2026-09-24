"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { useLocale } from "./locale-provider";
import { DemoBadge, PageHeading } from "./son-shell";

export function IssueReportForm() {
  const { t } = useLocale();
  const [submitted, setSubmitted] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSubmitted(true); };
  if (submitted) return <section className="report-page"><PageHeading eyebrow={t("report.eyebrow")} title={t("report.successTitle")} description={t("report.successDescription")} action={<DemoBadge />} /><div className="report-success"><CheckCircle2 size={32} /><h2>{t("report.ready")}</h2><p>{t("report.readyDescription")}</p><Link className="primary-link" href="/">{t("report.return")}</Link></div></section>;
  return <section className="report-page"><Link className="back-link" href="/"><ArrowLeft size={18} />{t("common.backOverview")}</Link><PageHeading eyebrow={t("report.eyebrow")} title={t("report.title")} description={t("report.description")} action={<DemoBadge />} /><form className="report-form" onSubmit={submit}><label>{t("report.asset")}<input name="asset" required placeholder={t("report.assetPlaceholder")} /></label><label>{t("report.category")}<select name="category" defaultValue=""><option value="" disabled>{t("report.select")}</option><option>{t("report.alarm")}</option><option>{t("report.unexpected")}</option><option>{t("report.procedure")}</option><option>{t("report.safety")}</option></select></label><label className="report-form__wide">{t("report.observation")}<textarea name="observation" required rows={5} placeholder={t("report.observationPlaceholder")} /></label><div className="report-form__wide notice"><strong>{t("common.localOnly")}</strong><span>{t("report.notice")}</span></div><button className="primary-link report-submit" type="submit">{t("report.submit")}</button></form></section>;
}

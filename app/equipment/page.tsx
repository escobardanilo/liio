"use client";

import { Boxes, CircleCheck, Gauge, Search, TriangleAlert } from "lucide-react";
import type { TranslationKey } from "../../lib/i18n/translations";
import { useLocale } from "../components/locale-provider";
import { DemoBadge, PageHeading, SonShell } from "../components/son-shell";

const equipment = [
  { id: "CV-L3", name: "Conveyor L3", area: "equipment.material", status: "equipment.attention", state: "attention", icon: TriangleAlert },
  { id: "PK-01", name: "Packaging Line", area: "equipment.packaging", status: "equipment.operational", state: "operational", icon: CircleCheck },
  { id: "P-204", name: "Pump P-204", area: "equipment.utilities", status: "equipment.inspection", state: "inspection-due", icon: Gauge },
  { id: "MX-08", name: "Mixer MX-08", area: "equipment.processing", status: "equipment.operational", state: "operational", icon: CircleCheck },
] satisfies Array<{ id: string; name: string; area: TranslationKey; status: TranslationKey; state: string; icon: typeof Boxes }>;

export default function EquipmentPage() {
  const { t } = useLocale();
  return <SonShell active="equipment">
    <PageHeading eyebrow={t("equipment.eyebrow")} title={t("equipment.title")} description={t("equipment.description")} action={<DemoBadge />} />
    <label className="search-field"><Search size={19} /><input type="search" placeholder={t("equipment.search")} aria-label={t("equipment.search")} /></label>
    <section className="equipment-grid">{equipment.map(({ id, name, area, status, state, icon: Icon }) => <article className="equipment-card" key={id}><div className="equipment-card__top"><span className="equipment-card__icon"><Boxes size={21} /></span><span className={`asset-state asset-state--${state}`}><Icon size={14} />{t(status)}</span></div><div><small>{id}</small><h2>{name}</h2><p>{t(area)}</p></div><button type="button">{t("equipment.view")}</button></article>)}</section>
  </SonShell>;
}

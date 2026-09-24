import { Boxes, CircleCheck, Gauge, Search, TriangleAlert } from "lucide-react";
import { DemoBadge, PageHeading, SonShell } from "../components/son-shell";

const equipment = [
  { id: "CV-L3", name: "Conveyor L3", area: "Material handling", status: "Attention", icon: TriangleAlert },
  { id: "PK-01", name: "Packaging Line", area: "Packaging", status: "Operational", icon: CircleCheck },
  { id: "P-204", name: "Pump P-204", area: "Utilities", status: "Inspection due", icon: Gauge },
  { id: "MX-08", name: "Mixer MX-08", area: "Processing", status: "Operational", icon: CircleCheck },
];

export default function EquipmentPage() {
  return <SonShell active="equipment">
    <PageHeading eyebrow="Equipment" title="Asset directory" description="Review local demonstration assets and operational context." action={<DemoBadge />} />
    <label className="search-field"><Search size={19} /><input type="search" placeholder="Search equipment or asset ID" aria-label="Search equipment" /></label>
    <section className="equipment-grid">{equipment.map(({ id, name, area, status, icon: Icon }) => <article className="equipment-card" key={id}><div className="equipment-card__top"><span className="equipment-card__icon"><Boxes size={21} /></span><span className={`asset-state asset-state--${status.toLowerCase().replaceAll(" ", "-")}`}><Icon size={14} />{status}</span></div><div><small>{id}</small><h2>{name}</h2><p>{area}</p></div><button type="button">View demo details</button></article>)}</section>
  </SonShell>;
}

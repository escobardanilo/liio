import Link from "next/link";
import {
  Activity,
  BookOpenText,
  Boxes,
  Command,
  LayoutDashboard,
  ShieldCheck,
} from "lucide-react";
import type { ReactNode } from "react";

type NavigationKey = "operations" | "knowledge" | "equipment" | "activity";

const navigation = [
  { key: "operations", href: "/operations", label: "Operations", icon: LayoutDashboard },
  { key: "knowledge", href: "/knowledge", label: "Knowledge", icon: BookOpenText },
  { key: "equipment", href: "/equipment", label: "Equipment", icon: Boxes },
  { key: "activity", href: "/activity", label: "Activity", icon: Activity },
] as const;

export function SonBrand({ compact = false }: { compact?: boolean }) {
  return (
    <Link className={`son-brand ${compact ? "son-brand--compact" : ""}`} href="/" aria-label="SON home">
      <span className="son-brand__mark"><Command size={compact ? 17 : 20} strokeWidth={2.4} /></span>
      <span className="son-brand__copy"><strong>SON</strong>{!compact && <small>System Operations Navigator</small>}</span>
    </Link>
  );
}

export function DemoBadge() {
  return <span className="demo-badge">Demo environment</span>;
}

export function SonShell({ active, children }: { active: NavigationKey; children: ReactNode }) {
  return (
    <div className="son-app">
      <aside className="son-sidebar">
        <SonBrand />
        <nav className="son-nav" aria-label="Primary navigation">
          {navigation.map(({ key, href, label, icon: Icon }) => (
            <Link className={active === key ? "is-active" : ""} href={href} key={key}>
              <Icon size={19} strokeWidth={2} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="son-sidebar__footer">
          <Link href="/supervisor"><ShieldCheck size={18} />Supervisor Area</Link>
          <DemoBadge />
        </div>
      </aside>

      <div className="son-main">
        <header className="son-mobile-header"><SonBrand compact /><DemoBadge /></header>
        <main className="son-content">{children}</main>
      </div>

      <nav className="son-bottom-nav" aria-label="Mobile navigation">
        {navigation.map(({ key, href, label, icon: Icon }) => (
          <Link className={active === key ? "is-active" : ""} href={href} key={key}>
            <Icon size={20} strokeWidth={2} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function PageHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <header className="page-heading">
      <div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1>{description && <p>{description}</p>}</div>
      {action}
    </header>
  );
}

"use client";

import Link from "next/link";
import { Activity, Bell, BookOpenText, Bot, Boxes, ChevronLeft, ChevronRight, Command, LayoutDashboard, Menu, MessageSquareWarning, ShieldCheck, UserRound, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { locales, type TranslationKey } from "../../lib/i18n/translations";
import { useLocale } from "./locale-provider";

export type NavigationKey = "overview" | "assistant" | "knowledge" | "equipment" | "activity" | "report" | "supervisor";

const navigation: Array<{ key: NavigationKey; href: string; label: TranslationKey; icon: typeof LayoutDashboard }> = [
  { key: "overview", href: "/", label: "nav.overview", icon: LayoutDashboard },
  { key: "assistant", href: "/assistant", label: "nav.assistant", icon: Bot },
  { key: "knowledge", href: "/knowledge", label: "nav.knowledge", icon: BookOpenText },
  { key: "equipment", href: "/equipment", label: "nav.equipment", icon: Boxes },
  { key: "activity", href: "/activity", label: "nav.activity", icon: Activity },
  { key: "report", href: "/report-issue", label: "nav.report", icon: MessageSquareWarning },
];

const pageTitleKeys: Record<NavigationKey, TranslationKey> = {
  overview: "nav.overview", assistant: "nav.assistant", knowledge: "nav.knowledge", equipment: "nav.equipment", activity: "nav.activity", report: "nav.report", supervisor: "nav.supervisor",
};

export function SonBrand({ compact = false }: { compact?: boolean }) {
  const { t } = useLocale();
  return <Link className={`son-brand ${compact ? "son-brand--compact" : ""}`} href="/" aria-label="SON"><span className="son-brand__mark"><Command size={compact ? 17 : 20} strokeWidth={2.4} /></span><span className="son-brand__copy"><strong>SON</strong>{!compact && <small>{t("brand.full")}</small>}</span></Link>;
}

export function DemoBadge() {
  const { t } = useLocale();
  return <span className="demo-badge">{t("common.demo")}</span>;
}

export function SonShell({ active, children }: { active: NavigationKey; children: ReactNode }) {
  const { locale, setLocale, t } = useLocale();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = <>{navigation.map(({ key, href, label, icon: Icon }) => <Link className={active === key ? "is-active" : ""} href={href} key={key} onClick={() => setMobileOpen(false)}><Icon size={19} strokeWidth={2} /><span>{t(label)}</span></Link>)}</>;

  return <div className={`son-app ${collapsed ? "son-app--collapsed" : ""}`}>
    <aside className="son-sidebar">
      <div className="son-sidebar__brand"><SonBrand compact={collapsed} /></div>
      <nav className="son-nav" aria-label={t("nav.primary")}>{links}</nav>
      <div className="son-sidebar__supervisor"><Link className={active === "supervisor" ? "is-active" : ""} href="/supervisor"><ShieldCheck size={19} /><span>{t("nav.supervisor")}</span></Link></div>
      <div className="son-sidebar__footer"><div className="sidebar-profile"><span><UserRound size={18} /></span><span><strong>{t("profile.name")}</strong><small>{t("profile.role")}</small></span></div><button className="sidebar-collapse" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? t("topbar.expand") : t("topbar.collapse")}>{collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}</button></div>
    </aside>

    {mobileOpen && <button className="mobile-drawer-backdrop" aria-label={t("topbar.close")} onClick={() => setMobileOpen(false)} />}
    {mobileOpen && <aside className="mobile-drawer"><header className="mobile-drawer__header"><SonBrand /><button onClick={() => setMobileOpen(false)} aria-label={t("topbar.close")}><X size={21} /></button></header><nav className="son-nav">{links}</nav><div className="son-sidebar__supervisor"><Link className={active === "supervisor" ? "is-active" : ""} href="/supervisor" onClick={() => setMobileOpen(false)}><ShieldCheck size={19} /><span>{t("nav.supervisor")}</span></Link></div></aside>}

    <div className="son-main">
      <header className="app-topbar">
        <div className="app-topbar__left"><button className="mobile-menu-button" onClick={() => setMobileOpen(true)} aria-label={t("topbar.menu")}><Menu size={21} /></button><div><strong>{t(pageTitleKeys[active])}</strong><small>{t("topbar.context")}</small></div></div>
        <div className="app-topbar__actions"><select className="locale-select" value={locale} onChange={(event) => setLocale(event.target.value as typeof locale)} aria-label={t("topbar.language")} title={t("topbar.language")}>{locales.map((item) => <option value={item} key={item}>{item.toUpperCase()}</option>)}</select><button className="topbar-icon" aria-label={t("topbar.notifications")}><Bell size={18} /></button><div className="topbar-profile"><span>O4</span><span><strong>{t("profile.name")}</strong><small>{t("profile.role")}</small></span></div></div>
      </header>
      <main className="son-content">{children}</main>
    </div>

    <nav className="son-bottom-nav" aria-label={t("nav.mobile")}>{navigation.slice(0, 5).map(({ key, href, label, icon: Icon }) => <Link className={active === key ? "is-active" : ""} href={href} key={key}><Icon size={20} strokeWidth={2} /><span>{t(label)}</span></Link>)}</nav>
  </div>;
}

export function PageHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <header className="page-heading"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1>{description && <p>{description}</p>}</div>{action}</header>;
}

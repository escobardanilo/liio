import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

export function MobileShell({
  children,
  className = "",
  fixed = false,
}: {
  children: ReactNode;
  className?: string;
  fixed?: boolean;
}) {
  return (
    <main
      className={`app-shell ${fixed ? "app-shell--fixed" : ""} ${className}`}
    >
      {children}
    </main>
  );
}

export function Brand({
  small = false,
}: {
  small?: boolean;
}) {
  return (
    <div
      className={`brand ${small ? "brand--small" : ""}`}
      aria-label="liio"
    >
      <span className="brand__word">
        liio
      </span>
    </div>
  );
}

export function BackButton({
  href,
}: {
  href: string;
}) {
  return (
    <Link
      className="back-button"
      href={href}
      aria-label="Go back"
    >
      <ChevronLeft
        size={34}
        strokeWidth={2.5}
      />
    </Link>
  );
}

export function DetailHeader({
  href,
  title,
  subtitle,
}: {
  href: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="detail-header">
      <BackButton href={href} />

      <div className="detail-header__copy">
        <h1>{title}</h1>

        {subtitle ? (
          <p>{subtitle}</p>
        ) : null}
      </div>
    </header>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <section className="empty-state">
      {icon ? (
        <div className="empty-state__icon">
          {icon}
        </div>
      ) : null}

      <strong>{title}</strong>
      <p>{description}</p>

      {action ? (
        <div className="empty-state__action">
          {action}
        </div>
      ) : null}
    </section>
  );
}

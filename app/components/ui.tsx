import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

export function MobileShell({ children, className = "", fixed = false }: { children: ReactNode; className?: string; fixed?: boolean }) {
  return <main className={`app-shell ${fixed ? "app-shell--fixed" : ""} ${className}`}>{children}</main>;
}

export function Brand({ small = false }: { small?: boolean }) {
  return (
    <div className={`brand ${small ? "brand--small" : ""}`} aria-label="Liio">
      <span className="brand__word">LIIO</span>
    </div>
  );
}

export function BackButton({ href }: { href: string }) {
  return <Link className="back-button" href={href} aria-label="Go back"><ChevronLeft size={34} strokeWidth={2.5} /></Link>;
}

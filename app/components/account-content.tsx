"use client";

import Link from "next/link";
import { ChevronRight, X } from "lucide-react";

export function AccountContent({ onClose }: { onClose?: () => void }) {
  return <div className="account-content">
    {onClose ? <button className="icon-button" onClick={onClose} aria-label="Close account menu"><X size={30} strokeWidth={2.4} /></button> : <Link className="icon-button" href="/parents-home" aria-label="Close account menu"><X size={30} strokeWidth={2.4} /></Link>}
    <h1>Account</h1>
    <div className="account-profile-card tap-card"><div className="account-avatar">D</div><div className="account-profile-card__copy"><strong>Daniel</strong><span>danieljohnson@email.com</span></div><ChevronRight size={24} color="#645b6e" /></div>
    <section className="account-section"><p className="section-label">Plan</p><div className="account-row"><div className="account-row__stack"><strong>Liio Family</strong><span>€4.99 / month · renews 12 Sep</span></div><ChevronRight size={24} color="#645b6e" /></div></section>
    <section className="account-section"><p className="section-label">Your child&apos;s data</p><div className="account-row"><strong>Download everything</strong><ChevronRight size={24} color="#645b6e" /></div><div className="account-row account-row--danger"><strong>Delete everything</strong><ChevronRight size={24} /></div></section>
    <section className="account-section"><p className="section-label">Support</p><div className="account-row"><strong>Help</strong><ChevronRight size={24} color="#645b6e" /></div><div className="account-row"><strong>Terms &amp; Privacy</strong><ChevronRight size={24} color="#645b6e" /></div></section>
    <Link className="logout-button primary-button" href="/home-01">Log out</Link>
  </div>;
}

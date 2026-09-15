import Link from "next/link";
import { KeyRound, Mail } from "lucide-react";
import { BackButton, Brand, MobileShell } from "../components/ui";

export default function ResponsibleAreaPage() {
  return <MobileShell className="app-shell--lavender"><section className="auth-page">
    <div className="auth-page__top"><BackButton href="/home-01" /><Brand small /></div>
    <h1 className="auth-page__heading">Parents Area</h1>
    <p className="auth-page__subheading">Sign in to create and manage profiles</p>
    <div className="auth-list">
      <Link className="auth-button" href="/parents-home"><span className="auth-symbol auth-symbol--apple">●</span>Continue with Apple</Link>
      <Link className="auth-button" href="/parents-home"><span className="auth-symbol auth-symbol--google">G</span>Continue with Google</Link>
      <Link className="auth-button" href="/parents-home"><Mail size={23} />Sign in with email</Link>
      <Link className="auth-button" href="/parents-home"><KeyRound size={23} />Use passkey</Link>
    </div>
    <Link className="create-family" href="/parents-home">Create family</Link>
  </section></MobileShell>;
}

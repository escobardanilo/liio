import { TimeSettings } from "../components/time-settings";
import { BackButton, MobileShell } from "../components/ui";

export default function TimeLimitsPage() {
  return <MobileShell><section className="detail-page"><BackButton href="/parents-home" /><h1>Time &amp; limits</h1><TimeSettings /></section></MobileShell>;
}

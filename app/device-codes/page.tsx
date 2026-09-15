import { MockQr } from "../components/mock-qr";
import { BackButton, MobileShell } from "../components/ui";

export default function DeviceCodesPage() {
  return <MobileShell><section className="detail-page device-page"><BackButton href="/parents-home" /><h1>Add a device</h1><p className="detail-subtitle">Point your child&apos;s camera<br />at this code.</p>
    <div className="qr-card"><MockQr /></div><p className="device-helper">No camera? Enter this code</p><div className="device-code">K49 P2M</div><p className="expires">Expires in 9:47</p>
    <button className="primary-button share-code">Share code</button><button className="new-code">New code</button><p className="device-note">Works once, on one device.</p>
  </section></MobileShell>;
}

import { OperationsOverview } from "./components/operations-overview";
import { SonShell } from "./components/son-shell";

export default function HomePage() {
  return <SonShell active="overview"><OperationsOverview /></SonShell>;
}

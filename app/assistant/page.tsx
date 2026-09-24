import { OperationalChat } from "../components/operational-chat";
import { SonShell } from "../components/son-shell";

export default function AssistantPage() {
  return <SonShell active="operations"><OperationalChat /></SonShell>;
}

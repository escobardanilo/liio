"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Mascot } from "./mascot";
import { Brand, MobileShell } from "./ui";

export function SplashScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<"idle" | "drop" | "squash" | "jump">("idle");
  useEffect(() => {
    const timers = [window.setTimeout(() => setPhase("drop"), 1250), window.setTimeout(() => setPhase("squash"), 1950), window.setTimeout(() => setPhase("jump"), 2300), window.setTimeout(() => router.push("/home-01"), 3000)];
    return () => timers.forEach(window.clearTimeout);
  }, [router]);
  const pose = { idle: { y: 0, scaleX: 1, scaleY: 1 }, drop: { y: 36, scaleX: 1.02, scaleY: .98 }, squash: { y: 48, scaleX: 1.16, scaleY: .76 }, jump: { y: -76, scaleX: .9, scaleY: 1.16 } }[phase];
  return (
    <MobileShell fixed><section className="splash" aria-label="Liio loading screen">
      <motion.div className="splash__mascot-wrap" animate={pose} transition={{ type: "spring", stiffness: 145, damping: phase === "jump" ? 11 : 18, mass: .9 }}>
        <Mascot interactive idle width={132} height={120} />
        <motion.div className="mascot-shadow" animate={{ scaleX: phase === "jump" ? .62 : phase === "squash" ? 1.18 : 1, opacity: phase === "jump" ? .05 : .1 }} transition={{ duration: .28 }} />
      </motion.div>
      <motion.div className="splash__brand" animate={{ scale: phase === "squash" ? .97 : phase === "jump" ? 1.04 : 1 }} transition={{ type: "spring", stiffness: 160, damping: 15 }}><Brand /></motion.div>
    </section></MobileShell>
  );
}

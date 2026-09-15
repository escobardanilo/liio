"use client";

import { AnimatePresence, motion } from "motion/react";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { AccountContent } from "./account-content";

export function ParentsDrawer() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.body.style.overflow = "hidden"; window.addEventListener("keydown", onKeyDown);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKeyDown); };
  }, [open]);
  return <>
    <button className="icon-button" onClick={() => setOpen(true)} aria-label="Open account menu"><Menu size={31} strokeWidth={2.2} /></button>
    <AnimatePresence>{open && <>
      <motion.button className="drawer-backdrop" aria-label="Close account menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .2 }} onClick={() => setOpen(false)} />
      <motion.aside className="account-drawer" role="dialog" aria-modal="true" aria-label="Account menu" initial={{ x: "-100%", opacity: .96 }} animate={{ x: 0, opacity: 1 }} exit={{ x: "-100%", opacity: .96 }} transition={{ type: "spring", duration: .42, bounce: .08 }}><AccountContent onClose={() => setOpen(false)} /></motion.aside>
    </>}</AnimatePresence>
  </>;
}

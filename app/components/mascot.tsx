"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import type { MotionStyle } from "motion/react";
import { useEffect, useRef } from "react";

type MascotProps = { width?: number; height?: number; color?: string; interactive?: boolean; idle?: boolean; thinking?: boolean; className?: string };

export function Mascot({ width = 132, height = 120, color = "#6d4aff", interactive = false, idle = true, thinking = false, className = "" }: MascotProps) {
  const targetX = useMotionValue(0), targetY = useMotionValue(0), targetRotate = useMotionValue(0);
  const targetScaleX = useMotionValue(1), targetScaleY = useMotionValue(1);
  const x = useSpring(targetX, { stiffness: 112, damping: 16, mass: .92 });
  const y = useSpring(targetY, { stiffness: 112, damping: 16, mass: .92 });
  const rotate = useSpring(targetRotate, { stiffness: 116, damping: 17, mass: .9 });
  const scaleX = useSpring(targetScaleX, { stiffness: 130, damping: 15, mass: .8 });
  const scaleY = useSpring(targetScaleY, { stiffness: 130, damping: 15, mass: .8 });
  const activeTouch = useRef(false), lastInput = useRef(0), elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const started = performance.now();
    const setFromPoint = (clientX: number, clientY: number) => {
      if (document.elementFromPoint(clientX, clientY)?.closest("button, a, input")) return;
      const nx = clientX / window.innerWidth * 2 - 1, ny = clientY / window.innerHeight * 2 - 1;
      targetX.set(nx * 18); targetY.set(ny * 12.96); targetRotate.set(nx * 5.5);
      targetScaleX.set(1 + Math.abs(nx) * .018 - Math.abs(ny) * .008);
      targetScaleY.set(1 + Math.abs(ny) * .018 - Math.abs(nx) * .006);
      elementRef.current?.style.setProperty("--eye-x", `${nx * 3.2}px`);
      elementRef.current?.style.setProperty("--eye-y", `${ny * 2.3}px`);
      lastInput.current = performance.now();
    };
    const onPointerDown = (event: PointerEvent) => { if (event.pointerType === "touch") activeTouch.current = true; if (interactive) setFromPoint(event.clientX, event.clientY); };
    const onPointerMove = (event: PointerEvent) => { if (!interactive || (event.pointerType === "touch" && !activeTouch.current)) return; setFromPoint(event.clientX, event.clientY); };
    const release = () => { activeTouch.current = false; lastInput.current = performance.now() - 500; };
    const tick = (now: number) => {
      if (idle && now - lastInput.current >= 850 && !activeTouch.current) {
        const seconds = (now - started) / 1000, boost = thinking ? 1.35 : 1;
        targetX.set(Math.sin(seconds * 1.12) * 4.3 * boost + Math.sin(seconds * .43) * 1.6);
        targetY.set(-4.8 + Math.sin(seconds * 1.78) * 4.9);
        targetRotate.set(Math.sin(seconds * .92) * 3.2 * boost);
        targetScaleX.set(1 + Math.sin(seconds * 1.2) * .009); targetScaleY.set(1 + Math.cos(seconds * 1.42) * .008);
        elementRef.current?.style.setProperty("--eye-x", `${Math.sin(seconds * .76) * 1.8 * boost}px`);
        elementRef.current?.style.setProperty("--eye-y", `${Math.cos(seconds * .58) * .7}px`);
      }
      frame = requestAnimationFrame(tick);
    };
    window.addEventListener("pointerdown", onPointerDown, { passive: true }); window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", release, { passive: true }); window.addEventListener("pointercancel", release, { passive: true }); frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("pointerdown", onPointerDown); window.removeEventListener("pointermove", onPointerMove); window.removeEventListener("pointerup", release); window.removeEventListener("pointercancel", release); };
  }, [idle, interactive, thinking, targetRotate, targetScaleX, targetScaleY, targetX, targetY]);

  return (
    <motion.div ref={elementRef} className={`mascot ${className}`} style={{ x, y, rotate, scaleX, scaleY, "--mascot-width": `${width}px`, "--mascot-height": `${height}px`, "--mascot-color": color } as MotionStyle & { "--mascot-width": string; "--mascot-height": string; "--mascot-color": string }} aria-hidden="true">
      <div className="mascot__body"><div className="mascot__eyes"><span className="mascot__eye" /><span className="mascot__eye" /></div></div>
    </motion.div>
  );
}

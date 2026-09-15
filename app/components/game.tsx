"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Mascot } from "./mascot";

type Shot = { id: number; x: number; y: number; vx: number; vy: number; side: boolean };
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function SpaceGame() {
  const router = useRouter();
  const gameRef = useRef<HTMLDivElement>(null), playerRef = useRef({ x: 50, y: 79 }), shotsRef = useRef<Shot[]>([]);
  const deadRef = useRef(false), startRef = useRef(0), spawnRef = useRef(0), lastRef = useRef(0), shotId = useRef(0), spawnCount = useRef(0);
  const [player, setPlayer] = useState({ x: 50, y: 79 }), [shots, setShots] = useState<Shot[]>([]), [score, setScore] = useState(0), [dead, setDead] = useState(false);

  const restart = useCallback(() => {
    const now = performance.now(), initial = { x: 50, y: 79 };
    playerRef.current = initial; shotsRef.current = []; deadRef.current = false; startRef.current = now; spawnRef.current = now; lastRef.current = now; spawnCount.current = 0; shotId.current = 0;
    setPlayer(initial); setShots([]); setScore(0); setDead(false);
  }, []);

  useEffect(() => {
    let frame = 0;
    const tick = (now: number) => {
      if (startRef.current === 0) {
        startRef.current = now; spawnRef.current = now; lastRef.current = now;
      }
      const dt = Math.min(34, now - (lastRef.current || now)); lastRef.current = now;
      if (!deadRef.current) {
        if (now - spawnRef.current >= 620) {
          spawnRef.current = now; spawnCount.current += 1;
          const side = spawnCount.current % 3 === 0, fromLeft = spawnCount.current % 2 === 0;
          const next: Shot = side
            ? { id: ++shotId.current, x: fromLeft ? -3 : 103, y: 60 + ((spawnCount.current * 13) % 26), vx: (fromLeft ? 1 : -1) * (.032 + (spawnCount.current % 4) * .003), vy: 0, side: true }
            : { id: ++shotId.current, x: 7 + ((spawnCount.current * 29) % 86), y: 8, vx: 0, vy: .031 + (spawnCount.current % 5) * .0025, side: false };
          shotsRef.current = [...shotsRef.current, next];
        }
        const nextShots = shotsRef.current.map(shot => ({ ...shot, x: shot.x + shot.vx * dt, y: shot.y + shot.vy * dt })).filter(shot => shot.x > -8 && shot.x < 108 && shot.y < 108);
        const hit = nextShots.some(shot => Math.abs(shot.x - playerRef.current.x) < 6 && Math.abs(shot.y - playerRef.current.y) < 4.5);
        shotsRef.current = nextShots; setShots(nextShots); setScore(Math.floor((now - startRef.current) / 1000));
        if (hit) { deadRef.current = true; setDead(true); }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick); return () => cancelAnimationFrame(frame);
  }, []);

  const movePlayer = (clientX: number, clientY: number) => {
    if (deadRef.current || !gameRef.current) return;
    const rect = gameRef.current.getBoundingClientRect();
    const next = { x: clamp((clientX - rect.left) / rect.width * 100, 8, 92), y: clamp((clientY - rect.top) / rect.height * 100, 58, 89) };
    playerRef.current = next; setPlayer(next);
  };

  const isActionTarget = (target: EventTarget | null) => target instanceof Element && Boolean(target.closest("button, a"));

  return <main ref={gameRef} className="game" onPointerDown={event => {
    if (!event.isPrimary || isActionTarget(event.target)) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    movePlayer(event.clientX, event.clientY);
  }} onPointerMove={event => { if (!isActionTarget(event.target)) movePlayer(event.clientX, event.clientY); }} aria-label="Liio space dodge game">
    {Array.from({ length: 46 }, (_, index) => <span className="star" key={index} style={{ left: `${(index * 37 + 11) % 100}%`, top: `${(index * 53 + 7) % 100}%`, opacity: .25 + (index % 5) * .13 }} />)}
    <div className="game__hud"><span>LIIO SPACE</span><span className="game__score">{score.toString().padStart(2, "0")}</span></div>
    <span className="game__ship" style={{ left: "22%" }} /><span className="game__ship" style={{ right: "18%", top: 112 }} />
    {shots.map(shot => <span key={shot.id} className={`shot ${shot.side ? "shot--side" : ""}`} style={{ left: `${shot.x}%`, top: `${shot.y}%` }} />)}
    <div className="game__player" style={{ left: `${player.x}%`, top: `${player.y}%` }}><Mascot width={62} height={54} idle={false} color="#ffffff" /></div>
    {dead && <div className="game-over-backdrop"><section className="game-over" aria-live="assertive"><h1>Game over</h1><p className="game-over__score">Your score<strong>{score}</strong></p><div className="game-over__actions" onPointerDown={event => event.stopPropagation()}><button className="primary-button" onClick={restart}>Restart</button><button className="secondary-button" onClick={() => router.push("/home-01")}>Enter</button></div></section></div>}
  </main>;
}

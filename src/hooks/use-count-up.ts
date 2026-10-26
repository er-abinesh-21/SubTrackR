import { useEffect, useRef, useState } from "react";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

/**
 * Animates a number toward `target`. The first run counts up from zero; later
 * changes glide from wherever the number currently is, so edits feel continuous.
 * Reduced-motion users get the final value immediately.
 */
export function useCountUp(target: number, duration = 1100, delay = 0) {
  const [value, setValue] = useState(() => (prefersReducedMotion() ? target : 0));
  const current = useRef(value);

  useEffect(() => {
    if (prefersReducedMotion()) {
      current.current = target;
      setValue(target);
      return;
    }

    const from = current.current;
    let frame = 0;
    let start: number | null = null;

    const tick = (now: number) => {
      if (start === null) start = now;
      const t = Math.min((now - start) / duration, 1);
      const next = from + (target - from) * easeOutExpo(t);
      current.current = next;
      setValue(next);
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    const timer = window.setTimeout(() => {
      frame = requestAnimationFrame(tick);
    }, delay);

    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [target, duration, delay]);

  return value;
}

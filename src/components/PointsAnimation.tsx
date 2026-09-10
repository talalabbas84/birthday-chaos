"use client";

/**
 * A floating "+N" badge that pops in and drifts upward. Re-mounts (via the
 * `triggerKey` changing) to replay the animation each time points land.
 */
export function PointsAnimation({ amount, triggerKey }: { amount: number; triggerKey: number }) {
  if (triggerKey === 0) return null;

  return (
    <span
      key={triggerKey}
      className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 animate-float-up text-lg font-black text-chaos-green drop-shadow-[0_0_8px_rgba(61,255,168,0.6)]"
    >
      +{amount}
    </span>
  );
}

import { useEffect, useRef } from "react";

/**
 * Runs `callback` immediately and then on an interval, but only while the
 * document is visible — keeps party-scale polling cheap when a phone's
 * screen is off or the tab is backgrounded.
 */
export function useVisibleInterval(callback: () => void, intervalMs: number) {
  const savedCallback = useRef(callback);
  savedCallback.current = callback;

  useEffect(() => {
    let id: ReturnType<typeof setInterval> | null = null;

    function start() {
      if (id) return;
      savedCallback.current();
      id = setInterval(() => savedCallback.current(), intervalMs);
    }
    function stop() {
      if (id) {
        clearInterval(id);
        id = null;
      }
    }
    function handleVisibility() {
      if (document.visibilityState === "visible") start();
      else stop();
    }

    handleVisibility();
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [intervalMs]);
}

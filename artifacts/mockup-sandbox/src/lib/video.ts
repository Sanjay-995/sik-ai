import { useEffect, useState } from "react";

const SCENE_ORDER = ["brand", "scan", "dashboard", "coach", "progress", "outro"] as const;

type SceneKey = (typeof SCENE_ORDER)[number];

/**
 * Drives the SikAICombined mockup “acts” from duration config (no real video file).
 */
export function useVideoPlayer({ durations }: { durations: Record<SceneKey, number> }) {
  const [currentScene, setCurrentScene] = useState(0);

  useEffect(() => {
    const key = SCENE_ORDER[currentScene];
    const ms = durations[key] ?? 5000;
    const id = window.setTimeout(() => {
      setCurrentScene((s) => (s + 1) % SCENE_ORDER.length);
    }, ms);
    return () => window.clearTimeout(id);
  }, [currentScene, durations]);

  return { currentScene };
}

// FIX F4 — hook partagé, supprime la duplication dans les deux viewports

import { useEffect, useRef, useState } from "react";

/**
 * Calcule le scale responsive pour afficher un canvas 1920px
 * dans le conteneur parent (avec 80px de marge de sécurité).
 *
 * Retourne { ref, scale } :
 * - ref   → à attacher au div wrapper (.stella-5-0-viewport)
 * - scale → facteur à passer au style `transform: scale(${scale})`
 */
export function useViewportScale() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    function recompute() {
      if (!ref.current) return;
      const w = ref.current.clientWidth || window.innerWidth;
      setScale(Math.min(1, (w - 80) / 1920));
    }
    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, []);

  return { ref, scale };
}

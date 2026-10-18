"use client";

import { metricBox } from "@/lib/museum/geometry";
import { useMuseumMaterials } from "./materials";
import { NotReflected, useDisposable } from "./helpers";

export interface InlayStrip {
  /** Centre of the strip on the floor. */
  x: number;
  z: number;
  /** Extent along X and Z, in metres. */
  width: number;
  length: number;
  kind: "marble" | "brass";
}

/** Inlays sit a few millimetres proud of the floor: enough depth precision to never shimmer, too little to see. */
const MARBLE_HEIGHT = 0.006;
const BRASS_HEIGHT = 0.008;

/**
 * Dark marble bands and thin brass lines set into the pale marble floor, as
 * on the reference flooring. Each strip is a shallow box with metric UVs.
 */
export function FloorInlay({ strips }: { strips: readonly InlayStrip[] }) {
  // They lie on the floor's mirror plane, so their reflection would never show.
  return (
    <NotReflected>
      {strips.map((s, i) => (
        <Strip key={i} strip={s} />
      ))}
    </NotReflected>
  );
}

function Strip({ strip }: { strip: InlayStrip }) {
  const m = useMuseumMaterials();
  const h = strip.kind === "brass" ? BRASS_HEIGHT : MARBLE_HEIGHT;
  const geometry = useDisposable(() => metricBox(strip.width, h, strip.length));
  return (
    <mesh
      geometry={geometry}
      material={strip.kind === "brass" ? m.brass : m.darkStone}
      position={[strip.x, h / 2, strip.z]}
      receiveShadow
    />
  );
}

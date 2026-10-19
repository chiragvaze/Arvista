"use client";

import { useMemo } from "react";
import {
  BackSide,
  BoxGeometry,
  CircleGeometry,
  CylinderGeometry,
  FrontSide,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  SphereGeometry,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { BENCH_BAY, CORRIDOR, PLANTER_SPOTS, VAULT_RADIUS, bayCenterZ, bayDividerZs } from "@/lib/museum/layout";
import { archBandGeometry, archedWallGeometry, bevelledBox, metricBox, scaleUVs, withBaseShading } from "@/lib/museum/geometry";
import { bakeCorridorWall, bakeEndWall, bakeVault, bakeVaultRelief, fitToMetres, CORRIDOR_LENGTH } from "@/lib/museum/lightmaps";
import { createNicheTextures } from "@/lib/museum/textures";
import { bakedStoneMaterial, useMuseumMaterials } from "./materials";
import { useStoneFill } from "./ReflectionProbe";
import { BevelledBox, InstancedParts, useDisposable, type InstanceTransform } from "./helpers";
import { Planter } from "./Planter";
import { FloorInlay, type InlayStrip } from "./FloorInlay";

const LENGTH = CORRIDOR_LENGTH;
const MID_Z = (CORRIDOR.startZ + CORRIDOR.endZ) / 2;
const W = CORRIDOR.halfWidth;
const H = CORRIDOR.wallHeight;
const END_WALL_THICKNESS = 0.6;
const END_WALL_HEIGHT = H + VAULT_RADIUS + 0.2;

const DIVIDERS = bayDividerZs();
const BAYS = Array.from({ length: CORRIDOR.bayCount }, (_, i) => bayCenterZ(i));

/** Strength of the soft fill on the corridor's stone (see useStoneFill). */
const STONE_FILL_INTENSITY = 0.42;
/** Strength of the same fill on the palm fronds (thin leaves lit from all around). */
const FROND_FILL_INTENSITY = 0.75;

/** Dark marble baseboard with a limestone cap, as in the reference walls. */
const BASEBOARD = { height: 0.42, depth: 0.07, cap: 0.05 } as const;

/** Instance transforms for one element repeated at every bay divider on both walls. */
function onBothWalls(inset: number, y: number): InstanceTransform[] {
  return DIVIDERS.flatMap((z) => [{ position: [-W + inset, y, z] as const }, { position: [W - inset, y, z] as const }]);
}

/** The final archway: lower than the vault so the corridor cornice can run across the end wall above it. */
const ARCH = { halfWidth: 2.2, spring: 3.35 } as const;
/** Fluted pilasters flank the final archway on the end wall, turned to face down the corridor. */
const END_PILASTER_X = ARCH.halfWidth + 1.08;
/** Instance transforms for an element at both end-wall pilasters, `out` metres in front of the end wall. */
function onEndPilasters(out: number, y: number): InstanceTransform[] {
  return [-1, 1].map((side) => ({
    position: [side * END_PILASTER_X, y, CORRIDOR.endZ + out] as const,
    rotation: [0, Math.PI / 2, 0] as const,
  }));
}

const RIBS: InstanceTransform[] = DIVIDERS.map((z) => ({ position: [0, 0, z - 0.25] }));
const SKYLIGHTS: InstanceTransform[] = BAYS.map((z) => ({ position: [0, H, z] }));
const PILASTERS = [...onBothWalls(0.11, H / 2), ...onEndPilasters(0.11, H / 2)];
/** A necking band (astragal) between each shaft and its capital, so the capital reads as carved rather than a block. */
const NECKINGS = [...onBothWalls(0.125, H - 0.475), ...onEndPilasters(0.125, H - 0.475)];
const CAPITALS = [...onBothWalls(0.17, H - 0.29), ...onEndPilasters(0.17, H - 0.29)];
const ABACI = [...onBothWalls(0.2, H - 0.08), ...onEndPilasters(0.2, H - 0.08)];
const PLINTHS = [...onBothWalls(0.18, 0.23), ...onEndPilasters(0.18, 0.23)];
const BASES = [...onBothWalls(0.16, 0.54), ...onEndPilasters(0.16, 0.54)];
const BASE_TOPS = [...onBothWalls(0.14, 0.66), ...onEndPilasters(0.14, 0.66)];

/** Skylights: glazing on the vault crown, framed by a stone surround. */
const SKYLIGHT_LENGTH = 4.4;
const SKYLIGHT_HALF_ANGLE = 0.45;
const VAULT_SKYLIGHT = { halfArc: SKYLIGHT_HALF_ANGLE * VAULT_RADIUS, length: SKYLIGHT_LENGTH } as const;
const SKYLIGHT_ENDS: InstanceTransform[] = BAYS.flatMap((z) => [
  { position: [0, H, z - SKYLIGHT_LENGTH / 2] as const },
  { position: [0, H, z + SKYLIGHT_LENGTH / 2] as const },
]);

/**
 * Recessed wall panels in every bay: a tall panel around the hanging height,
 * so each painting sits within its own architectural field, and a shorter frieze
 * panel above it. Each is framed by a bolection moulding: a flat limestone
 * band with a raised bead along it, which catches a highlight above and a
 * shadow below and so reads as carved depth rather than a drawn line.
 */
const PANEL = {
  inset: 0.42,
  band: 0.13,
  bandDepth: 0.026,
  bead: 0.046,
  beadDepth: 0.064,
  lower: { bottom: 0.8, top: 4.16 },
  upper: { bottom: 4.5, top: H - 0.66 },
} as const;
const PANEL_LENGTH = CORRIDOR.bayLength - 0.62 - PANEL.inset * 2;
const WALL_PANELS = {
  length: PANEL_LENGTH,
  band: PANEL.band,
  spans: [
    [PANEL.lower.bottom, PANEL.lower.top],
    [PANEL.upper.bottom, PANEL.upper.top],
  ],
} as const;
const panelX = (side: number, depth: number) => side * (W - depth / 2);
function panelRails(depth: number): InstanceTransform[] {
  return BAYS.flatMap((z) =>
    [-1, 1].flatMap((side) =>
      [PANEL.lower.bottom, PANEL.lower.top, PANEL.upper.bottom, PANEL.upper.top].map((y) => ({
        position: [panelX(side, depth), y, z] as const,
      })),
    ),
  );
}
/** Stiles stop at the rails, so no two moulding faces overlap at the corners. */
function panelStiles(depth: number, width: number): InstanceTransform[] {
  return BAYS.flatMap((z) =>
    [-1, 1].flatMap((side) =>
      [PANEL.lower, PANEL.upper].flatMap(({ bottom, top }) =>
        [-1, 1].map((end) => ({
          position: [panelX(side, depth), (bottom + top) / 2, z + end * (PANEL_LENGTH / 2 - PANEL.band / 2)] as const,
          // Lower and upper stiles share one geometry, scaled to each panel's height.
          scale: [1, (top - bottom - width) / (PANEL.lower.top - PANEL.lower.bottom - width), 1] as const,
        })),
      ),
    ),
  );
}
const PANEL_PARTS = {
  bandRails: panelRails(PANEL.bandDepth),
  beadRails: panelRails(PANEL.beadDepth),
  bandStiles: panelStiles(PANEL.bandDepth, PANEL.band),
  beadStiles: panelStiles(PANEL.beadDepth, PANEL.bead),
};

/** Dentil course under the cornice crown, interrupted at each pilaster capital, and carried across the end wall. */
const DENTIL_SPACING = 0.17;
const DENTILS: InstanceTransform[] = [
  ...[-1, 1].flatMap((side) => {
    const items: InstanceTransform[] = [];
    for (let z = CORRIDOR.startZ - 0.12; z > CORRIDOR.endZ + 0.1; z -= DENTIL_SPACING) {
      if (DIVIDERS.some((d) => Math.abs(d - z) < 0.55)) continue;
      items.push({ position: [side * (W - 0.21), H - 0.09, z] });
    }
    return items;
  }),
  ...(() => {
    const items: InstanceTransform[] = [];
    // Clear of the corners, where the side walls' dentils run into the end wall.
    for (let x = -W + 0.45; x < W - 0.45; x += DENTIL_SPACING) {
      if (Math.abs(Math.abs(x) - END_PILASTER_X) < 0.55) continue;
      items.push({ position: [x, H - 0.09, CORRIDOR.endZ + 0.21], rotation: [0, Math.PI / 2, 0] });
    }
    return items;
  })(),
];

/** Floor: a dark marble border with a brass line along each wall, and cross bands at the pilasters. */
const FLOOR_INLAY: InlayStrip[] = [
  ...[-1, 1].flatMap((side) => [
    { x: side * (W - 0.4), z: MID_Z, width: 0.62, length: LENGTH, kind: "marble" as const },
    { x: side * (W - 0.8), z: MID_Z, width: 0.035, length: LENGTH, kind: "brass" as const },
  ]),
  ...DIVIDERS.slice(1, -1).map((z) => ({ x: 0, z, width: W * 2 - 1.9, length: 0.32, kind: "marble" as const })),
];

/** End-wall baseboard extent (|x|): from the archway's plinths to the face of the side walls' baseboard caps. */
const END_BASEBOARD = { from: ARCH.halfWidth + 0.5, to: W - (BASEBOARD.depth + 0.035) } as const;

/** Lunette window in the end wall above the cornice, glazed like the skylights. */
const LUNETTE = { radius: 2.5, y: H + 0.22 } as const;

/**
 * The barrel-vaulted gallery corridor. Pilasters, vault ribs, skylights and wall
 * panels are laid out per bay so new paintings and rooms can be added bay by bay.
 * The soft, static part of its lighting is baked (see lightmaps.ts); only a few
 * real-time lights remain.
 */
export function GalleryCorridor() {
  const m = useMuseumMaterials();

  const wall = useDisposable(() => scaleUVs(new PlaneGeometry(LENGTH, H), LENGTH, H));
  const vault = useDisposable(() => {
    const g = new CylinderGeometry(VAULT_RADIUS, VAULT_RADIUS, LENGTH, 64, 1, true, Math.PI / 2, Math.PI);
    g.rotateX(Math.PI / 2);
    return scaleUVs(g, Math.PI * VAULT_RADIUS, LENGTH);
  });
  const rib = useDisposable(() =>
    archBandGeometry({ innerHalfWidth: VAULT_RADIUS - 0.36, spring: H, band: 0.4, depth: 0.46, baseY: H, bevel: 0.02 }),
  );
  const skylight = useDisposable(() => {
    const g = new CylinderGeometry(
      VAULT_RADIUS - 0.02,
      VAULT_RADIUS - 0.02,
      SKYLIGHT_LENGTH,
      16,
      1,
      true,
      Math.PI - SKYLIGHT_HALF_ANGLE,
      SKYLIGHT_HALF_ANGLE * 2,
    );
    g.rotateX(Math.PI / 2);
    return g;
  });
  const pieces = useDisposable(() => {
    const lowerStile = (width: number) => PANEL.lower.top - PANEL.lower.bottom - width;
    // Stone pieces have softly rounded edges that catch the light (see bevelledBox); the polished
    // dark-marble plinths and baseboard keep crisp arrises and metric UVs.
    const geometries = {
      // Shaded toward the floor like the wall behind it (see the walls' baked contact shadows).
      pilaster: withBaseShading(bevelledBox(0.22, H, 0.62, 0.025, { faceUVs: true }), 0.62, 2.6),
      necking: bevelledBox(0.25, 0.05, 0.7, 0.015),
      capital: bevelledBox(0.34, 0.32, 0.82, 0.03),
      abacus: bevelledBox(0.4, 0.1, 0.94, 0.02),
      plinth: metricBox(0.36, 0.46, 0.88),
      base: bevelledBox(0.32, 0.16, 0.8, 0.04),
      baseTop: bevelledBox(0.28, 0.08, 0.72, 0.03),
      bandRail: bevelledBox(PANEL.bandDepth, PANEL.band, PANEL_LENGTH, 0.008),
      beadRail: bevelledBox(PANEL.beadDepth, PANEL.bead, PANEL_LENGTH - PANEL.band + PANEL.bead, 0.016),
      bandStile: bevelledBox(PANEL.bandDepth, lowerStile(PANEL.band), PANEL.band, 0.008),
      beadStile: bevelledBox(PANEL.beadDepth, lowerStile(PANEL.bead), PANEL.bead, 0.016),
      // Hundreds of dentils, each too small for rounding to show: plain boxes keep the triangle count down.
      dentil: new BoxGeometry(0.14, 0.1, 0.085),
      baseboard: metricBox(BASEBOARD.depth, BASEBOARD.height, LENGTH),
      baseboardCap: bevelledBox(BASEBOARD.depth + 0.035, BASEBOARD.cap, LENGTH, 0.015),
      fascia: bevelledBox(0.14, 0.42, LENGTH, 0.02),
      bed: bevelledBox(0.19, 0.06, LENGTH, 0.02),
      crown: bevelledBox(0.42, 0.2, LENGTH, 0.03),
    };
    return { ...geometries, dispose: () => Object.values(geometries).forEach((g) => g.dispose()) };
  });
  const endWall = useDisposable(() =>
    archedWallGeometry({
      width: W * 2,
      height: END_WALL_HEIGHT,
      archHalfWidth: ARCH.halfWidth,
      archSpring: ARCH.spring,
      depth: END_WALL_THICKNESS,
    }),
  );
  const endArch = useDisposable(() => {
    const archivolt = archBandGeometry({ innerHalfWidth: ARCH.halfWidth, spring: ARCH.spring, band: 0.42, depth: 0.14, bevel: 0.03 });
    const outer = archBandGeometry({ innerHalfWidth: ARCH.halfWidth + 0.46, spring: ARCH.spring, band: 0.1, depth: 0.2, bevel: 0.015 });
    // Stone soffit lining the opening through the thickness of the end wall.
    const reveal = archBandGeometry({ innerHalfWidth: ARCH.halfWidth - 0.06, spring: ARCH.spring, band: 0.08, depth: END_WALL_THICKNESS + 0.02 });
    const lunetteBand = archBandGeometry({
      innerHalfWidth: LUNETTE.radius,
      spring: LUNETTE.y,
      band: 0.28,
      depth: 0.12,
      bevel: 0.02,
      baseY: LUNETTE.y,
    });
    const lunette = new CircleGeometry(LUNETTE.radius, 40, 0, Math.PI);
    const all = [archivolt, outer, reveal, lunetteBand, lunette];
    return { archivolt, outer, reveal, lunetteBand, lunette, dispose: () => all.forEach((g) => g.dispose()) };
  });
  const glazing = useDisposable(() => {
    const end = new CylinderGeometry(
      VAULT_RADIUS - 0.035,
      VAULT_RADIUS - 0.035,
      0.16,
      16,
      1,
      true,
      Math.PI - SKYLIGHT_HALF_ANGLE - 0.03,
      (SKYLIGHT_HALF_ANGLE + 0.03) * 2,
    );
    end.rotateX(Math.PI / 2);
    const side = (start: number) => {
      const g = new CylinderGeometry(VAULT_RADIUS - 0.035, VAULT_RADIUS - 0.035, SKYLIGHT_LENGTH + 0.16, 2, 1, true, start, 0.032);
      g.rotateX(Math.PI / 2);
      return g;
    };
    const left = side(Math.PI - SKYLIGHT_HALF_ANGLE - 0.032);
    const right = side(Math.PI + SKYLIGHT_HALF_ANGLE);
    return { end, left, right, dispose: () => [end, left, right].forEach((g) => g.dispose()) };
  });
  // Lit surfaces with baked light: both walls, the vault (cove light and skylight glow) and the end wall's
  // face; plus the frames around the skylights and the lunette glazing.
  const surfaces = useDisposable(() => {
    const left = bakedStoneMaterial(m.plaster, bakeCorridorWall(-1, WALL_PANELS), { width: LENGTH, height: H }, 2.0);
    const right = bakedStoneMaterial(m.plaster, bakeCorridorWall(1, WALL_PANELS), { width: LENGTH, height: H }, 2.0);
    const vaultBase = new MeshStandardMaterial({ color: "#f3eadc", map: m.plaster.map, roughness: 0.92, side: BackSide });
    const trim = vaultBase.clone();
    trim.color.set("#f8f2e6");
    trim.roughness = 0.7;
    // Coffered vault: the coffers are relief and baked shadow on the smooth vault, not geometry.
    const relief = fitToMetres(bakeVaultRelief(VAULT_SKYLIGHT), Math.PI * VAULT_RADIUS, LENGTH);
    const vaultLit = bakedStoneMaterial(
      vaultBase,
      bakeVault(BAYS, VAULT_SKYLIGHT),
      { width: Math.PI * VAULT_RADIUS, height: LENGTH },
      2.8,
      { bumpMap: relief, bumpScale: 3.5 },
    );
    // The end wall's UVs are its x, y in metres, with x = 0 on the corridor's centre line.
    const endLit = bakedStoneMaterial(m.plaster, bakeEndWall(ARCH, END_WALL_HEIGHT), { width: W * 2, height: END_WALL_HEIGHT, u0: -W }, 2.6);
    const lunette = m.skylight.clone();
    lunette.side = FrontSide;
    // The corridor's own stone, lit by the interior fill below; the entrance keeps the dusk-lit original.
    const stone = m.stone.clone();
    const pilaster = m.pilaster.clone();
    pilaster.vertexColors = true;
    const all = [left, right, vaultBase, trim, vaultLit, endLit, lunette, stone, pilaster];
    return {
      left,
      right,
      vault: vaultLit,
      trim,
      endWall: endLit,
      lunette,
      stone,
      pilaster,
      dispose: () => all.forEach((x) => x.dispose()),
    };
  });
  // Mouldings, pilasters, ribs and skylight frames have no baked light, so they take a soft fill from above
  // (see useStoneFill): their top faces catch it and their undersides stay in shade. The palms take the same
  // fill, more strongly: their undersides face the pale floor and walls, and with only the faint scene-wide
  // fill they fell to black silhouettes against the lit stone.
  const stoneFill = useMemo(
    (): [MeshStandardMaterial, number][] => [
      [surfaces.stone, STONE_FILL_INTENSITY],
      [surfaces.pilaster, STONE_FILL_INTENSITY],
      [surfaces.trim, STONE_FILL_INTENSITY],
      [m.frond, FROND_FILL_INTENSITY],
    ],
    [surfaces, m.frond],
  );
  useStoneFill(stoneFill);

  const hallZ = CORRIDOR.endZ - END_WALL_THICKNESS;
  // Two lights along the corridor give the pilasters, cornice and mouldings their modelling (the walls' and
  // vault's soft light is baked); each painting also has its own picture light. Kept deliberately few: every
  // light adds to the cost of every lit pixel and to shader compile time.
  // One over the first paintings, one over the last bay, which also reaches the final archway and the urn in the apse.
  const lightZs = [CORRIDOR.startZ - 10, CORRIDOR.endZ + 5];

  return (
    <group>
      <mesh geometry={wall} material={surfaces.left} position={[-W, H / 2, MID_Z]} rotation={[0, Math.PI / 2, 0]} receiveShadow />
      <mesh geometry={wall} material={surfaces.right} position={[W, H / 2, MID_Z]} rotation={[0, -Math.PI / 2, 0]} receiveShadow />
      <mesh geometry={vault} material={surfaces.vault} position={[0, H, MID_Z]} />

      <InstancedParts geometry={rib} material={surfaces.stone} transforms={RIBS} />
      <InstancedParts geometry={skylight} material={m.skylight} transforms={SKYLIGHTS} />
      <InstancedParts geometry={glazing.end} material={surfaces.trim} transforms={SKYLIGHT_ENDS} reflected={false} />
      <InstancedParts geometry={glazing.left} material={surfaces.trim} transforms={SKYLIGHTS} reflected={false} />
      <InstancedParts geometry={glazing.right} material={surfaces.trim} transforms={SKYLIGHTS} reflected={false} />

      <InstancedParts geometry={pieces.pilaster} material={surfaces.pilaster} transforms={PILASTERS} receiveShadow />
      <InstancedParts geometry={pieces.necking} material={surfaces.stone} transforms={NECKINGS} reflected={false} />
      <InstancedParts geometry={pieces.capital} material={surfaces.stone} transforms={CAPITALS} />
      <InstancedParts geometry={pieces.abacus} material={surfaces.stone} transforms={ABACI} />
      <InstancedParts geometry={pieces.plinth} material={m.darkStone} transforms={PLINTHS} />
      <InstancedParts geometry={pieces.base} material={surfaces.stone} transforms={BASES} />
      <InstancedParts geometry={pieces.baseTop} material={surfaces.stone} transforms={BASE_TOPS} />

      <InstancedParts geometry={pieces.bandRail} material={surfaces.stone} transforms={PANEL_PARTS.bandRails} />
      <InstancedParts geometry={pieces.beadRail} material={surfaces.stone} transforms={PANEL_PARTS.beadRails} />
      <InstancedParts geometry={pieces.bandStile} material={surfaces.stone} transforms={PANEL_PARTS.bandStiles} />
      <InstancedParts geometry={pieces.beadStile} material={surfaces.stone} transforms={PANEL_PARTS.beadStiles} />
      <InstancedParts geometry={pieces.dentil} material={surfaces.stone} transforms={DENTILS} reflected={false} />

      {[-1, 1].map((side) => (
        <group key={side}>
          {/* Cornice at the springing line: a bed moulding casting a crisp shadow line, a flat fascia, and a
              projecting crown that hides the cove light. */}
          <mesh geometry={pieces.bed} material={surfaces.stone} position={[side * (W - 0.095), H - 0.49, MID_Z]} />
          <mesh geometry={pieces.fascia} material={surfaces.stone} position={[side * (W - 0.07), H - 0.25, MID_Z]} />
          <mesh geometry={pieces.crown} material={surfaces.stone} position={[side * (W - 0.21), H + 0.06, MID_Z]} />
          {/* Dark marble baseboard with a limestone cap */}
          <mesh
            geometry={pieces.baseboard}
            material={m.darkStone}
            position={[side * (W - BASEBOARD.depth / 2), BASEBOARD.height / 2, MID_Z]}
            receiveShadow
          />
          <mesh
            geometry={pieces.baseboardCap}
            material={surfaces.stone}
            position={[side * (W - (BASEBOARD.depth + 0.035) / 2), BASEBOARD.height + BASEBOARD.cap / 2, MID_Z]}
          />
        </group>
      ))}
      <FloorInlay strips={FLOOR_INLAY} />

      {lightZs.map((z) => (
        // Hung high in the vault: the light grazes the walls from above, so it models the pilasters, cornice and
        // mouldings and falls off down the wall, rather than flooding the wall faces evenly.
        <pointLight key={z} position={[0, H + 0.8, z]} color="#ffe5cc" intensity={26} distance={30} decay={2} />
      ))}

      {/* Palms in the entry bay and the last bay, clear of the paintings. */}
      {PLANTER_SPOTS.filter(([, z]) => z < CORRIDOR.startZ).map(([x, z], i) => (
        <Planter key={i} position={[x, 0, z]} seed={i * 3 + 1} scale={1.2} />
      ))}
      <Bench position={[0, 0, bayCenterZ(BENCH_BAY)]} />

      {/* End wall: a stone archway framed by fluted pilasters, with the corridor cornice carried across above it
          and a glazed lunette in the end of the vault. Its lit face is group 0 (the caps) of the extruded wall. */}
      <mesh geometry={endWall} material={[surfaces.endWall, m.plaster]} position={[0, 0, hallZ]} receiveShadow />
      <mesh geometry={endArch.archivolt} material={surfaces.stone} position={[0, 0, CORRIDOR.endZ]} />
      <mesh geometry={endArch.outer} material={surfaces.stone} position={[0, 0, CORRIDOR.endZ]} />
      <mesh geometry={endArch.reveal} material={surfaces.stone} position={[0, 0, hallZ - 0.01]} />
      {/* Keystone, rising to meet the cornice */}
      <mesh material={surfaces.stone} position={[0, ARCH.spring + ARCH.halfWidth + 0.3, CORRIDOR.endZ + 0.13]}>
        <BevelledBox args={[0.5, 0.82, 0.28]} radius={0.03} />
      </mesh>
      {/* The cornice across the end wall butts against the side walls' cornices rather than overlapping them,
          so no two faces share a plane in the corners. */}
      <mesh material={surfaces.stone} position={[0, H - 0.49, CORRIDOR.endZ + 0.095]}>
        <BevelledBox args={[W * 2 - 0.38, 0.06, 0.19]} radius={0.02} />
      </mesh>
      <mesh material={surfaces.stone} position={[0, H - 0.25, CORRIDOR.endZ + 0.07]}>
        <BevelledBox args={[W * 2 - 0.28, 0.42, 0.14]} radius={0.02} />
      </mesh>
      <mesh material={surfaces.stone} position={[0, H + 0.06, CORRIDOR.endZ + 0.21]}>
        <BevelledBox args={[W * 2 - 0.84, 0.2, 0.42]} radius={0.03} />
      </mesh>
      <mesh geometry={endArch.lunetteBand} material={surfaces.stone} position={[0, 0, CORRIDOR.endZ]} />
      <mesh geometry={endArch.lunette} material={surfaces.lunette} position={[0, LUNETTE.y, CORRIDOR.endZ + 0.01]} />
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh material={surfaces.stone} position={[side * (ARCH.halfWidth + 0.21), ARCH.spring - 0.1, CORRIDOR.endZ + 0.11]}>
            <BevelledBox args={[0.62, 0.2, 0.26]} radius={0.025} />
          </mesh>
          <mesh material={m.darkStone} position={[side * (ARCH.halfWidth + 0.21), 0.26, CORRIDOR.endZ + 0.1]}>
            <boxGeometry args={[0.58, 0.52, 0.22]} />
          </mesh>
          {/* Baseboard along the end wall, either side of the archway, stopping at the side walls' baseboards */}
          <mesh
            material={m.darkStone}
            position={[(side * (END_BASEBOARD.from + END_BASEBOARD.to)) / 2, BASEBOARD.height / 2, CORRIDOR.endZ + BASEBOARD.depth / 2]}
          >
            <boxGeometry args={[END_BASEBOARD.to - END_BASEBOARD.from, BASEBOARD.height, BASEBOARD.depth]} />
          </mesh>
          <mesh
            material={surfaces.stone}
            position={[(side * (END_BASEBOARD.from + END_BASEBOARD.to)) / 2, BASEBOARD.height + BASEBOARD.cap / 2, CORRIDOR.endZ + 0.05]}
          >
            <BevelledBox args={[END_BASEBOARD.to - END_BASEBOARD.from, BASEBOARD.cap, 0.1]} radius={0.015} />
          </mesh>
        </group>
      ))}
      <mesh material={m.darkStone} position={[0, 0.015, hallZ + END_WALL_THICKNESS / 2]} receiveShadow>
        <boxGeometry args={[ARCH.halfWidth * 2, 0.03, END_WALL_THICKNESS]} />
      </mesh>
      <Apse z={hallZ} stone={surfaces.stone} />
    </group>
  );
}

/** Tufted leather bench on a dark walnut base. */
function Bench({ position }: { position: [number, number, number] }) {
  const m = useMuseumMaterials();
  const parts = useDisposable(() => {
    const cushion = new RoundedBoxGeometry(0.96, 0.3, 2.5, 4, 0.09);
    const button = new SphereGeometry(0.02, 8, 6);
    const base = bevelledBox(0.88, 0.08, 2.4, 0.02);
    const leg = bevelledBox(0.09, 0.26, 0.09, 0.015);
    const all = [cushion, button, base, leg];
    return { cushion, button, base, leg, dispose: () => all.forEach((g) => g.dispose()) };
  });
  return (
    <group position={position}>
      <mesh geometry={parts.cushion} material={m.leather} position={[0, 0.48, 0]} castShadow />
      <InstancedParts geometry={parts.button} material={m.leather} transforms={BENCH_BUTTONS} reflected={false} />
      <mesh geometry={parts.base} material={m.wood} position={[0, 0.3, 0]} />
      <InstancedParts geometry={parts.leg} material={m.wood} transforms={BENCH_LEGS} />
    </group>
  );
}

/** Diamond tufting: three rows of buttons, alternate rows offset by half a step. */
const BENCH_BUTTONS: InstanceTransform[] = Array.from({ length: 3 }, (_, row) =>
  Array.from({ length: 8 }, (_, col) => -1.05 + col * 0.3 + (row % 2) * 0.15)
    .filter((z) => z <= 1.1)
    .map((z) => ({ position: [-0.27 + row * 0.27, 0.632, z] as const })),
).flat();
const BENCH_LEGS: InstanceTransform[] = [-1, 1].flatMap((x) => [-1, 1].map((z) => ({ position: [x * 0.37, 0.13, z * 1.1] as const })));

/**
 * A warmly lit apse seen through the final archway, hinting at the next
 * gallery: a short vestibule, then a half-domed niche with a palm on a stone
 * pedestal as the focal point. Its light is baked into its textures and drawn
 * unlit rather than given another real-time light, since it is only ever seen
 * from a distance; its brightness draws the eye to the end of the walk.
 */
const APSE = { halfWidth: 2.8, vestibule: 2.6, spring: 4.4 } as const;

function Apse({ z, stone }: { z: number; stone: MeshStandardMaterial }) {
  const m = useMuseumMaterials();
  const parts = useDisposable(() => {
    const textures = createNicheTextures();
    const r = APSE.halfWidth;
    const wall = new CylinderGeometry(r, r, APSE.spring, 32, 1, true, Math.PI / 2, Math.PI);
    wall.translate(0, APSE.spring / 2, 0);
    const dome = new SphereGeometry(r, 32, 12, Math.PI, Math.PI, 0, Math.PI / 2);
    dome.translate(0, APSE.spring, 0);
    const side = new PlaneGeometry(APSE.vestibule, APSE.spring + r);
    const ceiling = new PlaneGeometry(r * 2, APSE.vestibule);
    // The right-hand wall faces the other way, so its copy of the texture is mirrored to brighten toward the apse too.
    const sideMirrored = textures.side.clone();
    sideMirrored.repeat.x = -1;
    sideMirrored.offset.x = 1;
    const materials = {
      wall: new MeshBasicMaterial({ map: textures.wall, side: BackSide }),
      dome: new MeshBasicMaterial({ map: textures.dome, side: BackSide }),
      left: new MeshBasicMaterial({ map: textures.side }),
      right: new MeshBasicMaterial({ map: sideMirrored }),
      ceiling: new MeshBasicMaterial({ color: "#857260" }),
    };
    const all = [wall, dome, side, ceiling, ...Object.values(materials)];
    return {
      wall,
      dome,
      side,
      ceiling,
      materials,
      dispose: () => {
        all.forEach((x) => x.dispose());
        sideMirrored.dispose();
        textures.dispose();
      },
    };
  });
  const center = z - APSE.vestibule;
  const height = APSE.spring + APSE.halfWidth;
  return (
    <group>
      {[-1, 1].map((s) => (
        // Each side wall faces the centre line; its texture brightens toward the apse (u = 1).
        <mesh
          key={s}
          geometry={parts.side}
          material={s < 0 ? parts.materials.left : parts.materials.right}
          position={[s * APSE.halfWidth, height / 2, z - APSE.vestibule / 2]}
          rotation={[0, (-s * Math.PI) / 2, 0]}
        />
      ))}
      <mesh
        geometry={parts.ceiling}
        material={parts.materials.ceiling}
        position={[0, height, z - APSE.vestibule / 2]}
        rotation={[Math.PI / 2, 0, 0]}
      />
      <mesh geometry={parts.wall} material={parts.materials.wall} position={[0, 0, center]} />
      <mesh geometry={parts.dome} material={parts.materials.dome} position={[0, 0, center]} />
      <mesh material={m.darkStone} position={[0, 0.06, center - 0.9]}>
        <boxGeometry args={[1.12, 0.12, 1.12]} />
      </mesh>
      <mesh material={stone} position={[0, 0.56, center - 0.9]}>
        <BevelledBox args={[0.95, 0.88, 0.95]} radius={0.02} />
      </mesh>
      <mesh material={stone} position={[0, 1.04, center - 0.9]}>
        <BevelledBox args={[1.08, 0.08, 1.08]} radius={0.02} />
      </mesh>
      <Planter position={[0, 1.08, center - 0.9]} seed={7} scale={1.05} />
    </group>
  );
}

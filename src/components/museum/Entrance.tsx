"use client";

import { useEffect, useMemo, useState } from "react";
import { invalidate } from "@react-three/fiber";
import { ConeGeometry, CylinderGeometry } from "three";
import { DOORWAY, FACADE, INNER_FACADE, PLANTER_SPOTS, PORTICO } from "@/lib/museum/layout";
import { archBandGeometry, archedWallGeometry, bevelledBox, frameRingGeometry, metricBox } from "@/lib/museum/geometry";
import { INSCRIPTION_CANVAS, createInscriptionTextures, type InscriptionTextures } from "@/lib/museum/textures";
import { bakeFacade, bakeInnerFacade } from "@/lib/museum/lightmaps";
import { bakedStoneMaterial, useMuseumMaterials } from "./materials";
import { BevelledBox, InstancedParts, NotReflected, useDisposable, type InstanceTransform } from "./helpers";
import { Planter } from "./Planter";
import { FloorInlay, type InlayStrip } from "./FloorInlay";

const FRONT_Z = PORTICO.depth;
const ARCHIVOLT_BAND = 0.55;
const PILASTER_XS = [-10.6, -5.7, 5.7, 10.6];
/** Dark marble base course height on the facade and inside the porch. */
const PLINTH = 0.55;
const SKIRT = 0.32;
/** Pilasters either side of the doorway on the inner facade (between the door surround and the porch walls). */
const PORTAL_PILASTER = { x: 3.46, width: 0.6, depth: 0.16, top: 6.8 } as const;
/** Porch floor: dark marble bands along the porch walls and across its front edge, each edged in brass. */
const PORCH_INLAY: InlayStrip[] = [
  ...[-1, 1].flatMap((side) => [
    { x: side * 3.72, z: PORTICO.depth / 2, width: 0.5, length: PORTICO.depth, kind: "marble" as const },
    { x: side * 3.45, z: PORTICO.depth / 2, width: 0.03, length: PORTICO.depth, kind: "brass" as const },
  ]),
  { x: 0, z: PORTICO.depth - 0.25, width: 6.9, length: 0.5, kind: "marble" },
  { x: 0, z: PORTICO.depth - 0.52, width: 6.9, length: 0.03, kind: "brass" },
];
const FALLBACK_SERIF = 'Georgia, "Times New Roman", serif';
/** Lanterns hang on the portal pilasters at this height, scaled to suit the 8 m doorway. */
const LANTERN = { y: 4.2, scale: 1.75 } as const;

/** The carved tablet sits in the lunette between the door surround and the porch vault. */
const TABLET = { width: 4.3, centerY: 9.3 } as const;

/**
 * The exterior: an outer facade whose great arch frames a recessed portico,
 * and the inner facade holding the doorway, with lanterns and planters.
 */
export function Entrance() {
  const m = useMuseumMaterials();
  // The facades' lit faces carry baked light: the portico's glow and uplights on the outer facade, falling off
  // into dusk; lantern pools and the downlight on the inner facade. Only their front faces (group 0 of the
  // extruded walls) use it; the reveals inside the arch keep the plain stone.
  // Their front-face UVs are x, y in metres, with x = 0 on the centre line.
  const facadeLight = useDisposable(() =>
    bakedStoneMaterial(m.plaster, bakeFacade(PILASTER_XS), { width: FACADE.width, height: FACADE.height, u0: -FACADE.width / 2 }, 2.6),
  );
  const innerLight = useDisposable(() =>
    bakedStoneMaterial(
      m.plaster,
      bakeInnerFacade(PORTAL_PILASTER.x, LANTERN.y),
      { width: INNER_FACADE.halfWidth * 2, height: INNER_FACADE.height, u0: -INNER_FACADE.halfWidth },
      2.6,
    ),
  );

  const outerWall = useDisposable(() =>
    archedWallGeometry({
      width: FACADE.width,
      height: FACADE.height,
      archHalfWidth: FACADE.archHalfWidth,
      archSpring: FACADE.archSpring,
      depth: PORTICO.depth,
    }),
  );
  const innerWall = useDisposable(() =>
    archedWallGeometry({
      width: INNER_FACADE.halfWidth * 2,
      height: INNER_FACADE.height,
      archHalfWidth: DOORWAY.halfWidth,
      archSpring: DOORWAY.spring,
      depth: INNER_FACADE.thickness,
    }),
  );
  const archivolt = useDisposable(() =>
    archBandGeometry({ innerHalfWidth: FACADE.archHalfWidth, spring: FACADE.archSpring, band: ARCHIVOLT_BAND, depth: 0.16, bevel: 0.04 }),
  );
  const archivoltOuter = useDisposable(() =>
    archBandGeometry({
      innerHalfWidth: FACADE.archHalfWidth + ARCHIVOLT_BAND + 0.04,
      spring: FACADE.archSpring,
      band: 0.14,
      depth: 0.26,
      bevel: 0.02,
    }),
  );
  const porticoRib = useDisposable(() =>
    archBandGeometry({ innerHalfWidth: FACADE.archHalfWidth - 0.22, spring: FACADE.archSpring, band: 0.24, depth: 0.32 }),
  );
  const doorSurround = useDisposable(() =>
    archBandGeometry({ innerHalfWidth: DOORWAY.halfWidth, spring: DOORWAY.spring, band: 0.42, depth: 0.12, bevel: 0.03 }),
  );
  const doorBead = useDisposable(() =>
    archBandGeometry({ innerHalfWidth: DOORWAY.halfWidth - 0.02, spring: DOORWAY.spring, band: 0.09, depth: 0.24, bevel: 0.015 }),
  );

  // Pilasters on the outer facade: shaft, base and capital, each drawn instanced.
  const pilasterShaft = useDisposable(() => bevelledBox(0.9, 11.8, 0.3, 0.03));
  const pilasterBase = useDisposable(() => bevelledBox(1.2, 0.55, 0.46, 0.03));
  const pilasterCapital = useDisposable(() => bevelledBox(1.25, 0.5, 0.5, 0.04));
  const shafts = useMemo<InstanceTransform[]>(() => PILASTER_XS.map((x) => ({ position: [x, 5.9, FRONT_Z + 0.15] })), []);
  const bases = useMemo<InstanceTransform[]>(() => PILASTER_XS.map((x) => ({ position: [x, 0.275, FRONT_Z + 0.23] })), []);
  const capitals = useMemo<InstanceTransform[]>(() => PILASTER_XS.map((x) => ({ position: [x, 12.05, FRONT_Z + 0.25] })), []);

  const plinthInner = FACADE.archHalfWidth + ARCHIVOLT_BAND + 0.08;
  const plinthLength = FACADE.width / 2 - plinthInner;
  const doorSurroundOuter = DOORWAY.halfWidth + 0.42;
  // Where the impost course meets the door surround (outer radius of the surround at the impost height).
  const imposts = {
    innerX: Math.sqrt(Math.max(0, doorSurroundOuter ** 2 - (FACADE.archSpring - 0.1 - DOORWAY.spring) ** 2)) + 0.04,
  };
  const stringCourseX = FACADE.archHalfWidth + ARCHIVOLT_BAND + 0.2;
  const stringCourseLength = FACADE.width / 2 - stringCourseX;
  const keystoneY = FACADE.archSpring + FACADE.archHalfWidth + ARCHIVOLT_BAND * 0.45;

  return (
    <group>
      {/* Outer facade; its arched opening's reveal forms the portico walls and barrel vault. */}
      <mesh geometry={outerWall} material={[facadeLight, m.plaster]} receiveShadow />
      <mesh geometry={archivolt} material={m.stone} position={[0, 0, FRONT_Z]} />
      <mesh geometry={archivoltOuter} material={m.stone} position={[0, 0, FRONT_Z]} />
      <mesh material={m.stone} position={[0, keystoneY, FRONT_Z + 0.22]}>
        <BevelledBox args={[0.72, 1.05, 0.34]} />
      </mesh>
      {[1, -1].map((side) => (
        <group key={side}>
          {/* Impost blocks where the arch springs, and plinths at the foot of the archivolt. */}
          <mesh material={m.stone} position={[side * (FACADE.archHalfWidth + ARCHIVOLT_BAND / 2), FACADE.archSpring - 0.15, FRONT_Z + 0.16]}>
            <BevelledBox args={[ARCHIVOLT_BAND + 0.2, 0.3, 0.3]} />
          </mesh>
          <mesh material={m.darkStone} position={[side * (FACADE.archHalfWidth + ARCHIVOLT_BAND / 2), 0.3, FRONT_Z + 0.14]}>
            <BevelledBox args={[ARCHIVOLT_BAND + 0.16, 0.6, 0.32]} />
          </mesh>
          <mesh material={m.stone} position={[side * (stringCourseX + stringCourseLength / 2), FACADE.archSpring - 0.15, FRONT_Z + 0.06]}>
            <BevelledBox args={[stringCourseLength, 0.22, 0.12]} />
          </mesh>
        </group>
      ))}
      <InstancedParts geometry={pilasterShaft} material={m.stone} transforms={shafts} />
      <InstancedParts geometry={pilasterBase} material={m.darkStone} transforms={bases} />
      <InstancedParts geometry={pilasterCapital} material={m.stone} transforms={capitals} />
      {/* Entablature and cornice across the facade. */}
      <mesh material={m.stone} position={[0, 12.85, FRONT_Z + 0.2]}>
        <BevelledBox args={[FACADE.width, 1.1, 0.4]} />
      </mesh>
      <mesh material={m.stone} position={[0, 13.5, FRONT_Z + 0.32]}>
        <BevelledBox args={[FACADE.width, 0.24, 0.66]} />
      </mesh>

      {/* Ribs across the portico vault. */}
      {[0.85, 2.0].map((z) => (
        <mesh key={z} geometry={porticoRib} material={m.stone} position={[0, 0, z]} />
      ))}

      {/* Inner facade with the doorway and its stone surround. */}
      <mesh geometry={innerWall} material={[innerLight, m.plaster]} position={[0, 0, -INNER_FACADE.thickness]} receiveShadow />
      <mesh geometry={doorSurround} material={m.stone} receiveShadow />
      <mesh geometry={doorBead} material={m.stone} />
      {/* Dark marble threshold under the doors */}
      <mesh material={m.darkStone} position={[0, 0.02, -INNER_FACADE.thickness / 2]} receiveShadow>
        <BevelledBox args={[DOORWAY.halfWidth * 2, 0.04, INNER_FACADE.thickness]} />
      </mesh>

      {/* Same surround on the gallery side, so the doorway is finished from inside too. */}
      <mesh geometry={doorSurround} material={m.stone} position={[0, 0, -INNER_FACADE.thickness]} rotation={[0, Math.PI, 0]} />

      {[-1, 1].map((side) => (
        <group key={side}>
          {/* Dark marble base course along the facade, stopping at the archivolt plinths. */}
          <MetricBox
            size={[plinthLength, PLINTH, 0.12]}
            position={[side * (plinthInner + plinthLength / 2), PLINTH / 2, FRONT_Z + 0.06]}
          />
          {/* Skirting inside the porch: side walls and the inner facade either side of the door. */}
          <MetricBox size={[0.05, SKIRT, PORTICO.depth]} position={[side * (FACADE.archHalfWidth - 0.025), SKIRT / 2, PORTICO.depth / 2]} />
          <MetricBox
            size={[FACADE.archHalfWidth - doorSurroundOuter, SKIRT, 0.05]}
            position={[(side * (FACADE.archHalfWidth + doorSurroundOuter)) / 2, SKIRT / 2, 0.025]}
          />
          {/* Impost moulding on the inner facade at the springing of the porch vault. */}
          <mesh material={m.stone} position={[side * (FACADE.archHalfWidth + imposts.innerX) / 2, FACADE.archSpring - 0.1, 0.06]}>
            <BevelledBox args={[FACADE.archHalfWidth - imposts.innerX, 0.2, 0.12]} />
          </mesh>
          {/* Pilasters flanking the doorway carry the lanterns, as in a classical portal. */}
          <group position={[side * PORTAL_PILASTER.x, 0, 0]}>
            <mesh material={m.pilaster} position={[0, PORTAL_PILASTER.top / 2, PORTAL_PILASTER.depth / 2]} receiveShadow>
              <BevelledBox args={[PORTAL_PILASTER.width, PORTAL_PILASTER.top, PORTAL_PILASTER.depth]} faceUVs />
            </mesh>
            <mesh material={m.darkStone} position={[0, 0.22, PORTAL_PILASTER.depth / 2 + 0.03]}>
              <BevelledBox args={[PORTAL_PILASTER.width + 0.16, 0.44, PORTAL_PILASTER.depth + 0.08]} />
            </mesh>
            <mesh material={m.stone} position={[0, 0.5, PORTAL_PILASTER.depth / 2 + 0.02]}>
              <BevelledBox args={[PORTAL_PILASTER.width + 0.08, 0.12, PORTAL_PILASTER.depth + 0.05]} />
            </mesh>
            <mesh material={m.stone} position={[0, PORTAL_PILASTER.top - 0.12, PORTAL_PILASTER.depth / 2 + 0.03]}>
              <BevelledBox args={[PORTAL_PILASTER.width + 0.14, 0.24, PORTAL_PILASTER.depth + 0.08]} />
            </mesh>
            <mesh material={m.stone} position={[0, PORTAL_PILASTER.top - 0.3, PORTAL_PILASTER.depth / 2 + 0.015]}>
              <BevelledBox args={[PORTAL_PILASTER.width + 0.05, 0.06, PORTAL_PILASTER.depth + 0.03]} />
            </mesh>
          </group>
        </group>
      ))}

      <InscriptionTablet />

      {[-1, 1].map((side) => (
        <WallLantern key={side} position={[side * PORTAL_PILASTER.x, LANTERN.y, PORTAL_PILASTER.depth]} />
      ))}
      {/* One warm lamp between the lanterns stands in for their light on the doors and planters; their glow on the
          stone around them is baked into the inner facade. */}
      <pointLight position={[0, LANTERN.y, 1.3]} color="#ffb46a" intensity={16} distance={10} decay={2} />
      {PLANTER_SPOTS.filter(([, z]) => z > 0).map(([x, z]) => (
        <Planter key={x} position={[x, 0, z]} seed={Math.sign(x)} scale={1.4} />
      ))}
      <FloorInlay strips={PORCH_INLAY} />
    </group>
  );
}

/** Dark marble metric-UV box (base courses, skirting) that keeps the veining at true scale. */
function MetricBox({ size, position }: { size: [number, number, number]; position: [number, number, number] }) {
  const m = useMuseumMaterials();
  const geometry = useDisposable(() => metricBox(...size));
  return <mesh geometry={geometry} material={m.darkStone} position={position} receiveShadow />;
}

/**
 * Classic brass lantern on a wall bracket: tapered hexagonal body of frosted
 * glass, brass corner bars, cap and finial, with a warm lamp inside.
 */
function WallLantern({ position }: { position: [number, number, number] }) {
  const m = useMuseumMaterials();
  const parts = useDisposable(() => {
    const glass = new CylinderGeometry(0.14, 0.105, 0.38, 6, 1, true);
    const cap = new ConeGeometry(0.18, 0.15, 6, 1);
    const ring = new CylinderGeometry(0.155, 0.155, 0.035, 6);
    const bowl = new CylinderGeometry(0.115, 0.05, 0.07, 6);
    const bar = new CylinderGeometry(0.008, 0.008, 0.39, 5);
    const all = [glass, cap, ring, bowl, bar];
    return { glass, cap, ring, bowl, bar, dispose: () => all.forEach((g) => g.dispose()) };
  });
  // Corner bars follow the taper of the glass.
  const bars = useMemo<InstanceTransform[]>(() => {
    const tilt = Math.atan2(0.14 - 0.105, 0.38);
    return Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * Math.PI * 2;
      const r = (0.14 + 0.105) / 2 + 0.004;
      return { position: [Math.sin(a) * r, 0, Math.cos(a) * r] as const, rotation: [-tilt, a, 0] as const };
    });
  }, []);
  return (
    <group position={position} scale={LANTERN.scale}>
      {/* The lamp and glass appear in the floor's reflection; the slender metalwork is left out of it. */}
      <NotReflected>
        {/* Wall plate and bracket */}
        <mesh material={m.brass} position={[0, 0.22, 0.015]}>
          <BevelledBox args={[0.12, 0.3, 0.03]} />
        </mesh>
        <mesh material={m.brass} position={[0, 0.3, 0.22]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.016, 0.016, 0.4, 8]} />
        </mesh>
        <mesh material={m.brass} position={[0, 0.2, 0.14]} rotation={[Math.PI / 4, 0, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 0.26, 6]} />
        </mesh>
        <group position={[0, 0, 0.42]}>
          {/* Hanger from the bracket to the cap */}
          <mesh material={m.brass} position={[0, 0.27, 0]}>
            <cylinderGeometry args={[0.01, 0.01, 0.07, 6]} />
          </mesh>
          <mesh material={m.brass} position={[0, 0.315, 0]}>
            <sphereGeometry args={[0.022, 10, 8]} />
          </mesh>
          <InstancedParts geometry={parts.bar} material={m.brass} transforms={bars} />
          <mesh geometry={parts.ring} material={m.brass} position={[0, 0.195, 0]} />
          <mesh geometry={parts.cap} material={m.brass} position={[0, 0.285, 0]} />
          <mesh geometry={parts.bowl} material={m.brass} position={[0, -0.225, 0]} />
          <mesh material={m.brass} position={[0, -0.28, 0]}>
            <sphereGeometry args={[0.018, 10, 8]} />
          </mesh>
        </group>
      </NotReflected>
      <group position={[0, 0, 0.42]}>
        {/* Lamp first, then the frosted glass around it */}
        <mesh material={m.lanternFlame} position={[0, -0.02, 0]}>
          <sphereGeometry args={[0.04, 12, 8]} />
        </mesh>
        <mesh geometry={parts.glass} material={m.lanternGlass} renderOrder={1} />
        {/* A soft halo around the lamp, as the eye sees a bright light in a dim porch */}
        <sprite material={m.lampHalo} scale={[0.85, 0.85, 1]} position={[0, -0.02, 0.06]} renderOrder={2} />
      </group>
    </group>
  );
}

/**
 * Carved stone tablet above the doors with the gilded inscription
 * "ARVISTA / THE ART GALLERY", lettered in the site's display face once it has loaded.
 */
function InscriptionTablet() {
  const m = useMuseumMaterials();
  const textures = useInscriptionTextures();
  const height = TABLET.width * (INSCRIPTION_CANVAS.height / INSCRIPTION_CANVAS.width);
  const border = useDisposable(() => frameRingGeometry(TABLET.width, height, 0.11, 0.05, 0.018));
  return (
    <group position={[0, TABLET.centerY, 0]}>
      <mesh geometry={border} material={m.stone} position={[0, 0, 0.02]} />
      {/* Slab body stops 6 mm behind the lettered face, so the two never compete for depth. */}
      <mesh material={m.stone} position={[0, 0, 0.0175]}>
        <BevelledBox args={[TABLET.width, height, 0.035]} />
      </mesh>
      <mesh position={[0, 0, 0.041]}>
        <planeGeometry args={[TABLET.width, height]} />
        <meshStandardMaterial
          map={textures.map}
          bumpMap={textures.bump}
          bumpScale={1.4}
          roughnessMap={textures.surface}
          metalnessMap={textures.surface}
          roughness={0.72}
          metalness={1}
        />
      </mesh>
    </group>
  );
}

/**
 * Inscription textures, available from the first frame in a fallback serif so
 * the tablet's material is compiled with the rest of the scene. Once the
 * display face has loaded, the same textures are re-lettered in place: no new
 * material, no shader compile mid-walk.
 */
function useInscriptionTextures(): InscriptionTextures {
  const [textures] = useState(() => createInscriptionTextures(FALLBACK_SERIF));
  useEffect(() => {
    let cancelled = false;
    // next/font exposes the generated family name (with its metric-matched fallback) through this variable.
    const family = getComputedStyle(document.documentElement).getPropertyValue("--font-display").trim();
    if (family) {
      document.fonts
        .load(`400 120px ${family}`)
        .then(() => {
          if (!cancelled) {
            textures.redraw(family);
            invalidate();
          }
        })
        .catch(() => undefined);
    }
    return () => {
      cancelled = true;
    };
  }, [textures]);
  useEffect(() => () => textures.dispose(), [textures]);
  return textures;
}

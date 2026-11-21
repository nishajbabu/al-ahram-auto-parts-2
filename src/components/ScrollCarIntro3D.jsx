import { Component, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Html, Lightformer, useGLTF } from "@react-three/drei";
import { AnimatePresence, motion, useScroll } from "framer-motion";
import * as THREE from "three";
import { ArrowDown, ArrowUpRight, MoveHorizontal } from "lucide-react";
import { LUXURY_EASE, PARTS_CATALOG } from "../data/partsCatalog";
import { PartBlueprintSVG } from "./PrecisionVisuals";

const INTRO_STAGES = [
  {
    num: "01",
    title: "Diagonal Silhouette",
    subtitle: "Drag sideways to orbit 360° or scroll down to inspect internal hardware.",
  },
  {
    num: "02",
    title: "Overhead Plan View",
    subtitle: "Balanced chassis geometry and symmetrical axle alignment.",
  },
  {
    num: "03",
    title: "Internal Hardware X-Ray",
    subtitle: "Translucent shell revealing Al Ahram braking, suspension, cooling, and powertrain cores.",
  },
  {
    num: "04",
    title: "Exploded Architecture",
    subtitle: "Separating core mechanical assemblies cleanly in 3D space.",
  },
  {
    num: "05",
    title: "Assembled Hardware Matrix",
    subtitle: "Tap any 3D assembly to configure specs, or scroll further for the full selector.",
  },
  {
    num: "06",
    title: "Select a Precision Spare Part",
    subtitle: "Tap any component to configure OEM vs. Heavy-Duty specs.",
  },
];

const PAINT_FINISHES = [
  { id: "original", label: "Original Champagne", swatch: "#B5A895", hex: null },
  { id: "obsidian", label: "Obsidian Carbon", swatch: "#1B202B", hex: "#1B202B" },
  { id: "crimson", label: "Crimson Sport", swatch: "#B91C1C", hex: "#B91C1C" },
  { id: "arctic", label: "Arctic Platinum", swatch: "#E2E8F0", hex: "#E2E8F0" },
];

const SHOWCASE_PART_IDS = [
  "starter-motors",
  "control-arms",
  "struts",
  "master-cylinders",
  "cylinder-heads",
  "brake-pads-rotors",
  "water-pumps",
  "oil-fuel-air-filters",
];

function lerp(a, b, t) {
  return a + (b - a) * Math.min(1, Math.max(0, t));
}

function rangeProgress(value, start, end) {
  return Math.min(1, Math.max(0, (value - start) / (end - start)));
}

class ModelErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function CarGLBModel({ progressRef, paintHex }) {
  const { scene } = useGLTF("/models/car.glb");
  const groupRef = useRef(null);
  const paintTargetRef = useRef(new THREE.Color());
  const xrayColor = useMemo(() => new THREE.Color("#38bdf8"), []);

  const { normalizedScene, materialsList } = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const scaleFactor = 4.3 / maxDim;

    clone.scale.setScalar(scaleFactor);
    clone.position.set(
      -center.x * scaleFactor,
      -box.min.y * scaleFactor - 0.55,
      -center.z * scaleFactor
    );

    const mats = [];
    clone.traverse((child) => {
      if (child.isMesh && child.material) {
        const clonedMat = child.material.clone();
        clonedMat.transparent = true;
        clonedMat.depthWrite = true;

        const meshName = `${child.name || ""} ${clonedMat.name || ""}`.toLowerCase();
        const baseColor = clonedMat.color ? clonedMat.color.clone() : new THREE.Color("#cbd5e1");
        const lum = 0.2126 * baseColor.r + 0.7152 * baseColor.g + 0.0722 * baseColor.b;

        const isExcluded =
          /tire|tyre|wheel|rim|rubber|glass|window|windshield|interior|seat|lamp|light|grille|chrome|brake|caliper/.test(
            meshName
          ) ||
          clonedMat.opacity < 0.9 ||
          lum < 0.14;

        const isPaintable =
          /paint|body|car|exterior|hood|door|fender|roof|bumper/.test(meshName) || !isExcluded;

        mats.push({
          mat: clonedMat,
          baseColor,
          isPaintable,
        });
        child.material = clonedMat;
      }
    });

    return { normalizedScene: clone, materialsList: mats };
  }, [scene]);

  useFrame(() => {
    const p = progressRef.current;
    const xrayAmt = rangeProgress(p, 0.34, 0.48);
    const explodeAmt = rangeProgress(p, 0.52, 0.66);

    if (groupRef.current) {
      groupRef.current.position.y = lerp(0, 2.2, explodeAmt);
      groupRef.current.visible = explodeAmt < 0.98;
    }

    if (paintHex) {
      paintTargetRef.current.set(paintHex);
    }

    materialsList.forEach(({ mat, baseColor, isPaintable }) => {
      const targetOpacity = lerp(1, 0.14, xrayAmt) * lerp(1, 0, explodeAmt);
      mat.opacity = targetOpacity;
      mat.depthWrite = xrayAmt < 0.25;
      mat.wireframe = xrayAmt > 0.48;

      if (mat.color) {
        const chosenBase = paintHex && isPaintable ? paintTargetRef.current : baseColor;
        mat.color.lerp(chosenBase, 0.14);
        if (xrayAmt > 0.01) {
          mat.color.lerp(xrayColor, xrayAmt * 0.78);
        }
      }
    });
  });

  return (
    <group ref={groupRef}>
      <primitive object={normalizedScene} />
    </group>
  );
}

function FallbackChassis({ progressRef, isLoading = false }) {
  const ref = useRef(null);
  useFrame((_, delta) => {
    const explodeAmt = rangeProgress(progressRef.current, 0.52, 0.66);
    if (ref.current) {
      ref.current.position.y = lerp(0, 2.0, explodeAmt);
      ref.current.visible = explodeAmt < 0.98;
      if (isLoading) ref.current.rotation.y += delta * 0.6;
    }
  });

  return (
    <group ref={ref}>
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[1.85, 0.65, 4.15]} />
        <meshStandardMaterial color="#38bdf8" wireframe transparent opacity={0.35} />
      </mesh>
      {isLoading && (
        <Html center>
          <div className="font-mono-tech whitespace-nowrap rounded-full border border-sky-400/35 bg-black/80 px-3.5 py-1.5 text-[10px] uppercase tracking-[0.22em] text-sky-300 backdrop-blur-md">
            Loading 3D Vehicle...
          </div>
        </Html>
      )}
    </group>
  );
}

function StudioGridFloor({ progressRef }) {
  const ref = useRef(null);
  useFrame(() => {
    const hideAmt = rangeProgress(progressRef.current, 0.62, 0.7);
    if (ref.current) {
      ref.current.visible = hideAmt < 0.95;
      ref.current.position.y = lerp(-0.56, -2.5, hideAmt);
    }
  });
  return <gridHelper ref={ref} args={[14, 24, "#334155", "#141824"]} position={[0, -0.56, 0]} />;
}

function GridPartCaption({ visible, text, colorClass = "text-zinc-300" }) {
  if (!visible) return null;
  return (
    <Html center zIndexRange={[10, 0]}>
      <div
        className={`font-mono-tech pointer-events-none select-none whitespace-nowrap text-center text-[9px] font-medium uppercase tracking-[0.14em] sm:text-[11px] sm:tracking-[0.2em] ${colorClass}`}
      >
        {text}
      </div>
    </Html>
  );
}

function DetailedBrakeUnit({ sideSign = -1 }) {
  return (
    <group>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.33, 0.33, 0.06, 36]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.94} roughness={0.22} />
      </mesh>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <mesh
          key={deg}
          position={[
            sideSign * 0.032,
            Math.sin((deg * Math.PI) / 180) * 0.24,
            Math.cos((deg * Math.PI) / 180) * 0.24,
          ]}
          rotation={[deg * (Math.PI / 180) + 0.35, 0, 0]}
        >
          <boxGeometry args={[0.008, 0.015, 0.12]} />
          <meshStandardMaterial color="#0f172a" roughness={0.6} />
        </mesh>
      ))}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.16, 0.16, 0.088, 28]} />
        <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.32} />
      </mesh>
      {[0, 72, 144, 216, 288].map((deg) => (
        <mesh
          key={deg}
          position={[
            sideSign * 0.048,
            Math.sin((deg * Math.PI) / 180) * 0.1,
            Math.cos((deg * Math.PI) / 180) * 0.1,
          ]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.016, 0.016, 0.03, 12]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.96} roughness={0.12} />
        </mesh>
      ))}
      <group position={[sideSign * 0.02, 0.14, 0.21]} rotation={[0.45, 0, 0]}>
        <mesh>
          <boxGeometry args={[0.14, 0.24, 0.16]} />
          <meshStandardMaterial color="#D9383A" metalness={0.68} roughness={0.24} />
        </mesh>
        <mesh position={[0, 0, 0.085]}>
          <boxGeometry args={[0.1, 0.18, 0.03]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
}

function DetailedStrutUnit({ coilGeo }) {
  return (
    <group>
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.032, 0.032, 0.56, 16]} />
        <meshStandardMaterial color="#f1f5f9" metalness={0.96} roughness={0.14} />
      </mesh>
      <mesh position={[0, -0.14, 0]}>
        <cylinderGeometry args={[0.052, 0.052, 0.34, 20]} />
        <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.22} />
      </mesh>
      <mesh position={[0, 0.34, 0]}>
        <cylinderGeometry args={[0.105, 0.105, 0.04, 24]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.22} />
      </mesh>
      {[0, 120, 240].map((deg) => (
        <mesh
          key={deg}
          position={[
            Math.cos((deg * Math.PI) / 180) * 0.065,
            0.37,
            Math.sin((deg * Math.PI) / 180) * 0.065,
          ]}
        >
          <cylinderGeometry args={[0.01, 0.01, 0.035, 10]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.95} roughness={0.15} />
        </mesh>
      ))}
      <mesh position={[0, -0.33, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.04, 0.015, 12, 20]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.22} />
      </mesh>
      <mesh position={[0, 0.04, 0]} geometry={coilGeo}>
        <meshStandardMaterial color="#D9383A" metalness={0.65} roughness={0.25} />
      </mesh>
    </group>
  );
}

function InternalHardwareRig({
  progressRef,
  showGridCaptions,
  hoveredPartId,
  setHoveredPartId,
  onSelectPart,
}) {
  const { size } = useThree();
  const isPortrait = size.width < size.height;

  const rigRef = useRef(null);
  const engineRef = useRef(null);
  const radiatorRef = useRef(null);
  const fanLeftRef = useRef(null);
  const fanRightRef = useRef(null);
  const exhaustRef = useRef(null);
  const brakeHeroRef = useRef(null);
  const strutHeroRef = useRef(null);
  const extraCornerRefs = useRef([]);

  const coilGeo = useMemo(() => {
    const pts = [];
    const turns = 7;
    const steps = 96;
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      const angle = t * turns * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(angle) * 0.088, t * 0.44 - 0.22, Math.sin(angle) * 0.088));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    return new THREE.TubeGeometry(curve, 84, 0.018, 12, false);
  }, []);

  const exhaustPipeGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.08, 1.05),
      new THREE.Vector3(0, -0.02, 0.35),
      new THREE.Vector3(0, -0.02, -0.95),
    ]);
    return new THREE.TubeGeometry(curve, 32, 0.036, 14, false);
  }, []);

  const extraCorners = [
    [0.92, -0.22, 1.32],
    [-0.92, -0.22, -1.32],
    [0.92, -0.22, -1.32],
  ];

  useFrame((state, delta) => {
    const p = progressRef.current;
    const reveal = rangeProgress(p, 0.32, 0.46);
    const explode = rangeProgress(p, 0.5, 0.66);
    const assemble = rangeProgress(p, 0.67, 0.8);

    // Portrait phones use a clean 2-col x 3-row layout so ZERO parts clip off screen edges
    const engTarget = isPortrait ? [-0.72, 1.35] : [-2.0, 0.92];
    const radTarget = isPortrait ? [0.72, 1.35] : [0, 0.92];
    const exhTarget = isPortrait ? [-0.72, 0.1] : [2.0, 0.92];
    const brkTarget = isPortrait ? [0.72, 0.1] : [-1.08, -0.46];
    const strTarget = isPortrait ? [0, -1.12] : [1.08, -0.46];

    if (rigRef.current) {
      rigRef.current.visible = reveal > 0.02;
      rigRef.current.scale.setScalar(lerp(0.84, 1, reveal));
    }

    if (fanLeftRef.current) fanLeftRef.current.rotation.z += delta * 6.5;
    if (fanRightRef.current) fanRightRef.current.rotation.z -= delta * 6.5;

    if (engineRef.current) {
      const hoverBoost = hoveredPartId === "cylinder-heads" && assemble > 0.5 ? 1.14 : 1;
      engineRef.current.position.set(
        lerp(0, engTarget[0], assemble),
        lerp(lerp(0.02, 1.05, explode), engTarget[1], assemble),
        lerp(1.05, 0, assemble)
      );
      engineRef.current.scale.setScalar(lerp(1, (isPortrait ? 0.92 : 1.15) * hoverBoost, assemble));
      if (assemble > 0.3) engineRef.current.rotation.y += delta * 0.42 * assemble;
      else engineRef.current.rotation.y = 0;
    }

    if (radiatorRef.current) {
      const hoverBoost = hoveredPartId === "water-pumps" && assemble > 0.5 ? 1.14 : 1;
      radiatorRef.current.position.set(
        lerp(0, radTarget[0], assemble),
        lerp(lerp(0, 0.3, explode), radTarget[1], assemble),
        lerp(lerp(1.75, 2.55, explode), 0, assemble)
      );
      radiatorRef.current.scale.setScalar(lerp(1, (isPortrait ? 0.85 : 1.05) * hoverBoost, assemble));
      if (assemble > 0.3) radiatorRef.current.rotation.y += delta * 0.32 * assemble;
      else radiatorRef.current.rotation.y = 0;
    }

    if (exhaustRef.current) {
      const hoverBoost = hoveredPartId === "mufflers" && assemble > 0.5 ? 1.14 : 1;
      exhaustRef.current.position.set(
        lerp(0, exhTarget[0], assemble),
        lerp(lerp(-0.34, -0.7, explode), exhTarget[1], assemble),
        lerp(lerp(-0.45, -1.35, explode), 0, assemble)
      );
      exhaustRef.current.scale.setScalar(lerp(1, (isPortrait ? 0.5 : 0.62) * hoverBoost, assemble));
      if (assemble > 0.3) exhaustRef.current.rotation.y += delta * 0.42 * assemble;
      else exhaustRef.current.rotation.y = 0;
    }

    if (brakeHeroRef.current) {
      const hoverBoost = hoveredPartId === "brake-pads-rotors" && assemble > 0.5 ? 1.14 : 1;
      brakeHeroRef.current.position.set(
        lerp(lerp(-0.92, -1.85, explode), brkTarget[0], assemble),
        lerp(lerp(-0.22, 0.1, explode), brkTarget[1], assemble),
        lerp(1.32, 0, assemble)
      );
      brakeHeroRef.current.scale.setScalar(lerp(1, (isPortrait ? 1.25 : 1.52) * hoverBoost, assemble));
      brakeHeroRef.current.rotation.y = lerp(
        0,
        Math.PI / 2 + Math.sin(state.clock.elapsedTime * 0.85) * 0.3,
        assemble
      );
    }

    if (strutHeroRef.current) {
      const hoverBoost = hoveredPartId === "struts" && assemble > 0.5 ? 1.14 : 1;
      strutHeroRef.current.position.set(
        lerp(lerp(-0.75, -1.65, explode), strTarget[0], assemble),
        lerp(lerp(0.2, 0.52, explode), strTarget[1], assemble),
        lerp(1.32, 0, assemble)
      );
      strutHeroRef.current.scale.setScalar(lerp(1, (isPortrait ? 1.22 : 1.48) * hoverBoost, assemble));
      if (assemble > 0.3) strutHeroRef.current.rotation.y += delta * 0.5 * assemble;
      else strutHeroRef.current.rotation.y = 0;
    }

    extraCorners.forEach(([bx, by, bz], idx) => {
      const c = extraCornerRefs.current[idx];
      if (!c) return;
      const sideSign = bx < 0 ? -1 : 1;
      c.position.set(lerp(bx, bx + sideSign * 0.95, explode), lerp(by, by + 0.34, explode), bz);
      const shrink = 1 - rangeProgress(p, 0.67, 0.75);
      c.scale.setScalar(Math.max(0.001, shrink));
      c.visible = shrink > 0.03;
    });
  });

  return (
    <group ref={rigRef} visible={false}>
      <group
        ref={engineRef}
        position={[0, 0.02, 1.05]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHoveredPartId("cylinder-heads");
        }}
        onPointerOut={() => setHoveredPartId(null)}
        onClick={(e) => {
          e.stopPropagation();
          onSelectPart("cylinder-heads");
        }}
      >
        <mesh position={[0, -0.1, 0]}>
          <boxGeometry args={[0.56, 0.32, 0.78]} />
          <meshStandardMaterial color="#475569" metalness={0.88} roughness={0.25} />
        </mesh>
        <mesh position={[0, -0.29, 0]}>
          <boxGeometry args={[0.42, 0.08, 0.68]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.35} />
        </mesh>
        {[-1, 1].map((side) => (
          <group key={side} position={[side * 0.22, 0.13, 0]} rotation={[0, 0, side * -0.45]}>
            <mesh>
              <boxGeometry args={[0.24, 0.21, 0.74]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.92} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.13, 0]}>
              <boxGeometry args={[0.2, 0.075, 0.7]} />
              <meshStandardMaterial color="#D9383A" metalness={0.68} roughness={0.26} />
            </mesh>
            {[-0.22, -0.07, 0.07, 0.22].map((rz) => (
              <mesh key={rz} position={[0, 0.175, rz]}>
                <boxGeometry args={[0.17, 0.015, 0.025]} />
                <meshStandardMaterial color="#f8fafc" metalness={0.95} roughness={0.15} />
              </mesh>
            ))}
          </group>
        ))}
        {[-0.22, -0.07, 0.07, 0.22].map((iz) => (
          <group key={iz}>
            <mesh position={[-0.06, 0.27, iz]}>
              <cylinderGeometry args={[0.028, 0.022, 0.12, 14]} />
              <meshStandardMaterial color="#f8fafc" metalness={0.96} roughness={0.12} />
            </mesh>
            <mesh position={[0.06, 0.27, iz]}>
              <cylinderGeometry args={[0.028, 0.022, 0.12, 14]} />
              <meshStandardMaterial color="#f8fafc" metalness={0.96} roughness={0.12} />
            </mesh>
          </group>
        ))}
        {[-0.22, 0.22].map((px) => (
          <mesh key={px} position={[px, 0.12, 0.42]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.04, 24]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.16} />
          </mesh>
        ))}
        <mesh position={[0, -0.08, 0.42]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.13, 0.13, 0.05, 24]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.18} />
        </mesh>

        <group position={[0, -0.58, 0]}>
          <GridPartCaption visible={showGridCaptions} text="Cylinder Heads" colorClass="text-zinc-200" />
        </group>
      </group>

      <group
        ref={radiatorRef}
        position={[0, 0, 1.75]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHoveredPartId("water-pumps");
        }}
        onPointerOut={() => setHoveredPartId(null)}
        onClick={(e) => {
          e.stopPropagation();
          onSelectPart("water-pumps");
        }}
      >
        <mesh>
          <boxGeometry args={[1.04, 0.44, 0.07]} />
          <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.24, 0]}>
          <boxGeometry args={[1.12, 0.06, 0.11]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.94} roughness={0.18} />
        </mesh>
        <mesh position={[0, -0.24, 0]}>
          <boxGeometry args={[1.12, 0.06, 0.11]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.94} roughness={0.18} />
        </mesh>
        <mesh position={[-0.54, 0, 0]}>
          <boxGeometry args={[0.05, 0.52, 0.1]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.2} />
        </mesh>
        <mesh position={[0.54, 0, 0]}>
          <boxGeometry args={[0.05, 0.52, 0.1]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.2} />
        </mesh>
        <mesh position={[0.42, 0.24, -0.09]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.12, 16]} />
          <meshStandardMaterial color="#38bdf8" metalness={0.75} roughness={0.25} />
        </mesh>

        {[-0.28, 0.28].map((fx, idx) => (
          <group key={fx} position={[fx, 0, -0.06]}>
            <mesh>
              <torusGeometry args={[0.18, 0.018, 12, 28]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
            </mesh>
            <group ref={idx === 0 ? fanLeftRef : fanRightRef}>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.045, 0.045, 0.03, 16]} />
                <meshStandardMaterial color="#38bdf8" metalness={0.85} roughness={0.2} />
              </mesh>
              {[0, 72, 144, 216, 288].map((deg) => (
                <mesh
                  key={deg}
                  position={[
                    Math.cos((deg * Math.PI) / 180) * 0.095,
                    Math.sin((deg * Math.PI) / 180) * 0.095,
                    0,
                  ]}
                  rotation={[0.3, 0, (deg * Math.PI) / 180]}
                >
                  <boxGeometry args={[0.12, 0.032, 0.008]} />
                  <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.22} />
                </mesh>
              ))}
            </group>
          </group>
        ))}

        <group position={[0, -0.58, 0]}>
          <GridPartCaption visible={showGridCaptions} text="Cooling & Fans" colorClass="text-sky-300" />
        </group>
      </group>

      <group
        ref={exhaustRef}
        position={[0, -0.34, -0.45]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHoveredPartId("mufflers");
        }}
        onPointerOut={() => setHoveredPartId(null)}
        onClick={(e) => {
          e.stopPropagation();
          onSelectPart("mufflers");
        }}
      >
        {[-0.26, 0.26].map((ex) => (
          <group key={ex} position={[ex, 0, 0]}>
            <mesh geometry={exhaustPipeGeo}>
              <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[0, -0.02, -1.15]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.11, 0.11, 0.48, 24]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.94} roughness={0.16} />
            </mesh>
            {[-0.91, -1.39].map((wz) => (
              <mesh key={wz} position={[0, -0.02, wz]}>
                <torusGeometry args={[0.11, 0.012, 10, 24]} />
                <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.2} />
              </mesh>
            ))}
            <mesh position={[0, -0.02, -1.5]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.062, 0.056, 0.22, 22]} />
              <meshStandardMaterial color="#f8fafc" metalness={0.97} roughness={0.1} />
            </mesh>
          </group>
        ))}

        <group position={[0, -0.92, -0.35]}>
          <GridPartCaption visible={showGridCaptions} text="Exhaust & Mufflers" colorClass="text-amber-300" />
        </group>
      </group>

      <group
        ref={brakeHeroRef}
        position={[-0.92, -0.22, 1.32]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHoveredPartId("brake-pads-rotors");
        }}
        onPointerOut={() => setHoveredPartId(null)}
        onClick={(e) => {
          e.stopPropagation();
          onSelectPart("brake-pads-rotors");
        }}
      >
        <DetailedBrakeUnit sideSign={-1} />
        <group position={[0, -0.46, 0]}>
          <GridPartCaption visible={showGridCaptions} text="Brake Pads & Rotors" colorClass="text-zinc-200" />
        </group>
      </group>

      <group
        ref={strutHeroRef}
        position={[-0.75, 0.2, 1.32]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHoveredPartId("struts");
        }}
        onPointerOut={() => setHoveredPartId(null)}
        onClick={(e) => {
          e.stopPropagation();
          onSelectPart("struts");
        }}
      >
        <DetailedStrutUnit coilGeo={coilGeo} />
        <group position={[0, -0.48, 0]}>
          <GridPartCaption visible={showGridCaptions} text="Monotube Struts" colorClass="text-[#ff7375]" />
        </group>
      </group>

      {extraCorners.map((pos, idx) => (
        <group
          key={idx}
          ref={(el) => {
            extraCornerRefs.current[idx] = el;
          }}
          position={pos}
        >
          <DetailedBrakeUnit sideSign={pos[0] < 0 ? -1 : 1} />
          <group position={[pos[0] < 0 ? 0.17 : -0.17, 0.42, 0]}>
            <DetailedStrutUnit coilGeo={coilGeo} />
          </group>
        </group>
      ))}
    </group>
  );
}

function ScrollCameraRig({ progressRef, orbitRef, pointerRef }) {
  const { camera, size } = useThree();
  const targetVec = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    const p = progressRef.current;
    const aspect = size.width / Math.max(1, size.height);
    const mobileZoomMult = aspect < 1 ? Math.min(2.1, 1.12 / Math.max(0.45, aspect)) : 1;

    let baseX;
    let baseY;
    let baseZ;

    if (p < 0.28) {
      const t = rangeProgress(p, 0, 0.28);
      baseX = lerp(4.4, 0.02, t) * mobileZoomMult;
      baseY = lerp(1.75, 6.4 * (aspect < 1 ? 1.25 : 1), t);
      baseZ = lerp(4.6, 0.05, t) * mobileZoomMult;
    } else if (p < 0.5) {
      const t = rangeProgress(p, 0.28, 0.5);
      baseX = lerp(0.02, 2.9, t) * mobileZoomMult;
      baseY = lerp(6.4 * (aspect < 1 ? 1.25 : 1), 4.1, t);
      baseZ = lerp(0.05, 3.7, t) * mobileZoomMult;
    } else if (p < 0.67) {
      const t = rangeProgress(p, 0.5, 0.67);
      baseX = lerp(2.9, 4.3, t) * mobileZoomMult;
      baseY = lerp(4.1, 2.2, t);
      baseZ = lerp(3.7, 4.7, t) * mobileZoomMult;
    } else {
      const t = rangeProgress(p, 0.67, 0.8);
      baseX = lerp(4.3 * mobileZoomMult, 0, t);
      baseY = lerp(2.2, 0.12, t);
      baseZ = lerp(4.7 * mobileZoomMult, aspect < 1 ? 8.2 : 6.0, t);
    }

    const gridDamp = 1 - rangeProgress(p, 0.67, 0.78);
    const yaw = orbitRef.current.yaw * gridDamp + pointerRef.current.x * (gridDamp > 0.2 ? 0.22 : 0.06);
    const pitchLift = pointerRef.current.y * 0.28;

    const cosY = Math.cos(yaw);
    const sinY = Math.sin(yaw);
    const rotatedX = baseX * cosY - baseZ * sinY;
    const rotatedZ = baseX * sinY + baseZ * cosY;

    targetVec.set(rotatedX, baseY + pitchLift, rotatedZ);
    camera.position.lerp(targetVec, 0.14);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

useGLTF.preload("/models/car.glb");

export default function ScrollCarIntro3D({ onComplete, onSelectPart }) {
  const containerRef = useRef(null);
  const progressRef = useRef(0);
  const completedRef = useRef(false);

  const pointerRef = useRef({ x: 0, y: 0 });
  const orbitRef = useRef({ yaw: 0, dragging: false, lastX: 0 });

  const [stageIdx, setStageIdx] = useState(0);
  const [scrollPct, setScrollPct] = useState(0);
  const [paintId, setPaintId] = useState("original");
  const [hoveredPartId, setHoveredPartId] = useState(null);

  const showcaseParts = useMemo(
    () =>
      SHOWCASE_PART_IDS.map((id) => PARTS_CATALOG.find((p) => p.id === id)).filter(Boolean),
    []
  );

  const activePaintHex = useMemo(
    () => PAINT_FINISHES.find((f) => f.id === paintId)?.hex || null,
    [paintId]
  );

  const hoveredPart = useMemo(
    () => PARTS_CATALOG.find((p) => p.id === hoveredPartId) || null,
    [hoveredPartId]
  );

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    const unsub = scrollYProgress.on("change", (v) => {
      progressRef.current = v;
      setScrollPct(Math.round(v * 100));

      if (v < 0.18) setStageIdx(0);
      else if (v < 0.34) setStageIdx(1);
      else if (v < 0.5) setStageIdx(2);
      else if (v < 0.67) setStageIdx(3);
      else if (v < 0.84) setStageIdx(4);
      else setStageIdx(5);

      if (v >= 0.99 && !completedRef.current) {
        completedRef.current = true;
        onComplete();
      }
    });
    return () => unsub();
  }, [scrollYProgress, onComplete]);

  useEffect(() => {
    document.body.style.cursor = hoveredPartId && stageIdx === 4 ? "pointer" : "auto";
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [hoveredPartId, stageIdx]);

  const currentStage = INTRO_STAGES[stageIdx];
  const showPaintPicker = stageIdx <= 1;
  const show3DGridLabels = stageIdx === 4;
  const showFullCardGrid = stageIdx === 5;

  return (
    <section
      ref={containerRef}
      aria-label="3D Vehicle Engineering Intro"
      className="relative h-[360vh] bg-[#0B0B0D] print:hidden"
    >
      <div
        className="sticky top-0 h-[100dvh] w-full touch-pan-y overflow-hidden bg-[radial-gradient(circle_at_center,#191E2B_0%,#08090C_78%)] select-none"
        onPointerDown={(e) => {
          orbitRef.current.dragging = true;
          orbitRef.current.lastX = e.clientX;
        }}
        onPointerMove={(e) => {
          const nx = (e.clientX / window.innerWidth) * 2 - 1;
          const ny = -((e.clientY / window.innerHeight) * 2 - 1);
          pointerRef.current.x = nx;
          pointerRef.current.y = ny;

          if (orbitRef.current.dragging) {
            const dx = e.clientX - orbitRef.current.lastX;
            orbitRef.current.lastX = e.clientX;
            orbitRef.current.yaw += dx * 0.0075;
          }
        }}
        onPointerUp={() => {
          orbitRef.current.dragging = false;
        }}
        onPointerLeave={() => {
          orbitRef.current.dragging = false;
        }}
      >
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            showFullCardGrid ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
        >
          <Canvas
            camera={{ position: [4.4, 1.75, 4.6], fov: 40 }}
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: true }}
          >
            <Environment resolution={256}>
              <Lightformer
                form="rect"
                intensity={2.8}
                position={[0, 5, 2]}
                rotation={[Math.PI / 2, 0, 0]}
                scale={[10, 4, 1]}
                color="#ffffff"
              />
              <Lightformer
                form="rect"
                intensity={1.8}
                position={[-6, 2, 4]}
                rotation={[0, Math.PI / 2, 0]}
                scale={[6, 4, 1]}
                color="#bae6fd"
              />
              <Lightformer
                form="rect"
                intensity={1.5}
                position={[6, 2, -2]}
                rotation={[0, -Math.PI / 2, 0]}
                scale={[6, 4, 1]}
                color="#fecaca"
              />
            </Environment>

            <ambientLight intensity={0.7} />
            <directionalLight position={[6, 8, 6]} intensity={2.2} color="#ffffff" />
            <directionalLight position={[-6, 4, -5]} intensity={1.1} color="#38bdf8" />
            <spotLight position={[0, 8, 0]} intensity={1.3} angle={0.5} penumbra={1} />

            <ScrollCameraRig progressRef={progressRef} orbitRef={orbitRef} pointerRef={pointerRef} />

            <ModelErrorBoundary fallback={<FallbackChassis progressRef={progressRef} />}>
              <Suspense fallback={<FallbackChassis progressRef={progressRef} isLoading={true} />}>
                <CarGLBModel progressRef={progressRef} paintHex={activePaintHex} />
              </Suspense>
            </ModelErrorBoundary>

            <InternalHardwareRig
              progressRef={progressRef}
              showGridCaptions={show3DGridLabels}
              hoveredPartId={hoveredPartId}
              setHoveredPartId={setHoveredPartId}
              onSelectPart={onSelectPart}
            />

            <StudioGridFloor progressRef={progressRef} />
          </Canvas>
        </div>

        {/* Live Showroom Paint Swatches */}
        <AnimatePresence>
          {showPaintPicker && (
            <motion.div
              key="paint-swatches"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: LUXURY_EASE }}
              className="absolute left-1/2 top-16 z-30 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/15 bg-black/65 px-4 py-2 backdrop-blur-md sm:top-7"
            >
              <span className="font-mono-tech hidden items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-zinc-400 sm:flex">
                <MoveHorizontal className="h-3 w-3 text-sky-400" /> Drag 360° • Finish:
              </span>
              <div className="flex items-center gap-2">
                {PAINT_FINISHES.map((finish) => {
                  const active = paintId === finish.id;
                  return (
                    <button
                      key={finish.id}
                      type="button"
                      title={finish.label}
                      aria-label={`Select ${finish.label} finish`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setPaintId(finish.id);
                      }}
                      style={{ backgroundColor: finish.swatch }}
                      className={`h-4 w-4 rounded-full border transition-all sm:h-5 sm:w-5 ${
                        active
                          ? "scale-125 border-white ring-2 ring-[#D9383A] ring-offset-2 ring-offset-black"
                          : "border-white/30 opacity-75 hover:scale-110 hover:opacity-100"
                      }`}
                    />
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stage 05 Top Telemetry Hover Pill */}
        <AnimatePresence>
          {show3DGridLabels && (
            <motion.div
              key="stage-05-hover-pill"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="pointer-events-none absolute left-1/2 top-15 z-30 w-[92%] max-w-xl -translate-x-1/2 text-center sm:top-7"
            >
              <div className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-black/75 px-4 py-1.5 text-[11px] text-zinc-200 backdrop-blur-md">
                {hoveredPart ? (
                  <>
                    <span className="font-mono-tech font-semibold text-[#ff7375]">{hoveredPart.sku}</span>
                    <span className="font-medium text-white">{hoveredPart.name}</span>
                    <span className="hidden text-zinc-400 sm:inline">•</span>
                    <span className="font-mono-tech hidden text-sky-300 sm:inline">
                      From AED {hoveredPart.variants.standard.priceAED.toLocaleString()}
                    </span>
                    <span className="text-emerald-400">Tap to Configure ↗</span>
                  </>
                ) : (
                  <span className="font-mono-tech text-[10px] uppercase tracking-[0.16em] text-zinc-300">
                    Tap Any 3D Assembly to Inspect Specs
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stage 06: Zero-Scroll-Trap 8-Part Card Grid */}
        <AnimatePresence>
          {showFullCardGrid && (
            <motion.div
              key="intro-parts-matrix"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: LUXURY_EASE }}
              className="absolute inset-x-0 bottom-14 top-14 z-20 mx-auto flex max-w-6xl flex-col justify-center px-3.5 sm:bottom-16 sm:top-16 sm:px-8"
            >
              <div className="mb-2 text-center sm:mb-5">
                <span className="font-mono-tech inline-block rounded-full border border-sky-400/35 bg-sky-500/10 px-3 py-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-sky-300 sm:text-[10px]">
                  AL AHRAM CORE INVENTORY
                </span>
                <h3 className="mt-1 text-lg font-light text-white sm:text-3xl">
                  Select a Precision Spare Part
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3.5">
                {showcaseParts.map((part, idx) => (
                  <motion.button
                    key={part.id}
                    type="button"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: idx * 0.035, ease: LUXURY_EASE }}
                    onClick={() => onSelectPart(part.id)}
                    className="group flex flex-col justify-between rounded-xl border border-white/15 bg-[#12151E]/90 p-2.5 text-left transition-all hover:-translate-y-0.5 hover:border-[#D9383A] hover:bg-[#181C28] sm:rounded-2xl sm:p-4"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono-tech text-[8px] font-semibold uppercase tracking-[0.14em] text-zinc-400 sm:text-[9px]">
                        {part.sku}
                      </span>
                      <ArrowUpRight className="h-3 w-3 text-zinc-500 transition-colors group-hover:text-[#D9383A] sm:h-3.5 sm:w-3.5" />
                    </div>

                    <div className="my-1 h-9 sm:my-2 sm:h-16">
                      <PartBlueprintSVG
                        type={part.visualType}
                        isPerformance={true}
                        darkSurface={true}
                        className="h-full"
                      />
                    </div>

                    <div>
                      <div className="truncate text-[11px] font-medium text-white sm:text-sm">
                        {part.name}
                      </div>
                      <div className="font-mono-tech mt-0.5 text-[9px] text-zinc-400 sm:text-[10px]">
                        AED {part.variants.standard.priceAED.toLocaleString()}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top-Left Brand HUD (Never collides with Skip Intro on mobile) */}
        <div className="pointer-events-none absolute left-4 top-4 z-20 max-w-[55%] sm:left-10 sm:top-6 sm:max-w-none">
          <div className="font-mono-tech truncate text-[9px] font-semibold uppercase tracking-[0.22em] text-[#D9383A] sm:text-[10px]">
            <span className="sm:hidden">AL AHRAM LLC</span>
            <span className="hidden sm:inline">AL AHRAM AUTO SPARE PARTS LLC</span>
          </div>
          <div className="mt-0.5 text-[9px] uppercase tracking-[0.16em] text-zinc-400 sm:text-[11px]">
            3D Architecture Sequence
          </div>
        </div>

        {/* Top-Right Skip Intro / Enter Website Pill */}
        <button
          type="button"
          onClick={onComplete}
          className="absolute right-4 top-4 z-30 inline-flex min-h-[34px] items-center gap-1.5 rounded-full border border-white/25 bg-black/65 px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-100 backdrop-blur-md transition-all hover:border-white hover:bg-white hover:text-black sm:right-10 sm:top-6 sm:min-h-[36px] sm:px-4 sm:text-[11px]"
        >
          {showFullCardGrid ? "Enter Site" : "Skip Intro"} <ArrowDown className="h-3.5 w-3.5" />
        </button>

        {/* Bottom-Left Stage Callout (Zero overlap with right progress bar) */}
        <div className="pointer-events-none absolute bottom-4 left-4 z-20 max-w-[58%] sm:bottom-8 sm:left-10 sm:max-w-md">
          <div className="font-mono-tech inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/60 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-sky-300 backdrop-blur-md sm:px-3 sm:py-1 sm:text-[10px]">
            STAGE {currentStage.num} / 06
          </div>
          {!showFullCardGrid && (
            <>
              <h2 className="mt-1.5 text-lg font-light tracking-tight text-white sm:mt-2 sm:text-3xl">
                {currentStage.title}
              </h2>
              <p className="mt-0.5 hidden text-xs leading-relaxed text-zinc-300 sm:block sm:text-sm">
                {currentStage.subtitle}
              </p>
            </>
          )}
        </div>

        {/* Bottom-Right Progress Bar */}
        <div className="pointer-events-none absolute bottom-4 right-4 z-20 flex flex-col items-end gap-1.5 sm:bottom-8 sm:right-10">
          <span className="font-mono-tech text-[9px] uppercase tracking-[0.18em] text-zinc-400 sm:text-[10px]">
            {scrollPct < 90 ? "SCROLL" : "ENTER"} • {scrollPct}%
          </span>
          <div className="h-[2px] w-24 overflow-hidden rounded-full bg-white/15 sm:w-40">
            <div
              className="h-full bg-[#D9383A] transition-all duration-75"
              style={{ width: `${scrollPct}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
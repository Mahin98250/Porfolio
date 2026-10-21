"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { type Group } from "three";

type ProjectWorld = {
  id: string;
  name: string;
  eyebrow: string;
  description: string;
  destination: string;
  theme: "learning" | "milk" | "optical";
};

const worlds: ProjectWorld[] = [
  {
    id: "learning",
    name: "LEARNER’S GUIDE",
    eyebrow: "WORLD 02 · THE KNOWLEDGE REALM",
    description: "A living landscape of ideas, learning paths and tools built for students.",
    destination: "https://github.com/Mahin98250/Final-Learner-s-Guide",
    theme: "learning",
  },
  {
    id: "milk",
    name: "DUDHWALA",
    eyebrow: "WORLD 03 · FRESH EVERYDAY",
    description: "A calm, fresh world inspired by dairy farms, local sellers and everyday delivery.",
    destination: "https://github.com/Mahin98250/Dudh-Wallah",
    theme: "milk",
  },
  {
    id: "optical",
    name: "OPTICODE STUDIO",
    eyebrow: "WORLD 01 · INFORMATION IN LIGHT",
    description: "An optical frontier where data travels through light, frames and clever reconstruction.",
    destination: "https://github.com/Mahin98250/OptiCode-Studio",
    theme: "optical",
  },
];

function WorldGeometry({ theme }: { theme: ProjectWorld["theme"] }) {
  const group = useRef<Group>(null);
  const palette = theme === "learning"
    ? { ground: "#0b2b43", hill: "#164b68", glow: "#58c7ff", accent: "#9ddfff" }
    : theme === "milk"
      ? { ground: "#142c20", hill: "#2f5939", glow: "#dff7d1", accent: "#b6dba1" }
      : { ground: "#26180f", hill: "#60432c", glow: "#ffd08a", accent: "#ffbd5a" };

  useFrame((state, delta) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.rotation.y += delta * 0.025;
    group.current.position.y = Math.sin(t * 0.42) * 0.075;
    group.current.rotation.x = Math.sin(t * 0.22) * 0.018;
  });

  return (
    <group ref={group}>
      <ambientLight intensity={0.7} color="#d8e8ff" />
      <directionalLight position={[4, 7, 5]} intensity={2.1} color={palette.accent} />
      <pointLight position={[0, 3, 1]} intensity={14} distance={16} color={palette.glow} />
      <mesh position={[0, -3.6, -2]} scale={[13, 1.6, 9]}>
        <sphereGeometry args={[1, 28, 18]} />
        <meshStandardMaterial color={palette.ground} roughness={1} />
      </mesh>
      <mesh position={[-7, -2.2, -6]} scale={[6, 3.7, 3]}>
        <sphereGeometry args={[1, 18, 12]} />
        <meshStandardMaterial color={palette.hill} roughness={1} flatShading />
      </mesh>
      <mesh position={[7, -2.35, -7]} scale={[7, 4.2, 3.6]}>
        <sphereGeometry args={[1, 18, 12]} />
        <meshStandardMaterial color={palette.hill} roughness={1} flatShading />
      </mesh>

      {theme === "learning" && (
        <>
          <mesh position={[2.5, 0.1, 0]} rotation={[0.12, -0.3, 0.16]}>
            <boxGeometry args={[1.65, 2.25, 0.28]} />
            <meshStandardMaterial color="#7fcfff" roughness={0.38} metalness={0.18} />
          </mesh>
          <mesh position={[3.45, 0.05, -0.2]} rotation={[0.08, 0.1, -0.12]}>
            <boxGeometry args={[1.65, 2.12, 0.25]} />
            <meshStandardMaterial color="#d5e9ff" roughness={0.5} />
          </mesh>
          <mesh position={[2.5, 0.1, 0.16]} rotation={[0.12, -0.3, 0.16]}>
            <boxGeometry args={[1.39, 1.9, 0.035]} />
            <meshBasicMaterial color="#154267" />
          </mesh>
          <mesh position={[-2.5, 0.4, -1]} rotation={[0.9, 0.3, 0.1]}>
            <torusGeometry args={[1.1, 0.035, 8, 80]} />
            <meshStandardMaterial color={palette.glow} emissive={palette.glow} emissiveIntensity={1.8} />
          </mesh>
          <mesh position={[-2.5, 0.4, -1]} rotation={[0.9, -0.35, 0.1]}>
            <torusGeometry args={[1.45, 0.018, 6, 80]} />
            <meshBasicMaterial color={palette.accent} />
          </mesh>
          <mesh position={[-2.5, 0.45, -1]}>
            <icosahedronGeometry args={[0.42, 1]} />
            <meshStandardMaterial color="#b4e4ff" emissive="#338bcf" emissiveIntensity={0.65} metalness={0.5} roughness={0.3} />
          </mesh>
        </>
      )}

      {theme === "milk" && (
        <>
          <mesh position={[2.9, -0.1, 0]} rotation={[0.05, 0.1, -0.04]}>
            <cylinderGeometry args={[0.68, 0.78, 2.15, 32, 1]} />
            <meshStandardMaterial color="#e6f1e2" roughness={0.22} metalness={0.12} />
          </mesh>
          <mesh position={[2.9, 1.08, 0]}>
            <cylinderGeometry args={[0.3, 0.36, 0.35, 24]} />
            <meshStandardMaterial color="#bad5ae" roughness={0.28} />
          </mesh>
          <mesh position={[2.9, 1.32, 0]}>
            <cylinderGeometry args={[0.31, 0.31, 0.14, 24]} />
            <meshStandardMaterial color="#f8fff2" roughness={0.28} />
          </mesh>
          {[-1.7, -3.2, -4.6].map((x, i) => (
            <group key={x} position={[x, -0.25, -1.8 - i * 0.4]}>
              <mesh position={[0, 0.75, 0]}>
                <cylinderGeometry args={[0.07, 0.11, 1.4, 8]} />
                <meshStandardMaterial color="#654d34" />
              </mesh>
              <mesh position={[0, 1.52, 0]}>
                <coneGeometry args={[0.62 + i * 0.08, 1.45, 9]} />
                <meshStandardMaterial color={i === 1 ? "#87b87c" : "#46754a"} roughness={1} flatShading />
              </mesh>
            </group>
          ))}
          <mesh position={[-2.2, 0.45, -1.4]} rotation={[0.2, 0.4, 0.2]}>
            <torusGeometry args={[0.72, 0.025, 8, 64]} />
            <meshStandardMaterial color="#d8f6c7" emissive="#97d18c" emissiveIntensity={0.6} />
          </mesh>
        </>
      )}

      {theme === "optical" && (
        <>
          <mesh position={[0.4, 0.35, -0.5]} rotation={[0.3, 0.5, 0.4]}>
            <torusGeometry args={[1.75, 0.055, 10, 96]} />
            <meshStandardMaterial color="#ffcd86" emissive="#ff9c3b" emissiveIntensity={1.35} metalness={0.55} roughness={0.22} />
          </mesh>
          <mesh position={[0.4, 0.35, -0.5]} rotation={[1.1, -0.25, 0.15]}>
            <torusGeometry args={[2.35, 0.022, 8, 96]} />
            <meshBasicMaterial color="#ffe3b8" />
          </mesh>
          <mesh position={[0.4, 0.35, -0.5]} rotation={[0.5, 0.9, 0.25]}>
            <torusGeometry args={[2.75, 0.018, 8, 96]} />
            <meshBasicMaterial color="#f3a34e" />
          </mesh>
          <mesh position={[0.4, 0.35, 0.2]} rotation={[0.2, 0.7, 0.25]}>
            <icosahedronGeometry args={[0.72, 1]} />
            <meshStandardMaterial color="#fff0cf" emissive="#ff8c32" emissiveIntensity={1.1} metalness={0.65} roughness={0.25} />
          </mesh>
          {[-2.6, 2.5].map((x) => (
            <mesh key={x} position={[x, -0.15, -1.2]} rotation={[0.1, 0.3, 0.1]}>
              <boxGeometry args={[0.8, 1.5, 0.08]} />
              <meshStandardMaterial color="#7d512a" emissive="#b46c2d" emissiveIntensity={0.25} />
            </mesh>
          ))}
        </>
      )}

      {Array.from({ length: 18 }, (_, i) => {
        const angle = i * 2.399;
        const radius = 3.2 + (i % 4) * 0.45;
        return (
          <mesh key={i} position={[Math.cos(angle) * radius, -0.1 + Math.sin(i * 1.7) * 1.3, -1.6 - (i % 5) * 0.62]} scale={0.035 + (i % 3) * 0.02}>
            <sphereGeometry args={[1, 8, 6]} />
            <meshBasicMaterial color={palette.glow} />
          </mesh>
        );
      })}
    </group>
  );
}

export function ProjectWorlds() {
  const [active, setActive] = useState<ProjectWorld | null>(null);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const onEnterWorld = (event: Event) => {
      const detail = (event as CustomEvent<{ id?: string }>).detail;
      const selected = worlds.find((world) => world.id === detail?.id);
      if (!selected) return;
      setLeaving(false);
      setActive(selected);
    };
    window.addEventListener("portfolio:enter-world", onEnterWorld);
    return () => window.removeEventListener("portfolio:enter-world", onEnterWorld);
  }, []);

  useEffect(() => {
    if (!active) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLeaving(false);
        setActive(null);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [active]);

  return (
    <>
      {active && (
        <div className={`pw-transition pw-theme-${active.theme} ${leaving ? "pw-leaving" : "pw-entering"}`} role="dialog" aria-modal="true" aria-label={active.name}>
          <div className="pw-sky" aria-hidden="true" />
          <div className="pw-landscape" aria-hidden="true">
            <Canvas className="pw-three-scene" dpr={[0.7, 1.25]} camera={{ position: [0, 1.1, 11], fov: 48, near: 0.1, far: 60 }} gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}><WorldGeometry theme={active.theme} /></Canvas>
            <span className="pw-ridge pw-ridge-back" />
            <span className="pw-ridge pw-ridge-mid" />
            <span className="pw-ridge pw-ridge-front" />
            <span className="pw-world-glow" />
            <span className="pw-world-particles" />
            <div className={`pw-landmarks pw-landmarks-${active.theme}`} aria-hidden="true"><span className="pw-landmark pw-landmark-a" /><span className="pw-landmark pw-landmark-b" /><span className="pw-landmark pw-landmark-c" /><span className="pw-landmark pw-landmark-d" /><span className="pw-ground-grid" /></div>
          </div>
          <button className="pw-close" type="button" onClick={() => { setLeaving(true); window.setTimeout(() => { setActive(null); setLeaving(false); }, 520); }}>← RETURN TO THE CAVE</button>
          <div className="pw-world-copy">
            <span className="pw-world-eyebrow"><i /> {active.eyebrow}</span>
            <h2>{active.name}</h2>
            <p>{active.description}</p>
            <a href={active.destination} target="_blank" rel="noreferrer">EXPLORE THE PROJECT <span>↗</span></a>
          </div>
          <span className="pw-world-coordinate">MP / IMMERSIVE PROJECT UNIVERSE</span>
        </div>
      )}

      <style jsx>{`
        .pw-launcher{position:fixed;z-index:30;left:50%;bottom:22px;transform:translateX(-50%);width:min(680px,calc(100% - 28px));padding:12px 14px 13px;border:1px solid rgba(226,215,199,.18);border-radius:18px;background:rgba(12,11,12,.76);backdrop-filter:blur(22px);color:#f1e9df;box-shadow:0 12px 48px #0006}
        .pw-launcher-label{display:block;margin:0 0 9px 4px;font:10px/1.3 ui-monospace,SFMono-Regular,monospace;letter-spacing:.2em;color:#b9a993}
        .pw-launcher-actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}
        .pw-launcher-actions button{display:flex;align-items:center;gap:7px;min-width:0;padding:10px 8px;border:1px solid #ffffff15;border-radius:12px;background:#ffffff07;color:#f6f0e9;text-align:left;font:600 10px/1.3 ui-monospace,SFMono-Regular,monospace;letter-spacing:.035em;cursor:pointer;transition:background .25s,border-color .25s,transform .25s}
        .pw-launcher-actions button:hover{background:#ffffff13;border-color:#d7c5a877;transform:translateY(-2px)}
        .pw-launcher-actions button b{margin-left:auto;color:#d5bb91;font-size:15px}
        .pw-orb{flex:0 0 9px;width:9px;height:9px;border-radius:50%;box-shadow:0 0 16px currentColor}
        .pw-orb-learning{color:#75caff;background:#75caff}.pw-orb-milk{color:#d8f2d0;background:#d8f2d0}.pw-orb-optical{color:#f2c67c;background:#f2c67c}
        .pw-transition{position:fixed;z-index:100;inset:0;overflow:hidden;color:#f6f0e8;background:#080a10;isolation:isolate;animation:pw-arrive .85s cubic-bezier(.2,.75,.2,1) both}
        .pw-transition.pw-leaving{animation:pw-depart .52s cubic-bezier(.7,0,.8,.2) both}
        .pw-sky,.pw-landscape,.pw-ridge,.pw-world-glow,.pw-world-particles{position:absolute;inset:0;pointer-events:none}
        .pw-sky{background:radial-gradient(ellipse at 72% 32%,var(--world-light),transparent 30%),linear-gradient(160deg,var(--world-sky),#08090d 78%)}
        .pw-landscape{perspective:900px;overflow:hidden}
        .pw-three-scene{position:absolute!important;inset:0;z-index:2;width:100%!important;height:100%!important;opacity:.96;pointer-events:none}
        .pw-three-scene canvas{display:block}
        .pw-ridge{inset:27% -20% -35%;border-radius:48% 52% 0 0;transform:rotate(-8deg) skewY(-5deg);filter:drop-shadow(0 -20px 40px #0005)}
        .pw-ridge-back{background:linear-gradient(150deg,var(--ridge-back),#11131a 72%);transform:translate3d(4%,3%, -100px) rotate(-9deg) scale(1.1);opacity:.8}
        .pw-ridge-mid{inset:43% -18% -35%;background:linear-gradient(145deg,var(--ridge-mid),#101116 66%);transform:rotate(7deg) skewY(8deg);box-shadow:inset 0 2px 0 #ffffff14}
        .pw-ridge-front{inset:62% -10% -45%;background:linear-gradient(155deg,var(--ridge-front),#08090c 68%);transform:rotate(-4deg);box-shadow:inset 0 2px 0 #ffffff19}
        .pw-world-glow{inset:18% 12% auto auto;width:34vw;height:34vw;max-width:280px;max-height:280px;border-radius:50%;background:radial-gradient(circle,#fff5 0, var(--world-light) 8%,transparent 68%);filter:blur(8px);animation:pw-pulse 5s ease-in-out infinite}
        .pw-world-particles{opacity:.38;background-image:radial-gradient(circle at 20% 24%,#fff 0 1px,transparent 1.8px),radial-gradient(circle at 78% 18%,#fff 0 1px,transparent 1.8px),radial-gradient(circle at 68% 58%,#fff 0 1px,transparent 1.8px),radial-gradient(circle at 32% 70%,#fff 0 1px,transparent 1.8px),radial-gradient(circle at 88% 80%,#fff 0 1px,transparent 1.8px);animation:pw-drift 12s ease-in-out infinite alternate}
        .pw-landmarks{position:absolute;inset:0;z-index:1;perspective:1000px;transform-style:preserve-3d;overflow:hidden}
        .pw-landmark{position:absolute;display:block;transform-style:preserve-3d;filter:drop-shadow(0 22px 28px #0006);animation:pw-float 8s ease-in-out infinite}
        .pw-landmark-a{right:15%;top:30%;width:clamp(70px,12vw,150px);height:clamp(70px,12vw,150px);border:1px solid #ffffff65;border-radius:24px;background:linear-gradient(135deg,#ffffff30,#ffffff04 45%,var(--world-light) 150%);box-shadow:inset 0 1px 0 #fff8, inset -18px -20px 40px #0003,0 0 55px var(--world-light);transform:rotateX(54deg) rotateZ(35deg)}
        .pw-landmark-b{right:32%;top:45%;width:clamp(40px,7vw,90px);height:clamp(55px,9vw,112px);border:1px solid #ffffff45;border-radius:12px;background:linear-gradient(145deg,#ffffff26,#ffffff04);transform:rotateY(-25deg) rotateX(12deg) rotateZ(-13deg);animation-delay:-2s}
        .pw-landmark-c{right:8%;top:55%;width:clamp(32px,5vw,68px);height:clamp(32px,5vw,68px);border:1px solid var(--world-light);border-radius:50%;box-shadow:0 0 22px var(--world-light),inset 0 0 18px var(--world-light);opacity:.7;animation-delay:-4s}
        .pw-landmark-d{right:25%;top:21%;width:clamp(10px,1.6vw,20px);height:clamp(10px,1.6vw,20px);border-radius:50%;background:#fff;box-shadow:0 0 22px 7px var(--world-light);animation-delay:-1s}
        .pw-ground-grid{position:absolute;left:15%;right:-10%;bottom:-12%;height:44%;opacity:.23;background-image:linear-gradient(#ffffff20 1px,transparent 1px),linear-gradient(90deg,#ffffff20 1px,transparent 1px);background-size:38px 38px;transform:perspective(280px) rotateX(64deg);mask-image:linear-gradient(transparent,#000 24%,transparent 94%)}
        .pw-landmarks-learning .pw-landmark-a{border-radius:8px 8px 18px 8px;transform:rotateY(-25deg) rotateX(10deg) rotateZ(-8deg);background:linear-gradient(90deg,#69bfff38 0 48%,#ffffff16 49% 52%,#69bfff22 53%);box-shadow:inset 0 0 0 5px #8ed0ff20,0 0 45px #69bfff35}
        .pw-landmarks-learning .pw-landmark-b{width:clamp(70px,10vw,130px);height:clamp(44px,7vw,85px);border-radius:50%;border-color:#8ed7ff;background:#5cbfff10;transform:rotateX(65deg) rotateZ(-22deg);box-shadow:0 0 28px #69bfff45}
        .pw-landmarks-milk .pw-landmark-a{border-radius:50% 50% 48% 48%;width:clamp(48px,8vw,100px);height:clamp(72px,12vw,145px);transform:rotateX(5deg) rotateZ(12deg);background:linear-gradient(100deg,#ffffff75,#d9f5d72c 55%,#ffffff12);clip-path:polygon(20% 0,80% 0,88% 14%,88% 88%,76% 100%,24% 100%,12% 88%,12% 14%);box-shadow:0 0 40px #e0f5d040}
        .pw-landmarks-milk .pw-landmark-b{border-radius:50% 50% 50% 5%;width:clamp(32px,5vw,60px);height:clamp(32px,5vw,60px);transform:rotate(45deg);background:linear-gradient(140deg,#fff9,#dff6d922);border-color:#efffe8}
        .pw-landmarks-optical .pw-landmark-a{border-radius:50%;background:transparent;border:2px solid #ffd18b;box-shadow:0 0 30px #ffd18b66,inset 0 0 30px #ffd18b22;transform:rotateX(65deg) rotateZ(-20deg) scaleX(1.5)}
        .pw-landmarks-optical .pw-landmark-b{border-radius:50%;border:1px solid #ffd18b;background:transparent;transform:rotateX(65deg) rotateZ(30deg) scaleX(1.6);box-shadow:0 0 22px #ffd18b44}
        .pw-landmarks-optical .pw-landmark-c{border-radius:3px;width:clamp(55px,9vw,110px);height:clamp(34px,5vw,60px);border-color:#ffd18b;background:repeating-linear-gradient(90deg,#ffd18b66 0 2px,transparent 2px 8px);transform:rotateY(-30deg) rotateZ(15deg)}
        .pw-world-copy{position:absolute;z-index:3;left:clamp(24px,8vw,120px);right:24px;top:46%;transform:translateY(-50%);max-width:790px;animation:pw-copy-in 1s .15s both}
        .pw-world-eyebrow{display:flex;align-items:center;gap:10px;color:#d9c7ad;font:11px/1.4 ui-monospace,SFMono-Regular,monospace;letter-spacing:.18em}
        .pw-world-eyebrow i{width:7px;height:7px;border-radius:50%;background:var(--world-light);box-shadow:0 0 18px var(--world-light)}
        .pw-world-copy h2{max-width:900px;margin:25px 0 16px;font-size:clamp(42px,10vw,112px);line-height:.88;letter-spacing:-.075em;font-weight:650;text-wrap:balance}
        .pw-world-copy p{max-width:520px;color:#e0d9d0c9;font-size:clamp(15px,2vw,20px);line-height:1.7}
        .pw-world-copy a{display:inline-flex;align-items:center;gap:24px;margin-top:22px;padding:15px 18px;border:1px solid #ffffff4a;border-radius:999px;color:#fff;text-decoration:none;font:11px ui-monospace,SFMono-Regular,monospace;letter-spacing:.13em;background:#ffffff0c;backdrop-filter:blur(12px);transition:background .2s,transform .2s}
        .pw-world-copy a:hover{background:#ffffff20;transform:translateY(-2px)}
        .pw-close{position:absolute;z-index:4;top:24px;left:24px;padding:12px 15px;border:1px solid #ffffff30;border-radius:999px;background:#090a0b66;color:#f7eee4;font:10px ui-monospace,SFMono-Regular,monospace;letter-spacing:.1em;cursor:pointer;backdrop-filter:blur(14px)}
        .pw-world-coordinate{position:absolute;z-index:3;bottom:26px;right:26px;color:#ffffff75;font:9px ui-monospace,SFMono-Regular,monospace;letter-spacing:.16em}
        .pw-theme-learning{--world-sky:#081c35;--world-light:#69bfff;--ridge-back:#163c5b;--ridge-mid:#0b2944;--ridge-front:#071b2c}
        .pw-theme-milk{--world-sky:#17251d;--world-light:#e0f5d0;--ridge-back:#4a6c4a;--ridge-mid:#203d2d;--ridge-front:#10251d}
        .pw-theme-optical{--world-sky:#251b12;--world-light:#ffd18b;--ridge-back:#775332;--ridge-mid:#3c2c22;--ridge-front:#1d1714}
        @keyframes pw-arrive{from{opacity:0;clip-path:circle(0% at 50% 50%);transform:scale(1.04);filter:blur(14px)}to{opacity:1;clip-path:circle(150% at 50% 50%);transform:scale(1);filter:blur(0)}}
        @keyframes pw-depart{to{opacity:0;clip-path:circle(0% at 50% 50%);transform:scale(.97);filter:blur(12px)}}
        @keyframes pw-copy-in{from{opacity:0;transform:translateY(calc(-50% + 26px));filter:blur(8px)}to{opacity:1;transform:translateY(-50%);filter:blur(0)}}
        @keyframes pw-float{0%,100%{translate:0 0}50%{translate:0 -14px}}
        @keyframes pw-pulse{0%,100%{transform:scale(.94);opacity:.65}50%{transform:scale(1.08);opacity:1}}
        @keyframes pw-drift{from{transform:translate3d(-1%,0,0)}to{transform:translate3d(1%,-2%,0)}}
        @media(max-width:520px){.pw-landmark{opacity:.72}.pw-landmark-a{right:8%;top:24%}.pw-landmark-b{right:20%;top:43%}.pw-launcher{bottom:12px;padding:9px}.pw-launcher-actions{gap:5px}.pw-launcher-actions button{padding:10px 5px;font-size:8px;gap:5px;letter-spacing:0}.pw-launcher-label{font-size:9px}.pw-world-copy{top:48%}.pw-close{top:16px;left:14px}.pw-world-coordinate{left:18px;right:auto;bottom:16px;font-size:8px}}
        @media(prefers-reduced-motion:reduce){.pw-transition,.pw-transition *{animation-duration:.01ms!important;transition-duration:.01ms!important}}
      `}</style>
    </>
  );
}

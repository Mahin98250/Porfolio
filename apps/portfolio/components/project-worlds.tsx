"use client";

import { useEffect, useState } from "react";

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

export function ProjectWorlds() {
  const [active, setActive] = useState<ProjectWorld | null>(null);
  const [leaving, setLeaving] = useState(false);

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

  const enterWorld = (world: ProjectWorld) => {
    setLeaving(false);
    setActive(world);
  };

  return (
    <>
      <aside className="pw-launcher" aria-label="Project worlds">
        <span className="pw-launcher-label">CHOOSE YOUR NEXT WORLD</span>
        <div className="pw-launcher-actions">
          {worlds.map((world) => (
            <button key={world.id} type="button" onClick={() => enterWorld(world)}>
              <span className={`pw-orb pw-orb-${world.theme}`} aria-hidden="true" />
              <span>{world.name}</span>
              <b aria-hidden="true">↗</b>
            </button>
          ))}
        </div>
      </aside>

      {active && (
        <div className={`pw-transition pw-theme-${active.theme} ${leaving ? "pw-leaving" : "pw-entering"}`} role="dialog" aria-modal="true" aria-label={active.name}>
          <div className="pw-sky" aria-hidden="true" />
          <div className="pw-landscape" aria-hidden="true">
            <span className="pw-ridge pw-ridge-back" />
            <span className="pw-ridge pw-ridge-mid" />
            <span className="pw-ridge pw-ridge-front" />
            <span className="pw-world-glow" />
            <span className="pw-world-particles" />
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
        .pw-ridge{inset:27% -20% -35%;border-radius:48% 52% 0 0;transform:rotate(-8deg) skewY(-5deg);filter:drop-shadow(0 -20px 40px #0005)}
        .pw-ridge-back{background:linear-gradient(150deg,var(--ridge-back),#11131a 72%);transform:translate3d(4%,3%, -100px) rotate(-9deg) scale(1.1);opacity:.8}
        .pw-ridge-mid{inset:43% -18% -35%;background:linear-gradient(145deg,var(--ridge-mid),#101116 66%);transform:rotate(7deg) skewY(8deg);box-shadow:inset 0 2px 0 #ffffff14}
        .pw-ridge-front{inset:62% -10% -45%;background:linear-gradient(155deg,var(--ridge-front),#08090c 68%);transform:rotate(-4deg);box-shadow:inset 0 2px 0 #ffffff19}
        .pw-world-glow{inset:18% 12% auto auto;width:34vw;height:34vw;max-width:280px;max-height:280px;border-radius:50%;background:radial-gradient(circle,#fff5 0, var(--world-light) 8%,transparent 68%);filter:blur(8px);animation:pw-pulse 5s ease-in-out infinite}
        .pw-world-particles{opacity:.38;background-image:radial-gradient(circle at 20% 24%,#fff 0 1px,transparent 1.8px),radial-gradient(circle at 78% 18%,#fff 0 1px,transparent 1.8px),radial-gradient(circle at 68% 58%,#fff 0 1px,transparent 1.8px),radial-gradient(circle at 32% 70%,#fff 0 1px,transparent 1.8px),radial-gradient(circle at 88% 80%,#fff 0 1px,transparent 1.8px);animation:pw-drift 12s ease-in-out infinite alternate}
        .pw-world-copy{position:absolute;left:clamp(24px,8vw,120px);right:24px;top:46%;transform:translateY(-50%);max-width:790px;animation:pw-copy-in 1s .15s both}
        .pw-world-eyebrow{display:flex;align-items:center;gap:10px;color:#d9c7ad;font:11px/1.4 ui-monospace,SFMono-Regular,monospace;letter-spacing:.18em}
        .pw-world-eyebrow i{width:7px;height:7px;border-radius:50%;background:var(--world-light);box-shadow:0 0 18px var(--world-light)}
        .pw-world-copy h2{max-width:900px;margin:25px 0 16px;font-size:clamp(42px,10vw,112px);line-height:.88;letter-spacing:-.075em;font-weight:650;text-wrap:balance}
        .pw-world-copy p{max-width:520px;color:#e0d9d0c9;font-size:clamp(15px,2vw,20px);line-height:1.7}
        .pw-world-copy a{display:inline-flex;align-items:center;gap:24px;margin-top:22px;padding:15px 18px;border:1px solid #ffffff4a;border-radius:999px;color:#fff;text-decoration:none;font:11px ui-monospace,SFMono-Regular,monospace;letter-spacing:.13em;background:#ffffff0c;backdrop-filter:blur(12px);transition:background .2s,transform .2s}
        .pw-world-copy a:hover{background:#ffffff20;transform:translateY(-2px)}
        .pw-close{position:absolute;z-index:2;top:24px;left:24px;padding:12px 15px;border:1px solid #ffffff30;border-radius:999px;background:#090a0b66;color:#f7eee4;font:10px ui-monospace,SFMono-Regular,monospace;letter-spacing:.1em;cursor:pointer;backdrop-filter:blur(14px)}
        .pw-world-coordinate{position:absolute;bottom:26px;right:26px;color:#ffffff75;font:9px ui-monospace,SFMono-Regular,monospace;letter-spacing:.16em}
        .pw-theme-learning{--world-sky:#081c35;--world-light:#69bfff;--ridge-back:#163c5b;--ridge-mid:#0b2944;--ridge-front:#071b2c}
        .pw-theme-milk{--world-sky:#17251d;--world-light:#e0f5d0;--ridge-back:#4a6c4a;--ridge-mid:#203d2d;--ridge-front:#10251d}
        .pw-theme-optical{--world-sky:#251b12;--world-light:#ffd18b;--ridge-back:#775332;--ridge-mid:#3c2c22;--ridge-front:#1d1714}
        @keyframes pw-arrive{from{opacity:0;clip-path:circle(0% at 50% 50%);transform:scale(1.04);filter:blur(14px)}to{opacity:1;clip-path:circle(150% at 50% 50%);transform:scale(1);filter:blur(0)}}
        @keyframes pw-depart{to{opacity:0;clip-path:circle(0% at 50% 50%);transform:scale(.97);filter:blur(12px)}}
        @keyframes pw-copy-in{from{opacity:0;transform:translateY(calc(-50% + 26px));filter:blur(8px)}to{opacity:1;transform:translateY(-50%);filter:blur(0)}}
        @keyframes pw-pulse{0%,100%{transform:scale(.94);opacity:.65}50%{transform:scale(1.08);opacity:1}}
        @keyframes pw-drift{from{transform:translate3d(-1%,0,0)}to{transform:translate3d(1%,-2%,0)}}
        @media(max-width:520px){.pw-launcher{bottom:12px;padding:9px}.pw-launcher-actions{gap:5px}.pw-launcher-actions button{padding:10px 5px;font-size:8px;gap:5px;letter-spacing:0}.pw-launcher-label{font-size:9px}.pw-world-copy{top:48%}.pw-close{top:16px;left:14px}.pw-world-coordinate{left:18px;right:auto;bottom:16px;font-size:8px}}
        @media(prefers-reduced-motion:reduce){.pw-transition,.pw-transition *{animation-duration:.01ms!important;transition-duration:.01ms!important}}
      `}</style>
    </>
  );
}

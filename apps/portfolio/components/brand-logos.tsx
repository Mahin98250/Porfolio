import {
  siGithub,
  siJavascript,
  siNextdotjs,
  siPython,
  siReact,
  siTypescript,
} from "simple-icons";

const brands = [
  { name: "JavaScript", icon: siJavascript },
  { name: "React", icon: siReact },
  { name: "TypeScript", icon: siTypescript },
  { name: "Python", icon: siPython },
  { name: "Next.js", icon: siNextdotjs },
  { name: "GitHub", icon: siGithub },
];

export function BrandLogos() {
  return (
    <div className="brand-logo-grid" aria-label="Technology and platform references">
      {brands.map(({ name, icon }) => (
        <div className="brand-logo-card glass" key={name} title={name}>
          <svg viewBox="0 0 24 24" role="img" aria-label={name} focusable="false">
            <path d={icon.path} fill="currentColor" />
          </svg>
          <span>{name}</span>
        </div>
      ))}
    </div>
  );
}

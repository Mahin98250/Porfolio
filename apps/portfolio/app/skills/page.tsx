import type { Metadata } from "next";
import { BrandLogos } from "../../components/brand-logos";

export const metadata: Metadata = { title: "Skills" };

const groups = [
  { n: "01", title: "Web foundations", status: "PRACTICING", items: ["HTML", "CSS", "JavaScript", "Responsive UI", "Browser APIs"], note: "Build accessible, responsive interfaces and learn how the browser behaves." },
  { n: "02", title: "Programming", status: "LEARNING", items: ["C", "C++", "Python fundamentals", "Problem solving", "Debugging"], note: "Strengthen logic, data handling and the habit of breaking problems into smaller steps." },
  { n: "03", title: "Tools & frameworks", status: "PROJECT EXPERIENCE", items: ["React", "Vite", "Git and GitHub", "Tailwind CSS", "TypeScript exploration"], note: "Use tools to ship projects while continuing to understand the fundamentals underneath." },
  { n: "04", title: "Future exploration", status: "LONG-TERM", items: ["AI systems", "Robotics", "Automation", "Computer vision", "Embedded systems"], note: "A direction to explore gradually, not a claim that these topics are already mastered." },
];

export default function SkillsPage() {
  return <>
    <header className="page-hero"><span className="eyebrow">03 / TOOLKIT IN PROGRESS</span><h1>Fundamentals first.<br /><span className="gradient-text">Ambition always.</span></h1><p>This is a learning snapshot, not a claim of mastery. Skills grow through repeated use, projects, feedback and testing.</p></header>
    <BrandLogos />
    <section className="skill-group-grid" aria-label="Skills and learning areas">
      {groups.map((group) => <article className="skill-group-card glass" key={group.n}>
        <div className="skill-group-top"><span>{group.status}</span><span className="skill-group-index">{group.n}</span></div>
        <h2>{group.title}</h2>
        <ul className="skill-chip-list">{group.items.map((item) => <li key={item}>{item}</li>)}</ul>
        <p className="skill-footnote">{group.note}</p>
      </article>)}
    </section>
  </>;
}

import type { Metadata } from "next";
import { BrandLogos } from "../../components/brand-logos";
export const metadata: Metadata = { title: "Skills" };
const groups = [
  { title:"Web foundations", status:"PRACTICING", items:["HTML","CSS","JavaScript","Responsive UI","Browser APIs"] },
  { title:"Programming", status:"LEARNING", items:["C","C++","Python fundamentals","Problem solving","Debugging"] },
  { title:"Tools & frameworks", status:"PROJECT EXPERIENCE", items:["React","Vite","Git and GitHub","Tailwind CSS","TypeScript exploration"] },
  { title:"Future exploration", status:"LONG-TERM", items:["AI systems","Robotics","Automation","Computer vision","Embedded systems"] },
];
export default function SkillsPage() {
  return <><header className="page-hero"><span className="eyebrow">03 / TOOLKIT IN PROGRESS</span><h1>Fundamentals first.<br /><span className="gradient-text">Ambition always.</span></h1><p>This is a learning snapshot, not a claim of mastery. Skills grow through repeated use, projects, feedback and testing.</p></header><BrandLogos /><section className="content-grid">{groups.map((group) => <article className="content-card glass" key={group.title}><span className="eyebrow">{group.status}</span><h2>{group.title}</h2><ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul></article>)}</section></>;
}

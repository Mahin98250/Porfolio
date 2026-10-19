import type { Metadata } from "next";
export const metadata: Metadata = { title: "Projects" };
const projects = [
  { n:"01", name:"OptiCode Studio", category:"OPTICAL TRANSFER", href:"https://github.com/Mahin98250/OptiCode-Studio", text:"An experimental optical file-transfer project exploring QR transport, frame reassembly and offline-first workflows." },
  { n:"02", name:"Learner’s Guide", category:"LEARNING PLATFORM", href:"https://github.com/Mahin98250/Final-Learner-s-Guide", text:"A student-focused learning platform concept for study resources and daily learning workflows." },
  { n:"03", name:"DudhWala", category:"LOCAL MARKETPLACE", href:"https://github.com/Mahin98250/Dudh-Wallah", text:"A local marketplace concept connecting customers with independent milk sellers." },
  { n:"04", name:"VelocityType", category:"TYPING PRACTICE", href:"https://github.com/Mahin98250/Velocitytype", text:"A typing practice experience focused on speed, accuracy and progress tracking." },
  { n:"05", name:"Weather Status", category:"WEB TOOL", href:"https://github.com/Mahin98250/Weather-Status", text:"A responsive weather interface experiment for presenting conditions clearly." },
  { n:"06", name:"QR Generator", category:"BROWSER UTILITY", href:"https://github.com/Mahin98250?tab=repositories", text:"QR generation and scanning experiments; browse repositories for the current source." },
];
export default function ProjectsPage() {
  return <><header className="page-hero"><span className="eyebrow">02 / SELECTED WORK</span><h1>Experiments.<br /><span className="gradient-text">Lessons in every build.</span></h1><p>Project summaries are intentionally conservative. Each repository is the source of truth for implementation details, current status and limitations.</p></header><section className="project-list">{projects.map((project) => <article className="project-row glass" key={project.n}><span className="project-index">{project.n}</span><div><span className="project-category">{project.category}</span><h2>{project.name}</h2><p>{project.text}</p></div><a className="button button-glass" href={project.href} target="_blank" rel="noreferrer">Inspect source ↗</a></article>)}</section></>;
}

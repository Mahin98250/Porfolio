import type { Metadata } from "next";
export const metadata: Metadata = { title: "Journey" };
const steps = [
  { n:"01", label:"RIGHT NOW", title:"Strengthen the foundations", body:"Build consistency in programming, mathematics, debugging and the habits that make software reliable." },
  { n:"02", label:"BUILD & SHIP", title:"Make useful projects", body:"Improve real workflows, accessibility, documentation and resilience through practical experiments." },
  { n:"03", label:"LONG-TERM DIRECTION", title:"Software, AI, robotics and automation", body:"Connect software with intelligent systems and the physical world, one skill and one project at a time." },
];
export default function JourneyPage() {
  return <><header className="page-hero"><span className="eyebrow">04 / THE LONG GAME</span><h1>The goal isn’t a title.<br /><span className="gradient-text">It’s capability.</span></h1><p>A realistic roadmap: master the basics, build things people can use, and earn the right to solve harder problems.</p></header><section className="project-list">{steps.map((step) => <article className="project-row glass" key={step.n}><span className="project-index">{step.n}</span><div><span className="project-category">{step.label}</span><h2>{step.title}</h2><p>{step.body}</p></div></article>)}</section></>;
}

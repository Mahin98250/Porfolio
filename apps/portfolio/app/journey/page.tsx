import type { Metadata } from "next";

export const metadata: Metadata = { title: "Journey" };

const steps = [
  { n: "01", label: "RIGHT NOW", title: "Strengthen the foundations", body: "Build consistency in programming, mathematics, debugging and the habits that make software reliable.", signal: "LEARN THE BASICS WELL" },
  { n: "02", label: "BUILD & SHIP", title: "Make useful projects", body: "Improve real workflows, accessibility, documentation and resilience through practical experiments.", signal: "TURN KNOWLEDGE INTO PRACTICE" },
  { n: "03", label: "DEEPEN THE SYSTEMS", title: "Understand how software behaves", body: "Study data structures, algorithms, operating systems, networking and the engineering choices behind dependable products.", signal: "GO BEYOND THE INTERFACE" },
  { n: "04", label: "LONG-TERM DIRECTION", title: "Software, AI, robotics and automation", body: "Connect software with intelligent systems and the physical world, one skill and one project at a time.", signal: "BUILD FOR THE REAL WORLD" },
];

export default function JourneyPage() {
  return <>
    <header className="page-hero"><span className="eyebrow">04 / THE LONG GAME</span><h1>The goal isn’t a title.<br /><span className="gradient-text">It’s capability.</span></h1><p>A realistic roadmap: master the basics, build things people can use, and earn the right to solve harder problems.</p></header>
    <section className="page-experience glass">
      <div className="experience-heading"><div><span className="eyebrow">THE DIRECTION OF TRAVEL</span><h2>Small steps.<br /><span className="gradient-text">Stronger systems thinking.</span></h2></div><span className="experience-code">ROADMAP / ITERATIVE</span></div>
      <div className="experience-metrics"><article className="experience-metric"><b>PHASE A</b><strong>Learn</strong><p>Build reliable fundamentals before chasing complexity.</p></article><article className="experience-metric"><b>PHASE B</b><strong>Apply</strong><p>Ship projects, test assumptions and improve what fails.</p></article><article className="experience-metric"><b>PHASE C</b><strong>Integrate</strong><p>Connect software, AI and physical systems over time.</p></article></div>
    </section>
    <section className="journey-track" aria-label="Learning roadmap">
      {steps.map((step) => <article className="journey-card glass" key={step.n}><span className="journey-number">{step.n}</span><div><span className="project-category">{step.label}</span><h2>{step.title}</h2><p>{step.body}</p><span className="eyebrow" style={{ marginTop: 18 }}>{step.signal}</span></div></article>)}
    </section>
  </>;
}

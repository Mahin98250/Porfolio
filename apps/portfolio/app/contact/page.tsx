import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return <>
    <header className="page-hero"><span className="eyebrow">05 / OPEN CHANNEL</span><h1>Let’s make<br /><span className="gradient-text">something useful.</span></h1><p>Have a project idea, feedback or a technology rabbit hole worth exploring? Reach out through a public profile.</p></header>
    <section className="content-grid">
      <article className="content-card contact-card glass"><span className="contact-mark" aria-hidden="true">⌘</span><span className="eyebrow">CODE & PROJECTS</span><h2>GitHub</h2><p>Browse source code, project experiments and public repositories.</p><a className="button button-primary" href="https://github.com/Mahin98250" target="_blank" rel="noreferrer">Open GitHub ↗</a></article>
      <article className="content-card contact-card glass"><span className="contact-mark" aria-hidden="true">↗</span><span className="eyebrow">SOCIAL</span><h2>Instagram</h2><p>Connect through my public social profile.</p><a className="button button-glass" href="https://www.instagram.com/mahin_patel2/" target="_blank" rel="noreferrer">Open Instagram ↗</a></article>
    </section>
    <section className="page-experience glass"><div className="experience-heading"><div><span className="eyebrow">A GOOD FIRST MESSAGE</span><h2>Show me the idea.<br /><span className="gradient-text">Tell me what is stuck.</span></h2></div><span className="experience-code">NO CONTACT FORM / NO FAKE PROMISES</span></div><div className="experience-metrics"><article className="experience-metric"><b>01 / CONTEXT</b><strong>What are you building?</strong><p>A short description helps start the conversation.</p></article><article className="experience-metric"><b>02 / THE CHALLENGE</b><strong>What needs work?</strong><p>Share the question, bug or feedback you have in mind.</p></article><article className="experience-metric"><b>03 / NEXT STEP</b><strong>Keep it practical</strong><p>We can focus on a clear next action rather than big claims.</p></article></div></section>
  </>;
}

import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

const principles = [
  { n: "01", title: "Curiosity over shortcuts", body: "Understand how something works, then improve it instead of stopping when it merely runs." },
  { n: "02", title: "Useful beats impressive", body: "A good project solves a real problem, explains its limits and treats the person using it with care." },
  { n: "03", title: "Iteration is the work", body: "Test, debug, listen to feedback and make the next version meaningfully better." },
];

export default function AboutPage() {
  return <>
    <header className="page-hero">
      <span className="eyebrow">01 / THE PERSON BEHIND THE CODE</span>
      <h1>Early in the journey.<br /><span className="gradient-text">Serious about the craft.</span></h1>
      <p>I’m Mahin Patel, a student programmer in Ahmedabad, India. I learn by making things, finding the rough edges and improving them with every iteration.</p>
    </header>
    <section className="page-experience glass">
      <div className="experience-heading"><div><span className="eyebrow">THE OPERATING PRINCIPLE</span><h2>Build to understand.<br /><span className="gradient-text">Improve to make it useful.</span></h2></div><span className="experience-code">PERSONAL NOTE / 001</span></div>
      <div className="experience-metrics">
        {principles.map((item) => <article className="experience-metric" key={item.n}><b>{item.n} / PRINCIPLE</b><strong>{item.title}</strong><p>{item.body}</p></article>)}
      </div>
    </section>
    <section className="content-grid">
      <article className="content-card glass"><span className="eyebrow">THE APPROACH</span><h2>Build to understand.</h2><p>Projects help me connect programming fundamentals with practical problems. I value clear interfaces, honest documentation, debugging and steady improvement over exaggerated claims.</p></article>
      <article className="content-card glass"><span className="eyebrow">THE DIRECTION</span><h2>Software meets the real world.</h2><p>My long-term interest is robotics and automation, supported by strong foundations in software, mathematics, AI and systems thinking.</p></article>
    </section>
  </>;
}

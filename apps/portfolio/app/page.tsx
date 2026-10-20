import Link from "next/link";
import { HeroSceneLoader } from "../components/hero-scene-loader";

const featured = [
  { number: "01", slug: "opticode-studio", title: "OptiCode Studio", category: "OPTICAL TRANSFER / EXPERIMENTAL SYSTEMS", href: "https://github.com/Mahin98250/OptiCode-Studio", text: "Moving information through light. Exploring QR-based optical file transfer, frame reconstruction and offline-first workflows.", mark: "O·", tone: "opticode" },
  { number: "02", slug: "learners-guide", title: "Learner’s Guide", category: "LEARNING PLATFORM / PRODUCT DESIGN", href: "https://github.com/Mahin98250/Final-Learner-s-Guide", text: "Making learning easier to navigate through a student-focused experience for study resources and everyday workflows.", mark: "L·", tone: "learners" },
  { number: "03", slug: "dudhwala", title: "DudhWala", category: "LOCAL MARKETPLACE / DIGITAL PRODUCT", href: "https://github.com/Mahin98250/Dudh-Wallah", text: "Connecting customers with independent local milk sellers through a marketplace concept and distinct user journeys.", mark: "D·", tone: "dudhwala" },
];

const disciplines = [
  { number: "01", name: "Build", title: "Software & web", text: "Interfaces, applications and useful tools. Start with the problem, then make the experience clear.", tags: "HTML / CSS / JAVASCRIPT / REACT" },
  { number: "02", name: "Explore", title: "AI & systems", text: "Learning how intelligent software can help people, connect information and make systems more capable.", tags: "PYTHON / DATA / AUTOMATION" },
  { number: "03", name: "Imagine", title: "Robotics & automation", text: "The long-term direction: bringing software into the physical world through sensors, control and machines.", tags: "ENGINEERING / CONTROL / ROBOTICS" },
];

export default function HomePage() {
  return (
    <>
      <aside className="chapter-rail" aria-label="Page chapters">
        <a href="#origin" aria-label="Origin chapter"><span>00</span><i>ORIGIN</i></a>
        <a href="#approach" aria-label="Approach chapter"><span>01</span><i>APPROACH</i></a>
        <a href="#disciplines" aria-label="Disciplines chapter"><span>02</span><i>FIELDS</i></a>
        <a href="#selected-work" aria-label="Selected work chapter"><span>03</span><i>WORK</i></a>
        <a href="#next" aria-label="Next chapter"><span>04</span><i>NEXT</i></a>
      </aside>

      <section className="cinema-hero" id="origin" aria-labelledby="hero-title">
        <div className="cinema-hero-noise" aria-hidden="true" />
        <div className="cinema-hero-top"><span>[ MAHIN PATEL / INDEPENDENT BUILDER ]</span><span>AHMEDABAD, IN · 2026</span></div>
        <div className="cinema-hero-copy">
          <span className="cinema-eyebrow"><i className="status-dot" /> STUDENT PROGRAMMER / FUTURE ENGINEER</span>
          <p className="cinema-overline">FROM A QUESTION TO A WORKING THING.</p>
          <h1 id="hero-title">CODE IS ONLY<br /><span className="cinema-outline">THE</span> <span className="cinema-gradient">BEGINNING.</span></h1>
          <div className="cinema-hero-bottom">
            <p>I’m Mahin — a student who learns by making. I build digital tools today, with a long-term focus on AI, robotics and automation.</p>
            <a className="circle-link" href="#approach" aria-label="Scroll to discover"><span>↓</span></a>
          </div>
        </div>
        <div className="cinema-hero-art"><HeroSceneLoader /><span className="art-coordinate art-coordinate-a">FIG. 001 / SPATIAL STUDY</span><span className="art-coordinate art-coordinate-b">CODE × MATTER</span></div>
        <div className="cinema-hero-foot"><span>SCROLL TO DISCOVER</span><span>00 — 04</span><span>IN PROGRESS, BY DESIGN ↘</span></div>
      </section>

      <section className="manifesto-chapter" id="approach">
        <div className="chapter-label"><span>[ 01 / THE APPROACH ]</span><span>LESS TALK. MORE ITERATION.</span></div>
        <div className="manifesto-layout">
          <div className="manifesto-side"><span className="vertical-note">LEARN / BUILD / REPEAT</span><span className="manifesto-symbol" aria-hidden="true">↗</span></div>
          <div className="manifesto-main">
            <p className="cinema-overline">A WORK IN PROGRESS, NOT A FINISHED STORY</p>
            <h2>FROM QUESTIONS<br />TO <span className="cinema-gradient">PROTOTYPES.</span></h2>
            <p className="manifesto-lede">Curiosity becomes useful when it leaves the notebook: build it, break it, understand it, then try again.</p>
            <div className="manifesto-columns">
              <article><span>01 / OBSERVE</span><h3>Find the signal.</h3><p>Understand the problem before reaching for a solution. Good work begins with asking better questions.</p></article>
              <article><span>02 / EXPERIMENT</span><h3>Make it tangible.</h3><p>Turn ideas into working prototypes, test assumptions and learn from what breaks.</p></article>
              <article><span>03 / REFINE</span><h3>Earn the details.</h3><p>Make the useful thing easier to understand, smoother to use and more reliable over time.</p></article>
            </div>
          </div>
        </div>
        <div className="kinetic-ticker" aria-label="Learning through building"><div className="kinetic-ticker-track"><span>THINK CLEARLY ✳ BUILD BOLDLY ✳ STAY CURIOUS ✳ LEARN IN PUBLIC ✳ </span><span aria-hidden="true">THINK CLEARLY ✳ BUILD BOLDLY ✳ STAY CURIOUS ✳ LEARN IN PUBLIC ✳ </span></div></div>
      </section>

      <section className="disciplines-chapter" id="disciplines">
        <div className="chapter-label"><span>[ 02 / DIRECTIONS OF CURIOSITY ]</span><span>THREE CONNECTED FIELDS</span></div>
        <div className="disciplines-heading"><p className="cinema-overline">WHAT I’M WORKING TOWARD</p><h2>FROM SCREEN<br />TO <span className="cinema-gradient">REAL WORLD.</span></h2><p>Different disciplines. One continuing question: how can technology make something possible that wasn’t possible before?</p></div>
        <div className="discipline-list">
          {disciplines.map((item) => <article className="discipline-row" key={item.number}><span className="discipline-number">{item.number}</span><div className="discipline-title"><span>{item.name}</span><h3>{item.title}</h3></div><p>{item.text}</p><div className="discipline-tags">{item.tags}</div><span className="discipline-arrow" aria-hidden="true">↗</span></article>)}
        </div>
      </section>

      <section className="work-chapter" id="selected-work">
        <div className="chapter-label"><span>[ 03 / SELECTED EXPERIMENTS ]</span><span>BUILT TO LEARN SOMETHING</span></div>
        <div className="work-heading"><div><p className="cinema-overline">A FEW THINGS MADE REAL</p><h2>WORK IN<br /><span className="cinema-gradient">PROGRESS.</span></h2></div><p>Not a wall of claims. A growing archive of ideas explored, problems met and skills developed along the way.</p></div>
        <div className="cinema-project-list">
          {featured.map((project) => <article className={`cinema-project cinema-project-${project.tone}`} key={project.number}>
            <div className="cinema-project-visual" aria-hidden="true"><div className="cinema-project-grid" /><div className="cinema-project-orbit cinema-project-orbit-one" /><div className="cinema-project-orbit cinema-project-orbit-two" /><div className="cinema-project-core">{project.mark}</div><span>STUDY / {project.number}</span></div>
            <div className="cinema-project-copy"><span className="cinema-project-meta">{project.number} — {project.category}</span><h3>{project.title}</h3><p>{project.text}</p><div className="cinema-project-links"><Link href={`/projects/${project.slug}`}>EXPLORE PROJECT <span aria-hidden="true">↗</span></Link><a href={project.href} target="_blank" rel="noreferrer">SOURCE CODE <span aria-hidden="true">↗</span></a></div></div>
            <span className="cinema-project-index" aria-hidden="true">{project.number}</span>
          </article>)}
        </div>
        <div className="work-more"><span>MORE EXPERIMENTS, MORE TO LEARN.</span><Link href="/projects">OPEN PROJECT ARCHIVE <span aria-hidden="true">↗</span></Link></div>
      </section>

      <section className="next-chapter" id="next">
        <div className="next-chapter-orbit" aria-hidden="true"><span /><span /><span /></div>
        <div className="chapter-label"><span>[ 04 / THE LONG GAME ]</span><span>ALWAYS BECOMING</span></div>
        <p className="cinema-overline">THE DESTINATION IS STILL AHEAD</p>
        <h2>BUILD SKILL.<br />BUILD <span className="cinema-gradient">SYSTEMS.</span><br />BUILD WHAT’S NEXT.</h2>
        <div className="next-chapter-bottom"><p>I’m working toward robotics and automation engineering — building strong foundations in software, maths and systems one project at a time.</p><div className="next-chapter-actions"><Link className="cinema-button cinema-button-primary" href="/journey">VIEW THE JOURNEY <span>↗</span></Link><Link className="cinema-button" href="/contact">SAY HELLO <span>↗</span></Link></div></div>
      </section>

      <section className="cinema-footer-cta">
        <span>[ END OF CURRENT CHAPTER ]</span><p>GOOD IDEAS DON’T STAY STILL.</p><Link href="/projects">SEE WHAT I’M BUILDING <span aria-hidden="true">↗</span></Link>
      </section>
    </>
  );
}

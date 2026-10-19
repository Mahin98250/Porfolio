import dynamic from "next/dynamic";
import Link from "next/link";

const HeroScene = dynamic(() => import("../components/hero-scene").then((module) => module.HeroScene), {
  ssr: false,
  loading: () => <div className="hero-scene scene-fallback" aria-hidden="true" />,
});

const featured = [
  { number: "01", title: "OptiCode Studio", category: "Optical transfer", href: "https://github.com/Mahin98250/OptiCode-Studio", text: "Exploring QR-based optical file transfer, frame reconstruction and offline-first workflows." },
  { number: "02", title: "Learner’s Guide", category: "Learning platform", href: "https://github.com/Mahin98250/Final-Learner-s-Guide", text: "A student-focused learning experience for organizing study resources and workflows." },
  { number: "03", title: "DudhWala", category: "Local marketplace", href: "https://github.com/Mahin98250/Dudh-Wallah", text: "A marketplace concept connecting customers with independent local milk sellers." },
];

export default function HomePage() {
  return (
    <>
      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow"><i className="status-dot" /> STUDENT PROGRAMMER · BUILDING IN PUBLIC</span>
          <p className="hero-kicker">CODE IS HOW I EXPLORE THE WORLD</p>
          <h1>Curiosity,<br />compiled into<br /><span className="gradient-text">real things.</span></h1>
          <p className="hero-description">I’m Mahin Patel — a student programmer who learns by building. I turn ideas into websites, tools and experiments while growing toward software engineering, AI, robotics and automation.</p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/projects">Explore selected work <span aria-hidden="true">↗</span></Link>
            <a className="button button-glass" href="https://github.com/Mahin98250" target="_blank" rel="noreferrer">View GitHub profile <span aria-hidden="true">↗</span></a>
          </div>
          <div className="hero-meta"><span>Ahmedabad, India</span><span>Projects over promises</span></div>
        </div>
        <HeroScene />
        <div className="hero-bottomline"><span>01 / A WORK IN PROGRESS</span><span>SCROLL TO EXPLORE ↓</span></div>
      </section>
      <section className="intro-strip glass">
        <span>PROGRAMMING</span><span className="strip-divider" aria-hidden="true">/</span><span>PRODUCT THINKING</span><span className="strip-divider" aria-hidden="true">/</span><span>AI & EMERGING TECH</span><span className="strip-divider" aria-hidden="true">/</span><span>ROBOTICS / AUTOMATION</span>
      </section>
      <section className="section-block">
        <div className="section-heading">
          <span className="eyebrow">01 / SELECTED WORK</span>
          <h2>Experiments with<br /><span className="gradient-text">real learning inside.</span></h2>
          <p>Each project is a chance to strengthen fundamentals, explore a problem and make the experience more useful.</p>
        </div>
        <div className="featured-grid">
          {featured.map((project) => (
            <article className="featured-card glass" key={project.number}>
              <div className="project-card-top"><span>{project.number} / PROJECT FILE</span><span>↗</span></div>
              <div className="project-art" aria-hidden="true"><div className="project-orb" /><div className="project-ring" /><div className="project-grid" /></div>
              <span className="eyebrow">{project.category}</span>
              <h3>{project.title}</h3>
              <p>{project.text}</p>
              <a className="text-link" href={project.href} target="_blank" rel="noreferrer">Inspect source <span aria-hidden="true">↗</span></a>
            </article>
          ))}
        </div>
        <div className="section-cta"><Link className="button button-glass" href="/projects">View all projects <span aria-hidden="true">↗</span></Link></div>
      </section>
      <section className="closing-panel glass">
        <span className="eyebrow">THE LONG GAME</span>
        <h2>The goal isn’t a title.<br /><span className="gradient-text">It’s capability.</span></h2>
        <p>Learn the fundamentals. Build useful things. Keep improving. Explore the intersection of software, AI and the physical world.</p>
        <Link className="text-link" href="/journey">Explore my journey <span aria-hidden="true">↗</span></Link>
      </section>
    </>
  );
}

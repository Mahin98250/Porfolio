import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Projects" };

const projects = [
  {
    n: "01",
    slug: "opticode-studio",
    name: "OptiCode Studio",
    short: "OPTICODE",
    theme: "opticode",
    category: "OPTICAL TRANSFER",
    href: "https://github.com/Mahin98250/OptiCode-Studio",
    text: "An experimental optical file-transfer project exploring QR transport, frame reassembly and offline-first workflows.",
  },
  {
    n: "02",
    slug: "learners-guide",
    name: "Learner’s Guide",
    short: "LEARN",
    theme: "learners",
    category: "LEARNING PLATFORM",
    href: "https://github.com/Mahin98250/Final-Learner-s-Guide",
    text: "A student-focused learning platform concept for study resources, clear navigation and everyday learning workflows.",
  },
  {
    n: "03",
    slug: "dudhwala",
    name: "DudhWala",
    short: "DOODH",
    theme: "dudhwala",
    category: "LOCAL MARKETPLACE",
    href: "https://github.com/Mahin98250/Dudh-Wallah",
    text: "A marketplace concept connecting customers with independent milk sellers through distinct user journeys.",
  },
  {
    n: "04",
    slug: "velocitytype",
    name: "VelocityType",
    short: "TYPE",
    theme: "velocity",
    category: "TYPING PRACTICE",
    href: "https://github.com/Mahin98250/Velocitytype",
    text: "A typing-practice experience focused on speed, accuracy, comfortable practice and progress tracking.",
  },
  {
    n: "05",
    slug: "weather-status",
    name: "Weather Status",
    short: "WX",
    theme: "weather",
    category: "WEB TOOL",
    href: "https://github.com/Mahin98250/Weather-Status",
    text: "A responsive weather interface experiment for presenting changing conditions clearly across screen sizes.",
  },
  {
    n: "06",
    name: "QR Generator",
    short: "QR",
    theme: "qr",
    category: "BROWSER UTILITY",
    href: "https://github.com/Mahin98250?tab=repositories",
    text: "QR generation and scanning experiments. Browse public repositories for the current implementation and source.",
  },
];

export default function ProjectsPage() {
  return <>
    <header className="page-hero">
      <span className="eyebrow">02 / SELECTED WORK</span>
      <h1>Experiments.<br /><span className="gradient-text">Lessons in every build.</span></h1>
      <p>Six project snapshots, each with a different problem to explore. These summaries are intentionally conservative; each linked repository remains the source of truth for implementation details, status and limitations.</p>
    </header>
    <section className="all-projects-intro">
      <span>PROJECT ARCHIVE / 006 STUDIES</span>
      <span>SELECT A PROJECT TO EXPLORE <b aria-hidden="true">↘</b></span>
    </section>
    <section className="featured-grid all-projects-grid" aria-label="Project archive">
      {projects.map((project) => (
        <article className={`featured-card all-project-card glass project-theme-${project.theme}`} key={project.n}>
          <div className="project-card-top"><span>{project.n} / PROJECT FILE</span><span aria-hidden="true">↗</span></div>
          <div className="project-art all-project-art" aria-hidden="true">
            <div className="project-grid" />
            <div className="project-orb" />
            <div className="project-ring" />
            <span className="project-art-mark">{project.short}</span>
            <span className="project-art-coordinates">STUDY {project.n} · 3D</span>
          </div>
          <span className="eyebrow">{project.category}</span>
          <h3>{project.name}</h3>
          <p>{project.text}</p>
          <div className="project-card-links">
            {project.slug
              ? <Link className="text-link" href={`/projects/${project.slug}`}>Project overview <span aria-hidden="true">↗</span></Link>
              : <a className="text-link" href={project.href} target="_blank" rel="noreferrer">Browse repositories <span aria-hidden="true">↗</span></a>}
            <a className="text-link" href={project.href} target="_blank" rel="noreferrer">Source <span aria-hidden="true">↗</span></a>
          </div>
        </article>
      ))}
    </section>
    <section className="closing-panel glass all-projects-closing">
      <span className="eyebrow">BUILD LOGIC, NOT JUST SCREENS</span>
      <h2>Every project is<br /><span className="gradient-text">practice for the next one.</span></h2>
      <p>The point is not to claim perfection. It is to understand a problem more deeply, ship something useful and get better at the craft.</p>
      <Link className="text-link" href="/journey">See the learning roadmap <span aria-hidden="true">↗</span></Link>
    </section>
  </>;
}

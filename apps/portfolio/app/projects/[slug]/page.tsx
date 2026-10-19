import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

const projects = {
  "opticode-studio": {
    title: "OptiCode Studio",
    short: "OPTICODE",
    category: "OPTICAL TRANSFER / EXPERIMENT",
    summary: "An exploration of moving data through visual codes, with an emphasis on local processing and resilient frame reconstruction.",
    learning: ["Frame encoding and decoding", "Offline-first browser constraints", "Diagnostics and recovery strategies"],
    focus: "Moving information through light",
    detail: "Explore how visual frames can carry data, how receivers interpret them, and how a transfer can recover when frames arrive imperfectly.",
    href: "https://github.com/Mahin98250/OptiCode-Studio",
  },
  "learners-guide": {
    title: "Learner’s Guide",
    short: "LEARN",
    category: "LEARNING PLATFORM / EXPERIMENT",
    summary: "A student-focused interface concept for finding study resources and organizing learning workflows.",
    learning: ["Responsive application structure", "Navigation and information hierarchy", "Reusable interface patterns"],
    focus: "Making learning feel organized",
    detail: "A study-space concept shaped around clear navigation, quick access to resources, and a calmer path from finding material to using it.",
    href: "https://github.com/Mahin98250/Final-Learner-s-Guide",
  },
  dudhwala: {
    title: "DudhWala",
    short: "DOODH",
    category: "LOCAL MARKETPLACE / EXPERIMENT",
    summary: "A marketplace concept for customers and independent milk sellers, with distinct user experiences.",
    learning: ["Role-based user journeys", "Marketplace data boundaries", "Trust, safety and clear product states"],
    focus: "Connecting local buyers and sellers",
    detail: "A marketplace concept with separate customer and seller journeys, designed to make everyday ordering feel direct and understandable.",
    href: "https://github.com/Mahin98250/Dudh-Wallah",
  },
  velocitytype: {
    title: "VelocityType",
    short: "VELOCITY",
    category: "TYPING PRACTICE / EXPERIMENT",
    summary: "A typing-practice experience centered on speed, accuracy and progress tracking.",
    learning: ["Interaction design", "Local persistence concepts", "Responsive dashboard patterns"],
    focus: "Turning practice into momentum",
    detail: "A focused typing environment built around responsive feedback, progress over time, and a tactile, distraction-light interface.",
    href: "https://github.com/Mahin98250/Velocitytype",
  },
  "weather-status": {
    title: "Weather Status",
    short: "WEATHER",
    category: "WEB TOOL / EXPERIMENT",
    summary: "A weather interface experiment that aims to present conditions in a compact, readable layout.",
    learning: ["API-driven interfaces", "Loading and error states", "Visual hierarchy"],
    focus: "Useful information at a glance",
    detail: "A compact weather-tool concept exploring how changing conditions can be presented clearly across different screen sizes.",
    href: "https://github.com/Mahin98250/Weather-Status",
  },
} as const;

type ProjectSlug = keyof typeof projects;

export function generateStaticParams() {
  return Object.keys(projects).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (!(slug in projects)) return { title: "Project not found" };
  return { title: projects[slug as ProjectSlug].title };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!(slug in projects)) notFound();
  const project = projects[slug as ProjectSlug];

  return (
    <div className={`project-detail project-theme-${slug}`}>
      <header className="project-detail-hero">
        <div className="project-detail-copy">
          <Link className="back-link" href="/projects">← All projects</Link>
          <span className="eyebrow">{project.category}</span>
          <h1>{project.title}<br /><span className="gradient-text">Made to be explored.</span></h1>
          <p>{project.summary}</p>
          <div className="hero-actions">
            <a className="button button-primary" href={project.href} target="_blank" rel="noreferrer">Inspect source ↗</a>
            <a className="button button-glass" href="#project-notes">Explore the details ↓</a>
          </div>
          <div className="project-detail-caption"><span>INDEPENDENT PROJECT</span><span>LEARNING THROUGH BUILDING</span></div>
        </div>
        <div className="project-stage" aria-label={`Abstract animated artwork for ${project.title}`}>
          <div className="stage-glow" />
          <div className="stage-grid" />
          <div className="stage-orbit stage-orbit-one" />
          <div className="stage-orbit stage-orbit-two" />
          <div className="stage-orbit stage-orbit-three" />
          <div className="stage-object"><span>{project.short}</span></div>
          <div className="stage-spark stage-spark-one" />
          <div className="stage-spark stage-spark-two" />
          <div className="stage-spark stage-spark-three" />
          <div className="stage-label stage-label-top">FIG. 0{Object.keys(projects).indexOf(slug) + 1} / DIGITAL STUDY</div>
          <div className="stage-label stage-label-bottom">FORM · MOTION · FUNCTION</div>
        </div>
      </header>

      <section className="project-signal-row" aria-label="Project principles">
        <div><span>01</span><strong>Curiosity first</strong><small>Start with a question</small></div>
        <div><span>02</span><strong>Build in public</strong><small>Learn through iteration</small></div>
        <div><span>03</span><strong>Keep improving</strong><small>Progress over perfection</small></div>
      </section>

      <section className="project-story-grid" id="project-notes">
        <article className="project-story-main glass" data-reveal>
          <span className="eyebrow">THE IDEA</span>
          <h2>{project.focus}<span className="story-period">.</span></h2>
          <p>{project.detail}</p>
          <a className="text-link" href={project.href} target="_blank" rel="noreferrer">See the code and current state ↗</a>
        </article>
        <article className="project-learning-card glass" data-reveal>
          <span className="eyebrow">WHAT THIS BUILDS</span>
          <h3>Skills grow one iteration at a time.</h3>
          <ul>{project.learning.map((item, index) => <li key={item}><span>0{index + 1}</span>{item}</li>)}</ul>
        </article>
      </section>

      <section className="project-bottom-panel glass" data-reveal>
        <div><span className="eyebrow">STILL EVOLVING</span><h2>The next version starts with a better question.</h2><p>This page is a portfolio summary, not a claim of production readiness. The linked repository is the source of truth for implementation and current status.</p></div>
        <a className="button button-primary" href={project.href} target="_blank" rel="noreferrer">Open repository ↗</a>
      </section>
    </div>
  );
}

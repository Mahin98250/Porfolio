import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

const projects = {
  "opticode-studio": {
    title: "OptiCode Studio",
    category: "OPTICAL TRANSFER / EXPERIMENT",
    summary: "An exploration of moving data through visual codes, with an emphasis on local processing and resilient frame reconstruction.",
    learning: ["Frame encoding and decoding", "Offline-first browser constraints", "Diagnostics and recovery strategies"],
    href: "https://github.com/Mahin98250/OptiCode-Studio",
  },
  "learners-guide": {
    title: "Learner’s Guide",
    category: "LEARNING PLATFORM / EXPERIMENT",
    summary: "A student-focused interface concept for finding study resources and organizing learning workflows.",
    learning: ["Responsive application structure", "Navigation and information hierarchy", "Reusable interface patterns"],
    href: "https://github.com/Mahin98250/Final-Learner-s-Guide",
  },
  dudhwala: {
    title: "DudhWala",
    category: "LOCAL MARKETPLACE / EXPERIMENT",
    summary: "A marketplace concept for customers and independent milk sellers, with distinct user experiences.",
    learning: ["Role-based user journeys", "Marketplace data boundaries", "Trust, safety and clear product states"],
    href: "https://github.com/Mahin98250/Dudh-Wallah",
  },
  velocitytype: {
    title: "VelocityType",
    category: "TYPING PRACTICE / EXPERIMENT",
    summary: "A typing-practice experience centered on speed, accuracy and progress tracking.",
    learning: ["Interaction design", "Local persistence concepts", "Responsive dashboard patterns"],
    href: "https://github.com/Mahin98250/Velocitytype",
  },
  "weather-status": {
    title: "Weather Status",
    category: "WEB TOOL / EXPERIMENT",
    summary: "A weather interface experiment that aims to present conditions in a compact, readable layout.",
    learning: ["API-driven interfaces", "Loading and error states", "Visual hierarchy"],
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
    <>
      <header className="page-hero">
        <span className="eyebrow">{project.category}</span>
        <h1>{project.title}<br /><span className="gradient-text">A work in progress.</span></h1>
        <p>{project.summary}</p>
        <div className="hero-actions">
          <a className="button button-primary" href={project.href} target="_blank" rel="noreferrer">Inspect source ↗</a>
          <Link className="button button-glass" href="/projects">Back to projects</Link>
        </div>
      </header>
      <section className="content-grid">
        <article className="content-card glass">
          <span className="eyebrow">WHAT I’M LEARNING</span>
          <h2>Ideas become skills through iteration.</h2>
          <ul>{project.learning.map((item) => <li key={item}>{item}</li>)}</ul>
        </article>
        <article className="content-card glass">
          <span className="eyebrow">SOURCE OF TRUTH</span>
          <h2>Review the repository.</h2>
          <p>This page is a portfolio summary, not a guarantee of production readiness. The linked source repository contains the implementation and current state.</p>
          <a className="text-link" href={project.href} target="_blank" rel="noreferrer">Open repository ↗</a>
        </article>
      </section>
    </>
  );
}

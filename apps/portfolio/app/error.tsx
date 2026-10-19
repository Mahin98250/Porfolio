"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="error-state" role="alert">
      <span className="eyebrow">A TEMPORARY INTERRUPTION</span>
      <h1 style={{ fontSize: "clamp(40px, 7vw, 68px)" }}>
        Let’s get<br />
        <span className="gradient-text">back on track.</span>
      </h1>
      <p className="hero-description">
        This page did not load correctly. Nothing is assumed lost; try again, or return to the home page.
      </p>
      <div className="hero-actions">
        <button className="button button-primary" type="button" onClick={reset}>
          Try again <span aria-hidden="true">↻</span>
        </button>
        <a className="button button-glass" href="/">
          Back home <span aria-hidden="true">↗</span>
        </a>
      </div>
    </section>
  );
}

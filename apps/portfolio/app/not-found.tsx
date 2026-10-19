import Link from "next/link";

export default function NotFound() {
  return (
    <section className="page-hero">
      <span className="eyebrow">404 / ROUTE NOT FOUND</span>
      <h1>This path doesn’t<br /><span className="gradient-text">compile.</span></h1>
      <p>The page may have moved or the link may be incorrect. Return to the portfolio and keep exploring.</p>
      <Link className="button button-primary" href="/">Back home ↗</Link>
    </section>
  );
}

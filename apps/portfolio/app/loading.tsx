export default function Loading() {
  return (
    <section className="loading-page" aria-label="Loading page content" role="status">
      <span className="eyebrow">PREPARING THE EXPERIENCE</span>
      <div className="loading-heading" aria-hidden="true" />
      <div className="loading-line" aria-hidden="true" />
      <div className="loading-copy" aria-hidden="true" />
      <div className="loading-copy" aria-hidden="true" style={{ maxWidth: 390 }} />
    </section>
  );
}

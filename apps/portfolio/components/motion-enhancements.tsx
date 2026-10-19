"use client";

import { useEffect } from "react";

export function MotionEnhancements() {
  useEffect(() => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const progress = document.createElement("div");
    progress.className = "scroll-progress";
    progress.setAttribute("aria-hidden", "true");
    const glow = document.createElement("div");
    glow.className = "motion-glow";
    glow.setAttribute("aria-hidden", "true");
    document.body.append(progress, glow);

    let frame = 0;
    const updateProgress = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        root.style.setProperty("--scroll-progress", String(max > 0 ? window.scrollY / max : 0));
      });
    };
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress, { passive: true });
    updateProgress();

    const pointerMove = (event: PointerEvent) => {
      root.style.setProperty("--pointer-x", event.clientX + "px");
      root.style.setProperty("--pointer-y", event.clientY + "px");
      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>(".featured-card,.content-card,.project-row,.brand-logo-card");
      document.querySelectorAll<HTMLElement>(".is-pointer-card").forEach((card) => {
        if (card !== target) card.classList.remove("is-pointer-card");
      });
      if (!target) return;
      target.classList.add("is-pointer-card");
      const rect = target.getBoundingClientRect();
      target.style.setProperty("--card-x", (event.clientX - rect.left) + "px");
      target.style.setProperty("--card-y", (event.clientY - rect.top) + "px");
      if (finePointer && !reduceMotion) {
        const nx = (event.clientX - rect.left) / rect.width - 0.5;
        const ny = (event.clientY - rect.top) / rect.height - 0.5;
        target.style.setProperty("--tilt-x", (-ny * 4).toFixed(2) + "deg");
        target.style.setProperty("--tilt-y", (nx * 5).toFixed(2) + "deg");
      }
    };
    if (finePointer) window.addEventListener("pointermove", pointerMove, { passive: true });

    let observer: IntersectionObserver | undefined;
    const revealNodes = () => {
      const nodes = document.querySelectorAll<HTMLElement>(".section-heading,.featured-card,.content-card,.project-row,.brand-logo-card,.closing-panel,.intro-strip,.page-hero,.project-list");
      if (reduceMotion || !("IntersectionObserver" in window)) {
        nodes.forEach((node) => node.classList.add("is-visible"));
        return;
      }
      observer?.disconnect();
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const node = entry.target as HTMLElement;
          node.classList.add("is-visible");
          observer?.unobserve(node);
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -45px 0px" });
      nodes.forEach((node, index) => {
        if (node.classList.contains("is-visible")) return;
        node.setAttribute("data-reveal", "true");
        if (node.matches(".featured-card,.content-card,.project-row,.brand-logo-card")) {
          node.style.setProperty("--reveal-delay", (Math.min(index % 4, 3) * 75) + "ms");
        }
        observer?.observe(node);
      });
    };
    revealNodes();
    const mutationObserver = new MutationObserver(() => revealNodes());
    mutationObserver.observe(document.querySelector(".page-content") ?? document.body, { childList: true, subtree: true });
    const resetTilt = () => {
      document.querySelectorAll<HTMLElement>(".is-pointer-card").forEach((card) => {
        card.style.setProperty("--tilt-x", "0deg");
        card.style.setProperty("--tilt-y", "0deg");
      });
    };
    window.addEventListener("blur", resetTilt);
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
      window.removeEventListener("pointermove", pointerMove);
      window.removeEventListener("blur", resetTilt);
      if (frame) window.cancelAnimationFrame(frame);
      observer?.disconnect();
      mutationObserver.disconnect();
      progress.remove();
      glow.remove();
      root.style.removeProperty("--scroll-progress");
      root.style.removeProperty("--pointer-x");
      root.style.removeProperty("--pointer-y");
    };
  }, []);
  return null;
}

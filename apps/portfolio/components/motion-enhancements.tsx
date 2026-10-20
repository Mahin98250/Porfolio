"use client";

import { useEffect } from "react";

const revealSelector = [
  ".section-heading",
  ".featured-card",
  ".content-card",
  ".project-row",
  ".brand-logo-card",
  ".closing-panel",
  ".intro-strip",
  ".page-hero",
  ".project-list",
  ".page-experience",
  ".experience-metric",
  ".skill-group-card",
  ".journey-card",
  ".project-signal-row > div",
  ".project-story-main",
  ".project-learning-card",
  ".project-bottom-panel",
  ".manifesto-main",
  ".manifesto-columns article",
  ".discipline-row",
  ".disciplines-heading",
  ".work-heading",
  ".cinema-project",
  ".next-chapter-bottom",
  ".chapter-label",
  ".cinema-footer-cta",
].join(",");

const pointerCardSelector = [
  ".featured-card",
  ".content-card",
  ".project-row",
  ".brand-logo-card",
  ".page-experience",
  ".experience-metric",
  ".skill-group-card",
  ".journey-card",
  ".project-signal-row > div",
  ".project-story-main",
  ".project-learning-card",
  ".project-bottom-panel",
].join(",");

export function MotionEnhancements() {
  useEffect(() => {
    const root = document.documentElement;
    const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
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

    let activeCard: HTMLElement | null = null;
    let activeButton: HTMLElement | null = null;

    const resetCard = (card: HTMLElement | null) => {
      if (!card) return;
      card.classList.remove("is-pointer-card");
      card.style.removeProperty("--tilt-x");
      card.style.removeProperty("--tilt-y");
    };

    const resetButton = (button: HTMLElement | null) => {
      if (!button) return;
      button.classList.remove("is-magnetic");
      button.style.removeProperty("--magnet-x");
      button.style.removeProperty("--magnet-y");
    };

    const pointerMove = (event: PointerEvent) => {
      root.style.setProperty("--pointer-x", event.clientX + "px");
      root.style.setProperty("--pointer-y", event.clientY + "px");

      const element = event.target instanceof Element ? event.target : null;
      const target = element?.closest<HTMLElement>(pointerCardSelector) ?? null;
      const magneticButton = element?.closest<HTMLElement>(".button") ?? null;

      if (target !== activeCard) {
        resetCard(activeCard);
        activeCard = target;
      }

      if (target) {
        target.classList.add("is-pointer-card");
        const rect = target.getBoundingClientRect();
        target.style.setProperty("--card-x", (event.clientX - rect.left) + "px");
        target.style.setProperty("--card-y", (event.clientY - rect.top) + "px");

        if (finePointerQuery.matches && !reduceMotionQuery.matches && rect.width > 0 && rect.height > 0) {
          const nx = (event.clientX - rect.left) / rect.width - 0.5;
          const ny = (event.clientY - rect.top) / rect.height - 0.5;
          target.style.setProperty("--tilt-x", (-ny * 3.5).toFixed(2) + "deg");
          target.style.setProperty("--tilt-y", (nx * 4.5).toFixed(2) + "deg");
        }
      }

      if (magneticButton !== activeButton) {
        resetButton(activeButton);
        activeButton = magneticButton;
      }

      if (magneticButton && finePointerQuery.matches && !reduceMotionQuery.matches) {
        const rect = magneticButton.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          const dx = (event.clientX - rect.left - rect.width / 2) / rect.width;
          const dy = (event.clientY - rect.top - rect.height / 2) / rect.height;
          magneticButton.classList.add("is-magnetic");
          magneticButton.style.setProperty("--magnet-x", (dx * 7).toFixed(1) + "px");
          magneticButton.style.setProperty("--magnet-y", (dy * 5).toFixed(1) + "px");
        }
      }
    };

    if (finePointerQuery.matches) window.addEventListener("pointermove", pointerMove, { passive: true });

    let observer: IntersectionObserver | undefined;
    const revealNodes = () => {
      const nodes = document.querySelectorAll<HTMLElement>(revealSelector);
      if (reduceMotionQuery.matches || !("IntersectionObserver" in window)) {
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
        if (node.matches(".featured-card,.content-card,.project-row,.brand-logo-card,.experience-metric,.skill-group-card,.journey-card,.project-signal-row > div,.manifesto-columns article,.discipline-row,.cinema-project")) {
          node.style.setProperty("--reveal-delay", (Math.min(index % 4, 3) * 65) + "ms");
        }
        observer?.observe(node);
      });
    };

    revealNodes();
    const mutationObserver = new MutationObserver(() => revealNodes());
    mutationObserver.observe(document.querySelector(".page-content") ?? document.body, { childList: true, subtree: true });

    const resetInteractions = () => {
      resetCard(activeCard);
      resetButton(activeButton);
      activeCard = null;
      activeButton = null;
    };

    window.addEventListener("blur", resetInteractions);

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
      window.removeEventListener("pointermove", pointerMove);
      window.removeEventListener("blur", resetInteractions);
      if (frame) window.cancelAnimationFrame(frame);
      observer?.disconnect();
      mutationObserver.disconnect();
      progress.remove();
      glow.remove();
      resetInteractions();
      root.style.removeProperty("--scroll-progress");
      root.style.removeProperty("--pointer-x");
      root.style.removeProperty("--pointer-y");
    };
  }, []);

  return null;
}

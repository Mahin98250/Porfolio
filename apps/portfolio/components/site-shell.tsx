"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MotionEnhancements } from "./motion-enhancements";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/skills", label: "Skills" },
  { href: "/journey", label: "Journey" },
  { href: "/contact", label: "Contact" },
];

export function SiteShell({ children }: Readonly<{ children: ReactNode }>) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="site-root">
      <MotionEnhancements />
      <div className="ambient ambient-a" aria-hidden="true" />
      <div className="ambient ambient-b" aria-hidden="true" />
      <header className="topbar glass">
        <Link className="brand" href="/" onClick={() => setMenuOpen(false)} aria-label="Mahin Patel home">
          <span className="brand-symbol">M<span>.</span></span>
          <span className="brand-copy">MAHIN PATEL<small>PROGRAMMER / BUILDER</small></span>
        </Link>
        <button
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          onClick={() => setMenuOpen((open) => !open)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setMenuOpen(false);
          }}
        >
          <span aria-hidden="true" /><span aria-hidden="true" />
        </button>
        <nav id="main-navigation" className={menuOpen ? "navigation navigation-open" : "navigation"} aria-label="Main navigation">
          {links.map((link) => {
            const active = pathname === link.href || (link.href === "/projects" && pathname.startsWith("/projects/"));
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={active ? "nav-link nav-active" : "nav-link"}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="page-content">{children}</main>
      <footer className="footer glass">
        <span>© {new Date().getFullYear()} Mahin Patel</span>
        <span>Built with curiosity, care and code.</span>
        <a href="https://github.com/Mahin98250" target="_blank" rel="noreferrer">GitHub ↗</a>
      </footer>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/skills", label: "Skills" },
  { href: "/journey", label: "Journey" },
  { href: "/contact", label: "Contact" },
];

export function SiteShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="site-root">
      <div className="ambient ambient-a" aria-hidden="true" />
      <div className="ambient ambient-b" aria-hidden="true" />
      <header className="topbar glass">
        <Link className="brand" href="/" onClick={() => setMenuOpen(false)} aria-label="Mahin Patel home">
          <span className="brand-symbol">M<span>.</span></span>
          <span className="brand-copy">MAHIN PATEL<small>PROGRAMMER / BUILDER</small></span>
        </Link>
        <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-label="Toggle navigation" onClick={() => setMenuOpen((open) => !open)}>
          <span /><span />
        </button>
        <nav className={menuOpen ? "navigation navigation-open" : "navigation"} aria-label="Main navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              className={pathname === link.href ? "nav-link nav-active" : "nav-link"}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
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

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiArrowDownRight, FiArrowUpRight, FiGithub, FiExternalLink, FiMenu,
  FiX, FiSun, FiMoon, FiCode, FiCpu, FiLayers, FiZap, FiMail,
  FiMapPin, FiCheckCircle, FiCommand, FiGlobe, FiSmartphone
} from 'react-icons/fi';

const projects = [
  {
    name: 'OptiCode Studio',
    category: 'Engineering',
    number: '01',
    description: 'An experimental optical file-transfer experience exploring QR-based data transport, frame reassembly and offline-first workflows.',
    stack: ['JavaScript', 'Web APIs', 'Optical transfer'],
    href: 'https://github.com/Mahin98250/OptiCode-Studio',
    accent: 'violet',
    icon: FiZap,
  },
  {
    name: 'Learner’s Guide',
    category: 'Web apps',
    number: '02',
    description: 'A student-focused learning platform concept designed to make study material and everyday learning workflows easier to navigate.',
    stack: ['React', 'TypeScript', 'Tailwind CSS'],
    href: 'https://github.com/Mahin98250/Final-Learner-s-Guide',
    accent: 'blue',
    icon: FiLayers,
  },
  {
    name: 'DudhWala',
    category: 'Web apps',
    number: '03',
    description: 'A local milk marketplace concept connecting customers with independent sellers through dedicated customer and seller experiences.',
    stack: ['Web development', 'Marketplace UX'],
    href: 'https://github.com/Mahin98250/Dudh-Wallah',
    accent: 'mint',
    icon: FiGlobe,
  },
  {
    name: 'VelocityType',
    category: 'Web apps',
    number: '04',
    description: 'A typing-practice experience focused on speed, accuracy, progress tracking and a polished, distraction-light interface.',
    stack: ['HTML', 'CSS', 'JavaScript'],
    href: 'https://github.com/Mahin98250/Velocitytype',
    accent: 'orange',
    icon: FiCode,
  },
  {
    name: 'Weather Status',
    category: 'Tools',
    number: '05',
    description: 'A weather interface experiment built to present useful conditions in a clear, responsive layout.',
    stack: ['JavaScript', 'Weather API', 'Responsive UI'],
    href: 'https://github.com/Mahin98250/Weather-Status',
    accent: 'blue',
    icon: FiSmartphone,
  },
  {
    name: 'OR Generator',
    category: 'Tools',
    number: '06',
    description: 'A QR-code generation and scanning project exploring practical browser-based utilities.',
    stack: ['JavaScript', 'QR codes', 'Web APIs'],
    href: 'https://github.com/Mahin98250/OR-Generator',
    accent: 'violet',
    icon: FiCommand,
  },
];

const capabilities = [
  { title: 'Frontend development', detail: 'Responsive interfaces, reusable UI and thoughtful interaction design.', icon: FiCode, tags: ['HTML', 'CSS', 'JavaScript', 'React'] },
  { title: 'AI & emerging tech', detail: 'Exploring AI-assisted workflows and the foundations of intelligent systems.', icon: FiCpu, tags: ['AI exploration', 'Python learning', 'Problem solving'] },
  { title: 'Product thinking', detail: 'Turning a rough idea into a clear, usable experience through iteration.', icon: FiLayers, tags: ['UX thinking', 'Prototyping', 'Accessibility'] },
];

const filters = ['All', 'Engineering', 'Web apps', 'Tools'];

function SectionHeading({ eyebrow, title, description, light = false }) {
  return <div className={'section-heading' + (light ? ' section-heading-light' : '')}>
    <span className="eyebrow">{eyebrow}</span>
    <h2>{title}</h2>
    {description && <p>{description}</p>}
  </div>;
}

export default function App() {
  const [theme, setTheme] = useState('light');
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState('All');
  const visibleProjects = useMemo(() => filter === 'All' ? projects : projects.filter(p => p.category === filter), [filter]);
  const dark = theme === 'dark';

  const closeMenu = () => setMenuOpen(false);
  const navItems = [['About', '#about'], ['Capabilities', '#capabilities'], ['Projects', '#projects'], ['Journey', '#journey'], ['Contact', '#contact']];

  return (
    <div className={'portfolio ' + (dark ? 'theme-dark' : 'theme-light')}>
      <div className="top-progress" aria-hidden="true" />
      <header className="site-header">
        <nav className="nav-shell" aria-label="Main navigation">
          <a className="brand" href="#home" onClick={closeMenu} aria-label="Mahin Patel home"><span className="brand-mark">M<span>.</span></span><span className="brand-name">MAHIN PATEL</span></a>
          <div className={'nav-links' + (menuOpen ? ' nav-links-open' : '')}>
            {navItems.map(([label, href]) => <a key={label} href={href} onClick={closeMenu}>{label}</a>)}
            <a className="nav-contact" href="#contact" onClick={closeMenu}>Let’s talk <FiArrowUpRight /></a>
          </div>
          <div className="nav-actions">
            <button className="icon-button theme-toggle" onClick={() => setTheme(dark ? 'light' : 'dark')} aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'} title="Toggle theme">{dark ? <FiSun /> : <FiMoon />}</button>
            <button className="icon-button menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>{menuOpen ? <FiX /> : <FiMenu />}</button>
          </div>
        </nav>
      </header>

      <main>
        <section className="hero section-wrap" id="home">
          <div className="hero-grid">
            <motion.div className="hero-copy" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, ease: 'easeOut' }}>
              <div className="availability"><span className="status-dot" /> CURIOUS BUILDER · OPEN TO LEARNING</div>
              <p className="hero-kicker">DESIGNING AND BUILDING FOR WHAT’S NEXT</p>
              <h1>Ideas into <span>useful</span><br />digital experiences.</h1>
              <p className="hero-description">I’m Mahin Patel — a student developer exploring software, AI and thoughtful product design. I build projects to learn by doing, solve real problems and make technology feel simpler.</p>
              <div className="hero-actions">
                <a className="button button-primary" href="#projects">Explore my work <FiArrowUpRight /></a>
                <a className="button button-secondary" href="#contact">Get in touch <FiArrowDownRight /></a>
              </div>
              <div className="hero-proof"><span><FiCheckCircle /> Built through hands-on projects</span><span><FiMapPin /> Ahmedabad, India</span></div>
            </motion.div>

            <motion.div className="hero-visual" initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .8, delay: .12 }}>
              <div className="visual-orbit orbit-one" /><div className="visual-orbit orbit-two" />
              <div className="visual-glow" />
              <div className="visual-card">
                <div className="visual-card-top"><span className="window-dots"><i /><i /><i /></span><span>MAHIN / BUILD LOG</span><FiCommand /></div>
                <div className="visual-monogram">M<span>.</span></div>
                <div className="visual-caption"><span className="caption-label">CURRENT MODE</span><strong>Learn. Build. Improve.</strong><span className="caption-sub">Curiosity, turned into code.</span></div>
                <div className="visual-card-bottom"><span><i className="tiny-status" /> AVAILABLE TO EXPLORE</span><span>v.2026</span></div>
              </div>
              <div className="floating-chip chip-code"><FiCode /><span><b>Build</b><small>with purpose</small></span></div>
              <div className="floating-chip chip-ai"><FiCpu /><span><b>Explore</b><small>emerging tech</small></span></div>
              <div className="visual-index">01 — PORTFOLIO / IN PROGRESS</div>
            </motion.div>
          </div>
          <a href="#about" className="scroll-cue"><span className="scroll-line" /> SCROLL TO DISCOVER <FiArrowDownRight /></a>
        </section>

        <section className="intro-strip" id="about">
          <div className="section-wrap intro-inner">
            <span className="eyebrow">A LITTLE ABOUT ME</span>
            <p>I’m building my foundation in software engineering one project at a time — with a growing interest in <span>robotics, automation, AI</span> and the interfaces that make complex technology easier to use.</p>
            <a className="text-link" href="https://github.com/Mahin98250" target="_blank" rel="noreferrer">A look at my GitHub <FiArrowUpRight /></a>
          </div>
        </section>

        <section className="section-wrap capabilities-section" id="capabilities">
          <SectionHeading eyebrow="WHAT I’M EXPLORING" title={<>Skills in progress.<br /><span>Built through practice.</span></>} description="A practical foundation shaped by experimentation, iteration and a willingness to learn." />
          <div className="capability-grid">
            {capabilities.map((item, i) => {
              const Icon = item.icon;
              return <motion.article className="capability-card" key={item.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }} transition={{ delay: i * .08, duration: .45 }}>
                <div className="capability-top"><span className="capability-icon"><Icon /></span><span className="card-number">0{i + 1}</span></div>
                <h3>{item.title}</h3><p>{item.detail}</p>
                <div className="tag-list">{item.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
              </motion.article>;
            })}
          </div>
        </section>

        <section className="projects-section" id="projects">
          <div className="section-wrap">
            <div className="projects-head">
              <SectionHeading eyebrow="SELECTED WORK" title={<>Projects with a<br /><span>purpose to explore.</span></>} description="A selection of experiments and product concepts. Each one is a chance to learn, test ideas and improve." />
              <a className="text-link all-projects" href="https://github.com/Mahin98250?tab=repositories" target="_blank" rel="noreferrer">All repositories <FiArrowUpRight /></a>
            </div>
            <div className="filter-row" role="group" aria-label="Filter projects">
              {filters.map(f => <button key={f} className={'filter-button' + (filter === f ? ' active' : '')} onClick={() => setFilter(f)} aria-pressed={filter === f}>{f}</button>)}
              <span className="project-count">{String(visibleProjects.length).padStart(2, '0')} PROJECTS</span>
            </div>
            <motion.div layout className="project-grid">
              {visibleProjects.map(project => {
                const Icon = project.icon;
                return <motion.article layout key={project.name} className={'project-card accent-' + project.accent} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .3 }}>
                  <div className="project-art">
                    <div className="project-art-grid" />
                    <div className="project-art-top"><span>PROJECT / {project.number}</span><span className="project-art-category">{project.category}</span></div>
                    <div className="project-symbol"><Icon /></div>
                    <span className="project-art-bottom">MAHIN PATEL <span>↗</span></span>
                  </div>
                  <div className="project-content">
                    <div className="project-title-row"><h3>{project.name}</h3><a href={project.href} target="_blank" rel="noreferrer" aria-label={'View ' + project.name + ' repository'} className="project-link"><FiArrowUpRight /></a></div>
                    <p>{project.description}</p>
                    <div className="tag-list">{project.stack.map(tag => <span key={tag}>{tag}</span>)}</div>
                    <a className="project-repo-link" href={project.href} target="_blank" rel="noreferrer">Explore repository <FiExternalLink /></a>
                  </div>
                </motion.article>;
              })}
            </motion.div>
            <p className="projects-note">Project descriptions are concise summaries of the concepts and repositories; feature maturity and live deployments may vary.</p>
          </div>
        </section>

        <section className="journey-section section-wrap" id="journey">
          <div className="journey-intro"><SectionHeading eyebrow="THE JOURNEY" title={<>A long-term mindset.<br /><span>One step at a time.</span></>} description="I’m early in my journey, so I focus on building fundamentals, shipping small projects and learning from what doesn’t work." /></div>
          <div className="journey-list">
            <article className="journey-item"><span className="journey-marker">01</span><div><span className="journey-label">FOUNDATION</span><h3>Learn the fundamentals</h3><p>Strengthen programming, web development, mathematics and problem-solving through consistent practice.</p></div><span className="journey-state">IN PROGRESS</span></article>
            <article className="journey-item"><span className="journey-marker">02</span><div><span className="journey-label">BUILD</span><h3>Turn concepts into projects</h3><p>Make useful tools and prototypes, document decisions and improve based on real testing.</p></div><span className="journey-state">ONGOING</span></article>
            <article className="journey-item"><span className="journey-marker">03</span><div><span className="journey-label">LONG-TERM DIRECTION</span><h3>Robotics, automation and AI</h3><p>Gradually connect software skills with intelligent systems, hardware and automation.</p></div><span className="journey-state">EXPLORING</span></article>
          </div>
        </section>

        <section className="contact-section" id="contact">
          <div className="section-wrap contact-inner">
            <div className="contact-orb" />
            <span className="eyebrow">HAVE AN IDEA?</span>
            <h2>Good things start<br />with a <span>conversation.</span></h2>
            <p>Want to discuss a project, share feedback or connect over technology? I’d be glad to hear from you.</p>
            <div className="contact-actions">
              <a className="button button-primary" href="https://github.com/Mahin98250" target="_blank" rel="noreferrer"><FiGithub /> Connect on GitHub <FiArrowUpRight /></a>
              <a className="button button-secondary" href="https://www.instagram.com/mahin_patel2/" target="_blank" rel="noreferrer"><FiMail /> Instagram <FiArrowUpRight /></a>
            </div>
            <span className="contact-footnote">No invented contact details. Reach out through the profiles linked above.</span>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="section-wrap footer-inner"><a className="brand" href="#home"><span className="brand-mark">M<span>.</span></span><span className="brand-name">MAHIN PATEL</span></a><span>Designed with curiosity. Built through practice.</span><a href="#home" className="back-top">BACK TO TOP ↑</a></div>
        <div className="section-wrap footer-bottom"><span>© {new Date().getFullYear()} Mahin Patel</span><span>SOFTWARE · AI · WHAT’S NEXT</span><a href="https://github.com/Mahin98250" target="_blank" rel="noreferrer">GITHUB <FiArrowUpRight /></a></div>
      </footer>
    </div>
  );
}

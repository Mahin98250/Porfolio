export default function Navbar() {
  return (
    <header className='fixed top-0 left-0 w-full z-50 backdrop-blur-xl border-b border-white/10'>
      <nav className='max-w-7xl mx-auto px-6 py-5 flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-cyan-400'>Mahin.</h1>

        <ul className='hidden md:flex gap-8 text-gray-300'>
          <li><a href='#'>Home</a></li>
          <li><a href='#'>About</a></li>
          <li><a href='#'>Skills</a></li>
          <li><a href='#'>Projects</a></li>
          <li><a href='#'>Contact</a></li>
        </ul>
      </nav>
    </header>
  );
}
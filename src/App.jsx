import Hero from './components/Hero';
import Navbar from './components/Navbar';
import Projects from './components/Projects';
import Skills from './components/Skills';

export default function App() {
  return (
    <main className='bg-black text-white overflow-hidden'>
      <Navbar />
      <Hero />
      <Skills />
      <Projects />
    </main>
  );
}
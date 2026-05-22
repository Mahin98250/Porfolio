import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section className='min-h-screen flex items-center justify-center relative px-6 overflow-hidden'>
      <div className='absolute inset-0 bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100'></div>

      <div className='absolute top-20 left-20 w-72 h-72 bg-cyan-300/40 rounded-full blur-3xl'></div>
      <div className='absolute bottom-20 right-20 w-72 h-72 bg-blue-300/40 rounded-full blur-3xl'></div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className='text-center z-10 max-w-4xl'
      >
        <p className='uppercase tracking-[0.4em] text-sky-500 text-sm mb-6 font-semibold'>
          Premium Developer Portfolio
        </p>

        <h1 className='text-6xl md:text-8xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-600'>
          Mahin Patel
        </h1>

        <h2 className='text-xl md:text-3xl text-slate-700 mb-8 font-medium'>
          Full Stack Developer • AI Explorer
        </h2>

        <p className='text-slate-600 text-lg leading-relaxed mb-10'>
          Building futuristic web experiences with modern design, immersive interfaces, and premium interactions.
        </p>

        <div className='flex justify-center gap-6 flex-wrap'>
          <button className='px-8 py-4 rounded-2xl bg-sky-500 text-white font-semibold shadow-xl shadow-sky-300/50 transition hover:scale-105'>
            View Projects
          </button>

          <button className='px-8 py-4 rounded-2xl border border-sky-400 text-sky-600 bg-white/50 backdrop-blur-xl transition hover:bg-sky-500 hover:text-white'>
            Contact
          </button>
        </div>
      </motion.div>
    </section>
  );
}
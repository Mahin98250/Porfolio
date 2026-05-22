import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section className='min-h-screen flex items-center justify-center relative px-6'>
      <div className='absolute inset-0 opacity-30 blur-3xl bg-gradient-to-b from-cyan-500 via-blue-500 to-purple-500'></div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className='text-center z-10'
      >
        <p className='uppercase tracking-[0.4em] text-cyan-400 text-sm mb-6'>
          Next Generation Portfolio
        </p>

        <h1 className='text-6xl md:text-8xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500'>
          Mahin Patel
        </h1>

        <h2 className='text-xl md:text-3xl text-gray-300 mb-8'>
          Full Stack Developer • AI Explorer
        </h2>

        <div className='flex justify-center gap-6 flex-wrap'>
          <button className='px-8 py-4 rounded-2xl bg-cyan-400 text-black font-semibold transition hover:scale-105'>
            View Projects
          </button>

          <button className='px-8 py-4 rounded-2xl border border-cyan-400 text-cyan-400 transition hover:bg-cyan-400 hover:text-black'>
            Contact
          </button>
        </div>
      </motion.div>
    </section>
  );
}
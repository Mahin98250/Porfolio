export default function Projects() {
  const projects = [
    'AI Chat App',
    '3D Web Experience',
    'Realtime Chat Application',
    'Modern Ecommerce Website'
  ];

  return (
    <section className='py-32 px-6'>
      <div className='max-w-7xl mx-auto'>
        <h2 className='text-5xl font-bold text-center mb-16 text-cyan-400'>Projects</h2>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
          {projects.map((project) => (
            <div
              key={project}
              className='rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl transition duration-500 hover:-translate-y-2'
            >
              <div className='h-64 bg-gradient-to-br from-cyan-500/20 to-purple-500/20'></div>

              <div className='p-8'>
                <h3 className='text-3xl font-semibold mb-4'>{project}</h3>

                <p className='text-gray-400 mb-6'>
                  Futuristic interface with smooth animations and immersive design.
                </p>

                <button className='px-6 py-3 rounded-xl bg-cyan-400 text-black font-semibold'>
                  Open Project
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
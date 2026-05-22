export default function Skills() {
  const skills = [
    'React',
    'Three.js',
    'Tailwind CSS',
    'AI Tools',
    'JavaScript',
    'Framer Motion'
  ];

  return (
    <section className='py-32 px-6'>
      <div className='max-w-6xl mx-auto'>
        <h2 className='text-5xl font-bold text-center mb-16 text-cyan-400'>Skills</h2>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {skills.map((skill) => (
            <div
              key={skill}
              className='p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl hover:border-cyan-400 transition'
            >
              <h3 className='text-2xl font-semibold'>{skill}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
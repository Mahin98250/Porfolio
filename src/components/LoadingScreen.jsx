export default function LoadingScreen() {
  return (
    <div className='fixed inset-0 bg-black flex items-center justify-center'>
      <div className='text-center'>
        <div className='w-20 h-20 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-6'></div>

        <h1 className='text-2xl font-bold text-cyan-400'>Initializing Portfolio</h1>
      </div>
    </div>
  );
}
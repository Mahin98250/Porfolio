import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
      <div className="max-w-xl rounded-[2rem] border border-white/10 bg-slate-900/90 p-10 text-center shadow-soft">
        <div className="text-6xl font-black text-white">404</div>
        <p className="mt-4 text-lg text-slate-300">Page not found.</p>
        <Link
          to="/"
          className="mt-8 inline-flex rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
        >
          Return to home
        </Link>
      </div>
    </div>
  );
}

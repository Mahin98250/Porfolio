import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const roles = [
  { key: 'student', label: 'Student' },
  { key: 'teacher', label: 'Teacher' },
  { key: 'parent', label: 'Parent' },
  { key: 'admin', label: 'Admin' },
];

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'student';
  const [role, setRole] = useState(initialRole);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error, setError } = useAuth();

  useEffect(() => {
    setError(null);
  }, [role, setError]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await login({ loginId, password, role });
  };

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 sm:px-10 lg:px-16">
      <div className="mx-auto flex max-w-4xl flex-col gap-10 rounded-[2rem] border border-white/10 bg-slate-900/90 p-8 shadow-soft">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold">Welcome back to Learner’s Guide</h1>
          <p className="max-w-xl text-slate-300">
            Login with your role to access attendance, homework, schedules and school administration.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <form onSubmit={handleSubmit} className="space-y-6 rounded-[1.75rem] bg-slate-950/80 p-8 shadow-soft ring-1 ring-white/10">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">Role</label>
              <select
                value={role}
                onChange={(event) => setRole(event.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-primary"
              >
                {roles.map((item) => (
                  <option key={item.key} value={item.key}>{item.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">Email or phone</label>
              <input
                value={loginId}
                onChange={(event) => setLoginId(event.target.value)}
                placeholder="Enter your email or phone"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-primary"
              />
            </div>
            {error && <div className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
            <p className="text-sm text-slate-400">
              Need an account?{' '}
              <Link to="/signup" className="text-white underline decoration-primary/50 hover:text-primary">
                Create one now.
              </Link>
            </p>
          </form>
          <div className="rounded-[1.75rem] bg-slate-950/80 p-8 shadow-soft ring-1 ring-white/10">
            <h2 className="text-xl font-semibold text-white">Quick login examples</h2>
            <p className="mt-3 text-sm text-slate-400">
              Use the seeded admin account or your own Supabase users for full access.
            </p>
            <div className="mt-5 space-y-4 text-sm text-slate-300">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="font-semibold text-white">Admin</div>
                <div className="mt-2 text-slate-400">Email: admin@lg.app</div>
                <div className="text-slate-400">Password: SapanRohera82</div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="font-semibold text-white">Student / Teacher / Parent</div>
                <div className="mt-2 text-slate-400">Create a free role-based account from signup</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

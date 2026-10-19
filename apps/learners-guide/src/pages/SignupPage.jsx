import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createUserAccount } from '../services/db';

const roles = [
  { key: 'student', label: 'Student' },
  { key: 'teacher', label: 'Teacher' },
  { key: 'parent', label: 'Parent' },
];

export default function SignupPage() {
  const [role, setRole] = useState('student');
  const [name, setName] = useState('');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { setError: clearAuthError } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    if (!name || !loginId || !password || !confirm) {
      setError('Fill all fields.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    try {
      const newUser = {
        id: `u${Date.now()}`,
        name,
        role,
        pass: password,
        email: role === 'student' ? `${loginId}@student.lg` : `${loginId}@lg.app`,
        phone: loginId,
        status: 'active',
      };
      await createUserAccount(newUser);
      setSuccess('Account created successfully. You can now sign in.');
      clearAuthError(null);
    } catch (err) {
      setError(err.message || 'Signup failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 sm:px-10 lg:px-16">
      <div className="mx-auto flex max-w-4xl flex-col gap-10 rounded-[2rem] border border-white/10 bg-slate-900/90 p-8 shadow-soft">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold">Create your Learner’s Guide account</h1>
          <p className="max-w-xl text-slate-300">
            Sign up for a student, teacher or parent account and begin using the dashboard instantly.
          </p>
        </div>
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
          <div className="grid gap-6 lg:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-300">
              Name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your full name"
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-primary"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-300">
              Email or phone
              <input
                value={loginId}
                onChange={(event) => setLoginId(event.target.value)}
                placeholder="Email or phone"
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-primary"
              />
            </label>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-300">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-primary"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-300">
              Confirm password
              <input
                type="password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                placeholder="Repeat password"
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-primary"
              />
            </label>
          </div>
          {error && <div className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>}
          {success && <div className="rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{success}</div>}
          <button
            type="submit"
            className="w-full rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            Create account
          </button>
          <p className="text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-white underline decoration-primary/50 hover:text-primary">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';

const roles = [
  { key: 'student', label: 'Student', description: 'View classes, homework, attendance, marks and announcements.' },
  { key: 'teacher', label: 'Teacher', description: 'Manage lessons, attendance, homework and class updates.' },
  { key: 'parent', label: 'Parent', description: 'Track your child’s progress with attendance, fees and reports.' },
  { key: 'admin', label: 'Admin', description: 'Control users, schedules, materials and school operations.' },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-800 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-10 lg:px-12">
        <section className="mb-12 flex flex-1 flex-col justify-center gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-slate-100 ring-1 ring-white/10">
              Learner’s Guide platform — education in one place
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl xl:text-6xl">
              A modern school dashboard built for learners, teachers, parents and admins.
            </h1>
            <p className="max-w-xl text-lg text-slate-200 sm:text-xl">
              Log in with your role to access assignments, attendance, fees, schedules and announcements. Built with React, Vite, Tailwind and Supabase.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/login"
                className="rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-indigo-500"
              >
                Login to your account
              </Link>
              <Link
                to="/signup"
                className="rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Create free account
              </Link>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:max-w-xl">
            {roles.map((role) => (
              <div key={role.key} className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{role.label}</div>
                <p className="mt-4 text-sm leading-6 text-slate-200">{role.description}</p>
                <Link
                  to={`/login?role=${role.key}`}
                  className="mt-6 inline-flex items-center rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  Continue
                </Link>
              </div>
            ))}
          </div>
        </section>
        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-[2rem] bg-slate-900/70 p-8 shadow-soft ring-1 ring-white/10">
            <h2 className="text-xl font-semibold text-white">All-in-one learner ecosystem</h2>
            <p className="mt-4 text-slate-300">
              Keep academic operations connected with dashboards for attendance, homework, exams, fees and announcements.
            </p>
          </div>
          <div className="rounded-[2rem] bg-white/5 p-8 shadow-soft ring-1 ring-white/10">
            <h2 className="text-xl font-semibold text-white">Easy Supabase integration</h2>
            <p className="mt-4 text-slate-300">
              Store your data in Supabase with centralized credentials, and fall back to local cache during development.
            </p>
          </div>
          <div className="rounded-[2rem] bg-white/5 p-8 shadow-soft ring-1 ring-white/10">
            <h2 className="text-xl font-semibold text-white">Production-ready tooling</h2>
            <p className="mt-4 text-slate-300">
              Vite, React Router and Tailwind CSS give a fast, responsive interface for desktop and mobile.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

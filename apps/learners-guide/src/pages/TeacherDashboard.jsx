import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { gdb } from '../services/db';

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const hw = await gdb('homework').catch(() => []);
      const tt = await gdb('timetable').catch(() => []);
      setAssignments(hw.slice(0, 5));
      setClasses(tt.slice(0, 5));
    };
    fetch();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8 text-slate-900 sm:px-10 lg:px-14">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-4 rounded-[2rem] bg-white p-8 shadow-soft">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-primary">Teacher dashboard</p>
              <h1 className="mt-3 text-3xl font-bold">Hello, {user?.name || 'Teacher'}.</h1>
            </div>
            <button
              onClick={logout}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
          <p className="max-w-2xl text-slate-600">
            Review your current homework assignments and timetable, then manage communications with students and parents.
          </p>
        </header>
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200/50">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Latest homework</p>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{assignments.length}</span>
            </div>
            {assignments.length ? (
              <ul className="mt-4 space-y-3">
                {assignments.map((item) => (
                  <li key={item.id} className="rounded-3xl border border-slate-200/80 p-4">
                    <div className="font-semibold text-slate-900">{item.subject || 'General'}</div>
                    <p className="mt-2 text-sm text-slate-600">{item.desc || 'No description'}</p>
                    <div className="mt-3 text-xs text-slate-500">Due {item.due || 'TBD'}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-4 rounded-3xl bg-slate-50 p-4 text-sm text-slate-500">No homework posted yet.</div>
            )}
          </div>
          <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200/50">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Upcoming timetable</p>
              <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">{classes.length}</span>
            </div>
            {classes.length ? (
              <ul className="mt-4 space-y-3">
                {classes.map((item) => (
                  <li key={item.id} className="rounded-3xl border border-slate-200/80 p-4">
                    <div className="font-semibold text-slate-900">{item.subject || 'Class'}</div>
                    <p className="mt-2 text-sm text-slate-600">{item.day || 'Day'} · {item.slot || 'Slot'} · {item.cls || 'Class'}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-4 rounded-3xl bg-slate-50 p-4 text-sm text-slate-500">Your schedule will appear here.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

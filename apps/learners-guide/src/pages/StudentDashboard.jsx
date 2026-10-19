import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { gdb } from '../services/db';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [homework, setHomework] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [marks, setMarks] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const hw = await gdb('homework').catch(() => []);
      const att = await gdb('attendance').catch(() => []);
      const mk = await gdb('marks').catch(() => []);
      setHomework(hw.slice(0, 5));
      setAttendance(att.slice(0, 5));
      setMarks(mk.slice(0, 5));
    };
    fetch();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8 text-slate-900 sm:px-10 lg:px-14">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-4 rounded-[2rem] bg-white p-8 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-primary">Student dashboard</p>
              <h1 className="mt-3 text-3xl font-bold">Welcome back, {user?.name || 'Learner'}.</h1>
            </div>
            <button
              onClick={logout}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
          <p className="max-w-2xl text-slate-600">
            Your personal dashboard includes attendance history, recently assigned homework, marks, and the latest announcements.
          </p>
        </header>
        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200/50">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Latest homework</p>
            {homework.length ? (
              <ul className="mt-4 space-y-3">
                {homework.map((item) => (
                  <li key={item.id} className="rounded-3xl border border-slate-200/80 p-4">
                    <div className="font-semibold text-slate-900">{item.subject || 'General'}</div>
                    <p className="mt-2 text-sm text-slate-600">{item.desc || 'No description provided.'}</p>
                    <div className="mt-3 text-xs text-slate-500">Due {item.due || 'TBD'}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-4 rounded-3xl bg-slate-50 p-4 text-sm text-slate-500">No homework assigned yet.</div>
            )}
          </div>
          <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200/50">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Recent attendance</p>
            {attendance.length ? (
              <ul className="mt-4 space-y-3">
                {attendance.map((item) => (
                  <li key={item.id} className="rounded-3xl border border-slate-200/80 p-4">
                    <div className="font-semibold text-slate-900">{item.date || 'Unknown date'}</div>
                    <p className="mt-2 text-sm text-slate-600">Status: {item.status || 'unknown'}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-4 rounded-3xl bg-slate-50 p-4 text-sm text-slate-500">Attendance records will appear here.</div>
            )}
          </div>
          <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200/50">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Recent marks</p>
            {marks.length ? (
              <ul className="mt-4 space-y-3">
                {marks.map((item) => (
                  <li key={item.id} className="rounded-3xl border border-slate-200/80 p-4">
                    <div className="font-semibold text-slate-900">{item.subject || 'Subject'}</div>
                    <p className="mt-2 text-sm text-slate-600">Score: {item.marks ?? 'N/A'} / {item.total ?? 'N/A'}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-4 rounded-3xl bg-slate-50 p-4 text-sm text-slate-500">Marks will appear once teachers add them.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

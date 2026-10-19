import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getTableCounts } from '../services/db';

const summaryOrder = [
  { key: 'students', label: 'Students' },
  { key: 'teachers', label: 'Teachers' },
  { key: 'attendance', label: 'Attendance entries' },
  { key: 'homework', label: 'Homework items' },
  { key: 'announcements', label: 'Announcements' },
  { key: 'fees', label: 'Fee records' },
  { key: 'marks', label: 'Marks records' },
  { key: 'materials', label: 'Materials' },
  { key: 'batches', label: 'Batches' },
  { key: 'timetable', label: 'Timetable slots' },
  { key: 'examschedule', label: 'Exam schedule' },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [counts, setCounts] = useState({});

  useEffect(() => {
    getTableCounts().then(setCounts).catch(() => setCounts({}));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8 text-slate-900 sm:px-10 lg:px-14">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-4 rounded-[2rem] bg-white p-8 shadow-soft">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-primary">Admin dashboard</p>
              <h1 className="mt-3 text-3xl font-bold">Admin portal — {user?.name || 'Manager'}</h1>
            </div>
            <button
              onClick={logout}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
          <p className="max-w-2xl text-slate-600">
            Manage the school platform, review counts and ensure the database tables are ready for live students.
          </p>
        </header>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {summaryOrder.map((item) => (
            <div key={item.key} className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200/50">
              <div className="text-sm uppercase tracking-[0.18em] text-slate-500">{item.label}</div>
              <div className="mt-4 text-4xl font-bold text-slate-900">{counts[item.key] ?? 0}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

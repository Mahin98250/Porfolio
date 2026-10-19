import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { gdb } from '../services/db';

export default function ParentDashboard() {
  const { user, logout } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [fees, setFees] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const ann = await gdb('announcements').catch(() => []);
      const fs = await gdb('fees').catch(() => []);
      setAnnouncements(ann.slice(0, 4));
      setFees(fs.slice(0, 4));
    };
    fetch();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8 text-slate-900 sm:px-10 lg:px-14">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-4 rounded-[2rem] bg-white p-8 shadow-soft">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-primary">Parent dashboard</p>
              <h1 className="mt-3 text-3xl font-bold">Hi, {user?.name || 'Parent'}.</h1>
            </div>
            <button
              onClick={logout}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
          <p className="max-w-2xl text-slate-600">
            Monitor your child’s announcements and fee status in one place.
          </p>
        </header>
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200/50">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Latest announcements</p>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{announcements.length}</span>
            </div>
            {announcements.length ? (
              <ul className="mt-4 space-y-3">
                {announcements.map((item) => (
                  <li key={item.id} className="rounded-3xl border border-slate-200/80 p-4">
                    <div className="font-semibold text-slate-900">{item.title || 'Announcement'}</div>
                    <p className="mt-2 text-sm text-slate-600">{item.desc || 'No details provided.'}</p>
                    <div className="mt-3 text-xs text-slate-500">{item.date || 'Today'}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-4 rounded-3xl bg-slate-50 p-4 text-sm text-slate-500">No announcements available yet.</div>
            )}
          </div>
          <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200/50">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Fee status</p>
              <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">{fees.length}</span>
            </div>
            {fees.length ? (
              <ul className="mt-4 space-y-3">
                {fees.map((fee) => (
                  <li key={fee.id} className="rounded-3xl border border-slate-200/80 p-4">
                    <div className="font-semibold text-slate-900">{fee.description || 'School fee'}</div>
                    <p className="mt-2 text-sm text-slate-600">Amount: ₹{fee.amount || '0'}</p>
                    <div className="mt-3 text-xs text-slate-500">Due {fee.due || 'TBD'} · {fee.status || 'pending'}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-4 rounded-3xl bg-slate-50 p-4 text-sm text-slate-500">No fee data found for your child.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

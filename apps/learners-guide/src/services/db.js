import { hasSupabase } from './supabase';

const LS_PREFIX = 'lg_';
const lsKey = (table) => `${LS_PREFIX}${table}`;
const lsGet = (table) => {
  try {
    return JSON.parse(localStorage.getItem(lsKey(table)) || '[]');
  } catch {
    return [];
  }
};
const lsSet = (table, value) => localStorage.setItem(lsKey(table), JSON.stringify(value));

const apiUrl = import.meta.env.VITE_SUPABASE_URL || '';
const apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const sbQuery = async (path, opts = {}) => {
  if (!hasSupabase) throw new Error('Supabase configuration is not set');

  const method = opts.method || 'GET';
  const prefer = opts.prefer !== undefined ? opts.prefer : 'return=representation';
  const headers = {
    apikey: apiKey,
    Authorization: `Bearer ${apiKey}`,
  };
  if (prefer) headers.Prefer = prefer;
  if (method !== 'GET' && method !== 'DELETE') headers['Content-Type'] = 'application/json';

  const response = await fetch(`${apiUrl}/rest/v1/${path}`, {
    method,
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase error ${response.status}: ${text}`);
  }

  const content = await response.text();
  return content ? JSON.parse(content) : [];
};

export const gdb = async (table, filter = '') => {
  if (!hasSupabase) return lsGet(table);
  try {
    const data = await sbQuery(`${table}?order=created_at.asc${filter ? `&${filter}` : ''}`);
    if (Array.isArray(data)) {
      lsSet(table, data);
      return data;
    }
    return lsGet(table);
  } catch (error) {
    console.warn(`gdb fallback [${table}]:`, error.message);
    return lsGet(table);
  }
};

export const addR = async (table, row) => {
  const fallback = { ...row, id: row?.id || `id_${Date.now()}` };
  const upsertLocal = (value) => {
    const current = lsGet(table);
    const index = current.findIndex((item) => item?.id === value.id);
    if (index === -1) current.push(value);
    else current[index] = { ...current[index], ...value };
    lsSet(table, current);
  };

  if (!hasSupabase) {
    upsertLocal(fallback);
    return fallback;
  }

  try {
    const saved = await sbQuery(table, { method: 'POST', body: row });
    const result = Array.isArray(saved) ? saved[0] : saved;
    const final = result?.id ? result : fallback;
    upsertLocal(final);
    return final;
  } catch (error) {
    console.warn(`addR fallback [${table}]:`, error.message);
    upsertLocal(fallback);
    return fallback;
  }
};

export const updR = async (table, id, payload) => {
  if (!hasSupabase) {
    lsSet(table, lsGet(table).map((item) => (item.id === id ? { ...item, ...payload } : item)));
    return;
  }
  try {
    await sbQuery(`${table}?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: payload,
    });
  } catch (error) {
    console.warn(`updR [${table}]:`, error.message);
  }
  lsSet(table, lsGet(table).map((item) => (item.id === id ? { ...item, ...payload } : item)));
};

export const delR = async (table, id) => {
  if (!hasSupabase) {
    lsSet(table, lsGet(table).filter((item) => item.id !== id));
    return;
  }
  try {
    await sbQuery(`${table}?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE', prefer: '' });
  } catch (error) {
    console.warn(`delR [${table}]:`, error.message);
  }
  lsSet(table, lsGet(table).filter((item) => item.id !== id));
};

const defaultUser = {
  id: 'u0',
  name: 'Admin',
  phone: '9265628247',
  email: 'admin@lg.app',
  pass: 'SapanRohera82',
  role: 'admin',
  status: 'active',
};

const SEED = {
  users: [defaultUser],
  students: [],
  teachers: [],
  attendance: [],
  homework: [],
  materials: [],
  announcements: [],
  fees: [],
  marks: [],
  messages: [],
  notifications: [],
  batches: [],
  timetable: [],
  examschedule: [],
};

const saveSession = (user) => localStorage.setItem('session_user', JSON.stringify(user));
export const getSession = () => {
  try {
    return JSON.parse(localStorage.getItem('session_user')) || null;
  } catch {
    return null;
  }
};
export const clearSession = () => localStorage.removeItem('session_user');

export const loginUser = async (loginId, password, role) => {
  const trimmedId = loginId?.trim();
  const trimmedPass = password?.trim();
  if (!trimmedId || !trimmedPass || !role) return null;

  const query = `users?role=eq.${encodeURIComponent(role)}&pass=eq.${encodeURIComponent(trimmedPass)}&or=(phone.eq.${encodeURIComponent(trimmedId)},email.eq.${encodeURIComponent(trimmedId)})&limit=1`;

  try {
    const rows = await sbQuery(query);
    if (Array.isArray(rows) && rows.length > 0) {
      saveSession(rows[0]);
      return rows[0];
    }
  } catch (error) {
    console.warn('loginUser supabase failed, falling back to cache:', error.message);
  }

  const cached = lsGet('users');
  const user = cached.find(
    (item) =>
      item.role === role &&
      item.pass === trimmedPass &&
      (item.phone === trimmedId || item.email === trimmedId)
  );
  if (user) {
    saveSession(user);
    return user;
  }
  return null;
};

export const createUserAccount = async (user) => {
  const existing = lsGet('users').find((item) => item.email === user.email || item.phone === user.phone);
  if (existing) throw new Error('Account already exists');
  const record = { ...user, id: `u${Date.now()}` };
  await addR('users', record);
  saveSession(record);
  return record;
};

export const initDB = async () => {
  if (!localStorage.getItem('lg_initialized')) {
    Object.entries(SEED).forEach(([table, rows]) => {
      if (lsGet(table).length === 0) lsSet(table, rows);
    });
    localStorage.setItem('lg_initialized', '1');
  }
  if (hasSupabase) {
    try {
      for (const [table, rows] of Object.entries(SEED)) {
        const existing = await sbQuery(`${table}?limit=1`).catch(() => []);
        if (Array.isArray(existing) && existing.length === 0) {
          for (const row of rows) {
            await sbQuery(table, { method: 'POST', body: row }).catch(() => {});
          }
        }
      }
    } catch (error) {
      console.warn('Supabase initialization failed:', error.message);
    }
  }
};

export const getTableCounts = async () => {
  const tables = ['students', 'teachers', 'attendance', 'homework', 'materials', 'announcements', 'fees', 'marks', 'messages', 'notifications', 'batches', 'timetable', 'examschedule'];
  const counts = {};
  await Promise.all(
    tables.map(async (table) => {
      const items = await gdb(table).catch(() => []);
      counts[table] = items.length;
    })
  );
  return counts;
};

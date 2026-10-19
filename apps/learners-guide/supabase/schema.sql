-- Learner's Guide Supabase schema

create extension if not exists pgcrypto;

create table if not exists users (
  id text primary key,
  name text not null,
  role text not null,
  email text,
  phone text,
  pass text not null,
  ref text,
  status text default 'active',
  created_at timestamptz default timezone('utc', now())
);
create index if not exists idx_users_role on users(role);
create index if not exists idx_users_email on users(email);
create index if not exists idx_users_phone on users(phone);

create table if not exists students (
  id text primary key,
  sid text unique,
  name text not null,
  cls text,
  sec text,
  parent_phone text,
  created_at timestamptz default timezone('utc', now())
);
create index if not exists idx_students_cls on students(cls);
create index if not exists idx_students_parent_phone on students(parent_phone);

create table if not exists teachers (
  id text primary key,
  name text not null,
  phone text,
  email text,
  subject text,
  status text default 'active',
  created_at timestamptz default timezone('utc', now())
);
create index if not exists idx_teachers_subject on teachers(subject);
create index if not exists idx_teachers_email on teachers(email);

create table if not exists attendance (
  id text primary key,
  student_id text references students(id) on delete set null,
  date date,
  status text,
  remarks text,
  created_at timestamptz default timezone('utc', now())
);
create index if not exists idx_attendance_student on attendance(student_id);
create index if not exists idx_attendance_date on attendance(date);

create table if not exists homework (
  id text primary key,
  title text,
  description text,
  subject text,
  cls text,
  sec text,
  due date,
  pdf_url text,
  created_at timestamptz default timezone('utc', now())
);
create index if not exists idx_homework_class on homework(cls, sec);
create index if not exists idx_homework_due on homework(due);

create table if not exists materials (
  id text primary key,
  title text,
  subject text,
  cls text,
  sec text,
  url text,
  created_at timestamptz default timezone('utc', now())
);
create index if not exists idx_materials_class on materials(cls, sec);

create table if not exists announcements (
  id text primary key,
  title text,
  description text,
  target text default 'all',
  date date,
  created_at timestamptz default timezone('utc', now())
);
create index if not exists idx_announcements_target on announcements(target);

create table if not exists fees (
  id text primary key,
  student_id text references students(id) on delete set null,
  description text,
  amount numeric,
  due date,
  status text default 'pending',
  created_at timestamptz default timezone('utc', now())
);
create index if not exists idx_fees_student on fees(student_id);
create index if not exists idx_fees_status on fees(status);

create table if not exists marks (
  id text primary key,
  student_id text references students(id) on delete set null,
  subject text,
  exam text,
  marks numeric,
  total numeric,
  created_at timestamptz default timezone('utc', now())
);
create index if not exists idx_marks_student on marks(student_id);
create index if not exists idx_marks_subject on marks(subject);

create table if not exists messages (
  id text primary key,
  from_user text references users(id) on delete set null,
  to_user text references users(id) on delete set null,
  subject text,
  body text,
  read boolean default false,
  created_at timestamptz default timezone('utc', now())
);
create index if not exists idx_messages_from on messages(from_user);
create index if not exists idx_messages_to on messages(to_user);

create table if not exists notifications (
  id text primary key,
  user_id text references users(id) on delete set null,
  content text,
  category text,
  is_read boolean default false,
  created_at timestamptz default timezone('utc', now())
);
create index if not exists idx_notifications_user on notifications(user_id);

create table if not exists batches (
  id text primary key,
  name text,
  cls text,
  sec text,
  teacher_id text references teachers(id) on delete set null,
  created_at timestamptz default timezone('utc', now())
);
create index if not exists idx_batches_class on batches(cls, sec);

create table if not exists timetable (
  id text primary key,
  batch_id text references batches(id) on delete set null,
  day text,
  slot text,
  subject text,
  teacher_id text references teachers(id) on delete set null,
  cls text,
  sec text,
  created_at timestamptz default timezone('utc', now())
);
create index if not exists idx_timetable_batch on timetable(batch_id);
create index if not exists idx_timetable_day on timetable(day);

create table if not exists examschedule (
  id text primary key,
  cls text,
  sec text,
  subject text,
  exam text,
  date date,
  total_marks numeric,
  created_at timestamptz default timezone('utc', now())
);
create index if not exists idx_examschedule_class on examschedule(cls, sec);

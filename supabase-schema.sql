create table if not exists public.barbers (
  id text primary key,
  name text not null,
  specialty text not null default '',
  description text not null default '',
  photo text,
  whatsapp text,
  active boolean not null default true
);

create table if not exists public.services (
  id text primary key,
  name text not null,
  description text not null default '',
  price numeric(10,2) not null default 0,
  "durationMinutes" integer not null default 30,
  active boolean not null default true
);

create table if not exists public.appointments (
  id text primary key,
  "clientName" text not null,
  "clientPhone" text not null,
  "clientEmail" text,
  "ownerUserId" text,
  "ownerEmail" text,
  observation text,
  "serviceId" text not null,
  "serviceName" text not null,
  "servicePrice" numeric(10,2) not null default 0,
  "barberId" text not null,
  "barberName" text not null,
  date text not null,
  time text not null,
  status text not null,
  "lgpdConsent" boolean not null default false,
  "consentTimestamp" text,
  "consentVersion" text,
  "consentOrigin" text,
  "createdAt" text not null,
  "sessionId" text
);

create table if not exists public.schedule (
  day_key text primary key,
  open boolean not null default false,
  open_time text not null,
  close_time text not null
);

create table if not exists public.holidays (
  id text primary key,
  date text not null,
  name text not null,
  type text not null,
  "openTime" text,
  "closeTime" text
);

create table if not exists public.blocked_slots (
  id text primary key,
  "barberId" text not null,
  date text not null,
  time text not null,
  reason text
);

create table if not exists public.config (
  id text primary key,
  name text not null,
  tagline text not null,
  address text not null,
  whatsapp text not null,
  instagram text,
  "scheduleText" text not null,
  "heroText" text not null,
  "whatsappButtonText" text not null,
  "intervalMinutes" integer not null default 60
);

begin;
create table public.rsvps (
 id bigint generated always as identity primary key,
 visitor_id text not null unique check (visitor_id ~ '^[a-f0-9]{64}$'),
 name text not null check (char_length(btrim(name)) between 1 and 30 and name !~ '[[:cntrl:]]'),
 attendee_count integer not null check (attendee_count between 1 and 10),
 meal boolean not null,
 created_at timestamptz not null default now()
);
create table public.guestbook (
 id bigint generated always as identity primary key,
 visitor_id text not null unique check (visitor_id ~ '^[a-f0-9]{64}$'),
 name text not null check (char_length(btrim(name)) between 1 and 30 and name !~ '[[:cntrl:]]'),
 message text not null check (char_length(btrim(message)) between 1 and 100 and message !~ '[[:cntrl:]]'),
 created_at timestamptz not null default now()
);
create index guestbook_recent on public.guestbook(created_at desc,id desc);
alter table public.rsvps enable row level security;
alter table public.guestbook enable row level security;
revoke all on public.rsvps,public.guestbook from anon,authenticated;
revoke all on sequence public.rsvps_id_seq,public.guestbook_id_seq from anon,authenticated;
grant all on public.rsvps,public.guestbook to service_role;
grant usage,select on sequence public.rsvps_id_seq,public.guestbook_id_seq to service_role;
comment on table public.rsvps is 'Private attendance replies. Access through the Vercel write-only API.';
comment on table public.guestbook is 'Guest messages. Only the latest 20 names/messages/dates are exposed by the Vercel API.';
commit;

create table if not exists calendar_feed (
  token text primary key,
  user_id text not null unique,
  body text not null,
  updated_at timestamptz not null default current_timestamp
);

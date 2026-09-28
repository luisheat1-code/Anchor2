create table if not exists shared_quiz (
  id text primary key,
  code text not null unique,
  title text not null,
  owner_id text not null,
  created_at timestamptz not null default current_timestamp
);

create table if not exists shared_quiz_question (
  id text primary key,
  quiz_id text not null references shared_quiz (id) on delete cascade,
  position integer not null,
  prompt text not null,
  choices text not null,
  answer integer not null
);

create table if not exists shared_quiz_member (
  quiz_id text not null references shared_quiz (id) on delete cascade,
  user_id text not null,
  name text not null,
  score integer,
  submitted_at timestamptz,
  primary key (quiz_id, user_id)
);

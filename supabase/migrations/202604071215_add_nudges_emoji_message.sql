alter table public.nudges
  add column if not exists emoji text,
  add column if not exists message text;

alter table public.nudges
  alter column emoji set default '📣';

update public.nudges
set
  emoji = coalesce(emoji, '📣'),
  message = coalesce(message, '')
where emoji is null or message is null;

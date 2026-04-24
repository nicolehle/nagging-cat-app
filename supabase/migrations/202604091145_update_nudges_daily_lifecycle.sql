do $$
begin
  if exists (select 1 from pg_type where typname = 'nudge_status') and not exists (
    select 1
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'nudge_status'
      and e.enumlabel = 'expired'
  ) then
    alter type public.nudge_status add value 'expired';
  end if;

  if exists (select 1 from pg_type where typname = 'nudge_status') and not exists (
    select 1
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'nudge_status'
      and e.enumlabel = 'dismissed'
  ) then
    alter type public.nudge_status add value 'dismissed';
  end if;
end $$;

create or replace function public.nudges_set_timers()
returns trigger
language plpgsql
as $$
declare
  base_time timestamptz;
  reference_time timestamptz;
  expiry_checkpoint timestamptz;
  checkpoint_day timestamptz;
  soft_checkpoint timestamptz;
  final_checkpoint timestamptz;
begin
  base_time := coalesce(new.created_at, now());
  reference_time := case when tg_op = 'INSERT' then base_time else now() end;

  if new.expires_at is null then
    checkpoint_day := date_trunc('day', base_time);
    expiry_checkpoint := checkpoint_day + interval '22 hours';

    if base_time >= expiry_checkpoint then
      expiry_checkpoint := expiry_checkpoint + interval '1 day';
    end if;

    new.expires_at := expiry_checkpoint;
  else
    expiry_checkpoint := new.expires_at;
  end if;

  checkpoint_day := date_trunc('day', expiry_checkpoint);
  soft_checkpoint := checkpoint_day + interval '20 hours';
  final_checkpoint := checkpoint_day + interval '21 hours 30 minutes';

  new.escalation_level := coalesce(new.escalation_level, 0);

  if new.status::text in ('done', 'dismissed', 'expired') then
    new.remind_at := null;
    new.next_escalate_at := null;
    return new;
  end if;

  if reference_time >= expiry_checkpoint then
    new.status := 'expired';
    new.escalation_level := greatest(new.escalation_level, 2);
    new.last_event := coalesce(new.last_event, 'expired');
    new.last_event_at := coalesce(new.last_event_at, reference_time);
    new.remind_at := null;
    new.next_escalate_at := null;
    return new;
  end if;

  if tg_op = 'INSERT' then
    if reference_time >= final_checkpoint then
      new.escalation_level := greatest(new.escalation_level, 2);
    elsif reference_time >= soft_checkpoint then
      new.escalation_level := greatest(new.escalation_level, 1);
    end if;
  end if;

  if new.escalation_level >= 2 then
    new.remind_at := null;
    new.next_escalate_at := null;
  elsif new.escalation_level >= 1 then
    new.next_escalate_at := case
      when reference_time < final_checkpoint then final_checkpoint
      else null
    end;
    new.remind_at := new.next_escalate_at;
  else
    new.next_escalate_at := case
      when reference_time < soft_checkpoint then soft_checkpoint
      when reference_time < final_checkpoint then final_checkpoint
      else null
    end;
    new.remind_at := new.next_escalate_at;
  end if;

  return new;
end;
$$;

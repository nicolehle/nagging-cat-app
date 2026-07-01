drop policy if exists "pairs_select_member" on public.pairs;

create policy "pairs_select_member_or_pending_invite"
on public.pairs
for select
to authenticated
using (
  user_a_id = auth.uid()
  or user_b_id = auth.uid()
  or (
    invite_code is not null
    and (
      (user_a_id is not null and user_b_id is null)
      or (user_a_id is null and user_b_id is not null)
    )
  )
);

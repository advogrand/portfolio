grant usage on schema public to anon, authenticated;
grant select on public.portfolio_projects, public.portfolio_contacts, public.portfolio_about to anon, authenticated;
grant insert, update, delete on public.portfolio_projects, public.portfolio_contacts, public.portfolio_about to authenticated;
grant execute on function public.is_portfolio_admin() to authenticated;
grant execute on function public.claim_portfolio_admin() to authenticated;

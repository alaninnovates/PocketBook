drop policy "Enable users to view their own data only" on "public"."ensemble_memberships";

drop policy "Enable users to view their own data only" on "public"."profiles";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.is_ensemble_admin(p_user_id uuid, p_ensemble_id bigint)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET row_security TO 'off'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.ensemble_memberships
    WHERE user_id = p_user_id
      AND ensemble_id = p_ensemble_id
      AND role = 'admin'
  );
$function$
;


  create policy "Enable users to view their own data only or if admin"
  on "public"."ensemble_memberships"
  as permissive
  for select
  to authenticated
using (((( SELECT auth.uid() AS uid) = user_id) OR public.is_ensemble_admin(auth.uid(), ensemble_id)));



  create policy "Ensemble admins can update member role"
  on "public"."ensemble_memberships"
  as permissive
  for update
  to public
using (public.is_ensemble_admin(auth.uid(), ensemble_id));



  create policy "Enable users to view their own data only"
  on "public"."profiles"
  as permissive
  for select
  to authenticated
using (true);




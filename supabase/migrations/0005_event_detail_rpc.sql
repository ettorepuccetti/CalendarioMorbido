-- Returns event data, saved status, and admin flag in a single round-trip.
-- SECURITY INVOKER so events RLS applies (public SELECT); is_admin() is SECURITY DEFINER internally.
CREATE OR REPLACE FUNCTION get_event_detail(p_event_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
AS $$
DECLARE
  v_event jsonb;
BEGIN
  SELECT to_jsonb(e) INTO v_event FROM public.events e WHERE e.id = p_event_id;

  IF v_event IS NULL THEN
    RETURN NULL;
  END IF;

  RETURN jsonb_build_object(
    'event',    v_event,
    'saved',    EXISTS(SELECT 1 FROM public.saved_events WHERE event_id = p_event_id AND user_id = auth.uid()),
    'is_admin', public.is_admin()
  );
END;
$$;

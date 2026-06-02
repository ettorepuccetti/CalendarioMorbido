import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import EventCalendar from "@/components/events/EventCalendar";
import EventFilters from "@/components/events/EventFilters";
import { isSingleDay } from "@/lib/utils/dates";
import type { EventRow } from "@/lib/types/db";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{
    region?: string;
    duration?: string;
    type?: string;
  }>;
}) {
  const { region, duration, type } = await searchParams;
  const t = await getTranslations("home");
  const supabase = await createClient();

  let query = supabase
    .from("events")
    .select("*")
    .order("start_date", { ascending: true });

  if (region) query = query.eq("region", region);
  if (type) query = query.eq("event_type", type);

  const { data, error } = await query;
  let events = (data ?? []) as EventRow[];

  // Filtro durata applicato lato server (dataset piccolo).
  if (duration === "single") {
    events = events.filter((e) => isSingleDay(e.start_date, e.end_date));
  } else if (duration === "multi") {
    events = events.filter((e) => !isSingleDay(e.start_date, e.end_date));
  }

  // Eventi già salvati dall'utente loggato → contrassegnati nel calendario.
  let savedIds: string[] = [];
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data: savedData } = await supabase
      .from("saved_events")
      .select("event_id")
      .eq("user_id", user.id);
    savedIds = (savedData ?? []).map((r) => r.event_id as string);
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-head text-4xl font-bold leading-none">
          {t("title")}
        </h1>
        <p className="font-body text-ink-soft">{t("subtitle")}</p>
      </div>

      <EventFilters />

      {error ? (
        <p className="card p-4 font-body text-red-700">
          {t("loadError", { message: error.message })}
        </p>
      ) : (
        <EventCalendar events={events} savedIds={savedIds} />
      )}
    </div>
  );
}

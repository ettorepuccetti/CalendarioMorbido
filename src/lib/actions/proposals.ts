"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { REGIONS, type Region } from "@/lib/constants/regions";
import { EVENT_TYPES, type EventType } from "@/lib/constants/event-types";
import { readEventContent } from "@/lib/actions/event-fields";

export async function submitProposal(_prev: unknown, formData: FormData) {
  const supabase = await createClient();
  const t = await getTranslations("errors");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: t("loginRequired") };

  const content = readEventContent(formData);

  if (!REGIONS.includes(content.region as Region))
    return { error: t("invalidRegion") };
  if (!content.event_type || !EVENT_TYPES.includes(content.event_type as EventType))
    return { error: t("invalidEventType") };
  if (!content.start_date || !content.end_date)
    return { error: t("datesRequired") };
  if (content.end_date < content.start_date)
    return { error: t("endBeforeStart") };
  if (!content.title || !content.start_comune || !content.start_provincia)
    return { error: t("requiredFields") };

  const { error } = await supabase.from("proposals").insert({
    ...content,
    user_id: user.id,
    status: "pending" as const,
  });
  if (error) return { error: error.message };

  revalidatePath("/calendario");
  redirect("/calendario?tab=proposte");
}

"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { REGIONS, type Region } from "@/lib/constants/regions";
import { EVENT_TYPES, type EventType } from "@/lib/constants/event-types";
import {
  readEventContent,
  readEventAdminFields,
  str,
} from "@/lib/actions/event-fields";

export async function approveProposal(proposalId: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("approve_proposal", {
    p_proposal_id: proposalId,
  });
  if (error) return { error: error.message };

  revalidatePath("/gestore");
  revalidatePath("/");
  return { ok: true };
}

export async function rejectProposal(proposalId: string, reason: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("proposals")
    .update({
      status: "rejected",
      rejection_reason: reason || null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", proposalId)
    .eq("status", "pending");
  if (error) return { error: error.message };

  revalidatePath("/gestore");
  return { ok: true };
}

export async function deleteEvent(eventId: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("delete_event", {
    p_event_id: eventId,
  });
  if (error) return { error: error.message };

  // La FK saved_events.event_id è ON DELETE CASCADE: l'evento sparisce anche
  // dai calendari personali. Rinfreschiamo home e calendari salvati.
  revalidatePath("/");
  revalidatePath("/calendario");
  redirect("/");
}

export async function updateEvent(
  eventId: string,
  _prev: unknown,
  formData: FormData,
) {
  const supabase = await createClient();
  const t = await getTranslations("errors");
  const content = readEventContent(formData);
  const adminFields = readEventAdminFields(formData);

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

  const { error } = await supabase.rpc("update_event", {
    p_event_id: eventId,
    p_title: content.title,
    p_description: content.description,
    p_start_date: content.start_date,
    p_end_date: content.end_date,
    p_region: content.region,
    p_official_url: content.official_url,
    p_cover_image_key: content.cover_image_key,
    p_start_comune: content.start_comune,
    p_start_provincia: content.start_provincia,
    p_end_comune: content.end_comune,
    p_end_provincia: content.end_provincia,
    p_event_type: content.event_type,
    p_terrain: content.terrain,
    p_distances_km: content.distances_km,
    p_elevation_gain_m: content.elevation_gain_m,
    p_instagram_url: content.instagram_url,
    p_facebook_url: content.facebook_url,
    p_organizer: content.organizer,
    p_circuit: content.circuit,
    p_bike_type: adminFields.bike_type,
    p_competitive: adminFields.competitive,
    p_registration_fee: adminFields.registration_fee,
    p_contact_email: adminFields.contact_email,
    p_contact_phone: adminFields.contact_phone,
  });
  if (error) return { error: error.message };

  // Cleanup: se la cover è stata rimossa o sostituita, elimina il vecchio file
  // dal bucket (service role: gli authenticated non hanno policy di DELETE).
  const originalKey = str(formData, "original_cover_key");
  if (originalKey && originalKey !== content.cover_image_key) {
    await createAdminClient().storage.from("covers").remove([originalKey]);
  }

  revalidatePath("/");
  revalidatePath(`/eventi/${eventId}`);
  redirect(`/eventi/${eventId}`);
}

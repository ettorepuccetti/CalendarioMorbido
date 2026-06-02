import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-user";
import EventForm from "@/components/events/EventForm";
import { updateEvent } from "@/lib/actions/admin";
import type { EventRow } from "@/lib/types/db";

export const dynamic = "force-dynamic";

export default async function ModificaEventoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAdmin();
  const { id } = await params;
  const t = await getTranslations("editEvent");

  const supabase = await createClient();
  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!event) notFound();
  const ev = event as EventRow;

  return (
    <div className="mx-auto max-w-xl py-4">
      <Link href={`/eventi/${id}`} className="font-body text-sm text-accent-deep">
        {t("back")}
      </Link>
      <h1 className="mb-4 mt-2 font-head text-4xl font-bold leading-none">
        {t("title")}
      </h1>
      <EventForm
        userId={user.id}
        action={updateEvent.bind(null, id)}
        initial={ev}
        submitLabel={t("submit")}
        showAdminFields
      />
    </div>
  );
}

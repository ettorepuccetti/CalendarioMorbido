"use client";

import Image from "next/image";
import { useActionState, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { REGIONS } from "@/lib/constants/regions";
import { EVENT_TYPES } from "@/lib/constants/event-types";
import { coverUrl } from "@/lib/utils/storage";
import { useToast } from "@/components/ui/Toast";
import type { EventContent, EventAdminFields } from "@/lib/types/db";

type FormAction = (
  prev: unknown,
  formData: FormData,
) => Promise<{ error?: string } | void>;

export default function EventForm({
  userId,
  action,
  initial,
  submitLabel = "Salva",
  showAdminFields = false,
}: {
  userId: string;
  action: FormAction;
  initial?: Partial<EventContent & EventAdminFields>;
  submitLabel?: string;
  showAdminFields?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const originalKey = initial?.cover_image_key ?? "";
  const [coverKey, setCoverKey] = useState(originalKey);
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();
  const t = useTranslations("form");
  const tTypes = useTranslations("eventTypes");

  useEffect(() => {
    if (state?.error) showToast(state.error, "error");
  }, [state, showToast]);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "jpg";
      const key = `${userId}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("covers")
        .upload(key, file, { upsert: false });
      if (error) throw error;
      setCoverKey(key);
      showToast(t("toastImageUploaded"), "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : t("toastUploadError"),
        "error",
      );
    } finally {
      setUploading(false);
    }
  }

  const coverPreview = coverUrl(coverKey);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="cover_image_key" value={coverKey} />
      <input type="hidden" name="original_cover_key" value={originalKey} />

      <div>
        <label className="field-label" htmlFor="title">
          {t("name")}
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={initial?.title ?? ""}
          className="field-input"
        />
      </div>

      <div>
        <label className="field-label" htmlFor="description">
          {t("description")}
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={initial?.description ?? ""}
          className="field-input"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label" htmlFor="start_date">
            {t("startDate")}
          </label>
          <input
            id="start_date"
            name="start_date"
            type="date"
            required
            defaultValue={initial?.start_date ?? ""}
            className="field-input"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="end_date">
            {t("endDate")}
          </label>
          <input
            id="end_date"
            name="end_date"
            type="date"
            required
            defaultValue={initial?.end_date ?? ""}
            className="field-input"
          />
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor="region">
          {t("region")}
        </label>
        <select
          id="region"
          name="region"
          required
          className="field-input"
          defaultValue={initial?.region ?? ""}
        >
          <option value="" disabled>
            {t("select")}
          </option>
          {REGIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="field-label" htmlFor="event_type">
          {t("eventType")}
        </label>
        <select
          id="event_type"
          name="event_type"
          required
          className="field-input"
          defaultValue={initial?.event_type ?? ""}
        >
          <option value="" disabled>
            {t("select")}
          </option>
          {EVENT_TYPES.map((et) => (
            <option key={et} value={et}>
              {tTypes(et)}
            </option>
          ))}
        </select>
      </div>

      <fieldset className="card space-y-3 p-3">
        <legend className="px-1 font-head text-lg">{t("start")}</legend>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label" htmlFor="start_comune">
              {t("comune")}
            </label>
            <input
              id="start_comune"
              name="start_comune"
              required
              placeholder="Firenze"
              defaultValue={initial?.start_comune ?? ""}
              className="field-input"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="start_provincia">
              {t("provincia")}
            </label>
            <input
              id="start_provincia"
              name="start_provincia"
              required
              placeholder="Firenze"
              defaultValue={initial?.start_provincia ?? ""}
              className="field-input"
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="card space-y-3 p-3">
        <legend className="px-1 font-head text-lg">{t("end")}</legend>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label" htmlFor="end_comune">
              {t("comune")}
            </label>
            <input
              id="end_comune"
              name="end_comune"
              placeholder="Siena"
              defaultValue={initial?.end_comune ?? ""}
              className="field-input"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="end_provincia">
              {t("provincia")}
            </label>
            <input
              id="end_provincia"
              name="end_provincia"
              placeholder="Siena"
              defaultValue={initial?.end_provincia ?? ""}
              className="field-input"
            />
          </div>
        </div>
      </fieldset>

      <div>
        <label className="field-label" htmlFor="official_url">
          {t("officialUrl")}
        </label>
        <input
          id="official_url"
          name="official_url"
          type="url"
          placeholder="https://…"
          defaultValue={initial?.official_url ?? ""}
          className="field-input"
        />
      </div>

      <fieldset className="card space-y-3 p-3">
        <legend className="px-1 font-head text-lg">{t("details")}</legend>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label" htmlFor="terrain">
              {t("terrain")}
            </label>
            <input
              id="terrain"
              name="terrain"
              placeholder="gravel, road…"
              defaultValue={initial?.terrain ?? ""}
              className="field-input"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="distances_km">
              {t("distances")}
            </label>
            <input
              id="distances_km"
              name="distances_km"
              placeholder="100/60/30"
              defaultValue={initial?.distances_km ?? ""}
              className="field-input"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="elevation_gain_m">
              {t("elevation")}
            </label>
            <input
              id="elevation_gain_m"
              name="elevation_gain_m"
              placeholder="2000"
              defaultValue={initial?.elevation_gain_m ?? ""}
              className="field-input"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="organizer">
              {t("organizer")}
            </label>
            <input
              id="organizer"
              name="organizer"
              defaultValue={initial?.organizer ?? ""}
              className="field-input"
            />
          </div>
          <div className="col-span-2">
            <label className="field-label" htmlFor="circuit">
              {t("circuit")}
            </label>
            <input
              id="circuit"
              name="circuit"
              defaultValue={initial?.circuit ?? ""}
              className="field-input"
            />
          </div>
        </div>
      </fieldset>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label" htmlFor="instagram_url">
            {t("instagram")}
          </label>
          <input
            id="instagram_url"
            name="instagram_url"
            type="url"
            placeholder="https://instagram.com/…"
            defaultValue={initial?.instagram_url ?? ""}
            className="field-input"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="facebook_url">
            {t("facebook")}
          </label>
          <input
            id="facebook_url"
            name="facebook_url"
            type="url"
            placeholder="https://facebook.com/…"
            defaultValue={initial?.facebook_url ?? ""}
            className="field-input"
          />
        </div>
      </div>

      {showAdminFields && (
        <fieldset className="card space-y-3 border-2 border-dashed border-line p-3">
          <legend className="px-1 font-head text-lg">{t("adminFields")}</legend>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label" htmlFor="bike_type">
                {t("bikeType")}
              </label>
              <input
                id="bike_type"
                name="bike_type"
                defaultValue={initial?.bike_type ?? ""}
                className="field-input"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="competitive">
                {t("competitive")}
              </label>
              <input
                id="competitive"
                name="competitive"
                defaultValue={initial?.competitive ?? ""}
                className="field-input"
              />
            </div>
            <div className="col-span-2">
              <label className="field-label" htmlFor="registration_fee">
                {t("fee")}
              </label>
              <input
                id="registration_fee"
                name="registration_fee"
                defaultValue={initial?.registration_fee ?? ""}
                className="field-input"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="contact_email">
                {t("email")}
              </label>
              <input
                id="contact_email"
                name="contact_email"
                type="email"
                defaultValue={initial?.contact_email ?? ""}
                className="field-input"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="contact_phone">
                {t("phone")}
              </label>
              <input
                id="contact_phone"
                name="contact_phone"
                defaultValue={initial?.contact_phone ?? ""}
                className="field-input"
              />
            </div>
          </div>
        </fieldset>
      )}

      <div>
        <label className="field-label" htmlFor="cover">
          {t("cover")}
        </label>
        {coverPreview && (
          <div className="mb-2 overflow-hidden rounded-lg border border-line">
            <div className="relative aspect-[16/9] w-full">
              <Image
                src={coverPreview}
                alt={t("cover")}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
              />
            </div>
            <button
              type="button"
              onClick={() => setCoverKey("")}
              className="block w-full bg-paper-soft py-1.5 font-body text-sm text-red-700 hover:bg-paper"
            >
              {t("removeImage")}
            </button>
          </div>
        )}
        <input
          id="cover"
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="field-input"
        />
        {uploading && (
          <p className="mt-1 font-body text-sm text-ink-soft">
            {t("uploading")}
          </p>
        )}
        {coverKey && !uploading && (
          <p className="mt-1 font-body text-sm text-accent-deep">
            {t("imageReady")}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending || uploading}
        className="btn btn-primary w-full disabled:opacity-60"
      >
        {pending ? t("saving") : submitLabel}
      </button>
    </form>
  );
}

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { REGIONS } from "@/lib/constants/regions";
import { EVENT_TYPES } from "@/lib/constants/event-types";

export default function EventFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);
  const t = useTranslations("filters");
  const tTypes = useTranslations("eventTypes");

  const region = params.get("region") ?? "";
  const duration = params.get("duration") ?? "";
  const type = params.get("type") ?? "";

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/?${next.toString()}`);
  }

  const hasFilters = region || duration || type;

  return (
    <div className="card mb-4 p-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between font-head text-xl"
      >
        <span>
          {t("title")}
          {hasFilters ? " ·" : ""}
        </span>
        <span className="font-body text-sm text-ink-soft">
          {open ? t("hide") : t("show")}
        </span>
      </button>

      {open && (
        <div className="mt-3 space-y-4">
          <div>
            <p className="field-label">{t("duration")}</p>
            <div className="flex flex-wrap gap-2">
              <button
                className={`chip ${duration === "" ? "chip-active" : ""}`}
                onClick={() => update("duration", "")}
              >
                {t("all")}
              </button>
              <button
                className={`chip ${duration === "single" ? "chip-active" : ""}`}
                onClick={() => update("duration", "single")}
              >
                {t("oneDay")}
              </button>
              <button
                className={`chip ${duration === "multi" ? "chip-active" : ""}`}
                onClick={() => update("duration", "multi")}
              >
                {t("multiDay")}
              </button>
            </div>
          </div>

          <div>
            <p className="field-label">{t("eventType")}</p>
            <select
              className="field-input"
              value={type}
              onChange={(e) => update("type", e.target.value)}
            >
              <option value="">{t("allTypes")}</option>
              {EVENT_TYPES.map((et) => (
                <option key={et} value={et}>
                  {tTypes(et)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="field-label">{t("region")}</p>
            <select
              className="field-input"
              value={region}
              onChange={(e) => update("region", e.target.value)}
            >
              <option value="">{t("allRegions")}</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {hasFilters && (
            <button
              className="font-body text-sm text-accent-deep underline"
              onClick={() => router.push("/")}
            >
              {t("reset")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { approveProposal, rejectProposal } from "@/lib/actions/admin";
import { formatDateRange } from "@/lib/utils/dates";
import { formatRoute } from "@/lib/utils/location";
import { coverUrl } from "@/lib/utils/storage";
import { useToast } from "@/components/ui/Toast";
import type { ProposalRow } from "@/lib/types/db";
import type { Locale } from "@/i18n/config";

export default function AdminProposalCard({ proposal }: { proposal: ProposalRow }) {
  const [pending, startTransition] = useTransition();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const { showToast } = useToast();
  const t = useTranslations("adminCard");
  const locale = useLocale() as Locale;
  const cover = coverUrl(proposal.cover_image_key);

  function approve() {
    startTransition(async () => {
      const res = await approveProposal(proposal.id);
      if (res?.error) showToast(res.error, "error");
      else showToast(t("toastApproved"), "success");
    });
  }

  function confirmReject() {
    startTransition(async () => {
      const res = await rejectProposal(proposal.id, reason.trim());
      if (res?.error) showToast(res.error, "error");
      else showToast(t("toastRejected"), "info");
    });
  }

  return (
    <li className="card overflow-hidden">
      <div className="flex gap-3 p-3">
        <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-paper-soft">
          {cover ? (
            <Image src={cover} alt="" fill sizes="112px" className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl">
              🚲
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-head text-xl leading-tight">{proposal.title}</p>
          <p className="font-body text-sm text-ink-soft">
            {proposal.region} ·{" "}
            {formatDateRange(proposal.start_date, proposal.end_date, locale)}
          </p>
          <p className="font-body text-sm text-ink-soft">
            📍 {formatRoute(proposal)}
          </p>
          {proposal.official_url && (
            <a
              href={proposal.official_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-sm text-accent-deep underline"
            >
              {t("officialSite")}
            </a>
          )}
        </div>
      </div>

      {proposal.description && (
        <p className="px-3 pb-2 font-body text-sm">{proposal.description}</p>
      )}

      <div className="flex flex-col gap-2 border-t border-line p-3">
        {rejecting ? (
          <div className="space-y-2">
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t("rejectReason")}
              rows={2}
              className="field-input"
            />
            <div className="flex gap-2">
              <button
                onClick={confirmReject}
                disabled={pending}
                className="btn btn-ghost flex-1 disabled:opacity-60"
              >
                {t("confirmReject")}
              </button>
              <button
                onClick={() => setRejecting(false)}
                disabled={pending}
                className="btn btn-ghost"
              >
                {t("cancel")}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={approve}
              disabled={pending}
              className="btn btn-primary flex-1 disabled:opacity-60"
            >
              {pending ? t("loading") : t("approve")}
            </button>
            <button
              onClick={() => setRejecting(true)}
              disabled={pending}
              className="btn btn-ghost flex-1 disabled:opacity-60"
            >
              {t("reject")}
            </button>
          </div>
        )}
      </div>
    </li>
  );
}

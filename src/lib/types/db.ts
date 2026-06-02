import type { Region } from "@/lib/constants/regions";
import type { EventType } from "@/lib/constants/event-types";

export type ProposalStatus = "pending" | "approved" | "rejected";

// Campi condivisi tra evento e proposta (il contenuto pubblico dell'evento).
// Compilati dall'utente nella proposta e copiati su events all'approvazione.
export interface EventContent {
  title: string;
  description: string | null;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  region: Region;
  official_url: string | null;
  cover_image_key: string | null;
  start_comune: string;
  start_provincia: string;
  end_comune: string | null;
  end_provincia: string | null;
  // attributi evento
  event_type: EventType | null; // filtro home + form + dettaglio
  terrain: string | null; // dettaglio pubblico + form
  distances_km: string | null; // testo libero, es. "450/300"
  elevation_gain_m: string | null; // testo libero, es. "10000/5000"
  instagram_url: string | null;
  facebook_url: string | null;
  organizer: string | null;
  circuit: string | null;
}

// Campi visibili solo al gestore nella pagina evento (non in EventContent
// perché non vengono raccolti nella proposta pubblica).
export interface EventAdminFields {
  bike_type: string | null;
  competitive: string | null;
  registration_fee: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  source: string | null; // solo DB, non mostrato in alcuna UI
}

export interface EventRow extends EventContent, EventAdminFields {
  id: string;
  proposal_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProposalRow extends EventContent {
  id: string;
  user_id: string;
  status: ProposalStatus;
  rejection_reason: string | null;
  submitted_at: string;
  reviewed_at: string | null;
}

export interface SavedEventRow {
  user_id: string;
  event_id: string;
  saved_at: string;
}

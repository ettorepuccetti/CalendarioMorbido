// Helper condivisi per leggere i campi evento da una FormData
// (usati sia da submitProposal che da updateEvent).

export function str(fd: FormData, key: string): string {
  return String(fd.get(key) ?? "").trim();
}

export function optStr(fd: FormData, key: string): string | null {
  const v = str(fd, key);
  return v === "" ? null : v;
}

// Campi comuni di un evento/proposta letti dal form.
export function readEventContent(fd: FormData) {
  return {
    title: str(fd, "title"),
    description: optStr(fd, "description"),
    start_date: str(fd, "start_date"),
    end_date: str(fd, "end_date"),
    region: str(fd, "region"),
    official_url: optStr(fd, "official_url"),
    cover_image_key: optStr(fd, "cover_image_key"),
    start_comune: str(fd, "start_comune"),
    start_provincia: str(fd, "start_provincia"),
    end_comune: optStr(fd, "end_comune"),
    end_provincia: optStr(fd, "end_provincia"),
    // attributi evento (campi pubblici)
    event_type: optStr(fd, "event_type"),
    terrain: optStr(fd, "terrain"),
    distances_km: optStr(fd, "distances_km"),
    elevation_gain_m: optStr(fd, "elevation_gain_m"),
    instagram_url: optStr(fd, "instagram_url"),
    facebook_url: optStr(fd, "facebook_url"),
    organizer: optStr(fd, "organizer"),
    circuit: optStr(fd, "circuit"),
  };
}

// Campi admin-only di un evento letti dal form (solo nell'area gestore).
// NB: `source` non è editabile dal form (solo DB) → non incluso qui.
export function readEventAdminFields(fd: FormData) {
  return {
    bike_type: optStr(fd, "bike_type"),
    competitive: optStr(fd, "competitive"),
    registration_fee: optStr(fd, "registration_fee"),
    contact_email: optStr(fd, "contact_email"),
    contact_phone: optStr(fd, "contact_phone"),
  };
}

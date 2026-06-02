-- ============================================================================
-- CalendarioMorbido — eventi cicloturistici reali (giugno–novembre 2026)
-- ============================================================================

insert into public.events
  (title, description, start_date, end_date, region, official_url,
   start_comune, start_provincia, end_comune, end_provincia)
values

  ('Dolomites Bike Day',
   'I passi delle Dolomiti riservati ai ciclisti per un giorno: Campolongo, Pordoi, Sella e Gardena senza traffico motorizzato.',
   '2026-06-20', '2026-06-20', 'Trentino-Alto Adige',
   'https://battistrada.com/it/calendario-cicloturismo/edition/dolomites-bike-day-2026/47360/',
   'Corvara in Badia', 'Bolzano', null, null),

  ('Gravelliamo',
   'Due giorni di gravel tra le colline del Novarese e le sponde del Lago d''Orta, con tracciati da 45 a 105 km per tutti i livelli.',
   '2026-07-11', '2026-07-12', 'Piemonte',
   'https://www.gravelliamo.it/',
   'Borgomanero', 'Novara', null, null),

  ('Jeroboam',
   'Prima tappa del Jeroboam: percorsi gravel tra i colli bergamaschi e le Prealpi, con opzione ultraendurance da 600 km.',
   '2026-07-17', '2026-07-18', 'Lombardia',
   'https://jeroboam.bike/',
   'Bergamo', 'Bergamo', null, null),

  ('Sulle strade di Gino Bartali',
   'Pedalata cicloturistica in Valdichiana e sulle colline di Cortona, omaggio al campione toscano Gino Bartali.',
   '2026-08-23', '2026-08-23', 'Toscana',
   'https://www.pianetamountainbike.it/risultati-gare-mtb/62417-gravel/73944-calendario-gravel-2026-gare-agonistiche-cicloturistiche-e-unsupported-in-italia',
   'Terontola', 'Arezzo', null, null),

  ('La SpoletoNorcia Gravel',
   'Dalla Valnerina verso Norcia in gravel: sterrati panoramici sull''Appennino umbro, percorsi da 10 a 85 km per ogni livello.',
   '2026-09-06', '2026-09-06', 'Umbria',
   'https://www.pianetamountainbike.it/risultati-gare-mtb/62417-gravel/73944-calendario-gravel-2026-gare-agonistiche-cicloturistiche-e-unsupported-in-italia',
   'Scheggino', 'Perugia', null, null),

  ('Torino–Nizza Rally',
   'Bikepacking unsupported da Torino a Nizza attraverso le Alpi: circa 700 km e 15 000 m di dislivello, senza percorso obbligato.',
   '2026-09-05', '2026-09-11', 'Piemonte',
   'https://torino-nice.weebly.com/',
   'Torino', 'Torino', 'Nizza', 'Francia'),

  ('L''Euganega',
   'Cicloturistica sui Colli Euganei: saliscendi tra borghi medievali, terme e vigneti nel cuore del Padovano.',
   '2026-09-13', '2026-09-13', 'Veneto',
   'https://leuganega.it/',
   'Monselice', 'Padova', null, null),

  ('Jeroboam 300',
   'Seconda tappa del Jeroboam: 300 km in formato bikepacking tra le valli bergamasche e le Prealpi lombarde.',
   '2026-09-26', '2026-09-27', 'Lombardia',
   'https://jeroboam.bike/',
   'Bergamo', 'Bergamo', null, null),

  ('Serra Bike — Gravel Circus',
   'Tappa del Gravel Circus tra le morene della Serra d''Ivrea e il Biellese: sterrati e panorami sulla pianura padana.',
   '2026-09-27', '2026-09-27', 'Piemonte',
   'https://www.gravelcircus.it/',
   'Zubiena', 'Biella', null, null),

  ('L''Eroica',
   'La più famosa ciclostorica al mondo: bici vintage ante 1987 sulle strade bianche del Chianti, da 46 a 209 km.',
   '2026-10-03', '2026-10-04', 'Toscana',
   'https://eroica.cc/it/',
   'Gaiole in Chianti', 'Siena', null, null),

  ('Val d''Orcia Gravel',
   'Sterrati e strade bianche nel paesaggio UNESCO della Val d''Orcia, tra cipressi e poderi senesi.',
   '2026-10-17', '2026-10-17', 'Toscana',
   'https://www.pianetamountainbike.it/risultati-gare-mtb/62417-gravel/73944-calendario-gravel-2026-gare-agonistiche-cicloturistiche-e-unsupported-in-italia',
   'Castiglione d''Orcia', 'Siena', null, null),

  ('Casentino Gravel',
   'Gravel tra le foreste del Casentino e i crinali appenninici, in uno degli angoli più verdi della Toscana.',
   '2026-10-24', '2026-10-24', 'Toscana',
   'https://www.pianetamountainbike.it/risultati-gare-mtb/62417-gravel/73944-calendario-gravel-2026-gare-agonistiche-cicloturistiche-e-unsupported-in-italia',
   'Pratovecchio Stia', 'Arezzo', null, null),

  ('Gravel & Wine — Gravel Circus',
   'Tappa autunnale del Gravel Circus nella Bassa Valsesia: vigneti DOC, borghi e sterrati tra Vercelli e Novara.',
   '2026-11-08', '2026-11-08', 'Piemonte',
   'https://www.gravelcircus.it/',
   'Serravalle Sesia', 'Vercelli', null, null),

  ('Brianza Gravel Ice Edition',
   'Edizione invernale della Brianza Gravel: sterrati e strade secondarie tra i laghi del Comasco, sfida al freddo.',
   '2026-11-22', '2026-11-22', 'Lombardia',
   'https://www.pianetamountainbike.it/risultati-gare-mtb/62417-gravel/73944-calendario-gravel-2026-gare-agonistiche-cicloturistiche-e-unsupported-in-italia',
   'Inverigo', 'Como', null, null);

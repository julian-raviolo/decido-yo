/**
 * Catálogo de lugares para ⚔️ SALIDUELO.
 *
 * DATOS DE EJEMPLO: todos los nombres, zonas, promos y cupones son inventados
 * (no corresponden a comercios reales). Se reemplazan cuando haya locales
 * adheridos de verdad.
 *
 * `secretCouponCode` NUNCA se muestra en el catálogo ni durante la partida:
 * sólo aparece en el modal de victoria del lugar ganador.
 */

export type VenueCategory = 'GASTRONOMIA' | 'BARES' | 'EVENTOS' | 'ACTIVIDADES';

export interface Venue {
  id: string;
  name: string;
  category: VenueCategory;
  /** "Logo": emoji sobre un badge de color plano. */
  logoEmoji: string;
  logoColor: string;
  zone: string;
  promoText: string;
  secretCouponCode: string;
}

export const VENUE_CATEGORIES: { id: VenueCategory; label: string; emoji: string; short: string }[] = [
  { id: 'GASTRONOMIA', label: '🍔 Gastronomía / Restó', emoji: '🍔', short: 'Restó' },
  { id: 'BARES', label: '🍻 Bares & Previa', emoji: '🍻', short: 'Bares' },
  { id: 'EVENTOS', label: '🎟️ Eventos & Cartelera', emoji: '🎟️', short: 'Eventos' },
  { id: 'ACTIVIDADES', label: '🎳 Actividades & Paseos', emoji: '🎳', short: 'Paseos' },
];

const v = (
  id: string,
  category: VenueCategory,
  name: string,
  logoEmoji: string,
  logoColor: string,
  zone: string,
  promoText: string,
  secretCouponCode: string,
): Venue => ({ id, name, category, logoEmoji, logoColor, zone, promoText, secretCouponCode });

export const VENUES: Venue[] = [
  /* 🍔 Gastronomía / Restó */
  v('brasa-brava', 'GASTRONOMIA', 'Brasa Brava', '🥩', '#FF5722', 'Barrio Centro', 'Postre libre con tu cena', 'BRASA-7K2Q'),
  v('nori-nori', 'GASTRONOMIA', 'Nori Nori Club', '🍣', '#00E5FF', 'Zona Puerto', '20% OFF en Rolls', 'NORI-4XP9'),
  v('rueda-loca', 'GASTRONOMIA', 'La Rueda Loca', '🍕', '#FFD600', 'Barrio Viejo', '2x1 en muzzas de 19 a 21', 'RUEDA-8M3T'),
  v('tacos-callejon', 'GASTRONOMIA', 'Tacos del Callejón', '🌮', '#C6FF00', 'Paseo Norte', 'Nachos de regalo cada 2 tacos', 'TACO-2H6W'),
  v('burga-bruta', 'GASTRONOMIA', 'Burga Bruta', '🍔', '#FF1744', 'Avenida Principal', 'Papas cheddar gratis con tu burger', 'BURGA-5R1N'),
  v('noquis-co', 'GASTRONOMIA', 'Ñoquis & Compañía', '🍝', '#FFD166', 'Barrio Sur', 'Copa de vino de la casa de regalo', 'NOQUI-9C4E'),
  v('verde-bowl', 'GASTRONOMIA', 'Verde Bowl', '🥗', '#C6FF00', 'Rambla Este', '15% OFF en mesas de 4 o más', 'VERDE-3L8Z'),
  v('dona-ficcia', 'GASTRONOMIA', 'Cantina Doña Ficcia', '🥘', '#AA00FF', 'Barrio Centro', 'Flan con dulce de leche libre', 'FICCIA-6Y2D'),

  /* 🍻 Bares & Previa */
  v('pinta-rebelde', 'BARES', 'La Pinta Rebelde', '🍺', '#FFD600', 'Barrio Viejo', '2x1 en Pintas toda la noche', 'PINTA-1Q7V'),
  v('ombu-neon', 'BARES', 'Bar Ombú Neón', '🌳', '#C6FF00', 'Zona Puerto', 'Happy hour extendido hasta las 22', 'OMBU-8T5K'),
  v('vermu-tito', 'BARES', 'El Vermú de Tito', '🍷', '#FF1744', 'Barrio Sur', 'Vermú de regalo con la picada', 'TITO-4G9B'),
  v('previa-404', 'BARES', 'Club Previa 404', '🪩', '#AA00FF', 'Avenida Principal', 'Shot de bienvenida para el grupo', 'P404-7N3J'),
  v('terraza-lunar', 'BARES', 'Terraza Lunar', '🌙', '#00E5FF', 'Rambla Este', 'Segundo trago a mitad de precio', 'LUNAR-2W6F'),
  v('lupulo-sur', 'BARES', 'Cervecería Lúpulo Sur', '🍻', '#FF5722', 'Barrio Sur', 'Jarra de 1 L con 25% OFF', 'LUPU-5D8R'),
  v('la-llave', 'BARES', 'Speakeasy La Llave', '🗝️', '#FFD166', 'Pasaje Escondido', 'Cóctel de autor 2x1 los jueves', 'LLAVE-9P1X'),
  v('gallo-afonico', 'BARES', 'Karaoke Gallo Afónico', '🎤', '#FF80AB', 'Paseo Norte', 'Primera canción + trago de regalo', 'GALLO-3H4M'),

  /* 🎟️ Eventos & Cartelera */
  v('bambalina', 'EVENTOS', 'Teatro Bambalina', '🎭', '#FF1744', 'Barrio Centro', '2x1 en la función trasnoche', 'BAMBA-6V2L'),
  v('rollo-viejo', 'EVENTOS', 'Cine Rollo Viejo', '🎬', '#FFD600', 'Barrio Viejo', 'Pochoclo grande de regalo', 'ROLLO-1K9S'),
  v('chiste-facil', 'EVENTOS', 'Stand-Up El Chiste Fácil', '🎙️', '#00E5FF', 'Avenida Principal', 'Entrada + trago con 20% OFF', 'CHISTE-8F5A'),
  v('noche-electrica', 'EVENTOS', 'Festival Noche Eléctrica', '⚡', '#C6FF00', 'Predio Costero', 'Ingreso VIP antes de la 1', 'VOLT-4B7U'),
  v('pena-chacarera', 'EVENTOS', 'Peña La Chacarera Loca', '🪕', '#FF5722', 'Barrio Sur', 'Empanada de regalo por entrada', 'PENA-7E3C'),
  v('pincel-suelto', 'EVENTOS', 'Galería Pincel Suelto', '🎨', '#AA00FF', 'Pasaje Escondido', 'Visita guiada gratis con tu entrada', 'PINCEL-2R8H'),
  v('jazz-sotano', 'EVENTOS', 'Jazz en el Sótano', '🎷', '#FFD166', 'Barrio Viejo', 'Mesa preferencial para 4', 'JAZZ-5S1G'),
  v('feria-farolito', 'EVENTOS', 'Feria Nocturna Farolito', '🏮', '#FF80AB', 'Rambla Este', '10% OFF en todos los puestos', 'FAROL-9J6Q'),

  /* 🎳 Actividades & Paseos */
  v('bowling-chuza', 'ACTIVIDADES', 'Bowling Chuza', '🎳', '#FFD600', 'Paseo Norte', 'Segunda línea gratis', 'CHUZA-3A5P'),
  v('escape-candado', 'ACTIVIDADES', 'Escape Room Candado', '🔐', '#AA00FF', 'Barrio Centro', '15% OFF para grupos de 5', 'CANDA-6X2Y'),
  v('karting-turbo', 'ACTIVIDADES', 'Karting Turbo Nene', '🏎️', '#FF1744', 'Predio Costero', 'Vuelta extra de regalo', 'TURBO-1M8E'),
  v('paddle-rebote', 'ACTIVIDADES', 'Pádel Rebote', '🎾', '#C6FF00', 'Barrio Sur', 'Cancha 2x1 de lunes a jueves', 'REBOTE-4N7W'),
  v('hoyo-19', 'ACTIVIDADES', 'Mini Golf Hoyo 19', '⛳', '#00E5FF', 'Rambla Este', 'Licuado de regalo al terminar', 'HOYO-8Z3K'),
  v('kayak-manso', 'ACTIVIDADES', 'Kayak Río Manso', '🛶', '#FF5722', 'Zona Puerto', 'Foto grupal de regalo', 'KAYAK-2C9T'),
  v('pixel-viejo', 'ACTIVIDADES', 'Arcade Pixel Viejo', '🕹️', '#FF80AB', 'Avenida Principal', '20 fichas extra', 'PIXEL-7V4D'),
  v('bici-nocturna', 'ACTIVIDADES', 'Bici Tour Nocturno', '🚲', '#FFD166', 'Paseo Norte', 'Casco y snack incluidos', 'BICI-5G1R'),
];

const BY_ID = new Map(VENUES.map((x) => [x.id, x]));

export const hasVenue = (id: string | undefined | null): id is string => !!id && BY_ID.has(id);

export function getVenue(id: string): Venue {
  const found = BY_ID.get(id);
  if (!found) throw new Error(`Lugar desconocido: ${id}`);
  return found;
}

export const venuesByCategory = (cat: VenueCategory) => VENUES.filter((x) => x.category === cat);

/* ---------- Comercial B2B ---------- */

export const BUSINESS_WHATSAPP_NUMBER = '59899000000';

/** Link de WhatsApp para que un comercio pida sumarse a SALIDUELO. */
export const businessWhatsappUrl = (n: string = BUSINESS_WHATSAPP_NUMBER) =>
  `https://wa.me/${n}?text=Hola!%20Quiero%20sumar%20mi%20local%20a%20SALIDUELO%20en%20Decido%20Yo`;

export const SALIDUELO_HEARTS = 2;

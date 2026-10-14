import {
  Armchair,
  ArrowLeftRight,
  BookHeart,
  Cloud,
  CloudSun,
  Ear,
  Eye,
  Feather,
  HandHeart,
  Heart,
  Martini,
  MessageCircleHeart,
  Music2,
  Scale,
  Send,
  Smartphone,
  Sun,
  Ban,
  Camera,
  ChefHat,
  Compass,
  Crown,
  Dices,
  Disc3,
  Droplets,
  FlipHorizontal2,
  Flame,
  Gavel,
  Hourglass,
  IceCreamCone,
  Languages,
  MessageCircleQuestion,
  Plane,
  Scissors,
  ShieldCheck,
  ShieldX,
  Shuffle,
  Sparkles,
  Utensils,
  Wine,
} from 'lucide-react';
import type { CardDef, Category, GameMode } from '@/types/game';

export const CATEGORY_META: Record<Category, { label: string; color: string; text: string }> = {
  FOOD: { label: 'Gastronómica', color: '#FF5722', text: '#000000' },
  SOCIAL: { label: 'Social & Caos', color: '#FFD600', text: '#000000' },
  DESTINY: { label: 'Rumbo & Destino', color: '#AA00FF', text: '#FFFFFF' },
  SPECIAL: { label: 'Legendaria', color: '#FF1744', text: '#FFFFFF' },
  DEFENSE: { label: 'Defensa', color: '#00E5FF', text: '#000000' },
  DEVIL: { label: 'Diablo', color: '#1A0006', text: '#FFFFFF' },
  ANGEL: { label: 'Ángel', color: '#FFF1C9', text: '#000000' },
};

export const CLASSIC_CATALOG: CardDef[] = [
  /* ---------------- FOOD (12) ---------------- */
  {
    id: 'chef-tirano',
    name: 'Chef Tirano',
    description: 'Elegís el plato principal que va a pedir la víctima.',
    category: 'FOOD',
    mode: 'classic',
    copies: 2,
    icon: ChefHat,
  },
  {
    id: 'permuta-al-plato',
    name: 'Permuta al Plato',
    description: 'Intercambian sus platos durante 10 minutos.',
    category: 'FOOD',
    mode: 'classic',
    copies: 2,
    icon: ArrowLeftRight,
    durationMin: 10,
  },
  {
    id: 'sommelier-del-caos',
    name: 'Sommelier del Caos',
    description: 'Elegís el próximo trago o bebida que se pide el otro.',
    category: 'FOOD',
    mode: 'classic',
    copies: 3,
    icon: Wine,
  },
  {
    id: 'impuesto-al-bocado',
    name: 'Impuesto al Bocado',
    description: 'Derecho legal a robar los primeros dos bocados o el último del plato/postre.',
    category: 'FOOD',
    mode: 'classic',
    copies: 3,
    icon: Utensils,
  },
  {
    id: 'postre-obligatorio',
    name: 'Postre Obligatorio',
    description: 'Decidís si se pide postre y cuál.',
    category: 'FOOD',
    mode: 'classic',
    copies: 2,
    icon: IceCreamCone,
  },

  /* ---------------- SOCIAL (14) ---------------- */
  {
    id: 'modo-avion',
    name: 'Modo Avión',
    description: 'La víctima deja su celular boca abajo en el centro de la mesa por 45 min.',
    category: 'SOCIAL',
    mode: 'classic',
    copies: 3,
    icon: Plane,
    durationMin: 45,
  },
  {
    id: 'filtro-cero',
    name: 'Filtro Cero',
    description: 'Hacé una pregunta incómoda; la víctima debe responder con la verdad absoluta.',
    category: 'SOCIAL',
    mode: 'classic',
    copies: 2,
    icon: MessageCircleQuestion,
  },
  {
    id: 'palabra-prohibida',
    name: 'Palabra Prohibida',
    description: 'Elegís una palabra común; si la víctima la dice en 30 min, va a castigo.',
    category: 'SOCIAL',
    mode: 'classic',
    copies: 3,
    icon: Ban,
    durationMin: 30,
  },
  {
    id: 'acento-extranjero',
    name: 'Acento Extranjero',
    description: 'La víctima debe hablar con el acento que elijas por 15 minutos.',
    category: 'SOCIAL',
    mode: 'classic',
    copies: 2,
    icon: Languages,
    durationMin: 15,
  },
  {
    id: 'cringe-digital',
    name: 'Cringe Digital',
    description: 'Subís una foto sacada en el momento a las historias de la víctima.',
    category: 'SOCIAL',
    mode: 'classic',
    copies: 2,
    icon: Camera,
  },
  {
    id: 'el-elogio-raro',
    name: 'El Elogio Raro',
    description: 'La víctima debe hacerle un cumplido muy específico y educado a otra mesa o al mozo.',
    category: 'SOCIAL',
    mode: 'classic',
    copies: 2,
    icon: Sparkles,
  },

  /* ---------------- DESTINY (8) ---------------- */
  {
    id: 'golpe-de-timon',
    name: 'Golpe de Timón',
    description: 'Vos decidís a qué lugar se mueven después de donde están.',
    category: 'DESTINY',
    mode: 'classic',
    copies: 2,
    icon: Compass,
  },
  {
    id: '30-minutos-mas',
    name: '30 Minutos Más',
    description: 'Nadie se puede ir todavía; la juntada dura media hora más.',
    category: 'DESTINY',
    mode: 'classic',
    copies: 2,
    icon: Hourglass,
    durationMin: 30,
  },
  {
    id: 'dj-dictador',
    name: 'DJ Dictador',
    description: 'Control total de la fila de música por los próximos 5 temas.',
    category: 'DESTINY',
    mode: 'classic',
    copies: 2,
    icon: Disc3,
  },
  {
    id: 'cambio-de-trono',
    name: 'Cambio de Trono',
    description: 'Reorganizás cómo están sentados todos en la mesa ahora mismo.',
    category: 'DESTINY',
    mode: 'classic',
    copies: 2,
    icon: Crown,
  },

  /* ---------------- SPECIAL (4) ---------------- */
  {
    id: 'decido-yo-absoluto',
    name: 'Decido Yo Absoluto',
    description: 'Proponés una regla menor para el resto de la noche y se aprueba sin votación.',
    category: 'SPECIAL',
    mode: 'classic',
    copies: 1,
    icon: Gavel,
    targetMode: 'table',
    special: 'ABSOLUTE',
  },
  {
    id: 'pacto-de-sangre',
    name: 'Pacto de Sangre',
    description: 'Te vinculás con alguien; si te tiran una carta, el otro también la cumple.',
    category: 'SPECIAL',
    mode: 'classic',
    copies: 1,
    icon: Droplets,
    special: 'BLOOD_PACT',
    refusable: false,
  },
  {
    id: 'ruleta-rusa',
    name: 'Ruleta Rusa',
    description: 'La app elige al azar a alguien de la mesa (podés ser vos) para cumplir un castigo directo.',
    category: 'SPECIAL',
    mode: 'classic',
    copies: 1,
    icon: Dices,
    targetMode: 'random',
    special: 'RUSSIAN_ROULETTE',
  },
  {
    id: 'saqueador',
    name: 'Saqueador',
    description: 'Le quemás la carta de Acción de esta noche a otro jugador sin que pueda usarla.',
    category: 'SPECIAL',
    mode: 'classic',
    copies: 1,
    icon: Flame,
    special: 'LOOTER',
    refusable: false,
  },

  /* ---------------- DEFENSE (12) ---------------- */
  {
    id: 'decido-yo-que-no',
    name: '¡Decido Yo que NO!',
    description: 'Anula por completo una carta que te acaban de tirar.',
    category: 'DEFENSE',
    mode: 'classic',
    copies: 5,
    icon: ShieldX,
    defenseEffect: 'NULLIFY',
  },
  {
    id: 'espejito-rebotin',
    name: 'Espejito Rebotín',
    description: 'El efecto de la carta que te tiraron vuelve automáticamente al que te atacó.',
    category: 'DEFENSE',
    mode: 'classic',
    copies: 3,
    icon: FlipHorizontal2,
    defenseEffect: 'REFLECT',
  },
  {
    id: 'chivo-expiatorio',
    name: 'Chivo Expiatorio',
    description: 'Desviás la carta que te tiraron hacia otra persona de la mesa.',
    category: 'DEFENSE',
    mode: 'classic',
    copies: 2,
    icon: Shuffle,
    defenseEffect: 'REDIRECT',
  },
  {
    id: 'doble-o-nada',
    name: 'Doble o Nada',
    description: 'Piedra, Papel o Tijera en vivo. Si ganás, se anula; si perdés, cumplís carta + castigo.',
    category: 'DEFENSE',
    mode: 'classic',
    copies: 1,
    icon: Scissors,
    defenseEffect: 'DOUBLE_OR_NOTHING',
  },
  {
    id: 'inmunidad-diplomatica',
    name: 'Inmunidad Diplomática',
    description: 'Anula el ataque y nadie más puede tirarte cartas por 45 minutos.',
    category: 'DEFENSE',
    mode: 'classic',
    copies: 1,
    icon: ShieldCheck,
    defenseEffect: 'IMMUNITY',
  },
];

/* ------------------------------------------------------------------ */
/* HOT 😈😇 — 20 cartas picantes pero soft (siempre con consentimiento) */
/* ------------------------------------------------------------------ */
export const HOT_CATALOG: CardDef[] = [
  /* ---------------- DIABLO (Acción · 15) ---------------- */
  {
    id: 'hot-mirada-fatal',
    name: 'Mirada Fatal',
    description: 'La víctima te sostiene la mirada 15 segundos sin reírse. Si se ríe, va a castigo.',
    category: 'DEVIL', mode: 'hot', copies: 2, icon: Eye,
  },
  {
    id: 'hot-susurro',
    name: 'Susurro del Diablo',
    description: 'La víctima le susurra al oído un cumplido a quien vos elijas de la mesa.',
    category: 'DEVIL', mode: 'hot', copies: 2, icon: Ear,
  },
  {
    id: 'hot-verdad-picante',
    name: 'Verdad Picante',
    description: 'Hacé una pregunta picante (soft); la víctima responde con la verdad o va a castigo.',
    category: 'DEVIL', mode: 'hot', copies: 2, icon: Flame,
  },
  {
    id: 'hot-brindis-cruzado',
    name: 'Brindis Cruzado',
    description: 'Brindan con los brazos entrelazados y mirándose a los ojos hasta el último sorbo.',
    category: 'DEVIL', mode: 'hot', copies: 2, icon: Martini,
  },
  {
    id: 'hot-lento',
    name: 'Lento Obligatorio',
    description: 'La víctima baila un lento de 30 segundos con quien vos elijas (vale en la silla).',
    category: 'DEVIL', mode: 'hot', copies: 1, icon: Music2,
  },
  {
    id: 'hot-mano-prestada',
    name: 'Mano Prestada',
    description: 'La víctima va de la mano con quien elijas durante 10 minutos.',
    category: 'DEVIL', mode: 'hot', copies: 1, icon: HandHeart, durationMin: 10,
  },
  {
    id: 'hot-primera-cita',
    name: 'Primera Cita',
    description: 'Cuenta su primera cita (o la más desastrosa) con lujo de detalles.',
    category: 'DEVIL', mode: 'hot', copies: 2, icon: BookHeart,
  },
  {
    id: 'hot-tu-tipo',
    name: 'Tu Tipo',
    description: 'Describe a su persona ideal en 3 palabras… mirando a alguien de la mesa.',
    category: 'DEVIL', mode: 'hot', copies: 2, icon: Heart,
  },
  {
    id: 'hot-halago-ardiente',
    name: 'Halago Ardiente',
    description: 'Durante 10 minutos la víctima solo puede hablarte con halagos.',
    category: 'DEVIL', mode: 'hot', copies: 1, icon: MessageCircleHeart, durationMin: 10,
  },
  {
    id: 'hot-silla-caliente',
    name: 'Silla Caliente',
    description: '2 minutos de preguntas picantes de toda la mesa. Puede pasar una sola.',
    category: 'DEVIL', mode: 'hot', copies: 1, icon: Armchair,
  },
  {
    id: 'hot-beso-volado',
    name: 'Beso Volado',
    description: 'La víctima le tira un beso volado con dedicatoria a quien vos elijas.',
    category: 'DEVIL', mode: 'hot', copies: 2, icon: Send,
  },
  {
    id: 'hot-selfie-complice',
    name: 'Selfie Cómplice',
    description: 'Selfie cachete con cachete con la víctima. La foto la elegís vos.',
    category: 'DEVIL', mode: 'hot', copies: 2, icon: Camera,
  },
  {
    id: 'hot-apodo-meloso',
    name: 'Apodo Meloso',
    description: 'La víctima te llama con el apodo meloso que elijas durante 20 minutos.',
    category: 'DEVIL', mode: 'hot', copies: 1, icon: Feather, durationMin: 20,
  },
  {
    id: 'hot-ley-del-diablo',
    name: 'Ley del Diablo',
    description: 'Imponés una regla picante (soft) para el resto de la noche. Sin votación.',
    category: 'DEVIL', mode: 'hot', copies: 1, icon: Gavel, targetMode: 'table', special: 'ABSOLUTE',
  },
  {
    id: 'hot-tentacion-al-azar',
    name: 'Tentación al Azar',
    description: 'La app elige a alguien al azar (podés ser vos) que va directo a la Ruleta HOT.',
    category: 'DEVIL', mode: 'hot', copies: 1, icon: Smartphone, targetMode: 'random', special: 'RUSSIAN_ROULETTE',
  },

  /* ---------------- ÁNGEL (Defensa · 5) ---------------- */
  {
    id: 'hot-angel-guarda',
    name: 'Ángel de la Guarda',
    description: 'Anula por completo la tentación que te acaban de tirar.',
    category: 'ANGEL', mode: 'hot', copies: 3, icon: Cloud, defenseEffect: 'NULLIFY',
  },
  {
    id: 'hot-aureola',
    name: 'Aureola Rebotadora',
    description: 'La tentación rebota y la cumple quien te la tiró.',
    category: 'ANGEL', mode: 'hot', copies: 2, icon: Sun, defenseEffect: 'REFLECT',
  },
  {
    id: 'hot-tentacion-ajena',
    name: 'Tentación Ajena',
    description: 'Le pasás la tentación a otra persona de la mesa.',
    category: 'ANGEL', mode: 'hot', copies: 2, icon: Shuffle, defenseEffect: 'REDIRECT',
  },
  {
    id: 'hot-cielo-o-infierno',
    name: 'Cielo o Infierno',
    description: 'Piedra, Papel o Tijera en vivo. Ganás: se anula. Perdés: cumplís + Ruleta HOT.',
    category: 'ANGEL', mode: 'hot', copies: 1, icon: Scale, defenseEffect: 'DOUBLE_OR_NOTHING',
  },
  {
    id: 'hot-santuario',
    name: 'Santuario',
    description: 'Anula la tentación y nadie puede tirarte cartas por 45 minutos.',
    category: 'ANGEL', mode: 'hot', copies: 1, icon: CloudSun, defenseEffect: 'IMMUNITY',
  },
];

export const CARDS_CATALOG: CardDef[] = [...CLASSIC_CATALOG, ...HOT_CATALOG];

export const CARD_BY_ID: Record<string, CardDef> = Object.fromEntries(
  CARDS_CATALOG.map((c) => [c.id, c]),
);

export const getCard = (id: string): CardDef => {
  const card = CARD_BY_ID[id];
  if (!card) throw new Error(`Carta desconocida: ${id}`);
  return card;
};

export const isDefenseCard = (c: CardDef) => c.category === 'DEFENSE' || c.category === 'ANGEL';

export const catalogFor = (mode: GameMode) => (mode === 'hot' ? HOT_CATALOG : CLASSIC_CATALOG);
export const actionCardsFor = (mode: GameMode) => catalogFor(mode).filter((c) => !isDefenseCard(c));
export const defenseCardsFor = (mode: GameMode) => catalogFor(mode).filter(isDefenseCard);

/** Mazo semanal: 10 cartas distintas sorteadas del catálogo completo. */
export const WEEKLY_ACTION = 7;
export const WEEKLY_DEFENSE = 3;
export const WEEKLY_TOTAL = WEEKLY_ACTION + WEEKLY_DEFENSE;

/** Reglas de mesa según cantidad de jugadores. */
export const EXTRA_ACTION_FROM_PLAYERS = 5; // "más de 4": +1 Acción al quemar la anterior
export const DOUBLE_HAND_FROM_PLAYERS = 11; // "más de 10": 2 Acción + 2 Defensa

/** Duraciones de reglas (minutos). */
export const GAG_MINUTES = 20;
export const IMMUNITY_MINUTES = 45;
export const DEFENSE_WINDOW_SECONDS = 60;

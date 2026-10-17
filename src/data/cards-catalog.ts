import {
  ArrowLeftRight,
  Aperture,
  ConciergeBell,
  CookingPot,
  Music,
  Refrigerator,
  ScreenShare,
  SprayCan,
  Ban,
  Cake,
  Camera,
  Candy,
  Car,
  ChefHat,
  Cherry,
  CircleSlash,
  Clapperboard,
  Cloud,
  CloudSun,
  Compass,
  Cookie,
  Crown,
  CupSoda,
  Dices,
  Disc3,
  DoorOpen,
  Drama,
  Droplets,
  Ear,
  Eye,
  EyeOff,
  Film,
  Fingerprint,
  Flame,
  FlipHorizontal2,
  Footprints,
  Gamepad2,
  Gavel,
  Gift,
  GlassWater,
  Hand,
  HandHeart,
  Handshake,
  Heart,
  Hourglass,
  IceCreamCone,
  Image,
  Languages,
  Laugh,
  Link,
  Martini,
  Megaphone,
  MessageCircleHeart,
  MessageCircleQuestion,
  MessageSquareOff,
  MessagesSquare,
  Mic,
  Music2,
  PartyPopper,
  PersonStanding,
  PhoneCall,
  Pipette,
  Plane,
  Receipt,
  Scale,
  ScanFace,
  Scissors,
  Search,
  ShieldX,
  Shirt,
  ShowerHead,
  Shuffle,
  Smartphone,
  Smile,
  Snail,
  Snowflake,
  Sofa,
  Sparkles,
  Swords,
  Thermometer,
  Ticket,
  Timer,
  UserX,
  Users,
  Utensils,
  UtensilsCrossed,
  VolumeX,
  Wallet,
  Wind,
  Wine,
  type LucideIcon,
} from 'lucide-react';
import type { CardDef, CardScenario, Category, GameMode, Scenario } from '@/types/game';

export const PACK_NAMES: Record<GameMode, string> = {
  classic: 'Pack Caos Extremo PRO',
  hot: 'Pack Noche Salvaje PRO',
};

/** Etiqueta y color de cada categoría según el modo. */
const META: Record<GameMode, Record<Category, { label: string; color: string; text: string }>> = {
  classic: {
    FOOD: { label: 'Gastronómica', color: '#FF5722', text: '#000000' },
    SOCIAL: { label: 'Social & Caos', color: '#FFD600', text: '#000000' },
    DESTINY: { label: 'Rumbo & Destino', color: '#AA00FF', text: '#FFFFFF' },
    SPECIAL: { label: 'Especial', color: '#FF1744', text: '#FFFFFF' },
    DEFENSE: { label: 'Defensa', color: '#00E5FF', text: '#000000' },
  },
  hot: {
    FOOD: { label: 'Cita Picante', color: '#1A0006', text: '#FFFFFF' },
    SOCIAL: { label: 'Seducción', color: '#1A0006', text: '#FFFFFF' },
    DESTINY: { label: 'En Casa', color: '#1A0006', text: '#FFFFFF' },
    SPECIAL: { label: 'Especial HOT', color: '#1A0006', text: '#FFFFFF' },
    DEFENSE: { label: 'Escudo HOT', color: '#FFF1C9', text: '#000000' },
  },
};

export const categoryMeta = (mode: GameMode, category: Category) => META[mode][category];
export const cardMeta = (card: CardDef) => META[card.mode][card.category];

type Extra = Partial<Omit<CardDef, 'id' | 'name' | 'description' | 'category' | 'mode' | 'icon' | 'isLocked' | 'scenarios'>>;

const ALL: CardScenario[] = ['ALL_PRESENCIAL'];
const ALL_R: CardScenario[] = ['ALL_PRESENCIAL', 'REMOTE'];

const card =
  (mode: GameMode, isLocked: boolean) =>
  (
    id: string,
    name: string,
    category: Category,
    scenarios: CardScenario[],
    icon: LucideIcon,
    description: string,
    extra: Extra = {},
  ): CardDef => ({
    id,
    name,
    description,
    category,
    scenarios,
    mode,
    icon,
    isLocked,
    ...(isLocked ? { packName: PACK_NAMES[mode] } : {}),
    ...extra,
  });

const classic = card('classic', false);
const classicPro = card('classic', true);
const hot = card('hot', false);
const hotPro = card('hot', true);

/* ================================================================== */
/* MODO CLÁSICO · 30 activas + 20 PRO                                  */
/* ================================================================== */

export const CLASSIC_CATALOG: CardDef[] = [
  /* ---------- Activas (30) ---------- */
  classic('chef-tirano', 'Chef Tirano', 'FOOD', ['OUTING'], ChefHat,
    'Elegís el plato principal o entrada que va a pedir la víctima del menú (sin alergias).'),
  classic('elogio-al-staff', 'El Elogio al Staff', 'SOCIAL', ['OUTING'], Sparkles,
    'La víctima tiene que hacerle un cumplido educado pero rarísimo al mozo o bartender cuando se acerque.'),
  classic('golpe-de-timon', 'Golpe de Timón', 'DESTINY', ['OUTING', 'PARTY', 'CASUAL'], Compass,
    'Vos decidís a qué bar, plaza o lugar se mueven después de donde están ahora.'),
  classic('mayordomo-de-la-casa', 'Mayordomo de la Casa', 'FOOD', ['HOME'], ConciergeBell,
    'Durante los próximos 20 minutos, la víctima es la encargada oficial de ir a la cocina a servir bebida, buscar hielo o traer comida para todos.',
    { durationMin: 20 }),
  classic('inspeccion-de-heladera', 'Inspección de Heladera', 'FOOD', ['HOME'], Refrigerator,
    'Vas a la cocina de la casa, armás un bocado con 2 cosas que haya en la heladera y la víctima lo tiene que probar.'),
  classic('el-que-lava-no-paga', 'El Que Lava No Paga', 'DESTINY', ['HOME'], SprayCan,
    'Obligás a la víctima a elegir ahora mismo: o levanta y ordena toda la mesa al terminar, o cumple un castigo de la ruleta ya.'),
  classic('sommelier-del-caos', 'Sommelier del Caos', 'FOOD', ['OUTING', 'HOME', 'PARTY'], Wine,
    'Elegís o preparás el próximo trago o bebida (con o sin alcohol) que se tiene que tomar la víctima.'),
  classic('brindis-epico', 'Brindis Épico', 'FOOD', ['OUTING', 'HOME', 'PARTY'], PartyPopper,
    'La víctima tiene que pararse ahora mismo y hacer un brindis improvisado de 30 segundos dedicándoselo al grupo.'),
  classic('dj-dictador', 'DJ Dictador', 'DESTINY', ['HOME', 'PARTY', 'CASUAL'], Disc3,
    'Tenés el control total de la fila de Spotify o la música del lugar por los próximos 5 temas.'),
  classic('paso-prohibido', 'Paso Prohibido', 'SOCIAL', ['PARTY', 'HOME'], Music,
    'Ponés un tema musical ahora y la víctima tiene que bailarlo en el medio del grupo durante 30 segundos sin parar.'),
  classic('permuta-al-plato', 'Permuta al Plato', 'FOOD', ['OUTING', 'HOME'], ArrowLeftRight,
    'Intercambian sus platos o porciones de comida durante los próximos 10 minutos.', { durationMin: 10 }),
  classic('impuesto-al-bocado', 'Impuesto al Bocado', 'FOOD', ['OUTING', 'HOME'], Utensils,
    'Tenés derecho legal a robarle los primeros dos bocados o el último bocado de lo que esté comiendo.'),
  classic('catador-a-ciegas', 'Catador a Ciegas', 'FOOD', ['OUTING', 'HOME'], EyeOff,
    'La víctima cierra los ojos y le das a probar un bocado o sorbo de la mesa; tiene que adivinar qué es.'),
  classic('mano-no-habil', 'Mano No Hábil', 'FOOD', ['OUTING', 'HOME', 'PARTY'], Hand,
    'Durante los próximos 15 minutos, la víctima solo puede agarrar su vaso o comida con su mano no hábil.', { durationMin: 15 }),
  classic('modo-avion', 'Modo Avión', 'SOCIAL', ALL, Plane,
    'La víctima deja su celular boca abajo en el centro de la mesa por 45 minutos. Si lo toca, va a castigo.', { durationMin: 45 }),
  classic('filtro-cero', 'Filtro Cero', 'SOCIAL', ALL_R, MessageCircleQuestion,
    'Hacé una pregunta incómoda. La víctima está obligada a responder con la verdad absoluta.'),
  classic('palabra-prohibida', 'Palabra Prohibida', 'SOCIAL', ALL_R, Ban,
    'Elegís una palabra común (ej. "no", "pero"). Si la víctima la dice en los próximos 30 minutos, cumple castigo.', { durationMin: 30 }),
  classic('acento-extranjero', 'Acento Extranjero', 'SOCIAL', ALL_R, Languages,
    'Durante los próximos 15 minutos, la víctima debe hablar con el acento que vos elijas.', { durationMin: 15 }),
  classic('estatua', 'Estatua', 'SOCIAL', ALL, PersonStanding,
    'Cuando digas "¡Congelado!", la víctima debe quedarse inmóvil por 30 segundos sin importar qué esté haciendo.'),
  classic('sin-nombres', 'Sin Nombres', 'SOCIAL', ALL_R, UserX,
    'Durante 20 minutos, la víctima no puede llamar a nadie por su nombre; debe usar títulos ("Jefe", "Su Señoría").', { durationMin: 20 }),
  classic('defensor-del-diablo', 'Defensor del Diablo', 'SOCIAL', ALL_R, Megaphone,
    'Das un tema ridículo (ej. "la pizza fría es mejor que la caliente") y la víctima debe defenderlo apasionadamente por 2 minutos.'),
  classic('cambio-de-trono', 'Cambio de Trono', 'DESTINY', ALL, Crown,
    'Reorganizás cómo están sentados todos en la mesa o ronda en este preciso instante.'),
  classic('30-minutos-mas', '30 Minutos Más', 'DESTINY', ALL, Hourglass,
    'Nadie se puede ir a su casa todavía; la juntada se extiende obligatoriamente media hora más.', { durationMin: 30 }),
  classic('pacto-de-sangre', 'Pacto de Sangre', 'SPECIAL', ALL_R, Droplets,
    'Te vinculás con alguien: si a vos te tiran una carta hoy, esa persona también tiene que cumplirla a la par.',
    { special: 'BLOOD_PACT', refusable: false }),
  classic('ruleta-rusa', 'Ruleta Rusa', 'SPECIAL', ALL_R, Dices,
    'La app elige al azar a un jugador de la sala (podés ser vos) para cumplir un castigo directo.',
    { targetMode: 'random', special: 'RUSSIAN_ROULETTE' }),
  classic('decido-yo-que-no', '¡Decido Yo que NO!', 'DEFENSE', ALL_R, ShieldX,
    'Escudo clásico. Anula por completo una carta que te acaban de tirar.', { defenseEffect: 'NULLIFY' }),
  classic('espejito-rebotin', 'Espejito Rebotín', 'DEFENSE', ALL_R, FlipHorizontal2,
    'El efecto de la carta que te acaban de tirar se le aplica automáticamente al que te atacó.', { defenseEffect: 'REFLECT' }),
  classic('chivo-expiatorio', 'Chivo Expiatorio', 'DEFENSE', ALL_R, Shuffle,
    'Desviás la carta que te tiraron hacia otra persona de la sala.', { defenseEffect: 'REDIRECT' }),
  classic('doble-o-nada', 'Doble o Nada', 'DEFENSE', ALL_R, Scissors,
    'Se define a un Piedra, Papel o Tijera: si ganás, anulás la carta; si perdés, cumplís la carta Y un castigo.',
    { defenseEffect: 'DOUBLE_OR_NOTHING', rpsLose: 'punish' }),
  classic('mordaza-preventiva', 'Mordaza Preventiva', 'DEFENSE', ALL_R, VolumeX,
    'Anulás el ataque recibido o, si la usás activamente, bloqueás por 20 minutos la mano de otro jugador.',
    { defenseEffect: 'NULLIFY' }),

  /* ---------- PRO · Pack Caos Extremo (20) ---------- */
  classicPro('postre-obligatorio', 'Postre Obligatorio', 'FOOD', ['OUTING', 'HOME'], IceCreamCone,
    'Vos decidís si hoy hay postre y cuál es, sin derecho a queja de nadie.'),
  classicPro('sin-cubiertos', 'Sin Cubiertos', 'FOOD', ['OUTING', 'HOME'], UtensilsCrossed,
    'Durante los próximos 10 minutos, la víctima tiene que comer sin usar tenedor ni cuchillo.', { durationMin: 10 }),
  classicPro('degustacion-cruzada', 'Degustación Cruzada', 'FOOD', ['OUTING', 'HOME'], Cookie,
    'La víctima tiene que darle de comer un bocado en la boca a la persona sentada a su derecha.'),
  classicPro('fondo-hidratante', 'Fondo Hidratante', 'FOOD', ALL_R, GlassWater,
    'La víctima tiene que tomarse un vaso entero de agua sin parar ahora mismo.'),
  classicPro('bancarrota-social', 'Bancarrota Social', 'FOOD', ['OUTING', 'PARTY'], Wallet,
    'La víctima paga tu próximo trago o el postre de los dos sin chistar.'),
  classicPro('mezcla-del-chef', 'Mezcla del Chef', 'FOOD', ['HOME', 'OUTING'], CookingPot,
    'Combinás dos ingredientes de la mesa en una cuchara y la víctima lo tiene que comer sin mirar.'),
  classicPro('cringe-digital', 'Cringe Digital', 'SOCIAL', ALL_R, Camera,
    'Subís una historia al Instagram o WhatsApp de la víctima con una foto sacada ahora.'),
  classicPro('ultima-foto', 'Última Foto', 'SOCIAL', ALL_R, Image,
    'La víctima muestra a toda la sala la última foto que sacó con su galería sin borrar nada.'),
  classicPro('buscador-expuesto', 'Buscador Expuesto', 'SOCIAL', ALL_R, Search,
    'La víctima lee o manda captura de sus últimas 3 búsquedas de Google o Instagram.'),
  classicPro('audio-random', 'Audio Random', 'SOCIAL', ALL_R, Mic,
    'La víctima manda un audio diciendo "No sabés lo que acaba de pasar, mañana te explico" a su tercer chat de WhatsApp.'),
  classicPro('captura-incomoda', 'Captura Incómoda', 'SOCIAL', ['REMOTE', 'ALL_PRESENCIAL'], ScreenShare,
    'La víctima muestra captura en vivo de sus últimos 5 chats de WhatsApp tal cual están.'),
  classicPro('tour-de-heladera-online', 'Tour de Heladera Online', 'SOCIAL', ['REMOTE', 'HOME'], Refrigerator,
    'La víctima tiene 60 segundos para mandar foto de su heladera abierta o alacena ahora mismo.'),
  classicPro('llamada-en-altavoz', 'Llamada en Altavoz', 'SOCIAL', ALL, PhoneCall,
    'Elegís un contacto del celular de la víctima para llamarlo 30 segundos en altavoz en la mesa.'),
  classicPro('selfie-cruda', 'Selfie Cruda', 'SOCIAL', ['REMOTE', 'ALL_PRESENCIAL'], Aperture,
    'La víctima se saca una selfie desde el peor ángulo posible y la deja de foto de perfil por 30 minutos.', { durationMin: 30 }),
  classicPro('la-cuenta-es-ley', 'La Cuenta es Ley', 'DESTINY', ['OUTING', 'HOME'], Receipt,
    'Vos decidís el método exacto de cómo se divide la cuenta del pedido o restaurante hoy.'),
  classicPro('foto-oficial-ridicula', 'Foto Oficial Ridícula', 'DESTINY', ALL_R, Users,
    'Todos se sacan una foto grupal o captura haciendo la cara más ridícula que vos ordenes.'),
  classicPro('tema-tabu-total', 'Tema Tabú Total', 'DESTINY', ALL_R, MessageSquareOff,
    'Prohibís un tema de charla por el resto de la noche; el que lo mencione gira la ruleta de castigos.',
    { targetMode: 'table', special: 'ABSOLUTE' }),
  classicPro('decido-yo-absoluto', 'Decido Yo Absoluto', 'SPECIAL', ALL_R, Gavel,
    'Proponés una regla general para el resto de la noche y queda aprobada sin derecho a réplica.',
    { targetMode: 'table', special: 'ABSOLUTE' }),
  classicPro('saqueador-supremo', 'Saqueador Supremo', 'SPECIAL', ALL_R, Flame,
    'Le quemás una carta de Acción al azar de su mano a otro jugador sin que llegue a usarla.',
    { special: 'LOOTER', refusable: false }),
  classicPro('contraataque-letal', 'Contraataque Letal', 'DEFENSE', ALL_R, Swords,
    'Anulás la carta recibida y obligás al atacante a girar la Ruleta de Castigos inmediatamente.',
    { defenseEffect: 'COUNTER' }),
];

/* ================================================================== */
/* MODO HOT · exclusivo parejas · 30 activas + 20 PRO                  */
/* ================================================================== */

export const HOT_CATALOG: CardDef[] = [
  /* ---------- Activas (30) ---------- */
  hot('hot-bajo-la-mesa', 'Bajo la Mesa', 'FOOD', ['OUTING'], HandHeart,
    'Durante los próximos 5 minutos de la cita, tu mano tiene que acariciar mi pierna por debajo de la mesa sin que nadie alrededor lo note.',
    { durationMin: 5 }),
  hot('hot-susurro-gastronomico', 'Susurro Gastronómico', 'FOOD', ['OUTING', 'PARTY'], Ear,
    'Acercate como si me fueras a comentar algo del menú o del lugar, pero decime al oído qué parte de mi cuerpo tenés más ganas de besar hoy.'),
  hot('hot-beso-furtivo', 'Beso Furtivo', 'SOCIAL', ['OUTING', 'PARTY', 'CASUAL'], Heart,
    'En los próximos 10 minutos tenés que darme un beso lento en el cuello o detrás de la oreja cuando nadie nos esté mirando.',
    { durationMin: 10 }),
  hot('hot-pausa-intima', 'Pausa Íntima', 'SPECIAL', ['OUTING', 'PARTY', 'CASUAL'], DoorOpen,
    'En los próximos 15 minutos tenemos que buscar un rincón a solas (auto, entrada, pasillo) para darnos un beso apasionado de 1 minuto.',
    { durationMin: 15 }),
  hot('hot-chef-en-menos-ropa', 'Chef en Menos Ropa', 'FOOD', ['HOME'], ChefHat,
    'El próximo trago o plato que sirvas hoy en casa lo tenés que traer habiéndote sacado al menos una prenda de ropa.'),
  hot('hot-prenda-a-eleccion', 'Prenda a Elección', 'DESTINY', ['HOME'], Shirt,
    'Ahora mismo yo elijo qué prenda de ropa te sacás primero y cómo lo hacés, con la música que yo ponga de fondo.'),
  hot('hot-diez-minutos-de-masaje', 'Diez Minutos de Masaje', 'DESTINY', ['HOME'], HandHeart,
    'Me debés ahora o al terminar de comer un masaje sensual de 10 minutos en la zona del cuerpo que yo elija.'),
  hot('hot-camara-lenta', 'Cámara Lenta', 'DESTINY', ['HOME'], Snail,
    'Durante los primeros 10 minutos cuando pasemos a la cama o al sillón hoy, todo lo que me hagas tiene que ser en cámara extremadamente lenta.'),
  hot('hot-maraton-de-besos', 'Maratón de Besos', 'DESTINY', ['HOME'], Timer,
    'Antes de pasar a la acción principal en casa, tenés que recorrer mi cuerpo con besos desde el cuello hacia abajo durante 5 minutos reloj.'),
  hot('hot-bocado-sensual', 'Bocado Sensual', 'FOOD', ['OUTING', 'HOME'], Cherry,
    'Me tenés que dar de probar algo de tu plato o postre directamente en la boca mirándome fijo a los ojos.'),
  hot('hot-labios-marcados', 'Labios Marcados', 'FOOD', ['OUTING', 'HOME', 'PARTY'], Wine,
    'Tomá un sorbo de tu bebida y besame inmediatamente para que sienta el sabor en tus labios.'),
  hot('hot-pie-travieso', 'Pie Travieso', 'FOOD', ['OUTING', 'HOME'], Footprints,
    'Descalzate un pie por debajo de la mesa o en el sillón y rozá mi pierna suavemente durante 3 minutos.', { durationMin: 3 }),
  hot('hot-mirada-intimidante', 'Mirada Intimidante', 'FOOD', ALL_R, Eye,
    'Sostenemos la mirada en silencio por 2 minutos; el primero que se ría o desvíe la vista pierde una prenda en casa (o en cámara).',
    { durationMin: 2 }),
  hot('hot-manos-entrelazadas', 'Manos Entrelazadas', 'FOOD', ALL, Handshake,
    'Tus manos se quedan con las mías por 5 minutos acariciándome de la forma más sensual posible sin hablar.', { durationMin: 5 }),
  hot('hot-brindis-con-promesa', 'Brindis con Promesa', 'FOOD', ALL_R, Martini,
    'Chocamos las copas y me decís en voz baja algo que me prometés hacer esta noche cuando estemos en la cama.'),
  hot('hot-susurro-al-oido', 'Susurro al Oído', 'SOCIAL', ALL_R, MessageCircleHeart,
    'Confesame al oído (o por audio privado) tu fantasía más picante conmigo que todavía no hayamos cumplido.'),
  hot('hot-confesion-erotica', 'Confesión Erótica', 'SOCIAL', ALL_R, Flame,
    'Decime cuál fue la vez que más te encendí desde que estamos juntos y qué fue exactamente lo que hice.'),
  hot('hot-elogio-al-cuerpo', 'Elogio al Cuerpo', 'SOCIAL', ALL_R, Sparkles,
    'Decime cuáles son las 3 partes de mi cuerpo que más te vuelven loco/a y qué harías con cada una hoy.'),
  hot('hot-mordisco-suave', 'Mordisco Suave', 'SOCIAL', ALL, Candy,
    'Ahora mismo acercate y dame un mordisco suave en el labio inferior o en el cuello.'),
  hot('hot-juego-de-temperatura', 'Juego de Temperatura', 'SOCIAL', ALL_R, Thermometer,
    'Decime del 1 al 10 qué tan encendido/a estás ahora mismo y qué tendría que hacer yo para subirlo a 10.'),
  hot('hot-prohibido-tocar', 'Prohibido Tocar', 'SOCIAL', ALL, Ban,
    'Durante los próximos 10 minutos podemos besarnos o hablarnos bien cerca, pero tenés prohibido tocarme con las manos.',
    { durationMin: 10 }),
  hot('hot-adelanto-tactil', 'Adelanto Táctil', 'SOCIAL', ALL, Fingerprint,
    'Guiá mi mano disimuladamente hacia el lugar exacto donde quieras que te acaricie más tarde.'),
  hot('hot-lectura-de-labios', 'Lectura de Labios', 'SOCIAL', ALL_R, Smile,
    'Decime algo súper picante modulando sin sonido hasta que yo logre adivinar exactamente qué dijiste.'),
  hot('hot-pregunta-sin-filtro', 'Pregunta Sin Filtro HOT', 'SOCIAL', ALL_R, MessageCircleQuestion,
    'Puedo hacerte una pregunta íntima sobre tus gustos en la cama y tenés que responder con total sinceridad.'),
  hot('hot-deseo-doble', 'Deseo Doble', 'SPECIAL', ALL_R, Dices,
    'Propongo dos retos sensuales para hoy y vos tenés que elegir uno de los dos y cumplirlo sí o sí.'),
  hot('hot-cambio-de-rol', 'Cambio de Rol', 'DEFENSE', ALL_R, FlipHorizontal2,
    'Doy vuelta la apuesta: lo que tu carta me pedía que te haga a vos, me lo tenés que hacer vos a mí hoy.',
    { defenseEffect: 'REFLECT' }),
  hot('hot-tension-acumulada', 'Tensión Acumulada', 'DEFENSE', ALL_R, Cloud,
    'Anulo tu carta por ahora, pero a cambio te debo un beso apasionado de 1 minuto reloj apenas estemos a solas.',
    { defenseEffect: 'NULLIFY' }),
  hot('hot-negociacion-intima', 'Negociación Íntima', 'DEFENSE', ALL_R, Scale,
    'Anulo esta carta, pero vos elegís qué prenda de ropa me tengo que sacar ahora o apenas entremos a casa.',
    { defenseEffect: 'NULLIFY' }),
  hot('hot-todo-o-nada-sensual', 'Todo o Nada Sensual', 'DEFENSE', ALL_R, Scissors,
    'Jugamos a Piedra, Papel o Tijera: si gano, se anula tu carta; si pierdo, la cumplo por el doble de tiempo.',
    { defenseEffect: 'DOUBLE_OR_NOTHING', rpsLose: 'double' }),
  hot('hot-pausa-de-seduccion', 'Pausa de Seducción', 'DEFENSE', ALL_R, CloudSun,
    'Bloqueo tu carta actual, pero te concedo 5 minutos de caricias donde vos me pidas más tarde.',
    { defenseEffect: 'NULLIFY' }),

  /* ---------- PRO · Pack Noche Salvaje (20) ---------- */
  hotPro('hot-hielo-secreto', 'Hielo Secreto', 'FOOD', ['HOME', 'OUTING', 'PARTY'], Snowflake,
    'Pasate un cubo de hielo por los labios o el cuello y besame lento para sentir el contraste de temperatura.'),
  hotPro('hot-trago-al-cuerpo', 'Trago al Cuerpo', 'FOOD', ['HOME'], GlassWater,
    'Tengo derecho a tomar un sorbo de bebida o probar algo dulce directamente sobre tu piel hoy.'),
  hotPro('hot-postre-en-la-cama', 'Postre en la Cama', 'FOOD', ['HOME', 'OUTING'], Cake,
    'Nos llevamos algo dulce o una bebida a la cama para usarlo como parte del juego previo esta noche.'),
  hotPro('hot-el-ultimo-sorbo', 'El Último Sorbo', 'FOOD', ALL, CupSoda,
    'Quien termine último su copa actual le debe al otro 5 minutos donde solo se puede usar la boca, sin manos.'),
  hotPro('hot-degustacion-a-ciegas', 'Degustación a Ciegas HOT', 'FOOD', ['HOME'], EyeOff,
    'Te vendo los ojos y te doy a probar 3 cosas combinadas con besos en distintas partes del cuerpo.'),
  hotPro('hot-audio-prohibido', 'Audio Prohibido', 'SOCIAL', ['OUTING', 'REMOTE', 'PARTY'], Mic,
    'Alejate un minuto y mandame un audio por WhatsApp describiendo con lujo de detalles qué me vas a hacer en la cama.'),
  hotPro('hot-foto-secreta', 'Foto Secreta Solo para Mí', 'SOCIAL', ['REMOTE', 'OUTING', 'HOME'], Camera,
    'Mandame por WhatsApp (en "ver una sola vez") una foto sugerente sacada en este preciso momento.'),
  hotPro('hot-chat-en-vivo', 'Chat en Vivo Frente a Frente', 'SOCIAL', ['OUTING', 'HOME', 'REMOTE'], MessagesSquare,
    'Durante 3 minutos no hablamos: nos mandamos mensajes bien calientes mirándonos a los ojos.', { durationMin: 3 }),
  hotPro('hot-silencio-absoluto', 'Silencio Absoluto', 'SOCIAL', ['HOME'], VolumeX,
    'Reto en la cama: durante 10 minutos no podés emitir ni un solo sonido por más que yo intente provocarte al máximo.'),
  hotPro('hot-fantasia-de-rol', 'Fantasía de Rol', 'SOCIAL', ['OUTING', 'PARTY', 'HOME'], Drama,
    'Durante 20 minutos actuamos como dos desconocidos que se acaban de cruzar y seducir por primera vez.', { durationMin: 20 }),
  hotPro('hot-control-remoto', 'Control Remoto', 'DESTINY', ['HOME'], Gamepad2,
    'En la cama hoy tenés los ojos vendados durante los primeros 15 minutos y yo decido todo lo que pasa.'),
  hotPro('hot-cambio-de-escenario', 'Cambio de Escenario', 'DESTINY', ['HOME'], Sofa,
    'Hoy está prohibido empezar en la cama: el primer encuentro tiene que ser en el sillón, ducha, mesa o contra la pared.'),
  hotPro('hot-striptease-privado', 'Striptease Privado', 'DESTINY', ['HOME', 'REMOTE'], Music2,
    'Me debés sacarte al menos 3 prendas bailando lentamente solo para mí antes de tocarnos.'),
  hotPro('hot-manos-atadas', 'Manos Atadas', 'DESTINY', ['HOME'], Link,
    'Durante 10 minutos en la intimidad tus manos quedan arriba de tu cabeza sin poder moverlas mientras yo tomo el control.'),
  hotPro('hot-desafio-del-espejo', 'Desafío del Espejo', 'DESTINY', ['HOME', 'REMOTE'], ScanFace,
    'Los primeros 10 minutos de intimidad tienen que ser mirándonos frente a un espejo.'),
  hotPro('hot-ducha-compartida', 'Ducha Compartida', 'DESTINY', ['HOME'], ShowerHead,
    'Nos metemos directo a la ducha juntos con las luces bajas antes de ir a la cama.'),
  hotPro('hot-vale-todo-en-casa', 'Vale Todo en Casa', 'SPECIAL', ['HOME', 'OUTING'], Ticket,
    'Comodín íntimo definitivo: hoy tenés que cumplir un deseo sensual a mi elección sin hacer preguntas.'),
  hotPro('hot-nos-vamos-ya', 'Nos Vamos Ya', 'SPECIAL', ['OUTING', 'PARTY', 'CASUAL'], Car,
    'Pido la cuenta en este preciso instante; la salida afuera se termina porque nos vamos directo a casa ahora mismo.'),
  hotPro('hot-juguete-o-accesorio', 'Juguete o Accesorio', 'SPECIAL', ['HOME'], Gift,
    'Yo elijo un elemento extra (venda, hielo, aceite o juguete) que sí o sí entra en acción esta noche.'),
  hotPro('hot-inversion-de-poder', 'Inversión de Poder Total', 'DEFENSE', ALL_R, Crown,
    'Anulás la carta de tu pareja, le robás el turno y ganás el control total de los primeros 15 minutos en la cama.',
    { defenseEffect: 'NULLIFY' }),
];

export const CARDS_CATALOG: CardDef[] = [...CLASSIC_CATALOG, ...HOT_CATALOG];

export const CARD_BY_ID: Record<string, CardDef> = Object.fromEntries(CARDS_CATALOG.map((c) => [c.id, c]));

export const getCard = (id: string): CardDef => {
  const c = CARD_BY_ID[id];
  if (!c) throw new Error(`Carta desconocida: ${id}`);
  return c;
};
export const hasCard = (id: string) => id in CARD_BY_ID;

export const isDefenseCard = (c: CardDef) => c.category === 'DEFENSE';

export const catalogFor = (mode: GameMode) => (mode === 'hot' ? HOT_CATALOG : CLASSIC_CATALOG);
export const activeCardsFor = (mode: GameMode) => catalogFor(mode).filter((c) => !c.isLocked);
export const proCardsFor = (mode: GameMode) => catalogFor(mode).filter((c) => c.isLocked);
export const actionCardsFor = (mode: GameMode) => catalogFor(mode).filter((c) => !isDefenseCard(c));
export const defenseCardsFor = (mode: GameMode) => catalogFor(mode).filter(isDefenseCard);

/* ---------- Escenarios ---------- */

export const PRESENCIAL_SCENARIOS: Scenario[] = ['OUTING', 'HOME', 'PARTY', 'CASUAL'];

export const SCENARIO_META: Record<Scenario, { emoji: string; label: string; short: string }> = {
  OUTING: { emoji: '🍔', label: 'Salida a Comer / Bar', short: 'Bar' },
  HOME: { emoji: '🏠', label: 'Comida / Juntada en Casa', short: 'Casa' },
  PARTY: { emoji: '🍾', label: 'Previa / Salida a Bailar', short: 'Previa' },
  CASUAL: { emoji: '🧉', label: 'Plan Libre / Tarde / Auto', short: 'Libre' },
  REMOTE: { emoji: '📱', label: 'Full Online a Distancia', short: 'Online' },
};

/** ¿La carta puede salir en este escenario? */
export const fitsScenario = (c: CardDef, scenario: Scenario) =>
  c.scenarios.includes(scenario) || (scenario !== 'REMOTE' && c.scenarios.includes('ALL_PRESENCIAL'));

/** Escenarios concretos de una carta (expande ALL_PRESENCIAL). */
export const cardScenarios = (c: CardDef): Scenario[] => {
  const set = new Set<Scenario>();
  for (const s of c.scenarios) {
    if (s === 'ALL_PRESENCIAL') PRESENCIAL_SCENARIOS.forEach((x) => set.add(x));
    else set.add(s);
  }
  return (['OUTING', 'HOME', 'PARTY', 'CASUAL', 'REMOTE'] as Scenario[]).filter((x) => set.has(x));
};

/* ---------- Economía (pagos simulados) ---------- */

export const PRICES = {
  /** Expansión PRO completa (20 cartas) por modo. */
  pack: 2.0,
  /** Refill: vuelve a llenar las energías de la semana. */
  refill: 0.99,
  /** Plan PRO mensual (simulado). */
  pro: 3.99,
  /** Re-barajado extra cuando se agotan los 2 gratis de la semana. */
  reshuffle: 0.5,
  /** Precio por carta al recargar una mano entera. */
  perCard: 0.166,
};
export const WEEKLY_FREE_RESHUFFLES = 2;
/** Recarga equitativa: mano de 3 → $0.50 · mano de 5 → $0.83. */
export const rechargePrice = (handCards: number) => (handCards <= 3 ? 0.5 : Math.round(handCards * PRICES.perCard * 100) / 100);
export const formatUSD = (n: number) => `$${n.toFixed(2)} USD`;

/** Presupuesto semanal de cartas quemables, por modo. */
export const WEEKLY_BURNS = 6;

/** Refills de energía gratis por semana con el Plan PRO. */
export const PRO_WEEKLY_REFILLS = 2;

/** Jugadores máximos por sala (HOT es exclusivo de parejas). */
export const MAX_PLAYERS: Record<GameMode, number> = { classic: 12, hot: 2 };

/** Escalado de la mano según la cantidad de jugadores de la sala. */
/** En ⚔️ SALIDUELO siempre son 3 Acción + 2 Defensa. */
export const handSizeFor = (players: number, saliduelo = false) =>
  saliduelo || players >= 7 ? { actions: 3, defenses: 2 } : { actions: 2, defenses: 1 };

/** Duraciones de reglas (minutos). */
export const GAG_MINUTES = 20;
export const IMMUNITY_MINUTES = 45;
export const DEFENSE_WINDOW_SECONDS = 60;

// Guarda de integridad: 50 cartas por modo (30 activas + 20 PRO).
if (process.env.NODE_ENV !== 'production') {
  for (const mode of ['classic', 'hot'] as const) {
    const all = catalogFor(mode);
    const active = activeCardsFor(mode).length;
    if (all.length !== 50 || active !== 30) {
      // eslint-disable-next-line no-console
      console.error(`[cards-catalog] ${mode}: ${all.length} cartas (${active} activas). Deben ser 50 (30 + 20 PRO).`);
    }
  }
  const ids = new Set(CARDS_CATALOG.map((c) => c.id));
  if (ids.size !== CARDS_CATALOG.length) console.error('[cards-catalog] Hay ids repetidos');
}

import {
  ArrowLeftRight,
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
import type { CardDef, Category, GameMode } from '@/types/game';

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

type Extra = Partial<Omit<CardDef, 'id' | 'name' | 'description' | 'category' | 'mode' | 'icon' | 'isLocked'>>;

const card =
  (mode: GameMode, isLocked: boolean) =>
  (id: string, name: string, category: Category, icon: LucideIcon, description: string, extra: Extra = {}): CardDef => ({
    id,
    name,
    description,
    category,
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
  /* ---------- Gastronómicas (8) ---------- */
  classic('chef-tirano', 'Chef Tirano', 'FOOD', ChefHat,
    'Elegís el plato principal que va a pedir la víctima hoy (dentro de lo que coma habitualmente, sin alergias).'),
  classic('permuta-al-plato', 'Permuta al Plato', 'FOOD', ArrowLeftRight,
    'En cualquier momento de la comida, intercambian sus platos durante los próximos 10 minutos.', { durationMin: 10 }),
  classic('sommelier-del-caos', 'Sommelier del Caos', 'FOOD', Wine,
    'Elegís el próximo trago o bebida (con o sin alcohol) que se tiene que pedir el otro.'),
  classic('impuesto-al-bocado', 'Impuesto al Bocado', 'FOOD', Utensils,
    'Tenés derecho legal a robarle los primeros dos bocados o el último bocado de su plato o postre.'),
  classic('postre-obligatorio', 'Postre Obligatorio', 'FOOD', IceCreamCone,
    'Vos decidís si se pide postre en la mesa y cuál es, sin derecho a queja.'),
  classic('catador-a-ciegas', 'Catador a Ciegas', 'FOOD', EyeOff,
    'La víctima cierra los ojos y le das a probar un bocado o sorbo de la mesa; tiene que adivinar qué es.'),
  classic('brindis-epico', 'Brindis Épico', 'FOOD', PartyPopper,
    'La víctima tiene que pararse (o alzar la copa) y hacer un brindis improvisado de 30 segundos dedicándoselo al grupo.'),
  classic('mano-no-habil', 'Mano No Hábil', 'FOOD', Hand,
    'Durante los próximos 15 minutos, la víctima solo puede tomar su vaso o usar los cubiertos con su mano no hábil.', { durationMin: 15 }),

  /* ---------- Sociales y Caos (10) ---------- */
  classic('modo-avion', 'Modo Avión', 'SOCIAL', Plane,
    'La víctima debe dejar su celular boca abajo en el centro de la mesa por 45 minutos. Si lo toca, va a castigo.', { durationMin: 45 }),
  classic('filtro-cero', 'Filtro Cero', 'SOCIAL', MessageCircleQuestion,
    'Hacé una pregunta incómoda. La víctima está obligada a responder con la verdad absoluta.'),
  classic('palabra-prohibida', 'Palabra Prohibida', 'SOCIAL', Ban,
    'Elegís una palabra común (ej. "no", "pero", "trabajo"). Si la víctima la dice en los próximos 30 minutos, cumple castigo.', { durationMin: 30 }),
  classic('acento-extranjero', 'Acento Extranjero', 'SOCIAL', Languages,
    'Durante los próximos 15 minutos, la víctima debe hablar con el acento que vos elijas.', { durationMin: 15 }),
  classic('el-elogio-raro', 'El Elogio Raro', 'SOCIAL', Sparkles,
    'La víctima tiene que hacerle un cumplido extremadamente específico pero educado al mozo o a alguien de otra mesa.'),
  classic('estatua', 'Estatua', 'SOCIAL', PersonStanding,
    'En el momento que digas "¡Congelado!", la víctima debe quedarse completamente inmóvil por 30 segundos.'),
  classic('sin-nombres', 'Sin Nombres', 'SOCIAL', UserX,
    'Durante 20 minutos, la víctima no puede llamar a nadie por su nombre ni apodo; debe usar títulos ("Jefe", "Su Señoría").', { durationMin: 20 }),
  classic('risa-prohibida', 'Risa Prohibida', 'SOCIAL', Laugh,
    'Durante los próximos 5 minutos, la víctima no puede sonreír ni reírse mientras toda la mesa intenta tentarla.', { durationMin: 5 }),
  classic('defensor-del-diablo', 'Defensor del Diablo', 'SOCIAL', Megaphone,
    'Das un tema polémico e inofensivo (ej. "el helado de menta es el mejor") y la víctima debe defenderlo apasionadamente por 2 minutos.'),
  classic('mirada-fija', 'Mirada Fija', 'SOCIAL', Eye,
    'Reto de miradas contra la víctima durante 60 segundos sin parpadear ni reírse; el primero que pierda cumple una prenda menor.'),

  /* ---------- Rumbo y Destino (5) ---------- */
  classic('golpe-de-timon', 'Golpe de Timón', 'DESTINY', Compass,
    'Vos decidís a qué bar, plaza o lugar se mueven después de donde están ahora.'),
  classic('30-minutos-mas', '30 Minutos Más', 'DESTINY', Hourglass,
    'Nadie se puede ir a su casa todavía; la juntada se extiende obligatoriamente media hora más.', { durationMin: 30 }),
  classic('dj-dictador', 'DJ Dictador', 'DESTINY', Disc3,
    'Tenés el control total de la fila de música por los próximos 5 temas.'),
  classic('cambio-de-trono', 'Cambio de Trono', 'DESTINY', Crown,
    'Reorganizás cómo están sentados todos en la mesa en este preciso instante.'),
  classic('tema-tabu', 'Tema Tabú en Mesa', 'DESTINY', MessageSquareOff,
    'Prohibís un tema de conversación (ej. trabajo, estudio, política, ex parejas) por el resto de la noche para todos.',
    { targetMode: 'table', special: 'ABSOLUTE' }),

  /* ---------- Especiales (2) ---------- */
  classic('pacto-de-sangre', 'Pacto de Sangre', 'SPECIAL', Droplets,
    'Te vinculás con alguien de la mesa: si a vos te tiran una carta hoy, esa persona también tiene que cumplirla a la par.',
    { special: 'BLOOD_PACT', refusable: false }),
  classic('ruleta-rusa', 'Ruleta Rusa', 'SPECIAL', Dices,
    'La tirás a la mesa y la app elige al azar a un jugador de la sala (podés ser vos) para cumplir un castigo directo.',
    { targetMode: 'random', special: 'RUSSIAN_ROULETTE' }),

  /* ---------- Defensa (5) ---------- */
  classic('decido-yo-que-no', '¡Decido Yo que NO!', 'DEFENSE', ShieldX,
    'Escudo clásico. Anula por completo una carta que te acaban de tirar.', { defenseEffect: 'NULLIFY' }),
  classic('espejito-rebotin', 'Espejito Rebotín', 'DEFENSE', FlipHorizontal2,
    'El efecto de la carta que te acaban de tirar se le aplica automáticamente al que te atacó.', { defenseEffect: 'REFLECT' }),
  classic('chivo-expiatorio', 'Chivo Expiatorio', 'DEFENSE', Shuffle,
    'Desviás la carta que te tiraron hacia otra persona de la mesa (en citas de a 2 funciona como escudo normal).',
    { defenseEffect: 'REDIRECT' }),
  classic('doble-o-nada', 'Doble o Nada', 'DEFENSE', Scissors,
    'Se define a un Piedra, Papel o Tijera en vivo: si ganás, anulás la carta; si perdés, cumplís la carta Y un castigo.',
    { defenseEffect: 'DOUBLE_OR_NOTHING', rpsLose: 'punish' }),
  classic('mordaza-preventiva', 'Mordaza Preventiva', 'DEFENSE', VolumeX,
    'Anulás el ataque recibido o, si la usás activamente, bloqueás por 20 minutos la mano de otro jugador.',
    { defenseEffect: 'NULLIFY' }),

  /* ---------- PRO · Pack Caos Extremo (20) ---------- */
  classicPro('sin-cubiertos', 'Sin Cubiertos', 'FOOD', UtensilsCrossed,
    'Durante los próximos 10 minutos, la víctima tiene que arreglárselas para comer sin usar tenedor ni cuchillo.', { durationMin: 10 }),
  classicPro('aderezo-prohibido', 'Aderezo Prohibido', 'FOOD', Pipette,
    'Elegís un condimento o agregado de la mesa que la víctima tiene prohibido tocar hoy, o que debe ponerle a su próximo bocado.'),
  classicPro('degustacion-cruzada', 'Degustación Cruzada', 'FOOD', Cookie,
    'La víctima tiene que darle de comer un bocado en la boca a la persona sentada a su derecha.'),
  classicPro('fondo-hidratante', 'Fondo Hidratante', 'FOOD', GlassWater,
    'La víctima tiene que tomarse un vaso entero de agua sin parar antes de poder volver a tocar su comida o bebida.'),
  classicPro('bancarrota-social', 'Bancarrota Social', 'FOOD', Wallet,
    'La víctima se hace cargo de pagar tu próximo trago o el postre de los dos sin chistar.'),
  classicPro('veto-gastronomico-total', 'Veto Gastronómico Total', 'FOOD', CircleSlash,
    'Prohibís una bebida o ingrediente para toda la mesa durante los próximos 45 minutos.',
    { targetMode: 'table', special: 'ABSOLUTE' }),
  classicPro('cringe-digital', 'Cringe Digital', 'SOCIAL', Camera,
    'Subís una historia al Instagram o estado de WhatsApp de la víctima con una foto sacada en este momento.'),
  classicPro('ultima-foto', 'Última Foto', 'SOCIAL', Image,
    'La víctima tiene que mostrar a toda la mesa la última foto que sacó con su galería sin borrar nada antes.'),
  classicPro('buscador-expuesto', 'Buscador Expuesto', 'SOCIAL', Search,
    'La víctima debe desbloquear su teléfono y leer en voz alta sus últimas 3 búsquedas de Google o Instagram.'),
  classicPro('audio-random', 'Audio Random', 'SOCIAL', Mic,
    'La víctima debe mandarle un audio diciendo "No sabés lo que acaba de pasar, mañana te explico" a su tercer chat de WhatsApp.'),
  classicPro('doblaje-en-vivo', 'Doblaje en Vivo', 'SOCIAL', Clapperboard,
    'Durante 5 minutos, la víctima solo puede mover los labios en silencio mientras vos hablás por ella haciendo su voz.', { durationMin: 5 }),
  classicPro('llamada-en-altavoz', 'Llamada en Altavoz', 'SOCIAL', PhoneCall,
    'Elegís un contacto del celular de la víctima para llamarlo durante 30 segundos con el altavoz puesto en la mesa.'),
  classicPro('intercambio-de-identidad', 'Intercambio de Identidad', 'SOCIAL', Smartphone,
    'Cambiás tu celular desbloqueado con el de la víctima durante 2 minutos reloj.', { durationMin: 2 }),
  classicPro('la-cuenta-es-ley', 'La Cuenta es Ley', 'DESTINY', Receipt,
    'Vos decidís el método exacto de cómo se divide la cuenta o quién deja la propina hoy.'),
  classicPro('foto-oficial-ridicula', 'Foto Oficial Ridícula', 'DESTINY', Users,
    'Todos tienen que sacarse una foto grupal ahora mismo haciendo la pose que vos ordenes.'),
  classicPro('pausa-de-aire', 'Pausa de Aire', 'DESTINY', Wind,
    'Obligás a la víctima a levantarse ahora mismo y acompañarte afuera, a la barra o a dar una vuelta manzana.'),
  classicPro('secuestro-express', 'Secuestro Express', 'DESTINY', Car,
    'Decidís un cambio de lugar inmediato; la mesa tiene 10 minutos para pedir la cuenta y moverse.', { durationMin: 10 }),
  classicPro('decido-yo-absoluto', 'Decido Yo Absoluto', 'SPECIAL', Gavel,
    'Proponés una regla general para el resto de la noche y queda aprobada sin derecho a réplica ni escudos básicos.',
    { targetMode: 'table', special: 'ABSOLUTE' }),
  classicPro('saqueador-supremo', 'Saqueador Supremo', 'SPECIAL', Flame,
    'Le quemás una carta de Acción al azar de su mano a otro jugador sin que llegue a usarla.',
    { special: 'LOOTER', refusable: false }),
  classicPro('contraataque-letal', 'Contraataque Letal', 'DEFENSE', Swords,
    'No solo anulás la carta que te tiraron, sino que obligás al atacante a girar la Ruleta de Castigos inmediatamente.',
    { defenseEffect: 'COUNTER' }),
];

/* ================================================================== */
/* MODO HOT · exclusivo parejas · 30 activas + 20 PRO                  */
/* ================================================================== */

export const HOT_CATALOG: CardDef[] = [
  /* ---------- Previas y Cita Picante (8) ---------- */
  hot('hot-bajo-la-mesa', 'Bajo la Mesa', 'FOOD', HandHeart,
    'Durante los próximos 5 minutos de la cita, tu mano tiene que acariciar mi pierna por debajo de la mesa sin que nadie alrededor se dé cuenta.',
    { durationMin: 5 }),
  hot('hot-bocado-sensual', 'Bocado Sensual', 'FOOD', Cherry,
    'Me tenés que dar de probar algo de tu plato o postre directamente en la boca mirándome fijo a los ojos.'),
  hot('hot-labios-marcados', 'Labios Marcados', 'FOOD', Wine,
    'Tomá un sorbo de tu bebida y besame inmediatamente para que adivine o sienta el sabor en tus labios.'),
  hot('hot-pie-travieso', 'Pie Travieso', 'FOOD', Footprints,
    'Descalzate un pie por debajo de la mesa y rozá mi pierna suavemente durante los próximos 3 minutos.', { durationMin: 3 }),
  hot('hot-mirada-intimidante', 'Mirada Intimidante', 'FOOD', Eye,
    'Durante 2 minutos tenemos que sostenernos la mirada en silencio; el primero que se ría o desvíe la vista pierde una prenda apenas lleguemos a casa.',
    { durationMin: 2 }),
  hot('hot-susurro-gastronomico', 'Susurro Gastronómico', 'FOOD', Ear,
    'Acercate como si me fueras a comentar algo del menú, pero decime al oído qué parte de mi cuerpo tenés más ganas de besar hoy.'),
  hot('hot-manos-entrelazadas', 'Manos Entrelazadas', 'FOOD', Handshake,
    'Tus manos tienen que quedarse con las mías por 10 minutos acariciándome de la forma más sensual posible sin hablar.', { durationMin: 10 }),
  hot('hot-brindis-con-promesa', 'Brindis con Promesa', 'FOOD', Martini,
    'Chocamos las copas ahora mismo y me decís en voz baja algo que me prometés hacer esta noche cuando estemos solos.'),

  /* ---------- Tensión y Seducción Privada (10) ---------- */
  hot('hot-beso-con-condicion', 'Beso con Condición', 'SOCIAL', Heart,
    'En los próximos 10 minutos tenés que darme un beso lento en el cuello o detrás de la oreja cuando nadie nos esté mirando.',
    { durationMin: 10 }),
  hot('hot-susurro-al-oido', 'Susurro al Oído', 'SOCIAL', MessageCircleHeart,
    'Acercate ahora mismo y confesame al oído tu fantasía más picante conmigo que todavía no hayamos cumplido.'),
  hot('hot-confesion-erotica', 'Confesión Erótica', 'SOCIAL', Flame,
    'Decime cuál fue la vez que más te encendí desde que estamos juntos y qué fue exactamente lo que hice.'),
  hot('hot-elogio-al-cuerpo', 'Elogio al Cuerpo', 'SOCIAL', Sparkles,
    'Decime al oído cuáles son las 3 partes de mi cuerpo que más te vuelven loco/a y qué harías con cada una hoy.'),
  hot('hot-mordisco-suave', 'Mordisco Suave', 'SOCIAL', Candy,
    'La próxima vez que nos acerquemos o abracemos hoy, me tenés que dar un mordisco suave en el labio o en el cuello.'),
  hot('hot-juego-de-temperatura', 'Juego de Temperatura', 'SOCIAL', Thermometer,
    'Decime del 1 al 10 qué tan encendido/a estás en este momento y qué tendría que hacer yo ahora para subirlo un punto.'),
  hot('hot-prohibido-tocar', 'Prohibido Tocar', 'SOCIAL', Ban,
    'Durante los próximos 15 minutos podemos besarnos o hablarnos al oído, pero tenés prohibido tocarme con las manos.',
    { durationMin: 15 }),
  hot('hot-adelanto-tactil', 'Adelanto Táctil', 'SOCIAL', Fingerprint,
    'Guiá mi mano por debajo de la mesa o en un rincón privado hacia el lugar exacto donde quieras que te acaricie hoy.'),
  hot('hot-lectura-de-labios', 'Lectura de Labios', 'SOCIAL', Smile,
    'Desde el otro lado de la mesa, decime algo súper picante modulando sin sonido hasta que yo logre adivinar qué dijiste.'),
  hot('hot-pregunta-sin-filtro', 'Pregunta Sin Filtro HOT', 'SOCIAL', MessageCircleQuestion,
    'Puedo hacerte una pregunta íntima sobre tus gustos en la cama y tenés que responderme con total sinceridad.'),

  /* ---------- Intimidad en Casa (5) ---------- */
  hot('hot-prenda-a-eleccion', 'Prenda a Elección', 'DESTINY', Shirt,
    'Al llegar a casa, yo elijo qué prenda de ropa te sacás primero y cómo lo hacés, con la música que yo ponga.'),
  hot('hot-diez-minutos-de-masaje', 'Diez Minutos de Masaje', 'DESTINY', HandHeart,
    'Al terminar la cita, me debés un masaje sensual de 10 minutos en la zona del cuerpo que yo elija.'),
  hot('hot-camara-lenta', 'Cámara Lenta', 'DESTINY', Snail,
    'Durante los primeros 10 minutos cuando estemos en la cama hoy, todo lo que me hagas tiene que ser en cámara extremadamente lenta.'),
  hot('hot-maraton-de-besos', 'Maratón de Besos', 'DESTINY', Timer,
    'Antes de pasar a la acción principal en casa, tenés que recorrer mi cuerpo con besos desde el cuello hacia abajo durante 5 minutos reloj.'),
  hot('hot-beso-de-pelicula', 'Beso de Película', 'DESTINY', Film,
    'Apenas subamos al auto, ascensor o crucemos la puerta de casa, me tenés que acorralar contra la pared y darme el beso más intenso de la noche.'),

  /* ---------- Especiales HOT (2) ---------- */
  hot('hot-deseo-doble', 'Deseo Doble', 'SPECIAL', Dices,
    'Yo propongo dos retos sensuales para hoy cuando estemos a solas y vos tenés que elegir uno de los dos y cumplirlo sí o sí.'),
  hot('hot-pausa-intima', 'Pausa Íntima', 'SPECIAL', DoorOpen,
    'En los próximos 15 minutos tenemos que buscar un rincón a solas (auto, pasillo, entrada) para darnos un beso apasionado de 1 minuto.',
    { durationMin: 15 }),

  /* ---------- Defensa HOT (5) ---------- */
  hot('hot-cambio-de-rol', 'Cambio de Rol', 'DEFENSE', FlipHorizontal2,
    'Rebotín HOT: doy vuelta la apuesta. Lo que tu carta me pedía que te haga a vos, me lo tenés que hacer vos a mí hoy.',
    { defenseEffect: 'REFLECT' }),
  hot('hot-tension-acumulada', 'Tensión Acumulada', 'DEFENSE', Cloud,
    'Escudo HOT: anulo tu carta por ahora, pero a cambio te debo un beso apasionado de 1 minuto reloj apenas nos quedemos a solas.',
    { defenseEffect: 'NULLIFY' }),
  hot('hot-negociacion-intima', 'Negociación Íntima', 'DEFENSE', Scale,
    'Anulo esta carta, pero vos podés elegir qué prenda de ropa me tengo que sacar primero apenas entremos a casa.',
    { defenseEffect: 'NULLIFY' }),
  hot('hot-todo-o-nada-sensual', 'Todo o Nada Sensual', 'DEFENSE', Scissors,
    'Jugamos a Piedra, Papel o Tijera: si gano, se anula tu carta; si pierdo, la cumplo por el doble de tiempo.',
    { defenseEffect: 'DOUBLE_OR_NOTHING', rpsLose: 'double' }),
  hot('hot-pausa-de-seduccion', 'Pausa de Seducción', 'DEFENSE', CloudSun,
    'Bloqueo tu carta actual, pero te concedo 5 minutos de caricias donde vos me pidas al terminar la salida.',
    { defenseEffect: 'NULLIFY' }),

  /* ---------- PRO · Pack Noche Salvaje (20) ---------- */
  hotPro('hot-hielo-secreto', 'Hielo Secreto', 'FOOD', Snowflake,
    'Pasate un cubo de hielo por los labios o el cuello y después besame lento para sentir el contraste de temperatura.'),
  hotPro('hot-trago-al-cuerpo', 'Trago al Cuerpo', 'FOOD', GlassWater,
    'Cuando lleguemos a casa hoy, tengo derecho a tomar un sorbo de bebida o probar algo directamente sobre tu piel.'),
  hotPro('hot-postre-en-la-cama', 'Postre en la Cama', 'FOOD', Cake,
    'Nos llevamos algo dulce o una bebida a la cama para usarlo como parte del juego previo esta noche.'),
  hotPro('hot-el-ultimo-sorbo', 'El Último Sorbo', 'FOOD', CupSoda,
    'Quien termine último su copa actual le debe al otro 5 minutos de besos donde solo se puede usar la boca, sin manos.'),
  hotPro('hot-degustacion-a-ciegas', 'Degustación a Ciegas HOT', 'FOOD', EyeOff,
    'En casa te vendo los ojos y te doy a probar 3 cosas entre besos para que adivines qué son.'),
  hotPro('hot-audio-prohibido', 'Audio Prohibido', 'SOCIAL', Mic,
    'Alejate o andá al baño un minuto y mandame un audio por WhatsApp describiendo con lujo de detalles qué me vas a hacer apenas lleguemos a casa.'),
  hotPro('hot-foto-secreta', 'Foto Secreta Solo para Mí', 'SOCIAL', Camera,
    'Andá al baño o a otra habitación y mandame por WhatsApp (en modo "ver una sola vez") una foto sugerente solo para mis ojos.'),
  hotPro('hot-chat-en-vivo', 'Chat en Vivo Frente a Frente', 'SOCIAL', MessagesSquare,
    'Durante 3 minutos no podemos hablar en voz alta: tenemos que mandarnos mensajes bien calientes por WhatsApp mirándonos a la cara.',
    { durationMin: 3 }),
  hotPro('hot-silencio-absoluto', 'Silencio Absoluto', 'SOCIAL', VolumeX,
    'Reto en la cama: durante 10 minutos no podés emitir ni un solo sonido por más que yo intente provocarte al máximo.'),
  hotPro('hot-fantasia-de-rol', 'Fantasía de Rol', 'SOCIAL', Drama,
    'Durante los próximos 20 minutos actuamos como dos desconocidos que se acaban de gustar en un bar y se van juntos a casa.',
    { durationMin: 20 }),
  hotPro('hot-control-remoto', 'Control Remoto', 'DESTINY', Gamepad2,
    'Hoy cuando lleguemos a la cama, tenés los ojos vendados durante los primeros 15 minutos y yo decido todo lo que pasa.'),
  hotPro('hot-cambio-de-escenario', 'Cambio de Escenario', 'DESTINY', Sofa,
    'Hoy está prohibido empezar en la cama: el primer encuentro de la noche tiene que ser en otro lugar de la casa (ducha, sillón, pared).'),
  hotPro('hot-striptease-privado', 'Striptease Privado', 'DESTINY', Music2,
    'En casa me debés sacarte al menos 3 prendas bailando lentamente solo para mí antes de tocarnos.'),
  hotPro('hot-manos-atadas', 'Manos Atadas', 'DESTINY', Link,
    'Hoy durante 10 minutos en la intimidad tus manos quedan arriba de tu cabeza sin poder moverlas mientras yo tomo el control total.'),
  hotPro('hot-desafio-del-espejo', 'Desafío del Espejo', 'DESTINY', ScanFace,
    'Los primeros 10 minutos de intimidad cuando lleguemos a casa tienen que ser mirándonos frente a un espejo.'),
  hotPro('hot-ducha-compartida', 'Ducha Compartida', 'DESTINY', ShowerHead,
    'Apenas crucemos la puerta de casa, nos metemos directo a la ducha juntos con las luces bajas.'),
  hotPro('hot-vale-todo-en-casa', 'Vale Todo en Casa', 'SPECIAL', Ticket,
    'Comodín íntimo definitivo: al cruzar la puerta de casa, tenés que cumplir un deseo sensual a mi elección sin hacer preguntas.'),
  hotPro('hot-nos-vamos-ya', 'Nos Vamos Ya', 'SPECIAL', Car,
    'Pido la cuenta en este preciso instante; la cita afuera se termina porque nos vamos directo a casa ahora mismo.'),
  hotPro('hot-juguete-o-accesorio', 'Juguete o Accesorio', 'SPECIAL', Gift,
    'Yo elijo un elemento extra (venda, hielo, aceite de masajes o juguete) que sí o sí entra en acción esta noche.'),
  hotPro('hot-inversion-de-poder', 'Inversión de Poder Total', 'DEFENSE', Crown,
    'Anulás la carta de tu pareja, le robás el turno y ganás el control total de lo que se hace en los primeros 15 minutos en casa.',
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

/** Presupuesto semanal de cartas quemables, por modo. */
export const WEEKLY_BURNS = 10;

/** Jugadores máximos por sala (HOT es exclusivo de parejas). */
export const MAX_PLAYERS: Record<GameMode, number> = { classic: 12, hot: 2 };

/** Escalado de la mano según la cantidad de jugadores de la sala. */
export const handSizeFor = (players: number) =>
  players >= 7 ? { actions: 3, defenses: 2 } : { actions: 2, defenses: 1 };

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

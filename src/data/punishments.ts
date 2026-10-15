export interface Punishment {
  id: string;
  text: string;
  color: string;
}

/** Ruleta de Castigos (Veto Físico). Se cumple sí o sí. */
export const PUNISHMENTS: Punishment[] = [
  { id: 'ronda', text: 'Pagás la próxima ronda', color: '#FF5722' },
  { id: 'baile', text: 'Bailás 20 segundos sin música', color: '#FFD600' },
  { id: 'audio', text: 'Mandás un audio cantando a tu último chat', color: '#AA00FF' },
  { id: 'imitacion', text: 'Imitás a alguien de la mesa hasta que adivinen', color: '#00E5FF' },
  { id: 'ultimo-msj', text: 'Leés en voz alta tu último mensaje enviado', color: '#FF1744' },
  { id: 'perfil', text: 'Foto fea como perfil durante 1 hora', color: '#C6FF00' },
  { id: 'sentadillas', text: '10 sentadillas ahora mismo', color: '#FF5722' },
  { id: 'verguenza', text: 'Contás tu momento más vergonzoso', color: '#FFD600' },
  { id: 'tercera', text: 'Hablás en tercera persona 10 min', color: '#AA00FF' },
  { id: 'mozo', text: 'Le pedís un consejo de amor al mozo', color: '#00E5FF' },
  { id: 'brindis', text: 'Brindis épico de pie para toda la mesa', color: '#FF1744' },
  { id: 'galeria', text: 'La mesa ve tus últimas 5 fotos', color: '#C6FF00' },
];

/** Reglas que proponen los bots cuando juegan "Decido Yo Absoluto". */
export const BOT_RULES = [
  'Prohibido decir "no sé" por el resto de la noche',
  'El que mira el celular paga el agua',
  'Hay que brindar cada vez que alguien dice "literal"',
  'Todos tienen que decir "con todo respeto" antes de opinar',
  'Nadie puede cruzarse de brazos',
];

/** Retos HOT: exclusivos de pareja, privados y siempre con consentimiento. */
export const HOT_PUNISHMENTS: Punishment[] = [
  { id: 'h-beso-lento', text: 'Un beso lento de 10 segundos, ahora', color: '#1A0006' },
  { id: 'h-masaje-manos', text: 'Masaje de manos de 2 minutos', color: '#FFD166' },
  { id: 'h-tres-cosas', text: 'Decime al oído 3 cosas que te encantan de mí', color: '#FF4D6D' },
  { id: 'h-recuerdo', text: 'Contame tu recuerdo favorito de nosotros', color: '#FFF1C9' },
  { id: 'h-beso-elegido', text: 'Me debés un beso donde yo elija (a solas)', color: '#1A0006' },
  { id: 'h-mensaje', text: 'Mandame un mensaje romántico ahora, frente a mí', color: '#FFD166' },
  { id: 'h-lento', text: 'Bailamos un lento al llegar a casa', color: '#FF4D6D' },
  { id: 'h-primera-vez', text: 'Confesá qué pensaste la primera vez que me viste', color: '#FFF1C9' },
  { id: 'h-proxima-cita', text: 'La próxima cita la elijo yo y la pagás vos', color: '#1A0006' },
  { id: 'h-abrazo', text: 'Abrazo de 30 segundos sin soltarme', color: '#FFD166' },
  { id: 'h-plan', text: 'Susurrame tu plan ideal para esta noche', color: '#FF4D6D' },
  { id: 'h-desayuno', text: 'Mañana me llevás el desayuno a la cama', color: '#FFF1C9' },
];

/** Reglas que imponen los bots en salas HOT (si alguna carta lo requiere). */
export const HOT_BOT_RULES = [
  'Cada vez que alguien dice "amor", hay un beso',
  'Para pedir algo hay que decir "por favor, bombón"',
  'Prohibido mirar el celular: el que lo hace debe un masaje',
];

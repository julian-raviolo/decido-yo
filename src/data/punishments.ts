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

/** Retos HOT: picantes pero soft. Siempre con consentimiento; nadie toca a nadie sin un "sí". */
export const HOT_PUNISHMENTS: Punishment[] = [
  { id: 'h-oido', text: 'Susurrá un cumplido al oído de quien elija la mesa', color: '#1A0006' },
  { id: 'h-mirada', text: '20 segundos de mirada fija con quien tengas enfrente', color: '#FFD166' },
  { id: 'h-mejilla', text: 'Beso en la mejilla a quien tengas a tu derecha', color: '#FF4D6D' },
  { id: 'h-lento', text: 'Lento de 20 segundos con quien elija la mesa', color: '#FFF1C9' },
  { id: 'h-atraccion', text: 'Contá qué es lo primero que te atrae de alguien', color: '#1A0006' },
  { id: 'h-confesion', text: 'Confesá tu crush famoso más vergonzoso', color: '#FFD166' },
  { id: 'h-pickup', text: 'Tirale tu mejor frase de levante a alguien de la mesa', color: '#FF4D6D' },
  { id: 'h-emoji', text: 'Mandá un 😈 a tu último chat, sin explicar nada', color: '#FFF1C9' },
  { id: 'h-poema', text: 'Improvisá un poema romántico de 4 versos', color: '#1A0006' },
  { id: 'h-mano', text: 'De la mano con quien elija la mesa por 5 minutos', color: '#FFD166' },
  { id: 'h-selfie', text: 'Selfie de "pareja" con quien elija la mesa', color: '#FF4D6D' },
  { id: 'h-cita', text: 'Contá tu cita ideal con lujo de detalles', color: '#FFF1C9' },
];

/** Reglas que imponen los bots con "Ley del Diablo". */
export const HOT_BOT_RULES = [
  'Cada vez que alguien dice "amor", brinda mirando a los ojos',
  'Para pedir algo hay que decir "por favor, bombón"',
  'El que se ríe primero en un silencio, tira un beso volado',
  'Prohibido decir "no"; solo "quizás más tarde"',
];

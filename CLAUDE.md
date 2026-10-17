# Decido Yo — Guía para Claude Code

Juego de cartas social (PWA mobile-first, español rioplatense) para jugar de noche en bares, citas y juntadas, cada uno desde su celular. Modos **Clásico** y **HOT** (parejas). Ver `README.md` para reglas del juego y despliegue.

## Stack

Next.js 14 (App Router) · React 18 · TypeScript · Tailwind 3 (tokens por CSS vars según `data-mode`) · Framer Motion 11 · lucide-react. Estado en `src/context/GameContext.tsx`; salas en memoria (`src/server/rooms.ts`) sincronizadas por SSE.

```bash
npm run dev            # desarrollo (http://localhost:3000)
npx tsc --noEmit       # tipos
npm run build          # build de producción (debe pasar antes de commitear)
```

## Sistema de diseño UI/UX (se usa por defecto)

Toda tarea que toque UI (`src/app/**`, `src/components/**`, `src/app/globals.css`, `tailwind.config.ts`) sigue estas guías **aunque el usuario no las nombre**:

| Comando | Para qué |
| --- | --- |
| `/ui-ux-pro-max` | Design System: layout 430px, tipografía, paletas Clásico/HOT, targets ≥ 44px, densidad sin scroll |
| `/taste-skill` | Criterio estético: Neo-Brutalismo Pop refinado, jerarquía, contraste, micro-interacciones, anti "look de IA" |
| `/referencias` | Inspiración: Exploding Kittens + Spotify Wrapped + Duolingo |
| `/impeccable` | Auditoría visual pantalla por pantalla con corrección automática |

Los archivos están en `.claude/commands/`. Leé `ui-ux-pro-max.md` y `taste-skill.md` antes de cualquier cambio visual.

## Forma de trabajo

- Hacer sólo la tarea pedida, sin subagentes de construcción/auditoría (se quitaron).
- Verificar con `npx tsc --noEmit` y `npm run build`. No enviar capturas ni imágenes al usuario salvo que las pida.
- Ahorrar tokens: respuestas breves.

## Reglas que no se negocian

- Bordes negros, sombras duras (`shadow-brutal*`), radios `rounded-2xl` / `rounded-3xl` / `rounded-full`.
- Un solo fondo global (`<AppBackground />`, `.bg-dots` / `.bg-dots-hot`); el `body` es transparente.
- Todo se prueba en **Clásico y HOT** y en anchos de 360 a 430px.
- `dvh` en lugar de `vh`; inputs ≥ 16px; nada que rompa la hidratación (usar `hydrated`).
- Copy en español rioplatense con "vos". HOT: siempre con consentimiento y sin exponer a nadie.
- Los pagos son simulados (`PayModal`); no conectar cobros reales sin pedido explícito.
- Commits con autor `Claude <noreply@anthropic.com>`.

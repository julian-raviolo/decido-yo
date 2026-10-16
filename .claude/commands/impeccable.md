---
description: Auditoría visual implacable pantalla por pantalla (inicio, sala, mazo) que detecta y corrige errores de UI en mobile.
argument-hint: "[archivo o pantalla opcional; por defecto audita las 3 pantallas]"
---

# /impeccable — Auditoría visual implacable

Auditá y **corregí** la UI de: **$ARGUMENTS**. Si está vacío, auditá las tres pantallas en este orden:

1. `src/app/page.tsx` (inicio)
2. `src/app/sala/page.tsx` (sala, con `src/components/room/*`)
3. `src/app/mazo/page.tsx` (mazo + `src/components/UnlockCardModal.tsx`)

Más lo compartido: `src/app/layout.tsx`, `src/app/globals.css`, `src/components/ui.tsx`, `src/components/GameCard.tsx`, `src/components/AppBackground.tsx`.

No sos un revisor amable: si algo está "casi bien", está mal. Corregí lo que encuentres; reportá sólo lo que no se pueda corregir sin una decisión de producto.

---

## Proceso

1. **Leé** cada archivo completo antes de opinar.
2. **Corré la app** (`npm run build && npx next start -p 3123`) y sacá capturas con Playwright (Chromium ya instalado en `/opt/pw-browsers`; no correr `playwright install`) en:
   - 360×640, 390×844 y 430×932, con `isMobile: true, hasTouch: true, deviceScaleFactor: 2`;
   - modo **Clásico** y modo **HOT** (`document.documentElement.dataset.mode`, o el botón HOT + "Soy +18, activar HOT");
   - inicio arriba y scrolleado al final; sala con 2 jugadores (crear sala + unirse desde un segundo contexto) y sala de bots con 5+ jugadores; mazo y el preview de una carta PRO.
3. **Mirá** las capturas (no asumas). Escuchá también `pageerror` y errores de hidratación.
4. **Corregí** cada hallazgo, reconstruí y volvé a capturar hasta que la lista quede vacía.
5. Verificá `npx tsc --noEmit` y `npm run build` sin errores.

## Checklist

### A. Fondos y alturas
- [ ] El fondo cubre **todo** el viewport (bordes, notch, overscroll) — un solo `<AppBackground />` `fixed inset-0 -z-10`; ninguna página pinta fondo propio; `body` transparente.
- [ ] Nada usa `100vh`/`h-screen`: siempre `dvh`.
- [ ] Safe areas respetadas arriba y abajo.
- [ ] La sala no tiene scroll de página; sólo la mesa scrollea.

### B. Texto
- [ ] Ningún texto desborda su contenedor (probá nombres largos tipo "MARIANELA", códigos, labels de escenario).
- [ ] `truncate` / `line-clamp-*` donde haya texto variable; `min-w-0` en hijos flex que truncan.
- [ ] Sin palabras huérfanas feas en títulos; sin cortes de palabra en botones.
- [ ] Inputs ≥ 16px.

### C. Alineación al pixel
- [ ] Elementos hermanos con mismo alto, mismo radio, mismo borde y misma sombra.
- [ ] Íconos centrados ópticamente con el texto (`items-center`, tamaños 11/14/16/18/20).
- [ ] Gaps en escala (1, 1.5, 2, 3, 4); sin márgenes mágicos sueltos.
- [ ] Sombras que no se cortan por `overflow-hidden` del padre.

### D. Contraste
- [ ] Textos con información ≥ 4.5:1 (≥ 3:1 si son grandes/negritas) en **Clásico y HOT**.
- [ ] Nada de `text-white/40` con información útil; nada de amarillo sobre crema ni rojo sobre rojo.
- [ ] Estados activos/inactivos distinguibles sin depender sólo del color.

### E. Capas y modales (z-index)
- [ ] Orden actual: fondo `-z-10` < contenido < carta en foco de la mano (overlay de `HandDock`, `z-40`) < `Sheet` / `IncomingModal` / `EvidenceModal` (`z-50`) < `RpsModal` (`z-[60]`) < `RouletteModal` (`z-[70]`). Un componente nuevo se ubica en esta escala, no inventa valores.
- [ ] Ningún modal queda detrás de la mano o del header; el backdrop cubre toda la pantalla.
- [ ] Los modales scrollean por dentro (`max-h-[92dvh] overflow-y-auto`) y no se cortan en 360×640.
- [ ] No se puede interactuar con lo que está detrás de un overlay bloqueante.

### F. Tamaños en pantallas chicas
- [ ] En 360×640 la mano entra completa (abanico si hay más de 3 cartas) y la mesa conserva altura útil.
- [ ] Targets táctiles ≥ 44×44px.
- [ ] El hero del inicio no empuja "Crear sala" fuera de la primera pantalla en 390×844.
- [ ] Las cartas `lg` del preview entran sin scroll horizontal.

### G. Consistencia con el sistema
- [ ] Sólo bordes negros, sombras duras `shadow-brutal*`, radios `rounded-2xl`/`rounded-3xl`/`rounded-full`.
- [ ] Ningún color hardcodeado que ya exista como token.
- [ ] Animaciones con spring y con propósito (ver `/taste-skill`).

## Reporte final

Tabla con: **pantalla · problema · severidad (alta/media/baja) · corrección aplicada · captura antes/después**. Cerrá con la lista de cosas que necesitan decisión de producto (si hay) y confirmá build + tsc en verde.

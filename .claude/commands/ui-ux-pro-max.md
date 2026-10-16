---
description: Define y aplica el Design System de Decido Yo (tipografía mobile-first, paletas Clásico/HOT, targets táctiles, densidad sin scroll).
argument-hint: "[pantalla o componente a diseñar/ajustar]"
---

# /ui-ux-pro-max — Design System de Decido Yo

Aplicá este Design System a: **$ARGUMENTS** (si está vacío, a la tarea de UI en curso). Combinalo siempre con `/taste-skill`.

## 0. Contexto de negocio (por qué el sistema es así)

**Decido Yo** es un juego de cartas social para jugar **de noche, en bares, citas y juntadas**, cada uno desde su celular. Eso define todo:

- **Luz baja y pantallas con brillo bajo** → fondos oscuros, alto contraste, colores saturados.
- **Una mano ocupada (vaso, comida)** → todo se opera con el pulgar, en la mitad inferior de la pantalla.
- **Atención fragmentada (se está charlando)** → el estado del juego se entiende de un vistazo en < 2 segundos.
- **Momento social** → las acciones tienen que sentirse físicas y divertidas (tirar una carta, defenderse, la ruleta).
- **Modo HOT (parejas)** → misma estructura, tono más íntimo: rojo/magenta, ángeles y diablitos, privacidad ante todo.

## 1. Layout mobile-first

- Contenedor único: `mx-auto w-full max-w-[430px] px-4` (definido en `src/app/layout.tsx`). Nada se diseña más ancho.
- Safe areas: `pt-[max(1rem,env(safe-area-inset-top))]` y `pb-[max(1rem,env(safe-area-inset-bottom))]`.
- Altura: usar `dvh` (`min-h-dvh`, `h-dvh`), nunca `100vh`.
- El fondo es **un solo** `<AppBackground />` `fixed inset-0 -z-10` (clases `.bg-dots` / `.bg-dots-hot`). Ninguna página pinta su propio fondo; el `body` es transparente.
- La sala (`src/app/sala/page.tsx`) es una pantalla fija `h-dvh` sin scroll de página: header → jugadores → info de mesa → restricciones → mesa (única zona con scroll) → mano.
- Pantallas de referencia: 360×640 (chica), 390×844 (estándar), 430×932 (grande).

## 2. Escala tipográfica

`html { font-size: 95% }` — todo lo que usa `rem` sale un 5% más compacto. Usá sólo estos pasos:

| Rol | Clases |
| --- | --- |
| Hero / logo | `font-display font-black uppercase` 56–64px, `leading-none` |
| Título de pantalla | `font-display text-3xl font-black uppercase leading-none` |
| Título de sección | `font-display text-lg`–`text-xl font-black uppercase` |
| CTA principal | `font-display text-base`–`text-lg font-black uppercase` |
| Cuerpo | `text-sm font-semibold` (mínimo `text-xs` en textos secundarios) |
| Meta / labels | `text-[10px]`–`text-[11px] font-black uppercase tracking-widest` |
| Mínimo absoluto | `text-[9px]` sólo en etiquetas de una palabra bajo un ícono |

Inputs: siempre ≥ 16px (ya forzado en `globals.css`) para evitar el zoom de iOS.

## 3. Paletas

Los colores temáticos viven en CSS vars (`:root` y `:root[data-mode='hot']`) y se usan vía Tailwind (`bg-panel`, `bg-lime`, `text-special`, `bg-felt`…). `GameContext` pone `data-mode` en `<html>`.

### Clásico (noche de bar)
| Token | Valor | Uso |
| --- | --- | --- |
| fondo base | `#121212` + brillo naranja arriba, violeta abajo, lima sutil | `.bg-dots` |
| `panel` | `rgb(30 30 30)` | secciones y tarjetas |
| `lime` (acento) | `#C6FF00` | estado activo, números clave, `shadow-brutal-accent` |
| `special` | `#FF1744` | peligro, salir, cartas especiales |
| `food` | `#FF5722` (naranja) | categoría Comida |
| `social` | `#FFD600` (amarillo) | categoría Social, código de sala |
| `destiny` | `#AA00FF` | categoría Destino |
| `defense` | `#00E5FF` (cian) | escudos y defensas |
| `cream` | `#FFFDF7` | superficies claras, texto principal sobre oscuro |

### HOT (pareja, ángel o diablo)
| Token | Valor | Uso |
| --- | --- | --- |
| fondo base | rojo `#9E0014` con resplandor rosado arriba, magenta abajo, ángeles y diablitos sutiles | `.bg-dots-hot` |
| tono más oscuro | `#14080e` / `devil #1A0006` | profundidad, botón HOT activo |
| `panel` | `rgb(96 0 14)` (bordó) | secciones |
| `lime` (acento) | `#FFD166` (dorado/halo) | estado activo |
| magenta / rojo | `#FF4D6D`, `#FF1744`, `rgba(255,0,140)` | barras, énfasis, brillos |
| `angel` / `halo` | `#FFF1C9` / `#FFD166` | escudos HOT, aureolas |

Reglas: un acento por bloque; texto negro sobre amarillo/lima/cian/crema/dorado; texto blanco sobre rojo/violeta/panel. Verificá contraste en los dos modos.

## 4. Targets táctiles

- **Mínimo 44×44px** para todo lo presionable (`h-11 w-11` en botones de ícono). Botones principales: `py-3`, ancho completo.
- Separación mínima de 8px (`gap-2`) entre targets adyacentes.
- Lo frecuente (mano, tirar, defender) va en el **tercio inferior**; lo destructivo (salir) arriba y con confirmación.
- Elementos pequeños (pills, chips de info) **no son interactivos**; si lo son, ampliá el área con padding.
- Gestos (swipe para tirar la carta) siempre tienen alternativa con tap.

## 5. Densidad de información sin scroll innecesario

- **Inicio**: nombre, modo, modalidad/escenario, mazo y "Crear sala" tienen que verse en 390×844 sin scrollear. Lo secundario (bots, reglas) va abajo.
- **Sala**: cero scroll de página. La info de mesa es **una línea** de pills (`👥 n · ⚡a 🛡d`, escenario corto, usos).
- **Mazo**: grilla de 3 columnas de cartas mini; el detalle va en el modal de preview, no en la grilla.
- Preferí íconos + números a frases (`⚡30 · 👑0/20` en lugar de "30 cartas activas y 0 de 20 PRO").
- Texto completo disponible bajo demanda (`title`, preview, sheet), no siempre visible.
- Una línea de texto meta por bloque como máximo.

## 6. Componentes base (reutilizar, no reinventar)

`src/components/ui.tsx`: `BrutalButton` (variants `lime | yellow | cream | cyan | red | dark`), `Sheet` (modal inferior), `Avatar`, `Pill`. `src/components/GameCard.tsx`: cartas (`mini | md | lg`, estados `ready | burned | pro`). `src/components/PayModal.tsx`: checkout simulado.

## 7. Entregable

Al aplicar este sistema, documentá en la respuesta: qué tokens usaste, qué cambió en jerarquía/densidad y cómo se ve en 360px y 430px de ancho, en Clásico y en HOT.

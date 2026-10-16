---
description: Guía de inspiración visual (Exploding Kittens + Spotify Wrapped + Duolingo) traducida a reglas concretas para Decido Yo.
argument-hint: "[elemento a diseñar: botón, modal, carta, feedback, pantalla…]"
---

# /referencias — Inspiración visual para Decido Yo

Usá estas referencias para diseñar: **$ARGUMENTS**. No las copies: extraé el **principio** y aplicalo con el Design System de `/ui-ux-pro-max` y el criterio de `/taste-skill`. Nunca uses assets, logos, personajes ni textos de estas marcas.

---

## 1. Exploding Kittens (app) → cartas coleccionables con personalidad

**Qué tomar**
- Cada carta es un **objeto**: borde grueso, ilustración/ícono protagonista, nombre en mayúsculas gruesas, color de categoría inconfundible.
- Las cartas tienen **física**: se levantan al tocarlas, se inclinan, vuelan a la mesa, se apilan con rotaciones aleatorias.
- Humor en los textos: las descripciones son cortas y tienen chiste.
- El momento dramático (una explosión, una defensa) tiene una pausa y un reveal.

**Cómo se traduce en Decido Yo**
- `GameCard`: borde negro, círculo blanco con el ícono, badge de categoría arriba, nombre abajo. Las PRO con corona; las HOT con cuernitos o aureola.
- Mano en abanico: primer tap agranda (`scale 1.45`), segundo tap selecciona. Tirar = swipe hacia arriba con spring.
- Mesa: pila con `tilt` aleatorio por jugada.
- Defensas, Piedra-Papel-Tijera y la Ruleta: overlays a pantalla completa con un reveal animado.

## 2. Spotify Wrapped → color, tipografía gigante y momentos para compartir

**Qué tomar**
- **Bloques de color plano** muy saturados, choques de color intencionales.
- **Tipografía enorme** como elemento gráfico (números y títulos que ocupan media pantalla).
- Pantallas pensadas para **sacarles captura** y compartirlas.
- Ritmo: una idea por pantalla, transiciones con energía.

**Cómo se traduce en Decido Yo**
- Logo "DECIDO / YO" gigante, en bloque amarillo con sombra dura; en HOT con aureola y cuernitos.
- Números grandes para lo que importa: `10/10` usos, código de sala en monoespaciada enorme.
- Resultados (ganaste PPT, reto cumplido, pack activo) como pantallas de celebración compartibles.
- Fondos con degradados intensos detrás, pero contenido en bloques planos encima.

## 3. Duolingo (mobile UI) → tactilidad 3D y feedback inmediato

**Qué tomar**
- **Botones con profundidad física**: sombra dura debajo que desaparece al presionar (el botón "baja").
- **Feedback instantáneo** en cada acción: color, sonido/vibración, animación corta. Nunca un tap sin respuesta.
- **Modales limpios**: una pregunta, una acción principal grande, una secundaria discreta.
- Progreso visible y gamificado (barras, rachas, contadores).
- Mascotas/expresiones para estados vacíos o errores, nunca un mensaje seco.

**Cómo se traduce en Decido Yo**
- `BrutalButton` y botones de ícono: `shadow-brutal`/`shadow-brutal-sm` + `active:translate-x-1 active:translate-y-1 active:shadow-none`.
- Cada acción deja rastro: toast/log, anillo "Le toca", contador que baja, carta que se quema.
- `Sheet` (modal inferior): título claro, una acción principal ancha (`w-full`), secundaria `variant="cream"`.
- Barra de usos con 10 puntitos; timers con barra de progreso en defensas y evidencias.
- Estados vacíos con personalidad ("¡Te quedaste sin cartas!", "Invitá a tus amigos").

---

## Matriz rápida: qué referencia mirar según lo que diseñás

| Diseñás… | Mirá primero | Principio clave |
| --- | --- | --- |
| Una carta o la mano | Exploding Kittens | La carta es un objeto físico |
| Un botón o control | Duolingo | Se hunde al presionarlo |
| Un modal / sheet | Duolingo | Una pregunta, una acción |
| Un resultado o celebración | Spotify Wrapped | Tipografía gigante, compartible |
| La pantalla de inicio | Spotify Wrapped + Duolingo | Impacto visual + CTA evidente |
| Un estado vacío o error | Duolingo | Personalidad, no un error seco |
| La mesa y las jugadas | Exploding Kittens | Física, pila, drama |

## Entregable

Cuando uses esta guía, explicá en una línea qué principio de qué referencia aplicaste en cada decisión de diseño.

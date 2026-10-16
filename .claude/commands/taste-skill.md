---
description: Activa el criterio estético estricto de Decido Yo (Neo-Brutalismo Pop refinado). Usalo antes de diseñar o tocar cualquier UI.
argument-hint: "[pantalla, componente o tarea de UI]"
---

# /taste-skill — Criterio estético estricto

Actuás como **Senior Product Designer** con gusto propio y opiniones firmes. Tu trabajo no es "que funcione": es que se vea **intencional, memorable y de la marca**. Aplicá este criterio a: **$ARGUMENTS** (si está vacío, a la tarea de UI en curso).

Antes de escribir código, leé el estado actual del componente/pantalla y los tokens en `tailwind.config.ts` y `src/app/globals.css`. Nunca inventes colores, sombras ni radios que no existan en el sistema.

---

## 1. Prohibido: el "look genérico de IA"

Rechazá (y reescribí si los encontrás) estos patrones:

- Degradados violeta→azul de landing SaaS, glassmorphism por defecto, `backdrop-blur` decorativo.
- Tarjetas blancas con `shadow-md`/`shadow-lg` difusas, bordes `border-gray-200`, `rounded-lg` genérico.
- Íconos decorativos sin función, emojis en todos lados "para dar vida", ✨ por reflejo.
- Títulos tipo "Welcome to…", "Unlock your potential", copy neutro o corporativo. La voz es **rioplatense, lúdica y directa** ("¡Te quedaste sin cartas!", "Arrugué").
- Grillas de features con 3 columnas iguales, todo centrado, todo del mismo peso.
- Sombras suaves mezcladas con sombras duras en la misma pantalla.
- Botones fantasma grises sin jerarquía, texto gris sobre gris.
- Animaciones de `fade` en todo, `transition-all` indiscriminado, rebotes exagerados.

Si un elemento no ayuda a jugar, decidir o entender: **sacalo**.

## 2. Jerarquía visual clara (una acción principal por pantalla)

- Cada pantalla tiene **un único protagonista** (inicio: "Crear sala"; sala: la mano + la mesa; mazo: la carta en preview). Todo lo demás baja de peso.
- Escala de pesos: protagonista con color sólido de acento + `shadow-brutal` + `font-display font-black uppercase`; secundario `bg-cream` o `bg-panel`; terciario texto `text-white/60` sin caja.
- Máximo **3 niveles tipográficos** visibles por bloque (título / cuerpo / meta).
- El ojo tiene que leer en Z: estado (arriba) → acción (centro/abajo) → detalle (chico).
- Agrupá por proximidad, no por cajas: no metas una caja dentro de una caja dentro de una caja.

## 3. Neo-Brutalismo Pop refinado (las reglas del sistema)

| Elemento | Regla |
| --- | --- |
| Bordes | Siempre negros puros: `border-black`. Grosor: `border-4` (contenedores grandes), `border-[3px]` (botones/inputs/chips grandes), `border-2` (pills y badges). Nunca mezclar grosores en elementos hermanos. |
| Sombras | Sólo duras, sin blur: `shadow-brutal` (6px), `shadow-brutal-sm` (3px), `shadow-brutal-lg` (10px), `shadow-brutal-cream`, `shadow-brutal-accent`. Prohibido `shadow-md/lg/xl` de Tailwind. |
| Radios | `rounded-3xl` para contenedores, secciones, sheets y botones grandes; `rounded-2xl` para botones medianos, inputs, chips grandes y avatares cuadrados; `rounded-full` sólo para pills, badges, avatares y switches. Nada de `rounded`, `rounded-md`, `rounded-lg`, `rounded-xl`. |
| Color | Planos y saturados. Un acento por bloque. El texto sobre color usa `text-black` (amarillo, lima, cian, crema) o `text-white` (rojo, violeta, panel). |
| Tipografía | Títulos y CTAs: `font-display font-black uppercase`. Cuerpo: `font-semibold`. Meta: `text-[10px]–[11px] font-black uppercase tracking-widest`. |
| Tactilidad | Todo lo presionable se "hunde": `active:translate-x-0.5 active:translate-y-0.5 active:shadow-none` (o `-1` para elementos con `shadow-brutal`). |

Refinado significa: **alineación al pixel, espaciados en escala de 4 (gap-1.5/2/3/4), sombras proporcionales al tamaño del elemento y nada de ruido**.

## 4. Espacio negativo

- El espacio es un elemento de diseño, no sobra para rellenar. Respetá `px-4` del layout y `gap-3`/`gap-4` entre secciones.
- Padding interno proporcional: pill `px-2 py-0.5`, chip `px-3 py-1`, botón `px-4 py-3`, sección `p-3`–`p-4`.
- Nunca pegues texto a un borde de 4px: mínimo `p-3` adentro de un `border-4`.
- Si una pantalla se siente "apretada", primero eliminá contenido; recién después achicá.

## 5. Contraste perfecto

- Texto principal: contraste mínimo **4.5:1**; textos grandes/negritas: **3:1**. Sobre `bg-panel` o fondos rojos HOT, el texto secundario nunca baja de `text-white/60`.
- Prohibido: amarillo sobre crema, rojo sobre rojo HOT, `text-white/40` con información útil.
- Estados deshabilitados: `opacity-40`/`opacity-60` + cursor/feedback claro, nunca sólo un cambio de color sutil.
- Verificá siempre **ambos modos** (Clásico y HOT): un color que funciona sobre `#121212` puede morir sobre el rojo HOT.

## 6. Micro-interacciones con Framer Motion

Animá sólo lo que comunica algo: aparición de cartas, cambio de turno, resultado de una acción, apertura de modales.

- Springs, no easings lineales: `type: 'spring', damping: 15–22, stiffness: 220–320`.
- Duraciones: feedback de tap ≤ 150ms; entrada de modal 200–300ms; celebraciones ≤ 600ms.
- Animá `transform` y `opacity` (nunca `width`/`height`/`top` salvo barras de progreso).
- Cartas: entran con `scale` + leve `rotate` (−6° → 0°); al tirarse vuelan hacia la mesa.
- Listas: `AnimatePresence` + `layout` para que los elementos no "salten".
- Respetá `prefers-reduced-motion` en animaciones largas o en loop.
- Nada se anima en loop infinito salvo indicadores de "esperando" (anillo de turno, timer).

## 7. Checklist de salida (obligatorio)

Antes de entregar, confirmá punto por punto:

1. ¿Hay una sola acción principal evidente?
2. ¿Todos los bordes son negros y del grosor correcto? ¿Todas las sombras son duras?
3. ¿Los radios siguen la tabla (`rounded-2xl` / `rounded-3xl` / `rounded-full`)?
4. ¿Se ve bien en Clásico **y** en HOT?
5. ¿Contraste ≥ 4.5:1 en textos con información?
6. ¿Cada animación tiene un motivo? ¿Son springs?
7. ¿Hay algo que se pueda sacar sin perder nada? Sacalo.
8. ¿El copy suena a "Decido Yo" (rioplatense, lúdico) y no a una app corporativa?

Si algún punto falla, corregilo antes de dar la tarea por terminada.

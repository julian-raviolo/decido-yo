# Decido Yo 🃏

Web-app mobile-first (PWA) para jugar presencialmente en citas o juntadas: las cartas alteran las decisiones reales de la salida.

## Arrancar

```bash
npm install
npm run dev     # http://localhost:3000
```

Abrilo en modo responsive (≈390px) o desde el celular en la misma red (`http://<tu-ip>:3000`).

## Jugar con amigos (cada uno en su celular)

```bash
npm run dev -- -H 0.0.0.0      # o: npm run build && npm start -- -H 0.0.0.0
ipconfig getifaddr en0         # IP de la Mac, ej. 192.168.0.23
```

Todos en el mismo wifi abren `http://<IP>:3000`. Uno toca **Crear sala** y comparte el código (o el link
`/?sala=CODIGO`); los demás lo ponen en **Unirme**. La Mac hace de servidor: las salas viven en memoria
(`src/server/rooms.ts`) y se sincronizan por Server-Sent Events. Si se reinicia el servidor, las salas se cierran.

**Probar con bots** (sección chica del inicio) crea una sala local sólo en tu celular (1 a 11 bots en Clásico, 1 en HOT).

## Reglas

| Regla | Dónde |
| --- | --- |
| **Configuración de sala**: Modo (Clásico / HOT) · Modalidad (Presencial / Online) · Escenario (🍔 Bar, 🏠 Casa, 🍾 Previa, 🧉 Libre; Online = 📱 Remoto) | `src/app/page.tsx`, `Room.environment/scenario` |
| **100 cartas** (50 Clásico + 50 HOT, cada modo 30 activas + 20 PRO) con etiquetas de escenario | `src/data/cards-catalog.ts` |
| Reparto filtrado por modo + escenario + desbloqueo + no quemada esta semana | `drawCard()` en `src/lib/deck.ts` |
| Mano: **2–6 jugadores → 2 Acción + 1 Escudo** · **7–12 → 3 + 2** | `handSizeFor()` |
| **10 usos por semana** por modo (reinicio lunes 00:00) | `weeklyBurnsRemaining` |
| **Re-barajar mano**: 2 gratis por semana, después $0.50 (pago simulado) | `reshuffleHand()`, `Economy` |
| **Recargar mano** al quedarse sin cartas o sin usos: $0.50 (mano de 3) / $0.83 (mano de 5); suma esos usos | `rechargeHand()` |
| **Expansión PRO** $2.00 o prueba gratis con reto (hasta el lunes) | `CardPreviewModal` |
| **Modo Online**: al cumplir, la víctima sube prueba (foto o texto, 120 s) y la sala vota 👍/👎; si pierde → Ruleta | `Evidence.tsx`, `evidenceTick` |
| HOT: exclusivo parejas; en Online la prueba es sólo texto (las fotos no pasan por la app) | — |

Todos los pagos son **simulados** (no se cobra nada): están listos para conectar un checkout real.

## Estructura

```
src/
  app/                 page.tsx (inicio) · sala/ · mazo/ · api/rooms/* (servidor de salas)
  components/          GameCard, ui
  components/room/     PlayersBar, TableZone, HandDock (swipe), IncomingModal, RpsModal, RouletteModal, Sheets
  context/GameContext  estado + motor de reglas + bots
  data/                cards-catalog.ts (clásico + HOT) · punishments.ts
  lib/                 deck.ts · realtime.ts (reducer + transportes) · storage.ts
  server/rooms.ts      salas en memoria
```

## Publicarlo en internet (Render, gratis)

El repo trae un `render.yaml` listo:

1. Entrá a https://dashboard.render.com y logueate con GitHub.
2. **New → Blueprint** → elegí `julian-raviolo/decido-yo` → **Apply**.
3. En ~5 minutos te da una URL `https://decido-yo-xxxx.onrender.com`. Cada push a `main` se publica solo.

Notas:
- Las salas viven en la memoria del servidor, por eso es **una sola instancia**.
- El plan gratis "duerme" el servidor tras ~15 min sin uso: la primera visita tarda ~1 min en despertar y
  las salas abiertas se pierden al dormirse (mientras alguien juega, se mantiene despierto).
- Para algo más robusto: plan pago de Render (no duerme) o mover `src/server/rooms.ts` a Supabase / Redis.

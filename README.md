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

**Probar con bots** (sección chica del inicio) crea una sala local sólo en tu celular, con 1 a 14 bots.

## Reglas

| Regla | Dónde |
| --- | --- |
| Mazo semanal de **10 cartas** (7 Acción + 3 Defensa) sorteadas cada lunes del catálogo completo | `src/lib/deck.ts` |
| Reparto 1+1 al entrar a una sala; sólo se quema lo que se usa | `buildMe()` / `burn()` |
| Mesa de **5+**: 1 Acción extra, sólo después de quemar la anterior | efecto "reglas de mesa" en `GameContext` |
| Mesa de **11+**: 2 Acción + 2 Defensa | `slotsFor()` |
| Defensas reactivas (60 s) y Mordaza activa (20 min) | `applyDefense()` / `gagPlayer()` |
| Ruleta de castigos / retos HOT | `RouletteModal`, `src/data/punishments.ts` |
| **Modo HOT**: 20 cartas soft (15 Diablo + 5 Ángel), tema rojo | `HOT_CATALOG` en `src/data/cards-catalog.ts` |

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

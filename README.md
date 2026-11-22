# Kalendar — Calendario Mensual para Huawei Watch Fit 3

Aplicación de calendario personalizada para **Huawei Watch Fit 3** (HarmonyOS Lite Wearable, pantalla **408 × 480 px AMOLED**) con **vista mensual por defecto** y caché offline mediante `@system.storage`, preparada para sincronizar eventos desde iPhone (`EventKit` + Huawei Wear Engine SDK).

## Estructura del Repositorio

```text
Kalendar/
├── watch/
│   └── entry/src/main/
│       ├── config.json                      # Configuración Lite Wearable (rect 408*480)
│       └── js/default/
│           ├── app.js                       # Ciclo de vida
│           ├── common/
│           │   ├── calendar.js              # Cálculo de grilla mensual (L–D, 5/6 filas)
│           │   ├── mockEvents.js            # Datos mockeados en el contrato JSON
│           │   └── storage.js               # Caché local offline (@system.storage)
│           └── pages/
│               ├── index/                   # Vista principal: grilla mensual
│               └── day/                     # Vista secundaria: detalle vertical del día
└── tests/
    └── calendar.test.mjs                    # Pruebas unitarias de lógica pura (Node.js)
```

## Cómo probar en DevEco Studio

1. Abre **DevEco Studio** y crea un proyecto nuevo con la plantilla **Lite Wearable → Empty Ability (JS)** (API 6–9).
2. Reemplaza el contenido de `entry/src/main/config.json` y `entry/src/main/js/default/` con los archivos de [`watch/entry/src/main/`](watch/entry/src/main/).
3. Abre el **Previewer** seleccionando el perfil de pantalla rectangular **408 × 480** (Watch Fit 3).
4. Interacciones disponibles:
   - **`<` / `>`** o **deslizar izquierda/derecha**: cambiar de mes.
   - **Tocar el título del mes**: volver inmediatamente al mes y día actual.
   - **Tocar cualquier día**: abrir la lista vertical de eventos de esa fecha.
   - **En detalle del día**: botón **`<`** o **deslizar a la derecha** para volver a la grilla manteniendo el día seleccionado resaltado.

## Contrato JSON (iPhone → Watch Fit 3)

El puente iOS (`EventKit` + Wear Engine SDK) enviará este payload JSON liviano, que el reloj guardará en `@system.storage` bajo la clave `kalendar_events_v1`:

```json
{
  "version": 1,
  "syncedAt": "2026-11-22T18:30:00.000Z",
  "events": [
    {
      "id": "evt-today-1",
      "title": "Daily Standup",
      "date": "2026-11-22",
      "startTime": "09:30",
      "endTime": "10:00",
      "allDay": false,
      "calendar": "Trabajo",
      "color": "#0A84FF"
    }
  ]
}
```

## Pruebas unitarias (lógica de calendario)

```bash
node --test tests/calendar.test.mjs
```

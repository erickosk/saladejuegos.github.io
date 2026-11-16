# Guía de desarrollo

## Cómo se organiza

| Pieza | Qué hace |
|---|---|
| `index.html` + `js/portal.js` | Portal de una sola página. Las vistas se eligen con el *hash*: `#/` inicio, `#/juegos`, `#/cat/N`, `#/categorias`, `#/logros`, `#/perfil`. |
| `js/datos.js` | API `D`: cuentas, progreso por juego, sesiones, logros, exportar. Todo en `localStorage` (claves `sala.*`). |
| `js/sala.js` | API `Sala`: pantalla de introducción, cuenta atrás, transiciones entre páginas. Define `RAIZ`, la URL base del sitio. |
| `juegos/*.html` | Una página por juego; cargan `sala.js`, `datos.js` y el JS/CSS que necesiten. |

### Rutas y `RAIZ`
Las páginas de `juegos/` están un nivel por debajo de la raíz. En HTML usa `../css/…`, `../js/…`, `../img/…`. En JavaScript que construya URLs en tiempo de ejecución usa la constante global **`RAIZ`** (`RAIZ + 'img/logo.svg'`), así funciona desde cualquier carpeta y también en GitHub Pages de proyecto (`/repo/`).

## Añadir un juego

1. **Página:** copia un juego parecido de `juegos/` (por ejemplo `conecta4.html`), cambia título, color `--accent` y la llamada de inicio.
2. **Lógica:** añade el código en el `js/juegos-*.js` que corresponda o crea uno nuevo y enlázalo en la página.
3. **Logo:** `img/<id>.svg` (viewBox `0 0 64 64`).
4. **Catálogo:** agrega un objeto a `const G` en `js/portal.js`:
   ```js
   {k:3, n:'Mi juego', i:'mijuego', t:'#e8914a', h:'juegos/mijuego.html',
    s:'Subtítulo corto', d:'Descripción larga.', g:['etiqueta1','etiqueta2']}
   ```
   `k` es el índice de categoría (`CAT`), `i` el id del logo, `t` el color de la tarjeta.
5. **Récords y logros:** registra el juego en `JUEGOS` de `js/datos.js` (`{n, u:'puntos', bajo:true}` si menos es mejor) y envía cada partida con `D.registrarPartida(id, {id, puntaje, ganada, segundos})`.
6. Ejecuta `node scripts/verificar.mjs`.

## Modelo de datos (localStorage)

- `sala.usuarios`: cuentas (nombre, correo, hash+sal, avatar, color, creado).
- `sala.sesion`: id del usuario activo.
- `sala.progreso.<id|invitado>`: `{juegos:{<id>:{partidas,mejor,total,victorias,segundos,…}}, sesiones:[…], logros:{}, dias:[]}`.
- `sala.texto`: tamaño de letra (1 = grande, 2 = muy grande).

`docs/esquema.sql` propone las tablas equivalentes para un servidor.

## Convenciones

- Sin dependencias ni paso de compilación; JavaScript clásico (no módulos).
- Accesibilidad: objetivos táctiles ≥ 44 px, contraste suficiente, `aria-*` en controles, respeto de `prefers-reduced-motion`.
- UTF-8, saltos de línea LF e indentación de 2 espacios (ver `.editorconfig`).

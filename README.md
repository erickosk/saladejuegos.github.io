# 🎮 Sala de Juegos

Más de **50 juegos gratis para el navegador**, pensados para todas las edades: cartas y mesa, palabras, reflejos y arcade, trivia, creatividad y simulación. Con **récords, logros, niveles y perfil** guardados en tu dispositivo.

> Sitio 100 % estático: HTML + CSS + JavaScript, **sin dependencias, sin compilar y sin servidor**.

**▶ Demo:** `https://TU-USUARIO.github.io/sala-de-juegos/` *(cambia por tu URL de GitHub Pages)*

## Características

- **53 juegos** en 5 categorías: Mente y estrategia, Palabras, Reflejos y arcade, Mesa y lógica, Creatividad y simulación.
- **Fácil de usar para todos:** buscador, botón «Sorpréndeme», categorías siempre visibles, menú con iconos (barra inferior en el teléfono) y **tamaño de letra ajustable**.
- **Perfil completo** (`#/perfil`): nivel, racha, progreso por categoría, actividad de 14 días, récords por juego, últimas partidas y logros.
- **Cuentas y progreso locales** (`localStorage`): se conserva como invitado y se fusiona al crear la cuenta.
- **Responsive y táctil:** funciona en teléfono, tablet y computadora; respeta las áreas seguras del iPhone y `prefers-reduced-motion`.
- **Sin cookies de seguimiento ni analítica.** Lo único externo son las fuentes de Google Fonts.

## Probar en local

No hace falta instalar nada. Sirve la carpeta con cualquier servidor estático:

```bash
python3 -m http.server 8000      # o: npx serve
# abre http://localhost:8000
```

> Abrir `index.html` con doble clic (`file://`) también funciona para jugar, pero algunos navegadores limitan `localStorage` en ese modo.

## Publicar en GitHub Pages

1. Crea el repositorio y sube el contenido de esta carpeta a la rama `main`.
2. En **Settings → Pages**, elige **Source: GitHub Actions**.
3. Con cada `push` a `main`, el flujo `.github/workflows/pages.yml` verifica los enlaces y publica el sitio.

Funciona tanto en `usuario.github.io/repo/` como en un dominio propio: todas las rutas son relativas.

## Estructura

```
├── index.html            Portal: buscador, categorías, perfil, logros (rutas con #/)
├── juegos/               Una página HTML por juego (54)
├── js/
│   ├── portal.js         Catálogo de juegos, vistas y rutas del portal
│   ├── sala.js           Utilidades comunes de interfaz (intro, cuenta atrás, transiciones)
│   ├── datos.js          Cuentas, progreso, récords y logros (localStorage)
│   └── juegos-*.js …     Lógica de los juegos, agrupada por tipo
├── css/                  Estilos (portal, juegos, móvil, trivia, simulación…)
├── img/                  Logos de los juegos y avatares (SVG)
├── docs/                 Guía de desarrollo, historial de cambios y esquema SQL sugerido
├── scripts/verificar.mjs Comprobador de enlaces y catálogo (lo usa la CI)
└── .github/workflows/    Verificación y despliegue en GitHub Pages
```

## Desarrollo

- Guía para **añadir un juego**, modelo de datos y convenciones: [`docs/GUIA-DESARROLLO.md`](docs/GUIA-DESARROLLO.md).
- Antes de subir cambios, comprueba que no haya enlaces rotos (requiere Node 18+; no instala nada):

  ```bash
  node scripts/verificar.mjs
  ```

- Historial de cambios del proyecto: [`docs/HISTORIAL.md`](docs/HISTORIAL.md).

## Antes de publicar (requisitos legales)

1. Abre **`js/legal.js`** y completa `correo` y `domicilio` (el nombre del responsable ya está). Estos datos aparecen solos en el aviso de privacidad y en los términos.
2. Ejecuta `node scripts/verificar.mjs`: avisa si falta algo. La publicación automática en GitHub Pages **se detiene mientras estén vacíos**.
3. Lee `docs/LEGAL.md` (qué cubre cada archivo y qué sigue pendiente, como los nombres de juegos con marca).

## Privacidad

Consulta el [Aviso de privacidad](aviso-privacidad.html) y los [Términos de uso](terminos.html). Las cuentas y el progreso viven **solo en el navegador** de cada persona. La contraseña se guarda con hash y sal, pero al no haber servidor **no es un sistema de autenticación seguro**: no uses una contraseña que utilices en otros sitios. El esquema en `docs/esquema.sql` es una propuesta para cuando se conecte un servidor.

## Licencia

[MIT](LICENSE). Revisa también el origen de los recursos gráficos (`img/`) si planeas reutilizarlos fuera de este proyecto.

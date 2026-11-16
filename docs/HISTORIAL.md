# Sala de Juegos — cambios

## Perfil y hojas (última actualización)
- **Página `#/perfil`** con el progreso completo: nivel (según logros), 6 resúmenes (partidas, juegos probados, logros, tiempo, victorias, racha), progreso por categoría, gráfica de actividad de 14 días, «Mis juegos» (récord, tiempo y victorias de cada uno, y pestaña «Por probar»), últimas partidas, logros recientes y más cercanos, y la cuenta (foto, descargar datos, cerrar sesión). Como invitado muestra el progreso del dispositivo y botones para crear cuenta.
- El avatar de la cabecera, el nombre y «Perfil» abren esta página si hay sesión; sin sesión abren el formulario de entrar/crear cuenta.
- **Hojas emergentes:** el botón «Cerrar» ahora está en una barra fija arriba, con texto, y no se pierde al desplazarse en pantallas pequeñas.

## Interfaz más fácil de usar (niños a adultos mayores)
- **Búsqueda** grande en Inicio y Juegos (sin acentos, varias palabras) y botón **Sorpréndeme** (juego al azar, prefiere los que aún no probaste).
- **Categorías siempre visibles** como botones con icono; «Todos los juegos» se agrupa por categoría.
- **Menú con iconos** (Inicio, Juegos, Categorías, Logros, Perfil); en teléfono es una **barra inferior** fácil de alcanzar con el pulgar. «Desafíos» ahora se llama «Categorías».
- **Tamaño de letra** (botón Aa: normal / grande / muy grande), se recuerda en el dispositivo.
- El banner ya no cambia solo; se maneja con flechas o puntos. Botones «Jugar» con triángulo de play.
- `conecta4.svg` redibujado: el tablero estaba cortado (5.ª columna fuera del marco).

## Nueva página principal (index.html + portal.css)
- Barra superior (logo, Explorar Juegos, Desafíos, Logros, Perfil, cuenta, avisos), banner «Zona de desafío» con carrusel por categoría, «Tus juegos destacados» y panel derecho con «Tus top juegos» y «Próximos logros».
- Los destacados y el top se ordenan por partidas jugadas; sin partidas se usa el orden de `DEST` en `index.html`.
- **Teléfono/tablet (≤1000 px):** una columna y el panel derecho se pliega en el botón «Mi panel» (desplegable).
- Rutas: `#/` inicio, `#/juegos`, `#/cat/N`, `#/desafios`, `#/logros`. `biblioteca.css` se sigue usando para hojas de cuenta/detalle y logros.

## Creatividad y simulación (nueva categoría)
- **Granja virtual** (`granja.html`, `juegos-granja.js`): ara, siembra, riega y cosecha 5 cultivos, cría gallinas, vende en un mercado con precios cambiantes y administra energía, semillas y monedas. Clima (lluvia) con pronóstico del día siguiente.
- **Constructor de ciudades** (`ciudad.html`, `juegos-ciudad.js`): calles, casas, edificios, tiendas, fábricas, escuelas, parques y plantas eléctricas. Equilibra empleos, energía, dinero y felicidad; el río y las calles limitan el espacio.
- **Creador de personajes** (`creador.html`, `juegos-creador.js`): cuerpo, cara, pelo, ropa, zapatos, sombreros, gafas, extras y fondo, todo en SVG. Modos Libre, Retos (consignas) y Contrarreloj; guardar y descargar PNG.
- Estilos en `sim.css`. Todos empiezan con cuenta atrás y tienen 3 modos/dificultades.

## Otros cambios
- Se quitó **Adivina el logotipo**.
- Se corrigió que el nivel llegaba como texto en algunos juegos (aro móvil en Baloncesto difícil, opciones parecidas en Adivina la bandera medio/difícil y rebotes de Rebota pelota).

## Juegos de trivia (`juegos-trivia.js`, `trivia-datos.js`, `trivia-banderas.js`, `trivia.css`)
Trivia de cultura general (`trivia.html`), Adivina la bandera (`banderas.html`), ¿Quién soy? (`quiensoy.html`) y Verdadero o falso (`vof.html`).
Todo es SVG, cada partida empieza con la cuenta atrás, tienen 3 dificultades y están registrados en `index.html` y `datos.js`.
- **Contenido ampliable:** `trivia-datos.js` (preguntas, personajes y afirmaciones) y `trivia-banderas.js` (países y banderas).

## Nuevos juegos de acción/habilidad (archivo `juegos-accion-c.js`)
Tiro al blanco (`tiroblanco.html`), Lanzamiento de baloncesto (`baloncesto.html`), Billar (`billar.html`), Minigolf (`minigolf.html`) y Equilibrio de torre (`torre.html`).
Todo es SVG, cada partida empieza con la cuenta atrás, tienen 3 dificultades, controles táctiles y de teclado, y están registrados en `index.html` y `datos.js` (récords y logros).

## Última entrega (correcciones y diseño)
- **Cuenta atrás (3, 2, 1, ¡Va!)** en todos los juegos: los de mesa/acción (vía `GS.crear` en `juegos-base.js`), Ajedrez, Basta, Buscaminas, Ahorcado, Acertijos, Rompecabezas y Wordle. Ya no existe el rótulo "Toca para empezar".
- **Objetos en la esquina superior izquierda**: la escena de los juegos de acción se muestra solo cuando ya está colocada.
- **Carreras de autos y Esquiva meteoritos**: el objeto chocado ahora desaparece (con destello) y ya no se queda pegado.
- **Asteroids**: la nave reaparece en menos de medio segundo, con protección temporal.
- **Helicóptero**: las paredes siguen siendo sólidas después de un choque (ya no se traspasa el mapa); nuevo diseño y logo.
- **Carreras infinitas** y **Plataformas**: nuevo diseño SVG del escenario, personajes (correr, saltar y agacharse) y logos.

## Qué hay de nuevo
- **index.html + biblioteca.css**: menú estilo "Biblioteca" (tarjetas por categoría, Logros, Seguir jugando, lista de juegos, hoja de detalle). Móvil, tablet y computadora.
- **movil.css**: ajustes de las páginas de juego (áreas seguras del iPhone, barra superior fija, controles táctiles, tablero de topos adaptable).
- **datos.js**: cuentas, progreso por juego y logros. Se carga en el menú y en cada juego.
- **esquema.sql**: tablas sugeridas para la base de datos.

## Novedades de la 2.ª entrega
- **rompecabezas.html** (+ `img/rompecabezas.svg`): rompecabezas con piezas reales, 6 ilustraciones dibujadas por código o tu propia foto, 3 tamaños (12/24/48), guía, modelo, pista, cronómetro y bono por tiempo.
- El menú ahora usa la misma paleta y fuentes que los juegos (ya no es negro).

## Wordle (3.ª entrega)
- **wordle.html**, **wordle-palabras.js**, **img/wordle.svg**: palabra del día (igual para todos, cambia a medianoche), 6 intentos, teclado en pantalla y físico con Ñ, racha y estadísticas, botón de compartir, modo práctica.
- Lo que escribas debe estar en el diccionario del juego (~1,200 palabras y formas). Para agregar palabras, edita `WORDLE_SOL` (pueden salir como palabra del día) o `WORDLE_EXTRA` (solo se aceptan como intento).
- El orden de las palabras del día es fijo (barajado con una semilla), así que no se repite hasta agotar la lista (~510 días).

## Pacman (4.ª entrega)
- **pacman.html** + **img/pacman.svg**: laberinto de 19×21, 4 fantasmas (cada uno persigue distinto), píldoras de poder, túnel lateral, fruta de bonificación, 3 vidas y niveles cada vez más rápidos.
- Controles: flechas o WASD, deslizar el dedo sobre el laberinto, o cruceta en pantalla (aparece sola en teléfono). P o Espacio pausan; también pausa solo si sales de la pestaña.
- Puntos: punto 10, píldora 50, fantasmas 200/400/800/1600, fruta 100 × nivel. Récord local en `pc_best` y progreso en tu cuenta.

## 10 juegos de acción (15.ª entrega)
`initSpaceInvaders()`, `initAsteroids()`, `initEndlessRunner()`, `initCarRace()`, `initHelicopter()` (en `juegos-accion-a.js`) e `initMeteorDodge()`, `initPlatformer()`, `initCatcher()`, `initBouncer()`, `initFruitSlicer()` (en `juegos-accion-b.js`). Usan las utilidades de acción de `juegos-base.js` (`GS.escena`, `GS.bucle`, `GS.entrada`, `GS.pad`): todo se dibuja con SVG y se mueve cuadro a cuadro; en teléfono aparecen botones táctiles. Cada uno tiene 3 dificultades, 3 vidas, pantalla de resultado, logo en `img/` y está registrado en el progreso y los logros.

## 10 juegos de mesa y lógica (13.ª entrega)
Cada juego es una función modular que se inyecta en `<div id="game-container"></div>`: `initTicTacToe()`, `initConnect4()`, `initCheckers()`, `initSudoku()`, `initHanoi()` (en `juegos-mesa-a.js`) e `initNim()`, `initBattleship()`, `initMaze()`, `initColorSort()`, `initNimble()` (en `juegos-mesa-b.js`). Todos usan `juegos-base.js` (menú de dificultad, pantalla de resultado, íconos SVG, sonido) y `juegos-mesa.css`. Sin emojis: todo es SVG.
- Páginas: `tresenraya`, `conecta4`, `damas`, `sudoku`, `hanoi`, `nim`, `batallanaval`, `laberinto`, `torrescolores`, `nimble` (.html) con su logo en `img/`.
- Para usar uno en otra página: carga `juegos-base.js`, el archivo del juego y llama `initXxx(document.getElementById('game-container'))`. Cada partida devuelve funciones de depuración; `GS.crear` maneja turnos, reinicio y resultado.
- Se registran en el progreso, los logros (`META_JUEGO` en `datos.js`) y el menú (categoría "Mesa y lógica").

## Buscaminas y Basta (12.ª entrega)
- **buscaminas.html** (+ `img/buscaminas.svg`): campo de 8×10, 10×14 o 12×18; primer toque seguro, banderas (clic derecho, toque largo o botón), acorde en números y cronómetro. Íconos en SVG.
- **basta.html**, **basta-palabras.js** (+ `img/basta.svg`): 5 rondas por partida contra la computadora, con 5, 6 u 8 categorías según la dificultad. El banco de palabras está en `basta-palabras.js` y se puede ampliar (una lista por categoría, separada por comas).

## Más logros (11.ª entrega)
- Ahora hay 84 logros: 24 generales (partidas, victorias, días seguidos, tiempo, puntos, foto de perfil, coleccionista…) y 60 por juego (debut, 10 partidas y "Maestro" con una meta propia de cada juego). Las metas por juego están en `META_JUEGO` de `datos.js`; se pueden cambiar sin tocar nada más.
- La pantalla de Logros tiene dos pestañas: Generales y Por juego.

## Avatares y perro nuevo (9.ª entrega)
- **Fotos de perfil:** los 18 avatares viven en `img/avatares/`. Se eligen al crear la cuenta y se pueden cambiar desde el menú de la cuenta. Cada usuario guarda su `avatar` (id) junto a su nombre; para agregar más avatares, pon el SVG en esa carpeta y añade su id en la lista `AVATARES` de `datos.js`.
- **Perro de Duck Hunt:** ahora se arma con SVG (`perro-cabeza*.svg`, `perro-oreja.svg`, `perro-torso-*.svg`, `perro-lado.svg`) y tiene animaciones: pasea olfateando al inicio de cada ronda, se asusta y salta al pasto, sale con los patos en alto cuando aciertas y se ríe (orejas, boca y cuerpo) cuando fallas.
- Nuevo logo de Pacman (`img/pacman.svg`).

## Paleta solo para la interfaz (8.ª entrega)
- La paleta cálida (rosa/coral/naranja) se usa únicamente en la interfaz: menú, paneles, botones y marcadores. Dentro de los juegos los colores vuelven a ser naturales: cielo azul y pasto verde en Duck Hunt y Pájaro Volador, tableros oscuros en Tetris/2048/Piano, tablero de madera en el ajedrez, verde = correcto y rojo = error (variables `--ok` y `--bad` en `sala.css`).

## Personajes que coinciden con su logo (7.ª entrega)
- En Duck Hunt el pato y el perro son SVG (`img/pato-atras.svg`, `pato-ala.svg`, `pato-frente.svg`, `perro.svg`, `perro-risa.svg`), con el mismo estilo del logo. El pájaro, topo, serpiente, 2048, Simón, Tetris, ladrillos, piano, Pacman y ajedrez usan los colores de sus íconos.

## Paleta cálida (6.ª entrega)
- Colores base: rosa `#f55c7a`, coral `#f57c73`, `#f68c70`, naranja `#f6ac69`, amarillo `#f6bc66`, con fondo durazno claro y texto marrón. Todo se controla desde las variables de `sala.css`.
- Los íconos de `img/` son los tuyos, sin cambios de color; `ajedrez.svg` y `duckhunt.svg` son nuevos y de curvas suaves.

## Paleta anterior y juegos nuevos (5.ª entrega)
- **Paleta** (tomada de tu imagen): salvia `#a3a990`, salvia claro `#c4cbb0`, crema `#ebe3d7`, durazno `#f2ceb9`, salmón `#ed9e8b`. Los colores base viven en `sala.css` (variables `--bg`, `--panel`, `--accent`, `--ink`…). Los juegos con dibujo (`juegos.js`, Pacman, Rompecabezas, Wordle…) usan tonos derivados de esa paleta.
- **ajedrez.html** + **ajedrez-motor.js** + **img/ajedrez.svg**: ajedrez de un jugador contra la computadora (enroque, al paso, coronación, jaque mate y tablas; 3 dificultades; pista y deshacer). El motor pasó las pruebas estándar "perft".
- **duckhunt.html** + **img/duckhunt.svg**: toca los patos para dispararles; 10 patos por ronda, 3 disparos por tanda y perro.

## Cómo funciona hoy
Todo se guarda en `localStorage` del navegador:
- `sala.usuarios` (cuentas) · `sala.sesion` (quién está activo) · `sala.progreso.<id>` (progreso) · `sala.cola` (eventos pendientes de enviar).
- Sin cuenta se juega como **invitado**; al crear cuenta o entrar, ese progreso se fusiona con la cuenta.
- Cada juego se detecta solo por el nombre del archivo y se lee el marcador (`#score` / `#scorePill`). Se guarda: partidas, mejor puntaje, total, victorias, tiempo y última vez.
  Memorama usa "menos intentos = mejor" y solo cuenta récord al completarlo; Sopa de letras cuenta palabras halladas.

## Conectar a una base de datos
1. Crea un servidor con estos endpoints: `POST /registro`, `POST /login`, `POST /eventos`.
2. En `datos.js` pon `CONFIG.API='https://tu-servidor.com/api'` (y `CONFIG.TOKEN` si usas token).
3. `POST /eventos` recibe `{eventos:[{id,tipo,usuario,datos,fecha}]}`; tipos: `registro`, `login`, `partida`, `logro`. El `id` es único, así que reenviar no duplica (haz upsert).
4. **Pendiente para producción**: `registrar()` y `entrar()` hoy validan en el navegador. Deben llamar al servidor, que guarde el hash (bcrypt/argon2) y devuelva un token. El hash local es solo para pruebas y no es seguro por sí solo.

## Ver el sitio
Abre `index.html` (mejor desde un servidor local: `python3 -m http.server`). Las fuentes de Google y las banderas necesitan internet.

## Notas
- `ecuaciones.html` ahora usa la misma plantilla que los demás juegos (antes no cargaba `sala.js`).
- No se probó a mano cada juego jugándolo; sí se probaron el menú, el registro, el seguimiento de puntajes (2048) y los logros en navegador de móvil y escritorio.

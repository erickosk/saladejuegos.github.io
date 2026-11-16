/* Sala de Juegos · portal (página principal): catálogo, vistas y rutas. */
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const D=SalaDatos;

/* ---------- Catálogo ---------- */
const G=[
{k:4,n:'Granja virtual',i:'granja',t:'#5fb04a',h:'juegos/granja.html',s:'Siembra, cosecha y administra',d:'Ara, siembra, riega y cosecha cinco cultivos, cría gallinas, vende en un mercado de precios cambiantes y administra tu energía, semillas y monedas hasta alcanzar la meta antes de que acaben los días.',g:['cultivos','mercado','gallinas']},
 {k:4,n:'Constructor de ciudades',i:'ciudad',t:'#3f86d8',h:'juegos/ciudad.html',s:'Construye y haz crecer tu ciudad',d:'Coloca calles, casas, edificios, tiendas, fábricas, escuelas, parques y plantas eléctricas. Equilibra empleos, energía, dinero y felicidad para llegar a la población meta.',g:['espacio','economía','energía']},
 {k:4,n:'Creador de personajes',i:'creador',t:'#e0509a',h:'juegos/creador.html',s:'Personaliza ropa, pelo y accesorios',d:'Diseña un personaje dibujado en SVG: cuerpo, cara, pelo, ropa, zapatos, sombreros, gafas, extras y fondo. Hay modo libre, retos con consignas y contrarreloj; puedes guardarlo y descargarlo.',g:['libre','retos','descargar']},
 {k:0,n:'Trivia de cultura general',i:'trivia',t:'#c98b3d',h:'juegos/trivia.html',s:'Historia, ciencia, geografía y cultura',d:'Responde preguntas de historia, ciencia, geografía y cultura con comodines 50/50 y para saltar. Cuanto más rápido aciertes, más puntos ganas.',g:['preguntas','comodines','4 temas']},
 {k:0,n:'Adivina la bandera',i:'banderas',t:'#e8472f',h:'juegos/banderas.html',s:'Identifica el país de cada bandera',d:'Más de 80 banderas dibujadas en SVG. Descubre además la capital y el continente de cada país; en difícil las opciones se parecen mucho.',g:['80+ banderas','capitales','geografía']},
 {k:0,n:'¿Quién soy?',i:'quiensoy',t:'#7a5ac8',h:'juegos/quiensoy.html',s:'Descubre al personaje con pistas',d:'Adivina a científicos, artistas, escritores y figuras históricas con pistas que van de la más vaga a la más clara. Menos pistas, más puntos.',g:['40 personajes','pistas','historia']},
 {k:0,n:'Verdadero o falso',i:'vof',t:'#2e9e63',h:'juegos/vof.html',s:'Decide si es correcto o no',d:'Afirmaciones de ciencia, historia, geografía y cultura, con mitos y datos curiosos. Después de cada una verás la explicación.',g:['mitos','explicaciones','rachas']},
  {k:0,n:'Memorama',i:'memorama',t:'#f26b61',h:'juegos/memorama.html',s:'Encuentra todas las parejas',d:'99,999 tableros numerados, 6 temas y 3 niveles.',g:['6 temas','3 niveles','con pistas']},
 {k:0,n:'2048',i:'2048',t:'#ecab57',h:'juegos/2048.html',s:'Une los números hasta llegar a 2048',d:'Desliza las fichas con las flechas (o con el dedo) y combina las iguales.',g:['estrategia','números']},
 {k:0,n:'Acertijos',i:'acertijos',t:'#de9f6f',h:'juegos/acertijos.html',s:'Resuelve el enigma',d:'10,000 acertijos: 3,334 fáciles, 3,333 medios y 3,333 difíciles.',g:['10,000 acertijos','3 niveles']},
 {k:0,n:'Ecuaciones',i:'ecuaciones',t:'#f16157',h:'juegos/ecuaciones.html',s:'Despeja la incógnita paso a paso',d:'Rondas de 10 problemas en 3 niveles: de ecuaciones simples a cuadráticas, valor absoluto, circunferencia y recta. Con procedimiento explicado.',g:['3 niveles','10 problemas','paso a paso']},
 {k:0,n:'Ajedrez',i:'ajedrez',t:'#f6ac69',h:'juegos/ajedrez.html',s:'Juega contra la computadora',d:'Ajedrez completo de un jugador: enroque, al paso, coronación, jaque mate y tablas. Elige color y dificultad (fácil, medio o difícil), pide una pista o deshaz tu jugada.',g:['1 jugador','3 dificultades','pistas']},
 {k:0,n:'Buscaminas',i:'buscaminas',t:'#a2d149',h:'juegos/buscaminas.html',s:'Despeja el campo sin pisar una mina',d:'Abre casillas y usa los números para deducir dónde hay minas; marca con banderas las que descubras. El primer toque siempre es seguro. Tres tamaños de campo, con clic derecho o toque largo para las banderas.',g:['lógica','3 dificultades','táctil']},
 {k:0,n:'Rompecabezas',i:'rompecabezas',t:'#eeb264',h:'juegos/rompecabezas.html',s:'Arma la imagen pieza por pieza',d:'Arrastra las piezas hasta su lugar. Elige entre 6 ilustraciones o usa una foto tuya, en 3 tamaños: 12, 24 o 48 piezas.',g:['12 / 24 / 48 piezas','tu propia foto','con guía']},
 {k:1,n:'Wordle',i:'wordle',t:'#ecab57',h:'juegos/wordle.html',s:'Adivina la palabra del día',d:'Tienes 6 intentos para descubrir la palabra secreta de 5 letras. Verde: la letra está en su lugar; amarillo: está en otro lugar. Hay una palabra nueva cada día para todos, con racha y estadísticas.',g:['palabra diaria','6 intentos','racha']},
 {k:3,n:'Tres en Raya',i:'tresenraya',t:'#e8472f',h:'juegos/tresenraya.html',s:'Haz tu línea de tres antes que la computadora',d:'Coloca tres símbolos en línea (horizontal, vertical o diagonal) antes que tu oponente. Elige si juegas con X o con O y la dificultad: en difícil la computadora no falla.',g:['1 jugador', '3 dificultades', 'clásico']},
 {k:3,n:'Conecta 4',i:'conecta4',t:'#f2c230',h:'juegos/conecta4.html',s:'Alinea cuatro fichas del mismo color',d:'Suelta fichas en las columnas y alinea cuatro del mismo color en horizontal, vertical o diagonal antes que la computadora. Tú eliges quién empieza.',g:['1 jugador', '3 dificultades', 'estrategia']},
 {k:3,n:'Damas',i:'damas',t:'#b3342a',h:'juegos/damas.html',s:'Captura las piezas del rival',d:'Damas con captura obligatoria, saltos múltiples y coronación. Gana quien deje al rival sin jugadas. La computadora piensa más jugadas por adelantado en difícil.',g:['captura obligatoria', 'corona', '3 dificultades']},
 {k:3,n:'Sudoku',i:'sudoku',t:'#2f7fd1',h:'juegos/sudoku.html',s:'Llena la cuadrícula sin repetir números',d:'Completa la cuadrícula del 1 al 9 sin repetir en filas, columnas ni cajas de 3×3. Cada partida es un sudoku nuevo con una sola solución, con notas, pistas y cronómetro.',g:['lógica', 'notas', 'pistas']},
 {k:3,n:'Torre de Hanói',i:'hanoi',t:'#fb8c00',h:'juegos/hanoi.html',s:'Pasa los discos de una torre a otra',d:'Mueve todos los discos a la última torre, de uno en uno y sin poner uno grande sobre uno chico. Con 3, 5 o 7 discos y una pista que te dice el mejor siguiente movimiento.',g:['3, 5 o 7 discos', 'pista', 'deshacer']},
 {k:3,n:'Nim',i:'nim',t:'#43a047',h:'juegos/nim.html',s:'Deja al rival sin movimientos',d:'Retira piedras de los montones por turnos: quien quite la última gana. Siempre se puede ganar con la estrategia correcta; la computadora se vuelve más lista en cada dificultad.',g:['estrategia', '1 jugador', 'pista']},
 {k:3,n:'Batalla Naval',i:'batallanaval',t:'#2f7fd1',h:'juegos/batallanaval.html',s:'Encuentra y hunde la flota enemiga',d:'Coloca tu flota (o hazlo al azar) y dispara por turnos al mar enemigo. Gana quien hunda primero todos los barcos del rival. En difícil la computadora calcula probabilidades.',g:['8×8 y 10×10', 'flota', '3 dificultades']},
 {k:3,n:'Laberinto',i:'laberinto',t:'#8e24aa',h:'juegos/laberinto.html',s:'Encuentra la salida',d:'Atraviesa un laberinto nuevo cada vez, esquivando callejones sin salida y trampas de pinchos. Con teclado, deslizando el dedo o con la cruceta; en difícil la visión es limitada.',g:['laberintos únicos', 'trampas', 'pista']},
 {k:3,n:'Torres de colores',i:'torrescolores',t:'#00acc1',h:'juegos/torrescolores.html',s:'Ordena las bolitas por color',d:'Separa las bolitas de colores para que cada tubo tenga un solo color. Solo puedes poner una sobre otra igual o en un tubo vacío. Todos los puzzles tienen solución.',g:['5, 8 u 11 colores', 'deshacer', 'tubo extra']},
 {k:3,n:'Nimble',i:'nimble',t:'#f2b84b',h:'juegos/nimble.html',s:'Avanza las monedas y haz el último movimiento',d:'Mueve una moneda hacia la izquierda todas las casillas que quieras. Cuando todas lleguen a la meta, gana quien hizo el último movimiento.',g:['estrategia', '3 dificultades', 'pista']},
 {k:1,n:'Basta',i:'basta',t:'#d9826f',h:'juegos/basta.html',s:'Una letra, muchas categorías',d:'Te toca una letra: escribe una palabra con ella en cada categoría (nombre, animal, fruta, color, país…) antes de que se acabe el tiempo, o grita ¡BASTA! Compite contra la computadora en 5 rondas y 3 dificultades.',g:['5 rondas','8 categorías','contra la computadora']},
 {k:1,n:'Scrabble',i:'scrabble',t:'#dba780',h:'juegos/scrabble.html',s:'Forma palabras con tus fichas',d:'Arma palabras con 7 fichas contra reloj. Diccionario de 1,000 palabras posibles.',g:['1,000 palabras','contra reloj']},
 {k:1,n:'Ahorcado',i:'ahorcado',t:'#f26b61',h:'juegos/ahorcado.html',s:'Adivina la palabra letra por letra',d:'2,000 palabras posibles en 3 niveles. Solo tienes 6 errores.',g:['2,000 palabras','3 niveles']},
 {k:1,n:'Sopa de letras',i:'sopa',t:'#eeb264',h:'juegos/sopa.html',s:'Encuentra todas las palabras ocultas',d:'200 sopas numeradas en 3 niveles; las difíciles van en las 8 direcciones.',g:['200 sopas','3 niveles']},
 {k:2,n:'Pacman',i:'pacman',t:'#de9f6f',h:'juegos/pacman.html',s:'Come todos los puntos y huye de los fantasmas',d:'Recorre el laberinto, come todos los puntos y usa las píldoras de poder para perseguir a los fantasmas. 4 fantasmas con distinta forma de perseguirte, túnel lateral, frutas y niveles cada vez más rápidos.',g:['3 vidas','niveles','dedo o teclado']},
 {k:2,n:'Duck Hunt',i:'duckhunt',t:'#ffd8bf',h:'juegos/duckhunt.html',s:'Dispara a los patos antes de que escapen',d:'Toca o haz clic sobre los patos para atraparlos. Tienes 3 disparos por tanda, 10 patos por ronda y un perro que se burla si fallas. Cada ronda es más rápida.',g:['puntería','10 patos por ronda','táctil']},
 {k:2,n:'Space Invaders',i:'spaceinvaders',t:'#4a5a8a',h:'juegos/spaceinvaders.html',s:'Defiende la Tierra de los invasores',d:'Mueve tu nave y dispara a las oleadas de invasores que bajan por la pantalla. Usa los escudos para protegerte y dispara a la nave nodriza para ganar puntos extra. De 2 a 4 oleadas según la dificultad.',g:['oleadas', 'escudos', 'táctil']},
 {k:2,n:'Asteroids',i:'asteroids',t:'#4a5a8a',h:'juegos/asteroids.html',s:'Pilota tu nave entre asteroides',d:'Gira, impulsa y dispara para destruir asteroides que se rompen en pedazos más pequeños. Si sales por un lado de la pantalla, apareces por el otro. Limpia todas las oleadas sin chocar.',g:['inercia', 'oleadas', '3 vidas']},
 {k:2,n:'Carreras infinitas',i:'carrerainfinita',t:'#e8472f',h:'juegos/carrerainfinita.html',s:'Corre, salta y agáchate',d:'Tu personaje corre solo: salta cactus y rocas, agáchate bajo los pájaros y recoge monedas. Cada vez más rápido hasta llegar a la meta de distancia.',g:['corredor', 'monedas', '3 dificultades']},
 {k:2,n:'Carreras de autos',i:'carreraautos',t:'#e8472f',h:'juegos/carreraautos.html',s:'Esquiva el tráfico en la autopista',d:'Conduce por una pista de 3 o 4 carriles evitando chocar con otros autos. Gana puntos por rebasar cerca y llega a la meta de distancia antes de quedarte sin vidas.',g:['tráfico', 'carriles', '3 vidas']},
 {k:2,n:'Helicóptero de obstáculos',i:'helicoptero',t:'#e8472f',h:'juegos/helicoptero.html',s:'Vuela por el túnel sin tocar las paredes',d:'Mantén presionado para subir y suelta para bajar. El túnel se vuelve más angosto y aparecen bloques en el camino. Llega a la meta de distancia con tus 3 vidas.',g:['un solo botón', 'túneles', 'bloques']},
 {k:2,n:'Esquiva meteoritos',i:'esquivameteoritos',t:'#fb8c00',h:'juegos/esquivameteoritos.html',s:'Sobrevive a la lluvia de meteoritos',d:'Mueve tu nave para esquivar meteoritos cada vez más rápidos y numerosos. Recoge estrellas para sumar puntos y escudos para aguantar un golpe.',g:['supervivencia', 'escudos', 'estrellas']},
 {k:2,n:'Plataformas 2D',i:'plataformas',t:'#43a047',h:'juegos/plataformas.html',s:'Salta, recoge monedas y llega a la bandera',d:'Cada nivel es distinto: salta entre plataformas, cruza huecos, pisa enemigos para derrotarlos y recoge monedas hasta llegar a la bandera.',g:['niveles únicos', 'enemigos', 'monedas']},
 {k:2,n:'Lluvia de objetos',i:'lluviaobjetos',t:'#2f7fd1',h:'juegos/lluviaobjetos.html',s:'Atrapa lo bueno, esquiva lo peligroso',d:'Mueve la canasta para atrapar manzanas, monedas, gemas y estrellas. Evita las bombas, rocas y pinchos. Los corazones te devuelven una vida.',g:['rachas', '3 vidas', '3 dificultades']},
 {k:2,n:'Rebota la pelota',i:'rebotapelota',t:'#fb8c00',h:'juegos/rebotapelota.html',s:'No dejes que la pelota caiga',d:'Mueve la plataforma para mantener la pelota rebotando. Dónde la golpeas cambia hacia dónde sale. Recoge estrellas y llega a la meta de rebotes.',g:['rebotes', 'estrellas', 'puntería']},
 {k:2,n:'Corta frutas',i:'cortafrutas',t:'#e53935',h:'juegos/cortafrutas.html',s:'Desliza para cortar frutas, evita las bombas',d:'Desliza el dedo o el cursor para cortar las frutas que vuelan por la pantalla. Cortar varias de un tajo da puntos extra, pero cuidado con las bombas.',g:['combos', 'bombas', 'táctil']},
{k:2,n:'Tiro al blanco',i:'tiroblanco',t:'#e8472f',h:'juegos/tiroblanco.html',s:'Apunta y dispara a los blancos',d:'Apunta con el mouse o el dedo y dispara a los blancos que se deslizan por los rieles. El centro da más puntos, el oro vale mucho, los platos voladores son bonus y las caritas sonrientes restan. Llega a la meta antes de que acabe el tiempo.',g:['puntería','racha','táctil']},
 {k:2,n:'Lanzamiento de baloncesto',i:'baloncesto',t:'#f07a1c',h:'juegos/baloncesto.html',s:'Ajusta dirección y fuerza para encestar',d:'Arrastra hacia atrás para elegir ángulo y fuerza, y suelta para lanzar. Cada tiro sale de un lugar distinto; los tiros limpios y las rachas dan puntos extra. En difícil el aro se mueve.',g:['10 tiros','fuerza y ángulo','rachas']},
 {k:2,n:'Billar',i:'billar',t:'#2e8b57',h:'juegos/billar.html',s:'Golpea las bolas con el ángulo y la fuerza justos',d:'Apunta con la guía, estira el taco y mete todas las bolas en las troneras antes de quedarte sin tiros. Física de choques y rebotes en las bandas; cuidado con meter la blanca.',g:['física','guía de tiro','3 mesas']},
 {k:2,n:'Minigolf',i:'minigolf',t:'#43a047',h:'juegos/minigolf.html',s:'Mete la pelota con el menor número de golpes',d:'Recorre hoyos con paredes, arena, agua, rebotadores y un molino giratorio. Cada hoyo tiene su par: termina el campo con pocos golpes.',g:['4 a 6 hoyos','par','obstáculos']},
 {k:2,n:'Equilibrio de torre',i:'torre',t:'#2f7fd1',h:'juegos/torre.html',s:'Apila bloques sin derribar la estructura',d:'Suelta los bloques que cuelgan de la grúa justo sobre la torre. Si queda demasiado peso volado, la estructura se derrumba. Centra los bloques para ganar rachas y llega a la altura meta.',g:['equilibrio','viento','bloques']},
  {k:2,n:'Pájaro Volador',i:'pajaro',t:'#eeb264',h:'juegos/pajaro.html',s:'Vuela entre las columnas sin chocar',d:'Aletea con precisión para pasar por cada hueco. Gana medallas de bronce, plata y oro.',g:['un solo botón','medallas']},
 {k:2,n:'Piano Tiles',i:'piano',t:'#f16157',h:'juegos/piano.html',s:'No dejes pasar ninguna nota',d:'Toca cada bloque justo cuando llegue a la línea. Cada vez va más rápido.',g:['ritmo','reflejos']},
 {k:2,n:'Simón Dice',i:'simon',t:'#f16157',h:'juegos/simon.html',s:'Memoriza y repite la secuencia',d:'Observa los colores y repítelos en orden. Cada ronda suma uno más.',g:['memoria','sonidos']},
 {k:2,n:'Golpea al Topo',i:'topo',t:'#eeb468',h:'juegos/topo.html',s:'Reflejos rápidos contra reloj',d:'Tienes 30 segundos para golpear a todos los topos que asomen.',g:['30 segundos','reflejos']},
 {k:2,n:'Serpiente',i:'serpiente',t:'#ecab57',h:'juegos/serpiente.html',s:'Crece sin chocar contigo mismo',d:'Come, crece y esquiva tu propia cola.',g:['arcade','flechas']},
 {k:2,n:'Tetris',i:'tetris',t:'#eeb264',h:'juegos/tetris.html',s:'Encaja las piezas sin llenar el tablero',d:'Gira y coloca las piezas que caen para completar líneas. Cada diez líneas sube el nivel y la velocidad.',g:['clásico','guardar pieza']},
 {k:2,n:'Rompeladrillos',i:'rompeladrillos',t:'#de9f6f',h:'juegos/rompeladrillos.html',s:'No dejes caer la bola',d:'Mueve la paleta y rompe todos los ladrillos.',g:['mouse o flechas','arcade']}
];
const CAT=[
 {n:'Mente y estrategia',c:'#f57c73',ic:'<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>'},
 {n:'Palabras',c:'#ffd8bf',ic:'<text x="12" y="17" text-anchor="middle" font-size="14" font-weight="800" fill="currentColor" stroke="none" font-family="system-ui,sans-serif">Aa</text>'},
 {n:'Reflejos y arcade',c:'#f6ac69',ic:'<path class="rel" d="M13 2L4 14h7l-1 8 9-12h-7z"/>'},
 {n:'Mesa y lógica',c:'#f6bc66',ic:'<rect x="4" y="4" width="16" height="16" rx="3.500"/><path d="M4 12h16M12 4v16"/><circle cx="8" cy="8" r="1.200" fill="currentColor" stroke="none"/><circle cx="16" cy="16" r="1.200" fill="currentColor" stroke="none"/>'},
 {n:'Creatividad y simulación',c:'#f2a2bf',ic:'<path d="M12 3l1.800 4.200L18 9l-4.200 1.800L12 15l-1.800-4.200L6 9l4.200-1.800zM18 15l.9 2.100 2.100.9-2.100.9L18 21l-.9-2.100L15 18l2.100-.9z"/>'}
];
const TROFEO='<path d="M8 4h8v5a4 4 0 0 1-8 0V4zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8M9.5 17h5"/>';
const CHEV='<svg class="bb-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
const nJuegos=k=>G.filter(g=>g.k===k).length;
const gid=g=>g.i;

/* ---------- Utilidades ---------- */
const fmtN=n=>Number(n).toLocaleString('es-MX');
function fmtT(s){s=Math.round(s);if(s<60)return s+' s';const m=Math.floor(s/60);return m<60?m+' min':Math.floor(m/60)+' h '+(m%60)+' min'}
function mejorTxt(g,P){const j=P.juegos[gid(g)],u=(D.JUEGOS[gid(g)]||{}).u||'puntos';return j&&j.mejor!=null?`Mejor: ${fmtN(j.mejor)} ${u}`:null}
const SILUETA='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="8.5" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7z"/></svg>';
const avSrc=u=>{const a=u&&u.avatar&&D.AVATARES.find(x=>x.id===u.avatar);return a?a.src:null};
const avInner=u=>{const src=avSrc(u);return src?`<img src="${src}" alt="">`:(u?esc(u.nombre.trim()[0].toUpperCase()):SILUETA)};
const avFondo=u=>u&&!avSrc(u)?`linear-gradient(150deg,color-mix(in srgb,${u.color} 70%,#fff),${u.color})`:'';
function avatar(u,grande){
  if(!u)return `<span class="bb-avatar inv${grande?' g':''}">${SILUETA}</span>`;
  return `<span class="bb-avatar${grande?' g':''}${avSrc(u)?' foto':''}" style="background:${avFondo(u)}">${avInner(u)}</span>`;
}
function pintarAvatar(){
  const u=D.usuarioActual(),b=$('#btnCuenta');
  b.className='bb-avatar'+(u?'':' inv')+(avSrc(u)?' foto':'');b.style.background=avFondo(u);
  b.setAttribute('aria-label',u?'Mi cuenta ('+u.nombre+')':'Iniciar sesión o crear cuenta');
  b.innerHTML=avInner(u);
}
const gridAvatares=sel=>`<div class="bb-avgrid" role="radiogroup" aria-label="Foto de perfil">${D.AVATARES.map(a=>`<button type="button" role="radio" class="bb-avop" data-av="${a.id}" aria-checked="${a.id===sel}" aria-label="${a.n}" title="${a.n}"><img src="${a.src}" alt=""></button>`).join('')}</div>`;

/* ---------- Portal: orden, iconos y utilidades ---------- */
const DEST=['trivia','banderas','quiensoy','vof','memorama','2048','acertijos','ajedrez'];   // orden inicial de destacados
const ordenBase=g=>{const i=DEST.indexOf(g.i);return i<0?100+G.indexOf(g):i};
const partidasDe=(P,g)=>(P.juegos[g.i]||{}).partidas||0;
const topJuegos=P=>[...G].sort((a,b)=>partidasDe(P,b)-partidasDe(P,a)||ordenBase(a)-ordenBase(b));
const FIN=['#f5b865','#f7c78f','#f4a672','#f6c46d','#f3a6b5'];     // color final del banner por categoría
const NAVI={inicio:'<path d="M4 11l8-7 8 7v8.5a1.5 1.5 0 0 1-1.5 1.5H15v-6H9v6H5.5A1.5 1.5 0 0 1 4 19.5z"/>',
 juegos:'<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>',
 cat:'<path d="M4 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/>',
 logros:TROFEO,perfil:'<circle cx="12" cy="8.5" r="4"/><path d="M4.5 20.5c0-4 3.4-6.5 7.5-6.5s7.5 2.5 7.5 6.5"/>'};
const LUPA='<svg class="lupa" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>';
const DADO='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3.5"/><circle cx="9" cy="9" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="9" r="1.3" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="9" cy="15" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="15" r="1.3" fill="currentColor" stroke="none"/></svg>';
const PLAY='<svg class="pl" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>';
const norm=t=>String(t||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
let consulta='',conservar=false;
function buscar(q){
  const ts=norm(q).split(/\s+/).filter(Boolean);
  return G.filter(g=>{const h=norm([g.n,g.s,g.d,(g.g||[]).join(' '),CAT[g.k].n].join(' '));return ts.every(t=>h.includes(t))});
}
const buscadorHTML=()=>`<div class="sj-bus"><form class="sj-buscar" id="frmBus" role="search"><label class="sj-vh" for="inpBus">Buscar un juego</label>${LUPA}<input id="inpBus" type="search" name="q" placeholder="¿A qué quieres jugar?" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="search" value="${esc(consulta)}"><button class="sj-bx" type="button" data-limpiar aria-label="Borrar búsqueda"${consulta?'':' hidden'}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></form>
 <button class="sj-sorp" type="button" data-azar>${DADO}<span>Sorpréndeme</span></button></div>`;
const catsHTML=()=>`<nav class="sj-cats" aria-label="Categorías de juegos"><a class="sj-cat" href="#/juegos" style="--c:#f6ac69"><span class="ico"><svg viewBox="0 0 24 24" aria-hidden="true">${NAVI.juegos}</svg></span><span class="tx"><b>Todos</b><small>${G.length} juegos</small></span></a>${CAT.map((c,k)=>`<a class="sj-cat" href="#/cat/${k}" style="--c:${c.c}"><span class="ico"><svg viewBox="0 0 24 24" aria-hidden="true">${c.ic}</svg></span><span class="tx"><b>${c.n}</b><small>${nJuegos(k)} juegos</small></span></a>`).join('')}</nav>`;
const ICO_LOGRO='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="11" width="12" height="9" rx="2"/><path d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3"/></svg>';
const ICO_COPA='<svg viewBox="0 0 24 24" aria-hidden="true">'+TROFEO+'</svg>';
const mejorNum=(g,P)=>{const j=P.juegos[g.i];return j&&j.mejor!=null?fmtN(j.mejor):'–'};

/* ---------- Cabecera ---------- */
function pintarCabecera(act){
  const u=D.usuarioActual(),L=D.logros(),h=L.filter(l=>l.hecho).length;
  const q=$('#quien');
  q.innerHTML=`<b>${u?esc(u.nombre):'Invitado'}</b><small>${u?'Ver mi perfil':'Crear cuenta o entrar'}</small><span class="sj-nivel" title="${h} de ${L.length} logros"><u style="width:${Math.round(h/L.length*100)}%"></u></span>`;
  q.dataset.cuenta=u?'entrar':'registro';
  const it=(id,href,t,ic)=>`<a href="${href}"${act===id?' aria-current="page"':''}><svg viewBox="0 0 24 24" aria-hidden="true">${ic}</svg><span>${t}</span></a>`;
  $('#nav').innerHTML=it('inicio','#/','Inicio',NAVI.inicio)+it('juegos','#/juegos','Juegos',NAVI.juegos)+it('categorias','#/categorias','Categorías',NAVI.cat)+it('logros','#/logros','Logros',NAVI.logros)+it('perfil','#/perfil','Perfil',NAVI.perfil);
  pintarAvatar();
}

/* ---------- Tarjetas ---------- */
function cardGrande(g,P){
  return `<article class="sj-gran" style="--t:${g.t}"><button class="sj-img" type="button" data-abrir="${G.indexOf(g)}" aria-label="Ver detalles de ${esc(g.n)}"><img src="img/${g.i}.svg" alt=""></button>
   <h3>${g.n}</h3><p>${g.s}</p><a class="sj-jugar" href="${g.h}" aria-label="Jugar ${esc(g.n)}">${PLAY}Jugar ahora</a></article>`;
}
function cardChica(g,P){
  const j=P.juegos[g.i]||{};
  return `<article class="sj-chic" style="--t:${g.t}"><button class="sj-cab" type="button" data-abrir="${G.indexOf(g)}" aria-label="Ver detalles de ${esc(g.n)}"><img src="img/${g.i}.svg" alt=""><span style="min-width:0"><b>${g.n}</b><small>${CAT[g.k].n}</small></span></button>
   <div class="sj-st"><div><small>Partidas</small><b>${fmtN(j.partidas||0)}</b></div><div><small>Mejor</small><b>${mejorNum(g,P)}</b></div></div>
   <a class="sj-jugar" href="${g.h}" aria-label="Jugar ${esc(g.n)}">${PLAY}Jugar ahora</a></article>`;
}
const cabPag=(t,s)=>`<div class="sj-pg"><h1>${t}</h1>${s?`<p>${s}</p>`:''}</div>`;

/* ---------- Banner (carrusel de categorías) ---------- */
let slide=0,timer=null,panelAbierto=false;
const reduceMov=matchMedia('(prefers-reduced-motion:reduce)').matches;
function heroHTML(k){
  const c=CAT[k],js=G.filter(g=>g.k===k).slice(0,4);
  return `<div><p class="sj-eyebrow">Zona de desafío:</p><h2>${c.n}</h2><a class="sj-btn-b" href="#/cat/${k}">Ver juegos</a></div>
  <div class="sj-tiles" style="--n:${js.length}">${js.map(g=>`<button class="sj-tile" type="button" style="--t:${g.t}" data-abrir="${G.indexOf(g)}" aria-label="Ver detalles de ${esc(g.n)}"><img src="img/${g.i}.svg" alt=""><span>${g.n}</span></button>`).join('')}</div>`;
}
function pintarHero(k,anim){
  slide=k;const h=$('#hero'),i=$('#heroIn');if(!h)return;
  h.style.setProperty('--fin',FIN[k]);i.innerHTML=heroHTML(k);
  i.classList.remove('sj-sw');if(anim){void i.offsetWidth;i.classList.add('sj-sw')}
  h.querySelectorAll('.sj-dot').forEach((d,n)=>d.setAttribute('aria-current',n===k));
}
function auto(){clearInterval(timer)}   // el banner ya no cambia solo: se maneja con las flechas o los puntos

/* ---------- Vistas ---------- */
function vistaInicio(){
  const P=D.progreso(),top=topJuegos(P).slice(0,8),L=D.logros();
  const prox=L.filter(l=>!l.hecho).sort((a,b)=>b.valor/b.meta-a.valor/a.meta).slice(0,3);
  $('#vista').innerHTML=`${buscadorHTML()}${catsHTML()}<div class="sj-grid">
  <section class="sj-hero" id="hero" aria-roledescription="carrusel" aria-label="Categorías destacadas"><div class="sj-hero-in" id="heroIn"></div>
   <div class="sj-dots"><button class="sj-flecha" type="button" data-slide-rel="-1" aria-label="Categoría anterior"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg></button>${CAT.map((c,k)=>`<button class="sj-dot" type="button" data-slide="${k}" aria-label="Categoría: ${c.n}"></button>`).join('')}<button class="sj-flecha" type="button" data-slide-rel="1" aria-label="Categoría siguiente"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button></div></section>

  <aside class="sj-lat" id="lat" data-abierto="${panelAbierto}" aria-label="Panel lateral">
   <button class="sj-tog" type="button" data-tog aria-expanded="${panelAbierto}" aria-controls="latC"><span class="sj-tog-i">${ICO_COPA}</span><span class="sj-tog-t"><b>Mi panel</b><small>Top juegos y próximos logros</small></span>${CHEV}</button>
   <div class="sj-lat-c" id="latC"><div class="sj-lat-i">
    <section class="sj-box"><div class="sj-bh"><h2>Tus top juegos</h2></div>
     <ol class="sj-rank">${top.map((g,i)=>{const n=partidasDe(P,g),m=mejorNum(g,P);
      return `<li><button class="sj-fila" type="button" style="--t:${g.t}" data-abrir="${G.indexOf(g)}"><span class="sj-rk${i<3?' r'+(i+1):''}">${i+1}</span><img src="img/${g.i}.svg" alt=""><span style="min-width:0"><b>${g.n}</b><small>${n?fmtN(n)+(n===1?' partida':' partidas'):'Sin partidas'}</small></span><em class="${m==='–'?'no':''}">${m}</em></button></li>`}).join('')}</ol></section>
    <section class="sj-box"><div class="sj-bh"><h2>Próximos logros</h2><a href="#/logros">Ver</a></div>
     ${prox.length?prox.map(l=>{const v=l.fmt==='min'?Math.floor(l.valor/60):l.valor,m=l.fmt==='min'?Math.floor(l.meta/60):l.meta;
      return `<div class="sj-lg"><span class="m">${ICO_LOGRO}</span><div><b>${esc(l.titulo)}</b><small>${esc(l.desc)}</small><i role="progressbar" aria-valuemin="0" aria-valuemax="${m}" aria-valuenow="${v}"><u style="width:${Math.round(v/m*100)}%"></u></i></div></div>`}).join(''):'<p class="sj-vacio">Aún no hay logros disponibles.</p>'}</section>
   </div></div>
  </aside>

  <section class="sj-dest sj-box"><div class="sj-bh"><h2>Tus juegos destacados</h2><a href="#/juegos">Ver todos</a></div>
   <div class="sj-cq"><div class="sj-g4">${top.slice(0,4).map(g=>cardGrande(g,P)).join('')}</div>
   <div class="sj-ch">${top.slice(4,8).map(g=>cardChica(g,P)).join('')}</div></div></section>
  </div>`;
  pintarHero(slide,false);
}
function listaHTML(k,P){
  if(consulta.trim()){
    const r=buscar(consulta);
    return r.length?`<p class="sj-cuenta" role="status">${r.length} ${r.length===1?'juego encontrado':'juegos encontrados'}</p><div class="sj-ch">${r.map(g=>cardChica(g,P)).join('')}</div>`
      :`<div class="sj-nada" role="status"><b>No encontramos «${esc(consulta.trim())}»</b><p>Revisa cómo está escrito o prueba con una palabra más corta, como «parejas», «números» o «carreras». También puedes elegir una categoría:</p>${catsHTML()}</div>`;
  }
  if(k==null)return CAT.map((c,i)=>`<section class="sj-sec"><h2 class="sj-sh"><span class="ico" style="--c:${c.c}"><svg viewBox="0 0 24 24" aria-hidden="true">${c.ic}</svg></span>${c.n}<small>${nJuegos(i)} juegos</small></h2><div class="sj-ch">${G.filter(g=>g.k===i).map(g=>cardChica(g,P)).join('')}</div></section>`).join('');
  return `<div class="sj-ch">${G.filter(g=>g.k===k).map(g=>cardChica(g,P)).join('')}</div>`;
}
function vistaJuegos(k){
  const P=D.progreso(),c=CAT[k],q=consulta.trim();
  const chips=`<a class="sj-chip" href="#/juegos"${k==null&&!q?' aria-current="true"':''}>Todos · ${G.length}</a>`+CAT.map((x,i)=>`<a class="sj-chip" href="#/cat/${i}"${k===i&&!q?' aria-current="true"':''}>${x.n} · ${nJuegos(i)}</a>`).join('');
  $('#vista').innerHTML=`${cabPag(c?c.n:'Todos los juegos',c?nJuegos(k)+' juegos':'Busca por nombre o recorre las categorías')}${buscadorHTML()}<nav class="sj-chips" aria-label="Filtrar por categoría">${chips}</nav>
   <div class="sj-cq" id="lista" data-k="${k==null?'':k}">${listaHTML(k,P)}</div>`;
  const a=$('.sj-chip[aria-current=true]');if(a&&a.scrollIntoView)a.scrollIntoView({inline:'center',block:'nearest'});
  if(q){const f=$('#inpBus');f.focus({preventScroll:true});f.setSelectionRange(f.value.length,f.value.length)}
}
function vistaDesafios(){
  $('#vista').innerHTML=`${cabPag('Categorías','Elige el tipo de juego que más te guste')}
  <div class="sj-desf">${CAT.map((c,k)=>`<article class="sj-dz" style="--fin:${FIN[k]}"><div><h2>${c.n}</h2><p>${nJuegos(k)} juegos</p></div>
   <div class="sj-mini">${G.filter(g=>g.k===k).slice(0,4).map(g=>`<img style="--t:${g.t}" src="img/${g.i}.svg" alt="" title="${esc(g.n)}">`).join('')}</div>
   <a class="sj-btn-b" href="#/cat/${k}">Ver juegos</a></article>`).join('')}</div>`;
}
let logroTab='gen';
function tarjetaLogro(l){
  const v=l.fmt==='min'?Math.floor(l.valor/60):l.valor,m=l.fmt==='min'?Math.floor(l.meta/60):l.meta;
  return `<div class="bb-logro${l.hecho?' ok':''}"><span class="m"><svg viewBox="0 0 24 24" aria-hidden="true">${l.hecho?'<path d="M5 12.5l4.5 4.5L19 7.500"/>':'<rect x="6" y="11" width="12" height="9" rx="2"/><path d="M8.500 11V8a3.500 3.500 0 0 1 7 0v3"/>'}</svg></span>
   <span class="bb-tx" style="white-space:normal"><b>${esc(l.titulo)}</b><small>${esc(l.desc)}</small><div class="bb-barra" role="progressbar" aria-valuemin="0" aria-valuemax="${m}" aria-valuenow="${v}"><i style="width:${Math.round(v/m*100)}%"></i></div></span></div>`;
}
function vistaLogros(){
  const L=D.logros(),h=L.filter(l=>l.hecho).length,C=2*Math.PI*36,r=D.resumen();
  const gen=L.filter(l=>l.grupo==='general'),pj=L.filter(l=>l.grupo!=='general');
  const hg=gen.filter(l=>l.hecho).length,hp=pj.filter(l=>l.hecho).length;
  let cuerpo;
  if(logroTab==='gen')cuerpo=`<div class="bb-logros">${gen.map(tarjetaLogro).join('')}</div>`;
  else cuerpo=G.map(g=>{const ls=pj.filter(l=>l.grupo===g.i);if(!ls.length)return '';
    return `<section><h3 class="bb-grp"><img src="img/${g.i}.svg" alt="">${g.n}<small>${ls.filter(l=>l.hecho).length} de ${ls.length}</small></h3><div class="bb-logros">${ls.map(tarjetaLogro).join('')}</div></section>`}).join('');
  $('#vista').innerHTML=`${cabPag('Logros')}
  <div class="bb-anillo"><svg viewBox="0 0 84 84" aria-hidden="true"><circle class="f" cx="42" cy="42" r="36"/><circle class="p" cx="42" cy="42" r="36" stroke-dasharray="${C}" stroke-dashoffset="${C}" id="anillo"/></svg>
   <div><b>${h} de ${L.length}</b><span>${fmtN(r.partidas)} ${r.partidas===1?'partida':'partidas'} · ${fmtT(r.segundos)} jugados</span></div></div>
  <div class="bb-tabs" role="tablist" style="margin:16px 0 0"><button role="tab" aria-selected="${logroTab==='gen'}" data-lt="gen">Generales · ${hg}/${gen.length}</button><button role="tab" aria-selected="${logroTab==='juego'}" data-lt="juego">Por juego · ${hp}/${pj.length}</button></div>
  ${cuerpo}`;
  document.querySelectorAll('[data-lt]').forEach(b=>b.onclick=()=>{logroTab=b.dataset.lt;vistaLogros()});
  requestAnimationFrame(()=>requestAnimationFrame(()=>{const a=$('#anillo');if(a)a.style.strokeDashoffset=C*(1-h/L.length)}));
}


/* ---------- Perfil: progreso completo ---------- */
let ptab='jugados';
const NIVELES=[['Principiante',0],['Aprendiz',.06],['Jugador',.18],['Experto',.36],['Maestro',.6]];
const ymd=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
function racha(dias){const st=new Set(dias),d=new Date();let n=0;if(!st.has(ymd(d)))d.setDate(d.getDate()-1);while(st.has(ymd(d))){n++;d.setDate(d.getDate()-1)}return n}
function fechaRel(t){
  const d=new Date(t),h=new Date(),a=new Date();a.setDate(h.getDate()-1);
  const hm=d.toLocaleTimeString('es-MX',{hour:'numeric',minute:'2-digit'});
  if(ymd(d)===ymd(h))return 'Hoy · '+hm;if(ymd(d)===ymd(a))return 'Ayer · '+hm;
  return d.toLocaleDateString('es-MX',{day:'numeric',month:'short'});
}
const gPorId=id=>G.find(g=>g.i===id);
const pct=(a,b)=>b?Math.round(a/b*100):0;
const DEF=g=>D.JUEGOS[g.i]||{};

function filaJuego(g,P,max){
  const j=P.juegos[g.i]||{},u=DEF(g).u||'puntos';
  return `<article class="pf-j" style="--t:${g.t}"><button class="pf-jn" type="button" data-abrir="${G.indexOf(g)}" aria-label="Ver detalles de ${esc(g.n)}"><img src="img/${g.i}.svg" alt=""><span><b>${g.n}</b><small>${CAT[g.k].n}</small></span></button>
   <dl class="pf-jd"><div><dt>Partidas</dt><dd>${fmtN(j.partidas||0)}</dd></div><div><dt>Mejor</dt><dd>${j.mejor!=null?fmtN(j.mejor)+' <small>'+u+'</small>':'–'}</dd></div><div><dt>Tiempo</dt><dd>${j.segundos?fmtT(j.segundos):'–'}</dd></div><div><dt>Victorias</dt><dd>${fmtN(j.victorias||0)}</dd></div></dl>
   <a class="sj-jugar pf-go" href="${g.h}" aria-label="Jugar ${esc(g.n)}">${PLAY}Jugar</a>
   <i class="pf-pb" aria-hidden="true"><u style="width:${pct(j.partidas||0,max)}%"></u></i></article>`;
}

function vistaPerfil(){
  const u=D.usuarioActual(),P=D.progreso(),r=D.resumen(P),L=D.logros(),hechos=L.filter(l=>l.hecho);
  /* nivel según logros */
  const th=NIVELES.map(([n,f])=>[n,Math.round(f*L.length)]);let ni=0;th.forEach((t,i)=>{if(hechos.length>=t[1])ni=i});
  const sig=th[ni+1],base=th[ni][1],pn=sig?pct(hechos.length-base,sig[1]-base):100;
  /* actividad 14 días */
  const d14=[...Array(14)].map((_,i)=>{const d=new Date();d.setDate(d.getDate()-(13-i));return d});
  const cnt={};P.sesiones.forEach(x=>{const k=ymd(new Date(x.fecha));cnt[k]=(cnt[k]||0)+1});
  const val=d14.map(d=>cnt[ymd(d)]||0),mx=Math.max(1,...val),tot14=val.reduce((a,b)=>a+b,0);
  /* juegos */
  const jug=G.filter(g=>partidasDe(P,g)>0).sort((a,b)=>partidasDe(P,b)-partidasDe(P,a)),sin=G.filter(g=>!partidasDe(P,g)),maxP=partidasDe(P,jug[0]||G[0])||1;
  const recientes=P.sesiones.slice(0,8);
  const ult=hechos.filter(l=>l.fecha).sort((a,b)=>b.fecha-a.fecha).slice(0,4);
  const prox=L.filter(l=>!l.hecho).sort((a,b)=>b.valor/b.meta-a.valor/a.meta).slice(0,4);
  const rc=racha(P.dias);
  const tile=(n,t,x)=>`<div class="pf-t"><b>${n}</b><span>${t}</span>${x?`<small>${x}</small>`:''}</div>`;

  $('#vista').innerHTML=`${cabPag('Mi perfil','Todo tu progreso en un solo lugar')}
  <section class="pf-hero sj-box" aria-label="Resumen del jugador">
   <div class="pf-id">${avatar(u,true)}<div class="pf-nom"><h2>${u?esc(u.nombre):'Invitado'}</h2>
     <p>${u?esc(u.correo)+' · en la sala desde el '+new Date(u.creado).toLocaleDateString('es-MX',{day:'numeric',month:'long',year:'numeric'}):'Tu progreso se guarda solo en este dispositivo. Crea una cuenta para conservarlo.'}</p></div></div>
   <div class="pf-nivel"><div class="pf-nt"><span class="pf-estrella"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9 6.8 19.700l1-5.900L3.500 9.700l5.900-.8z"/></svg></span><div><b>Nivel ${ni+1} · ${th[ni][0]}</b><small>${sig?`Te faltan ${sig[1]-hechos.length} ${sig[1]-hechos.length===1?'logro':'logros'} para ser ${sig[0]}`:'¡Llegaste al nivel más alto!'}</small></div></div>
    <div class="pf-barra" role="progressbar" aria-label="Progreso al siguiente nivel" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pn}"><u style="width:${pn}%"></u></div></div>
   <div class="pf-acc">${u?`<a class="bb-btn sec" href="#perfil-cuenta" data-ir="cuenta">Cambiar foto</a><button class="bb-btn sec" type="button" data-export>Descargar mis datos</button>`
      :`<button class="bb-btn" type="button" style="--t:#f57c73" data-cuenta="registro">Crear cuenta</button><button class="bb-btn sec" type="button" data-cuenta="entrar">Ya tengo cuenta</button>`}</div>
  </section>

  <div class="pf-tiles" role="list">${tile(fmtN(r.partidas),'Partidas jugadas')}${tile(r.juegos+'/'+G.length,'Juegos probados',pct(r.juegos,G.length)+'% de la sala')}${tile(hechos.length+'/'+L.length,'Logros',pct(hechos.length,L.length)+'% completado')}${tile(r.segundos?fmtT(r.segundos):'0 min','Tiempo jugado')}${tile(fmtN(r.victorias),'Victorias')}${tile(rc+(rc===1?' día':' días'),'Racha actual',r.dias+(r.dias===1?' día jugado':' días jugados')+' en total')}</div>

  <div class="pf-dos">
   <section class="sj-box"><div class="sj-bh"><h2>Progreso por categoría</h2></div>
    ${CAT.map((c,k)=>{const gs=G.filter(g=>g.k===k),j=gs.filter(g=>partidasDe(P,g)>0).length,pp=gs.reduce((a,g)=>a+partidasDe(P,g),0);
      return `<div class="pf-cat" style="--c:${c.c}"><span class="ico"><svg viewBox="0 0 24 24" aria-hidden="true">${c.ic}</svg></span><div><div class="pf-ct"><b>${c.n}</b><span>${j} de ${gs.length} probados</span></div><div class="pf-barra" role="progressbar" aria-label="${c.n}" aria-valuemin="0" aria-valuemax="${gs.length}" aria-valuenow="${j}"><u style="width:${pct(j,gs.length)}%"></u></div><small>${fmtN(pp)} ${pp===1?'partida':'partidas'}</small></div></div>`}).join('')}
   </section>
   <section class="sj-box"><div class="sj-bh"><h2>Actividad · 14 días</h2></div>
    <p class="pf-sub">${tot14?`${tot14} ${tot14===1?'partida':'partidas'} en las últimas dos semanas.`:'Todavía no hay partidas en las últimas dos semanas.'}</p>
    <div class="pf-graf" role="img" aria-label="Partidas por día en los últimos 14 días: ${val.join(', ')}">${d14.map((d,i)=>`<div class="pf-col${ymd(d)===ymd(new Date())?' hoy':''}" title="${d.toLocaleDateString('es-MX',{weekday:'long',day:'numeric',month:'long'})}: ${val[i]}"><em>${val[i]||''}</em><i style="height:${val[i]?Math.max(8,val[i]/mx*100):3}%"></i><span>${'DLMXJVS'[d.getDay()]}</span></div>`).join('')}</div>
    <div class="pf-mini"><div><b>${fmtN(r.puntos)}</b><small>Puntos acumulados</small></div><div><b>${r.partidas?pct(r.victorias,r.partidas)+'%':'–'}</b><small>Partidas ganadas</small></div><div><b>${r.partidas&&r.segundos?fmtT(Math.round(r.segundos/r.partidas)):'–'}</b><small>Duración media</small></div></div>
   </section>
  </div>

  <section class="sj-box pf-sec"><div class="sj-bh"><h2>Mis juegos</h2></div>
   <div class="bb-tabs" role="tablist" style="margin:0 0 16px"><button role="tab" aria-selected="${ptab==='jugados'}" data-ptab="jugados">Jugados · ${jug.length}</button><button role="tab" aria-selected="${ptab==='nuevos'}" data-ptab="nuevos">Por probar · ${sin.length}</button></div>
   ${ptab==='jugados'?(jug.length?`<div class="pf-lista">${jug.map(g=>filaJuego(g,P,maxP)).join('')}</div>`:`<div class="sj-nada"><b>Aún no has jugado ninguna partida</b><p>Elige cualquier juego y aquí aparecerán tus récords, tiempos y victorias.</p><button class="bb-btn" type="button" style="--t:#f6ac69" data-azar>Sorpréndeme</button></div>`)
     :(sin.length?`<div class="sj-cq"><div class="sj-ch">${sin.map(g=>cardChica(g,P)).join('')}</div></div>`:'<div class="sj-nada"><b>¡Probaste todos los juegos!</b><p>Ahora puedes mejorar tus récords.</p></div>')}
  </section>

  <div class="pf-dos">
   <section class="sj-box"><div class="sj-bh"><h2>Últimas partidas</h2></div>
    ${recientes.length?`<ul class="pf-ult">${recientes.map(x=>{const g=gPorId(x.juego);if(!g)return '';const un=DEF(g).u||'puntos';
      return `<li><img src="img/${g.i}.svg" alt="" style="--t:${g.t}"><div><b>${g.n}</b><small>${fechaRel(x.fecha)}${x.seg?' · '+fmtT(x.seg):''}</small></div><span class="pf-res${x.ganada?' gano':''}">${x.ganada?'Victoria · ':''}${fmtN(x.puntaje)} <small>${un}</small></span></li>`}).join('')}</ul>`:'<p class="sj-vacio">Cuando juegues, tus últimas partidas aparecerán aquí.</p>'}
   </section>
   <section class="sj-box pf-lg"><div class="sj-bh"><h2>Logros</h2><a href="#/logros">Ver todos</a></div>
    <h3 class="pf-h3">Conseguidos recientemente</h3>${ult.length?`<div class="bb-logros">${ult.map(tarjetaLogro).join('')}</div>`:'<p class="sj-vacio">Aún no has conseguido logros.</p>'}
    <h3 class="pf-h3">Los más cercanos</h3>${prox.length?`<div class="bb-logros">${prox.map(tarjetaLogro).join('')}</div>`:'<p class="sj-vacio">¡Los conseguiste todos!</p>'}
   </section>
  </div>

  ${u?`<section class="sj-box pf-sec" id="perfil-cuenta"><div class="sj-bh"><h2>Mi cuenta</h2></div>
   <p class="pf-sub" style="margin-bottom:10px">Elige tu foto de perfil</p>${gridAvatares(u.avatar)}
   <div class="pf-acc" style="margin-top:14px"><button class="bb-btn sec" type="button" data-export>Descargar mis datos (JSON)</button><button class="bb-btn peli" type="button" data-salir>Cerrar sesión</button></div>
   <p class="bb-nota">Tu progreso se guarda en este dispositivo. Cuando la sala se conecte a un servidor, se sincronizará con tu cuenta.</p></section>`:''}`;
  document.querySelectorAll('.bb-avop').forEach(b=>b.onclick=()=>{if(D.cambiarAvatar(b.dataset.av)){ruta();D.aviso('Foto actualizada','Se ve genial')}});
}
function exportarDatos(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([D.exportar()],{type:'application/json'}));a.download='mi-progreso-sala.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000)}

/* ---------- Router ---------- */
function nav(h){location.hash=h}
function ruta(){
  clearInterval(timer);
  if(!conservar)consulta='';conservar=false;
  const h=location.hash.replace(/^#\/?/,''),m=h.match(/^cat\/(\d)$/);
  let act='';
  if(m&&CAT[+m[1]]){vistaJuegos(+m[1]);act='juegos'}
  else if(h==='juegos'){vistaJuegos(null);act='juegos'}
  else if(h==='categorias'||h==='desafios'){vistaDesafios();act='categorias'}
  else if(h==='logros'){vistaLogros();act='logros'}
  else if(h==='perfil'){vistaPerfil();act='perfil'}
  else{vistaInicio();act='inicio'}
  pintarCabecera(act);scrollTo(0,0);
}
addEventListener('hashchange',ruta);

/* ---------- Hojas ---------- */
let volver=null;
function abrirHoja(html,clase=''){
  cerrarHoja(true);volver=document.activeElement;
  $('#capa').innerHTML=`<div class="bb-capa"><div class="bb-hoja ${clase}" role="dialog" aria-modal="true"><div class="bb-cima"><span class="bb-asa" aria-hidden="true"></span><button class="bb-x" aria-label="Cerrar" data-cerrar><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg><span>Cerrar</span></button></div>${html}</div></div>`;
  document.body.style.overflow='hidden';
  const c=$('.bb-capa');c.onclick=e=>{if(e.target===c)cerrarHoja()};
  const f=$('.bb-hoja input,.bb-hoja .bb-btn,.bb-x');f&&f.focus({preventScroll:true});
}
function cerrarHoja(rapido){
  const c=$('.bb-capa');if(!c)return;
  document.body.style.overflow='';
  const fin=()=>{$('#capa').innerHTML='';if(volver&&volver.focus&&document.contains(volver))volver.focus({preventScroll:true});volver=null};
  if(rapido){$('#capa').innerHTML='';return}
  c.classList.add('sale');setTimeout(fin,200);
}
function hojaJuego(i){
  const g=G[i],P=D.progreso(),j=P.juegos[g.i]||{},def=D.JUEGOS[g.i]||{};
  abrirHoja(`<div class="bb-det" style="--t:${g.t}"><img class="gr" src="img/${g.i}.svg" alt=""><h2>${g.n}</h2><p class="st">${g.s}</p><p class="ds">${g.d}</p>
   <div class="bb-tags">${g.g.map(t=>`<span>${t}</span>`).join('')}</div>
   <div class="bb-stats"><div><b>${j.mejor!=null?fmtN(j.mejor):'–'}</b><small>Mejor (${def.u||'puntos'})</small></div><div><b>${fmtN(j.partidas||0)}</b><small>Partidas</small></div><div><b>${j.segundos?fmtT(j.segundos):'–'}</b><small>Tiempo</small></div></div>
   <a class="bb-btn" href="${g.h}">Jugar ahora</a></div>`);
}
function hojaCuenta(modo){
  const u=D.usuarioActual();
  if(u){
    const r=D.resumen(),L=D.logros().filter(l=>l.hecho).length;
    abrirHoja(`<div class="bb-cuenta">${avatar(u,true)}<h2>${esc(u.nombre)}</h2><p class="co">${esc(u.correo)}</p>
     <div class="bb-resumen"><div><b>${fmtN(r.partidas)}</b><small>Partidas</small></div><div><b>${r.juegos}/${G.length}</b><small>Juegos probados</small></div><div><b>${L}</b><small>Logros</small></div></div>
     <p class="co" style="margin-top:8px">${fmtT(r.segundos)} jugados · cuenta creada el ${new Date(u.creado).toLocaleDateString('es-MX',{day:'numeric',month:'long',year:'numeric'})}</p>
     <p class="co" style="margin:14px 0 8px;font-weight:700;color:var(--text)">Cambiar mi foto de perfil</p>${gridAvatares(u.avatar)}
     <button class="bb-btn sec" id="exp">Descargar mis datos (JSON)</button><button class="bb-btn peli" id="sal">Cerrar sesión</button>
     <p class="bb-nota">Tu progreso se guarda en este dispositivo. Cuando la sala se conecte a un servidor, se sincronizará con tu cuenta.</p></div>`);
    $('#exp').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([D.exportar()],{type:'application/json'}));a.download='mi-progreso-sala.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000)};
    $('#sal').onclick=()=>{D.salir();cerrarHoja();ruta()};
    document.querySelectorAll('.bb-avop').forEach(b=>b.onclick=()=>{if(D.cambiarAvatar(b.dataset.av)){hojaCuenta();ruta();D.aviso('Foto actualizada','Se ve genial')}});
    return;
  }
  const reg=modo==='registro';let color=D.COLORES[Math.floor(Math.random()*D.COLORES.length)],av=D.AVATARES[Math.floor(Math.random()*D.AVATARES.length)].id;
  abrirHoja(`<div class="bb-cuenta"><h2>${reg?'Crea tu cuenta':'Bienvenido de nuevo'}</h2><p class="co" style="margin-bottom:14px">${reg?'Guarda tus récords y tu progreso en cada juego.':'Entra para continuar donde lo dejaste.'}</p>
   <div class="bb-tabs" role="tablist"><button role="tab" aria-selected="${reg}" data-m="registro">Crear cuenta</button><button role="tab" aria-selected="${!reg}" data-m="entrar">Entrar</button></div>
   <form class="bb-form" id="frm" novalidate>
    ${reg?`<label>Nombre de jugador<input name="nombre" autocomplete="username" maxlength="20" required></label>
    <label>Correo<input name="correo" type="email" autocomplete="email" inputmode="email" required></label>`
    :`<label>Nombre o correo<input name="id" autocomplete="username" required></label>`}
    <label>Contraseña<input name="clave" type="password" autocomplete="${reg?'new-password':'current-password'}" minlength="6" required></label>
    ${reg?`<p class="ayuda" style="margin-top:-6px">Mínimo 6 caracteres.</p><div><span style="font-size:13px;font-weight:700;color:var(--bb-mut)">Elige tu foto de perfil</span><div style="margin-top:8px">${gridAvatares(av)}</div></div>`:''}
    <p class="bb-err" id="err" role="alert" hidden></p>
    <button class="bb-btn" id="ok" type="submit" style="--t:#f57c73;margin-top:4px">${reg?'Crear cuenta':'Entrar'}</button>
   </form>
   <p class="bb-nota">${reg?'Tu progreso de invitado se conservará en la cuenta nueva.':'El progreso que tengas como invitado se sumará a tu cuenta.'}<br>Por ahora la cuenta vive en este dispositivo.</p></div>`);
  document.querySelectorAll('.bb-tabs button').forEach(b=>b.onclick=()=>hojaCuenta(b.dataset.m));
  document.querySelectorAll('.bb-avop').forEach(b=>b.onclick=()=>{av=b.dataset.av;document.querySelectorAll('.bb-avop').forEach(x=>x.setAttribute('aria-checked',x===b))});
  $('#frm').onsubmit=async e=>{
    e.preventDefault();const f=Object.fromEntries(new FormData(e.target)),err=$('#err'),ok=$('#ok');
    err.hidden=true;ok.disabled=true;ok.style.opacity=.6;
    const r=reg?await D.registrar({...f,color,avatar:av}):await D.entrar(f);
    ok.disabled=false;ok.style.opacity='';
    if(!r.ok){err.textContent=r.error;err.hidden=false;return}
    cerrarHoja(true);ruta();D.aviso(reg?'¡Cuenta creada!':'Sesión iniciada','Hola, '+r.usuario.nombre);
  };
}


function hojaAvisos(){
  const L=D.logros().filter(l=>l.fecha).sort((a,b)=>b.fecha-a.fecha).slice(0,6);
  abrirHoja(`<div class="bb-cuenta"><h2>Avisos</h2>${L.length?`<p class="co">Tus logros más recientes</p><ul class="sj-avisos">${L.map(l=>`<li><span class="bb-avatar" style="width:38px;height:38px;background:var(--gold)">${ICO_COPA}</span><span><b>${esc(l.titulo)}</b><small>${new Date(l.fecha).toLocaleDateString('es-MX',{day:'numeric',month:'short'})} · ${esc(l.desc)}</small></span></li>`).join('')}</ul>`:'<p class="co" style="margin-top:6px">Aún no tienes avisos. Cuando consigas un logro aparecerá aquí.</p>'}
   <a class="bb-btn sec" href="#/logros" data-cerrar>Ver todos los logros</a></div>`);
}

/* ---------- Eventos ---------- */
document.addEventListener('click',e=>{
  const a=e.target.closest('[data-abrir]');if(a){hojaJuego(+a.dataset.abrir);return}
  const c=e.target.closest('[data-cuenta]');if(c){if(D.usuarioActual()){if(location.hash!=='#/perfil')location.hash='#/perfil'}else hojaCuenta(c.dataset.cuenta);return}
  if(e.target.closest('#btnCuenta')){if(D.usuarioActual()){if(location.hash!=='#/perfil')location.hash='#/perfil'}else hojaCuenta('entrar');return}
  if(e.target.closest('[data-export]')){exportarDatos();return}
  if(e.target.closest('[data-salir]')){D.salir();ruta();D.aviso('Sesión cerrada','Vuelve pronto');return}
  const ir=e.target.closest('[data-ir]');if(ir){e.preventDefault();const t=document.getElementById('perfil-'+ir.dataset.ir);if(t)t.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'start'});return}
  const pt=e.target.closest('[data-ptab]');if(pt){ptab=pt.dataset.ptab;vistaPerfil();return}
  if(e.target.closest('[data-avisos]')){hojaAvisos();return}
  if(e.target.closest('[data-limpiar]')){consulta='';const f=$('#inpBus');f.value='';e.target.closest('[data-limpiar]').hidden=true;f.focus();if($('#lista'))refrescarLista();return}
  if(e.target.closest('[data-azar]')){const P=D.progreso(),n=G.filter(g=>!(P.juegos[g.i]||{}).partidas),b=n.length?n:G;hojaJuego(G.indexOf(b[Math.floor(Math.random()*b.length)]));return}
  const tx=e.target.closest('[data-texto]');if(tx){cambiarTexto();return}
  const sr=e.target.closest('[data-slide-rel]');if(sr){pintarHero((slide+ +sr.dataset.slideRel+CAT.length)%CAT.length,true);return}
  const s=e.target.closest('[data-slide]');if(s){pintarHero(+s.dataset.slide,true);auto();return}
  const t=e.target.closest('[data-tog]');
  if(t){panelAbierto=!panelAbierto;$('#lat').dataset.abierto=panelAbierto;t.setAttribute('aria-expanded',panelAbierto);return}
  if(e.target.closest('[data-cerrar]'))cerrarHoja();
});
addEventListener('keydown',e=>{
  if(e.key==='Escape')cerrarHoja();
  if(e.key==='Tab'){const h=$('.bb-hoja');if(!h)return;const f=[...h.querySelectorAll('button,a[href],input')].filter(x=>!x.disabled&&x.offsetParent!==null);if(!f.length)return;
   const p=f[0],u=f[f.length-1];if(e.shiftKey&&document.activeElement===p){e.preventDefault();u.focus()}else if(!e.shiftKey&&document.activeElement===u){e.preventDefault();p.focus()}}
});
function refrescarLista(){const l=$('#lista');if(!l)return;l.innerHTML=listaHTML(l.dataset.k===''?null:+l.dataset.k,D.progreso())}
document.addEventListener('input',e=>{
  if(e.target.id!=='inpBus')return;
  consulta=e.target.value;const x=$('.sj-bx');if(x)x.hidden=!consulta;
  if($('#lista')){refrescarLista();const c=$('.sj-chip[aria-current=true]');document.querySelectorAll('.sj-chip').forEach(n=>n.removeAttribute('aria-current'));if(!consulta.trim()){const k=$('#lista').dataset.k;const t=[...document.querySelectorAll('.sj-chip')][k===''?0:+k+1];if(t)t.setAttribute('aria-current','true')}return}
  if(consulta.trim()){conservar=true;location.hash='#/juegos'}
});
document.addEventListener('submit',e=>{if(e.target.id==='frmBus'){e.preventDefault();const f=$('#inpBus');if(f)f.blur()}});
const NIV=['Normal','Grande','Muy grande'];
function cambiarTexto(){
  const a=+(document.documentElement.dataset.t||0),n=(a+1)%3;
  if(n)document.documentElement.dataset.t=n;else delete document.documentElement.dataset.t;
  try{localStorage.setItem('sala.texto',n||'')}catch(e){}
  D.aviso('Tamaño de letra',NIV[n]);
}
addEventListener('pageshow',ruta);   // al volver desde un juego, se actualizan récords y logros
ruta();

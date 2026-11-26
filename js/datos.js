/* =====================================================================
   SALA DE JUEGOS · datos.js
   Usuarios, progreso por juego y logros.

   HOY todo se guarda en el navegador (localStorage) para que funcione sin
   servidor. Está pensado para conectarse a una base de datos después:
   - Cada partida se guarda con un id único y se pone en una COLA DE EVENTOS
     (sala.cola). Cuando CONFIG.API tenga una dirección, la cola se envía sola.
   - El esquema de tablas está en esquema.sql y los endpoints en LEEME.md.
   ===================================================================== */
const SalaDatos=(()=>{
'use strict';

/* ---------- Configuración ---------- */
const CONFIG={
  API:'',            // Ej.: 'https://tu-servidor.com/api'. Vacío = solo guardado local.
  TOKEN:()=>null     // Cuando exista login real en el servidor, devuelve aquí el token.
};

/* ---------- Catálogo mínimo (nombres y unidades) ---------- */
const JUEGOS={
  memorama:{n:'Memorama',u:'intentos',bajo:true},   // menos intentos = mejor
  '2048':{n:'2048',u:'puntos'},
  acertijos:{n:'Acertijos',u:'resueltos'},
  ecuaciones:{n:'Ecuaciones',u:'aciertos'},
  rompecabezas:{n:'Rompecabezas',u:'puntos'},
  wordle:{n:'Wordle',u:'puntos'},
  pacman:{n:'Pacman',u:'puntos'},
  duckhunt:{n:'Duck Hunt',u:'puntos'},
  ajedrez:{n:'Ajedrez',u:'puntos'},
  buscaminas:{n:'Buscaminas',u:'puntos'},
  basta:{n:'Basta',u:'puntos'},
  tresenraya:{n:'Tres en Raya',u:'puntos'},
  conecta4:{n:'Conecta 4',u:'puntos'},
  damas:{n:'Damas',u:'puntos'},
  sudoku:{n:'Sudoku',u:'puntos'},
  hanoi:{n:'Torre de Hanói',u:'puntos'},
  nim:{n:'Nim',u:'puntos'},
  batallanaval:{n:'Batalla Naval',u:'puntos'},
  laberinto:{n:'Laberinto',u:'puntos'},
  torrescolores:{n:'Torres de colores',u:'puntos'},
  nimble:{n:'Nimble',u:'puntos'},
  spaceinvaders:{n:'Space Invaders',u:'puntos'},
  asteroids:{n:'Asteroids',u:'puntos'},
  carrerainfinita:{n:'Carreras infinitas',u:'puntos'},
  carreraautos:{n:'Carreras de autos',u:'puntos'},
  helicoptero:{n:'Helicóptero de obstáculos',u:'puntos'},
  esquivameteoritos:{n:'Esquiva meteoritos',u:'puntos'},
  plataformas:{n:'Plataformas 2D',u:'puntos'},
  lluviaobjetos:{n:'Lluvia de objetos',u:'puntos'},
  rebotapelota:{n:'Rebota la pelota',u:'puntos'},
  cortafrutas:{n:'Corta frutas',u:'puntos'},
  granja:{n:'Granja virtual',u:'puntos'},
  ciudad:{n:'Constructor de ciudades',u:'puntos'},
  creador:{n:'Creador de personajes',u:'puntos'},
  trivia:{n:'Trivia de cultura general',u:'puntos'},
  banderas:{n:'Adivina la bandera',u:'puntos'},
  quiensoy:{n:'¿Quién soy?',u:'puntos'},
  vof:{n:'Verdadero o falso',u:'puntos'},
  tiroblanco:{n:'Tiro al blanco',u:'puntos'},
  baloncesto:{n:'Lanzamiento de baloncesto',u:'puntos'},
  billar:{n:'Billar',u:'puntos'},
  minigolf:{n:'Minigolf',u:'puntos'},
  torre:{n:'Equilibrio de torre',u:'puntos'},
  scrabble:{n:'Scrabble',u:'puntos'},
  ahorcado:{n:'Ahorcado',u:'puntos'},
  sopa:{n:'Sopa de letras',u:'palabras'},
  pajaro:{n:'Pájaro Volador',u:'columnas'},
  piano:{n:'Piano Tiles',u:'notas'},
  simon:{n:'Simón Dice',u:'rondas'},
  topo:{n:'Golpea al Topo',u:'puntos'},
  serpiente:{n:'Serpiente',u:'puntos'},
  tetris:{n:'Tetris',u:'puntos'},
  rompeladrillos:{n:'Rompeladrillos',u:'puntos'}
};
const ALIAS={vuelo:'pajaro'};
/* Fotos de perfil disponibles (archivos en img/avatares/avatar_<id>.svg) */
const AVATARES=[['nina','Niña'],['nino','Niño'],['pacman','Pacman'],['duck_hunt','Duck Hunt'],['ajedrez','Ajedrez'],['golpea_al_topo','Topo'],['pajaro_volador','Pájaro'],['serpiente','Serpiente'],['tetris','Tetris'],['piano_tiles','Piano'],['wordle','Wordle'],['scrabble','Scrabble'],['sopa_de_letras','Sopa de letras'],['acertijos','Acertijos'],['rompecabezas','Rompecabezas'],['ecuaciones','Ecuaciones'],['memorama','Memorama']].map(([id,n])=>({id,n,src:(typeof RAIZ!=='undefined'?RAIZ:'')+'img/avatares/avatar_'+id+'.svg'}));
const COLORES=['#f57c73','#ffd8bf','#f6ac69','#ffe0b8','#f55c7a','#e8914a','#deba9e','#efb870'];

/* ---------- Almacenamiento ---------- */
const K={usuarios:'sala.usuarios',sesion:'sala.sesion',cola:'sala.cola',prog:id=>'sala.progreso.'+id};
const ls={
  get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},
  set(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}},
  del(k){try{localStorage.removeItem(k)}catch(e){}}
};
const uid=p=>p+'_'+Date.now().toString(36)+Math.random().toString(36).slice(2,8);
const hoy=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};

/* ---------- Contraseñas ----------
   OJO: esto es una protección básica solo para uso local. Cuando haya servidor,
   el hash y la verificación deben hacerse allá (bcrypt/argon2) y por HTTPS. */
const hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
async function hashClave(clave,sal){
  try{
    if(window.crypto&&crypto.subtle){
      const e=new TextEncoder(),k=await crypto.subtle.importKey('raw',e.encode(clave),'PBKDF2',false,['deriveBits']);
      const b=await crypto.subtle.deriveBits({name:'PBKDF2',salt:e.encode(sal),iterations:100000,hash:'SHA-256'},k,256);
      return 'pbkdf2$'+hex(b);
    }
  }catch(e){}
  let h=2166136261;const s=sal+clave;                       // respaldo si el navegador no tiene crypto.subtle
  for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}
  return 'simple$'+(h>>>0).toString(16);
}

/* ---------- Usuarios ---------- */
const usuarios=()=>ls.get(K.usuarios,[]);
const publico=u=>u?{id:u.id,nombre:u.nombre,correo:u.correo,color:u.color,avatar:u.avatar||null,creado:u.creado}:null;
function usuarioActual(){
  const id=ls.get(K.sesion,null);if(!id)return null;
  return publico(usuarios().find(u=>u.id===id))||null;
}
const idActivo=()=>{const u=usuarioActual();return u?u.id:'invitado'};

function validar({nombre,correo,clave}){
  nombre=(nombre||'').trim();correo=(correo||'').trim().toLowerCase();
  if(nombre.length<3||nombre.length>20)return 'El nombre debe tener entre 3 y 20 caracteres.';
  if(!/^[\p{L}\p{N} _.-]+$/u.test(nombre))return 'El nombre solo puede llevar letras, números, espacios, punto, guion y guion bajo.';
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo))return 'Escribe un correo válido (por ejemplo, tu@correo.com).';
  if((clave||'').length<6)return 'La contraseña debe tener al menos 6 caracteres.';
  return null;
}
async function registrar({nombre,correo,clave,color,avatar}){
  const err=validar({nombre,correo,clave});if(err)return{ok:false,error:err};
  nombre=nombre.trim();correo=correo.trim().toLowerCase();
  const lista=usuarios();
  if(lista.some(u=>u.nombre.toLowerCase()===nombre.toLowerCase()))return{ok:false,error:'Ese nombre ya está en uso. Prueba con otro.'};
  if(lista.some(u=>u.correo===correo))return{ok:false,error:'Ya existe una cuenta con ese correo.'};
  const sal=uid('s'),u={id:uid('u'),nombre,correo,sal,hash:await hashClave(clave,sal),color:color||COLORES[lista.length%COLORES.length],avatar:AVATARES.some(a=>a.id===avatar)?avatar:null,creado:Date.now()};
  lista.push(u);
  if(!ls.set(K.usuarios,lista))return{ok:false,error:'No se pudo guardar la cuenta (¿almacenamiento lleno o bloqueado?).'};
  fusionarInvitado(u.id);                       // el progreso de invitado pasa a la cuenta nueva
  ls.set(K.sesion,u.id);
  encolar('registro',{usuario:publico(u)},u.id);
  return{ok:true,usuario:publico(u)};
}
async function entrar({id,clave}){
  id=(id||'').trim().toLowerCase();
  const u=usuarios().find(x=>x.correo===id||x.nombre.toLowerCase()===id);
  if(!u||(await hashClave(clave||'',u.sal))!==u.hash)return{ok:false,error:'Usuario o contraseña incorrectos.'};
  fusionarInvitado(u.id);
  ls.set(K.sesion,u.id);
  encolar('login',{},u.id);
  return{ok:true,usuario:publico(u)};
}
function cambiarAvatar(id){
  const u=usuarioActual();if(!u||!AVATARES.some(a=>a.id===id))return false;
  const lista=usuarios(),x=lista.find(z=>z.id===u.id);x.avatar=id;ls.set(K.usuarios,lista);
  encolar('perfil',{avatar:id},u.id);return true;
}
function salir(){confirmar();ls.del(K.sesion);reiniciarSesionJuego()}

/* ---------- Progreso ---------- */
const vacio=()=>({juegos:{},sesiones:[],logros:{},dias:[],creado:Date.now()});
const cargar=(id=idActivo())=>Object.assign(vacio(),ls.get(K.prog(id),{}));
const guardar=(P,id=idActivo())=>ls.set(K.prog(id),P);
const juegoVacio=()=>({partidas:0,mejor:null,ultimo:0,total:0,victorias:0,segundos:0,ultima:0});

function fusionar(A,B){                          // mezcla el progreso B dentro de A
  for(const g in B.juegos){
    const a=A.juegos[g]||(A.juegos[g]=juegoVacio()),b=B.juegos[g],bajo=(JUEGOS[g]||{}).bajo;
    a.partidas+=b.partidas;a.total+=b.total;a.victorias+=b.victorias;a.segundos+=b.segundos;
    if(b.mejor!=null)a.mejor=a.mejor==null?b.mejor:(bajo?Math.min(a.mejor,b.mejor):Math.max(a.mejor,b.mejor));
    if(b.ultima>a.ultima){a.ultima=b.ultima;a.ultimo=b.ultimo}
  }
  A.sesiones=[...B.sesiones,...A.sesiones].sort((x,y)=>y.fecha-x.fecha).slice(0,100);
  A.dias=[...new Set([...A.dias,...B.dias])].sort().slice(-90);
  Object.assign(A.logros,Object.fromEntries(Object.entries(B.logros).filter(([k])=>!(k in A.logros))));
  A.creado=Math.min(A.creado,B.creado);
  return A;
}
function fusionarInvitado(destino){
  const G=ls.get(K.prog('invitado'),null);if(!G)return;
  const P=cargar(destino);guardar(fusionar(P,Object.assign(vacio(),G)),destino);
  ls.del(K.prog('invitado'));
}

/* ---------- Logros ---------- */
function resumen(P=cargar()){
  const j=Object.values(P.juegos);
  return{
    partidas:j.reduce((s,x)=>s+x.partidas,0),
    juegos:j.filter(x=>x.partidas>0).length,
    segundos:j.reduce((s,x)=>s+x.segundos,0),
    puntos:j.reduce((s,x)=>s+x.total,0),
    victorias:j.reduce((s,x)=>s+x.victorias,0),
    dias:P.dias.length
  };
}
const N_JUEGOS=Object.keys(JUEGOS).length;
const LOGROS=[
  {id:'cuenta',t:'Cuenta creada',d:'Regístrate para guardar tu progreso.',meta:1,v:(r,P,u)=>u?1:0},
  {id:'foto',t:'Con estilo',d:'Elige tu foto de perfil.',meta:1,v:(r,P,u)=>u&&u.avatar?1:0},
  {id:'primera',t:'Primera partida',d:'Juega tu primera partida.',meta:1,v:r=>r.partidas},
  {id:'victoria',t:'Primera victoria',d:'Completa un juego o un tablero.',meta:1,v:r=>r.victorias},
  {id:'curioso',t:'Curioso',d:'Prueba 3 juegos distintos.',meta:3,v:r=>r.juegos},
  {id:'explorador',t:'Explorador',d:'Prueba 8 juegos distintos.',meta:8,v:r=>r.juegos},
  {id:'mitad',t:'A medio camino',d:'Prueba 10 juegos distintos.',meta:10,v:r=>r.juegos},
  {id:'todo',t:'Lo probé todo',d:'Juega los '+N_JUEGOS+' juegos de la sala.',meta:N_JUEGOS,v:r=>r.juegos},
  {id:'constante',t:'Constante',d:'Juega 10 partidas.',meta:10,v:r=>r.partidas},
  {id:'veterano',t:'Veterano',d:'Juega 50 partidas.',meta:50,v:r=>r.partidas},
  {id:'leyenda',t:'Leyenda de la sala',d:'Juega 200 partidas.',meta:200,v:r=>r.partidas},
  {id:'imparable',t:'Imparable',d:'Juega 500 partidas.',meta:500,v:r=>r.partidas},
  {id:'ganador',t:'Ganador',d:'Consigue 10 victorias.',meta:10,v:r=>r.victorias},
  {id:'campeon',t:'Campeón',d:'Consigue 50 victorias.',meta:50,v:r=>r.victorias},
  {id:'racha',t:'Racha de 3 días',d:'Juega en 3 días distintos.',meta:3,v:r=>r.dias},
  {id:'semana',t:'Una semana',d:'Juega en 7 días distintos.',meta:7,v:r=>r.dias},
  {id:'mes',t:'Un mes entero',d:'Juega en 30 días distintos.',meta:30,v:r=>r.dias},
  {id:'calentando',t:'Calentando',d:'Acumula 10 minutos de juego.',meta:600,v:r=>r.segundos,fmt:'min'},
  {id:'maraton',t:'Maratón',d:'Acumula 60 minutos de juego.',meta:3600,v:r=>r.segundos,fmt:'min'},
  {id:'sin_parar',t:'Sin parar',d:'Acumula 3 horas de juego.',meta:10800,v:r=>r.segundos,fmt:'min'},
  {id:'mil',t:'Mil puntos',d:'Suma 1,000 puntos entre todos los juegos.',meta:1000,v:r=>r.puntos},
  {id:'diezmil',t:'Diez mil',d:'Suma 10,000 puntos entre todos los juegos.',meta:10000,v:r=>r.puntos},
  {id:'cienmil',t:'Cien mil',d:'Suma 100,000 puntos entre todos los juegos.',meta:100000,v:r=>r.puntos},
  {id:'coleccionista',t:'Coleccionista',d:'Consigue 30 logros.',meta:30,v:(r,P)=>Object.keys(P.logros).filter(k=>k!=='coleccionista').length}
].map(l=>({...l,g:'general'}));

/* Logros por juego: debut, 10 partidas y "maestro" (una meta propia de cada juego) */
const META_JUEGO={
  memorama:['bajo',16,'Completa un tablero en 16 intentos o menos.'],
  '2048':['mejor',2000,'Suma 2,000 puntos.'],acertijos:['mejor',10,'Resuelve 10 acertijos.'],ecuaciones:['mejor',8,'Acierta 8 problemas en una ronda.'],
  scrabble:['mejor',60,'Anota 60 puntos.'],ahorcado:['mejor',50,'Suma 50 puntos.'],sopa:['mejor',6,'Encuentra 6 palabras en una sopa.'],
  pajaro:['mejor',10,'Pasa 10 columnas.'],piano:['mejor',30,'Toca 30 notas.'],simon:['mejor',8,'Llega a la ronda 8.'],topo:['mejor',30,'Anota 30 puntos.'],
  serpiente:['mejor',100,'Anota 100 puntos.'],tetris:['mejor',1000,'Suma 1,000 puntos.'],rompeladrillos:['mejor',500,'Suma 500 puntos.'],
  rompecabezas:['vict',3,'Arma 3 rompecabezas completos.'],wordle:['vict',5,'Descubre la palabra 5 veces.'],pacman:['mejor',1500,'Suma 1,500 puntos.'],
  duckhunt:['mejor',5000,'Suma 5,000 puntos.'],ajedrez:['vict',3,'Gana 3 partidas de ajedrez.'],
  buscaminas:['vict',3,'Despeja 3 campos de minas.'],basta:['mejor',800,'Suma 800 puntos en una partida.'],
  tresenraya:['vict',5,'Gana 5 partidas.'],
  conecta4:['vict',3,'Gana 3 partidas.'],
  damas:['vict',3,'Gana 3 partidas.'],
  sudoku:['vict',3,'Resuelve 3 sudokus.'],
  hanoi:['vict',3,'Completa 3 torres.'],
  nim:['vict',3,'Gana 3 partidas.'],
  batallanaval:['vict',3,'Hunde 3 flotas enemigas.'],
  laberinto:['vict',3,'Sal de 3 laberintos.'],
  torrescolores:['vict',3,'Ordena 3 puzzles de tubos.'],
  nimble:['vict',3,'Gana 3 partidas.'],
  spaceinvaders:['vict',3,'Defiende la Tierra 3 veces.'],
  asteroids:['vict',3,'Despeja 3 sectores de asteroides.'],
  carrerainfinita:['vict',3,'Llega a la meta 3 veces.'],
  carreraautos:['vict',3,'Termina 3 carreras.'],
  helicoptero:['vict',3,'Atraviesa 3 túneles.'],
  esquivameteoritos:['vict',3,'Sobrevive 3 veces a la lluvia de meteoritos.'],
  plataformas:['vict',3,'Completa 3 niveles.'],
  lluviaobjetos:['vict',3,'Alcanza la meta 3 veces.'],
  rebotapelota:['vict',3,'Completa 3 retos de rebotes.'],
  cortafrutas:['vict',3,'Gana 3 partidas de Corta frutas.'],
  granja:['vict',3,'Alcanza la meta de monedas 3 veces.'],
  ciudad:['vict',3,'Haz crecer 3 ciudades hasta su meta.'],
  creador:['vict',3,'Completa 3 partidas del creador de personajes.'],
  trivia:['vict',3,'Termina 3 trivias de cultura general.'],
  banderas:['vict',3,'Reconoce las banderas de 3 partidas completas.'],
  quiensoy:['vict',3,'Descubre a todos los personajes en 3 partidas.'],
  vof:['vict',3,'Completa 3 partidas de verdadero o falso.'],
  tiroblanco:['vict',3,'Alcanza la meta de puntería 3 veces.'],
  baloncesto:['vict',3,'Gana 3 partidos de baloncesto.'],
  billar:['vict',3,'Limpia la mesa de billar 3 veces.'],
  minigolf:['vict',3,'Completa 3 recorridos de minigolf.'],
  torre:['vict',3,'Termina 3 torres sin que se caigan.']
};
const LOGROS_JUEGO=[];
Object.keys(JUEGOS).forEach(id=>{
  const n=JUEGOS[id].n,[tipo,meta,desc]=META_JUEGO[id]||['mejor',100,'Alcanza 100 puntos.'],J=P=>P.juegos[id]||{};
  LOGROS_JUEGO.push({id:id+'_1',g:id,t:'Debut en '+n,d:'Juega tu primera partida de '+n+'.',meta:1,v:(r,P)=>J(P).partidas||0});
  LOGROS_JUEGO.push({id:id+'_10',g:id,t:n+': 10 partidas',d:'Juega 10 partidas de '+n+'.',meta:10,v:(r,P)=>J(P).partidas||0});
  const m={id:id+'_max',g:id,t:'Maestro de '+n,d:desc};
  if(tipo==='mejor')Object.assign(m,{meta,v:(r,P)=>J(P).mejor||0});
  else if(tipo==='vict')Object.assign(m,{meta,v:(r,P)=>J(P).victorias||0});
  else Object.assign(m,{meta:1,v:(r,P)=>{const b=J(P).mejor;return b!=null&&b<=meta?1:0}});
  LOGROS_JUEGO.push(m);
});
function logros(){
  const P=cargar(),r=resumen(P),u=usuarioActual();
  return [...LOGROS,...LOGROS_JUEGO].map(l=>{const val=Math.min(l.meta,Math.floor(l.v(r,P,u)));return{id:l.id,grupo:l.g,titulo:l.t,desc:l.d,meta:l.meta,valor:val,hecho:val>=l.meta,fecha:P.logros[l.id]||null,fmt:l.fmt}});
}
function revisarLogros(){                        // devuelve los logros recién conseguidos
  const P=cargar(),nuevos=[];
  logros().forEach(l=>{if(l.hecho&&!P.logros[l.id]){P.logros[l.id]=Date.now();nuevos.push(l)}});
  if(nuevos.length){guardar(P);nuevos.forEach(l=>encolar('logro',{logro:l.id}))}
  return nuevos;
}

/* ---------- Cola de eventos → servidor ---------- */
let envio=0;
function encolar(tipo,datos,usuario=idActivo(),id=uid('e')){
  const c=ls.get(K.cola,[]),ev={id,tipo,usuario,datos,fecha:Date.now()},i=c.findIndex(e=>e.id===id);
  if(i>=0)c[i]=ev;else c.push(ev);
  ls.set(K.cola,c.slice(-500));
  clearTimeout(envio);envio=setTimeout(sincronizar,1500);
}
async function sincronizar(){
  if(!CONFIG.API||!navigator.onLine)return{ok:false,motivo:'sin API configurada o sin conexión'};
  const c=ls.get(K.cola,[]);if(!c.length)return{ok:true,enviados:0};
  try{
    const h={'Content-Type':'application/json'},t=CONFIG.TOKEN();if(t)h.Authorization='Bearer '+t;
    const r=await fetch(CONFIG.API.replace(/\/$/,'')+'/eventos',{method:'POST',headers:h,body:JSON.stringify({eventos:c})});
    if(!r.ok)throw new Error('HTTP '+r.status);
    const ids=new Set(c.map(e=>e.id));ls.set(K.cola,ls.get(K.cola,[]).filter(e=>!ids.has(e.id)));
    return{ok:true,enviados:c.length};
  }catch(e){return{ok:false,motivo:String(e.message||e)}}
}

/* ---------- Registro de partidas ---------- */
function registrarPartida(juego,{id,puntaje,ganada,segundos}){
  const P=cargar(),def=JUEGOS[juego]||{},j=P.juegos[juego]||(P.juegos[juego]=juegoVacio());
  j.partidas++;if(ganada)j.victorias++;
  if(!def.bajo)j.total+=puntaje;
  if(!def.bajo||ganada)j.mejor=j.mejor==null?puntaje:(def.bajo?Math.min(j.mejor,puntaje):Math.max(j.mejor,puntaje));
  j.ultimo=puntaje;j.ultima=Date.now();
  P.sesiones.unshift({id,juego,puntaje,ganada:!!ganada,seg:segundos,fecha:Date.now()});P.sesiones=P.sesiones.slice(0,100);
  const d=hoy();if(!P.dias.includes(d)){P.dias.push(d);P.dias=P.dias.slice(-90)}
  guardar(P);
}

/* ---------- Seguimiento automático dentro de cada juego ---------- */
let ses=null,visSeg=0,juegoId=null,pill=null,baseline=0;
const parsear=t=>{t=(t||'').trim();const m=t.match(/^(\d+)\s*\/\s*(\d+)$/);return m?{v:+m[1],de:+m[2]}:{v:parseInt(t.replace(/[^\d-]/g,''),10)||0,de:0}};
const nuevaSesion=()=>({id:uid('p'),inicio:Date.now(),max:0,ultimo:0,ganada:false,contado:false,puntosCont:0,vicCont:false,avisoRecord:false,segCont:0});
function reiniciarSesionJuego(){if(juegoId)ses=nuevaSesion()}

function confirmar(){                            // guarda (de forma segura de repetir) lo jugado hasta ahora
  if(!juegoId||!ses)return;
  const def=JUEGOS[juegoId]||{},cuenta=ses.max>baseline||ses.ganada;
  // tiempo visible de esta página
  if(visSeg>0){const P=cargar(),j=P.juegos[juegoId]||(P.juegos[juegoId]=juegoVacio());j.segundos+=visSeg;visSeg=0;guardar(P)}
  if(!cuenta)return;
  const P=cargar(),j=P.juegos[juegoId]||(P.juegos[juegoId]=juegoVacio());
  const puntaje=def.bajo?(ses.ganada?ses.ultimoGanado:ses.ultimo):ses.max;
  const previo=j.mejor;
  if(!ses.contado){j.partidas++;ses.contado=true;const d=hoy();if(!P.dias.includes(d))P.dias.push(d)}
  if(!def.bajo){j.total+=puntaje-ses.puntosCont;ses.puntosCont=puntaje}
  if(ses.ganada&&!ses.vicCont){j.victorias++;ses.vicCont=true}
  if(!def.bajo||ses.ganada)j.mejor=j.mejor==null?puntaje:(def.bajo?Math.min(j.mejor,puntaje):Math.max(j.mejor,puntaje));
  j.ultimo=puntaje;j.ultima=Date.now();
  const reg={id:ses.id,juego:juegoId,puntaje,ganada:ses.ganada,seg:Math.round((Date.now()-ses.inicio)/1000),fecha:Date.now()},i=P.sesiones.findIndex(s=>s.id===ses.id);
  if(i>=0)P.sesiones[i]=reg;else P.sesiones.unshift(reg);
  P.sesiones=P.sesiones.slice(0,100);P.dias=P.dias.slice(-90);
  guardar(P);
  encolar('partida',reg,idActivo(),ses.id);
  // avisos
  if(!ses.avisoRecord&&previo!=null&&previo>0&&(def.bajo?(ses.ganada&&puntaje<previo):puntaje>previo)){ses.avisoRecord=true;aviso('¡Nuevo récord!',puntaje+' '+(def.u||'puntos'))}
  {const nv=revisarLogros();nv.slice(0,2).forEach(l=>aviso('Logro conseguido',l.titulo));if(nv.length>2)aviso('Logros conseguidos','y '+(nv.length-2)+' más. Míralos en el menú.')}
}

function iniciarSeguimiento(){
  const f=location.pathname.split('/').pop().replace(/\.html?$/,'')||'';
  const id=ALIAS[f]||f;
  pill=document.getElementById('scorePill')||document.getElementById('score');
  if(!pill||!JUEGOS[id])return;
  juegoId=id;ses=nuevaSesion();baseline=parsear(pill.textContent).v;
  let deb=0;
  const mirar=()=>{
    const {v,de}=parsear(pill.textContent),def=JUEGOS[juegoId]||{};
    if(v===0&&ses.max>baseline){confirmar();ses=nuevaSesion();baseline=0}          // el juego se reinició
    else if(v>0||ses.max>0){ses.ultimo=v;if(v>ses.max)ses.max=v}
    if(de&&v>=de&&de>0){ses.ganada=true;ses.ultimoGanado=v}                        // sopa de letras completa
    clearTimeout(deb);deb=setTimeout(confirmar,1200);
  };
  new MutationObserver(mirar).observe(pill,{childList:true,characterData:true,subtree:true});
  // victoria detectada por mensajes (memorama, 2048…)
  const GANA=/Completado|Llegaste a 2048|Ganaste/;
  let q=0;
  new MutationObserver(()=>{if(q)return;q=setTimeout(()=>{q=0;
    const t=[...document.querySelectorAll('#ms,#gameInfo,.msg')].map(e=>e.textContent).join(' ');
    if(GANA.test(t)&&!ses.ganada){ses.ganada=true;ses.ultimoGanado=ses.ultimo||ses.max;confirmar()}
  },200)}).observe(document.body,{childList:true,subtree:true,characterData:true});
  setInterval(()=>{if(!document.hidden)visSeg++},1000);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)confirmar()});
  addEventListener('pagehide',confirmar);
  // si el juego guardó puntaje de la visita anterior, no cuenta como partida nueva (baseline)
}

/* ---------- Avisos pequeños dentro de los juegos ---------- */
function aviso(titulo,texto){
  if(!document.body)return;
  if(!document.getElementById('sd-estilo')){
    const s=document.createElement('style');s.id='sd-estilo';
    s.textContent='#sd-av{position:fixed;left:0;right:0;bottom:calc(16px + env(safe-area-inset-bottom,0px));display:flex;flex-direction:column;align-items:center;gap:8px;z-index:300;pointer-events:none}'+
    '.sd-t{background:#fffaf6;color:#4a2626;border:2px solid #f57c73;padding:10px 18px;border-radius:99px;font:700 14px/1.2 system-ui,sans-serif;box-shadow:0 10px 30px rgba(128,79,43,.3);animation:sdIn .35s cubic-bezier(.2,.9,.3,1.2) backwards,sdOut .4s 3.2s forwards}'+
    '.sd-t small{display:block;font-weight:600;color:#8d5d52;margin-top:2px}@keyframes sdIn{from{opacity:0;transform:translateY(20px) scale(.9)}}@keyframes sdOut{to{opacity:0;transform:translateY(10px)}}';
    document.head.appendChild(s);
  }
  let c=document.getElementById('sd-av');if(!c){c=document.createElement('div');c.id='sd-av';c.setAttribute('role','status');document.body.appendChild(c)}
  const t=document.createElement('div');t.className='sd-t';t.innerHTML='<b></b><small></small>';
  t.firstChild.textContent=titulo;t.lastChild.textContent=texto;c.appendChild(t);setTimeout(()=>t.remove(),3700);
}

/* ---------- Exportar ---------- */
function exportar(){
  return JSON.stringify({version:1,exportado:new Date().toISOString(),usuario:usuarioActual(),progreso:cargar(),logros:logros()},null,2);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',iniciarSeguimiento);else iniciarSeguimiento();
addEventListener('online',sincronizar);
setTimeout(sincronizar,2500);

return{CONFIG,JUEGOS,COLORES,AVATARES,cambiarAvatar,usuarioActual,idActivo,registrar,entrar,salir,validar,progreso:cargar,resumen,logros,revisarLogros,sincronizar,exportar,aviso,
  registrarPartida};
})();

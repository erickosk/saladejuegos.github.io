/* =====================================================================
   juegos-creador.js · CREADOR DE PERSONAJES
   Personaliza cuerpo, cara, pelo, ropa, accesorios y fondo de un personaje
   dibujado 100 % en SVG. Modos: libre, retos con consignas y contrarreloj.
   Uso: initCreador(document.getElementById('game-container'))
   ===================================================================== */
const _cu=(()=>{let n=0;return p=>p+(++n)})();
const K_PIEL=['#fde3d0','#f5c9a6','#e6ac80','#c68a5c','#a06a42','#7a4a2c','#5a3522','#ffd1dc','#bfe8b0','#b9d8ff'];
const K_PELO=['#2a2018','#4a2f1d','#7a4a2a','#a9743f','#e8c36a','#f4ecd0','#b8402a','#e8782a','#f07aa8','#4a8fe0','#8a5ad0','#4fbf7a','#cfd5dd'];
const K_OJOS=['#2a2018','#5a3a1e','#3f86d8','#2e9e63','#8a5ad0','#808a96'];
const K_ROPA=['#e8472f','#f58a2b','#ffd54a','#7ed36a','#2e9e63','#3fb8c4','#3f86d8','#4a4fb0','#8a5ad0','#e0509a','#ffffff','#cfd5dd','#6b7280','#2a2f3a','#8a5a30','#f5c9a0'];
const K_NOM={cuerpo:['Delgado','Normal','Robusto'],pelo:['Calvo','Corto','Flequillo','Largo','Coletas','Rizado','Cresta','Moño','Puntas','Bob','Trenza'],top:['Camiseta','Sudadera','Camisa','Vestido','Chaleco','Tirantes','Blazer','Rayas'],bottom:['Pantalón','Shorts','Falda','Ancho','Mallas','Deportivo'],zapato:['Tenis','Botas','Zapatos','Sandalias','Descalzo'],sombrero:['Ninguno','Gorra','Gorro','Copa','Vaquero','Corona','Pirata','Lazo','Diadema'],gafas:['Ninguna','Redondas','Cuadradas','De sol','Corazón','Antifaz'],extra:['Ninguno','Bufanda','Collar','Corbata','Pajarita','Mochila','Capa','Audífonos','Alas'],fondo:['Campo','Atardecer','Noche','Cuarto','Playa','Ciudad','Estudio','Arcoíris'],ojos:['Redondos','Grandes','Felices','Soñolientos','Guiño','Puntos'],cejas:['Normales','Rectas','Enojadas','Tristes','Gruesas','Sin cejas'],nariz:['Punto','Línea','Redonda'],boca:['Sonrisa','Risa','Neutra','Sorpresa','Lengua','Pícara'],detalle:['Ninguno','Rubor','Pecas','Bigote','Barba','Perilla']};
const K_DEF={cuerpo:1,piel:1,ojos:0,cejas:0,boca:0,nariz:0,ojoCol:1,detalle:0,pelo:1,peloCol:2,top:0,topCol:6,top2Col:10,bottom:0,bottomCol:7,zapato:0,zapatoCol:10,sombrero:0,sombreroCol:0,gafas:0,gafasCol:13,extra:0,extraCol:0,fondo:0};
const K_N={cuerpo:3,ojos:6,cejas:6,nariz:3,boca:6,detalle:6,pelo:11,top:8,bottom:6,zapato:5,sombrero:9,gafas:6,extra:9,fondo:8};
function shade(h,a){const n=parseInt(h.slice(1),16);let r=n>>16,g=(n>>8)&255,b=n&255;const t=a<0?0:255,p=Math.abs(a);r=Math.round((t-r)*p+r);g=Math.round((t-g)*p+g);b=Math.round((t-b)*p+b);return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1)}

/* ---------- fondos ---------- */
function kFondo(i,u){
  const base={
   0:`<defs><linearGradient id="${u}f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#58b6ee"/><stop offset="1" stop-color="#d4f0fb"/></linearGradient></defs><rect width="200" height="300" fill="url(#${u}f)"/><circle cx="162" cy="48" r="18" fill="#ffe27a"/><circle cx="162" cy="48" r="28" fill="#ffe27a" fill-opacity=".3"/><ellipse cx="44" cy="52" rx="26" ry="8" fill="#fff"/><ellipse cx="58" cy="46" rx="16" ry="9" fill="#fff"/><path d="M0 238Q60 200 120 232T200 220V300H0z" fill="#7fd05a"/><path d="M0 262Q70 238 140 262T200 252V300H0z" fill="#5fb84a"/>`,
   1:`<defs><linearGradient id="${u}f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a3f9a"/><stop offset=".55" stop-color="#f06a7a"/><stop offset="1" stop-color="#ffc872"/></linearGradient></defs><rect width="200" height="300" fill="url(#${u}f)"/><circle cx="100" cy="206" r="40" fill="#ffe0a0"/><path d="M0 228Q50 204 100 226T200 214V300H0z" fill="#3a2a55"/><path d="M0 262Q70 244 140 262T200 256V300H0z" fill="#2a1f40"/>`,
   2:`<defs><linearGradient id="${u}f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1030"/><stop offset="1" stop-color="#2a3a70"/></linearGradient></defs><rect width="200" height="300" fill="url(#${u}f)"/>${Array.from({length:22},(_,k)=>`<circle cx="${(k*47)%200}" cy="${(k*71)%190+8}" r="${k%3?1:1.8}" fill="#fff" fill-opacity="${.5+(k%3)*.2}"/>`).join('')}<circle cx="160" cy="46" r="20" fill="#f1e7c8"/><circle cx="152" cy="40" r="20" fill="#13204a"/><path d="M0 250H30V222H52V240H76V214H98V238H128V226H152V246H200V300H0z" fill="#101a3d"/>`,
   3:`<rect width="200" height="300" fill="#f7c9d8"/><path d="M20 0V200M60 0V200M100 0V200M140 0V200M180 0V200" stroke="#f0b0c4" stroke-width="10"/><rect y="200" width="200" height="100" fill="#d9a066"/><path d="M0 220H200M0 244H200M0 268H200" stroke="#b87c42" stroke-opacity=".5" stroke-width="2"/><rect x="132" y="40" width="50" height="62" rx="4" fill="#bfe6ff" stroke="#fff" stroke-width="5"/><path d="M157 40V102M132 71H182" stroke="#fff" stroke-width="3"/><rect x="14" y="60" width="44" height="34" rx="3" fill="#fff" stroke="#e0a0b8" stroke-width="3"/><circle cx="36" cy="77" r="9" fill="#ff8fab"/>`,
   4:`<defs><linearGradient id="${u}f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7ed0f5"/><stop offset="1" stop-color="#d9f4ff"/></linearGradient></defs><rect width="200" height="300" fill="url(#${u}f)"/><circle cx="40" cy="44" r="16" fill="#ffe27a"/><rect y="150" width="200" height="60" fill="#2d9ae0"/><path d="M0 164q12 -6 24 0t24 0t24 0t24 0t24 0t24 0t24 0t24 0" stroke="#fff" stroke-opacity=".6" stroke-width="3" fill="none"/><path d="M0 214Q100 196 200 218V300H0z" fill="#f4dca0"/><g transform="translate(160 150)"><path d="M0 70Q-4 30 6 0" stroke="#8a5a30" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M6 0Q-14 -10 -28 6M6 0Q20 -14 36 -2M6 0Q-2 -22 -14 -26M6 0Q10 -22 24 -24" stroke="#3f9a4d" stroke-width="7" fill="none" stroke-linecap="round"/></g>`,
   5:`<defs><linearGradient id="${u}f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fb8e0"/><stop offset="1" stop-color="#e8e0f0"/></linearGradient></defs><rect width="200" height="300" fill="url(#${u}f)"/><g fill="#6f84ad"><rect x="6" y="110" width="34" height="130"/><rect x="46" y="70" width="30" height="170"/><rect x="82" y="130" width="36" height="110"/><rect x="124" y="90" width="32" height="150"/><rect x="160" y="124" width="34" height="116"/></g><g fill="#ffe27a">${Array.from({length:30},(_,k)=>`<rect x="${10+(k%6)*30}" y="${118+Math.floor(k/6)*20}" width="5" height="7" opacity="${(k*7)%3?0:.9}"/>`).join('')}</g><rect y="240" width="200" height="60" fill="#5a6070"/><path d="M0 262H200" stroke="#fff" stroke-opacity=".6" stroke-width="3" stroke-dasharray="16 12"/>`,
   6:`<defs><radialGradient id="${u}f" cx=".5" cy=".4" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#cdd3dd"/></radialGradient></defs><rect width="200" height="300" fill="url(#${u}f)"/><ellipse cx="100" cy="282" rx="86" ry="14" fill="#000" fill-opacity=".12"/>`,
   7:`<defs><linearGradient id="${u}f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd4ff"/><stop offset="1" stop-color="#e9f8ff"/></linearGradient></defs><rect width="200" height="300" fill="url(#${u}f)"/>${['#e8472f','#f58a2b','#ffd54a','#7ed36a','#3f86d8','#8a5ad0'].map((c,k)=>`<path d="M${10+k*9} 290A${90-k*9} ${90-k*9} 0 0 1 ${190-k*9} 290" transform="translate(0 -10)" stroke="${c}" stroke-width="9" fill="none"/>`).join('')}<ellipse cx="34" cy="262" rx="30" ry="14" fill="#fff"/><ellipse cx="168" cy="264" rx="30" ry="14" fill="#fff"/><rect y="270" width="200" height="30" fill="#7fd05a"/>`
  };
  return i<0?`<rect width="200" height="300" fill="#f6eee2"/><ellipse cx="100" cy="282" rx="70" ry="9" fill="#000" fill-opacity=".08"/>`:base[i];
}
/* ---------- partes ---------- */
function kPeloAtras(s,c){
  const d=shade(c,-.28),f=`fill="${c}" stroke="${d}" stroke-width="1.800" stroke-linejoin="round"`;
  switch(s){
   case 3:return `<path d="M60 70C54 118 56 152 66 172C78 160 86 142 86 120L114 120C114 142 122 160 134 172C144 152 146 118 140 70C138 50 120 40 100 40C80 40 62 50 60 70Z" ${f}/>`;
   case 4:return `<path d="M58 70C38 80 30 106 36 130C48 124 58 108 62 90z" ${f}/><path d="M142 70C162 80 170 106 164 130C152 124 142 108 138 90z" ${f}/>`;
   case 5:return `<g ${f}><circle cx="62" cy="70" r="17"/><circle cx="76" cy="50" r="18"/><circle cx="100" cy="42" r="20"/><circle cx="124" cy="50" r="18"/><circle cx="138" cy="70" r="17"/><circle cx="58" cy="94" r="13"/><circle cx="142" cy="94" r="13"/></g>`;
   case 7:return `<g ${f}><circle cx="100" cy="30" r="15"/></g><path d="M92 28Q100 22 108 28" stroke="${d}" stroke-width="1.600" fill="none"/>`;
   case 9:return `<path d="M58 76C52 102 52 122 62 132C76 128 86 118 86 106L114 106C114 118 124 128 138 132C148 122 148 102 142 76C138 52 120 42 100 42C80 42 62 52 58 76z" ${f}/>`;
   case 10:return '';
   default:return '';
  }
}
function kPeloFrente(s,c){
  const d=shade(c,-.28),f=`fill="${c}" stroke="${d}" stroke-width="1.800" stroke-linejoin="round"`,hl=`<path d="M78 56Q90 48 106 50" stroke="#fff" stroke-opacity=".35" stroke-width="3.600" fill="none" stroke-linecap="round"/>`;
  switch(s){
   case 1:return `<path d="M64 80C60 54 78 43 100 43C122 43 140 54 136 80C128 66 116 60 100 60C84 60 72 66 64 80Z" ${f}/>${hl}`;
   case 2:return `<path d="M62 84C58 52 78 42 100 42C122 42 142 52 138 84C134 72 128 66 122 64C112 72 88 72 78 64C72 66 66 72 62 84Z" ${f}/>${hl}`;
   case 3:return `<path d="M62 86C60 54 78 43 100 43C122 43 140 54 138 86C132 66 116 58 98 62C84 66 70 72 62 86Z" ${f}/>${hl}`;
   case 4:return `<path d="M62 84C58 52 78 42 100 42C122 42 142 52 138 84C134 70 124 62 100 62C76 62 66 70 62 84Z" ${f}/><circle cx="52" cy="84" r="5" fill="#e8472f" stroke="#a52018" stroke-width="1.200"/><circle cx="148" cy="84" r="5" fill="#e8472f" stroke="#a52018" stroke-width="1.200"/>${hl}`;
   case 5:return `<g ${f}><circle cx="82" cy="58" r="11"/><circle cx="100" cy="54" r="12"/><circle cx="118" cy="58" r="11"/></g>`;
   case 6:return `<path d="M64 78C62 62 70 50 80 46M136 78C138 62 130 50 120 46" stroke="${d}" stroke-width="2" fill="none"/><path d="M90 52C88 36 94 22 100 12C106 22 112 36 110 52C104 58 96 58 90 52z" ${f}/>`;
   case 7:return `<path d="M64 80C60 54 78 43 100 43C122 43 140 54 136 80C128 66 116 60 100 60C84 60 72 66 64 80Z" ${f}/>${hl}`;
   case 8:return `<path d="M62 82L56 56L70 62L72 38L84 52L92 30L100 50L108 30L116 52L128 38L130 62L144 56L138 82C128 66 116 60 100 60C84 60 72 66 62 82z" ${f}/>`;
   case 9:return `<path d="M64 80C64 56 80 46 100 46C120 46 136 56 136 80C126 71 114 68 100 68C86 68 74 71 64 80z" ${f}/>${hl}`;
   case 10:return `<path d="M64 80C60 54 78 43 100 43C122 43 140 54 136 80C128 66 116 60 100 60C84 60 72 66 64 80Z" ${f}/><g ${f}><ellipse cx="136" cy="104" rx="7" ry="9"/><ellipse cx="134" cy="122" rx="7" ry="9"/><ellipse cx="132" cy="140" rx="6.500" ry="9"/><ellipse cx="130" cy="157" rx="6" ry="8.500"/></g><rect x="125" y="162" width="11" height="6" rx="2" fill="#e8472f"/>${hl}`;
   default:return '';
  }
}
function kOjos(t,ec,piel){
  const ojo=(x,wink)=>{
    let g='';
    switch(t){
     case 0:g=`<circle r="6" fill="#fff" stroke="#4a3a30" stroke-width="1"/><circle r="3.800" fill="${ec}"/><circle r="1.800" fill="#111"/><circle cx="1.300" cy="-1.500" r="1.100" fill="#fff"/>`;break;
     case 1:g=`<ellipse rx="7" ry="9" fill="#fff" stroke="#4a3a30" stroke-width="1"/><ellipse rx="5.400" ry="7.400" fill="${ec}"/><ellipse rx="2.800" ry="4.400" fill="#111"/><circle cx="2" cy="-3" r="1.800" fill="#fff"/><circle cx="-1.800" cy="2.400" r="1" fill="#fff"/>`;break;
     case 2:g=`<path d="M-7 3Q0 -7 7 3" stroke="#3a2a20" stroke-width="2.800" fill="none" stroke-linecap="round"/>`;break;
     case 3:g=`<circle r="5.600" fill="#fff" stroke="#4a3a30" stroke-width="1"/><circle cx="0" cy="1" r="3.200" fill="${ec}"/><circle cx="0" cy="1" r="1.500" fill="#111"/><path d="M-6.500 -1a6.500 6.500 0 0 1 13 0z" fill="${piel}"/><path d="M-7 -1H7" stroke="#3a2a20" stroke-width="2.200" stroke-linecap="round"/>`;break;
     case 4:g=wink?`<path d="M-7 2Q0 -5 7 2" stroke="#3a2a20" stroke-width="2.800" fill="none" stroke-linecap="round"/>`:`<circle r="6" fill="#fff" stroke="#4a3a30" stroke-width="1"/><circle r="3.800" fill="${ec}"/><circle r="1.800" fill="#111"/><circle cx="1.300" cy="-1.500" r="1.100" fill="#fff"/>`;break;
     default:g=`<circle r="3.800" fill="#2a2018"/><circle cx="1.100" cy="-1.200" r="1.100" fill="#fff"/>`;
    }
    return `<g transform="translate(${x} 86)">${g}</g>`;
  };
  return `<g class="sm-blink">${ojo(86,false)}${ojo(114,true)}</g>`;
}
function kCejas(t,c){
  if(t===5)return '';const col=shade(c,-.35),w=t===4?4.800:2.800,P=['M-8 1Q0 -4 8 0','M-8 0H8','M-8 -3L8 2','M-8 2L8 -3','M-8 1Q0 -4 8 0'][t];
  return `<g stroke="${col}" stroke-width="${w}" fill="none" stroke-linecap="round"><path d="${P}" transform="translate(86 72)"/><path d="${P}" transform="translate(114 72) scale(-1 1)"/></g>`;
}
function kNariz(t,piel){const d=shade(piel,-.25);return [`<ellipse cx="100" cy="98" rx="2" ry="1.600" fill="${d}"/>`,`<path d="M99 92Q96 99 100 100" stroke="${d}" stroke-width="2" fill="none" stroke-linecap="round"/>`,`<circle cx="100" cy="97" r="3.200" fill="${d}" fill-opacity=".7"/><circle cx="99" cy="96" r="1" fill="#fff" fill-opacity=".6"/>`][t]}
function kBoca(t){
  return [`<path d="M90 106Q100 117 110 106" stroke="#7a2f2a" stroke-width="2.800" fill="none" stroke-linecap="round"/>`,
   `<path d="M88 105Q100 125 112 105Z" fill="#7a1f1f" stroke="#7a2f2a" stroke-width="1.600" stroke-linejoin="round"/><path d="M89.500 106.500Q100 111 110.500 106.500Q100 113 89.500 106.500Z" fill="#fff"/><ellipse cx="100" cy="117" rx="6" ry="3" fill="#e8707a"/>`,
   `<path d="M92 109H108" stroke="#7a2f2a" stroke-width="2.800" stroke-linecap="round"/>`,
   `<ellipse cx="100" cy="110" rx="5" ry="6.500" fill="#7a1f1f" stroke="#7a2f2a" stroke-width="1.600"/><ellipse cx="100" cy="113" rx="3" ry="2.600" fill="#e8707a"/>`,
   `<path d="M91 106Q100 116 109 106" stroke="#7a2f2a" stroke-width="2.800" fill="none" stroke-linecap="round"/><path d="M98 111Q99 123 106 119Q110 113 105 110Z" fill="#e8707a" stroke="#b83a4a" stroke-width="1.200" stroke-linejoin="round"/>`,
   `<path d="M91 109Q100 112 110 104" stroke="#7a2f2a" stroke-width="2.800" fill="none" stroke-linecap="round"/><path d="M110 104l3 -2" stroke="#7a2f2a" stroke-width="2" stroke-linecap="round"/>`][t];
}
function kDetalle(t,peloC,piel){
  const hc=peloC,d=shade(hc,-.25);
  switch(t){
   case 1:return `<g fill="#ff7a9a" fill-opacity=".45"><ellipse cx="75" cy="98" rx="8" ry="4.600"/><ellipse cx="125" cy="98" rx="8" ry="4.600"/></g>`;
   case 2:return `<g fill="${shade(piel,-.35)}" fill-opacity=".7">${[[78,94],[84,98],[90,94],[110,94],[116,98],[122,94],[82,102],[118,102]].map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="1.500"/>`).join('')}</g>`;
   case 4:return `<path d="M67 92Q64 132 100 138Q136 132 133 92Q128 114 100 116Q72 114 67 92z" fill="${hc}" stroke="${d}" stroke-width="1.600" stroke-linejoin="round"/>`;
   case 5:return `<path d="M91 118Q100 132 109 118Q100 114 91 118z" fill="${hc}" stroke="${d}" stroke-width="1.400" stroke-linejoin="round"/>`;
   default:return '';
  }
}
function kBigote(t,hc){if(t!==3)return '';const d=shade(hc,-.25);return `<path d="M86 104Q93 96 100 101Q107 96 114 104Q107 105 100 104Q93 105 86 104z" fill="${hc}" stroke="${d}" stroke-width="1.400" stroke-linejoin="round"/>`}
function kSombrero(t,c){
  const d=shade(c,-.3),l=shade(c,.3),f=`fill="${c}" stroke="${d}" stroke-width="2" stroke-linejoin="round"`;
  switch(t){
   case 1:return `<path d="M62 72Q62 36 100 36Q138 36 138 72Q100 64 62 72z" ${f}/><path d="M58 72Q100 60 154 78Q146 90 102 82Q72 80 58 72z" fill="${d}" stroke="${shade(c,-.5)}" stroke-width="1.600" stroke-linejoin="round"/><circle cx="100" cy="36" r="3.600" fill="${l}" stroke="${d}"/><path d="M80 52Q100 44 120 52" stroke="#fff" stroke-opacity=".35" stroke-width="3" fill="none" stroke-linecap="round"/>`;
   case 2:return `<path d="M62 74Q58 34 100 32Q142 34 138 74Q100 66 62 74z" ${f}/><path d="M59 70Q100 62 141 70V82Q100 74 59 82z" fill="${l}" stroke="${d}" stroke-width="2" stroke-linejoin="round"/><circle cx="100" cy="26" r="11" fill="${l}" stroke="${d}" stroke-width="2"/><path d="M66 56Q100 46 134 56" stroke="${d}" stroke-opacity=".4" stroke-width="2" fill="none"/>`;
   case 3:return `<ellipse cx="100" cy="62" rx="46" ry="9" ${f}/><rect x="72" y="14" width="56" height="48" rx="4" ${f}/><ellipse cx="100" cy="14" rx="28" ry="6" fill="${l}" stroke="${d}" stroke-width="2"/><rect x="72" y="44" width="56" height="10" fill="${shade(c,-.55)}"/><rect x="92" y="43" width="16" height="12" rx="2" fill="#ffd54a" stroke="#b88700" stroke-width="1.200"/>`;
   case 4:return `<path d="M40 68Q100 86 160 68Q152 82 100 86Q48 82 40 68z" ${f}/><path d="M70 68Q70 32 100 36Q130 32 130 68Q100 74 70 68z" ${f}/><path d="M70 62Q100 70 130 62V68Q100 74 70 68z" fill="${shade(c,-.55)}"/><path d="M82 46Q100 40 118 46" stroke="#fff" stroke-opacity=".3" stroke-width="3" fill="none" stroke-linecap="round"/>`;
   case 5:return `<path d="M66 62L70 34L86 48L100 26L114 48L130 34L134 62z" fill="#ffd54a" stroke="#b88700" stroke-width="2" stroke-linejoin="round"/><rect x="66" y="58" width="68" height="8" rx="2" fill="#f0b400" stroke="#b88700" stroke-width="2"/><circle cx="100" cy="43" r="3.600" fill="#e8472f" stroke="#a52018"/><circle cx="76" cy="50" r="2.400" fill="#3f86d8"/><circle cx="124" cy="50" r="2.400" fill="#2e9e63"/>`;
   case 6:return `<path d="M52 70Q66 28 100 26Q134 28 148 70Q100 58 52 70z" ${f}/><path d="M52 70Q100 58 148 70" stroke="#ffd54a" stroke-width="3.600" fill="none"/><circle cx="100" cy="46" r="8" fill="#fff" stroke="${d}" stroke-width="1.400"/><circle cx="97" cy="45" r="1.600" fill="#222"/><circle cx="103" cy="45" r="1.600" fill="#222"/><path d="M97 50h6" stroke="#222" stroke-width="1.200"/>`;
   case 7:return `<g transform="translate(124 52) rotate(18)"><path d="M0 0L-24 -14V14z" ${f}/><path d="M0 0L24 -14V14z" ${f}/><circle r="6" fill="${l}" stroke="${d}" stroke-width="2"/></g>`;
   case 8:return `<path d="M62 74Q100 54 138 74" stroke="${c}" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M62 74Q100 54 138 74" stroke="${l}" stroke-opacity=".5" stroke-width="3" fill="none" stroke-linecap="round" transform="translate(0 -2)"/><g transform="translate(126 60)"><circle cx="0" cy="-6" r="5" fill="#ff9aa8"/><circle cx="6" cy="0" r="5" fill="#ff9aa8"/><circle cx="0" cy="6" r="5" fill="#ff9aa8"/><circle cx="-6" cy="0" r="5" fill="#ff9aa8"/><circle r="4" fill="#ffd54a"/></g>`;
   default:return '';
  }
}
function kGafas(t,c){
  const d=shade(c,-.3),st=`stroke="${c}" stroke-width="2.800" fill="rgba(210,235,255,.28)"`,pu=`<path d="M64 86L58 84M136 86L142 84" stroke="${c}" stroke-width="2.600" stroke-linecap="round"/>`;
  switch(t){
   case 1:return `<g><circle cx="86" cy="86" r="12" ${st}/><circle cx="114" cy="86" r="12" ${st}/><path d="M98 85Q100 82 102 85" stroke="${c}" stroke-width="2.800" fill="none"/>${pu}<path d="M80 80Q84 78 88 80" stroke="#fff" stroke-opacity=".7" stroke-width="2" fill="none" stroke-linecap="round"/></g>`;
   case 2:return `<g><rect x="73" y="77" width="25" height="18" rx="4" ${st}/><rect x="102" y="77" width="25" height="18" rx="4" ${st}/><path d="M98 84H102" stroke="${c}" stroke-width="3"/>${pu}</g>`;
   case 3:return `<g><path d="M72 78H98V90Q98 98 88 98H82Q72 98 72 88z" fill="#1d2230" stroke="${c}" stroke-width="2.600"/><path d="M102 78H128V88Q128 98 118 98H112Q102 98 102 90z" fill="#1d2230" stroke="${c}" stroke-width="2.600"/><path d="M98 82H102" stroke="${c}" stroke-width="3"/>${pu}<path d="M77 82L84 82M107 82L114 82" stroke="#fff" stroke-opacity=".5" stroke-width="2.400" stroke-linecap="round"/></g>`;
   case 4:return `<g fill="${c}" stroke="${d}" stroke-width="1.800" stroke-linejoin="round"><path d="M86 98C70 88 72 76 80 76C84 76 86 79 86 80C86 79 88 76 92 76C100 76 102 88 86 98z" transform="translate(0 -3)"/><path d="M114 98C98 88 100 76 108 76C112 76 114 79 114 80C114 79 116 76 120 76C128 76 130 88 114 98z" transform="translate(0 -3)"/></g>${pu}<path d="M80 80Q83 78 85 80" stroke="#fff" stroke-opacity=".7" stroke-width="2" fill="none" stroke-linecap="round"/>`;
   case 5:return `<path fill-rule="evenodd" d="M64 80Q100 70 136 80Q132 98 118 98Q108 94 100 98Q92 94 82 98Q68 98 64 80ZM74 86a10 7 0 1 0 20 0a10 7 0 1 0 -20 0ZM106 86a10 7 0 1 0 20 0a10 7 0 1 0 -20 0Z" fill="${c}" stroke="${d}" stroke-width="2" stroke-linejoin="round"/>`;
   default:return '';
  }
}
function kAtras(t,c){
  const d=shade(c,-.3),l=shade(c,.35);
  switch(t){
   case 5:return `<rect x="62" y="132" width="76" height="62" rx="18" fill="${c}" stroke="${d}" stroke-width="2.200"/><rect x="70" y="118" width="60" height="22" rx="10" fill="none" stroke="${d}" stroke-width="3.600"/><rect x="82" y="170" width="36" height="20" rx="6" fill="${l}" stroke="${d}" stroke-width="1.600"/>`;
   case 6:return `<path d="M68 126H132L168 266H32z" fill="${c}" stroke="${d}" stroke-width="2.200" stroke-linejoin="round"/><path d="M100 126V266M76 130L56 266M124 130L144 266" stroke="${d}" stroke-opacity=".35" stroke-width="2"/><path d="M32 266Q100 278 168 266L168 262Q100 272 32 262z" fill="${d}" fill-opacity=".5"/>`;
   case 8:return `<g fill="${c}" stroke="${d}" stroke-width="2" stroke-linejoin="round"><path d="M70 132C40 100 12 96 8 114C12 124 22 126 30 128C20 132 18 142 26 150C34 150 40 148 48 148C42 158 48 168 58 168C70 164 74 152 76 142z"/><path d="M130 132C160 100 188 96 192 114C188 124 178 126 170 128C180 132 182 142 174 150C166 150 160 148 152 148C158 158 152 168 142 168C130 164 126 152 124 142z"/></g><g stroke="${d}" stroke-opacity=".4" stroke-width="1.600" fill="none"><path d="M70 130C48 112 28 108 16 114M70 134C50 126 34 130 28 134M74 140C60 140 50 146 46 150"/><path d="M130 130C152 112 172 108 184 114M130 134C150 126 166 130 172 134M126 140C140 140 150 146 154 150"/></g>`;
   default:return '';
  }
}
function kFrente(t,c){
  const d=shade(c,-.3),l=shade(c,.3);
  switch(t){
   case 1:return `<path d="M72 124Q100 144 128 124L134 138Q100 160 66 138z" fill="${c}" stroke="${d}" stroke-width="2.200" stroke-linejoin="round"/><path d="M112 140L126 140L130 190L112 182z" fill="${c}" stroke="${d}" stroke-width="2.200" stroke-linejoin="round"/><path d="M118 148L120 176" stroke="${d}" stroke-width="1.600" stroke-dasharray="3 3" opacity=".6"/>`;
   case 2:return `<path d="M82 126Q100 152 118 126" stroke="${c}" stroke-width="2.600" fill="none" stroke-linecap="round"/><circle cx="100" cy="148" r="6" fill="${l}" stroke="${d}" stroke-width="2"/><circle cx="98.500" cy="146.500" r="1.800" fill="#fff" fill-opacity=".8"/>`;
   case 3:return `<path d="M95 130H105L103 138H97z" fill="${c}" stroke="${d}" stroke-width="1.600" stroke-linejoin="round"/><path d="M97 138H103L108 180L100 190L92 180z" fill="${c}" stroke="${d}" stroke-width="1.800" stroke-linejoin="round"/><path d="M97 148L103 156" stroke="${l}" stroke-width="2" stroke-linecap="round" opacity=".6"/>`;
   case 4:return `<g transform="translate(100 132)"><path d="M0 0L-16 -9V9z" fill="${c}" stroke="${d}" stroke-width="2" stroke-linejoin="round"/><path d="M0 0L16 -9V9z" fill="${c}" stroke="${d}" stroke-width="2" stroke-linejoin="round"/><rect x="-4.500" y="-5" width="9" height="10" rx="3" fill="${l}" stroke="${d}" stroke-width="1.800"/></g>`;
   case 5:return `<path d="M84 132V190M116 132V190" stroke="${d}" stroke-width="7" stroke-linecap="round"/><path d="M84 132V190M116 132V190" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`;
   default:return '';
  }
}
/* ---------- cuerpo y ropa ---------- */
function kCuerpo(S,u){
  const piel=K_PIEL[S.piel],pd=shade(piel,-.2),ro=K_ROPA,top=S.top,tc=ro[S.topCol],t2=ro[S.top2Col],td=shade(tc,-.28),bc=ro[S.bottomCol],bd=shade(bc,-.28),zc=ro[S.zapatoCol],zd=shade(zc,-.3);
  const larga=[1,2,4,6].includes(top),vest=top===3;
  /* piernas (piel) */
  let g=`<rect x="79" y="190" width="20" height="76" rx="9" fill="${piel}" stroke="${pd}" stroke-width="1.600"/><rect x="101" y="190" width="20" height="76" rx="9" fill="${piel}" stroke="${pd}" stroke-width="1.600"/>`;
  /* calzado */
  const pie=(x,f)=>{
    switch(S.zapato){
     case 0:return `<path d="M${x-3} 270Q${x-3} 258 ${x+9} 258H${x+22}Q${x+30} 262 ${x+30} 274H${x-3}z" fill="${zc}" stroke="${zd}" stroke-width="2" stroke-linejoin="round"/><rect x="${x-3}" y="271" width="33" height="6" rx="3" fill="#fff" stroke="${zd}" stroke-width="1.400"/><path d="M${x+8} 262H${x+20}M${x+10} 266H${x+22}" stroke="#fff" stroke-opacity=".7" stroke-width="1.400" stroke-linecap="round"/>`;
     case 1:return `<path d="M${x} 244H${x+20}V266Q${x+30} 268 ${x+30} 276H${x-3}V252z" fill="${zc}" stroke="${zd}" stroke-width="2" stroke-linejoin="round"/><rect x="${x-3}" y="272" width="33" height="6" rx="3" fill="${zd}"/><path d="M${x} 252H${x+20}" stroke="${zd}" stroke-width="1.600" opacity=".6"/>`;
     case 2:return `<path d="M${x-2} 272Q${x-2} 260 ${x+10} 260H${x+22}Q${x+30} 262 ${x+30} 274H${x-2}z" fill="${zc}" stroke="${zd}" stroke-width="2" stroke-linejoin="round"/><path d="M${x+4} 262Q${x+12} 266 ${x+20} 262" stroke="#fff" stroke-opacity=".5" stroke-width="2" fill="none" stroke-linecap="round"/><rect x="${x-2}" y="272" width="32" height="4" rx="2" fill="${zd}"/>`;
     case 3:return `<path d="M${x-2} 276H${x+30}" stroke="${zd}" stroke-width="4" stroke-linecap="round"/><path d="M${x} 262Q${x+14} 252 ${x+26} 266" stroke="${zc}" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M${x+4} 262L${x+10} 274M${x+22} 264L${x+20} 274" stroke="${zc}" stroke-width="3" stroke-linecap="round"/><ellipse cx="${x+13}" cy="274" rx="15" ry="4" fill="${piel}" stroke="${pd}" stroke-width="1.400"/>`;
     default:return `<ellipse cx="${x+13}" cy="272" rx="15" ry="7" fill="${piel}" stroke="${pd}" stroke-width="1.600"/><path d="M${x+6} 270V274M${x+13} 270V274M${x+20} 270V274" stroke="${pd}" stroke-width="1.200"/>`;
    }
  };
  g+=`<g transform="translate(89.500 0) scale(-1 1) translate(-89.500 0)">${pie(76)}</g>`+pie(98);
  /* parte de abajo */
  let b='';
  switch(S.bottom){
   case 0:b=`<path d="M76 190H124L123 268H103V214H97V268H77z" fill="${bc}" stroke="${bd}" stroke-width="2" stroke-linejoin="round"/><path d="M100 196V214" stroke="${bd}" stroke-width="1.600"/><rect x="76" y="190" width="48" height="7" fill="${bd}" fill-opacity=".45"/><rect x="95" y="190" width="10" height="7" rx="1.500" fill="#ffd54a" stroke="#b88700" stroke-width="1"/>`;break;
   case 1:b=`<path d="M76 190H124L126 232H102V214H98V232H74z" fill="${bc}" stroke="${bd}" stroke-width="2" stroke-linejoin="round"/><path d="M100 196V214" stroke="${bd}" stroke-width="1.600"/><rect x="76" y="190" width="48" height="6" fill="${bd}" fill-opacity=".45"/>`;break;
   case 2:b=`<path d="M72 190H128L142 240H58z" fill="${bc}" stroke="${bd}" stroke-width="2" stroke-linejoin="round"/><path d="M84 192L78 240M100 192V240M116 192L122 240" stroke="${bd}" stroke-opacity=".5" stroke-width="1.800"/><rect x="72" y="190" width="56" height="6" fill="${bd}" fill-opacity=".5"/>`;break;
   case 3:b=`<path d="M72 190H100V268H64z" fill="${bc}" stroke="${bd}" stroke-width="2" stroke-linejoin="round"/><path d="M100 190H128L136 268H100z" fill="${bc}" stroke="${bd}" stroke-width="2" stroke-linejoin="round"/><rect x="72" y="190" width="56" height="7" fill="${bd}" fill-opacity=".45"/><path d="M80 210Q82 230 78 252M120 210Q118 230 122 252" stroke="${bd}" stroke-opacity=".4" stroke-width="2" fill="none"/>`;break;
   case 4:b=`<path d="M78 190H122L121 266H103V210H97V266H79z" fill="${bc}" stroke="${bd}" stroke-width="2" stroke-linejoin="round"/><path d="M84 200L83 262M116 200L117 262" stroke="#fff" stroke-opacity=".45" stroke-width="2.400" stroke-linecap="round"/>`;break;
   default:b=`<path d="M76 190H124L125 234H102V214H98V234H75z" fill="${bc}" stroke="${bd}" stroke-width="2" stroke-linejoin="round"/><path d="M78 196L77 232M122 196L123 232" stroke="#fff" stroke-width="3" stroke-linecap="round"/><rect x="76" y="190" width="48" height="6" fill="${bd}" fill-opacity=".45"/>`;
  }
  if(vest)b='';
  g+=b;
  /* torso base (piel) y cuello */
  g+=`<rect x="90" y="108" width="20" height="24" rx="6" fill="${pd}"/><path d="M70 128Q100 138 130 128L134 196H66z" fill="${piel}" stroke="${pd}" stroke-width="1.600" stroke-linejoin="round"/>`;
  /* brazos de piel + manos */
  const brazo=x=>`<path d="M${x>100?132:68} 132Q${x>100?148:52} 160 ${x>100?144:56} 192" stroke="${pd}" stroke-width="17" fill="none" stroke-linecap="round"/><path d="M${x>100?132:68} 132Q${x>100?148:52} 160 ${x>100?144:56} 192" stroke="${piel}" stroke-width="14" fill="none" stroke-linecap="round"/><circle cx="${x>100?144:56}" cy="196" r="8.500" fill="${piel}" stroke="${pd}" stroke-width="1.600"/>`;
  g+=brazo(60)+brazo(140);
  /* ropa superior */
  const manga=(x,len,col,dk)=>{const sx=x>100?132:68,ex=x>100?(len>170?143.500:150):(len>170?56.500:50),ey=len;return `<path d="M${sx} 132Q${x>100?148:52} ${len*.84} ${ex} ${ey}" stroke="${dk}" stroke-width="18" fill="none" stroke-linecap="round"/><path d="M${sx} 132Q${x>100?148:52} ${len*.84} ${ex} ${ey}" stroke="${col}" stroke-width="15" fill="none" stroke-linecap="round"/>`};
  let r='';
  const idc=u+'t';
  switch(top){
   case 0:r=manga(60,158,tc,td)+manga(140,158,tc,td)+`<path d="M70 128Q100 142 130 128L135 198H65z" fill="${tc}" stroke="${td}" stroke-width="2" stroke-linejoin="round"/><path d="M88 128Q100 140 112 128" stroke="${td}" stroke-width="3" fill="none"/>`;break;
   case 1:r=manga(60,188,tc,td)+manga(140,188,tc,td)+`<path d="M66 128Q100 142 134 128L138 202H62z" fill="${tc}" stroke="${td}" stroke-width="2" stroke-linejoin="round"/><path d="M76 124Q100 108 124 124L120 136Q100 128 80 136z" fill="${shade(tc,-.12)}" stroke="${td}" stroke-width="2" stroke-linejoin="round"/><path d="M82 168H118L122 192H78z" fill="${shade(tc,-.1)}" stroke="${td}" stroke-width="1.600" stroke-linejoin="round"/><path d="M92 136V152M108 136V152" stroke="#fff" stroke-width="2" stroke-linecap="round"/><rect x="62" y="196" width="76" height="6" rx="3" fill="${td}" fill-opacity=".6"/>`;break;
   case 2:r=manga(60,188,tc,td)+manga(140,188,tc,td)+`<path d="M68 128Q100 140 132 128L135 198H65z" fill="${tc}" stroke="${td}" stroke-width="2" stroke-linejoin="round"/><path d="M100 136V198" stroke="${td}" stroke-width="1.600"/><g fill="${t2}" stroke="${td}" stroke-width="1"><circle cx="100" cy="150" r="1.800"/><circle cx="100" cy="164" r="1.800"/><circle cx="100" cy="178" r="1.800"/></g><path d="M86 126L100 144L114 126L120 134L100 152L80 134z" fill="${t2}" stroke="${td}" stroke-width="1.800" stroke-linejoin="round"/><rect x="76" y="156" width="14" height="14" rx="2" fill="none" stroke="${td}" stroke-opacity=".6" stroke-width="1.400"/>`;break;
   case 3:r=manga(60,142,tc,td)+manga(140,142,tc,td)+`<path d="M70 128Q100 142 130 128L134 190L152 250H48L66 190z" fill="${tc}" stroke="${td}" stroke-width="2" stroke-linejoin="round"/><path d="M66 178Q100 190 134 178" stroke="${t2}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M80 196L66 248M100 196V250M120 196L134 248" stroke="${td}" stroke-opacity=".3" stroke-width="2"/><circle cx="100" cy="184" r="4" fill="${t2}" stroke="${td}"/>`;break;
   case 4:r=manga(60,188,t2,shade(t2,-.28))+manga(140,188,t2,shade(t2,-.28))+`<path d="M70 128Q100 142 130 128L135 198H65z" fill="${t2}" stroke="${shade(t2,-.28)}" stroke-width="2" stroke-linejoin="round"/><path d="M70 126L98 150L90 198H66L68 140z" fill="${tc}" stroke="${td}" stroke-width="2" stroke-linejoin="round"/><path d="M130 126L102 150L110 198H134L132 140z" fill="${tc}" stroke="${td}" stroke-width="2" stroke-linejoin="round"/><g fill="${t2}" stroke="${td}"><circle cx="92" cy="170" r="1.800"/><circle cx="108" cy="170" r="1.800"/></g>`;break;
   case 5:r=`<path d="M78 130Q100 142 122 130L128 198H72z" fill="${tc}" stroke="${td}" stroke-width="2" stroke-linejoin="round"/><path d="M82 128V146Q100 156 118 146V128" stroke="${td}" stroke-width="2" fill="none"/><rect x="72" y="188" width="56" height="10" fill="${td}" fill-opacity=".35"/>`;break;
   case 6:r=manga(60,188,tc,td)+manga(140,188,tc,td)+`<path d="M66 128Q100 142 134 128L138 204H62z" fill="${tc}" stroke="${td}" stroke-width="2" stroke-linejoin="round"/><path d="M84 128L100 160L116 128L108 126L100 140L92 126z" fill="${t2}" stroke="${td}" stroke-width="1.600" stroke-linejoin="round"/><path d="M100 160V204" stroke="${td}" stroke-width="2"/><path d="M68 128L88 150L80 160L64 140z" fill="${shade(tc,.12)}" stroke="${td}" stroke-width="1.800" stroke-linejoin="round"/><path d="M132 128L112 150L120 160L136 140z" fill="${shade(tc,.12)}" stroke="${td}" stroke-width="1.800" stroke-linejoin="round"/><g fill="${t2}" stroke="${td}"><circle cx="105" cy="176" r="2.400"/><circle cx="105" cy="192" r="2.400"/></g><rect x="74" y="172" width="14" height="4" rx="2" fill="${td}" fill-opacity=".5"/>`;break;
   default:r=manga(60,158,tc,td)+manga(140,158,tc,td)+`<clipPath id="${idc}"><path d="M70 128Q100 142 130 128L135 198H65z"/></clipPath><path d="M70 128Q100 142 130 128L135 198H65z" fill="${tc}"/><g clip-path="url(#${idc})">${Array.from({length:8},(_,k)=>`<rect x="60" y="${132+k*10}" width="80" height="5" fill="${t2}"/>`).join('')}</g><path d="M70 128Q100 142 130 128L135 198H65z" fill="none" stroke="${td}" stroke-width="2" stroke-linejoin="round"/><path d="M88 128Q100 140 112 128" stroke="${td}" stroke-width="3" fill="none"/>`;
  }
  g+=r;
  const esc=[.9,1,1.12][S.cuerpo];
  return `<g transform="translate(100 0) scale(${esc} 1) translate(-100 0)">${g}</g>`;
}
/* ---------- personaje completo ---------- */
function avatarSVG(S,{vb='0 0 200 300',anim=true}={}){
  const u=_cu('av'),piel=K_PIEL[S.piel],pd=shade(piel,-.2),pelo=K_PELO[S.peloCol],ro=K_ROPA;
  const fr=S.extra===5?`<path d="M82 132V188M118 132V188" stroke="${shade(ro[S.extraCol],-.3)}" stroke-width="7" stroke-linecap="round"/><path d="M82 132V188M118 132V188" stroke="${ro[S.extraCol]}" stroke-width="4" stroke-linecap="round"/>`:'';
  const capaFrente=S.extra===6?`<path d="M72 126Q100 140 128 126" stroke="${shade(ro[S.extraCol],-.3)}" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="84" cy="132" r="5" fill="#ffd54a" stroke="#b88700" stroke-width="1.600"/><circle cx="116" cy="132" r="5" fill="#ffd54a" stroke="#b88700" stroke-width="1.600"/><path d="M84 132Q100 144 116 132" stroke="#ffd54a" stroke-width="2.400" fill="none"/>`:'';
  const cabeza=`<g>
    <ellipse cx="66" cy="90" rx="7" ry="9" fill="${piel}" stroke="${pd}" stroke-width="1.600"/><ellipse cx="134" cy="90" rx="7" ry="9" fill="${piel}" stroke="${pd}" stroke-width="1.600"/><ellipse cx="66" cy="91" rx="3.400" ry="5" fill="${pd}" fill-opacity=".45"/><ellipse cx="134" cy="91" rx="3.400" ry="5" fill="${pd}" fill-opacity=".45"/>
    <ellipse cx="100" cy="84" rx="35" ry="38" fill="${piel}" stroke="${pd}" stroke-width="2"/>
    <ellipse cx="86" cy="64" rx="14" ry="7" fill="#fff" fill-opacity=".14"/>
    ${kDetalle(S.detalle,pelo,piel)}${kNariz(S.nariz,piel)}${kOjos(S.ojos,K_OJOS[S.ojoCol],piel)}${kCejas(S.cejas,pelo)}${kBoca(S.boca)}${kBigote(S.detalle,pelo)}
    ${kPeloFrente(S.pelo,pelo)}${kSombrero(S.sombrero,ro[S.sombreroCol])}${kGafas(S.gafas,ro[S.gafasCol])}</g>`;
  const fx=S.extra===7?`<path d="M62 92Q62 42 100 42Q138 42 138 92" stroke="${shade(ro[S.extraCol],-.35)}" stroke-width="6.500" fill="none" stroke-linecap="round"/><path d="M62 92Q62 42 100 42Q138 42 138 92" stroke="${ro[S.extraCol]}" stroke-width="3.600" fill="none" stroke-linecap="round"/><rect x="55" y="84" width="13" height="22" rx="6" fill="${ro[S.extraCol]}" stroke="${shade(ro[S.extraCol],-.35)}" stroke-width="2.200"/><rect x="132" y="84" width="13" height="22" rx="6" fill="${ro[S.extraCol]}" stroke="${shade(ro[S.extraCol],-.35)}" stroke-width="2.200"/>`:'';
  const ext=[1,2,3,4].includes(S.extra)?kFrente(S.extra,ro[S.extraCol]):'';
  const body=kCuerpo(S,u);
  const sombra=S.fondo===6||S.fondo===-1?'':`<ellipse cx="100" cy="280" rx="48" ry="7" fill="#000" fill-opacity=".2"/>`;
  const bob=anim?`<animateTransform attributeName="transform" type="translate" values="0 0;0 -2;0 0" dur="3s" repeatCount="indefinite"/>`:'';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" role="img" aria-label="Personaje">${kFondo(S.fondo,u)}${sombra}<g>${bob}${kAtras(S.extra,ro[S.extraCol])}<g>${kPeloAtras(S.pelo,pelo)}</g>${body}${S.extra===6?capaFrente:''}${fr}${ext}${cabeza}${fx}</g></svg>`;
}

/* ---------- retos ---------- */
const K_RETOS=[
 {n:'Pirata del mar',req:[['Sombrero pirata',S=>S.sombrero===6],['Antifaz o gafas de sol',S=>[3,5].includes(S.gafas)],['Barba o bigote',S=>[3,4].includes(S.detalle)]]},
 {n:'Superhéroe',req:[['Capa',S=>S.extra===6],['Antifaz',S=>S.gafas===5],['Camiseta roja o azul',S=>S.top===0&&[0,6].includes(S.topCol)]]},
 {n:'Realeza',req:[['Corona',S=>S.sombrero===5],['Vestido o blazer',S=>[3,6].includes(S.top)],['Collar',S=>S.extra===2]]},
 {n:'Deportista',req:[['Gorra',S=>S.sombrero===1],['Camiseta de rayas',S=>S.top===7],['Shorts o pantalón deportivo',S=>[1,5].includes(S.bottom)],['Tenis',S=>S.zapato===0]]},
 {n:'Vaquero',req:[['Sombrero vaquero',S=>S.sombrero===4],['Camisa',S=>S.top===2],['Botas',S=>S.zapato===1],['Bigote',S=>S.detalle===3]]},
 {n:'Estudiante',req:[['Mochila',S=>S.extra===5],['Gafas redondas',S=>S.gafas===1],['Sudadera',S=>S.top===1]]},
 {n:'Hada del bosque',req:[['Alas',S=>S.extra===8],['Pelo de color fantasía',S=>S.peloCol>=8&&S.peloCol<=11],['Vestido',S=>S.top===3]]},
 {n:'Músico',req:[['Audífonos',S=>S.extra===7],['Gafas de sol',S=>S.gafas===3],['Blazer',S=>S.top===6]]},
 {n:'Día de invierno',req:[['Gorro',S=>S.sombrero===2],['Bufanda',S=>S.extra===1],['Sudadera',S=>S.top===1],['Botas',S=>S.zapato===1]]},
 {n:'Elegante',req:[['Sombrero de copa',S=>S.sombrero===3],['Corbata o pajarita',S=>[3,4].includes(S.extra)],['Blazer o chaleco',S=>[4,6].includes(S.top)],['Zapatos',S=>S.zapato===2]]}
];
const K_VB={cabeza:'42 28 116 116',torso:'42 102 116 116',piernas:'54 184 92 104',pies:'54 238 92 50',extra:'16 78 168 196',cuerpo:'26 18 148 270',fondo:'0 0 200 300'};
const K_TABS=[
 {id:'pelo',n:'Pelo',g:[{k:'pelo',vb:'cabeza'}],c:[{k:'peloCol',pal:K_PELO,l:'Color de pelo'}]},
 {id:'cara',n:'Cara',g:[{k:'ojos',vb:'cabeza',l:'Ojos'},{k:'cejas',vb:'cabeza',l:'Cejas'},{k:'nariz',vb:'cabeza',l:'Nariz'},{k:'boca',vb:'cabeza',l:'Boca'},{k:'detalle',vb:'cabeza',l:'Detalles'}],c:[{k:'ojoCol',pal:K_OJOS,l:'Color de ojos'}]},
 {id:'cuerpo',n:'Cuerpo',g:[{k:'cuerpo',vb:'cuerpo'}],c:[{k:'piel',pal:K_PIEL,l:'Tono de piel'}]},
 {id:'top',n:'Camiseta',g:[{k:'top',vb:'torso'}],c:[{k:'topCol',pal:K_ROPA,l:'Color principal'},{k:'top2Col',pal:K_ROPA,l:'Color secundario'}]},
 {id:'bottom',n:'Pantalón',g:[{k:'bottom',vb:'piernas'}],c:[{k:'bottomCol',pal:K_ROPA,l:'Color'}]},
 {id:'zapato',n:'Zapatos',g:[{k:'zapato',vb:'pies'}],c:[{k:'zapatoCol',pal:K_ROPA,l:'Color'}]},
 {id:'sombrero',n:'Sombrero',g:[{k:'sombrero',vb:'cabeza'}],c:[{k:'sombreroCol',pal:K_ROPA,l:'Color'}]},
 {id:'gafas',n:'Gafas',g:[{k:'gafas',vb:'cabeza'}],c:[{k:'gafasCol',pal:K_ROPA,l:'Color'}]},
 {id:'extra',n:'Extras',g:[{k:'extra',vb:'extra'}],c:[{k:'extraCol',pal:K_ROPA,l:'Color'}]},
 {id:'fondo',n:'Fondo',g:[{k:'fondo',vb:'fondo'}],c:[]}
];
const K_ETQ={pelo:'Estilo de pelo',cuerpo:'Tipo de cuerpo',top:'Parte de arriba',bottom:'Parte de abajo',zapato:'Calzado',sombrero:'Sombrero',gafas:'Gafas',extra:'Extra',fondo:'Fondo'};

function initCreador(cont){
  return GS.crear(cont,{
    id:'creador',
    intro:'Personaliza a tu personaje: cuerpo, cara, pelo, ropa, zapatos, sombreros, gafas, extras y fondo, con muchos colores. En Libre creas sin límite y terminas con «¡Listo!». En Retos te piden personajes concretos (un pirata, una hada…) y debes cumplir todos los requisitos antes de entregarlos. En Contrarreloj tienes 50 segundos por consigna. Puedes guardar tu personaje y descargarlo como imagen.',
    niveles:[['1','Libre','Crea sin límites y toca «¡Listo!» cuando termines.'],['2','Retos','3 consignas: cumple todos los requisitos de cada personaje.'],['3','Contrarreloj','4 consignas de 50 s cada una; debes lograr al menos 3.']],
    iniciar(api,nivel){
      const S={...K_DEF},ST={tab:'pelo',fin:false,puntos:0,tm:[],ret:null,ri:0,aciertos:0,intentos:0,t:0,seg:-1};
      const NR={1:0,2:3,3:4}[nivel],RT=50;
      const retos=NR?GS.shuffle(K_RETOS.slice()).slice(0,NR):[];
      api.area.innerHTML='';
      const root=document.createElement('div');root.className='sm-cr';root.style.setProperty('--acc','#e0509a');
      root.innerHTML=`<div class="sm-reto" id="crReto" style="display:none"></div><div class="sm-cr-top"><div class="sm-stage" id="crStage"></div><div><div class="sm-tabs" id="crTabs"></div><div id="crOpts"></div></div></div><div class="sm-row" id="crAcc"></div>`;
      api.area.appendChild(root);
      const $=s=>root.querySelector(s);
      /* ---------- dibujo ---------- */
      const pintaStage=()=>{$('#crStage').innerHTML=avatarSVG(S)};
      function miniatura(k,i,vbk){const o={...S,[k]:i,fondo:k==='fondo'?i:-1};if(k!=='sombrero'&&['ojos','cejas','nariz','boca','detalle','pelo','gafas'].includes(k))o.sombrero=0;if(['ojos','cejas','nariz','boca','detalle'].includes(k))o.gafas=0;return avatarSVG(o,{vb:K_VB[vbk],anim:false})}
      function pintaTabs(){$('#crTabs').innerHTML=K_TABS.map(t=>`<button class="sm-tab ${ST.tab===t.id?'on':''}" data-tab="${t.id}">${t.n}</button>`).join('')}
      function pintaOpts(){
        const t=K_TABS.find(x=>x.id===ST.tab);let h='';
        t.g.forEach(g=>{
          h+=`<div class="sm-lbl">${g.l||K_ETQ[g.k]} · <b>${K_NOM[g.k][S[g.k]]}</b></div><div class="sm-opts">${Array.from({length:K_N[g.k]},(_,i)=>`<button class="sm-o ${S[g.k]===i?'on':''}" data-k="${g.k}" data-i="${i}" title="${K_NOM[g.k][i]}" aria-label="${K_NOM[g.k][i]}">${miniatura(g.k,i,g.vb)}</button>`).join('')}</div>`;
        });
        t.c.forEach(c=>{h+=`<div class="sm-lbl">${c.l}</div><div class="sm-sw">${c.pal.map((col,i)=>`<button data-ck="${c.k}" data-ci="${i}" class="${S[c.k]===i?'on':''}" style="background:${col}" aria-label="Color ${i+1}"></button>`).join('')}</div>`});
        $('#crOpts').innerHTML=h;
      }
      function cambios(){return Object.keys(K_DEF).filter(k=>S[k]!==K_DEF[k]).length}
      function checks(){const r=ST.ret;return r?r.req.map(([t,f])=>({t,ok:!!f(S)})):[]}
      function pintaReto(){
        const box=$('#crReto');if(!NR){box.style.display='none';return}
        if(!ST.ret)return;box.style.display='block';const r=ST.ret,cs=checks();
        box.innerHTML=`<b>Consigna ${ST.ri+1} de ${NR}: ${r.n}</b>${+nivel===3?` <span class="sm-pill">${Math.max(0,Math.ceil(RT-ST.t))} s</span>`:''}<ul>${cs.map(c=>`<li class="${c.ok?'ok':''}"><i>${c.ok?'✓':''}</i>${c.t}</li>`).join('')}</ul>`;
      }
      function hud(){
        if(!NR)api.estado(`<span>Cambios ${cambios()} / ${Object.keys(K_DEF).length}</span>`);
        else api.estado(`<span>Consigna ${Math.min(ST.ri+1,NR)} / ${NR}</span><span style="margin:0 10px">Logradas ${ST.aciertos}</span><span>Puntos ${ST.puntos}</span>`);
      }
      function refresca(){pintaStage();pintaOpts();pintaReto();hud();if(!NR)api.puntos(cambios()*25)}
      /* ---------- acciones ---------- */
      function aleatorio(){
        for(const k in K_N)S[k]=GS.rnd(0,K_N[k]-1);
        S.fondo=GS.rnd(0,7);S.piel=GS.rnd(0,K_PIEL.length-1);S.peloCol=GS.rnd(0,K_PELO.length-1);S.ojoCol=GS.rnd(0,K_OJOS.length-1);
        ['topCol','top2Col','bottomCol','zapatoCol','sombreroCol','gafasCol','extraCol'].forEach(k=>S[k]=GS.rnd(0,15));
        if(Math.random()<.5)S.sombrero=0;if(Math.random()<.5)S.gafas=0;if(Math.random()<.5)S.extra=0;
        refresca();GS.tono(520,.08,'triangle',.05,900);
      }
      const guarda=()=>{try{localStorage.setItem('sala_creador',JSON.stringify(S));api.msg('Personaje guardado');GS.tono(700,.08,'triangle',.05,1000)}catch(e){api.msg('No se pudo guardar')}};
      function carga(){try{const d=JSON.parse(localStorage.getItem('sala_creador')||'null');if(!d){api.msg('Aún no hay un personaje guardado');return}for(const k in K_DEF)if(typeof d[k]==='number')S[k]=Math.max(0,Math.min(d[k],k in K_N?K_N[k]-1:15));if(S.piel>=K_PIEL.length)S.piel=1;if(S.peloCol>=K_PELO.length)S.peloCol=2;if(S.ojoCol>=K_OJOS.length)S.ojoCol=1;refresca();api.msg('Personaje cargado')}catch(e){api.msg('No se pudo cargar')}}
      function descarga(){
        try{
          const svg=avatarSVG(S,{anim:false}).replace('<svg ','<svg width="400" height="600" '),blob=new Blob([svg],{type:'image/svg+xml;charset=utf-8'}),url=URL.createObjectURL(blob),img=new Image();
          img.onload=()=>{const c=document.createElement('canvas');c.width=600;c.height=900;c.getContext('2d').drawImage(img,0,0,600,900);URL.revokeObjectURL(url);c.toBlob(b=>{const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='mi-personaje.png';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000)},'image/png')};
          img.onerror=()=>{URL.revokeObjectURL(url);api.msg('No se pudo crear la imagen')};img.src=url;api.msg('Descargando imagen…');
        }catch(e){api.msg('No se pudo descargar')}
      }
      function terminaLibre(){
        if(ST.fin)return;ST.fin=true;const n=cambios(),pts=n*25+(S.sombrero||S.gafas||S.extra?50:0);api.puntos(pts);
        api.fin({tipo:'gana',titulo:'¡Personaje creado!',sub:`Personalizaste ${n} características`,puntos:pts,det:'Puedes guardarlo antes de salir'});
      }
      function nuevaConsigna(){
        if(ST.ri>=NR)return final();
        ST.bloq=false;ST.ret=retos[ST.ri];ST.t=0;ST.intentos=0;ST.seg=-1;
        Object.assign(S,K_DEF);S.fondo=ST.ri%8;refresca();api.msg(`Consigna: ${ST.ret.n}`);
      }
      function entrega(){
        if(ST.fin||!NR||ST.bloq||!ST.ret)return;const cs=checks(),falta=cs.filter(c=>!c.ok);
        if(falta.length){ST.intentos++;api.sonar.error&&api.sonar.error();api.msg('Te falta: '+falta.map(f=>f.t).join(', '));const b=$('#crReto');b.classList.remove('sm-bad');void b.offsetWidth;b.classList.add('sm-bad');return}
        const pts=cs.length*100+Math.max(0,100-ST.intentos*30);ST.bloq=true;ST.puntos+=pts;ST.aciertos++;api.puntos(ST.puntos);GS.sonar.gana&&GS.sonar.gana();
        api.msg(`¡${ST.ret.n} logrado! +${pts}`);ST.ri++;
        ST.tm.push(setTimeout(()=>{if(!ST.fin)nuevaConsigna()},900));
      }
      function final(){
        if(ST.fin)return;ST.fin=true;lp&&lp.parar();
        const gano=+nivel===2?true:ST.aciertos>=3;
        if(gano)api.fin({tipo:'gana',titulo:'¡Gran diseñador!',sub:`${ST.aciertos} de ${NR} personajes logrados`,puntos:ST.puntos,det:+nivel===3?'Con el reloj en contra':'Todas las consignas completadas'});
        else api.fin({tipo:'pierde',titulo:'Se acabó el tiempo',sub:`solo lograste ${ST.aciertos} de ${NR}`,puntos:ST.puntos,det:'Necesitabas al menos 3'});
      }
      const lp=+nivel===3?GS.bucle(dt=>{
        if(ST.fin||!ST.ret||ST.bloq)return;ST.t+=dt;const s=Math.ceil(RT-ST.t);
        if(s!==ST.seg){ST.seg=s;pintaReto()}
        if(ST.t>=RT){api.sonar.error&&api.sonar.error();api.msg('¡Tiempo!');ST.bloq=true;ST.ri++;ST.tm.push(setTimeout(()=>{if(!ST.fin)nuevaConsigna()},700));ST.t=0}
      }):null;
      /* ---------- eventos ---------- */
      root.addEventListener('click',e=>{
        const tb=e.target.closest('[data-tab]');if(tb){ST.tab=tb.dataset.tab;pintaTabs();pintaOpts();return}
        const o=e.target.closest('.sm-o');if(o){S[o.dataset.k]=+o.dataset.i;refresca();GS.tono(420+(+o.dataset.i%6)*60,.05,'triangle',.04,520);return}
        const sw=e.target.closest('[data-ck]');if(sw){S[sw.dataset.ck]=+sw.dataset.ci;refresca();GS.tono(520,.04,'triangle',.03,620)}
      });
      const acc=$('#crAcc');
      const btn=(id,txt,fn,ghost=true)=>{const b=document.createElement('button');b.className='btn'+(ghost?' ghost':'');b.id=id;b.textContent=txt;b.onclick=fn;acc.appendChild(b)};
      btn('crAl','Aleatorio',aleatorio);btn('crGu','Guardar',guarda);btn('crCa','Cargar',carga);btn('crDe','Descargar imagen',descarga);
      if(NR)btn('crEn','Entregar',entrega,false);else btn('crLi','¡Listo!',terminaLibre,false);
      api.botones([]);
      pintaTabs();
      if(NR)nuevaConsigna();else{refresca();api.msg('Elige una pestaña y personaliza')}
      return{destruir(){ST.fin=true;ST.tm.forEach(clearTimeout);lp&&lp.parar()},dbg:{S,ST,aleatorio,entrega,refresca,checks,K_RETOS,retos,final}};
    }
  });
}

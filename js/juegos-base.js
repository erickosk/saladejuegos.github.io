/* =====================================================================
   juegos-base.js · Utilidades compartidas por los juegos de mesa/lógica.
   Cada juego es una función initXxx(contenedor) que se inyecta en
   <div id="game-container"></div>. Todo lo visual es SVG (sin emojis).
   ===================================================================== */
const GS=(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const wait=ms=>new Promise(r=>setTimeout(r,ms));

/* ---------- Sonido ---------- */
let _ac=null,sonido=true;try{sonido=localStorage.getItem('gm_son')!=='0'}catch(e){}
function tono(f,d=.08,t='triangle',v=.07,f2){
  if(!sonido)return;try{const C=window.AudioContext||window.webkitAudioContext;_ac=_ac||new C();if(_ac.state==='suspended')_ac.resume();
  const o=_ac.createOscillator(),g=_ac.createGain();o.type=t;o.frequency.setValueAtTime(f,_ac.currentTime);if(f2)o.frequency.exponentialRampToValueAtTime(f2,_ac.currentTime+d);
  g.gain.value=v;o.connect(g);g.connect(_ac.destination);o.start();g.gain.exponentialRampToValueAtTime(.0001,_ac.currentTime+d);o.stop(_ac.currentTime+d)}catch(e){}
}
const sonar={ficha:()=>tono(420,.07),captura:()=>tono(240,.14,'square',.07),gana:()=>{tono(784,.2);setTimeout(()=>tono(988,.3),180)},pierde:()=>tono(180,.5,'sawtooth',.07,70),error:()=>tono(150,.1,'square',.05)};

/* ---------- Íconos SVG ---------- */
const svg=(d,extra='')=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${d}</svg>`;
const ICO={
  reiniciar:svg('<path d="M20 11a8 8 0 1 0-2.300 5.700"/><path d="M20 4v7h-7"/>'),
  deshacer:svg('<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>'),
  pista:svg('<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.500 10.900c.6.500 1 1.200 1 2.100h5c0-.9.4-1.600 1-2.100A6 6 0 0 0 12 3z"/>'),
  menu:svg('<path d="M4 7h16M4 12h16M4 17h16"/>'),
  borrar:svg('<path d="M21 5H9l-6 7 6 7h12z"/><path d="M13 9l4 6M17 9l-4 6"/>'),
  girar:svg('<path d="M21 12a9 9 0 1 1-3-6.700"/><path d="M21 4v5h-5"/>'),
  aleatorio:svg('<path d="M3 7h4l10 10h4M3 17h4l3-3M14 10l3-3h4"/><path d="M18 4l3 3-3 3M18 14l3 3-3 3"/>'),
  sonido:svg('<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.500 8.500a5 5 0 0 1 0 7M19 6a8.500 8.500 0 0 1 0 12"/>'),
  reloj:svg('<circle cx="12" cy="13" r="8"/><path d="M12 8.500V13l3 2M9.500 3h5"/>'),
  copa:svg('<path d="M8 4h8v5a4 4 0 0 1-8 0V4zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8M9.500 17h5"/>'),
  persona:svg('<circle cx="12" cy="8.500" r="4"/><path d="M4 21c0-4.400 3.600-7 8-7s8 2.600 8 7z"/>'),
  robot:svg('<rect x="5" y="8" width="14" height="11" rx="3"/><path d="M12 4v4M9 13h.01M15 13h.01M9 16h6"/>'),
  flecha:svg('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  pausa:svg('<path d="M8 5v14M16 5v14"/>'),
  jugar:svg('<path d="M7 4l13 8-13 8z"/>'),
  izq:svg('<path d="M15 5l-7 7 7 7"/>'),
  der:svg('<path d="M9 5l7 7-7 7"/>'),
  arriba:svg('<path d="M5 15l7-7 7 7"/>'),
  abajo:svg('<path d="M5 9l7 7 7-7"/>'),
  fuego:svg('<circle cx="12" cy="12" r="3.500"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>'),
  impulso:svg('<path d="M12 3l6 12H6z"/><path d="M9 20c1 1 5 1 6 0"/>')
};
/* Símbolos de juego (se dibujan sobre una casilla de 100 x 100) */
const SIM={
  x:(c='#e8472f',w=14)=>`<g stroke="${c}" stroke-width="${w}" stroke-linecap="round"><path d="M24 24L76 76M76 24L24 76"/></g>`,
  o:(c='#2f7fd1',w=13)=>`<circle cx="50" cy="50" r="28" fill="none" stroke="${c}" stroke-width="${w}"/>`
};

/* ---------- Tablero de resultado / menú ---------- */
function mejor(id,nivel,pts){
  const k='gm_best_'+id+'_'+nivel;let m=0;try{m=+localStorage.getItem(k)||0;if(pts>m){m=pts;localStorage.setItem(k,m)}}catch(e){}return m;
}
function setPuntos(n){const p=document.getElementById('score');if(p)p.textContent=n}
function msg(t){const m=document.getElementById('ms');if(m)m.textContent=t||''}

/* crear(): arma menú de dificultad → partida → resultado. cfg:
   id, niveles:[[id,nombre,descripcion]], opciones:[{k,t,v:[[valor,texto]],d}], intro, iniciar(api,nivel,opc) → {destruir?} */
function crear(cont,cfg){
  cont.classList.add('gm-cont');
  let nivel=localStorage.getItem('gm_niv_'+cfg.id)||cfg.niveles[Math.min(1,cfg.niveles.length-1)][0],opc={},vivo=null;
  (cfg.opciones||[]).forEach(o=>{opc[o.k]=localStorage.getItem('gm_opc_'+cfg.id+o.k)||o.d});
  if(!cfg.niveles.some(n=>n[0]===nivel))nivel=cfg.niveles[0][0];

  function menu(){
    if(vivo&&vivo.destruir)vivo.destruir();vivo=null;setPuntos(0);msg('');
    cont.innerHTML=`<div class="gm-menu"><h3>Dificultad</h3><div class="seg" id="gmN">${cfg.niveles.map(n=>`<button data-v="${n[0]}" class="${n[0]===nivel?'on':''}">${n[1]}</button>`).join('')}</div>
     <p class="muted" id="gmD"></p>
     ${(cfg.opciones||[]).map(o=>`<h3>${o.t}</h3><div class="seg" data-k="${o.k}">${o.v.map(v=>`<button data-v="${v[0]}" class="${v[0]===opc[o.k]?'on':''}">${v[1]}</button>`).join('')}</div>`).join('')}
     <p class="muted">${cfg.intro||''}</p><div class="gm-bar" style="margin-top:8px"><button class="btn" id="gmGo">¡A jugar!</button></div></div>`;
    const det=()=>{const n=cfg.niveles.find(x=>x[0]===nivel);$('#gmD',cont).textContent=n[2]||''};det();
    $('#gmN',cont).onclick=e=>{const b=e.target.closest('button');if(!b)return;nivel=b.dataset.v;localStorage.setItem('gm_niv_'+cfg.id,nivel);cont.querySelectorAll('#gmN button').forEach(x=>x.classList.toggle('on',x===b));det()};
    cont.querySelectorAll('.seg[data-k]').forEach(sg=>sg.onclick=e=>{const b=e.target.closest('button');if(!b)return;const k=sg.dataset.k;opc[k]=b.dataset.v;localStorage.setItem('gm_opc_'+cfg.id+k,opc[k]);sg.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b))});
    $('#gmGo',cont).onclick=partida;
  }
  function partida(){
    if(vivo&&vivo.destruir)vivo.destruir();vivo=null;setPuntos(0);msg('');
    cont.innerHTML='<div class="gm-espera" style="min-height:260px"></div>';
    if(typeof Sala!=='undefined'&&Sala.countdown){Sala.cancel();Sala.countdown(arrancar)}else arrancar();
  }
  function arrancar(){
    if(vivo&&vivo.destruir)vivo.destruir();vivo=null;setPuntos(0);msg('');
    cont.innerHTML=`<div class="gm"><div class="gm-estado" id="gmE"></div><div class="gm-area" id="gmA"></div><div class="gm-bar" id="gmB"></div></div><div class="gm-ov" id="gmO"></div>`;
    let terminado=false;
    const api={cont,area:$('#gmA',cont),nivel,opc,rnd,pick,shuffle,wait,tono,sonar,ico:ICO,sim:SIM,esc,
      puntos:setPuntos,msg,
      estado:t=>{const e=$('#gmE',cont);if(e)e.innerHTML=t},
      botones(lista){const b=$('#gmB',cont);b.innerHTML='';lista.forEach(x=>{const el=document.createElement('button');el.className='btn ghost';el.id=x.id||'';el.innerHTML=(x.ico?ICO[x.ico]:'')+(x.txt||'');el.onclick=x.fn;if(x.title)el.title=x.title;b.appendChild(el)});
        const r=document.createElement('button');r.className='btn ghost';r.innerHTML=ICO.reiniciar+'Reiniciar';r.onclick=partida;b.appendChild(r);
        const m=document.createElement('button');m.className='btn ghost';m.innerHTML=ICO.menu+'Dificultad';m.onclick=menu;b.appendChild(m)},
      get terminado(){return terminado},
      fin({tipo,titulo,sub='',puntos=0,det=''}){
        if(terminado)return;terminado=true;if(tipo==='gana'){msg('¡Completado: '+(sub||'ganaste')+'!');Sala.confetti();sonar.gana()}else if(tipo==='pierde'){msg(titulo);sonar.pierde()}else msg(titulo);
        setPuntos(puntos);const rec=mejor(cfg.id,nivel,puntos),ov=$('#gmO',cont);
        ov.className='gm-ov '+tipo;
        ov.innerHTML=`<h2>${esc(titulo)}</h2><p>${esc(sub)}</p><div class="big">${puntos}</div><p>puntos</p><p>${esc(det)}${det?' · ':''}récord en ${cfg.niveles.find(n=>n[0]===nivel)[1].toLowerCase()}: ${rec}</p>
         <div class="gm-bar" style="margin-top:12px"><button class="btn" id="ovOtra" style="background:var(--accent)">Jugar otra vez</button><button class="btn ghost" id="ovVer">Ver tablero</button></div>`;
        setTimeout(()=>{if(!terminado)return;ov.classList.add('on');const o=$('#ovOtra',cont);if(o){o.onclick=partida;$('#ovVer',cont).onclick=()=>ov.classList.remove('on')}},tipo==='gana'?700:900);
      }};
    vivo=cfg.iniciar(api,nivel,opc)||{};
    window.__gm={api,get estado(){return vivo},menu,partida,get nivel(){return nivel},get opc(){return opc}};
  }
  menu();
  return{menu,partida};
}

/* =====================  Juegos de acción (SVG en tiempo real)  ===================== */
const NS='http://www.w3.org/2000/svg';
function el(tag,attrs,padre){const e=document.createElementNS(NS,tag);for(const k in (attrs||{}))e.setAttribute(k,attrs[k]);if(padre)padre.appendChild(e);return e}
/* escena(api,{w,h,max,fondo}) → SVG con viewBox w×h y una capa raíz. pt(e) convierte el puntero a coordenadas de la escena */
function escena(api,{w,h,max=440,fondo='#cfe9f7',aria='Escena del juego'}){
  api.area.innerHTML=`<svg class="gm-svg gm-esc" viewBox="0 0 ${w} ${h}" style="max-width:${max}px;touch-action:none;border-radius:16px;background:${fondo};box-shadow:0 8px 0 rgba(90,70,50,.2)" role="application" aria-label="${aria}"><defs><clipPath id="gmClip"><rect width="${w}" height="${h}" rx="16"/></clipPath></defs><g clip-path="url(#gmClip)" id="gmRaiz"></g></svg>`;
  const svg=api.area.querySelector('svg'),raiz=svg.querySelector('#gmRaiz');
  svg.style.visibility='hidden';requestAnimationFrame(()=>requestAnimationFrame(()=>{svg.style.visibility=''}));
  setTimeout(()=>{svg.style.visibility=''},400);
  return{svg,raiz,w,h,el:(t,a,p)=>el(t,a,p||raiz),
    pt(e){const r=svg.getBoundingClientRect();return{x:(e.clientX-r.left)*w/r.width,y:(e.clientY-r.top)*h/r.height}}};
}
/* bucle(fn): requestAnimationFrame con dt acotado; se pausa solo al salir de la pestaña */
function bucle(fn){
  let id=0,t0=0,pausado=false,vivo=true;
  const f=ts=>{if(!vivo)return;id=requestAnimationFrame(f);if(!t0)t0=ts;const dt=Math.min(.05,(ts-t0)/1000);t0=ts;if(!pausado)fn(dt)};
  id=requestAnimationFrame(f);const vis=()=>{if(document.hidden)pausado=true;t0=0};document.addEventListener('visibilitychange',vis);
  return{get pausado(){return pausado},pausa(v){pausado=v===undefined?!pausado:v;t0=0;return pausado},parar(){vivo=false;cancelAnimationFrame(id);document.removeEventListener('visibilitychange',vis)}};
}
/* entrada(esc): teclado normalizado (flechas/WASD/Espacio), puntero en coordenadas de la escena y eventos */
function entrada(esc){
  const teclas=new Set(),p={x:esc.w/2,y:esc.h/2,abajo:false},cbs={abajo:[],arriba:[],mueve:[],tecla:[]};
  const MAPA={a:'ArrowLeft',d:'ArrowRight',w:'ArrowUp',s:'ArrowDown',' ':'Space',x:'Space',enter:'Space'};
  const norm=k=>{const m=MAPA[k.toLowerCase()];return m||k};
  const kd=e=>{const k=norm(e.key);if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space'].includes(k))e.preventDefault();if(!teclas.has(k)){teclas.add(k);cbs.tecla.forEach(f=>f(k))}};
  const ku=e=>teclas.delete(norm(e.key));
  const pd=e=>{Object.assign(p,esc.pt(e),{abajo:true});cbs.abajo.forEach(f=>f(p,e))};
  const pm=e=>{Object.assign(p,esc.pt(e));cbs.mueve.forEach(f=>f(p,e))};
  const pu=e=>{p.abajo=false;cbs.arriba.forEach(f=>f(p,e))};
  document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
  esc.svg.addEventListener('pointerdown',pd);esc.svg.addEventListener('pointermove',pm);['pointerup','pointercancel','pointerleave'].forEach(v=>esc.svg.addEventListener(v,pu));
  return{teclas,p,on:(ev,f)=>cbs[ev].push(f),destruir(){document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku)}};
}
/* pad(api,ent,botones): botones táctiles que simulan teclas mantenidas. Solo se muestra en pantallas táctiles o angostas. */
function pad(api,ent,botones,{siempre=false}={}){
  const d=document.createElement('div');d.className='gm-bar gm-pad';
  d.style.display=(siempre||matchMedia('(pointer:coarse)').matches||innerWidth<760)?'flex':'none';
  botones.forEach(b=>{const x=document.createElement('button');x.className='btn ghost';x.setAttribute('aria-label',b.etq||b.k);x.innerHTML=ICO[b.ico]+(b.txt||'');
    const on=e=>{e.preventDefault();ent.teclas.add(b.k);x.classList.add('on')};const off=()=>{ent.teclas.delete(b.k);x.classList.remove('on')};
    x.addEventListener('pointerdown',on);['pointerup','pointercancel','pointerleave'].forEach(v=>x.addEventListener(v,off));d.appendChild(x)});
  api.area.appendChild(d);return d;
}
/* iniciaConToque: la cuenta atrás ya avisó; la acción arranca de inmediato (se conserva la firma por compatibilidad) */
function iniciaConToque(esc,ent,texto,cb){cb()}
/* destello: pequeña explosión SVG animada en (x,y) */
function destello(esc,x,y,color='#ffb347',r=34){
  const g=el('g',{transform:`translate(${x} ${y})`},esc.raiz);
  g.innerHTML=`<circle r="${r*.5}" fill="${color}" fill-opacity=".85"/><circle r="${r*.3}" fill="#fff6d6"/>`+[0,1,2,3,4,5].map(i=>`<path d="M0 0L${Math.cos(i*1.047)*r} ${Math.sin(i*1.047)*r}" stroke="${color}" stroke-width="3" stroke-linecap="round"/>`).join('');
  try{g.animate([{transform:`translate(${x}px,${y}px) scale(.4)`,opacity:1},{transform:`translate(${x}px,${y}px) scale(1.6)`,opacity:0}],{duration:420,easing:'ease-out'})}catch(e){}
  setTimeout(()=>g.remove(),430);
}
const corazones=(n,max=3)=>`<span style="display:inline-flex;gap:3px;vertical-align:-4px">${Array.from({length:max},(_,i)=>`<svg viewBox="0 0 24 24" width="21" height="21" aria-hidden="true"><path d="M12 21C5 15.500 2.500 12 2.500 8.500A5 5 0 0 1 12 6.500 5 5 0 0 1 21.500 8.500C21.500 12 19 15.500 12 21z" fill="${i<n?'#e8472f':'#d9c7b0'}"/></svg>`).join('')}</span>`;
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const choca=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
return{$,esc,rnd,pick,shuffle,wait,tono,sonar,ICO,SIM,svg,crear,setPuntos,msg,mejor,el,escena,bucle,entrada,pad,iniciaConToque,destello,corazones,dist,choca,rand:(a,b)=>a+Math.random()*(b-a)};
})();

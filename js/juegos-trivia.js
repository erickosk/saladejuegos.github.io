/* =====================================================================
   juegos-trivia.js · Trivia de cultura general, Adivina la bandera,
   ¿Quién soy? y Verdadero o falso.
   Requiere: juegos-base.js, trivia-datos.js y trivia-banderas.js
   Uso:  initTrivia(document.getElementById('game-container'))
   Cada partida empieza con la cuenta atrás de GS.crear.
   ===================================================================== */
const _TVCOL={historia:'#c98b3d',ciencia:'#2fa39b',geografia:'#3f86d8',cultura:'#c8579e',bandera:'#e8472f',quien:'#7a5ac8',vof:'#2e9e63'};
const _TVNOM={historia:'Historia',ciencia:'Ciencia',geografia:'Geografía',cultura:'Cultura'};
const _S='fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
const _TVI={
  historia:`<svg viewBox="0 0 24 24" ${_S}><path d="M3 21h18M5 21V10M9 21V10M15 21V10M19 21V10M2 10l10-6 10 6z"/></svg>`,
  ciencia:`<svg viewBox="0 0 24 24" ${_S}><circle cx="12" cy="12" r="1.6" fill="currentColor"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-60 12 12)"/></svg>`,
  geografia:`<svg viewBox="0 0 24 24" ${_S}><circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19M12 2.5c3.500 3.500 3.500 15.500 0 19M12 2.5c-3.500 3.500-3.500 15.500 0 19"/></svg>`,
  cultura:`<svg viewBox="0 0 24 24" ${_S}><path d="M12 3C6.500 3 3 7 3 11.500c0 3 2.500 3.500 4 3 1.500-.5 2.500.5 2 2-.7 2.200 1 4.500 3.500 4.500 5 0 9.500-4 9.500-9.500C22 6.500 17.500 3 12 3z"/><circle cx="8" cy="9" r="1.200" fill="currentColor"/><circle cx="12.500" cy="7" r="1.200" fill="currentColor"/><circle cx="16.500" cy="10" r="1.200" fill="currentColor"/></svg>`,
  bandera:`<svg viewBox="0 0 24 24" ${_S}><path d="M5 22V3M5 4h13l-3 4.500 3 4.500H5"/></svg>`,
  quien:`<svg viewBox="0 0 24 24" ${_S}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.500 3.500-7 8-7s8 2.500 8 7"/></svg>`,
  vof:`<svg viewBox="0 0 24 24" ${_S}><path d="M4 12.500l5 5L20 6.500"/></svg>`,
  logo:`<svg viewBox="0 0 24 24" ${_S}><path d="M12 2l3 6.500 7 1-5 5 1.200 7L12 18l-6.200 3.500L7 14.500l-5-5 7-1z"/></svg>`
};
const _OK='<svg viewBox="0 0 24 24" fill="none" stroke="#2e9e63" stroke-width="3.200" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.500l5 5L20 6.500"/></svg>';
const _NO='<svg viewBox="0 0 24 24" fill="none" stroke="#d9473a" stroke-width="3.200" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
let _tvU=0;
const _esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------- motor común: HUD, temporizador, opciones, retroalimentación y fin ---------- */
function _tvMotor(api,cfg){
  api.area.innerHTML=`<div class="tv"><div class="tv-head"><div class="tv-badge"><span class="ic"></span><span class="tx"></span></div><div class="tv-timer"><i></i></div><div class="tv-cnt"></div></div><div class="tv-card"></div><div class="tv-opts" data-o></div><div class="tv-tools"></div><div class="tv-fb"></div></div>`;
  const R=api.area.querySelector('.tv'),q$=s=>R.querySelector(s);
  const S={i:-1,vidas:cfg.vidas,puntos:0,racha:0,mejor:0,ok:0,estado:'ini',t:0,T:cfg.tiempo,q:null,fin:false,opts:[]};
  const N=cfg.items.length,ui={R,S,get card(){return q$('.tv-card')},get optsEl(){return q$('[data-o]')},tools:q$('.tv-tools'),timer:q$('.tv-timer'),responder:i=>responder(i),avanzar:()=>avanzar(),hud:()=>hud()};
  const tms=[];const later=(f,ms)=>{tms.push(setTimeout(()=>{if(!S.fin)f()},ms))};ui.later=later;
  const hud=()=>api.estado(`${GS.corazones(S.vidas,cfg.vidas)}<span style="margin:0 10px">${Math.min(S.i+1,N)} / ${N}</span><span>Racha ${S.racha}</span>`);
  function cat(c,txt){R.style.setProperty('--cat',_TVCOL[c]||'#f57c73');q$('.tv-badge .ic').innerHTML=_TVI[c]||'';q$('.tv-badge .tx').textContent=txt}
  function nuevaTarjeta(){const old=q$('.tv-card'),n=document.createElement('div');n.className='tv-card';old.replaceWith(n);return n}
  function siguiente(){
    if(S.fin)return;S.i++;
    if(S.i>=N)return terminar(true);
    const q=cfg.items[S.i];S.q=q;S.estado='q';S.t=0;S.T=cfg.tiempoDe?cfg.tiempoDe(q):cfg.tiempo;
    q$('.tv-fb').className='tv-fb';q$('.tv-fb').innerHTML='';q$('.tv-tools').innerHTML='';
    const card=nuevaTarjeta(),oe=q$('[data-o]');oe.innerHTML='';
    const r=cfg.render(q,{...ui,card,cat});S.opts=r.opts;
    oe.className='tv-opts '+(r.clase||'');
    if(r.vf){oe.className='tv-vf';S.opts.forEach((o,i)=>{const b=document.createElement('button');b.className='tv-opt '+(i?'v':'f');b.innerHTML=(i?_OK:_NO)+(i?'Verdadero':'Falso');b.onclick=()=>responder(i);oe.appendChild(b)})}
    else S.opts.forEach((o,i)=>{const b=document.createElement('button');b.className='tv-opt';b.innerHTML=`<span class="k">${'ABCDEF'[i]}</span><span>${o.html}</span>`;b.onclick=()=>responder(i);oe.appendChild(b)});
    q$('.tv-cnt').textContent=`${S.i+1}/${N}`;
    q$('.tv-timer').className='tv-timer';q$('.tv-timer i').style.width='100%';
    if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();
    hud();
  }
  function marca(ok,elegida){
    const bs=q$('[data-o]').querySelectorAll('.tv-opt');
    bs.forEach((b,i)=>{b.disabled=true;if(S.opts[i].ok)b.classList.add('ok');else if(i===elegida)b.classList.add('bad');else b.classList.add('dim')});
  }
  function responder(idx,tiempo=false){
    if(S.estado!=='q'||S.fin)return;
    const q=S.q,ok=idx>=0&&!!S.opts[idx].ok;
    if(!ok&&idx>=0&&cfg.reintento){
      const bs=q$('[data-o]').querySelectorAll('.tv-opt');
      bs[idx].disabled=true;bs[idx].classList.add('bad');S.vidas--;S.racha=0;api.sonar.error&&api.sonar.error();hud();
      if(S.vidas<=0){return cerrar(false,idx,false,0,true)}
      if(cfg.reintento(q,idx,{...ui,card:q$('.tv-card')},S))return;
      return cerrar(false,idx,false,0,true);
    }
    let pts=0;
    if(ok){S.racha++;S.mejor=Math.max(S.mejor,S.racha);S.ok++;pts=cfg.puntos(q,{t:S.t,T:S.T,racha:S.racha,S});S.puntos+=pts;api.puntos(S.puntos);api.sonar.captura&&api.sonar.captura()}
    else{S.racha=0;S.vidas--;api.sonar.error&&api.sonar.error()}
    cerrar(ok,idx,tiempo,pts,false);
  }
  function cerrar(ok,idx,tiempo,pts,yaRestado){
    S.estado='fb';marca(ok,idx);
    const fb=q$('.tv-fb');fb.className='tv-fb on '+(ok?'ok':'bad');
    const ultimo=S.vidas<=0||S.i>=N-1;
    fb.innerHTML=`<div class="tx">${cfg.fb(S.q,ok,tiempo,pts,S)}</div><button class="btn" id="tvSig">${S.vidas<=0?'Ver resultado':S.i>=N-1?'Terminar':'Siguiente'}</button>`;
    q$('#tvSig').onclick=avanzar;try{q$('#tvSig').focus({preventScroll:true})}catch(e){}
    if(cfg.alCerrar)cfg.alCerrar(S.q,ok,{...ui,card:q$('.tv-card')});
    hud();
  }
  function avanzar(){
    if(S.estado!=='fb'||S.fin)return;S.estado='espera';
    if(S.vidas<=0)return terminar(false);
    siguiente();
  }
  function terminar(gano){
    if(S.fin)return;S.fin=true;S.estado='fin';lp.parar();document.removeEventListener('keydown',tecla);tms.forEach(clearTimeout);
    const bono=gano?S.vidas*50:0;S.puntos+=bono;api.puntos(S.puntos);
    const det=`${S.ok} aciertos de ${N} · mejor racha ${S.mejor}${bono?` · +${bono} por vidas`:''}`;
    api.fin(gano?{tipo:'gana',titulo:cfg.tituloGana||'¡Excelente!',sub:cfg.subGana?cfg.subGana(S):`${S.ok} de ${N} correctas`,puntos:S.puntos,det}:{tipo:'pierde',titulo:'Te quedaste sin vidas',sub:`llegaste a la pregunta ${Math.min(S.i+1,N)} de ${N}`,puntos:S.puntos,det});
  }
  const lp=GS.bucle(dt=>{
    if(S.fin||S.estado!=='q')return;
    S.t+=dt;const f=Math.max(0,1-S.t/S.T),tm=q$('.tv-timer');
    q$('.tv-timer i').style.width=(f*100)+'%';tm.className='tv-timer'+(f<.25?' low':f<.55?' mid':'');
    if(cfg.onTick)cfg.onTick(S.q,S.t,S.T,{...ui,card:q$('.tv-card')});
    if(S.t>=S.T)responder(-1,true);
  });
  function tecla(e){
    if(S.fin||e.ctrlKey||e.metaKey||e.altKey)return;
    if(S.estado==='fb'&&(e.key==='Enter'||e.key===' ')){e.preventDefault();avanzar();return}
    if(S.estado!=='q'||lp.pausado)return;
    const k=e.key.toLowerCase();let i=-1;
    if(cfg.vf){if(k==='arrowleft'||k==='f')i=0;else if(k==='arrowright'||k==='v')i=1}
    else{if('1234'.includes(k)&&k.length===1)i=+k-1;else if('abcd'.includes(k)&&k.length===1)i=k.charCodeAt(0)-97}
    if(i>=0&&i<S.opts.length){e.preventDefault();responder(i)}
  }
  document.addEventListener('keydown',tecla);
  api.botones([{txt:'Pausa',ico:'pausa',fn:()=>api.msg(lp.pausa()?'Pausa':'')}]);
  siguiente();
  return{destruir(){lp.parar();document.removeEventListener('keydown',tecla);tms.forEach(clearTimeout)},ui,S,responder,avanzar,dbg:{S}};
}
const _opts4=(ok,otras)=>GS.shuffle([{html:_esc(ok),ok:true},...otras.slice(0,3).map(t=>({html:_esc(t),ok:false}))]);
/* reparte por categorías para que no salgan seguidas de la misma */
function _alternaCat(lista,N){
  const g={};GS.shuffle(lista.slice()).forEach(q=>(g[q[0]]=g[q[0]]||[]).push(q));
  const ks=Object.keys(g),out=[];let k=0;
  while(out.length<N&&ks.some(x=>g[x].length)){const c=ks[k++%ks.length];if(g[c].length)out.push(g[c].pop())}
  return out;
}

/* ============ 1) TRIVIA DE CULTURA GENERAL ============ */
function initTrivia(cont){
  return GS.crear(cont,{
    id:'trivia',
    intro:'Responde preguntas de historia, ciencia, geografía y cultura. Cada acierto suma puntos (más si respondes rápido) y las rachas dan bonos. Un error o quedarte sin tiempo te cuesta una vida. Tienes un comodín 50/50 y uno para saltar una pregunta. Con teclado: 1–4 o A–D, y Enter para continuar.',
    niveles:[['1','Fácil','10 preguntas · 4 vidas · 20 s por pregunta.'],['2','Medio','12 preguntas · 3 vidas · 16 s por pregunta.'],['3','Difícil','14 preguntas · 3 vidas · 13 s por pregunta · preguntas más duras.']],
    iniciar(api,nivel){
      const cfgN={1:{n:10,v:4,t:20,m:[1,1,1,1,1,2]},2:{n:12,v:3,t:16,m:[1,2,2,2,3]},3:{n:14,v:3,t:13,m:[2,3,3,3,3]}}[nivel];
      const pool=TRIVIA_PREGUNTAS.filter(q=>cfgN.m.includes(q[1]));
      /* más peso a las dificultades de la mezcla */
      const items=_alternaCat(pool,cfgN.n);
      let c5050=1,cSalto=1,mot;
      const m=_tvMotor(api,{
        items,vidas:cfgN.v,tiempo:cfgN.t,tituloGana:'¡Mente brillante!',
        subGana:S=>`${S.ok} de ${items.length} correctas`,
        render(q,ui){
          ui.cat(q[0],_TVNOM[q[0]]);
          ui.card.innerHTML=`<p class="tv-q">${_esc(q[2])}</p>`;
          const opts=_opts4(q[3],GS.shuffle(q[4].slice()));
          ui.tools.innerHTML=`<button class="btn ghost" id="tv5">50/50</button><button class="btn ghost" id="tvSk">Saltar</button>`;
          const b5=ui.tools.querySelector('#tv5'),bs=ui.tools.querySelector('#tvSk');
          b5.disabled=c5050<=0;bs.disabled=cSalto<=0;
          b5.onclick=()=>{if(c5050<=0||ui.S.estado!=='q')return;c5050--;b5.disabled=true;
            const bt=ui.optsEl.querySelectorAll('.tv-opt');let q2=0;
            GS.shuffle(opts.map((o,i)=>i)).forEach(i=>{if(!opts[i].ok&&q2<2){q2++;bt[i].disabled=true;bt[i].classList.add('dim')}})};
          bs.onclick=()=>{if(cSalto<=0||ui.S.estado!=='q')return;cSalto--;ui.S.estado='fb';ui.avanzar()};
          return{opts};
        },
        puntos:(q,c)=>100+Math.round(80*(1-c.t/c.T))+Math.min(c.racha-1,5)*20,
        fb:(q,ok,tiempo,pts)=>ok?`<b>¡Correcto! +${pts}</b><br>${_esc(q[5])}`:`<b>${tiempo?'Se acabó el tiempo.':'Incorrecto.'}</b> La respuesta era <b>${_esc(q[3])}</b>.<br>${_esc(q[5])}`
      });
      return m;
    }
  });
}

/* ============ 2) ADIVINA LA BANDERA ============ */
function initBanderas(cont){
  return GS.crear(cont,{
    id:'banderas',
    intro:'Mira la bandera e identifica a qué país pertenece. Al responder verás su capital y su continente. En difícil las opciones tienen banderas muy parecidas. Con teclado: 1–4 o A–D y Enter para continuar.',
    niveles:[['1','Fácil','10 banderas famosas · 4 vidas · 14 s.'],['2','Medio','12 banderas · 3 vidas · 11 s · opciones del mismo continente.'],['3','Difícil','15 banderas de todo el mundo · 3 vidas · 9 s · opciones muy parecidas.']],
    iniciar(api,nivel){
      const C={1:{n:10,v:4,t:14,d:1},2:{n:12,v:3,t:11,d:2},3:{n:15,v:3,t:9,d:3}}[nivel];
      const todos=BANDERAS_PAISES,pool=todos.filter(p=>p[4]<=C.d&&(nivel>1||p[4]===1));
      const items=GS.shuffle(pool.slice()).slice(0,C.n);
      function distract(p){
        let c=todos.filter(x=>x[0]!==p[0]);
        if(+nivel===3){const gr=GS.shuffle(c.filter(x=>x[5]===p[5]));const rest=GS.shuffle(c.filter(x=>x[5]!==p[5]&&x[3]===p[3]));return gr.concat(rest,GS.shuffle(c)).filter((x,i,a)=>a.indexOf(x)===i).slice(0,3)}
        if(+nivel===2){const ct=GS.shuffle(c.filter(x=>x[3]===p[3]&&x[4]<=2));return ct.concat(GS.shuffle(c.filter(x=>x[4]<=2))).filter((x,i,a)=>a.indexOf(x)===i).slice(0,3)}
        return GS.shuffle(c.filter(x=>x[4]===1)).slice(0,3);
      }
      return _tvMotor(api,{
        items,vidas:C.v,tiempo:C.t,tituloGana:'¡Viajero del mundo!',subGana:S=>`${S.ok} banderas acertadas`,
        render(p,ui){
          ui.cat('bandera','¿De qué país es?');
          ui.card.innerHTML=`<div class="tv-flag">${bandera(p[0])}</div>`;
          return{opts:GS.shuffle([{html:_esc(p[1]),ok:true},...distract(p).map(x=>({html:_esc(x[1]),ok:false}))])};
        },
        puntos:(p,c)=>100+Math.round(100*(1-c.t/c.T))+Math.min(c.racha-1,5)*20,
        fb:(p,ok,tiempo,pts)=>`<b>${ok?'¡Correcto! +'+pts:tiempo?'Se acabó el tiempo.':'Incorrecto.'}</b> Es <b>${_esc(p[1])}</b>.<br><span class="tv-chip">${p[2]?'Capital: '+_esc(p[2]):'Bandera de '+_esc(p[1])}</span><span class="tv-chip">${_esc(p[3])}</span>`
      });
    }
  });
}

/* ============ 3) ¿QUIÉN SOY? ============ */
function initQuienSoy(cont){
  const COL={Ciencia:'#2fa39b',Arte:'#c8579e',Música:'#e0702a',Literatura:'#7a5ac8',Historia:'#c98b3d',Política:'#3f86d8',Exploración:'#2e9e63'};
  return GS.crear(cont,{
    id:'quiensoy',
    intro:'Descubre al personaje con pistas que van de la más vaga a la más clara. Cuantas menos pistas uses, más puntos ganas: puedes pedir otra pista en cualquier momento. Si eliges mal pierdes una vida, pero se revela una pista nueva. Con teclado: 1–4 o A–D, P para pedir pista y Enter para continuar.',
    niveles:[['1','Fácil','8 personajes · 4 vidas · empiezas con 2 pistas · 60 s.'],['2','Medio','10 personajes · 3 vidas · empiezas con 1 pista · 50 s.'],['3','Difícil','12 personajes · 3 vidas · 1 pista · 40 s.']],
    iniciar(api,nivel){
      const C={1:{n:10-2,v:4,t:60,k0:2},2:{n:10,v:3,t:50,k0:1},3:{n:12,v:3,t:40,k0:1}}[nivel];
      const items=GS.shuffle(QUIEN_SOY.slice()).slice(0,C.n);
      let mot,teclaP;
      mot=_tvMotor(api,{
        items,vidas:C.v,tiempo:C.t,tituloGana:'¡Gran detective!',subGana:S=>`${S.ok} personajes descubiertos`,
        render(p,ui){
          const color=COL[p[1]]||'#7a5ac8';ui.R.style.setProperty('--cat',color);
          ui.cat('quien',p[1]);ui.R.style.setProperty('--cat',color);
          let k=C.k0;p._k=k;
          const sil=`<svg class="tv-sil" viewBox="0 0 100 100"><defs><linearGradient id="sg${++_tvU}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}"/><stop offset="1" stop-color="#4a2626" stop-opacity=".85"/></linearGradient><clipPath id="sc${_tvU}"><circle cx="50" cy="50" r="46"/></clipPath></defs><circle cx="50" cy="50" r="46" fill="${color}" fill-opacity=".22" stroke="${color}" stroke-width="4"/><g clip-path="url(#sc${_tvU})"><circle cx="50" cy="38" r="17" fill="url(#sg${_tvU})"/><path d="M14 98Q16 62 50 60Q84 62 86 98z" fill="url(#sg${_tvU})"/></g><text x="50" y="52" text-anchor="middle" font-family="Fredoka,Nunito,sans-serif" font-size="30" font-weight="700" fill="#fff">?</text></svg>`;
          ui.card.style.display='block';
          ui.card.innerHTML=`${sil}<div class="tv-valor">${[0,1,2,3,4].map(i=>`<i class="${i<5-k+1&&false?'on':''}"></i>`).join('')}</div><ol class="tv-pistas"></ol>`;
          const ol=ui.card.querySelector('.tv-pistas'),pips=ui.card.querySelectorAll('.tv-valor i');
          const pinta=()=>{ol.innerHTML=p[3].slice(0,p._k).map((t,i)=>`<li><span class="n">${i+1}</span><span>${_esc(t)}</span></li>`).join('');pips.forEach((e,i)=>e.classList.toggle('on',i<5-p._k+1));const b=ui.tools.querySelector('#tvPi');if(b){b.disabled=p._k>=5;b.textContent=p._k>=5?'Sin más pistas':`Otra pista (−${100})`}};
          const nueva=()=>{if(ui.S.estado!=='q'||p._k>=5)return;p._k++;pinta()};
          p._nueva=nueva;p._pinta=pinta;
          ui.tools.innerHTML='<button class="btn ghost" id="tvPi">Otra pista</button>';ui.tools.querySelector('#tvPi').onclick=nueva;
          const d=GS.shuffle(QUIEN_SOY.filter(x=>x[0]!==p[0]&&x[1]===p[1]));
          const otros=d.concat(GS.shuffle(QUIEN_SOY.filter(x=>x[0]!==p[0]&&x[1]!==p[1]))).slice(0,3).map(x=>x[0]);
          pinta();
          return{opts:_opts4(p[0],otros)};
        },
        reintento(p,idx,ui,S){if(p._k>=5)return false;p._k++;p._pinta();return true},
        alCerrar(p,ok,ui){ui.card.querySelector('.tv-pistas').innerHTML=p[3].map((t,i)=>`<li><span class="n">${i+1}</span><span>${_esc(t)}</span></li>`).join('');ui.tools.innerHTML=''},
        puntos:(p,c)=>(6-p._k)*100+Math.min(c.racha-1,5)*20+Math.round(30*(1-c.t/c.T)),
        fb:(p,ok,tiempo,pts)=>`<b>${ok?'¡Correcto! +'+pts:tiempo?'Se acabó el tiempo.':'No lo lograste.'}</b> Era <b>${_esc(p[0])}</b> <span class="tv-chip">${_esc(p[1])}</span><span class="tv-chip">${_esc(p[2])}</span>`
      });
      teclaP=e=>{if(e.key==='p'||e.key==='P'){const q=mot.S.q;if(q&&q._nueva&&mot.S.estado==='q'){e.preventDefault();q._nueva()}}};
      document.addEventListener('keydown',teclaP);
      const d0=mot.destruir;mot.destruir=()=>{document.removeEventListener('keydown',teclaP);d0()};
      return mot;
    }
  });
}

/* ============ 4) VERDADERO O FALSO ============ */
function initVerdaderoFalso(cont){
  return GS.crear(cont,{
    id:'vof',
    intro:'Lee cada afirmación y decide si es verdadera o falsa antes de que se acabe el tiempo. Después verás la explicación. Las rachas dan bonos. Con teclado: ← o F para Falso, → o V para Verdadero y Enter para continuar.',
    niveles:[['1','Fácil','12 afirmaciones · 4 vidas · 12 s cada una.'],['2','Medio','15 afirmaciones · 3 vidas · 9 s.'],['3','Difícil','18 afirmaciones · 3 vidas · 7 s · datos curiosos y mitos.']],
    iniciar(api,nivel){
      const C={1:{n:12,v:4,t:12,m:[1,2]},2:{n:15,v:3,t:9,m:[1,2,3]},3:{n:18,v:3,t:7,m:[2,3]}}[nivel];
      const pool=VOF.filter(x=>C.m.includes(x[1])),T=GS.shuffle(pool.filter(x=>x[3])),F=GS.shuffle(pool.filter(x=>!x[3]));
      const items=[];for(let i=0;i<C.n;i++){const lista=(i%2?T:F),otra=(i%2?F:T);items.push(lista.length?lista.pop():otra.pop())}
      GS.shuffle(items);
      return _tvMotor(api,{
        items,vidas:C.v,tiempo:C.t,vf:true,tituloGana:'¡Ojo de águila!',subGana:S=>`${S.ok} de ${items.length} correctas`,
        render(q,ui){
          ui.cat(q[0],_TVNOM[q[0]]);
          ui.card.innerHTML=`<p class="tv-q">${_esc(q[2])}</p>`;
          return{vf:true,opts:[{ok:!q[3]},{ok:!!q[3]}]};
        },
        puntos:(q,c)=>100+Math.round(60*(1-c.t/c.T))+Math.min(c.racha-1,6)*15,
        fb:(q,ok,tiempo,pts)=>`<b>${ok?'¡Correcto! +'+pts:tiempo?'Se acabó el tiempo.':'Incorrecto.'}</b> Es <b>${q[3]?'verdadero':'falso'}</b>.<br>${_esc(q[4])}`
      });
    }
  });
}

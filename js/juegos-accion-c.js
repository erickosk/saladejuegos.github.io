/* =====================================================================
   juegos-accion-c.js · Tiro al blanco, Lanzamiento de baloncesto, Billar,
   Minigolf y Equilibrio de torre.
   Uso:  initShooting(document.getElementById('game-container'))
   Todo es SVG; cada partida empieza con la cuenta atrás de GS.crear.
   ===================================================================== */
const _uid=(()=>{let n=0;return p=>p+(++n)})();
/* arrastre(): puntero con captura (no se suelta si el dedo sale de la escena) */
function _arrastre(esc,{abajo,mueve,arriba}){
  const sv=esc.svg;let activo=false;
  const pd=e=>{activo=true;try{sv.setPointerCapture(e.pointerId)}catch(_){}abajo&&abajo(esc.pt(e),e)};
  const pm=e=>{mueve&&mueve(esc.pt(e),e,activo)};
  const pu=e=>{if(!activo)return;activo=false;arriba&&arriba(esc.pt(e),e,false)};
  const pc=e=>{if(!activo)return;activo=false;arriba&&arriba(esc.pt(e),e,true)};
  sv.addEventListener('pointerdown',pd);sv.addEventListener('pointermove',pm);sv.addEventListener('pointerup',pu);sv.addEventListener('pointercancel',pc);
  return{get activo(){return activo}};
}
/* texto flotante (+100) que sube y se desvanece; se limpia solo */
function _flota(esc,x,y,txt,color='#fff'){
  const g=GS.el('text',{x,y,'text-anchor':'middle','font-family':'Nunito,Arial,sans-serif','font-size':20,'font-weight':900,fill:color,stroke:'rgba(0,0,0,.45)','stroke-width':3,'paint-order':'stroke'},esc.raiz);
  g.textContent=txt;
  try{g.animate([{transform:'translateY(0)',opacity:1},{transform:'translateY(-34px)',opacity:0}],{duration:900,easing:'ease-out'})}catch(e){}
  setTimeout(()=>g.remove(),900);
}

/* 11) TIRO AL BLANCO */
function initShooting(cont){
  return GS.crear(cont,{
    id:'tiroblanco',
    intro:'Apunta con el mouse o el dedo y toca para disparar a los blancos que se deslizan por los rieles. El centro da más puntos; el oro vale mucho y los platos voladores también. ¡No dispares a las caritas sonrientes! Alcanza la meta de puntos antes de que se acabe el tiempo. Los aciertos seguidos suben tu racha.',
    niveles:[['1','Fácil','40 s · meta de 700 puntos · blancos grandes y lentos.'],['2','Medio','45 s · meta de 1,100 puntos.'],['3','Difícil','50 s · meta de 1,600 puntos · blancos pequeños y veloces.']],
    iniciar(api,nivel){
      const W=520,H=380,T={1:40,2:45,3:50}[nivel],META={1:700,2:1100,3:1600}[nivel],VEL={1:1,2:1.3,3:1.65}[nivel];
      const esc=GS.escena(api,{w:W,h:H,max:640,fondo:'#3b2a22',aria:'Tiro al blanco'}),E=esc.el;
      const ent=GS.entrada(esc);
      /* ---------- decorado ---------- */
      E('defs').innerHTML=`<linearGradient id="tbPared" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a4d36"/><stop offset="1" stop-color="#3d2a22"/></linearGradient>
        <linearGradient id="tbMesa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9a066"/><stop offset="1" stop-color="#9a6a3c"/></linearGradient>
        <radialGradient id="tbLuz"><stop offset="0" stop-color="#fff3b0" stop-opacity=".9"/><stop offset="1" stop-color="#fff3b0" stop-opacity="0"/></radialGradient>`;
      E('rect',{width:W,height:H,fill:'url(#tbPared)'});
      let tablas='';for(let x=0;x<W;x+=26)tablas+=`<path d="M${x} 0V${H}" stroke="#2b1c15" stroke-opacity=".35" stroke-width="2"/>`;
      E('g').innerHTML=tablas;
      /* toldo de rayas con festón y focos */
      let toldo='';for(let i=0;i<13;i++){toldo+=`<path d="M${i*40} 0h40v34a20 14 0 0 1 -40 0z" fill="${i%2?'#fff4e6':'#e8472f'}"/>`}
      E('g').innerHTML=toldo+`<rect width="${W}" height="6" fill="#b32f1e"/>`;
      let focos='';for(let i=0;i<13;i++){focos+=`<circle cx="${i*40+20}" cy="52" r="16" fill="url(#tbLuz)"/><circle cx="${i*40+20}" cy="50" r="4" fill="#fff6c9" stroke="#e0b84a" stroke-width="1.500"/>`}
      E('g').innerHTML=focos;
      const FILAS=[{y:136,dir:1,v:48},{y:213,dir:-1,v:72},{y:290,dir:1,v:96}];
      FILAS.forEach(f=>{E('g').innerHTML=`<rect x="0" y="${f.y-40}" width="${W}" height="7" fill="#9aa3ad"/><rect x="0" y="${f.y-40}" width="${W}" height="2.500" fill="#e1e6eb"/><rect x="0" y="${f.y-34}" width="${W}" height="2" fill="#000" fill-opacity=".2"/>`});
      const capaB=E('g');
      /* mostrador de madera */
      E('g').innerHTML=`<rect x="0" y="322" width="${W}" height="${H-322}" fill="url(#tbMesa)"/><rect x="0" y="322" width="${W}" height="9" fill="#f0c58c"/><rect x="0" y="331" width="${W}" height="3" fill="#000" fill-opacity=".2"/>${[0,1,2,3,4,5,6].map(i=>`<rect x="${14+i*76}" y="342" width="60" height="30" rx="5" fill="#8a5a30" stroke="#6b431f" stroke-width="2"/>`).join('')}`;
      /* ---------- estado ---------- */
      const objs=[];let t=0,puntos=0,aciertos=0,disparos=0,racha=0,fin=false,jugando=false,cool=0,platoT=GS.rand(2,4),aviso=0;
      const retic=E('g');retic.innerHTML='<circle r="15" fill="none" stroke="#fff" stroke-width="2.500" stroke-opacity=".95"/><circle r="15" fill="none" stroke="#e8472f" stroke-width="1" stroke-opacity=".9" stroke-dasharray="3 5"/><path d="M-24 0H-8M8 0H24M0 -24V-8M0 8V24" stroke="#fff" stroke-width="2.500" stroke-linecap="round"/><circle r="2" fill="#e8472f"/>';
      retic.setAttribute('transform',`translate(${W/2} ${H/2})`);retic.style.pointerEvents='none';
      const hud=()=>api.estado(`<span>${Math.max(0,Math.ceil(T-t))} s</span><span style="margin:0 12px">Meta ${puntos} / ${META}</span><span>Racha ${racha}</span>`);
      function dibuja(tipo,r){
        if(tipo==='disco')return `<circle r="${r}" fill="#fff" stroke="#7b5a40" stroke-width="3"/><circle r="${r*.78}" fill="#e8472f"/><circle r="${r*.56}" fill="#fff"/><circle r="${r*.34}" fill="#e8472f"/><circle r="${r*.14}" fill="#ffd54a" stroke="#c99a00"/><path d="M${-r*.7} ${-r*.45}A${r*.82} ${r*.82} 0 0 1 ${-r*.2} ${-r*.8}" stroke="#fff" stroke-opacity=".6" stroke-width="3" fill="none" stroke-linecap="round"/>`;
        if(tipo==='oro')return `<circle r="${r}" fill="#ffd54a" stroke="#b88700" stroke-width="3"/><circle r="${r*.68}" fill="#fff0a0"/><polygon points="0,${-r*.5} ${r*.15},${-r*.15} ${r*.5},${-r*.15} ${r*.22},${r*.08} ${r*.32},${r*.45} 0,${r*.22} ${-r*.32},${r*.45} ${-r*.22},${r*.08} ${-r*.5},${-r*.15} ${-r*.15},${-r*.15}" fill="#e8a400" stroke="#b88700" stroke-width="1.500" stroke-linejoin="round"/>`;
        if(tipo==='amigo')return `<circle r="${r}" fill="#ffe066" stroke="#e8472f" stroke-width="4"/><circle cx="${-r*.32}" cy="${-r*.2}" r="${r*.11}" fill="#4a2626"/><circle cx="${r*.32}" cy="${-r*.2}" r="${r*.11}" fill="#4a2626"/><path d="M${-r*.45} ${r*.12}Q0 ${r*.62} ${r*.45} ${r*.12}" stroke="#4a2626" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="${-r*.55}" cy="${r*.08}" r="${r*.13}" fill="#ff9aa8" fill-opacity=".8"/><circle cx="${r*.55}" cy="${r*.08}" r="${r*.13}" fill="#ff9aa8" fill-opacity=".8"/>`;
        return `<ellipse rx="16" ry="6.500" fill="#ff8a3d" stroke="#a8430f" stroke-width="2"/><ellipse cy="-1.800" rx="11" ry="3.200" fill="#ffc47e"/>`;
      }
      function crea(tipo,fila,x){
        const f=FILAS[fila],base={1:25,2:22,3:19}[nivel],r=tipo==='oro'?base*.68:tipo==='amigo'?base*.95:base,g=E('g',{},capaB);
        const o={tipo,fila,x,y:f.y,r,vx:f.dir*f.v*VEL*GS.rand(.8,1.25)*(tipo==='oro'?1.6:1),g,estado:'vivo',caida:0,spin:0};
        if(tipo==='plato'){o.x=GS.pick([-20,W+20]);o.y=GS.rand(260,300);o.vx=(o.x<0?1:-1)*GS.rand(130,200)*VEL;o.vy=-GS.rand(250,330);o.r=18;g.innerHTML=`<g class="cara">${dibuja('plato',16)}</g>`}
        else{g.innerHTML=`<g class="polo"><path d="M0 ${-r}V-36" stroke="#8a8f96" stroke-width="4"/><rect x="-8" y="-42" width="16" height="10" rx="3" fill="#5f656c" stroke="#3f454b" stroke-width="1.500"/></g><g class="cara">${dibuja(tipo,r)}</g>`}
        o.cara=g.querySelector('.cara');o.polo=g.querySelector('.polo');
        g.setAttribute('transform',`translate(${o.x} ${o.y})`);objs.push(o);return o;
      }
      const tipoAl=()=>{const a=Math.random();return a<.10+nivel*.03?'oro':a<.30+nivel*.04?'amigo':'disco'};
      FILAS.forEach((f,i)=>{for(let k=0;k<3;k++)crea(tipoAl(),i,60+k*190+GS.rand(-30,30))});
      function dispara(p){
        if(fin||!jugando||cool>0||api.terminado)return;cool=.22;disparos++;GS.tono(180,.09,'sawtooth',.09,60);
        retic.animate&&retic.animate([{opacity:1},{opacity:.6},{opacity:1}],{duration:160});
        GS.destello(esc,p.x,p.y,'#fff2a8',14);
        let hit=null;
        for(let i=objs.length-1;i>=0;i--){const o=objs[i];if(o.estado!=='vivo')continue;if(Math.hypot(p.x-o.x,p.y-o.y)<=o.r+(o.tipo==='plato'?4:1)){hit=o;break}}
        if(!hit){racha=0;GS.tono(120,.06,'square',.03);hud();return}
        const d=Math.hypot(p.x-hit.x,p.y-hit.y)/hit.r;let base=0,txt='';
        if(hit.tipo==='amigo'){base=-100;racha=0;GS.sonar.error();txt='-100'}
        else{
          if(hit.tipo==='disco')base=d<.14?100:d<.34?75:d<.56?50:d<.78?30:15;
          else if(hit.tipo==='oro')base=d<.35?300:200;else base=120;
          aciertos++;racha++;base=Math.round(base*(1+Math.min(racha-1,5)*.1));txt='+'+base;GS.tono(base>=100?900:640,.08,'triangle',.07,base>=100?1400:880);
          if(hit.tipo!=='plato'){const h=GS.el('circle',{cx:p.x-hit.x,cy:p.y-hit.y,r:2.6,fill:'#1d1410','fill-opacity':.85},hit.cara)}
        }
        puntos=Math.max(0,puntos+base);api.puntos(puntos);
        hit.estado='caido';hit.caida=0;hit.vyc=-90;if(hit.polo)hit.polo.setAttribute('display','none');
        if(hit.tipo==='plato'){GS.destello(esc,hit.x,hit.y,'#ff8a3d',26)}
        _flota(esc,hit.x,hit.y-hit.r-6,txt,base<0?'#ff6b6b':'#ffe27a');hud();
      }
      ent.on('abajo',p=>{if(!lp.pausado)dispara(p)});
      ent.on('tecla',k=>{if(k==='Space'&&!lp.pausado)dispara({x:ent.p.x,y:ent.p.y})});
      function termina(gano){
        if(fin)return;fin=true;lp.parar();
        const prec=disparos?Math.round(aciertos/disparos*100):0;
        if(gano){puntos+=Math.round(Math.max(0,T-t)*5);api.puntos(puntos);api.fin({tipo:'gana',titulo:'¡Meta de puntería!',sub:`superaste los ${META} puntos`,puntos,det:`precisión ${prec}%`})}
        else api.fin({tipo:'pierde',titulo:'Se acabó el tiempo',sub:`te faltaron ${Math.max(0,META-puntos)} puntos`,puntos,det:`precisión ${prec}%`});
      }
      const lp=GS.bucle(dt=>{
        retic.setAttribute('transform',`translate(${ent.p.x} ${ent.p.y})`);
        if(!jugando||fin)return;
        t+=dt;cool-=dt;
        for(let i=objs.length-1;i>=0;i--){
          const o=objs[i];
          if(o.estado==='caido'){o.caida+=dt;o.vyc+=900*dt;o.y+=o.vyc*dt;o.spin+=dt*340*(o.vx>=0?1:-1);o.cara.setAttribute('transform',`rotate(${o.spin})`);o.g.setAttribute('transform',`translate(${o.x} ${o.y})`);o.g.setAttribute('opacity',Math.max(0,1-o.caida*1.6));
            if(o.caida>.65){o.g.remove();objs.splice(i,1);if(o.tipo!=='plato')crea(tipoAl(),o.fila,FILAS[o.fila].dir>0?-30:W+30)}
            continue}
          if(o.tipo==='plato'){o.vy+=380*dt;o.x+=o.vx*dt;o.y+=o.vy*dt;o.spin+=dt*300;o.cara.setAttribute('transform',`rotate(${Math.sin(o.spin*.02)*14})`);if(o.y>H+30||o.x<-60||o.x>W+60){o.g.remove();objs.splice(i,1);continue}}
          else{o.x+=o.vx*dt;if((o.vx>0&&o.x>W+40)||(o.vx<0&&o.x<-40)){o.g.remove();objs.splice(i,1);crea(tipoAl(),o.fila,o.vx>0?-30:W+30);continue}}
          o.g.setAttribute('transform',`translate(${o.x} ${o.y})`);
        }
        platoT-=dt;if(platoT<=0){platoT=GS.rand(2.2,4.5)/VEL;if(objs.filter(o=>o.tipo==='plato').length<2)crea('plato',0,0)}
        if(Math.floor(t*4)%2===0)hud();
        if(puntos>=META)termina(true);else if(t>=T)termina(false);
      });
      GS.iniciaConToque(esc,ent,'',()=>{jugando=true});
      api.botones([{txt:'Pausa',ico:'pausa',fn:()=>api.msg(lp.pausa()?'Pausa':'')}]);hud();
      return{destruir(){lp.parar();ent.destruir()},dbg:{disparar:dispara,get objs(){return objs},get puntos(){return puntos},get t(){return t},META,acabar(){t=T}}};
    }
  });
}

/* 12) LANZAMIENTO DE BALONCESTO */
function initBasketball(cont){
  return GS.crear(cont,{
    id:'baloncesto',
    intro:'Arrastra hacia atrás (como una resortera) para fijar dirección y fuerza, y suelta para lanzar; la guía punteada te ayuda. Con teclado: ↑ ↓ cambian el ángulo, ← → la fuerza y Espacio lanza. Cada tiro sale desde un lugar distinto. Un tiro limpio (sin tocar el aro) da puntos extra y las canastas seguidas forman una racha.',
    niveles:[['1','Fácil','10 tiros · mete 5 · guía larga.'],['2','Medio','10 tiros · mete 6 · guía corta.'],['3','Difícil','10 tiros · mete 7 · aro que se mueve y casi sin guía.']],
    iniciar(api,nivel){
      const W=480,H=420,PISO=396,SUELO=384,TIROS=10,META={1:5,2:6,3:7}[nivel],GUIA={1:16,2:9,3:4}[nivel];
      const BX=430,HB=BX-3,HF=HB-56,HY0=150,R=14,G=980,SPOTS=[56,96,136,176,216];
      const esc=GS.escena(api,{w:W,h:H,max:600,fondo:'#2b2140',aria:'Lanzamiento de baloncesto'}),E=esc.el;
      const ent=GS.entrada(esc);
      /* ---------- gimnasio ---------- */
      E('defs').innerHTML=`<linearGradient id="bkPared" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2d5c"/><stop offset="1" stop-color="#241a3d"/></linearGradient>
        <linearGradient id="bkPiso" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2a86a"/><stop offset="1" stop-color="#b87c42"/></linearGradient>
        <radialGradient id="bkBola" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ffb066"/><stop offset=".6" stop-color="#f07a1c"/><stop offset="1" stop-color="#b84f08"/></radialGradient>
        <radialGradient id="bkLuz"><stop offset="0" stop-color="#fff6c9" stop-opacity=".55"/><stop offset="1" stop-color="#fff6c9" stop-opacity="0"/></radialGradient>`;
      E('rect',{width:W,height:H,fill:'url(#bkPared)'});
      let gradas='';const cols=['#e8472f','#ffd54a','#2f7fd1','#fff','#7ee081','#ff8fab'];
      for(let f=0;f<4;f++){gradas+=`<rect x="0" y="${70+f*34}" width="${W}" height="34" fill="${f%2?'#2e2350':'#33285a'}"/>`;for(let i=0;i<24;i++){const x=10+i*20+(f%2)*10;gradas+=`<circle cx="${x}" cy="${86+f*34}" r="6.500" fill="${cols[(i*3+f*5)%6]}" fill-opacity=".9"/><rect x="${x-7}" y="${92+f*34}" width="14" height="12" rx="5" fill="${cols[(i*5+f*2)%6]}" fill-opacity=".8"/>`}}
      E('g').innerHTML=gradas;
      E('g').innerHTML=`<rect x="140" y="14" width="200" height="38" rx="8" fill="#14102a" stroke="#6a5aa8" stroke-width="3"/><text x="240" y="40" text-anchor="middle" font-family="Nunito,Arial,sans-serif" font-size="20" font-weight="900" fill="#ffd54a">BASKET</text>${[60,420].map(x=>`<circle cx="${x}" cy="20" r="40" fill="url(#bkLuz)"/><circle cx="${x}" cy="12" r="7" fill="#fff6c9"/>`).join('')}`;
      E('g').innerHTML=`<rect x="0" y="206" width="${W}" height="${H-206}" fill="url(#bkPiso)"/>${Array.from({length:12},(_,i)=>`<path d="M0 ${206+i*18}H${W}" stroke="#8c5a2a" stroke-opacity=".35" stroke-width="2"/>`).join('')}<rect x="0" y="206" width="${W}" height="6" fill="#7a4d24"/><ellipse cx="${HF-40}" cy="${SUELO+8}" rx="190" ry="32" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="3"/><path d="M0 ${SUELO+40}H${W}" stroke="#fff" stroke-opacity=".55" stroke-width="3"/><rect x="${BX-84}" y="${SUELO-26}" width="86" height="60" fill="#c93a27" fill-opacity=".5" stroke="#fff" stroke-opacity=".7" stroke-width="3"/>`;
      /* marcas de salida */
      SPOTS.forEach(x=>{E('g').innerHTML=`<ellipse cx="${x}" cy="${SUELO+4}" rx="18" ry="5" fill="#fff" fill-opacity=".35"/>`});
      /* soporte del tablero + aro (dibujado en coordenadas base y desplazado con translate) */
      E('g').innerHTML=`<rect x="${BX+8}" y="40" width="16" height="${PISO-40}" fill="#4a4a5a"/><rect x="${BX+8}" y="40" width="5" height="${PISO-40}" fill="#fff" fill-opacity=".18"/>`;
      const aro=E('g');
      aro.innerHTML=`<rect x="${BX+6}" y="${HY0-14}" width="12" height="10" fill="#5a5a6a"/><rect x="${BX}" y="${HY0-70}" width="9" height="92" rx="3" fill="#f4f8ff" stroke="#9fb0c8" stroke-width="2.500"/><rect x="${BX-30}" y="${HY0-48}" width="30" height="34" rx="2" fill="none" stroke="#e8472f" stroke-width="3" transform="translate(0 0)" opacity=".0"/><rect x="${BX+1.500}" y="${HY0-40}" width="6" height="26" fill="#e8472f" fill-opacity=".85"/><path d="M${HF} ${HY0}H${HB}" stroke="#ff7a1c" stroke-width="6" stroke-linecap="round"/><path d="M${HB} ${HY0}H${BX}" stroke="#ff7a1c" stroke-width="5"/><circle cx="${HF}" cy="${HY0}" r="5" fill="#ff7a1c" stroke="#b84f08" stroke-width="1.500"/>`;
      const red=GS.el('path',{fill:'none',stroke:'#fff',opacity:.9,'stroke-width':1.600,'stroke-linecap':'round'},aro);
      /* jugador */
      const jug=E('g');
      jug.innerHTML=`<ellipse cx="0" cy="2" rx="22" ry="6" fill="#000" fill-opacity=".25"/><path d="M-9 -34V-4M7 -34V-4" stroke="#f1b98a" stroke-width="9" stroke-linecap="round"/><path d="M-14 -3H-3M2 -3H13" stroke="#fff" stroke-width="7" stroke-linecap="round"/><path d="M-14 -1H-3M2 -1H13" stroke="#e8472f" stroke-width="3" stroke-linecap="round"/><rect x="-14" y="-52" width="28" height="22" rx="6" fill="#1f3f8a"/><rect x="-15" y="-80" width="30" height="34" rx="11" fill="#e8472f"/><rect x="-15" y="-68" width="30" height="4" fill="#fff" fill-opacity=".85"/><text x="0" y="-52" text-anchor="middle" font-family="Nunito,Arial,sans-serif" font-size="14" font-weight="900" fill="#fff">7</text><circle cx="0" cy="-94" r="12" fill="#f1b98a"/><path d="M-12 -97Q-10 -108 0 -107Q11 -107 12 -96Q4 -100 -12 -97z" fill="#3b2a1e"/><circle cx="5" cy="-93" r="1.800" fill="#222"/><path d="M3 -87Q6 -85 9 -87" stroke="#8a4a3a" stroke-width="1.500" fill="none" stroke-linecap="round"/><g class="lis"><path d="M4 -74L14 -92" stroke="#f1b98a" stroke-width="8" stroke-linecap="round"/><path d="M-6 -74L8 -88" stroke="#e0a577" stroke-width="7" stroke-linecap="round"/></g><g class="tir" display="none"><path d="M4 -74L26 -102" stroke="#f1b98a" stroke-width="8" stroke-linecap="round"/><path d="M-6 -74L18 -96" stroke="#e0a577" stroke-width="7" stroke-linecap="round"/></g>`;
      const poseL=jug.querySelector('.lis'),poseT=jug.querySelector('.tir');
      const guia=E('g'),puntosG=[];for(let i=0;i<GUIA;i++)puntosG.push(GS.el('circle',{r:3.600,fill:'#fff','fill-opacity':.85,stroke:'#ff7a1c','stroke-width':1.200},guia));
      const sombra=E('ellipse',{rx:12,ry:3.500,fill:'#000','fill-opacity':.28});
      const bola=E('g');bola.innerHTML=`<circle r="${R}" fill="url(#bkBola)" stroke="#7a3304" stroke-width="1.800"/><path d="M-14 0H14M0 -14V14M-10 -10Q0 0 -10 10M10 -10Q0 0 10 10" stroke="#5a2503" stroke-width="1.600" fill="none" stroke-linecap="round"/><ellipse cx="-4.500" cy="-6" rx="4" ry="2.400" fill="#fff" fill-opacity=".4" transform="rotate(-30 -4.500 -6)"/>`;
      /* ---------- estado ---------- */
      let dy=0,t=0,tiro=0,canastas=0,racha=0,puntos=0,fin=false,jugando=false,estado='listo',espera=0,spot=0,spin=0,ang=.98,pw=.6,arrastrando=false,d0=null,tocoAro=false,anotada=false,rebotes=0,tv=0,sway=0,prevSpace=false;
      const B={x:0,y:0,vx:0,vy:0};
      const hud=()=>api.estado(`<span>Tiro ${Math.min(tiro+(estado==='listo'?1:0),TIROS)} / ${TIROS}</span><span style="margin:0 12px">Canastas ${canastas} / ${META}</span><span>Racha ${racha}</span>`);
      function colocar(){
        let n;do{n=GS.rnd(0,SPOTS.length-1)}while(n===spot&&SPOTS.length>1);spot=n;
        const x=SPOTS[spot];jug.setAttribute('transform',`translate(${x} ${SUELO})`);poseL.setAttribute('display','inline');poseT.setAttribute('display','none');
        B.x=x+15;B.y=SUELO-93;B.vx=B.vy=0;anotada=false;tocoAro=false;rebotes=0;tv=0;estado='listo';bola.setAttribute('display','inline');hud();
      }
      function vel(){const v=380+pw*480;return{vx:Math.cos(ang)*v,vy:-Math.sin(ang)*v}}
      function lanza(){
        if(estado!=='listo'||fin||!jugando)return;
        const v=vel();B.vx=v.vx;B.vy=v.vy;estado='vuelo';tiro++;poseL.setAttribute('display','none');poseT.setAttribute('display','inline');GS.tono(300,.12,'triangle',.07,500);hud();
      }
      const hy=()=>HY0+dy;
      function rebota(cx,cy,rr,e=.6){
        const dx=B.x-cx,dyy=B.y-cy,d=Math.hypot(dx,dyy);if(d>=R+rr||d===0)return false;
        const nx=dx/d,ny=dyy/d;B.x=cx+nx*(R+rr);B.y=cy+ny*(R+rr);const vn=B.vx*nx+B.vy*ny;if(vn<0){B.vx-=(1+e)*vn*nx;B.vy-=(1+e)*vn*ny}return true;
      }
      function termina(){
        if(fin)return;fin=true;lp.parar();
        const gano=canastas>=META;puntos+=gano?150*nivel:0;api.puntos(puntos);
        if(gano)api.fin({tipo:'gana',titulo:'¡Gran puntería!',sub:`metiste ${canastas} canastas`,puntos,det:`${canastas} de ${TIROS} tiros`});
        else api.fin({tipo:'pierde',titulo:'Fin del partido',sub:`necesitabas ${META} canastas`,puntos,det:`${canastas} de ${TIROS} tiros`});
      }
      function finTiro(){
        estado='espera';espera=.8;bola.setAttribute('display','none');sombra.setAttribute('display','none');
        if(!anotada)racha=0;hud();
      }
      _arrastre(esc,{
        abajo:p=>{if(estado!=='listo'||lp.pausado||!jugando)return;arrastrando=true;d0=p},
        mueve:(p,e,act)=>{if(!arrastrando||!d0)return;const pvx=d0.x-p.x,pvy=d0.y-p.y,l=Math.hypot(pvx,pvy);if(l<6)return;ang=Math.max(.2,Math.min(1.45,Math.atan2(-pvy,pvx<=0?.01:pvx)));pw=Math.max(.05,Math.min(1,l/120))},
        arriba:(p,e,cancel)=>{if(!arrastrando)return;arrastrando=false;const l=d0?Math.hypot(d0.x-p.x,d0.y-p.y):0;d0=null;if(!cancel&&l>=14)lanza()}
      });
      const lp=GS.bucle(dt=>{
        if(!jugando||fin)return;
        t+=dt;
        if(+nivel===3)dy=Math.sin(t*1.15)*38;
        aro.setAttribute('transform',`translate(0 ${dy})`);
        /* red */
        sway=Math.max(0,sway-dt*1.6);const s=Math.sin(t*16)*sway*7;let d='';
        for(let i=0;i<=5;i++){const u=i/5;d+=`M${HF+(HB-HF)*u} ${HY0}L${HF+10+(HB-HF-20)*u+s} ${HY0+38}`}
        for(let k=1;k<=3;k++){const f=k/4;d+=`M${HF+10*f+s*f} ${HY0+38*f}H${HB-10*f+s*f}`}
        red.setAttribute('d',d);
        /* teclado */
        if(estado==='listo'){
          if(ent.teclas.has('ArrowUp'))ang=Math.min(1.45,ang+.9*dt);if(ent.teclas.has('ArrowDown'))ang=Math.max(.2,ang-.9*dt);
          if(ent.teclas.has('ArrowRight'))pw=Math.min(1,pw+.6*dt);if(ent.teclas.has('ArrowLeft'))pw=Math.max(.05,pw-.6*dt);
        }
        const sp=ent.teclas.has('Space');if(sp&&!prevSpace)lanza();prevSpace=sp;
        /* guía */
        if(estado==='listo'){
          const v=vel();for(let i=0;i<GUIA;i++){const tt=(i+1)*.05;puntosG[i].setAttribute('cx',B.x+v.vx*tt);puntosG[i].setAttribute('cy',B.y+v.vy*tt+.5*G*tt*tt);puntosG[i].setAttribute('opacity',1-i/GUIA*.7)}
          guia.setAttribute('display','inline');
        }else guia.setAttribute('display','none');
        if(estado==='espera'){espera-=dt;if(espera<=0){if(tiro>=TIROS)termina();else colocar()}}
        if(estado==='vuelo'){
          tv+=dt;const N=6,h=dt/N;
          for(let i=0;i<N&&estado==='vuelo';i++){
            const px=B.x,py=B.y;B.vy+=G*h;B.x+=B.vx*h;B.y+=B.vy*h;
            const Y=hy();
            if(rebota(HF,Y,3.600,.55)||rebota(HB,Y,3.600,.55)){tocoAro=true;GS.tono(220,.06,'square',.05)}
            /* tablero */
            if(B.x+R>BX&&B.x-R<BX+9&&B.y>Y-72&&B.y<Y+24){if(px+R<=BX+1||B.vx>0){B.x=BX-R;B.vx=-Math.abs(B.vx)*.6;tocoAro=true;GS.tono(180,.07,'square',.05)}}
            /* canasta: cruza la línea del aro hacia abajo entre los dos bordes */
            if(!anotada&&py<Y&&B.y>=Y&&B.vy>0&&B.x>HF+4&&B.x<HB-4){
              anotada=true;canastas++;racha++;sway=1;
              const lejos=Math.max(0,(HF-SPOTS[spot])-120),sw=!tocoAro;
              const pts=100+Math.round(lejos/3)+(sw?50:0)+Math.min(racha-1,4)*25;puntos+=pts;api.puntos(puntos);
              GS.sonar.gana();_flota(esc,HF+28,Y-24,(sw?'¡Limpia! +':'+')+pts,'#ffe27a');B.vx*=.3;B.vy*=.55;hud();
            }
            if(anotada&&B.y>Y&&B.y<Y+40){B.vx*=.97;B.x=Math.max(HF+8,Math.min(HB-8,B.x))}
            /* suelo y paredes */
            if(B.y+R>PISO){B.y=PISO-R;if(Math.abs(B.vy)>90){B.vy=-B.vy*.55;B.vx*=.8;rebotes++;GS.tono(140,.05,'sine',.06)}else B.vy=0}
            if(B.x-R<0){B.x=R;B.vx=Math.abs(B.vx)*.6}
          }
          spin+=B.vx*dt*1.6;
          if(rebotes>=3||B.x>W+40||tv>5.5||(B.y+R>=PISO-1&&Math.abs(B.vx)<20&&Math.abs(B.vy)<20))finTiro();
        }
        if(estado!=='espera'){
          bola.setAttribute('transform',`translate(${B.x} ${B.y}) rotate(${spin})`);
          sombra.setAttribute('display','inline');const alt=Math.max(0,PISO-B.y);sombra.setAttribute('transform',`translate(${B.x} ${PISO+2}) scale(${Math.max(.35,1-alt/380)} 1)`);
        }
      });
      GS.iniciaConToque(esc,ent,'',()=>{jugando=true});
      GS.pad(api,ent,[{k:'ArrowLeft',ico:'izq',etq:'Menos fuerza'},{k:'ArrowRight',ico:'der',etq:'Más fuerza'},{k:'ArrowUp',ico:'arriba',etq:'Más ángulo'},{k:'ArrowDown',ico:'abajo',etq:'Menos ángulo'},{k:'Space',ico:'fuego',etq:'Lanzar'}]);
      api.botones([{txt:'Pausa',ico:'pausa',fn:()=>api.msg(lp.pausa()?'Pausa':'')}]);
      colocar();
      return{destruir(){lp.parar();ent.destruir()},dbg:{lanzar:lanza,set(a,p){ang=a;pw=p},get estado(){return estado},get canastas(){return canastas},get tiro(){return tiro},get B(){return B},get puntos(){return puntos},HF,HB,hy,get spot(){return SPOTS[spot]}}};
    }
  });
}

/* 13) BILLAR */
function initBilliards(cont){
  const COLORES=['#f2c230','#2f6fd1','#e8472f','#7a3fb5','#f58a1f','#2e9e5b','#8c2a2a','#1d1d1d'];
  return GS.crear(cont,{
    id:'billar',
    intro:'Arrastra hacia atrás desde cualquier punto (como una resortera): la dirección es opuesta a tu arrastre y la fuerza depende de cuánto estires. La guía muestra dónde chocará la blanca. Con teclado: ← → giran la dirección, ↑ ↓ cambian la fuerza y Espacio golpea. Mete todas las bolas en las troneras antes de quedarte sin tiros; si metes la blanca pierdes puntos.',
    niveles:[['1','Fácil','6 bolas · 18 tiros · troneras grandes.'],['2','Medio','10 bolas · 24 tiros.'],['3','Difícil','15 bolas · 30 tiros · troneras más pequeñas.']],
    iniciar(api,nivel){
      const W=560,H=330,X0=50,X1=510,Y0=50,Y1=280,R=10,FILAS={1:3,2:4,3:5}[nivel],TIROS={1:18,2:24,3:30}[nivel],CAP={1:1.15,2:1,3:.9}[nivel];
      const esc=GS.escena(api,{w:W,h:H,max:640,fondo:'#1c1410',aria:'Billar'}),E=esc.el;
      const ent=GS.entrada(esc);
      E('defs').innerHTML=`<linearGradient id="blMadera" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9a5a2e"/><stop offset=".5" stop-color="#7a4220"/><stop offset="1" stop-color="#4f2a14"/></linearGradient>
        <radialGradient id="blPano" cx=".5" cy=".45" r=".75"><stop offset="0" stop-color="#2fa764"/><stop offset="1" stop-color="#176b3e"/></radialGradient>
        <radialGradient id="blBrillo" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset=".35" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#000" stop-opacity=".38"/></radialGradient>
        <linearGradient id="blTaco" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f1d9a8"/><stop offset=".7" stop-color="#c58b4a"/><stop offset="1" stop-color="#5a3318"/></linearGradient>`;
      E('rect',{width:W,height:H,fill:'#241a14'});
      /* mesa */
      E('g').innerHTML=`<rect x="12" y="12" width="${W-24}" height="${H-24}" rx="26" fill="url(#blMadera)" stroke="#2e170a" stroke-width="3"/><rect x="${X0-16}" y="${Y0-16}" width="${X1-X0+32}" height="${Y1-Y0+32}" rx="10" fill="#135c34" stroke="#0c3d22" stroke-width="3"/><rect x="${X0}" y="${Y0}" width="${X1-X0}" height="${Y1-Y0}" fill="url(#blPano)"/>
        ${[1,2,3,4,5,6,7].map(i=>[`<circle cx="${X0-1+ i*(X1-X0)/8}" cy="31" r="3.200" fill="#f1e4c2" stroke="#8a6a3a"/>`,`<circle cx="${X0-1+i*(X1-X0)/8}" cy="${H-31}" r="3.200" fill="#f1e4c2" stroke="#8a6a3a"/>`]).flat().join('')}
        ${[1,2,3].map(i=>[`<circle cx="31" cy="${Y0+i*(Y1-Y0)/4}" r="3.200" fill="#f1e4c2" stroke="#8a6a3a"/>`,`<circle cx="${W-31}" cy="${Y0+i*(Y1-Y0)/4}" r="3.200" fill="#f1e4c2" stroke="#8a6a3a"/>`]).flat().join('')}
        <path d="M${X0+150} ${Y0}V${Y1}" stroke="#fff" stroke-opacity=".18" stroke-width="2"/><circle cx="${X0+150}" cy="${(Y0+Y1)/2}" r="3" fill="#fff" fill-opacity=".3"/><circle cx="${X1-150}" cy="${(Y0+Y1)/2}" r="3" fill="#fff" fill-opacity=".3"/>`;
      const TRONERAS=[[X0-5,Y0-5,22],[X1+5,Y0-5,22],[X0-5,Y1+5,22],[X1+5,Y1+5,22],[(X0+X1)/2,Y0-7,20],[(X0+X1)/2,Y1+7,20]].map(([x,y,r])=>({x,y,r:r*CAP}));
      E('g').innerHTML=TRONERAS.map(t=>`<circle cx="${t.x}" cy="${t.y}" r="${t.r*.78+5}" fill="#c9a24a" stroke="#6b4a1c" stroke-width="2"/><circle cx="${t.x}" cy="${t.y}" r="${t.r*.78}" fill="#0b0b0b"/><circle cx="${t.x}" cy="${t.y}" r="${t.r*.5}" fill="#000"/>`).join('');
      const guia=E('g'),lGuia=GS.el('path',{fill:'none',stroke:'#fff','stroke-width':2,'stroke-dasharray':'6 6','stroke-opacity':.8,'stroke-linecap':'round'},guia),
        fant=GS.el('circle',{r:R,fill:'none',stroke:'#fff','stroke-width':2,'stroke-opacity':.85},guia),lRebote=GS.el('path',{fill:'none',stroke:'#ffe27a','stroke-width':2,'stroke-opacity':.8,'stroke-linecap':'round'},guia);
      const capaB=E('g'),taco=E('g');
      taco.innerHTML=`<path d="M0 -3L260 -6V6L0 3z" fill="url(#blTaco)" stroke="#3a2210" stroke-width="1.500" stroke-linejoin="round"/><rect x="0" y="-3" width="9" height="6" fill="#4aa3d9"/><rect x="9" y="-3" width="2" height="6" fill="#f4f4f4"/><rect x="170" y="-5" width="60" height="10" fill="#1d1d1d" fill-opacity=".85"/><rect x="170" y="-5" width="60" height="2" fill="#e8c26a"/>`;
      taco.setAttribute('transform','translate(-999 -999)');
      /* ---------- bolas ---------- */
      const bolas=[];let n=0;
      function crearBola(num,x,y){
        const g=GS.el('g',{},capaB),id=_uid('bl');
        const col=num===0?'#f7f3e8':COLORES[(num-1)%8],raya=num>8;
        g.innerHTML=`<ellipse cx="2" cy="3" rx="${R}" ry="${R*.9}" fill="#000" fill-opacity=".28"/><clipPath id="${id}"><circle r="${R}"/></clipPath><circle r="${R}" fill="${num===0?'#f7f3e8':raya?'#f7f3e8':col}"/>${raya?`<rect x="${-R}" y="${-R*.55}" width="${R*2}" height="${R*1.1}" fill="${COLORES[(num-9)%8]}" clip-path="url(#${id})"/>`:''}${num?`<circle r="${R*.48}" fill="#fff"/><text y="${R*.2}" text-anchor="middle" font-family="Nunito,Arial,sans-serif" font-size="${R*.62}" font-weight="900" fill="#222">${num}</text>`:`<circle cx="${R*.28}" cy="${R*.2}" r="1.600" fill="#e8472f"/>`}<circle r="${R}" fill="url(#blBrillo)"/>`;
        g.setAttribute('transform',`translate(${x} ${y})`);
        const b={num,x,y,vx:0,vy:0,g,dentro:false,anim:0};bolas.push(b);return b;
      }
      const blanca=crearBola(0,X0+130,(Y0+Y1)/2);
      const ax=X1-150,dxF=R*1.74+.4;let k=0;
      for(let c=0;c<FILAS;c++)for(let r=0;r<=c;r++){k++;crearBola(k,ax+c*dxF,(Y0+Y1)/2+(r-c/2)*(2*R+.4))}
      const objetos=()=>bolas.filter(b=>b.num&&!b.dentro);
      /* ---------- estado ---------- */
      let tiros=TIROS,puntos=0,fin=false,jugando=false,estado='listo',ang=Math.PI*0+0,pw=.5,racha=0,arrastrando=false,d0=null,metidas=0,metidasTiro=0,rayada=false,espera=0,sp0=false;
      const hud=()=>api.estado(`<span>Tiros ${tiros}</span><span style="margin:0 12px">Bolas ${objetos().length}</span><span>Puntos ${puntos}</span>`);
      function termina(gano){
        if(fin)return;fin=true;lp.parar();
        if(gano){puntos+=tiros*25+100*nivel;api.puntos(puntos);api.fin({tipo:'gana',titulo:'¡Mesa limpia!',sub:'metiste todas las bolas',puntos,det:`${tiros} tiros sobrantes`})}
        else api.fin({tipo:'pierde',titulo:'Sin tiros',sub:`quedaron ${objetos().length} bolas`,puntos,det:`${metidas} bolas metidas`});
      }
      function golpea(){
        if(estado!=='listo'||fin||!jugando||blanca.dentro)return;
        const v=120+pw*820;blanca.vx=Math.cos(ang)*v;blanca.vy=Math.sin(ang)*v;tiros--;estado='mov';metidasTiro=0;rayada=false;GS.tono(260,.07,'square',.08,120);taco.setAttribute('transform','translate(-999 -999)');hud();
      }
      function libre(x,y,ign){return x>X0+R&&x<X1-R&&y>Y0+R&&y<Y1-R&&bolas.every(b=>b===ign||b.dentro||Math.hypot(b.x-x,b.y-y)>2*R+1)}
      function reponer(){
        let x=X0+130,y=(Y0+Y1)/2,found=libre(x,y,blanca);
        for(let r=0;r<120&&!found;r++){const a=r*2.4,d=8+r*3;const cx=X0+130+Math.cos(a)*d,cy=(Y0+Y1)/2+Math.sin(a)*d;if(libre(cx,cy,blanca)){x=cx;y=cy;found=true}}
        blanca.x=x;blanca.y=y;blanca.vx=blanca.vy=0;blanca.dentro=false;blanca.g.setAttribute('display','inline');blanca.g.setAttribute('transform',`translate(${x} ${y})`);
      }
      function trataPared(b){
        if(b.x<X0+R){b.x=X0+R;b.vx=Math.abs(b.vx)*.82}else if(b.x>X1-R){b.x=X1-R;b.vx=-Math.abs(b.vx)*.82}
        if(b.y<Y0+R){b.y=Y0+R;b.vy=Math.abs(b.vy)*.82}else if(b.y>Y1-R){b.y=Y1-R;b.vy=-Math.abs(b.vy)*.82}
      }
      function paso(h){
        for(const b of bolas){
          if(b.dentro)continue;
          b.x+=b.vx*h;b.y+=b.vy*h;
          const s=Math.hypot(b.vx,b.vy);
          if(s>0){const ns=Math.max(0,s-(58+s*.22)*h);const f=ns/s;b.vx*=f;b.vy*=f;if(ns<7){b.vx=b.vy=0}}
          /* tronera */
          let cae=null;for(const t of TRONERAS){if(Math.hypot(b.x-t.x,b.y-t.y)<t.r){cae=t;break}}
          if(cae){b.dentro=true;b.anim=0;b.tx=cae.x;b.ty=cae.y;b.vx=b.vy=0;GS.tono(130,.18,'sine',.1,60);
            if(b===blanca){racha=0;puntos=Math.max(0,puntos-50);_flota(esc,cae.x,cae.y+(cae.y<H/2?34:-20),'-50','#ff8a8a');rayada=true}
            else{metidas++;metidasTiro++;racha++;const pts=100+Math.min(racha-1,4)*25;puntos+=pts;api.puntos(puntos);GS.sonar.captura();_flota(esc,cae.x,cae.y+(cae.y<H/2?34:-20),'+'+pts,'#ffe27a')}
            continue}
          trataPared(b);
        }
        for(let i=0;i<bolas.length;i++)for(let j=i+1;j<bolas.length;j++){
          const a=bolas[i],c=bolas[j];if(a.dentro||c.dentro)continue;
          let dx=c.x-a.x,dy=c.y-a.y,d=Math.hypot(dx,dy);if(d>=2*R||d===0)continue;
          const nx=dx/d,ny=dy/d,ov=2*R-d;a.x-=nx*ov/2;a.y-=ny*ov/2;c.x+=nx*ov/2;c.y+=ny*ov/2;
          const rv=(a.vx-c.vx)*nx+(a.vy-c.vy)*ny;
          if(rv>0){const j2=rv*.97;a.vx-=j2*nx;a.vy-=j2*ny;c.vx+=j2*nx;c.vy+=j2*ny;if(rv>60)GS.tono(420+Math.min(rv,500),.04,'triangle',.05)}
        }
      }
      /* guía: primer impacto de la blanca */
      function guiaCalc(){
        const dx=Math.cos(ang),dy=Math.sin(ang);let tmin=1e9,hit=null;
        for(const b of objetos()){const fx=b.x-blanca.x,fy=b.y-blanca.y,tp=fx*dx+fy*dy;if(tp<=0)continue;const d2=fx*fx+fy*fy-tp*tp,rr=(2*R)*(2*R);if(d2>rr)continue;const th=tp-Math.sqrt(rr-d2);if(th>0&&th<tmin){tmin=th;hit=b}}
        let tw=1e9;if(dx>0)tw=Math.min(tw,(X1-R-blanca.x)/dx);if(dx<0)tw=Math.min(tw,(X0+R-blanca.x)/dx);if(dy>0)tw=Math.min(tw,(Y1-R-blanca.y)/dy);if(dy<0)tw=Math.min(tw,(Y0+R-blanca.y)/dy);
        const t=Math.min(tmin,tw),ex=blanca.x+dx*t,ey=blanca.y+dy*t;
        lGuia.setAttribute('d',`M${blanca.x+dx*R} ${blanca.y+dy*R}L${ex} ${ey}`);fant.setAttribute('cx',ex);fant.setAttribute('cy',ey);
        if(hit&&tmin<=tw){const nx=hit.x-ex,ny=hit.y-ey,l=Math.hypot(nx,ny)||1;lRebote.setAttribute('d',`M${hit.x} ${hit.y}l${nx/l*46} ${ny/l*46}`)}else lRebote.setAttribute('d','');
      }
      _arrastre(esc,{
        abajo:p=>{if(estado!=='listo'||lp.pausado||!jugando)return;arrastrando=true;d0=p},
        mueve:(p)=>{if(!arrastrando||!d0)return;const pvx=d0.x-p.x,pvy=d0.y-p.y,l=Math.hypot(pvx,pvy);if(l<6)return;ang=Math.atan2(pvy,pvx);pw=Math.max(.04,Math.min(1,l/150))},
        arriba:(p,e,cancel)=>{if(!arrastrando)return;arrastrando=false;const l=d0?Math.hypot(d0.x-p.x,d0.y-p.y):0;d0=null;if(!cancel&&l>=14)golpea()}
      });
      const lp=GS.bucle(dt=>{
        if(!jugando||fin)return;
        if(estado==='listo'){
          if(ent.teclas.has('ArrowLeft'))ang-=1.5*dt;if(ent.teclas.has('ArrowRight'))ang+=1.5*dt;
          if(ent.teclas.has('ArrowUp'))pw=Math.min(1,pw+.7*dt);if(ent.teclas.has('ArrowDown'))pw=Math.max(.04,pw-.7*dt);
          const sp=ent.teclas.has('Space');if(sp&&!sp0)golpea();sp0=sp;
        }
        if(estado==='mov'){
          const N=8,h=dt/N;for(let i=0;i<N;i++)paso(h);
          let quieto=true;for(const b of bolas)if(!b.dentro&&(b.vx||b.vy)){quieto=false;break}
          if(quieto)estado='fin';
        }
        for(const b of bolas){
          if(b.dentro){
            if(b.anim<1){b.anim=Math.min(1,b.anim+dt*4);const e=b.anim;b.g.setAttribute('transform',`translate(${b.x+(b.tx-b.x)*e} ${b.y+(b.ty-b.y)*e}) scale(${1-e})`);if(b.anim>=1)b.g.setAttribute('display','none')}
            continue}
          b.g.setAttribute('transform',`translate(${b.x} ${b.y})`);
        }
        if(estado==='fin'){
          if(blanca.dentro)reponer();
          if(metidasTiro===0&&!rayada)racha=0;
          hud();
          if(!objetos().length)return termina(true);
          if(tiros<=0)return termina(false);
          estado='listo';
        }
        /* guía y taco */
        if(estado==='listo'&&!blanca.dentro){
          guia.setAttribute('display','inline');guiaCalc();
          const back=R+8+pw*70;taco.setAttribute('transform',`translate(${blanca.x-Math.cos(ang)*back} ${blanca.y-Math.sin(ang)*back}) rotate(${ang*180/Math.PI+180})`);
        }else{guia.setAttribute('display','none');taco.setAttribute('transform','translate(-999 -999)')}
      });
      GS.iniciaConToque(esc,ent,'',()=>{jugando=true});
      GS.pad(api,ent,[{k:'ArrowLeft',ico:'izq',etq:'Girar a la izquierda'},{k:'ArrowRight',ico:'der',etq:'Girar a la derecha'},{k:'ArrowUp',ico:'arriba',etq:'Más fuerza'},{k:'ArrowDown',ico:'abajo',etq:'Menos fuerza'},{k:'Space',ico:'fuego',etq:'Golpear'}]);
      api.botones([{txt:'Pausa',ico:'pausa',fn:()=>api.msg(lp.pausa()?'Pausa':'')}]);hud();
      return{destruir(){lp.parar();ent.destruir()},dbg:{golpear(a,p){ang=a;pw=p;golpea()},get estado(){return estado},get tiros(){return tiros},get bolas(){return bolas},get puntos(){return puntos},get objetos(){return objetos().length},blanca}};
    }
  });
}

/* 14) MINIGOLF */
function _corredor(pts,w){
  const h=w/2,L=[],Rr=[],dirs=[];
  for(let i=0;i<pts.length-1;i++){const dx=pts[i+1][0]-pts[i][0],dy=pts[i+1][1]-pts[i][1],l=Math.hypot(dx,dy);dirs.push([dx/l,dy/l])}
  for(let i=0;i<pts.length;i++){
    const dp=dirs[Math.max(0,i-1)],dn=dirs[Math.min(dirs.length-1,i)],np=[-dp[1],dp[0]],nn=[-dn[1],dn[0]],d=1+np[0]*nn[0]+np[1]*nn[1];
    const mx=(np[0]+nn[0])/d*h,my=(np[1]+nn[1])/d*h;L.push([pts[i][0]+mx,pts[i][1]+my]);Rr.push([pts[i][0]-mx,pts[i][1]-my]);
  }
  return L.concat(Rr.reverse());
}
function _enPoly(x,y,P){let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c}return c}
function _distSeg(px,py,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],l2=dx*dx+dy*dy;let t=l2?((px-a[0])*dx+(py-a[1])*dy)/l2:0;t=Math.max(0,Math.min(1,t));const qx=a[0]+t*dx,qy=a[1]+t*dy;return{d:Math.hypot(px-qx,py-qy),qx,qy}}
function _rectPoly(r){return[[r[0],r[1]],[r[0]+r[2],r[1]],[r[0]+r[2],r[1]+r[3]],[r[0],r[1]+r[3]]]}

function initMiniGolf(cont){
  const HOYOS=[
    {par:2,path:[[200,505],[200,55]],w:120,tee:[200,465],hoyo:[200,110],obs:[],arena:[],agua:[],bump:[]},
    {par:3,path:[[110,505],[110,150],[305,150]],w:90,tee:[110,465],hoyo:[290,150],obs:[],arena:[[70,300,80,50]],agua:[],bump:[]},
    {par:3,path:[[200,510],[200,55]],w:170,tee:[200,475],hoyo:[200,100],obs:[[115,320,95,22],[190,205,95,22]],arena:[],agua:[],bump:[]},
    {par:3,path:[[200,510],[200,55]],w:170,tee:[200,475],hoyo:[200,100],obs:[],arena:[],agua:[[115,250,105,90]],bump:[[165,170,15]]},
    {par:4,path:[[200,510],[200,45]],w:150,tee:[200,478],hoyo:[200,90],obs:[],arena:[],agua:[],bump:[],molino:{x:200,y:285,L:64}},
    {par:5,path:[[85,500],[315,500],[315,380],[85,380],[85,260],[315,260],[315,140]],w:80,tee:[100,500],hoyo:[315,170],obs:[],arena:[[160,470,60,60]],agua:[[190,345,50,50]],bump:[[200,260,13]]}
  ];
  return GS.crear(cont,{
    id:'minigolf',
    intro:'Arrastra hacia atrás desde cualquier punto (como una resortera): la bola sale en la dirección contraria y la fuerza depende de cuánto estires. Con teclado: ← → apuntan, ↑ ↓ cambian la fuerza y Espacio golpea. Evita el agua (+1 golpe), la arena frena la bola y los molinos hay que cruzarlos a tiempo. Termina todos los hoyos con pocos golpes.',
    niveles:[['1','Fácil','4 hoyos · margen amplio de golpes.'],['2','Medio','5 hoyos · con agua y molino.'],['3','Difícil','6 hoyos · molino veloz y poco margen.']],
    iniciar(api,nivel){
      const W=400,H=560,N=HOYOS_N(nivel),MARGEN={1:8,2:6,3:4}[nivel],CAPT={1:400,2:340,3:290}[nivel],OM={1:.9,2:1.35,3:1.9}[nivel],MAXG=9,R=7,HR=11;
      function HOYOS_N(n){return {1:4,2:5,3:6}[n]}
      const esc=GS.escena(api,{w:W,h:H,max:460,fondo:'#2c6b34',aria:'Minigolf'}),E=esc.el;
      const ent=GS.entrada(esc);
      E('defs').innerHTML=`<linearGradient id="mgCesped" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2e7d3a"/><stop offset="1" stop-color="#1f5a2a"/></linearGradient>
        <linearGradient id="mgPista" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4cc864"/><stop offset="1" stop-color="#2fa04a"/></linearGradient>
        <radialGradient id="mgBola" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff"/><stop offset=".7" stop-color="#e9edf2"/><stop offset="1" stop-color="#a8b3c2"/></radialGradient>`;
      E('rect',{width:W,height:H,fill:'url(#mgCesped)'});
      const mundo=E('g');
      let h=0,cur=null,seg=[],blades=null,bumps=[],aguas=[],arenas=[],poly=[],golpes=0,total=0,puntos=0,estado='listo',pw=.5,ang=-Math.PI/2,d0=null,arrastrando=false,espera=0,fin=false,jugando=false,t=0,sp0=false,last={x:0,y:0},B={x:0,y:0,vx:0,vy:0},animH=0,ballG,club,guiaG,flagG,molinoG,thetaM=0,cerrando=false,ultimoMsg='';
      const parTotal=HOYOS.slice(0,N).reduce((s,x)=>s+x.par,0);
      const hud=()=>api.estado(`<span>Hoyo ${h+1} / ${N}</span><span style="margin:0 10px">Golpes ${golpes} · Par ${cur?cur.par:0}</span><span>Total ${total}</span>`);
      function cargar(i){
        h=i;cur=HOYOS[i];golpes=0;estado='listo';animH=0;cerrando=false;
        poly=_corredor(cur.path,cur.w);
        seg=[];const push=(P)=>{for(let k=0;k<P.length;k++)seg.push([P[k],P[(k+1)%P.length]])};push(poly);
        cur.obs.forEach(r=>push(_rectPoly(r)));
        bumps=cur.bump.map(([x,y,r])=>({x,y,r}));aguas=cur.agua;arenas=cur.arena;
        const pts=poly.map(p=>p.join(',')).join(' ');
        let deco='';let s=i*977+13;const rnd=()=>{s=(s*16807)%2147483647;return s/2147483647};
        for(let k=0;k<46;k++){const x=rnd()*W,y=rnd()*H;if(_enPoly(x,y,poly))continue;let ok=true;for(const sg of seg){if(_distSeg(x,y,sg[0],sg[1]).d<22){ok=false;break}}if(!ok)continue;const r=7+rnd()*9;deco+=`<circle cx="${x+2}" cy="${y+3}" r="${r}" fill="#000" fill-opacity=".2"/><circle cx="${x}" cy="${y}" r="${r}" fill="${rnd()<.5?'#1c5a28':'#237033'}"/><circle cx="${x-r*.3}" cy="${y-r*.3}" r="${r*.45}" fill="#3a9a4c" fill-opacity=".7"/>${rnd()<.25?`<circle cx="${x+r*.2}" cy="${y+r*.1}" r="2" fill="#ffd54a"/>`:''}`}
        const id=_uid('mgp');
        let franjas='';for(let y=0;y<H;y+=28)franjas+=`<rect x="0" y="${y}" width="${W}" height="14" fill="#fff" fill-opacity=".07"/>`;
        let obsS=cur.obs.map(r=>`<rect x="${r[0]+2}" y="${r[1]+4}" width="${r[2]}" height="${r[3]}" rx="4" fill="#000" fill-opacity=".25"/><rect x="${r[0]}" y="${r[1]}" width="${r[2]}" height="${r[3]}" rx="4" fill="#c4975a" stroke="#6b431f" stroke-width="3"/><rect x="${r[0]+3}" y="${r[1]+3}" width="${r[2]-6}" height="4" rx="2" fill="#e8c48a"/>`).join('');
        let arS=arenas.map(r=>`<rect x="${r[0]}" y="${r[1]}" width="${r[2]}" height="${r[3]}" rx="${Math.min(r[2],r[3])*.4}" fill="#ecd9a2" stroke="#c9a85a" stroke-width="3"/>${Array.from({length:14},(_,k)=>`<circle cx="${r[0]+8+((k*37)%(r[2]-16))}" cy="${r[1]+6+((k*23)%(r[3]-12))}" r="1.500" fill="#c9a85a"/>`).join('')}`).join('');
        let agS=aguas.map(r=>`<rect x="${r[0]}" y="${r[1]}" width="${r[2]}" height="${r[3]}" rx="12" fill="#2d8fe0" stroke="#1b5fa8" stroke-width="3"/><path d="M${r[0]+8} ${r[1]+r[3]*.35}q8 -6 16 0t16 0t16 0M${r[0]+14} ${r[1]+r[3]*.7}q8 -6 16 0t16 0" stroke="#bfe6ff" stroke-width="2.500" fill="none" stroke-linecap="round"><animateTransform attributeName="transform" type="translate" values="0 0;6 0;0 0" dur="2.400s" repeatCount="indefinite"/></path>`).join('');
        let buS=bumps.map(b=>`<circle cx="${b.x+2}" cy="${b.y+3}" r="${b.r}" fill="#000" fill-opacity=".25"/><circle cx="${b.x}" cy="${b.y}" r="${b.r}" fill="#e8472f" stroke="#fff" stroke-width="3"/><circle cx="${b.x}" cy="${b.y}" r="${b.r*.45}" fill="#ff8a7a"/>`).join('');
        mundo.innerHTML=`${deco}<polygon points="${pts}" fill="none" stroke="#7a4d24" stroke-width="16" stroke-linejoin="round"/><polygon points="${pts}" fill="none" stroke="#a9733a" stroke-width="10" stroke-linejoin="round" transform="translate(0 0)"/><polygon points="${pts}" fill="url(#mgPista)"/><clipPath id="${id}"><polygon points="${pts}"/></clipPath><g clip-path="url(#${id})">${franjas}</g>${arS}${agS}<rect x="${cur.tee[0]-16}" y="${cur.tee[1]-8}" width="32" height="16" rx="8" fill="#1f7a36" fill-opacity=".6" stroke="#fff" stroke-opacity=".5" stroke-width="2"/>${obsS}${buS}`;
        /* hoyo */
        const [hx,hy]=cur.hoyo;const hg=GS.el('g',{},mundo);hg.innerHTML=`<circle cx="${hx}" cy="${hy}" r="${HR+4}" fill="#1f7a36" fill-opacity=".7"/><circle cx="${hx}" cy="${hy}" r="${HR+1}" fill="#222"/><circle cx="${hx}" cy="${hy}" r="${HR-2}" fill="#050505"/>`;
        ballG=GS.el('g',{},mundo);ballG.innerHTML=`<ellipse cx="2" cy="3" rx="${R}" ry="${R*.8}" fill="#000" fill-opacity=".28"/><circle r="${R}" fill="url(#mgBola)" stroke="#8793a5" stroke-width="1"/><circle cx="-2.200" cy="-2.400" r="1.800" fill="#fff"/>`;
        B.x=cur.tee[0];B.y=cur.tee[1];B.vx=B.vy=0;last={x:B.x,y:B.y};
        ang=Math.atan2(hy-B.y,hx-B.x);pw=.5;
        ballG.setAttribute('transform',`translate(${B.x} ${B.y})`);
        guiaG=GS.el('g',{},mundo);guiaG.innerHTML='<path class="gl" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="2 8" stroke-linecap="round" stroke-opacity=".9"/><path class="ga" fill="#fff" fill-opacity=".9"/>';
        club=GS.el('g',{},mundo);club.innerHTML=`<path d="M0 0L90 -2" stroke="#c8ced6" stroke-width="3.500" stroke-linecap="round"/><path d="M90 -2L150 -3" stroke="#2f2f3a" stroke-width="5" stroke-linecap="round"/><rect x="-4" y="-8" width="9" height="16" rx="2.500" fill="#e8472f" stroke="#8c2417" stroke-width="1.500"/>`;club.setAttribute('transform','translate(-999 -999)');
        if(cur.molino){const m=cur.molino;molinoG=GS.el('g',{},mundo);molinoG.innerHTML=`<g class="bl"><rect x="${-m.L}" y="-3.500" width="${m.L*2}" height="7" rx="3.500" fill="#fff" stroke="#b6bcc6" stroke-width="1.500"/><rect x="-3.500" y="${-m.L}" width="7" height="${m.L*2}" rx="3.500" fill="#fff" stroke="#b6bcc6" stroke-width="1.500"/>${[0,1,2,3].map(k=>`<rect x="${k%2?-3.500:(k===0?m.L-18:-m.L)}" y="${k%2?(k===1?m.L-18:-m.L):-3.500}" width="${k%2?7:18}" height="${k%2?18:7}" rx="3" fill="#e8472f"/>`).join('')}</g><circle r="10" fill="#e8472f" stroke="#fff" stroke-width="3"/><circle r="3.500" fill="#ffd54a"/>`;molinoG.setAttribute('transform',`translate(${m.x} ${m.y})`);blades=molinoG.querySelector('.bl')}else{molinoG=null;blades=null}
        flagG=GS.el('g',{},mundo);flagG.innerHTML=`<path d="M${hx} ${hy}V${hy-46}" stroke="#f1f1f1" stroke-width="3" stroke-linecap="round"/><path d="M${hx+1.500} ${hy-46}h24l-7 8 7 8h-24z" fill="#e8472f" stroke="#a52a1e" stroke-width="1.500" stroke-linejoin="round"/>`;
        thetaM=0;hud();api.msg(`Hoyo ${i+1} · Par ${cur.par}`);
      }
      function termina(){
        if(fin)return;fin=true;lp.parar();
        const gano=total<=parTotal+MARGEN;if(gano)puntos+=200*nivel;api.puntos(puntos);
        const dif=total-parTotal;const rel=dif===0?'par exacto':dif<0?`${-dif} bajo el par`:`${dif} sobre el par`;
        if(gano)api.fin({tipo:'gana',titulo:'¡Campeón del minigolf!',sub:`${total} golpes (${rel})`,puntos,det:`${N} hoyos completados`});
        else api.fin({tipo:'pierde',titulo:'Demasiados golpes',sub:`${total} golpes · el límite era ${parTotal+MARGEN}`,puntos,det:`${N} hoyos`});
      }
      function golpea(){
        if(estado!=='listo'||fin||!jugando)return;
        const v=70+pw*560;last={x:B.x,y:B.y};B.vx=Math.cos(ang)*v;B.vy=Math.sin(ang)*v;golpes++;total++;estado='mov';club.setAttribute('transform','translate(-999 -999)');GS.tono(320,.06,'triangle',.07,200);hud();
      }
      function colSeg(a,b,rad,e=.8){
        const q=_distSeg(B.x,B.y,a,b);if(q.d>=R+rad)return false;
        let nx=B.x-q.qx,ny=B.y-q.qy,d=q.d;if(d<1e-6){const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1;nx=-dy/l;ny=dx/l;d=1}else{nx/=d;ny/=d}
        B.x=q.qx+nx*(R+rad+.01);B.y=q.qy+ny*(R+rad+.01);const vn=B.vx*nx+B.vy*ny;if(vn<0){B.vx-=(1+e)*vn*nx;B.vy-=(1+e)*vn*ny;return Math.abs(vn)}return 0;
      }
      function paso(dt){
        const hx=cur.hoyo[0],hy=cur.hoyo[1];
        const sp0v=Math.hypot(B.vx,B.vy),n=Math.min(14,Math.max(4,Math.ceil(sp0v*dt/2.4))),hh=dt/n;
        for(let i=0;i<n&&estado==='mov';i++){
          const px=B.x,py=B.y;B.x+=B.vx*hh;B.y+=B.vy*hh;
          let k=.85;for(const r of arenas)if(B.x>r[0]&&B.x<r[0]+r[2]&&B.y>r[1]&&B.y<r[1]+r[3]){k=4.4;break}
          let s=Math.hypot(B.vx,B.vy);if(s>0){s=Math.max(0,s*Math.exp(-k*hh)-14*hh);const f=s/Math.hypot(B.vx,B.vy);B.vx*=f;B.vy*=f}
          let golpeFuerte=0;
          for(const sg of seg){const c=colSeg(sg[0],sg[1],0);if(c)golpeFuerte=Math.max(golpeFuerte,c)}
          for(const b of bumps){const dx=B.x-b.x,dy=B.y-b.y,d=Math.hypot(dx,dy);if(d<R+b.r&&d>0){const nx=dx/d,ny=dy/d;B.x=b.x+nx*(R+b.r+.01);B.y=b.y+ny*(R+b.r+.01);const vn=B.vx*nx+B.vy*ny;if(vn<0){B.vx-=2*vn*nx;B.vy-=2*vn*ny}const sp=Math.hypot(B.vx,B.vy),ns=Math.max(sp*1.08,170);B.vx*=ns/sp;B.vy*=ns/sp;GS.tono(520,.07,'square',.06,760)}}
          if(cur.molino){const m=cur.molino;for(let q=0;q<2;q++){const th=thetaM+q*Math.PI/2,ex=Math.cos(th)*m.L,ey=Math.sin(th)*m.L;colSeg([m.x-ex,m.y-ey],[m.x+ex,m.y+ey],3.500,.7)}const dx=B.x-m.x,dy=B.y-m.y,d=Math.hypot(dx,dy);if(d<R+10&&d>0){const nx=dx/d,ny=dy/d;B.x=m.x+nx*(R+10);B.y=m.y+ny*(R+10);const vn=B.vx*nx+B.vy*ny;if(vn<0){B.vx-=1.7*vn*nx;B.vy-=1.7*vn*ny}}}
          if(golpeFuerte>120)GS.tono(200,.04,'square',.04);
          /* red de seguridad: nunca salir del campo */
          if(!_enPoly(B.x,B.y,poly)){B.x=px;B.y=py;B.vx=-B.vx*.5;B.vy=-B.vy*.5}
          for(const o of cur.obs)if(B.x>o[0]-R*.2&&B.x<o[0]+o[2]+R*.2&&B.y>o[1]-R*.2&&B.y<o[1]+o[3]+R*.2){B.x=px;B.y=py;B.vx=-B.vx*.5;B.vy=-B.vy*.5}
          /* agua */
          for(const r of aguas)if(B.x>r[0]&&B.x<r[0]+r[2]&&B.y>r[1]&&B.y<r[1]+r[3]){GS.destello(esc,B.x,B.y,'#7cc4ff',26);GS.tono(260,.2,'sine',.08,90);_flota(esc,B.x,B.y-12,'¡Al agua! +1','#9fd4ff');B.x=last.x;B.y=last.y;B.vx=B.vy=0;golpes++;total++;estado='listo';hud();ballG.setAttribute('transform',`translate(${B.x} ${B.y})`);return}
          /* hoyo */
          const dh=Math.hypot(B.x-hx,B.y-hy),sp=Math.hypot(B.vx,B.vy);
          if(dh<HR-1&&sp<CAPT||dh<5){estado='hoyo';animH=0;B.vx=B.vy=0;GS.sonar.gana();return}
          if(dh<HR+8&&sp<CAPT*.5&&sp>0){const pull=60*hh/Math.max(dh,3);B.vx+=(hx-B.x)*pull;B.vy+=(hy-B.y)*pull}
          if(sp<8){B.vx=B.vy=0;estado='listo'}
        }
      }
      function nombre(g,par){return g===1?'¡Hoyo en uno!':g-par<=-2?'¡Águila!':g-par===-1?'¡Birdie!':g===par?'Par':g-par===1?'Bogey':`+${g-par}`}
      _arrastre(esc,{
        abajo:p=>{if(estado!=='listo'||lp.pausado||!jugando)return;arrastrando=true;d0=p},
        mueve:(p)=>{if(!arrastrando||!d0)return;const pvx=d0.x-p.x,pvy=d0.y-p.y,l=Math.hypot(pvx,pvy);if(l<6)return;ang=Math.atan2(pvy,pvx);pw=Math.max(.04,Math.min(1,l/140))},
        arriba:(p,e,cancel)=>{if(!arrastrando)return;arrastrando=false;const l=d0?Math.hypot(d0.x-p.x,d0.y-p.y):0;d0=null;if(!cancel&&l>=14)golpea()}
      });
      const lp=GS.bucle(dt=>{
        if(!jugando||fin)return;
        t+=dt;
        if(cur.molino){thetaM+=OM*dt;blades.setAttribute('transform',`rotate(${thetaM*180/Math.PI})`)}
        if(estado==='listo'){
          if(ent.teclas.has('ArrowLeft'))ang-=1.4*dt;if(ent.teclas.has('ArrowRight'))ang+=1.4*dt;
          if(ent.teclas.has('ArrowUp'))pw=Math.min(1,pw+.7*dt);if(ent.teclas.has('ArrowDown'))pw=Math.max(.04,pw-.7*dt);
          const sp=ent.teclas.has('Space');if(sp&&!sp0)golpea();sp0=sp;
        }
        if(estado==='mov'){paso(dt);if(golpes>=MAXG&&estado==='listo'){estado='hoyo';animH=-1}}
        if(estado==='hoyo'){
          if(animH>=0&&animH<1){animH=Math.min(1,animH+dt*3.2);const e=animH;ballG.setAttribute('transform',`translate(${B.x+(cur.hoyo[0]-B.x)*e} ${B.y+(cur.hoyo[1]-B.y)*e}) scale(${1-e*.85})`);ballG.setAttribute('opacity',1-e*.6)}
          if(!cerrando){cerrando=true;espera=1.5;
            const g=animH<0?MAXG:golpes;if(animH<0){golpes=MAXG;ballG.setAttribute('display','none')}
            const pts=animH<0?0:Math.max(0,(cur.par+4-g))*100+(g===1?300:0);puntos+=pts;api.puntos(puntos);
            _flota(esc,cur.hoyo[0],cur.hoyo[1]-58,animH<0?'Límite de golpes':nombre(g,cur.par)+(pts?' +'+pts:''),'#ffe27a');api.msg(animH<0?'Límite de golpes':nombre(g,cur.par));hud()}
          espera-=dt;if(espera<=0){if(h+1>=N)termina();else cargar(h+1)}
        }
        if(estado==='mov'||estado==='listo')ballG.setAttribute('transform',`translate(${B.x} ${B.y})`);
        /* guía y palo */
        const gl=guiaG.querySelector('.gl'),ga=guiaG.querySelector('.ga');
        if(estado==='listo'){
          const L=26+pw*120,cx=Math.cos(ang),cy=Math.sin(ang),ex=B.x+cx*L,ey=B.y+cy*L;
          gl.setAttribute('d',`M${B.x+cx*(R+4)} ${B.y+cy*(R+4)}L${ex} ${ey}`);
          ga.setAttribute('d',`M${ex+cx*10} ${ey+cy*10}L${ex-cy*7} ${ey+cx*7}L${ex+cy*7} ${ey-cx*7}z`);
          const back=R+6+pw*40;club.setAttribute('transform',`translate(${B.x-cx*back} ${B.y-cy*back}) rotate(${ang*180/Math.PI+180})`);
        }else{gl.setAttribute('d','');ga.setAttribute('d','');club.setAttribute('transform','translate(-999 -999)')}
      });
      GS.iniciaConToque(esc,ent,'',()=>{jugando=true});
      GS.pad(api,ent,[{k:'ArrowLeft',ico:'izq',etq:'Girar a la izquierda'},{k:'ArrowRight',ico:'der',etq:'Girar a la derecha'},{k:'ArrowUp',ico:'arriba',etq:'Más fuerza'},{k:'ArrowDown',ico:'abajo',etq:'Menos fuerza'},{k:'Space',ico:'fuego',etq:'Golpear'}]);
      api.botones([{txt:'Pausa',ico:'pausa',fn:()=>api.msg(lp.pausa()?'Pausa':'')}]);
      cargar(0);
      return{destruir(){lp.parar();ent.destruir()},dbg:{golpear(a,p){ang=a;pw=p;golpea()},get estado(){return estado},get golpes(){return golpes},get total(){return total},get hoyo(){return h},get B(){return B},get puntos(){return puntos},meter(){B.x=cur.hoyo[0];B.y=cur.hoyo[1]+3;B.vx=B.vy=0;estado='mov';paso(.016)},get cur(){return cur}}};
    }
  });
}

/* 15) EQUILIBRIO DE TORRE */
function initTowerBalance(cont){
  return GS.crear(cont,{
    id:'torre',
    intro:'Los bloques cuelgan de la grúa y se balancean. Toca la pantalla, pulsa Espacio o ↓ para soltarlos justo sobre la torre. Si un bloque queda demasiado volado, el peso de lo que hay encima lo hará caer: ¡la torre se derrumba! Centrar un bloque (perfecto) da puntos extra y rachas. Si fallas la torre 3 veces pierdes. Construye la altura meta.',
    niveles:[['1','Fácil','12 bloques · bloques anchos · sin viento.'],['2','Medio','18 bloques · algo de viento.'],['3','Difícil','25 bloques · bloques angostos y viento fuerte.']],
    iniciar(api,nivel){
      const W=400,H=560,BH=30,GROUND=500,BASEX=200,BASEW=210,META={1:12,2:18,3:25}[nivel],RW={1:[96,140],2:[78,128],3:[62,116]}[nivel],VIENTO={1:0,2:20,3:38}[nivel];
      const esc=GS.escena(api,{w:W,h:H,max:460,fondo:'#8ccdf0',aria:'Equilibrio de torre'}),E=esc.el;
      const ent=GS.entrada(esc);
      E('defs').innerHTML=`<linearGradient id="trCielo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4fb0ea"/><stop offset=".7" stop-color="#c3e9fb"/><stop offset="1" stop-color="#fff1d2"/></linearGradient>
        <radialGradient id="trSol"><stop offset="0" stop-color="#fffbe0"/><stop offset=".5" stop-color="#ffe27a"/><stop offset="1" stop-color="#ffe27a" stop-opacity="0"/></radialGradient>
        <linearGradient id="trLadrillo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2735a"/><stop offset="1" stop-color="#b8472f"/></linearGradient>
        <linearGradient id="trMadera" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e0b378"/><stop offset="1" stop-color="#b98650"/></linearGradient>
        <linearGradient id="trPiedra" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b4bac2"/><stop offset="1" stop-color="#868d97"/></linearGradient>
        <linearGradient id="trMetal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6c97e0"/><stop offset="1" stop-color="#3f68b8"/></linearGradient>
        <linearGradient id="trHierba" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6cc552"/><stop offset="1" stop-color="#3f9a36"/></linearGradient>`;
      E('rect',{width:W,height:H,fill:'url(#trCielo)'});E('circle',{cx:330,cy:90,r:70,fill:'url(#trSol)'});E('circle',{cx:330,cy:90,r:26,fill:'#ffe27a'});
      const nubes=E('g');for(let i=0;i<5;i++){const g=E('g',{},nubes);g.dataset.x=i*100+GS.rand(0,40);g.dataset.y=60+i*70+GS.rand(-10,10);g.dataset.v=GS.rand(4,10);g.innerHTML='<ellipse cx="0" cy="4" rx="36" ry="11" fill="#fff" fill-opacity=".95"/><ellipse cx="-12" cy="-5" rx="17" ry="12" fill="#fff"/><ellipse cx="12" cy="-8" rx="21" ry="14" fill="#fff"/>'}
      const ciudad=E('g');let edif='';for(let i=0;i<12;i++){const x=i*38-10,hh=70+((i*53)%90);edif+=`<rect x="${x}" y="${GROUND-hh}" width="30" height="${hh+200}" fill="${i%2?'#9db3cf':'#8ea7c6'}"/>${Array.from({length:Math.floor(hh/18)},(_,k)=>`<rect x="${x+6}" y="${GROUND-hh+8+k*18}" width="6" height="8" fill="#e8f2ff" fill-opacity=".7"/><rect x="${x+17}" y="${GROUND-hh+8+k*18}" width="6" height="8" fill="#e8f2ff" fill-opacity=".7"/>`).join('')}`}ciudad.innerHTML=edif;
      const mundoG=E('g');
      /* suelo y pedestal (coordenadas del mundo) */
      mundoG.innerHTML=`<rect x="-100" y="${GROUND+12}" width="${W+200}" height="900" fill="url(#trHierba)"/><rect x="-100" y="${GROUND+12}" width="${W+200}" height="8" fill="#82d86a"/>${Array.from({length:18},(_,i)=>`<path d="M${i*26-8} ${GROUND+12}l-3 -7M${i*26-4} ${GROUND+12}l1 -9M${i*26} ${GROUND+12}l4 -6" stroke="#4aa83c" stroke-width="2.200" stroke-linecap="round"/>`).join('')}
        <rect x="${BASEX-BASEW/2-8}" y="${GROUND}" width="${BASEW+16}" height="16" rx="5" fill="#6b727c" stroke="#3f454d" stroke-width="2.500"/><rect x="${BASEX-BASEW/2}" y="${GROUND+14}" width="${BASEW}" height="${40}" fill="url(#trPiedra)" stroke="#5a6068" stroke-width="2.500"/>${Array.from({length:6},(_,i)=>`<path d="M${BASEX-BASEW/2+i*BASEW/6} ${GROUND+14}V${GROUND+54}" stroke="#5a6068" stroke-opacity=".5" stroke-width="2"/>`).join('')}<rect x="${BASEX-BASEW/2-8}" y="${GROUND}" width="${BASEW+16}" height="4" rx="2" fill="#fff" fill-opacity=".4"/>`;
      const capaT=GS.el('g',{},mundoG),capaF=GS.el('g',{},mundoG);
      /* grúa (pantalla) */
      const grua=E('g');grua.innerHTML=`<rect x="20" y="14" width="360" height="12" rx="4" fill="#f2c230" stroke="#b88700" stroke-width="2.500"/>${Array.from({length:18},(_,i)=>`<path d="M${24+i*20} 26l10 -12" stroke="#b88700" stroke-width="2"/>`).join('')}<rect x="12" y="8" width="16" height="60" rx="3" fill="#7d8a96"/><rect x="372" y="8" width="16" height="60" rx="3" fill="#7d8a96"/>`;
      const cuerda=E('path',{stroke:'#4a3a2a','stroke-width':3,fill:'none','stroke-linecap':'round'}),colgante=E('g');
      /* bloque que cuelga / cae */
      const KINDS=['ladrillo','madera','piedra','metal'];
      function bloqueSVG(w,kind){
        const x=-w/2,y=-BH/2,det=[];
        const fill={ladrillo:'url(#trLadrillo)',madera:'url(#trMadera)',piedra:'url(#trPiedra)',metal:'url(#trMetal)'}[kind],stroke={ladrillo:'#7a2c1b',madera:'#7a5230',piedra:'#555c66',metal:'#243f7a'}[kind];
        if(kind==='ladrillo'){det.push(`<path d="M${x} ${y+BH/2}H${x+w}" stroke="${stroke}" stroke-opacity=".55" stroke-width="2"/>`);for(let px=x+22;px<x+w-6;px+=34)det.push(`<path d="M${px} ${y}V${y+BH/2}" stroke="${stroke}" stroke-opacity=".55" stroke-width="2"/>`);for(let px=x+5;px<x+w-6;px+=34)det.push(`<path d="M${px} ${y+BH/2}V${y+BH}" stroke="${stroke}" stroke-opacity=".55" stroke-width="2"/>`)}
        if(kind==='madera'){for(let k=1;k<4;k++)det.push(`<path d="M${x+6} ${y+k*BH/4}Q${x+w*.3} ${y+k*BH/4-2} ${x+w*.5} ${y+k*BH/4}T${x+w-6} ${y+k*BH/4}" stroke="${stroke}" stroke-opacity=".45" stroke-width="1.600" fill="none"/>`);det.push(`<ellipse cx="${x+w*.28}" cy="${y+BH*.5}" rx="4.500" ry="3" fill="none" stroke="${stroke}" stroke-opacity=".55" stroke-width="1.600"/><path d="M${x+w*.62} ${y} V${y+BH}" stroke="${stroke}" stroke-opacity=".5" stroke-width="2"/>`)}
        if(kind==='piedra'){det.push(`<path d="M${x+w*.2} ${y} l6 9 -4 8 5 9M${x+w*.7} ${y+BH} l-5 -8 6 -7 -3 -8" stroke="${stroke}" stroke-opacity=".7" stroke-width="1.800" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);for(let k=0;k<5;k++)det.push(`<circle cx="${x+10+((k*41)%(w-20))}" cy="${y+6+((k*17)%(BH-12))}" r="1.600" fill="${stroke}" fill-opacity=".5"/>`)}
        if(kind==='metal'){for(let k=0;k<Math.floor(w/22);k++)det.push(`<path d="M${x+8+k*22} ${y+BH}l12 -${BH}" stroke="#f2c230" stroke-opacity=".55" stroke-width="5"/>`);det.push(`<circle cx="${x+7}" cy="${y+7}" r="2.600" fill="#dfe8fb"/><circle cx="${x+w-7}" cy="${y+7}" r="2.600" fill="#dfe8fb"/><circle cx="${x+7}" cy="${y+BH-7}" r="2.600" fill="#dfe8fb"/><circle cx="${x+w-7}" cy="${y+BH-7}" r="2.600" fill="#dfe8fb"/>`)}
        const id=_uid('trc');
        return `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${BH}" rx="4"/></clipPath><rect x="${x}" y="${y}" width="${w}" height="${BH}" rx="4" fill="${fill}"/><g clip-path="url(#${id})">${det.join('')}</g><rect x="${x}" y="${y}" width="${w}" height="${BH}" rx="4" fill="none" stroke="${stroke}" stroke-width="2.600"/><rect x="${x+3}" y="${y+2.500}" width="${w-6}" height="4" rx="2" fill="#fff" fill-opacity=".35"/>`;
      }
      /* ---------- estado ---------- */
      const tower=[];let cam=0,camT=0,t=0,vidas=3,puntos=0,racha=0,estado='cuelga',espera=0,fin=false,jugando=false,viento=0,cur=null,caida=null,riesgo=0,colapso=null,gTimer=0,aviso='',sp0=false,mis=0;
      const hud=()=>api.estado(`${GS.corazones(vidas,3)}<span style="margin:0 10px">Bloques ${tower.length} / ${META}</span><span>Racha ${racha}</span>`);
      const viW=E('g');viW.innerHTML='<text x="14" y="104" font-family="Nunito,Arial,sans-serif" font-size="12" font-weight="900" fill="#31506b">Viento</text><path class="vf" d="" stroke="#31506b" stroke-width="3" stroke-linecap="round" fill="none"/><path class="vp" d="" fill="#31506b"/>';
      const vf=viW.querySelector('.vf'),vp=viW.querySelector('.vp');
      function nuevoBloque(){
        const w=Math.round(GS.rand(RW[0],RW[1])),kind=KINDS[tower.length%4];
        cur={w,kind,rot:0};colgante.innerHTML=`<path d="M0 ${-BH/2-14}L${-w*.32} ${-BH/2}M0 ${-BH/2-14}L${w*.32} ${-BH/2}" stroke="#4a3a2a" stroke-width="2.500" stroke-linecap="round"/><circle cy="${-BH/2-14}" r="5.500" fill="#f2c230" stroke="#b88700" stroke-width="2"/>`+bloqueSVG(w,kind);
        viento=VIENTO?Math.round(GS.rand(-VIENTO,VIENTO)):0;
        const ln=Math.abs(viento)*.9,dir=viento<0?-1:1;
        vf.setAttribute('d',viento?`M60 98h${dir*ln}`:'M60 98h0');vp.setAttribute('d',viento?`M${60+dir*ln+dir*8} 98l${-dir*9} -6v12z`:'');
        viW.setAttribute('display',VIENTO?'inline':'none');
        estado='cuelga';colgante.setAttribute('display','inline');
      }
      /* posición del gancho */
      const AMP=.82,LONG=126;
      const gancho=tt=>{const w=1.5+Math.min(tower.length,20)*.07,a=AMP*Math.sin(tt*w);return{a,x:200+Math.sin(a)*LONG,y:30+Math.cos(a)*LONG*.97}};
      function estabilidad(){
        const n=tower.length;let riesgoM=0,falla=-1;
        for(let i=n-1;i>=0;i--){
          let m=0,mx=0;for(let j=i;j<n;j++){m+=tower[j].w;mx+=tower[j].w*tower[j].x}const com=mx/m;
          const b=tower[i],s=i===0?{x:BASEX,w:BASEW}:tower[i-1];
          const l=Math.max(b.x-b.w/2,s.x-s.w/2),r=Math.min(b.x+b.w/2,s.x+s.w/2),mid=(l+r)/2,half=Math.max(1,(r-l)/2);
          const q=Math.abs(com-mid)/half;if(q>riesgoM)riesgoM=q;if(q>1&&falla<0)falla=i;
        }
        return{riesgo:riesgoM,falla};
      }
      function suelta(){
        if(estado!=='cuelga'||fin||!jugando||lp.pausado)return;
        const g=gancho(t),cy=g.y+14+BH/2-cam;
        caida={x:g.x,cy,vy:0,vx:viento,w:cur.w,kind:cur.kind,g:GS.el('g',{},capaF)};
        caida.g.innerHTML=bloqueSVG(cur.w,cur.kind);caida.g.setAttribute('transform',`translate(${caida.x} ${caida.cy})`);
        colgante.setAttribute('display','none');estado='cae';GS.tono(300,.08,'triangle',.05,200);
      }
      function aterriza(){
        const n=tower.length,sup=n?tower[n-1]:{x:BASEX,w:BASEW},surf=GROUND-n*BH;
        const ov=Math.min(caida.x+caida.w/2,sup.x+sup.w/2)-Math.max(caida.x-caida.w/2,sup.x-sup.w/2);
        if(ov<=6)return false;
        let x=caida.x,perfecto=false;if(Math.abs(x-sup.x)<=5){x=sup.x;perfecto=true}
        caida.g.remove();
        const g=GS.el('g',{},capaT);g.innerHTML=bloqueSVG(caida.w,caida.kind);
        const b={x,w:caida.w,g,kind:caida.kind,off:0};tower.push(b);g.setAttribute('transform',`translate(${x} ${surf-BH/2})`);
        let pts=100;
        if(perfecto){racha++;pts+=50*Math.min(racha,5);GS.destello(esc,x,surf-BH/2+cam,'#ffe27a',40);_flota(esc,x,surf-BH-14+cam,'¡Perfecto! +'+pts,'#ffe27a');GS.sonar.captura()}
        else{racha=0;_flota(esc,x,surf-BH-14+cam,'+'+pts,'#fff');GS.tono(200,.08,'square',.08,120)}
        puntos+=pts;api.puntos(puntos);
        const st=estabilidad();riesgo=st.riesgo;
        if(st.falla>=0){derrumba(st.falla);return true}
        if(tower.length>=META){estado='gana';espera=1.4;GS.sonar.gana();for(let k=0;k<4;k++)setTimeout(()=>{if(!fin)GS.destello(esc,GS.rand(80,320),GS.rand(120,300),GS.pick(['#ffe27a','#ff8fab','#7ee081','#7cc4ff']),50)},k*220);hud();return true}
        hud();estado='espera';espera=.45;return true;
      }
      function derrumba(i){
        estado='colapso';espera=2;GS.sonar.pierde();api.msg('¡La torre se derrumba!');
        colapso=[];const dir=GS.pick([-1,1]);
        for(let j=i;j<tower.length;j++){const b=tower[j];colapso.push({b,y:GROUND-(j+.5)*BH,vx:dir*GS.rand(40,120)*(1+(j-i)*.15),vy:-GS.rand(0,120),rot:0,vr:dir*GS.rand(60,260)})}
      }
      function termina(gano){
        if(fin)return;fin=true;lp.parar();
        if(gano){puntos+=150*nivel+vidas*100;api.puntos(puntos);api.fin({tipo:'gana',titulo:'¡Torre completa!',sub:`${META} bloques en equilibrio`,puntos,det:`${vidas} vidas sobrantes`})}
        else api.fin({tipo:'pierde',titulo:vidas<=0?'Demasiados fallos':'La torre se derrumbó',sub:`colocaste ${tower.length} bloques`,puntos,det:`meta: ${META} bloques`});
      }
      ent.on('abajo',()=>suelta());
      ent.on('tecla',k=>{if(k==='Space'||k==='ArrowDown')suelta()});
      const lp=GS.bucle(dt=>{
        if(!jugando||fin)return;
        t+=dt;
        /* cámara */
        camT=Math.max(0,260-(GROUND-tower.length*BH));cam+=(camT-cam)*Math.min(1,3.5*dt);
        mundoG.setAttribute('transform',`translate(0 ${cam})`);ciudad.setAttribute('transform',`translate(0 ${cam*.35})`);
        nubes.childNodes.forEach(n=>{let x=+n.dataset.x+ +n.dataset.v*dt;if(x>W+60)x=-60;n.dataset.x=x;n.setAttribute('transform',`translate(${x} ${+n.dataset.y+cam*.18})`)});
        /* grúa y bloque colgante */
        const g=gancho(t);
        cuerda.setAttribute('d',`M200 26L${g.x} ${g.y}`);
        if(estado==='cuelga'){colgante.setAttribute('transform',`translate(${g.x} ${g.y+14+BH/2}) rotate(${g.a*9})`)}
        /* bloque cayendo */
        if(estado==='cae'&&caida){
          const n=tower.length,surf=GROUND-n*BH;const prevB=caida.cy+BH/2;
          caida.vy+=1500*dt;caida.cy+=caida.vy*dt;caida.x+=caida.vx*dt;
          const bot=caida.cy+BH/2;
          if(prevB<=surf&&bot>=surf){
            if(aterriza()){caida=null}
            else{caida.pasando=true}
          }
          if(caida){caida.g.setAttribute('transform',`translate(${caida.x} ${caida.cy})`);
            if(caida.cy>GROUND+300){caida.g.remove();caida=null;vidas--;racha=0;GS.sonar.pierde();hud();if(vidas<=0){fin=true;lp.parar();api.fin({tipo:'pierde',titulo:'Demasiados fallos',sub:`llegaste a ${tower.length} bloques`,puntos,det:`meta: ${META} bloques`});return}estado='espera';espera=.5}}
        }
        if(estado==='espera'){espera-=dt;if(espera<=0)nuevoBloque()}
        if(estado==='gana'){espera-=dt;if(espera<=0)return termina(true)}
        if(estado==='colapso'){
          for(const c of colapso){c.vy+=1400*dt;c.y+=c.vy*dt;c.b.x+=c.vx*dt;c.rot+=c.vr*dt;c.b.g.setAttribute('transform',`translate(${c.b.x} ${c.y}) rotate(${c.rot})`)}
          espera-=dt;if(espera<=0)return termina(false);
        }
        /* tambaleo visual de una torre al límite */
        if(estado!=='colapso'&&tower.length){
          const amp=riesgo>.6?Math.min(3,(riesgo-.6)/.4*3):0,n=tower.length;
          tower.forEach((b,i)=>{b.g.setAttribute('transform',`translate(${b.x+Math.sin(t*10+i*.4)*amp*(i/n)} ${GROUND-(i+.5)*BH})`)});
          const a=riesgo>.8?'¡Cuidado, la torre se tambalea!':'';if(a!==aviso){aviso=a;api.msg(a)}
        }
      });
      GS.iniciaConToque(esc,ent,'',()=>{jugando=true});
      GS.pad(api,ent,[{k:'Space',ico:'abajo',etq:'Soltar bloque',txt:' Soltar'}]);
      api.botones([{txt:'Pausa',ico:'pausa',fn:()=>api.msg(lp.pausa()?'Pausa':'')}]);
      nuevoBloque();hud();
      return{destruir(){lp.parar();ent.destruir()},dbg:{soltar:suelta,get estado(){return estado},get torre(){return tower},get vidas(){return vidas},get puntos(){return puntos},get cam(){return cam},get x(){return gancho(t).x},get cur(){return cur},tower,BASEX}};
    }
  });
}

/* =====================================================================
   juegos-mesa-b.js · Nim, Batalla Naval, Laberinto, Torres de colores, Nimble
   Uso:  initNim(document.getElementById('game-container'))
   ===================================================================== */

/* ---------------------------------------------------------------------
   6) NIM
   --------------------------------------------------------------------- */
function initNim(cont){
  const xor=a=>a.reduce((x,y)=>x^y,0);
  function posicion(nivel,humEmpieza){ // siempre se puede ganar con juego perfecto: si empiezas tú la suma nim es distinta de 0; si empieza la IA, es 0
    const fijos={'1':{h:[3,4,5],i:[3,4,7]},'2':{h:[1,3,5,8],i:[1,3,5,7]}};
    if(fijos[nivel])return fijos[nivel][humEmpieza?'h':'i'].slice();
    for(;;){const p=Array.from({length:5},()=>GS.rnd(2,9));const x=xor(p);if(humEmpieza?x!==0:x===0)return p}
  }
  function mejorJugada(p){ // devuelve [pila, cantidad]
    const x=xor(p);
    if(x!==0){for(let i=0;i<p.length;i++){const t=p[i]^x;if(t<p[i])return[i,p[i]-t]}}
    const L=p.map((v,i)=>v?i:-1).filter(i=>i>=0);const i=GS.pick(L);return[i,1];
  }
  return GS.crear(cont,{
    id:'nim',
    intro:'Hay varios montones de piedras. En tu turno elige un montón y retira cuantas piedras quieras de él (al menos una). Quien retire la última piedra gana: el rival se queda sin movimientos. Toca una piedra para elegir esa y todas las de arriba.',
    niveles:[['1','Fácil','3 montones. La computadora se equivoca seguido.'],['2','Medio','4 montones. La computadora acierta casi siempre.'],['3','Difícil','5 montones. La computadora no falla.']],
    opciones:[{k:'quien',t:'¿Quién empieza?',v:[['yo','Yo'],['ia','La computadora']],d:'yo'}],
    iniciar(api,nivel,opc){
      const hum=opc.quien==='yo';let p=posicion(nivel,hum),turno=hum?'h':'i',sel=null,jug=0,fin=false,bloq=false,pistas=0,pista=null;
      const probOptima={1:.3,2:.72,3:1}[nivel],ini=p.slice();
      const COLS=['#e8472f','#2f7fd1','#43a047','#f2b84b','#8e24aa'];
      api.area.innerHTML=`<svg class="gm-svg" id="nm" viewBox="0 0 ${Math.max(300,p.length*110)} 330" style="max-width:${Math.max(380,p.length*110)}px" role="application" aria-label="Montones de piedras"></svg>`;
      const svgEl=api.area.querySelector('#nm');
      const estado=()=>api.estado(fin?'':(turno==='h'?`<span class="ic">${GS.ICO.persona}</span><span>Tu turno · elige piedras${sel?` · retirar <b>${sel.n}</b>`:''}</span>`:`<span class="ic">${GS.ICO.robot}</span>La computadora piensa…`));
      function pintar(){
        const W=Math.max(300,p.length*110);let h=`<rect width="${W}" height="330" rx="18" fill="#fff6e6"/>`;
        p.forEach((c,i)=>{const cx=(i+.5)*(W/p.length);
          h+=`<rect x="${cx-42}" y="272" width="84" height="12" rx="6" fill="#8b5a2b"/>`;
          for(let k=0;k<c;k++){const y=252-k*24;const s=sel&&sel.i===i&&k>=c-sel.n,ps=pista&&pista[0]===i&&k>=c-pista[1];
            h+=`<g class="nm-p" data-i="${i}" data-k="${k}" style="cursor:pointer"><ellipse cx="${cx}" cy="${y+3}" rx="30" ry="12" fill="rgba(0,0,0,.2)"/><ellipse cx="${cx}" cy="${y}" rx="30" ry="12" fill="${COLS[i%5]}" stroke="${s?'#2e8b3a':ps?'#2e8b3a':'rgba(0,0,0,.3)'}" stroke-width="${s||ps?5:2}" ${ps&&!s?'stroke-dasharray="6 4"':''}/><ellipse cx="${cx-8}" cy="${y-3}" rx="9" ry="3.500" fill="#fff" fill-opacity=".35"/></g>`}
          h+=`<text x="${cx}" y="312" text-anchor="middle" font-family="Nunito,Arial,sans-serif" font-weight="800" font-size="17" fill="#6b4a3a">${c}</text>`});
        svgEl.innerHTML=h;
      }
      function retira(i,n,quien){
        p[i]-=n;sel=null;pista=null;GS.sonar.captura();pintar();
        if(quien==='h'){jug++;api.puntos(jug*5)}
        if(p.every(x=>x===0)){fin=true;bloq=true;estado();
          if(quien==='h')api.fin({tipo:'gana',titulo:'¡Ganaste!',sub:'retiraste la última piedra',puntos:150*nivel+100-pistas*40+Math.max(0,20-jug)*5,det:`${jug} jugadas · ${pistas} pistas`});
          else api.fin({tipo:'pierde',titulo:'Ganó la computadora',sub:'Retiró la última piedra',puntos:jug*5,det:`${jug} jugadas`});
          return}
        turno=quien==='h'?'i':'h';estado();if(turno==='i')turnoIA();
      }
      async function turnoIA(){bloq=true;await GS.wait(700);if(fin)return;let m=Math.random()<probOptima?mejorJugada(p):null;
        if(!m){const L=p.map((v,i)=>v?i:-1).filter(i=>i>=0),i=GS.pick(L);m=[i,GS.rnd(1,p[i])]}
        retira(m[0],m[1],'i');if(!fin)bloq=false}
      svgEl.addEventListener('click',e=>{if(fin||bloq||turno!=='h')return;const g=e.target.closest('.nm-p');if(!g)return;const i=+g.dataset.i,k=+g.dataset.k,n=p[i]-k;pista=null;
        if(sel&&sel.i===i&&sel.n===n){retira(i,n,'h');return}sel={i,n};GS.tono(520,.05);pintar();estado()});
      api.botones([
        {txt:'Retirar',ico:'flecha',id:'nmOk',fn:()=>{if(fin||bloq||turno!=='h')return;if(!sel){GS.sonar.error();api.msg('Primero toca las piedras que quieres retirar.');setTimeout(()=>api.msg(''),1500);return}retira(sel.i,sel.n,'h')}},
        {txt:'Pista',ico:'pista',fn:()=>{if(fin||bloq||turno!=='h')return;const m=mejorJugada(p);pista=m;pistas++;sel=null;pintar();setTimeout(()=>{pista=null;if(!fin)pintar()},2500)}}
      ]);
      pintar();estado();if(turno==='i')turnoIA();
      return{montones:()=>p.slice(),mejorJugada};
    }
  });
}

/* ---------------------------------------------------------------------
   7) BATALLA NAVAL
   --------------------------------------------------------------------- */
function initBattleship(cont){
  const NOMBRES={5:'Portaaviones',4:'Acorazado',3:'Crucero',2:'Destructor'};
  function nuevaFlota(N,largos){return{N,naves:largos.map((L,i)=>({id:i,L,celdas:[],hundido:false})),tab:Array(N*N).fill(-1)}}
  function cabe(f,L,r,c,h){for(let k=0;k<L;k++){const rr=r+(h?0:k),cc=c+(h?k:0);if(rr>=f.N||cc>=f.N||f.tab[rr*f.N+cc]!==-1)return false}return true}
  function coloca(f,nave,r,c,h){nave.celdas=[];nave.h=h;for(let k=0;k<nave.L;k++){const i=(r+(h?0:k))*f.N+(c+(h?k:0));f.tab[i]=nave.id;nave.celdas.push(i)}}
  function aleatoria(f){f.tab.fill(-1);f.naves.forEach(n=>{n.celdas=[];n.hundido=false});for(const n of f.naves){let ok=false;for(let t=0;t<500&&!ok;t++){const h=Math.random()<.5,r=GS.rnd(0,f.N-1),c=GS.rnd(0,f.N-1);if(cabe(f,n.L,r,c,h)){coloca(f,n,r,c,h);ok=true}}}}
  function densidad(N,sh,restantes,golpes){
    const pr=Array(N*N).fill(0);
    for(const L of restantes)for(let r=0;r<N;r++)for(let c=0;c<N;c++)for(const h of [true,false]){
      const cs=[];let ok=true;for(let k=0;k<L;k++){const rr=r+(h?0:k),cc=c+(h?k:0);if(rr>=N||cc>=N||sh[rr*N+cc]===1){ok=false;break}cs.push(rr*N+cc)}
      if(!ok)continue;const g=cs.filter(i=>golpes.has(i)).length;const w=1+g*25;cs.forEach(i=>{if(sh[i]===0)pr[i]+=w})}
    return pr;
  }
  return GS.crear(cont,{
    id:'batallanaval',
    intro:'Primero coloca tu flota en el mar (o pulsa Aleatorio). Luego dispara a las casillas del mar enemigo por turnos: gana quien hunda todos los barcos del rival. Cada barco ocupa varias casillas seguidas.',
    niveles:[['1','Fácil','Mar de 8 × 8, 4 barcos. La computadora dispara al azar.'],['2','Medio','Mar de 10 × 10, 5 barcos. La computadora remata los barcos tocados.'],['3','Difícil','Mar de 10 × 10, 5 barcos. La computadora calcula probabilidades.']],
    iniciar(api,nivel,opc){
      const N=nivel==='1'?8:10,largos=nivel==='1'?[4,3,3,2]:[5,4,3,3,2];
      const mia=nuevaFlota(N,largos),suya=nuevaFlota(N,largos);aleatoria(suya);
      const shM=Array(N*N).fill(0),shS=Array(N*N).fill(0);// disparos recibidos por mí (shM) y hechos por mí (shS): 0 nada, 1 agua, 2 tocado
      let fase='colocar',horiz=true,idx=0,turno='h',disp=0,aciertos=0,fin=false,bloq=false,colaIA=[],golpesIA=new Set(),hover=-1;
      const cel=34;
      api.area.innerHTML=`<div id="bnColoca"></div><div id="bnBatalla" hidden></div>`;
      const A=api.area.querySelector('#bnColoca'),Bt=api.area.querySelector('#bnBatalla');
      /* ----- dibujo de un tablero ----- */
      const barco=(n,x0,y0,c,mostrar)=>{
        const L=n.L,w=n.h?L*cel-6:cel-8,hh=n.h?cel-8:L*cel-6,x=x0+(n.celdas[0]%N)*cel+(n.h?3:4),y=y0+Math.floor(n.celdas[0]/N)*cel+(n.h?4:3);
        const col=n.hundido?'#7d3b34':'#68767f';
        return `<g pointer-events="none"><rect x="${x}" y="${y}" width="${w}" height="${hh}" rx="${n.h?hh/2:w/2}" fill="${col}" stroke="#3e4a52" stroke-width="2.500"/>
          ${n.h?`<rect x="${x+w*.3}" y="${y+hh*.28}" width="${w*.28}" height="${hh*.44}" rx="3" fill="#aab6bd"/><circle cx="${x+w*.8}" cy="${y+hh/2}" r="${hh*.16}" fill="#aab6bd"/>`:`<rect x="${x+w*.28}" y="${y+hh*.3}" width="${w*.44}" height="${hh*.28}" rx="3" fill="#aab6bd"/><circle cx="${x+w/2}" cy="${y+hh*.8}" r="${w*.16}" fill="#aab6bd"/>`}</g>`;
      };
      function tablero(f,sh,x0,y0,{mostrarNaves,id,previa}){
        let h=`<g data-tab="${id}"><rect x="${x0}" y="${y0}" width="${N*cel}" height="${N*cel}" rx="8" fill="#2f7fd1"/>`;
        for(let r=0;r<N;r++)for(let c=0;c<N;c++){h+=`<rect class="bn-c" data-i="${r*N+c}" x="${x0+c*cel}" y="${y0+r*cel}" width="${cel}" height="${cel}" fill="${(r+c)%2?'#3a8ae0':'#2f7fd1'}" stroke="#256cb5" stroke-width="1" style="cursor:${id==='suya'||previa?'pointer':'default'}"/>`}
        f.naves.forEach(n=>{if(n.celdas.length&&(mostrarNaves||n.hundido))h+=barco(n,x0,y0,cel,true)});
        if(previa)h+=previa;
        for(let i=0;i<N*N;i++){const r=Math.floor(i/N),c=i%N,cx=x0+c*cel+cel/2,cy=y0+r*cel+cel/2;
          if(sh[i]===1)h+=`<circle cx="${cx}" cy="${cy}" r="5" fill="#fff" fill-opacity=".9" pointer-events="none"/><circle cx="${cx}" cy="${cy}" r="10" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2" pointer-events="none"/>`;
          else if(sh[i]===2)h+=`<g pointer-events="none" class="gm-pop"><polygon points="${cx},${cy-14} ${cx+5},${cy-5} ${cx+14},${cy-6} ${cx+8},${cy+2} ${cx+12},${cy+12} ${cx+2},${cy+8} ${cx-6},${cy+14} ${cx-6},${cy+5} ${cx-14},${cy-1} ${cx-6},${cy-5}" fill="#e8472f" stroke="#ffb300" stroke-width="2"/><circle cx="${cx}" cy="${cy}" r="4" fill="#ffd54a"/></g>`}
        h+='</g>';return h;
      }
      /* ----- fase de colocación ----- */
      function previa(){
        if(hover<0||idx>=mia.naves.length)return '';const n=mia.naves[idx],r=Math.floor(hover/N),c=hover%N,ok=cabe(mia,n.L,r,c,horiz);let h='';
        for(let k=0;k<n.L;k++){const rr=r+(horiz?0:k),cc=c+(horiz?k:0);if(rr<N&&cc<N)h+=`<rect x="${cc*cel}" y="${rr*cel}" width="${cel}" height="${cel}" fill="${ok?'#82c85a':'#e8472f'}" fill-opacity=".6" pointer-events="none"/>`}return h;
      }
      function pintaColoca(){
        const listo=idx>=mia.naves.length;
        A.innerHTML=`<p class="gm-nota">${listo?'Flota lista. Pulsa "Comenzar batalla".':`Coloca el <b>${NOMBRES[mia.naves[idx].L]||'barco'}</b> (${mia.naves[idx].L} casillas). Toca el mar para ponerlo ${horiz?'en horizontal':'en vertical'}.`}</p>
          <svg class="gm-svg" id="bnT" viewBox="0 0 ${N*cel} ${N*cel}" style="max-width:${N*cel*1.5}px">${tablero(mia,shM,0,0,{mostrarNaves:true,id:'mia',previa:previa()})}</svg>
          <div class="gm-bar"><button class="btn ghost" id="bnG">${GS.ICO.girar}${horiz?'Horizontal':'Vertical'}</button><button class="btn ghost" id="bnR">${GS.ICO.aleatorio}Aleatorio</button><button class="btn ghost" id="bnQ">${GS.ICO.deshacer}Quitar último</button><button class="btn" id="bnGo" style="background:var(--accent)" ${listo?'':'disabled'}>Comenzar batalla</button></div>`;
        const T=A.querySelector('#bnT');
        T.addEventListener('click',e=>{const c=e.target.closest('.bn-c');if(!c||idx>=mia.naves.length)return;const i=+c.dataset.i,r=Math.floor(i/N),cc=i%N,n=mia.naves[idx];if(!cabe(mia,n.L,r,cc,horiz)){GS.sonar.error();return}coloca(mia,n,r,cc,horiz);idx++;GS.sonar.ficha();pintaColoca()});
        T.addEventListener('pointermove',e=>{const c=e.target.closest('.bn-c');const i=c?+c.dataset.i:-1;if(i!==hover){hover=i;const g=T.querySelector('[data-tab]');if(g){T.innerHTML=tablero(mia,shM,0,0,{mostrarNaves:true,id:'mia',previa:previa()})}}});
        A.querySelector('#bnG').onclick=()=>{horiz=!horiz;pintaColoca()};
        A.querySelector('#bnR').onclick=()=>{aleatoria(mia);idx=mia.naves.length;GS.tono(500,.05);pintaColoca()};
        A.querySelector('#bnQ').onclick=()=>{if(idx===0)return;idx--;const n=mia.naves[idx];n.celdas.forEach(i=>mia.tab[i]=-1);n.celdas=[];pintaColoca()};
        A.querySelector('#bnGo').onclick=()=>{if(idx<mia.naves.length)return;fase='batalla';A.hidden=true;Bt.hidden=false;pintaBatalla();api.botones([]);estado()};
      }
      /* ----- fase de batalla ----- */
      const estado=()=>api.estado(fin?'':(turno==='h'?`<span class="ic">${GS.ICO.persona}</span>Tu turno · toca el mar enemigo`:`<span class="ic">${GS.ICO.robot}</span>La computadora apunta…`)+`<span style="margin-left:auto;font-size:12.5px;color:var(--muted)">Barcos enemigos: ${suya.naves.filter(n=>!n.hundido).length} · los tuyos: ${mia.naves.filter(n=>!n.hundido).length}</span>`);
      function pintaBatalla(){
        Bt.innerHTML=`<p class="gm-nota" style="margin-bottom:4px"><b>Mar enemigo</b> (dispara aquí)</p>
          <svg class="gm-svg" id="bnS" viewBox="0 0 ${N*cel} ${N*cel}" style="max-width:${N*cel*1.4}px">${tablero(suya,shS,0,0,{mostrarNaves:false,id:'suya'})}</svg>
          <p class="gm-nota" style="margin:10px 0 4px"><b>Tu flota</b></p>
          <svg class="gm-svg" id="bnM" viewBox="0 0 ${N*cel} ${N*cel}" style="max-width:${N*cel*.95}px">${tablero(mia,shM,0,0,{mostrarNaves:true,id:'mia'})}</svg>`;
        Bt.querySelector('#bnS').addEventListener('click',e=>{const c=e.target.closest('.bn-c');if(!c||fin||bloq||turno!=='h')return;dispara(+c.dataset.i)});
      }
      function marcaHundidos(f,sh){let nuevo=null;f.naves.forEach(n=>{if(!n.hundido&&n.celdas.every(i=>sh[i]===2)){n.hundido=true;nuevo=n}});return nuevo}
      function dispara(i){
        if(shS[i]){GS.sonar.error();return}
        disp++;const golpe=suya.tab[i]>=0;shS[i]=golpe?2:1;let t=golpe?'¡Tocado!':'Agua';
        if(golpe){aciertos++;api.puntos(aciertos*10);GS.sonar.captura()}else GS.tono(300,.1,'sine',.06);
        const h=marcaHundidos(suya,shS);if(h)t=`¡Hundiste el ${(NOMBRES[h.L]||'barco').toLowerCase()}!`;
        api.msg(t);pintaBatalla();
        if(suya.naves.every(n=>n.hundido)){fin=true;estado();return api.fin({tipo:'gana',titulo:'¡Flota enemiga hundida!',sub:'hundiste todos los barcos',puntos:200*nivel+Math.max(0,N*N-disp)*3+aciertos*10,det:`${disp} disparos · ${aciertos} aciertos`})}
        turno='i';estado();turnoIA();
      }
      function elegirIA(){
        const libres=shM.map((v,i)=>v===0?i:-1).filter(i=>i>=0);
        if(nivel==='1')return GS.pick(libres);
        const restantes=mia.naves.filter(n=>!n.hundido).map(n=>n.L);
        if(nivel==='2'){
          while(colaIA.length){const i=colaIA.shift();if(shM[i]===0)return i}
          const par=libres.filter(i=>(Math.floor(i/N)+i%N)%2===0);return GS.pick(par.length?par:libres);
        }
        const pr=densidad(N,shM,restantes,golpesIA);let mx=-1,mj=[];libres.forEach(i=>{if(pr[i]>mx){mx=pr[i];mj=[i]}else if(pr[i]===mx)mj.push(i)});return GS.pick(mj);
      }
      async function turnoIA(){
        bloq=true;await GS.wait(750);if(fin)return;
        const i=elegirIA(),golpe=mia.tab[i]>=0;shM[i]=golpe?2:1;
        if(golpe){golpesIA.add(i);GS.sonar.captura();if(nivel==='2'){const r=Math.floor(i/N),c=i%N;[[r-1,c],[r+1,c],[r,c-1],[r,c+1]].forEach(([a,b])=>{if(a>=0&&a<N&&b>=0&&b<N&&shM[a*N+b]===0)colaIA.push(a*N+b)})}}else GS.tono(300,.1,'sine',.06);
        const h=marcaHundidos(mia,shM);if(h){h.celdas.forEach(k=>golpesIA.delete(k));colaIA=[]}
        api.msg(h?`La computadora hundió tu ${(NOMBRES[h.L]||'barco').toLowerCase()}`:golpe?'La computadora te tocó':'La computadora falló');
        pintaBatalla();
        if(mia.naves.every(n=>n.hundido)){fin=true;estado();return api.fin({tipo:'pierde',titulo:'Hundieron tu flota',sub:'Perdiste todos tus barcos',puntos:aciertos*10,det:`${disp} disparos · ${aciertos} aciertos`})}
        turno='h';estado();bloq=false;
      }
      api.botones([]);pintaColoca();api.estado('Coloca tus barcos');
      return{mia,suya,shM,shS,N};
    }
  });
}

/* ---------------------------------------------------------------------
   8) LABERINTO
   --------------------------------------------------------------------- */
function initMaze(cont){
  function generar(F,C){
    const mur=Array.from({length:F*C},()=>({n:true,s:true,e:true,o:true})),vis=new Uint8Array(F*C),pila=[0];vis[0]=1;
    while(pila.length){const i=pila[pila.length-1],r=Math.floor(i/C),c=i%C,vec=[];
      if(r>0&&!vis[i-C])vec.push([i-C,'n','s']);if(r<F-1&&!vis[i+C])vec.push([i+C,'s','n']);if(c>0&&!vis[i-1])vec.push([i-1,'o','e']);if(c<C-1&&!vis[i+1])vec.push([i+1,'e','o']);
      if(!vec.length){pila.pop();continue}const [j,a,b]=GS.pick(vec);mur[i][a]=false;mur[j][b]=false;vis[j]=1;pila.push(j)}
    return mur;
  }
  function camino(mur,F,C,desde,hasta){
    const prev=new Int32Array(F*C).fill(-2);prev[desde]=-1;const q=[desde];
    for(let k=0;k<q.length;k++){const i=q[k];if(i===hasta)break;const r=Math.floor(i/C),c=i%C,m=mur[i];
      const v=[];if(!m.n)v.push(i-C);if(!m.s)v.push(i+C);if(!m.o)v.push(i-1);if(!m.e)v.push(i+1);
      for(const j of v)if(prev[j]===-2){prev[j]=i;q.push(j)}}
    const out=[];let x=hasta;while(x!==-1&&x!==-2){out.push(x);x=prev[x]}return out.reverse();
  }
  return GS.crear(cont,{
    id:'laberinto',
    intro:'Llega desde la esquina de arriba hasta la bandera verde. Usa las flechas o WASD, desliza el dedo o usa la cruceta. Cuidado con los callejones sin salida y con las trampas de pinchos: te cuestan tiempo.',
    niveles:[['1','Fácil','Laberinto de 10 × 10, sin trampas.'],['2','Medio','Laberinto de 16 × 16 con trampas de pinchos.'],['3','Difícil','Laberinto de 22 × 22, más trampas y visión limitada.']],
    iniciar(api,nivel,opc){
      const D={1:{f:10,t:0},2:{f:16,t:8},3:{f:22,t:22}}[nivel],F=D.f,C=D.f,mur=generar(F,C),meta=F*C-1;
      let pos=0,seg=0,pen=0,pistas=0,fin=false,visitadas=new Set([0]),verCamino=null,t0=Date.now(),muertes=0;
      const trampas=new Set();const sol=camino(mur,F,C,0,meta);
      while(trampas.size<D.t){const i=GS.rnd(1,meta-1);if(i!==0&&i!==meta)trampas.add(i)}
      const cel=40,W=C*cel,H=F*cel;
      api.area.innerHTML=`<svg class="gm-svg" id="lb" viewBox="-6 -6 ${W+12} ${H+12}" style="max-width:${nivel==='1'?460:nivel==='2'?560:620}px" role="application" aria-label="Laberinto"></svg>
        <div id="lbPad" class="gm-bar" style="display:none">
          <button class="btn ghost" data-d="o" aria-label="Izquierda">${GS.svg('<path d="M15 5l-7 7 7 7"/>')}</button><button class="btn ghost" data-d="n" aria-label="Arriba">${GS.svg('<path d="M5 15l7-7 7 7"/>')}</button><button class="btn ghost" data-d="s" aria-label="Abajo">${GS.svg('<path d="M5 9l7 7 7-7"/>')}</button><button class="btn ghost" data-d="e" aria-label="Derecha">${GS.svg('<path d="M9 5l7 7-7 7"/>')}</button></div>`;
      const svgEl=api.area.querySelector('#lb');
      if(matchMedia('(pointer:coarse)').matches||innerWidth<700)api.area.querySelector('#lbPad').style.display='flex';
      let paredes='';for(let i=0;i<F*C;i++){const r=Math.floor(i/C),c=i%C,m=mur[i],x=c*cel,y=r*cel;if(m.n)paredes+=`M${x} ${y}h${cel}`;if(m.o)paredes+=`M${x} ${y}v${cel}`;if(r===F-1&&m.s)paredes+=`M${x} ${y+cel}h${cel}`;if(c===C-1&&m.e)paredes+=`M${x+cel} ${y}v${cel}`}
      const pinchos=(x,y)=>`<g class="lb-trampa"><circle cx="${x+cel/2}" cy="${y+cel/2}" r="${cel*.36}" fill="#fde0dc" stroke="#d9473a" stroke-width="2"/>${[0,1,2,3,4].map(k=>`<path d="M${x+cel*.2+k*cel*.15} ${y+cel*.68}l${cel*.075} -${cel*.34}l${cel*.075} ${cel*.34}z" fill="#d9473a"/>`).join('')}</g>`;
      function pintar(){
        const r=Math.floor(pos/C),c=pos%C;let h=`<rect x="-6" y="-6" width="${W+12}" height="${H+12}" rx="14" fill="#f4ead8"/>`;
        visitadas.forEach(i=>{h+=`<rect x="${(i%C)*cel+3}" y="${Math.floor(i/C)*cel+3}" width="${cel-6}" height="${cel-6}" rx="6" fill="#f7cfa8" fill-opacity=".55"/>`});
        trampas.forEach(i=>{h+=pinchos((i%C)*cel,Math.floor(i/C)*cel)});
        if(verCamino)h+=`<polyline points="${verCamino.map(i=>`${(i%C)*cel+cel/2},${Math.floor(i/C)*cel+cel/2}`).join(' ')}" fill="none" stroke="#2e8b3a" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" stroke-opacity=".75" stroke-dasharray="2 12"/>`;
        const gx=(meta%C)*cel,gy=Math.floor(meta/C)*cel;
        h+=`<g><path d="M${gx+cel*.38} ${gy+cel*.82}V${gy+cel*.18}" stroke="#4a3426" stroke-width="3" stroke-linecap="round"/><path d="M${gx+cel*.4} ${gy+cel*.2}l${cel*.42} ${cel*.18}-${cel*.42} ${cel*.18}z" fill="#2e9e63"/></g>`;
        h+=`<path d="${paredes}" fill="none" stroke="#6b4a3a" stroke-width="4.500" stroke-linecap="round"/>`;
        h+=`<g id="jug" style="transition:transform .09s"><circle cx="${c*cel+cel/2}" cy="${r*cel+cel/2}" r="${cel*.3}" fill="#e8472f" stroke="#a52a1e" stroke-width="3"/><circle cx="${c*cel+cel/2-4}" cy="${r*cel+cel/2-4}" r="${cel*.08}" fill="#fff" fill-opacity=".8"/></g>`;
        if(nivel==='3'){const cx=c*cel+cel/2,cy=r*cel+cel/2;h+=`<defs><radialGradient id="niebla" gradientUnits="userSpaceOnUse" cx="${cx}" cy="${cy}" r="${cel*4.2}"><stop offset=".55" stop-color="#3b2a22" stop-opacity="0"/><stop offset="1" stop-color="#3b2a22" stop-opacity=".96"/></radialGradient></defs><rect x="-6" y="-6" width="${W+12}" height="${H+12}" rx="14" fill="url(#niebla)" pointer-events="none"/>`}
        svgEl.innerHTML=h;
      }
      const tiempo=()=>Math.floor((Date.now()-t0)/1000)+pen;
      const fmt=s=>Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
      const resumen=()=>api.estado(fin?'':`<span class="ic">${GS.ICO.reloj}</span><span id="lbT">${fmt(tiempo())}</span><span style="margin-left:14px;color:var(--muted);font-size:13px">Penalización: ${pen}s${nivel==='1'?'':` · Trampas: ${muertes}`}</span>`);
      const reloj=setInterval(()=>{if(fin)return;const e=document.getElementById('lbT');if(e)e.textContent=fmt(tiempo())},500);
      function mueve(d){
        if(fin)return;const m=mur[pos];if(m[d]){GS.tono(140,.04,'square',.04);return}
        pos+={n:-C,s:C,o:-1,e:1}[d];visitadas.add(pos);verCamino=null;GS.tono(380+(visitadas.size%8)*20,.04,'triangle',.05);api.puntos(visitadas.size);
        if(trampas.has(pos)){pen+=5;muertes++;GS.sonar.pierde();api.msg('¡Pinchos! +5 segundos');setTimeout(()=>api.msg(''),1200)}
        pintar();resumen();
        if(pos===meta){fin=true;clearInterval(reloj);const s=tiempo(),par=Math.round(sol.length*.9),pts=Math.max(60,300*nivel+Math.max(0,par*2-s)*4-pistas*60);
          api.fin({tipo:'gana',titulo:'¡Saliste del laberinto!',sub:'encontraste la salida',puntos:pts,det:`${fmt(s)} · ${pistas} pistas`})}
      }
      const tecla=e=>{const d={ArrowUp:'n',w:'n',W:'n',ArrowDown:'s',s:'s',S:'s',ArrowLeft:'o',a:'o',A:'o',ArrowRight:'e',d:'e',D:'e'}[e.key];if(d){e.preventDefault();mueve(d)}};
      document.addEventListener('keydown',tecla);
      api.area.querySelector('#lbPad').addEventListener('click',e=>{const b=e.target.closest('button');if(b)mueve(b.dataset.d)});
      let sx=0,sy=0,sw=false;svgEl.addEventListener('pointerdown',e=>{sx=e.clientX;sy=e.clientY;sw=true});
      svgEl.addEventListener('pointermove',e=>{if(!sw)return;const dx=e.clientX-sx,dy=e.clientY-sy;if(Math.hypot(dx,dy)>26){mueve(Math.abs(dx)>Math.abs(dy)?(dx>0?'e':'o'):(dy>0?'s':'n'));sx=e.clientX;sy=e.clientY}});
      ['pointerup','pointercancel'].forEach(ev=>svgEl.addEventListener(ev,()=>sw=false));
      api.botones([{txt:'Pista (+10 s)',ico:'pista',fn:()=>{if(fin)return;verCamino=camino(mur,F,C,pos,meta);pen+=10;pistas++;pintar();resumen();setTimeout(()=>{verCamino=null;if(!fin)pintar()},3000)}}]);
      pintar();resumen();
      return{destruir(){clearInterval(reloj);document.removeEventListener('keydown',tecla)},mueve,solucion:()=>sol,mur:()=>mur,pos:()=>pos,meta,C};
    }
  });
}

/* ---------------------------------------------------------------------
   9) TORRES DE COLORES (ordenar tubos)
   --------------------------------------------------------------------- */
function initColorSort(cont){
  const COL=['#e53935','#fb8c00','#fdd835','#7cb342','#2e7d32','#00acc1','#1e88e5','#3949ab','#8e24aa','#ec407a','#6d4c41','#78909c'];
  const CAP=4;
  function generar(nc,vacios){
    const t=[];for(let c=0;c<nc;c++)t.push(Array(CAP).fill(c));for(let k=0;k<vacios;k++)t.push([]);
    const mezclado=()=>t.filter(x=>x.length).filter(x=>new Set(x).size>1||x.length<CAP).length>=nc;
    for(let it=0;it<4000;it++){
      const src=t.map((x,i)=>x.length&&(x.length===1||x[x.length-2]===x[x.length-1])?i:-1).filter(i=>i>=0);if(!src.length)break;
      const s=GS.pick(src),dst=t.map((x,i)=>i!==s&&x.length<CAP?i:-1).filter(i=>i>=0);if(!dst.length)continue;
      t[GS.pick(dst)].push(t[s].pop());
      if(it>nc*40&&mezclado())break;
    }
    return t;
  }
  const resuelto=t=>t.every(x=>x.length===0||(x.length===CAP&&x.every(b=>b===x[0])));
  return GS.crear(cont,{
    id:'torrescolores',
    intro:'Ordena las bolitas para que cada tubo tenga un solo color. Toca un tubo para levantar su bolita de arriba y luego toca el tubo al que quieres moverla. Solo puedes poner una bolita sobre otra del mismo color o en un tubo vacío, y cada tubo guarda 4.',
    niveles:[['1','Fácil','5 colores y 2 tubos vacíos.'],['2','Medio','8 colores y 2 tubos vacíos.'],['3','Difícil','11 colores y 2 tubos vacíos.']],
    iniciar(api,nivel,opc){
      const nc={1:5,2:8,3:11}[nivel];let tubos=generar(nc,2);const inicio=tubos.map(x=>x.slice());let sel=-1,mov=0,fin=false,hist=[],extra=false;
      const por=nivel==='1'?7:nivel==='2'?5:5,ancho=64,gap=14,alto=CAP*40+24;
      function pintar(){
        const n=tubos.length,fila=Math.ceil(n/por),cols=Math.ceil(n/fila),W=cols*(ancho+gap)+gap,H=fila*(alto+30)+10;
        api.area.querySelector('svg')?.remove();
        let h=`<svg class="gm-svg" viewBox="0 0 ${W} ${H}" style="max-width:${Math.min(640,W*1.5)}px" role="application" aria-label="Tubos de colores"><rect width="${W}" height="${H}" rx="18" fill="#eaf4fb"/>`;
        tubos.forEach((t,i)=>{const r=Math.floor(i/cols),c=i%cols,x=gap+c*(ancho+gap),y=14+r*(alto+30),levantada=sel===i&&t.length;
          h+=`<g class="cs-t" data-i="${i}" style="cursor:pointer"><rect x="${x-6}" y="${y-12}" width="${ancho+12}" height="${alto+24}" fill="#000" fill-opacity="0"/>
            <rect x="${x}" y="${y}" width="${ancho}" height="${alto}" rx="${ancho/2-4}" fill="#fffdf8" stroke="${sel===i?'#2e8b3a':'#8d99a1'}" stroke-width="${sel===i?5:3}"/>`;
          t.forEach((b,k)=>{const top=k===t.length-1&&levantada;const cy=y+alto-22-k*40-(top?30:0);h+=`<circle cx="${x+ancho/2}" cy="${cy}" r="16.500" fill="${COL[b]}" stroke="rgba(0,0,0,.25)" stroke-width="2"/><circle cx="${x+ancho/2-5}" cy="${cy-5}" r="4.500" fill="#fff" fill-opacity=".45"/>`});
          h+='</g>'});
        h+='</svg>';api.area.insertAdjacentHTML('afterbegin',h);
        api.area.querySelector('svg').addEventListener('click',e=>{const g=e.target.closest('.cs-t');if(g)toca(+g.dataset.i)});
      }
      const estado=()=>api.estado(fin?'':`Movimientos: <b>${mov}</b>`);
      function toca(i){
        if(fin)return;
        if(sel<0){if(!tubos[i].length){GS.sonar.error();return}sel=i;GS.tono(520,.05);pintar();return}
        if(i===sel){sel=-1;pintar();return}
        const s=tubos[sel],d=tubos[i],b=s[s.length-1];
        if(d.length>=CAP||(d.length&&d[d.length-1]!==b)){GS.sonar.error();sel=-1;pintar();return}
        hist.push(JSON.stringify(tubos));
        let k=0;while(s.length&&s[s.length-1]===b&&d.length<CAP){d.push(s.pop());k++}
        sel=-1;mov++;api.puntos(mov*2);GS.sonar.ficha();pintar();estado();
        if(resuelto(tubos)){fin=true;estado();const par=nc*3,pts=Math.round(300*nivel*Math.min(1,par/mov))+100*nivel+(extra?0:50);api.fin({tipo:'gana',titulo:'¡Tubos ordenados!',sub:'todos los colores separados',puntos:pts,det:`${mov} movimientos`})}
      }
      api.botones([
        {txt:'Deshacer',ico:'deshacer',fn:()=>{if(fin||!hist.length)return;tubos=JSON.parse(hist.pop());mov=Math.max(0,mov-1);sel=-1;api.puntos(mov*2);pintar();estado()}},
        {txt:'Tubo extra',ico:'aleatorio',id:'csExtra',fn:()=>{if(fin||extra)return;extra=true;tubos.push([]);const b=document.getElementById('csExtra');if(b)b.disabled=true;pintar()}}
      ]);
      pintar();estado();
      return{tubos:()=>tubos.map(x=>x.slice()),toca,resuelto:()=>resuelto(tubos),CAP};
    }
  });
}

/* ---------------------------------------------------------------------
   10) NIMBLE
   --------------------------------------------------------------------- */
function initNimble(cont){
  const xor=a=>a.reduce((x,y)=>x^y,0);
  function crear(N,k,humEmpieza){
    for(let t=0;t<2000;t++){const m=Array.from({length:k},()=>GS.rnd(1,N-1));const x=xor(m);if(humEmpieza?x!==0:x===0)return m}
    return Array.from({length:k},(_,i)=>i+1);
  }
  function jugadaOptima(m){
    const x=xor(m);if(x!==0){for(let i=0;i<m.length;i++){const t=m[i]^x;if(t<m[i])return[i,t]}}
    const L=m.map((v,i)=>v>0?i:-1).filter(i=>i>=0);const i=GS.pick(L);return[i,m[i]-1];
  }
  return GS.crear(cont,{
    id:'nimble',
    intro:'Las monedas avanzan hacia la casilla 0 (la meta de la izquierda). En tu turno mueve UNA moneda hacia la izquierda todas las casillas que quieras (puede quedar en la misma casilla que otra y puede saltarlas). Quien haga el último movimiento, cuando todas las monedas ya estén en la casilla 0, gana.',
    niveles:[['1','Fácil','8 casillas y 4 monedas. La computadora se equivoca seguido.'],['2','Medio','12 casillas y 5 monedas.'],['3','Difícil','16 casillas y 6 monedas. La computadora juega perfecto.']],
    opciones:[{k:'quien',t:'¿Quién empieza?',v:[['yo','Yo'],['ia','La computadora']],d:'yo'}],
    iniciar(api,nivel,opc){
      const N={1:8,2:12,3:16}[nivel],K={1:4,2:5,3:6}[nivel],hum=opc.quien==='yo',pOpt={1:.3,2:.72,3:1}[nivel];
      let m=crear(N,K,hum),turno=hum?'h':'i',sel=-1,jug=0,fin=false,bloq=false,pistaM=null;
      const cel=Math.min(52,Math.floor(600/N)),W=N*cel+20,H=170;
      api.area.innerHTML=`<div style="width:100%;overflow-x:auto;padding-bottom:4px"><svg class="gm-svg" id="nb" viewBox="0 0 ${W} ${H}" style="min-width:${Math.round(N*38+20)}px;max-width:${W*1.3}px;margin:0 auto" role="application" aria-label="Fila de casillas con monedas"></svg></div>`;
      const svgEl=api.area.querySelector('#nb');
      const estado=()=>api.estado(fin?'':(turno==='h'?`<span class="ic">${GS.ICO.persona}</span>Tu turno · mueve una moneda a la izquierda`:`<span class="ic">${GS.ICO.robot}</span>La computadora piensa…`));
      const COLS=['#f2b84b','#e8472f','#2f7fd1','#43a047','#8e24aa','#fb8c00'];
      function pintar(){
        let h=`<rect width="${W}" height="${H}" rx="16" fill="#fff6e6"/><text x="10" y="22" font-family="Nunito,Arial,sans-serif" font-size="13" font-weight="800" fill="#8d6d5a">META</text><path d="M60 16h-30M38 10l-8 6 8 6" fill="none" stroke="#8d6d5a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
        for(let i=0;i<N;i++){const x=10+i*cel,objetivo=sel>=0&&i<m[sel];
          h+=`<g class="nb-c" data-i="${i}" style="cursor:pointer"><rect x="${x+2}" y="60" width="${cel-4}" height="${cel+10}" rx="9" fill="${objetivo?'#c9efc2':i===0?'#f7cfa8':'#f4ead8'}" stroke="${objetivo?'#2e8b3a':'#b9a58d'}" stroke-width="${objetivo?4:2.5}"/><text x="${x+cel/2}" y="${60+cel+34}" text-anchor="middle" font-family="Nunito,Arial,sans-serif" font-size="13" font-weight="800" fill="#8d6d5a">${i}</text></g>`}
        const cuenta={};m.forEach((p,i)=>{const k=(cuenta[p]=(cuenta[p]||0)+1)-1,x=10+p*cel+cel/2,y=60+cel/2+5-k*9-(sel===i?14:0);
          h+=`<g class="nb-m" data-m="${i}" style="pointer-events:none"><ellipse cx="${x}" cy="${y+3}" rx="${cel*.36}" ry="${cel*.3}" fill="rgba(0,0,0,.2)"/><circle cx="${x}" cy="${y}" r="${cel*.34}" fill="${p===0?'#b9a58d':COLS[i%6]}" stroke="${sel===i?'#2e8b3a':pistaM&&pistaM[0]===i?'#2e8b3a':'rgba(0,0,0,.3)'}" stroke-width="${sel===i||(pistaM&&pistaM[0]===i)?5:2.500}"/><circle cx="${x}" cy="${y}" r="${cel*.2}" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="2"/></g>`});
        if(pistaM)h+=`<circle cx="${10+pistaM[1]*cel+cel/2}" cy="${60+cel/2+5}" r="${cel*.38}" fill="none" stroke="#2e8b3a" stroke-width="4" stroke-dasharray="6 5"/>`;
        svgEl.innerHTML=h;
      }
      function mueve(i,a,quien){
        m[i]=a;sel=-1;pistaM=null;GS.sonar.ficha();
        if(quien==='h'){jug++;api.puntos(jug*5)}pintar();
        if(m.every(x=>x===0)){fin=true;bloq=true;estado();
          if(quien==='h')api.fin({tipo:'gana',titulo:'¡Ganaste!',sub:'hiciste el último movimiento',puntos:150*nivel+100+Math.max(0,24-jug)*5,det:`${jug} movimientos`});
          else api.fin({tipo:'pierde',titulo:'Ganó la computadora',sub:'Hizo el último movimiento',puntos:jug*5,det:`${jug} movimientos`});return}
        turno=quien==='h'?'i':'h';estado();if(turno==='i')turnoIA();
      }
      async function turnoIA(){bloq=true;await GS.wait(750);if(fin)return;let j=Math.random()<pOpt?jugadaOptima(m):null;
        if(!j){const L=m.map((v,i)=>v>0?i:-1).filter(i=>i>=0),i=GS.pick(L);j=[i,GS.rnd(0,m[i]-1)]}mueve(j[0],j[1],'i');if(!fin)bloq=false}
      svgEl.addEventListener('click',e=>{
        if(fin||bloq||turno!=='h')return;const ce=e.target.closest('.nb-c');if(!ce)return;pistaM=null;
        const s=+ce.dataset.i;
        if(sel>=0&&s<m[sel]){mueve(sel,s,'h');return}                       // soltar la moneda elegida en una casilla a la izquierda
        const aqui=m.map((p,i)=>p===s&&s>0?i:-1).filter(i=>i>=0);            // elegir (o alternar) una moneda de esa casilla
        if(aqui.length){const k=aqui.indexOf(sel);sel=aqui[(k+1)%aqui.length];GS.tono(520,.05);pintar();return}
        if(sel>=0){GS.sonar.error()}sel=-1;pintar();
      });
      api.botones([{txt:'Pista',ico:'pista',fn:()=>{if(fin||bloq||turno!=='h')return;pistaM=jugadaOptima(m);sel=-1;pintar();setTimeout(()=>{pistaM=null;if(!fin)pintar()},2500)}}]);
      pintar();estado();if(turno==='i')turnoIA();
      return{monedas:()=>m.slice(),jugadaOptima};
    }
  });
}

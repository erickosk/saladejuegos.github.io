/* =====================================================================
   juegos-mesa-a.js · Tres en Raya, Conecta 4, Damas, Sudoku, Torre de Hanói
   Uso:  initTicTacToe(document.getElementById('game-container'))
   ===================================================================== */

/* ---------------------------------------------------------------------
   1) TRES EN RAYA
   --------------------------------------------------------------------- */
function initTicTacToe(cont){
  const LIN=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const ganador=t=>{for(const l of LIN)if(t[l[0]]&&t[l[0]]===t[l[1]]&&t[l[0]]===t[l[2]])return{j:t[l[0]],l};return null};
  const libres=t=>t.map((v,i)=>v?-1:i).filter(i=>i>=0);
  function minimax(t,turno,ia){ // valor desde el punto de vista de la IA
    const g=ganador(t);if(g)return g.j===ia?10:-10;const L=libres(t);if(!L.length)return 0;
    let mejor=turno===ia?-99:99;
    for(const i of L){t[i]=turno;const v=minimax(t,turno==='x'?'o':'x',ia)+(turno===ia?-0.01:0.01);t[i]=null;mejor=turno===ia?Math.max(mejor,v):Math.min(mejor,v)}
    return mejor;
  }
  function jugadaIA(t,ia,hum,nivel){
    const L=libres(t),gana=(j)=>L.find(i=>{t[i]=j;const g=ganador(t);t[i]=null;return g});
    const inteligente=()=>{const w=gana(ia);if(w!==undefined)return w;const b=gana(hum);if(b!==undefined)return b;
      if(t[4]===null)return 4;const es=[0,2,6,8].filter(i=>t[i]===null);if(es.length&&Math.random()<.7)return GS.pick(es);return GS.pick(L)};
    if(nivel==='1')return Math.random()<.3?inteligente():GS.pick(L);
    if(nivel==='2')return Math.random()<.85?inteligente():GS.pick(L);
    let mejor=-99,mj=[];for(const i of L){t[i]=ia;const v=minimax(t,hum,ia);t[i]=null;if(v>mejor){mejor=v;mj=[i]}else if(v===mejor)mj.push(i)}
    return GS.pick(mj);
  }
  return GS.crear(cont,{
    id:'tresenraya',
    intro:'Haz una línea de tres símbolos (horizontal, vertical o diagonal) antes que la computadora. Toca una casilla vacía para jugar.',
    niveles:[['1','Fácil','La computadora se equivoca a menudo.'],['2','Medio','Bloquea tus jugadas y gana cuando puede.'],['3','Difícil','Juega perfecto: lo mejor que puedes lograr es un empate.']],
    opciones:[{k:'lado',t:'Juegas con',v:[['x','X (empiezas tú)'],['o','O (empieza la computadora)']],d:'x'}],
    iniciar(api,nivel,opc){
      const hum=opc.lado,ia=hum==='x'?'o':'x';let t=Array(9).fill(null),turno='x',jug=0,bloqueado=false,fin=false;
      const colX='#e8472f',colO='#2f7fd1';
      api.area.innerHTML=`<svg class="gm-svg" id="ttt" viewBox="0 0 300 300" style="max-width:420px" role="grid" aria-label="Tablero de tres en raya">
        <rect x="4" y="4" width="292" height="292" rx="22" fill="#fffdf8" stroke="#d9c7b0" stroke-width="3"/>
        <g stroke="#b9a58d" stroke-width="6" stroke-linecap="round"><path d="M100 24V276M200 24V276M24 100H276M24 200H276"/></g>
        <g id="celdas">${t.map((_,i)=>`<g class="gm-celda" data-i="${i}" role="gridcell" aria-label="Casilla ${i+1}"><rect class="gm-fondo" x="${(i%3)*100+8}" y="${Math.floor(i/3)*100+8}" width="84" height="84" rx="14" fill="#f2ceb9" fill-opacity="0"/></g>`).join('')}</g>
        <g id="simb"></g><g id="linea"></g></svg>`;
      const simb=api.area.querySelector('#simb');
      const dibujar=(i,j)=>{const x=(i%3)*100,y=Math.floor(i/3)*100;const g=document.createElementNS('http://www.w3.org/2000/svg','g');g.setAttribute('transform',`translate(${x} ${y})`);/* la animación va en un grupo interior para no pisar la posición */g.innerHTML=`<g class="gm-pop">${j==='x'?GS.SIM.x(colX):GS.SIM.o(colO)}</g>`;simb.appendChild(g)};
      const estado=()=>api.estado(fin?'':(turno===hum?`<span class="ic">${GS.ICO.persona}</span>Tu turno · juegas con ${hum.toUpperCase()}`:`<span class="ic">${GS.ICO.robot}</span>La computadora piensa…`));
      function terminar(g){
        fin=true;bloqueado=true;estado();
        if(g){const [a,,c]=g.l,p=i=>[(i%3)*100+50,Math.floor(i/3)*100+50];const [x1,y1]=p(a),[x2,y2]=p(c);
          api.area.querySelector('#linea').innerHTML=`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#2e9e63" stroke-width="12" stroke-linecap="round" stroke-opacity=".85"/>`}
        const mov=jug;
        if(g&&g.j===hum){api.fin({tipo:'gana',titulo:'¡Ganaste!',sub:'tres en línea',puntos:100*nivel+(9-mov)*10+20,det:`${mov} jugadas`})}
        else if(g)api.fin({tipo:'pierde',titulo:'Ganó la computadora',sub:'Tres en línea',puntos:jug*5,det:`${mov} jugadas`});
        else api.fin({tipo:'empate',titulo:'¡Empate!',sub:'Tablero lleno',puntos:40*nivel+jug*5,det:`${mov} jugadas`});
      }
      function poner(i,j){t[i]=j;dibujar(i,j);GS.sonar.ficha();turno=j==='x'?'o':'x';if(j===hum){jug++;api.puntos(jug*5)}
        const g=ganador(t);if(g||!libres(t).length)return terminar(g);estado();if(turno===ia)turnoIA()}
      async function turnoIA(){bloqueado=true;estado();await GS.wait(420+Math.random()*300);if(fin)return;poner(jugadaIA(t,ia,hum,nivel),ia);if(!fin)bloqueado=false}
      api.area.querySelector('#celdas').addEventListener('click',e=>{const c=e.target.closest('.gm-celda');if(!c||bloqueado||fin||turno!==hum)return;const i=+c.dataset.i;if(t[i]){GS.sonar.error();return}poner(i,hum)});
      api.botones([]);estado();if(turno===ia)turnoIA();
      return{tablero:()=>t.slice()};
    }
  });
}

/* ---------------------------------------------------------------------
   2) CONECTA 4
   --------------------------------------------------------------------- */
function initConnect4(cont){
  const F=6,C=7;
  const nuevo=()=>Array.from({length:F},()=>Array(C).fill(0));
  const colLibre=(b,c)=>{for(let r=F-1;r>=0;r--)if(!b[r][c])return r;return -1};
  const dirs=[[0,1],[1,0],[1,1],[1,-1]];
  function cuatro(b){for(let r=0;r<F;r++)for(let c=0;c<C;c++){const j=b[r][c];if(!j)continue;for(const [dr,dc] of dirs){const cs=[[r,c]];for(let k=1;k<4;k++){const rr=r+dr*k,cc=c+dc*k;if(rr<0||rr>=F||cc<0||cc>=C||b[rr][cc]!==j)break;cs.push([rr,cc])}if(cs.length===4)return{j,cs}}}return null}
  function ventana(w,j){const o=j===1?2:1;const a=w.filter(x=>x===j).length,e=w.filter(x=>x===0).length,b=w.filter(x=>x===o).length;if(a===4)return 1000;if(a===3&&e===1)return 12;if(a===2&&e===2)return 4;if(b===3&&e===1)return -14;return 0}
  function evalua(b,j){let s=0;for(let r=0;r<F;r++)if(b[r][3]===j)s+=3;for(let r=0;r<F;r++)for(let c=0;c<C;c++)for(const [dr,dc] of dirs){const w=[];for(let k=0;k<4;k++){const rr=r+dr*k,cc=c+dc*k;if(rr<0||rr>=F||cc<0||cc>=C)break;w.push(b[rr][cc])}if(w.length===4)s+=ventana(w,j)}return s}
  const orden=[3,2,4,1,5,0,6];
  function busca(b,prof,a,be,max,ia,hum){
    const g=cuatro(b);if(g)return{v:g.j===ia?100000+prof:-100000-prof};
    const L=orden.filter(c=>colLibre(b,c)>=0);if(!L.length)return{v:0};if(prof===0)return{v:evalua(b,ia)};
    let mc=L[0];
    if(max){let v=-1e9;for(const c of L){const r=colLibre(b,c);b[r][c]=ia;const x=busca(b,prof-1,a,be,false,ia,hum).v;b[r][c]=0;if(x>v){v=x;mc=c}a=Math.max(a,v);if(a>=be)break}return{v,c:mc}}
    else{let v=1e9;for(const c of L){const r=colLibre(b,c);b[r][c]=hum;const x=busca(b,prof-1,a,be,true,ia,hum).v;b[r][c]=0;if(x<v){v=x;mc=c}be=Math.min(be,v);if(a>=be)break}return{v,c:mc}}
  }
  function jugadaIA(b,ia,hum,nivel){
    const L=[0,1,2,3,4,5,6].filter(c=>colLibre(b,c)>=0);
    const prueba=(j)=>L.find(c=>{const r=colLibre(b,c);b[r][c]=j;const g=cuatro(b);b[r][c]=0;return g});
    if(nivel==='1'){if(Math.random()<.5){const w=prueba(ia);if(w!==undefined)return w}if(Math.random()<.35){const x=prueba(hum);if(x!==undefined)return x}return GS.pick(L)}
    return busca(b,nivel==='2'?3:6,-1e9,1e9,true,ia,hum).c;
  }
  return GS.crear(cont,{
    id:'conecta4',
    intro:'Alinea cuatro fichas de tu color en horizontal, vertical o diagonal antes que la computadora. Toca una columna para soltar tu ficha.',
    niveles:[['1','Fácil','La computadora juega casi al azar.'],['2','Medio','Piensa unas jugadas por adelantado.'],['3','Difícil','Calcula muchas jugadas: tendrás que planear bien.']],
    opciones:[{k:'quien',t:'¿Quién empieza?',v:[['yo','Yo'],['ia','La computadora']],d:'yo'}],
    iniciar(api,nivel,opc){
      const hum=1,ia=2;let b=nuevo(),turno=opc.quien==='yo'?hum:ia,jug=0,bloq=false,fin=false;
      const R='#d93a2b',Y='#f2c230';
      api.area.innerHTML=`<svg class="gm-svg" id="c4" viewBox="0 0 700 620" style="max-width:520px" role="grid" aria-label="Tablero de Conecta 4">
        <defs><mask id="huecos"><rect width="700" height="600" fill="#fff"/>${Array.from({length:F*C},(_,k)=>`<circle cx="${(k%C)*100+50}" cy="${Math.floor(k/C)*100+50}" r="40" fill="#000"/>`).join('')}</mask></defs>
        <g id="fichas" transform="translate(0 10)"></g>
        <g transform="translate(0 10)"><rect width="700" height="600" rx="26" fill="#2f6fbd" mask="url(#huecos)"/><rect x="0" y="0" width="700" height="600" rx="26" fill="none" stroke="#24578f" stroke-width="6"/></g>
        <g id="resalte" transform="translate(0 10)"></g>
        <g id="cols">${Array.from({length:C},(_,c)=>`<rect class="gm-col" data-c="${c}" x="${c*100}" y="0" width="100" height="620" fill="#000" fill-opacity="0" style="cursor:pointer"/>`).join('')}</g></svg>`;
      const fichas=api.area.querySelector('#fichas');
      const estado=()=>api.estado(fin?'':(turno===hum?`<svg class="gm-ficha-ico" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="${R}"/></svg>Tu turno · fichas rojas`:`<svg class="gm-ficha-ico" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="${Y}"/></svg>La computadora piensa…`));
      function suelta(c,j){const r=colLibre(b,c);b[r][c]=j;
        const el=document.createElementNS('http://www.w3.org/2000/svg','circle');el.setAttribute('cx',c*100+50);el.setAttribute('cy',r*100+50);el.setAttribute('r',40);el.setAttribute('fill',j===hum?R:Y);
        el.setAttribute('stroke',j===hum?'#a52a1e':'#c99a14');el.setAttribute('stroke-width','5');el.style.setProperty('--dy',-(r*100+110)+'px');el.style.animation='gmcae '+(.18+r*.05)+'s cubic-bezier(.5,0,.9,.6)';fichas.appendChild(el);
        setTimeout(()=>GS.sonar.ficha(),180+r*50);
        if(j===hum){jug++;api.puntos(jug*3)}
        const g=cuatro(b);
        if(g||b[0].every(x=>x)){fin=true;bloq=true;estado();
          if(g)api.area.querySelector('#resalte').innerHTML=g.cs.map(([rr,cc])=>`<circle cx="${cc*100+50}" cy="${rr*100+50}" r="46" fill="none" stroke="#fff" stroke-width="8" class="gm-pop"/>`).join('');
          setTimeout(()=>{ if(g&&g.j===hum)api.fin({tipo:'gana',titulo:'¡Ganaste!',sub:'cuatro en línea',puntos:150*nivel+Math.max(0,42-jug*2)*5,det:`${jug} fichas`});
            else if(g)api.fin({tipo:'pierde',titulo:'Ganó la computadora',sub:'Cuatro en línea',puntos:jug*3,det:`${jug} fichas`});
            else api.fin({tipo:'empate',titulo:'¡Empate!',sub:'Tablero lleno',puntos:60*nivel+jug*3,det:`${jug} fichas`})},700);return}
        turno=j===hum?ia:hum;estado();if(turno===ia)turnoIA();
      }
      async function turnoIA(){bloq=true;await GS.wait(500);if(fin)return;suelta(jugadaIA(b,ia,hum,nivel),ia);if(!fin)bloq=false}
      api.area.querySelector('#cols').addEventListener('click',e=>{const el=e.target.closest('.gm-col');if(!el||bloq||fin||turno!==hum)return;const c=+el.dataset.c;if(colLibre(b,c)<0){GS.sonar.error();return}suelta(c,hum)});
      api.botones([]);estado();if(turno===ia)turnoIA();
      return{tablero:()=>b.map(f=>f.slice()),colLibre:c=>colLibre(b,c),cuatro:()=>cuatro(b)};
    }
  });
}

/* ---------------------------------------------------------------------
   3) DAMAS (reglas americanas: captura obligatoria, saltos múltiples, damas coronadas)
   --------------------------------------------------------------------- */
function initCheckers(cont){
  const N=8,sgn=Math.sign;
  const inicial=()=>{const b=Array.from({length:N},()=>Array(N).fill(0));for(let r=0;r<N;r++)for(let c=0;c<N;c++)if((r+c)%2===1){if(r<3)b[r][c]=-1;else if(r>4)b[r][c]=1}return b};
  const dirsDe=(p)=>Math.abs(p)===2?[[-1,-1],[-1,1],[1,-1],[1,1]]:(p>0?[[-1,-1],[-1,1]]:[[1,-1],[1,1]]);
  const dentro=(r,c)=>r>=0&&r<N&&c>=0&&c<N;
  const filaCorona=s=>s>0?0:N-1;
  function saltos(b,r,c,p,caps,path,out){
    let alguno=false;
    for(const [dr,dc] of dirsDe(p)){const mr=r+dr,mc=c+dc,lr=r+2*dr,lc=c+2*dc;
      if(!dentro(lr,lc)||b[lr][lc]!==0)continue;const m=b[mr][mc];if(!m||sgn(m)===sgn(p))continue;
      alguno=true;const m0=b[mr][mc];b[mr][mc]=0;
      const corona=Math.abs(p)===1&&lr===filaCorona(sgn(p));
      const np=corona?2*sgn(p):p;
      if(corona)out.push({path:[...path,[lr,lc]],caps:[...caps,[mr,mc]],corona:true});
      else{const n0=out.length;saltos(b,lr,lc,p,[...caps,[mr,mc]],[...path,[lr,lc]],out);if(out.length===n0)out.push({path:[...path,[lr,lc]],caps:[...caps,[mr,mc]],corona:false})}
      b[mr][mc]=m0;
    }
    return alguno;
  }
  function movimientos(b,s){ // todas las jugadas legales del lado s (1 = abajo/humano, -1 = arriba/IA)
    const caps=[],simples=[];
    for(let r=0;r<N;r++)for(let c=0;c<N;c++){const p=b[r][c];if(!p||sgn(p)!==s)continue;
      b[r][c]=0;const out=[];saltos(b,r,c,p,[],[],out);b[r][c]=p;out.forEach(o=>caps.push({r0:r,c0:c,...o}));
      if(!caps.length)for(const [dr,dc] of dirsDe(p)){const rr=r+dr,cc=c+dc;if(dentro(rr,cc)&&!b[rr][cc])simples.push({r0:r,c0:c,path:[[rr,cc]],caps:[],corona:Math.abs(p)===1&&rr===filaCorona(s)})}}
    return caps.length?caps:simples;
  }
  function aplica(b,m){const p=b[m.r0][m.c0];b[m.r0][m.c0]=0;m.caps.forEach(([r,c])=>b[r][c]=0);const [r,c]=m.path[m.path.length-1];b[r][c]=m.corona?2*sgn(p):p}
  function eval_(b,ia){let v=0;for(let r=0;r<N;r++)for(let c=0;c<N;c++){const p=b[r][c];if(!p)continue;const s=sgn(p),k=Math.abs(p)===2;let x=k?170:100;
      if(!k)x+=(s>0?(N-1-r):r)*4;if(c>=2&&c<=5&&r>=2&&r<=5)x+=4;if(c===0||c===7)x-=2;v+=(s===ia?x:-x)}return v}
  function busca(b,prof,a,be,lado,ia,ply){
    const M=movimientos(b,lado);if(!M.length)return{v:lado===ia?-50000+ply:50000-ply};
    if(prof===0)return{v:eval_(b,ia)};
    let mejor=null;
    if(lado===ia){let v=-1e9;for(const m of M){const c=b.map(f=>f.slice());aplica(c,m);const x=busca(c,prof-1,a,be,-lado,ia,ply+1).v;if(x>v){v=x;mejor=m}a=Math.max(a,v);if(a>=be)break}return{v,m:mejor}}
    else{let v=1e9;for(const m of M){const c=b.map(f=>f.slice());aplica(c,m);const x=busca(c,prof-1,a,be,-lado,ia,ply+1).v;if(x<v){v=x;mejor=m}be=Math.min(be,v);if(a>=be)break}return{v,m:mejor}}
  }
  return GS.crear(cont,{
    id:'damas',
    intro:'Mueve tus piezas crema en diagonal hacia adelante. Si puedes capturar, estás obligado a hacerlo (y a seguir saltando si hay más piezas). Al llegar al otro extremo tu pieza se corona y puede moverse en todas direcciones. Gana quien deje al rival sin jugadas.',
    niveles:[['1','Fácil','La computadora a veces regala piezas.'],['2','Medio','Calcula unas jugadas por adelantado.'],['3','Difícil','Calcula a fondo: no regala nada.']],
    iniciar(api,nivel,opc){
      let b=inicial(),turno=1,sel=null,cand=[],ultimo=[],cadena=null,fin=false,bloq=false,capH=0,sinProgreso=0,jug=0;
      const CR='#f4ead8',CRb='#c9b79a',RO='#b3342a',ROb='#7a1f19';
      const casilla=100;
      api.area.innerHTML=`<svg class="gm-svg" id="dm" viewBox="0 0 800 800" style="max-width:560px" role="grid" aria-label="Tablero de damas"></svg>`;
      const svgEl=api.area.querySelector('#dm');
      const corona=(x,y,c)=>`<path d="M${x-22} ${y+12}l-4-24 14 11 12-17 12 17 14-11-4 24z" fill="${c}" stroke="rgba(0,0,0,.35)" stroke-width="2" stroke-linejoin="round"/>`;
      function pintar(){
        let h='<rect x="0" y="0" width="800" height="800" rx="18" fill="#7a5230"/>';
        for(let r=0;r<N;r++)for(let c=0;c<N;c++){const osc=(r+c)%2===1;h+=`<rect data-r="${r}" data-c="${c}" x="${c*casilla}" y="${r*casilla}" width="${casilla}" height="${casilla}" fill="${osc?'#8b5a2b':'#f0d9b5'}" class="dm-c"/>`;}
        ultimo.forEach(([r,c])=>h+=`<rect x="${c*casilla}" y="${r*casilla}" width="100" height="100" fill="#ffe246" fill-opacity=".45" pointer-events="none"/>`);
        if(sel)h+=`<rect x="${sel[1]*casilla}" y="${sel[0]*casilla}" width="100" height="100" fill="#82c85a" fill-opacity=".6" pointer-events="none"/>`;
        cand.forEach(m=>{const [r,c]=m.path[0];h+=`<circle cx="${c*casilla+50}" cy="${r*casilla+50}" r="17" fill="#2e8b3a" fill-opacity=".6" pointer-events="none"/>`});
        for(let r=0;r<N;r++)for(let c=0;c<N;c++){const p=b[r][c];if(!p)continue;const x=c*casilla+50,y=r*casilla+50,h1=p>0;
          h+=`<g pointer-events="none"><ellipse cx="${x}" cy="${y+7}" rx="35" ry="30" fill="rgba(0,0,0,.28)"/><circle cx="${x}" cy="${y}" r="35" fill="${h1?CR:RO}" stroke="${h1?CRb:ROb}" stroke-width="5"/><circle cx="${x}" cy="${y}" r="23" fill="none" stroke="${h1?CRb:ROb}" stroke-width="3" stroke-opacity=".7"/>${Math.abs(p)===2?corona(x,y,'#f2b84b'):''}</g>`}
        svgEl.innerHTML=h;
      }
      const estado=()=>api.estado(fin?'':(turno===1?`<span class="ic">${GS.ICO.persona}</span>${cadena?'Sigue saltando con la misma pieza':'Tu turno · piezas crema'}`:`<span class="ic">${GS.ICO.robot}</span>La computadora piensa…`)+`<span style="margin-left:auto;font-size:12.5px;color:var(--muted)">Piezas: ${cuenta(1)} / ${cuenta(-1)}</span>`);
      const cuenta=s=>b.flat().filter(p=>p&&sgn(p)===s).length;
      function revisaFin(){
        const M=movimientos(b,turno);
        if(!M.length){fin=true;const gano=turno===-1;estado();pintar();
          if(gano)api.fin({tipo:'gana',titulo:'¡Ganaste!',sub:'dejaste sin jugadas a la computadora',puntos:200*nivel+cuenta(1)*15+capH*10,det:`${capH} capturas`});
          else api.fin({tipo:'pierde',titulo:'Perdiste',sub:'No te quedan jugadas',puntos:capH*10,det:`${capH} capturas`});return true}
        if(sinProgreso>=80){fin=true;estado();api.fin({tipo:'empate',titulo:'¡Tablas!',sub:'Sin capturas durante 40 jugadas cada uno',puntos:60*nivel+capH*10,det:`${capH} capturas`});return true}
        return false;
      }
      function ejecutaIA(m){
        const p=b[m.r0][m.c0];aplica(b,m);ultimo=[[m.r0,m.c0],m.path[m.path.length-1]];sinProgreso=(m.caps.length||Math.abs(p)===1)?0:sinProgreso+1;
        if(m.caps.length)GS.sonar.captura();else GS.sonar.ficha();turno=1;sel=null;cand=[];
      }
      async function turnoIA(){
        bloq=true;estado();await GS.wait(500);if(fin)return;
        const M=movimientos(b,-1);let m;
        if(nivel==='1'){m=Math.random()<.4?GS.pick(M):(busca(b,2,-1e9,1e9,-1,-1,0).m||GS.pick(M))}
        else m=busca(b,nivel==='2'?4:6,-1e9,1e9,-1,-1,0).m||GS.pick(M);
        ejecutaIA(m);if(!revisaFin()){pintar();estado();bloq=false}
      }
      function elegirPieza(r,c){
        const M=movimientos(b,1),propias=M.filter(m=>m.r0===r&&m.c0===c);
        if(!propias.length){GS.sonar.error();return false}
        sel=[r,c];cand=propias;pintar();GS.tono(520,.05);return true;
      }
      svgEl.addEventListener('click',e=>{
        const t=e.target.closest('.dm-c');if(!t||fin||bloq||turno!==1)return;const r=+t.dataset.r,c=+t.dataset.c;
        // ¿destino de una jugada candidata?
        const m=cand.find(x=>x.path[0][0]===r&&x.path[0][1]===c);
        if(sel&&m){
          const sigs=cand.filter(x=>x.path[0][0]===r&&x.path[0][1]===c);
          const p=b[sel[0]][sel[1]];b[sel[0]][sel[1]]=0;
          const esSalto=m.caps.length>0;if(esSalto){const [cr,cc]=m.caps[0];b[cr][cc]=0;capH++;api.puntos(capH*10+jug);GS.sonar.captura()}else GS.sonar.ficha();
          b[r][c]=p;ultimo=[sel,[r,c]];
          const resto=sigs.map(x=>({r0:r,c0:c,path:x.path.slice(1),caps:x.caps.slice(1),corona:x.corona})).filter(x=>x.path.length>0);
          if(esSalto&&resto.length){cadena=true;sel=[r,c];cand=resto;pintar();estado();return}
          // fin del turno
          if(m.corona||(Math.abs(p)===1&&r===filaCorona(1)))b[r][c]=2;
          cadena=null;sel=null;cand=[];jug++;sinProgreso=(esSalto||Math.abs(p)===1)?0:sinProgreso+1;api.puntos(capH*10+jug);
          turno=-1;if(!revisaFin()){pintar();estado();turnoIA()}return;
        }
        if(cadena)return; // debe terminar la cadena de saltos
        if(b[r][c]>0)elegirPieza(r,c);else{sel=null;cand=[];pintar()}
      });
      api.botones([]);pintar();estado();
      return{tablero:()=>b.map(f=>f.slice()),movimientos,cargar(t){b=t.map(f=>f.slice());turno=1;sel=null;cand=[];cadena=null;fin=false;bloq=false;pintar();estado()}};
    }
  });
}

/* ---------------------------------------------------------------------
   4) SUDOKU
   --------------------------------------------------------------------- */
function initSudoku(cont){
  function resuelve(g,limite,aleatorio){ // cuenta soluciones (hasta "limite") y devuelve la primera
    const f=Array(9).fill(0),c=Array(9).fill(0),b=Array(9).fill(0);let n=0,primera=null;
    for(let i=0;i<81;i++){const v=g[i];if(v){const bit=1<<v,r=Math.floor(i/9),k=i%9,bx=Math.floor(r/3)*3+Math.floor(k/3);f[r]|=bit;c[k]|=bit;b[bx]|=bit}}
    const a=g.slice();
    function rec(){
      let mejor=-1,mc=10,mm=0;
      for(let i=0;i<81;i++){if(a[i])continue;const r=Math.floor(i/9),k=i%9,bx=Math.floor(r/3)*3+Math.floor(k/3);const m=~(f[r]|c[k]|b[bx])&0x3FE;let q=0,x=m;while(x){q++;x&=x-1}if(q<mc){mc=q;mejor=i;mm=m;if(q<=1)break}}
      if(mejor<0){n++;if(!primera)primera=a.slice();return n>=limite}
      if(mc===0)return false;
      const r=Math.floor(mejor/9),k=mejor%9,bx=Math.floor(r/3)*3+Math.floor(k/3);let ds=[];for(let d=1;d<=9;d++)if(mm&(1<<d))ds.push(d);
      if(aleatorio)ds=GS.shuffle(ds);
      for(const d of ds){const bit=1<<d;a[mejor]=d;f[r]|=bit;c[k]|=bit;b[bx]|=bit;if(rec())return true;a[mejor]=0;f[r]&=~bit;c[k]&=~bit;b[bx]&=~bit}
      return false;
    }
    rec();return{n,primera};
  }
  function generar(pistas){
    const sol=resuelve(Array(81).fill(0),1,true).primera,p=sol.slice();
    const orden=GS.shuffle([...Array(81).keys()]);let quedan=81;const t0=Date.now();
    for(const i of orden){if(quedan<=pistas||Date.now()-t0>1800)break;const v=p[i];p[i]=0;if(resuelve(p,2,false).n!==1)p[i]=v;else quedan--}
    return{sol,puzzle:p};
  }
  return GS.crear(cont,{
    id:'sudoku',
    intro:'Completa la cuadrícula con números del 1 al 9 sin repetirlos en ninguna fila, columna ni caja de 3×3. Toca una casilla y luego un número (o usa el teclado).',
    niveles:[['1','Fácil','Muchas pistas iniciales (unas 40).'],['2','Medio','Unas 32 pistas.'],['3','Difícil','Pocas pistas (unas 26).']],
    iniciar(api,nivel,opc){
      const pistasN={1:40,2:32,3:26}[nivel],{sol,puzzle}=generar(pistasN);
      const v=puzzle.slice(),fijo=puzzle.map(x=>!!x),notas=Array.from({length:81},()=>new Set());
      let sel=-1,modoNotas=false,errores=0,pistas=0,t0=Date.now(),fin=false,ok=0,tm=0;
      api.area.innerHTML=`<svg class="gm-svg" id="su" viewBox="0 0 450 450" style="max-width:500px" role="grid" aria-label="Cuadrícula de sudoku"></svg>
        <div id="pad" class="gm-bar" style="max-width:500px;width:100%;flex-wrap:nowrap;gap:5px">${[1,2,3,4,5,6,7,8,9].map(d=>`<button class="btn ghost su-n" data-d="${d}" style="flex:1;min-width:0;padding:10px 0;font-size:18px">${d}</button>`).join('')}</div>`;
      const svgEl=api.area.querySelector('#su');
      const conflicto=i=>{const x=v[i];if(!x)return false;const r=Math.floor(i/9),c=i%9;for(let k=0;k<81;k++){if(k===i||v[k]!==x)continue;const r2=Math.floor(k/9),c2=k%9;if(r2===r||c2===c||(Math.floor(r2/3)===Math.floor(r/3)&&Math.floor(c2/3)===Math.floor(c/3)))return true}return false};
      function pintar(){
        let h='<rect x="0" y="0" width="450" height="450" rx="14" fill="#fffdf8"/>';
        const sv=sel>=0?v[sel]:0,sr=sel>=0?Math.floor(sel/9):-9,sc=sel>=0?sel%9:-9;
        for(let i=0;i<81;i++){const r=Math.floor(i/9),c=i%9,x=c*50,y=r*50;
          let fill='#fffdf8';if(sel>=0&&(r===sr||c===sc||(Math.floor(r/3)===Math.floor(sr/3)&&Math.floor(c/3)===Math.floor(sc/3))))fill='#fbe8d8';
          if(sv&&v[i]===sv)fill='#f7cfa8';if(i===sel)fill='#f5b88a';
          h+=`<rect class="su-c" data-i="${i}" x="${x}" y="${y}" width="50" height="50" fill="${fill}"/>`;
          if(v[i]){const mal=conflicto(i)||(!fijo[i]&&v[i]!==sol[i]&&false);h+=`<text x="${x+25}" y="${y+35}" text-anchor="middle" font-family="Nunito,Arial,sans-serif" font-weight="${fijo[i]?800:700}" font-size="30" fill="${mal?'#d9473a':fijo[i]?'#3b2a22':'#1f6fbd'}" pointer-events="none">${v[i]}</text>`}
          else if(notas[i].size){notas[i].forEach(d=>{const nx=x+8+((d-1)%3)*17,ny=y+16+Math.floor((d-1)/3)*15;h+=`<text x="${nx+4}" y="${ny}" text-anchor="middle" font-size="12" font-family="Nunito,Arial,sans-serif" fill="#8d6d5a" pointer-events="none">${d}</text>`})}}
        for(let k=0;k<=9;k++){const w=k%3===0?3.5:1;h+=`<path d="M${k*50} 0V450M0 ${k*50}H450" stroke="#6b4a3a" stroke-width="${w}" stroke-linecap="square" pointer-events="none"/>`}
        svgEl.innerHTML=h;
      }
      const resumen=()=>api.estado(fin?'':`<span class="ic">${GS.ICO.reloj}</span><span id="suT">${tiempo()}</span><span style="margin-left:14px;color:var(--muted);font-size:13px">Errores: ${errores} · Pistas: ${pistas}</span>`);
      const tiempo=()=>{const s=Math.floor((Date.now()-t0)/1000);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
      const reloj=setInterval(()=>{if(fin)return;const e=document.getElementById('suT');if(e)e.textContent=tiempo()},1000);
      function termina(){
        fin=true;clearInterval(reloj);const seg=Math.floor((Date.now()-t0)/1000);resumen();
        const base={1:300,2:600,3:1000}[nivel],bono=Math.max(0,{1:600,2:900,3:1500}[nivel]-seg)*2,pen=pistas*50+errores*20,pts=Math.max(50,base+bono-pen);
        api.fin({tipo:'gana',titulo:'¡Sudoku resuelto!',sub:'cuadrícula completa',puntos:pts,det:`${tiempo()} · ${errores} errores · ${pistas} pistas`});
      }
      function poner(d){
        if(fin||sel<0||fijo[sel])return;
        if(modoNotas&&d){if(v[sel])return;notas[sel].has(d)?notas[sel].delete(d):notas[sel].add(d);pintar();return}
        if(!d){v[sel]=0;notas[sel].clear();pintar();return}
        v[sel]=d;notas[sel].clear();
        if(d!==sol[sel]){errores++;GS.sonar.error()}else{ok++;GS.sonar.ficha();api.puntos(ok*5-errores*2<0?0:ok*5-errores*2)}
        // quita la nota de ese número en fila/columna/caja
        const r=Math.floor(sel/9),c=sel%9;for(let k=0;k<81;k++){const r2=Math.floor(k/9),c2=k%9;if(r2===r||c2===c||(Math.floor(r2/3)===Math.floor(r/3)&&Math.floor(c2/3)===Math.floor(c/3)))notas[k].delete(d)}
        pintar();resumen();
        if(v.every((x,i)=>x===sol[i]))termina();
      }
      svgEl.addEventListener('click',e=>{const c=e.target.closest('.su-c');if(!c)return;sel=+c.dataset.i;pintar()});
      api.area.querySelector('#pad').addEventListener('click',e=>{const b=e.target.closest('.su-n');if(b)poner(+b.dataset.d)});
      const tecla=e=>{if(fin)return;if(/^[1-9]$/.test(e.key))poner(+e.key);else if(e.key==='Backspace'||e.key==='Delete'||e.key==='0')poner(0);
        else if(sel>=0&&e.key.startsWith('Arrow')){e.preventDefault();const r=Math.floor(sel/9),c=sel%9,nr=Math.max(0,Math.min(8,r+(e.key==='ArrowDown')-(e.key==='ArrowUp'))),nc=Math.max(0,Math.min(8,c+(e.key==='ArrowRight')-(e.key==='ArrowLeft')));sel=nr*9+nc;pintar()}};
      document.addEventListener('keydown',tecla);
      api.botones([
        {txt:'Notas: no',ico:'pista',id:'suNotas',fn:()=>{modoNotas=!modoNotas;const b=document.getElementById('suNotas');b.lastChild.textContent='';b.innerHTML=GS.ICO.pista+'Notas: '+(modoNotas?'sí':'no');b.style.background=modoNotas?'var(--accent)':'';}},
        {txt:'Borrar',ico:'borrar',fn:()=>poner(0)},
        {txt:'Pista',ico:'pista',fn:()=>{if(fin)return;let i=sel>=0&&!fijo[sel]&&v[sel]!==sol[sel]?sel:v.findIndex((x,k)=>x!==sol[k]);if(i<0)return;sel=i;v[i]=sol[i];fijo[i]=true;pistas++;notas[i].clear();GS.sonar.ficha();pintar();resumen();if(v.every((x,k)=>x===sol[k]))termina()}}
      ]);
      pintar();resumen();
      return{destruir(){clearInterval(reloj);document.removeEventListener('keydown',tecla)},solucion:()=>sol.slice(),valores:()=>v.slice()};
    }
  });
}

/* ---------------------------------------------------------------------
   5) TORRE DE HANÓI
   --------------------------------------------------------------------- */
function initHanoi(cont){
  const COL=['#e53935','#fb8c00','#fdd835','#43a047','#1e88e5','#8e24aa','#6d4c41'];
  function plan(pos,k,dest,out){ // jugadas óptimas desde cualquier estado legal (k = 0 es el disco mayor)
    if(k>=pos.length)return;
    if(pos[k]===dest){plan(pos,k+1,dest,out);return}
    const otro=3-pos[k]-dest;plan(pos,k+1,otro,out);out.push([k,pos[k],dest]);pos[k]=dest;plan(pos,k+1,dest,out);
  }
  return GS.crear(cont,{
    id:'hanoi',
    intro:'Pasa todos los discos de la primera torre a la última. Solo puedes mover un disco a la vez (el de arriba) y nunca poner uno grande sobre uno más chico. Toca una torre para elegir el disco de arriba y luego la torre destino.',
    niveles:[['1','Fácil','3 discos (mínimo 7 movimientos).'],['2','Medio','5 discos (mínimo 31 movimientos).'],['3','Difícil','7 discos (mínimo 127 movimientos).']],
    iniciar(api,nivel,opc){
      const n={1:3,2:5,3:7}[nivel],optimo=Math.pow(2,n)-1;
      let torres=[Array.from({length:n},(_,i)=>n-i),[],[]],sel=-1,mov=0,fin=false,hist=[],pista=null;
      api.area.innerHTML=`<svg class="gm-svg" id="hn" viewBox="0 0 600 300" style="max-width:640px" role="application" aria-label="Torre de Hanói"></svg>`;
      const svgEl=api.area.querySelector('#hn');
      const estado=()=>api.estado(fin?'':`<span>Movimientos: <b>${mov}</b> · mínimo posible: ${optimo}</span>`);
      function pintar(){
        let h='<rect x="0" y="0" width="600" height="300" rx="18" fill="#fff6e6"/><rect x="20" y="258" width="560" height="14" rx="7" fill="#8b5a2b"/>';
        for(let t=0;t<3;t++){const cx=100+t*200;
          h+=`<g class="hn-t" data-t="${t}" style="cursor:pointer"><rect x="${cx-95}" y="20" width="190" height="245" fill="#000" fill-opacity="0"/><rect x="${cx-6}" y="52" width="12" height="206" rx="6" fill="#a9733f"/>`;
          if(t===sel)h+=`<rect x="${cx-92}" y="30" width="184" height="228" rx="14" fill="#82c85a" fill-opacity=".25"/>`;
          if(pista&&pista[2]===t)h+=`<rect x="${cx-92}" y="30" width="184" height="228" rx="14" fill="none" stroke="#2e8b3a" stroke-width="4" stroke-dasharray="8 6"/>`;
          torres[t].forEach((d,i)=>{const w=40+d*(120/n),alto=Math.min(26,190/n),y=258-(i+1)*alto-(t===sel&&i===torres[t].length-1?22:0);
            const resalta=pista&&pista[1]===t&&i===torres[t].length-1;h+=`<rect x="${cx-w/2}" y="${y}" width="${w}" height="${alto-3}" rx="9" fill="${COL[(d-1)%COL.length]}" stroke="${resalta?'#2e8b3a':'rgba(0,0,0,.25)'}" stroke-width="${resalta?5:2}"/>`});
          h+='</g>'}
        svgEl.innerHTML=h;
      }
      function revisa(){if(torres[2].length===n){fin=true;estado();const pts=Math.round(1000*optimo/mov)+n*50;api.fin({tipo:'gana',titulo:'¡Torre completa!',sub:'moviste todos los discos',puntos:pts,det:`${mov} movimientos (mínimo ${optimo})`})}}
      svgEl.addEventListener('click',e=>{
        const g=e.target.closest('.hn-t');if(!g||fin)return;const t=+g.dataset.t;pista=null;
        if(sel<0){if(!torres[t].length){GS.sonar.error();return}sel=t;GS.tono(520,.05);pintar();return}
        if(t===sel){sel=-1;pintar();return}
        const d=torres[sel][torres[sel].length-1],top=torres[t][torres[t].length-1];
        if(top&&top<d){GS.sonar.error();api.msg('Un disco grande no puede ir sobre uno más chico.');setTimeout(()=>api.msg(''),1400);sel=-1;pintar();return}
        hist.push(JSON.stringify(torres));torres[sel].pop();torres[t].push(d);sel=-1;mov++;api.puntos(mov*2);GS.sonar.ficha();pintar();estado();revisa();
      });
      api.botones([
        {txt:'Deshacer',ico:'deshacer',fn:()=>{if(fin||!hist.length)return;torres=JSON.parse(hist.pop());mov=Math.max(0,mov-1);sel=-1;pista=null;api.puntos(mov*2);pintar();estado()}},
        {txt:'Pista',ico:'pista',fn:()=>{if(fin)return;const pos=Array(n).fill(0);torres.forEach((tt,ti)=>tt.forEach(d=>pos[n-d]=ti));const out=[];plan(pos,0,2,out);if(out.length){const [k,de,a]=out[0];pista=[k,de,a];sel=-1;pintar();setTimeout(()=>{pista=null;if(!fin)pintar()},2200)}}}
      ]);
      pintar();estado();
      return{torres:()=>torres.map(x=>x.slice())};
    }
  });
}

/* =====================================================================
   juegos-ciudad.js · CONSTRUCTOR DE CIUDADES
   Coloca calles y edificios, equilibra empleos, energía, dinero y felicidad
   y haz crecer tu población hasta la meta antes de que acaben los meses.
   Uso: initCiudad(document.getElementById('game-container'))
   ===================================================================== */
const C_TS=54,C_COLS=10,C_ROWS=8;
const C_AGUA=[6,6,7,7,7,6,6,6];                 // columna de río en cada fila
const C_HALL=[2,3];                              // ayuntamiento (col,fila)
const C_TIPOS={
  calle:{n:'Calle',c:10,m:0,d:'Las casas, tiendas, fábricas y escuelas necesitan una calle (o el ayuntamiento) junto a su lote.'},
  casa:{n:'Casa',c:100,m:1,viv:6,en:1,d:'Vivienda para 6 personas. Necesita calle y electricidad.'},
  edificio:{n:'Edificio',c:420,m:4,viv:28,en:4,d:'Vivienda para 28 personas. Consume mucha energía.'},
  tienda:{n:'Tienda',c:150,m:3,emp:6,en:1,ing:60,d:'6 empleos. Gana más cuanta más gente vive en la ciudad.'},
  fabrica:{n:'Fábrica',c:340,m:8,emp:24,en:5,ing:140,pol:1,d:'24 empleos y buenos ingresos, pero contamina las casas cercanas.'},
  escuela:{n:'Escuela',c:260,m:6,emp:8,en:2,fel:6,d:'8 empleos y sube la felicidad de toda la ciudad.'},
  parque:{n:'Parque',c:90,m:1,par:1,d:'Sube la felicidad de las viviendas a 2 casillas de distancia.'},
  planta:{n:'Planta eléctrica',c:260,m:8,prod:16,pol:.5,d:'Produce 16 de energía. Contamina un poco.'},
  demoler:{n:'Demoler',c:0,m:0,d:'Quita un edificio y recupera la mitad de su costo.'}
};
const C_ORDEN=['calle','casa','edificio','tienda','fabrica','escuela','parque','planta','demoler'];
const _cr=(c,t=0)=>t;
/* ---------- dibujos 54×54 ---------- */
const C_SOMB='<ellipse cx="27" cy="49" rx="19" ry="4" fill="#000" fill-opacity=".18"/>';
const C_DIB={
  casa:v=>{const tej=['#d9473a','#3f7fd1','#e0a02a','#7a5ac8','#2e9e63'][v%5],par=['#fff1d6','#ffe3c8','#e8f1ff'][v%3];
    return `${C_SOMB}<rect x="33" y="8" width="7" height="14" fill="#a0522d" stroke="#6b3a1c" stroke-width="1.400"/><rect x="11" y="24" width="32" height="24" rx="2" fill="${par}" stroke="#6b4a30" stroke-width="1.600"/><path d="M6 27L27 8L48 27z" fill="${tej}" stroke="#4a2a1a" stroke-width="1.800" stroke-linejoin="round"/><path d="M13 24L27 12L41 24" stroke="#fff" stroke-opacity=".3" stroke-width="2" fill="none"/><rect x="23" y="34" width="9" height="14" rx="4.500" fill="#8a5a30" stroke="#4a2a1a" stroke-width="1.200"/><circle cx="29.500" cy="41.500" r=".9" fill="#ffd54a"/><g fill="#9fd4ff" stroke="#6b4a30" stroke-width="1.200"><rect x="14" y="30" width="7" height="7"/><rect x="35" y="30" width="7" height="7"/></g><path d="M17.500 30v7M14 33.500h7M38.500 30v7M35 33.500h7" stroke="#6b4a30" stroke-width=".8"/>`},
  edificio:v=>{const col=['#8fb4d9','#d9a0a0','#a9c98a','#c9b0e0'][v%4];let w='';for(let r=0;r<5;r++)for(let c=0;c<3;c++)w+=`<rect x="${14+c*10}" y="${10+r*7.500}" width="6" height="5" rx=".8" fill="${(r*3+c+v)%4===0?'#ffe27a':'#e8f4ff'}" stroke="#4a5a70" stroke-width=".6"/>`;
    return `${C_SOMB}<rect x="10" y="5" width="34" height="43" rx="2" fill="${col}" stroke="#3a4a5f" stroke-width="1.800"/><rect x="8" y="3" width="38" height="5" rx="1.500" fill="#5a6b80" stroke="#3a4a5f" stroke-width="1.400"/>${w}<rect x="23" y="38" width="8" height="10" rx="1.500" fill="#4a5a70"/><rect x="24" y="0" width="1.600" height="4" fill="#3a4a5f"/>`},
  tienda:v=>{const a=['#e8472f','#2f7fd1','#2e9e63'][v%3];let aw='';for(let i=0;i<6;i++)aw+=`<path d="M${8+i*6.300} 18h6.300v5a3.150 3.150 0 0 1-6.300 0z" fill="${i%2?'#fff':a}" stroke="#4a2a1a" stroke-width=".9"/>`;
    return `${C_SOMB}<rect x="9" y="14" width="36" height="34" rx="2" fill="#fff4dc" stroke="#6b4a30" stroke-width="1.600"/><rect x="7" y="10" width="40" height="9" rx="2" fill="${a}" stroke="#4a2a1a" stroke-width="1.400"/>${aw}<rect x="13" y="30" width="14" height="12" fill="#bfe6ff" stroke="#6b4a30" stroke-width="1.200"/><rect x="31" y="30" width="9" height="18" rx="1.500" fill="#8a5a30" stroke="#4a2a1a" stroke-width="1.200"/><path d="M16 36h8" stroke="#fff" stroke-opacity=".7" stroke-width="2" stroke-linecap="round"/><circle cx="27" cy="6" r="3.500" fill="#ffd54a" stroke="#b88700" stroke-width="1"/>`},
  fabrica:v=>`${C_SOMB}<g fill="#cfd5dd" fill-opacity=".85"><circle cx="38" cy="5" r="3"><animate attributeName="cy" values="10;-2" dur="2.600s" repeatCount="indefinite"/><animate attributeName="opacity" values=".8;0" dur="2.600s" repeatCount="indefinite"/></circle><circle cx="41" cy="9" r="2.400"><animate attributeName="cy" values="12;2" dur="3s" begin="-1s" repeatCount="indefinite"/><animate attributeName="opacity" values=".8;0" dur="3s" begin="-1s" repeatCount="indefinite"/></circle></g><rect x="34" y="8" width="8" height="26" fill="#8a4a3a" stroke="#4a241a" stroke-width="1.400"/><rect x="33" y="6" width="10" height="4" fill="#5a2a1a"/><path d="M5 48V26l11 -7v7l11 -7v7l11 -7v29z" fill="#9aa5b4" stroke="#3a4558" stroke-width="1.800" stroke-linejoin="round"/><rect x="5" y="30" width="42" height="18" fill="#b8c2d0" stroke="#3a4558" stroke-width="1.600"/><g fill="#ffe27a" stroke="#3a4558" stroke-width="1"><rect x="9" y="34" width="7" height="6"/><rect x="19" y="34" width="7" height="6"/></g><rect x="33" y="36" width="10" height="12" fill="#5a6678" stroke="#3a4558" stroke-width="1.200"/>`,
  escuela:v=>`${C_SOMB}<rect x="7" y="22" width="40" height="26" rx="2" fill="#ffe2b0" stroke="#6b4a30" stroke-width="1.600"/><path d="M4 24L27 10L50 24z" fill="#c43a25" stroke="#7a1f16" stroke-width="1.600" stroke-linejoin="round"/><rect x="23" y="4" width="8" height="10" fill="#fff4dc" stroke="#6b4a30" stroke-width="1.200"/><path d="M22 5L27 1L32 5z" fill="#c43a25"/><circle cx="27" cy="9" r="2" fill="#ffd54a"/><path d="M27 1V-3" stroke="#6b4a30" stroke-width="1"/><g fill="#9fd4ff" stroke="#6b4a30" stroke-width="1.100"><rect x="11" y="28" width="7" height="8"/><rect x="36" y="28" width="7" height="8"/></g><rect x="22" y="34" width="10" height="14" rx="5" fill="#8a5a30" stroke="#4a2a1a" stroke-width="1.200"/><path d="M42 24V14l6 3-6 3" fill="#e8472f" stroke="#7a1f16" stroke-width=".8"/>`,
  parque:v=>`<rect x="3" y="6" width="48" height="44" rx="10" fill="#8edc6a" stroke="#4f9a3a" stroke-width="1.800"/><ellipse cx="27" cy="38" rx="11" ry="6" fill="#7ac4f0" stroke="#3f86b8" stroke-width="1.400"/><path d="M21 38q3 -2 6 0t6 0" stroke="#fff" stroke-opacity=".7" stroke-width="1.200" fill="none"/><g><rect x="11" y="20" width="3.500" height="10" fill="#7a5230"/><circle cx="12.500" cy="16" r="8" fill="#3f9a4d"/><circle cx="9" cy="19" r="5" fill="#58b865"/></g><g><rect x="38" y="16" width="3.500" height="10" fill="#7a5230"/><circle cx="39.500" cy="12" r="7.500" fill="#3f9a4d"/><circle cx="43" cy="15" r="4.500" fill="#58b865"/></g><g fill="#ff6b8a"><circle cx="18" cy="46" r="2"/><circle cx="36" cy="47" r="2" fill="#ffd54a"/><circle cx="44" cy="40" r="2" fill="#fff"/></g><rect x="20" y="26" width="14" height="3" rx="1.500" fill="#a0653a" stroke="#6b3a1c" stroke-width=".8"/>`,
  planta:v=>`${C_SOMB}<g fill="#fff" fill-opacity=".8"><circle cx="40" cy="6" r="3.500"><animate attributeName="cy" values="12;-2" dur="2.800s" repeatCount="indefinite"/><animate attributeName="opacity" values=".8;0" dur="2.800s" repeatCount="indefinite"/></circle></g><path d="M34 8h12l3 26H31z" fill="#c9ced6" stroke="#5a6672" stroke-width="1.600" stroke-linejoin="round"/><rect x="5" y="26" width="30" height="22" rx="2" fill="#aeb9c8" stroke="#3a4558" stroke-width="1.600"/><rect x="31" y="32" width="18" height="16" fill="#8f9bad" stroke="#3a4558" stroke-width="1.400"/><path d="M22 28L14 38h7l-3 9 10-12h-7z" fill="#ffd54a" stroke="#b88700" stroke-width="1.200" stroke-linejoin="round"/><rect x="36" y="38" width="8" height="10" fill="#5a6678"/>`,
  hall:v=>`${C_SOMB}<rect x="6" y="26" width="42" height="22" fill="#f4ecd8" stroke="#8a7a58" stroke-width="1.600"/><path d="M3 27L27 12L51 27z" fill="#e8dcc0" stroke="#8a7a58" stroke-width="1.600" stroke-linejoin="round"/><circle cx="27" cy="21" r="3.500" fill="#2f7fd1" stroke="#fff" stroke-width="1"/><g fill="#fff" stroke="#8a7a58" stroke-width="1.100"><rect x="10" y="28" width="4" height="20"/><rect x="19" y="28" width="4" height="20"/><rect x="31" y="28" width="4" height="20"/><rect x="40" y="28" width="4" height="20"/></g><path d="M24 48V38a3 3 0 0 1 6 0v10z" fill="#6b4a30"/><path d="M27 12V3" stroke="#6b4a30" stroke-width="1.400"/><path d="M27 3h9l-2.500 2.500L36 8h-9z" fill="#e8472f" stroke="#7a1f16" stroke-width=".8"/>`
};
const C_ICO=id=>`<svg viewBox="0 0 54 54">${id==='calle'?'<rect x="3" y="3" width="48" height="48" rx="10" fill="#cfe9a8"/><path d="M0 27H54" stroke="#d9d2c3" stroke-width="32"/><path d="M0 27H54" stroke="#6b7280" stroke-width="24"/><path d="M0 27H54" stroke="#fff" stroke-width="2.400" stroke-dasharray="7 6"/>':id==='demoler'?'<rect x="9" y="22" width="36" height="26" rx="3" fill="#e8a9a0" stroke="#a52a1e" stroke-width="2"/><path d="M12 22l5-12 24 4-3 8" fill="#cfd5dd" stroke="#5a6672" stroke-width="2" stroke-linejoin="round"/><path d="M18 30l18 12M36 30L18 42" stroke="#a52a1e" stroke-width="3" stroke-linecap="round"/>':C_DIB[id](1)}</svg>`;

function initCiudad(cont){
  return GS.crear(cont,{
    id:'ciudad',
    intro:'Elige un edificio y toca el mapa para construir. Casas y tiendas necesitan una calle (o el ayuntamiento) a su lado. Equilibra viviendas con empleos, produce energía suficiente, evita que las fábricas contaminen las casas y construye parques y escuelas para mantener contenta a la gente. El tiempo corre por meses (puedes pausar o acelerar). Llega a la población meta sin quedarte sin dinero. Atajos: 1–9 construir, P pausa, N siguiente mes.',
    niveles:[['1','Fácil','24 meses · 120 habitantes · $1,100 iniciales.'],['2','Medio','28 meses · 260 habitantes · $900 iniciales.'],['3','Difícil','32 meses · 400 habitantes · $800 iniciales y meses más rápidos.']],
    iniciar(api,nivel){
      const P={1:{meses:24,meta:120,din:1100,mes:7},2:{meses:28,meta:260,din:900,mes:6},3:{meses:32,meta:400,din:800,mes:5}}[nivel];
      const W=C_TS*C_COLS,H=C_TS*C_ROWS;
      const esc=GS.escena(api,{w:W,h:H,max:600,fondo:'#8edc6a',aria:'Constructor de ciudades'}),E=esc.el;
      esc.svg.style.cursor='pointer';
      const idx=(c,r)=>r*C_COLS+c,col=i=>i%C_COLS,fila=i=>Math.floor(i/C_COLS);
      const S={mes:1,din:P.din,pop:0,tipo:'casa',map:Array(C_COLS*C_ROWS).fill(null),agua:new Set(),arb:new Set(),fin:false,acc:0,vel:1,deuda:0,infeliz:0,ult:{ing:0,gas:0},st:{viv:0,emp:0,empl:0,uso:0,prod:0,fel:50,desempleo:0,apagon:false},hover:-1,tm:[]};
      const hall=idx(C_HALL[0],C_HALL[1]);
      for(let r=0;r<C_ROWS;r++)S.agua.add(idx(C_AGUA[r],r));
      let sd=nivel*131+7;const rnd=()=>{sd=(sd*16807)%2147483647;return sd/2147483647};
      for(let k=0;k<16;k++){const i=Math.floor(rnd()*C_COLS*C_ROWS);if(!S.agua.has(i)&&i!==hall)S.arb.add(i)}
      S.map[hall]={t:'hall',v:0};
      /* ---------- mapa ---------- */
      E('defs').innerHTML=`<linearGradient id="ciAgua" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5cb8f0"/><stop offset="1" stop-color="#3a8fd0"/></linearGradient>`;
      const capa=E('g'),tiles=[];
      for(let i=0;i<C_COLS*C_ROWS;i++){tiles.push(GS.el('g',{transform:`translate(${col(i)*C_TS} ${fila(i)*C_TS})`},capa))}
      const ghost=E('g',{display:'none'});ghost.style.pointerEvents='none';
      const flotG=E('g');flotG.style.pointerEvents='none';
      function flota(x,y,txt,colr='#fff'){
        const t=GS.el('text',{x,y,'text-anchor':'middle','font-family':'Nunito,Arial,sans-serif','font-size':15,'font-weight':900,fill:colr,stroke:'rgba(0,0,0,.55)','stroke-width':3,'paint-order':'stroke'},flotG);t.textContent=txt;
        try{t.animate([{transform:'translateY(0)',opacity:1},{transform:'translateY(-26px)',opacity:0}],{duration:900,easing:'ease-out'})}catch(e){}
        setTimeout(()=>t.remove(),920);
      }
      const esCalle=i=>i>=0&&S.map[i]&&(S.map[i].t==='calle'||S.map[i].t==='hall');
      const vecinos=i=>{const c=col(i),r=fila(i),o=[];if(r>0)o.push([idx(c,r-1),'N']);if(c<C_COLS-1)o.push([idx(c+1,r),'E']);if(r<C_ROWS-1)o.push([idx(c,r+1),'S']);if(c>0)o.push([idx(c-1,r),'O']);return o};
      function dibujaTile(i){
        const g=tiles[i],c=col(i),r=fila(i),b=S.map[i];let h='';
        if(S.agua.has(i)){
          h=`<rect width="${C_TS}" height="${C_TS}" fill="url(#ciAgua)"/><path d="M4 16q6 -5 12 0t12 0t12 0M10 36q6 -5 12 0t12 0t12 0" stroke="#fff" stroke-opacity=".6" stroke-width="2.400" fill="none" stroke-linecap="round"><animateTransform attributeName="transform" type="translate" values="-4 0;4 0;-4 0" dur="${(2.4+(i%3)*.5).toFixed(1)}s" repeatCount="indefinite"/></path>`;
        }else{
          h=`<rect width="${C_TS}" height="${C_TS}" fill="${(c+r)%2?'#86d462':'#7ccb5a'}"/>`;
          if(!b&&S.arb.has(i))h+=`<g transform="translate(27 30)"><ellipse cx="2" cy="16" rx="12" ry="3.500" fill="#000" fill-opacity=".15"/><rect x="-2.500" y="2" width="5" height="14" fill="#7a5230"/><circle cx="0" cy="-6" r="14" fill="#3f9a4d"/><circle cx="-6" cy="2" r="9" fill="#4aa857"/><circle cx="7" cy="-12" r="7" fill="#58b865"/></g>`;
          else if(!b&&(i*7)%5===0)h+=`<g fill="#fff"><circle cx="${12+(i*3)%28}" cy="${14+(i*5)%26}" r="2"/><circle cx="${16+(i*3)%28}" cy="${18+(i*5)%26}" r="1.500" fill="#ffd54a"/></g>`;
        }
        if(b){
          if(b.t==='calle'){
            const con=vecinos(i).filter(([j])=>esCalle(j)).map(x=>x[1]);const cs=con.length?con:['E','O'];
            const seg={N:'M27 27V0',E:'M27 27H54',S:'M27 27V54',O:'M27 27H0'};
            const d=cs.map(k=>seg[k]).join('');
            h+=`<path d="${d}" stroke="#d9d2c3" stroke-width="32" stroke-linecap="butt"/><circle cx="27" cy="27" r="16" fill="#d9d2c3"/><path d="${d}" stroke="#6b7280" stroke-width="24"/><circle cx="27" cy="27" r="12" fill="#6b7280"/><path d="${d}" stroke="#fff" stroke-opacity=".85" stroke-width="2.200" stroke-dasharray="6 6"/>`;
          }else h+=C_DIB[b.t](b.v);
          if(S.st.apagon&&C_TIPOS[b.t]&&C_TIPOS[b.t].en)h+=`<g transform="translate(44 10)"><circle r="8" fill="#e8472f" stroke="#fff" stroke-width="1.500"><animate attributeName="opacity" values="1;.35;1" dur="1.1s" repeatCount="indefinite"/></circle><path d="M1 -5L-3 1h3l-1 5 4-6h-3z" fill="#fff"/></g>`;
        }
        g.innerHTML=h;
      }
      const dibujaVec=i=>{dibujaTile(i);vecinos(i).forEach(([j])=>{if(S.map[j]&&S.map[j].t==='calle')dibujaTile(j)})};
      /* ---------- cálculo de la ciudad ---------- */
      const dist=(a,b)=>Math.max(Math.abs(col(a)-col(b)),Math.abs(fila(a)-fila(b)));
      function calcula(){
        let viv=0,emp=0,uso=0,prod=0,esc2=0;const resid=[],fabs=[],plantas=[],parques=[];
        S.map.forEach((b,i)=>{if(!b)return;const T=C_TIPOS[b.t];if(!T)return;
          viv+=T.viv||0;emp+=T.emp||0;uso+=T.en||0;prod+=T.prod||0;
          if(T.viv)resid.push(i);if(b.t==='fabrica')fabs.push(i);if(b.t==='planta')plantas.push(i);if(b.t==='parque')parques.push(i);if(b.t==='escuela')esc2++});
        const apagon=uso>prod;const pop=S.pop,trab=Math.floor(pop*.6),empl=Math.min(trab,emp),desemp=trab>0?1-empl/trab:0;
        let sum=0;
        resid.forEach(i=>{
          let f=55;
          const np=parques.filter(p=>dist(p,i)<=2).length;f+=Math.min(15,np*8);
          f+=Math.min(12,esc2*6);
          const pf=fabs.filter(p=>dist(p,i)<=2).length*10+plantas.filter(p=>dist(p,i)<=2).length*5;f-=Math.min(25,pf);
          f-=desemp*30;if(apagon)f-=25;if(pop>viv)f-=10;
          S.map[i].f=Math.max(0,Math.min(100,f));sum+=S.map[i].f;
        });
        const fel=resid.length?sum/resid.length:55;
        Object.assign(S.st,{viv,emp,empl,uso,prod,fel,desempleo:desemp,apagon,trab,nEsc:esc2});
        return S.st;
      }
      /* ---------- mes ---------- */
      function mes(){
        if(S.fin)return;
        const st=calcula();
        const cap=Math.min(st.viv,st.emp*3+10);
        if(st.fel>=40&&S.pop<cap)S.pop+=Math.ceil((cap-S.pop)*.3);
        else if(S.pop>st.viv)S.pop-=Math.ceil((S.pop-st.viv)*.3);
        else if(st.fel<30)S.pop=Math.max(0,S.pop-Math.ceil(S.pop*.05));
        const st2=calcula();
        let nT=0,nF=0,mant=0;S.map.forEach(b=>{if(!b)return;const T=C_TIPOS[b.t];if(!T)return;mant+=T.m||0;if(b.t==='tienda')nT++;if(b.t==='fabrica')nF++});
        const factor=st2.apagon?.6:1;
        const impuestos=S.pop*3,comercio=nT?nT*C_TIPOS.tienda.ing*Math.min(1,S.pop/(nT*10)):0,industria=nF&&st2.emp?nF*C_TIPOS.fabrica.ing*Math.min(1,st2.empl/Math.max(1,st2.emp)*1.5):0;
        const ing=Math.round((impuestos+comercio+industria)*factor),gas=Math.round(mant);
        S.din+=ing-gas;S.ult={ing,gas};
        const hx=C_HALL[0]*C_TS+27,hy=C_HALL[1]*C_TS;
        flota(hx,hy,(ing-gas>=0?'+':'')+(ing-gas),ing-gas>=0?'#ffe27a':'#ff9a8a');
        GS.tono(ing-gas>=0?640:200,.08,'triangle',.05,ing-gas>=0?900:120);
        S.deuda=S.din<0?S.deuda+1:0;S.infeliz=(S.pop>0&&st2.fel<25)?S.infeliz+1:0;
        S.mes++;api.puntos(S.pop*10);
        if(S.pop>=P.meta)return terminar(true);
        if(S.deuda>=2)return terminar(false,'Bancarrota: te quedaste sin dinero');
        if(S.infeliz>=3)return terminar(false,'La gente está demasiado descontenta');
        if(S.mes>P.meses)return terminar(false,'Se acabó el tiempo');
        refresca();S.map.forEach((b,i)=>{if(b&&C_TIPOS[b.t]&&C_TIPOS[b.t].en)dibujaTile(i)});
        if(S.mes===P.meses-2)api.msg('¡Quedan 3 meses!');
      }
      function terminar(gano,motivo=''){
        if(S.fin)return;S.fin=true;lp.parar();document.removeEventListener('keydown',tecla);
        const pts=gano?S.pop*10+Math.round(Math.max(0,S.din)/5)+(P.meses-S.mes)*20:S.pop*5;api.puntos(pts);
        if(gano)api.fin({tipo:'gana',titulo:'¡Ciudad próspera!',sub:`${S.pop} habitantes en ${S.mes-1} meses`,puntos:pts,det:`Dinero final $${Math.round(S.din)}`});
        else api.fin({tipo:'pierde',titulo:motivo||'Fin del juego',sub:`${S.pop} de ${P.meta} habitantes`,puntos:pts,det:`Mes ${S.mes-1} de ${P.meses}`});
      }
      /* ---------- construir ---------- */
      function motivo(i,t){
        if(S.fin)return 'fin';
        if(S.agua.has(i))return 'No se puede construir sobre el río';
        const b=S.map[i];
        if(t==='demoler'){if(!b)return 'Aquí no hay nada';if(b.t==='hall')return 'El ayuntamiento no se puede demoler';return ''}
        if(b)return 'Ese lote ya está ocupado';
        const T=C_TIPOS[t];if(S.din<T.c)return 'No te alcanza el dinero';
        if(t!=='calle'&&t!=='parque'&&!vecinos(i).some(([j])=>esCalle(j)))return 'Necesita una calle junto al lote';
        return '';
      }
      function construye(i,t=S.tipo){
        const m=motivo(i,t);const x=col(i)*C_TS+27,y=fila(i)*C_TS+14;
        if(m){if(m!=='fin'){flota(x,y,m.length>24?m.slice(0,22)+'…':m,'#ffb3a8');api.sonar.error&&api.sonar.error();api.msg(m)}return false}
        if(t==='demoler'){const b=S.map[i],T=C_TIPOS[b.t];const ref=Math.floor(T.c/2);S.din+=ref;S.map[i]=null;flota(x,y,'+$'+ref,'#ffe27a');GS.tono(160,.12,'sawtooth',.05,80);GS.destello(esc,x,y+12,'#c9b79c',20)}
        else{S.din-=C_TIPOS[t].c;S.arb.delete(i);S.map[i]={t,v:(col(i)*3+fila(i)*5+(t==='casa'?1:0))};flota(x,y,'-$'+C_TIPOS[t].c,'#fff');GS.tono(400,.07,'triangle',.05,600)}
        dibujaVec(i);calcula();refresca();api.msg('');return true;
      }
      /* ---------- panel ---------- */
      const panel=document.createElement('div');panel.className='sm-panel';panel.style.setProperty('--acc','#3f86d8');
      panel.innerHTML=`<div class="sm-stats" id="ciSt"></div>
        <div class="sm-build" id="ciB">${C_ORDEN.map((t,k)=>`<button class="sm-b" data-t="${t}">${C_ICO(t)}<span>${C_TIPOS[t].n}</span><small>${t==='demoler'?'½ costo':'$'+C_TIPOS[t].c}</small></button>`).join('')}</div>
        <div class="sm-info" id="ciInfo"></div>`;
      api.area.appendChild(panel);
      const $p=s=>panel.querySelector(s);
      function stat(nom,val,pct,color,sub=''){return `<div class="sm-stat">${nom}<b>${val}</b><i style="--b:${color}"><u style="width:${Math.max(0,Math.min(100,pct))}%"></u></i>${sub?`<span>${sub}</span>`:''}</div>`}
      function refresca(){
        const st=S.st;
        $p('#ciSt').innerHTML=stat('Población',`${S.pop} / ${P.meta}`,S.pop/P.meta*100,'#3f86d8',`Viviendas para ${st.viv}`)+stat('Dinero','$'+Math.round(S.din),Math.min(100,S.din/20),S.din<0?'#d9473a':'#2e9e63',`${S.ult.ing-S.ult.gas>=0?'+':''}${S.ult.ing-S.ult.gas} el mes pasado`)+stat('Empleos',`${st.empl} / ${st.emp}`,st.emp?st.empl/st.emp*100:0,'#e0a02a',st.desempleo>.05?'Hay desempleo':'')+stat('Energía',`${st.uso} / ${st.prod}`,st.prod?st.uso/st.prod*100:(st.uso?100:0),st.apagon?'#d9473a':'#e8a21f',st.apagon?'¡Apagón!':'')+stat('Felicidad',Math.round(st.fel)+'%',st.fel,st.fel<30?'#d9473a':st.fel<55?'#e8a21f':'#2e9e63');
        panel.querySelectorAll('.sm-b').forEach(b=>{b.classList.toggle('on',b.dataset.t===S.tipo);b.classList.toggle('caro',b.dataset.t!=='demoler'&&S.din<C_TIPOS[b.dataset.t].c)});
        api.estado(`<span>Mes ${Math.min(S.mes,P.meses)} / ${P.meses}</span><span style="margin:0 10px">Población ${S.pop} / ${P.meta}</span><span>$${Math.round(S.din)}</span>`);
        info();
      }
      function info(){
        const t=C_TIPOS[S.tipo];let h=`<b>${t.n}</b> · ${t.d}`;
        if(S.hover>=0&&S.map[S.hover]&&S.map[S.hover].t!=='calle'){const b=S.map[S.hover];h=`<b>${b.t==='hall'?'Ayuntamiento':C_TIPOS[b.t].n}</b>${b.f!==undefined?` · felicidad ${Math.round(b.f)}%`:''}`}
        $p('#ciInfo').innerHTML=h;
      }
      panel.addEventListener('click',e=>{const b=e.target.closest('.sm-b');if(b){S.tipo=b.dataset.t;refresca()}});
      /* ---------- puntero ---------- */
      const iDe=e=>{const p=esc.pt(e);const c=Math.floor(p.x/C_TS),r=Math.floor(p.y/C_TS);return c<0||r<0||c>=C_COLS||r>=C_ROWS?-1:idx(c,r)};
      function pintaGhost(i){
        ghost.innerHTML='';if(i<0||S.fin){ghost.setAttribute('display','none');return}
        const t=S.tipo,m=motivo(i,t);ghost.setAttribute('display','inline');ghost.setAttribute('transform',`translate(${col(i)*C_TS} ${fila(i)*C_TS})`);
        ghost.innerHTML=`<g opacity="${t==='demoler'?0:.55}">${t==='calle'?'<path d="M0 27H54" stroke="#6b7280" stroke-width="24"/>':t==='demoler'?'':C_DIB[t](1)}</g><rect x="1" y="1" width="${C_TS-2}" height="${C_TS-2}" rx="6" fill="${m?'#e8472f':'#2e9e63'}" fill-opacity=".18" stroke="${m?'#e8472f':'#2e9e63'}" stroke-width="3" stroke-dasharray="${m?'5 4':'0'}"/>`;
      }
      esc.svg.addEventListener('pointermove',e=>{const i=iDe(e);if(i!==S.hover){S.hover=i;pintaGhost(i);info()}});
      esc.svg.addEventListener('pointerleave',()=>{S.hover=-1;pintaGhost(-1);info()});
      esc.svg.addEventListener('pointerdown',e=>{const i=iDe(e);if(i<0)return;S.hover=i;construye(i);pintaGhost(i)});
      /* ---------- bucle del tiempo ---------- */
      let manual=false;
      const lp=GS.bucle(dt=>{if(S.fin||!jugando)return;if(manual)return;S.acc+=dt*S.vel;if(S.acc>=P.mes){S.acc=0;mes()}
        const f=Math.min(1,S.acc/P.mes);const b=$p('#ciMes');if(b)b.style.width=(f*100)+'%'});
      let jugando=true;
      function tecla(e){
        if(S.fin||e.ctrlKey||e.metaKey||e.altKey)return;const k=e.key.toLowerCase();
        if('123456789'.includes(k)&&k.length===1){S.tipo=C_ORDEN[+k-1];refresca();pintaGhost(S.hover)}
        else if(k==='p')api.msg(lp.pausa()?'Pausa · puedes seguir construyendo':'');
        else if(k==='n'){S.acc=0;mes()}
      }
      document.addEventListener('keydown',tecla);
      const velTxt=()=>`Velocidad ×${S.vel}`;
      api.botones([{txt:'Pausa',ico:'pausa',fn:()=>api.msg(lp.pausa()?'Pausa · puedes seguir construyendo':'')},{id:'ciVel',txt:velTxt(),ico:'jugar',fn:()=>{S.vel=S.vel>=3?1:S.vel+1;document.getElementById('ciVel').lastChild.textContent=velTxt()}},{txt:'Siguiente mes',ico:'flecha',fn:()=>{S.acc=0;mes()}}]);
      const barra=document.createElement('div');barra.style.cssText='height:6px;border-radius:99px;background:rgba(80,50,30,.14);overflow:hidden;width:100%;max-width:600px';barra.innerHTML='<div id="ciMes" style="height:100%;width:0;background:linear-gradient(90deg,#3f86d8,#7cc4ff);border-radius:99px"></div>';
      api.area.insertBefore(barra,panel);
      for(let i=0;i<C_COLS*C_ROWS;i++)dibujaTile(i);
      calcula();refresca();api.msg(`Meta: ${P.meta} habitantes en ${P.meses} meses`);
      return{destruir(){lp.parar();document.removeEventListener('keydown',tecla)},dbg:{S,P,construye,mes,calcula,idx,motivo,get fin(){return S.fin},hall,vec:vecinos}};
    }
  });
}

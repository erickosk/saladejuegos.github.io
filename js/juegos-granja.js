/* =====================================================================
   juegos-granja.js · GRANJA VIRTUAL
   Planta semillas, riega, cosecha, cría gallinas y administra tus monedas,
   energía y semillas hasta llegar a la meta antes de que se acaben los días.
   Uso: initGranja(document.getElementById('game-container'))
   ===================================================================== */
const _gUid=(()=>{let n=0;return p=>p+(++n)})();
const _gS='fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
const G_ICO={
  arar:`<svg viewBox="0 0 24 24" ${_gS}><path d="M5 20L15 6M15 6l5 2-3 4z"/><path d="M4 21h6"/></svg>`,
  sembrar:`<svg viewBox="0 0 24 24" ${_gS}><path d="M12 21V11M12 11C12 7 9 5 5 5c0 4 3 6 7 6zM12 14c0-3 2-5 6-5 0 3-2 5-6 5z"/></svg>`,
  regar:`<svg viewBox="0 0 24 24" ${_gS}><path d="M4 10h11l2 9H6zM15 12l5-3M8 10V8a3 3 0 0 1 6 0"/><path d="M19 14v2M21 13v2"/></svg>`,
  cosechar:`<svg viewBox="0 0 24 24" ${_gS}><path d="M4 11h16l-2 9H6zM8 11l2-6M16 11l-2-6"/><path d="M10 15v2M14 15v2"/></svg>`,
  abonar:`<svg viewBox="0 0 24 24" ${_gS}><path d="M8 4h8l2 4v12H6V8zM8 4l-1 4h10l-1-4"/><path d="M12 13v4M10 15h4"/></svg>`,
  huevos:`<svg viewBox="0 0 24 24" ${_gS}><path d="M12 3c-4 0-6 6-6 10a6 6 0 0 0 12 0c0-4-2-10-6-10z"/></svg>`,
  mercado:`<svg viewBox="0 0 24 24" ${_gS}><path d="M3 9l2-5h14l2 5zM4 9v11h16V9M9 20v-6h6v6"/></svg>`,
  luna:`<svg viewBox="0 0 24 24" ${_gS}><path d="M20 14.500A8 8 0 1 1 9.500 4 6.500 6.500 0 0 0 20 14.500z"/></svg>`,
  sol:`<svg viewBox="0 0 24 24" ${_gS}><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg>`,
  lluvia:`<svg viewBox="0 0 24 24" ${_gS}><path d="M7 15a4 4 0 0 1 0-8 5 5 0 0 1 9.500 1A3.500 3.500 0 0 1 16 15z"/><path d="M8 18l-1 3M12 18l-1 3M16 18l-1 3"/></svg>`
};
const CULT={
  zanahoria:{n:'Zanahoria',sem:6,dias:2,precio:18},
  trigo:{n:'Trigo',sem:4,dias:3,precio:16},
  maiz:{n:'Maíz',sem:10,dias:4,precio:38},
  tomate:{n:'Tomate',sem:16,dias:5,precio:62},
  calabaza:{n:'Calabaza',sem:30,dias:7,precio:155}
};
const G_ORDEN=Object.keys(CULT);
const G_MOUND='<ellipse cx="0" cy="3" rx="12" ry="5" fill="#5a3a1e"/><ellipse cx="0" cy="1.500" rx="10" ry="3.500" fill="#7a5230"/><circle cx="-4" cy="1" r="1.400" fill="#efdca0"/><circle cx="3" cy="2" r="1.400" fill="#efdca0"/><circle cx="6" cy="0" r="1.200" fill="#efdca0"/>';
const G_TOMA='<rect x="-1.500" y="-20" width="3" height="28" fill="#b88a50"/><g fill="#4aa83c"><circle cx="-8" cy="-6" r="8"/><circle cx="8" cy="-8" r="8"/><circle cx="0" cy="-16" r="9"/></g><circle cx="-5" cy="-14" r="2.200" fill="#fff" fill-opacity=".25"/>';
const G_CAL2='<path d="M-18 5Q0 -6 18 5" stroke="#3f9a3a" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M-10 1Q-20 -10 -8 -15Q1 -8 -10 1z" fill="#4aa83c"/><path d="M11 -1Q22 -12 10 -17Q2 -10 11 -1z" fill="#58b64a"/><path d="M-8 -14Q-9 -7 -10 1" stroke="#2f7a2a" stroke-width="1.200" fill="none"/>';
const G_MAIZ2='<path d="M0 8V-26" stroke="#4aa83c" stroke-width="5" stroke-linecap="round"/><path d="M0 -4Q-16 -10 -18 0M0 -12Q16 -18 18 -8M0 -20Q-12 -26 -14 -16" stroke="#58b64a" stroke-width="4" fill="none" stroke-linecap="round"/>';
const G_SPR={
  zanahoria:['<path d="M0 4Q-4 -4 -9 -8M0 4Q4 -6 8 -10M0 4V-12" stroke="#4aa83c" stroke-width="3" fill="none" stroke-linecap="round"/>',
    '<path d="M0 6Q-8 -6 -16 -10M0 6Q8 -8 16 -12M0 6Q-3 -14 -6 -20M0 6Q3 -16 7 -22M0 6V-18" stroke="#3f9a3a" stroke-width="3.600" fill="none" stroke-linecap="round"/>',
    '<path d="M0 6Q-8 -6 -16 -10M0 6Q8 -8 16 -12M0 6Q-3 -14 -6 -20M0 6Q3 -16 7 -22M0 6V-18" stroke="#3f9a3a" stroke-width="3.600" fill="none" stroke-linecap="round"/><ellipse cx="0" cy="5" rx="8" ry="5" fill="#f58a2b" stroke="#c4631a" stroke-width="1.200"/><path d="M-4 4Q0 1 4 4" stroke="#fff" stroke-opacity=".5" stroke-width="1.500" fill="none"/>'],
  trigo:['<path d="M-6 6V-2M-2 6V-6M2 6V-4M6 6V-1" stroke="#7fc24a" stroke-width="2.400" stroke-linecap="round"/>',
    '<path d="M-9 6Q-10 -8 -12 -16M-4 6Q-4 -10 -5 -20M2 6Q3 -10 4 -22M8 6Q9 -8 11 -17" stroke="#8fcb4a" stroke-width="3" stroke-linecap="round" fill="none"/>',
    '<path d="M-9 6Q-10 -8 -12 -16M-4 6Q-4 -10 -5 -20M2 6Q3 -10 4 -22M8 6Q9 -8 11 -17" stroke="#d9a93a" stroke-width="3" stroke-linecap="round" fill="none"/><g fill="#f0c040" stroke="#b88700" stroke-width=".8"><ellipse cx="-12" cy="-19" rx="3" ry="7"/><ellipse cx="-5" cy="-23" rx="3" ry="7"/><ellipse cx="4" cy="-25" rx="3" ry="7"/><ellipse cx="11" cy="-20" rx="3" ry="7"/></g>'],
  maiz:['<path d="M0 6V-8" stroke="#6bbd3f" stroke-width="3.500" stroke-linecap="round"/><path d="M0 -2Q-8 -6 -10 -2M0 -4Q8 -8 10 -4" stroke="#6bbd3f" stroke-width="2.400" fill="none" stroke-linecap="round"/>',
    G_MAIZ2,
    G_MAIZ2+'<path d="M3 -6Q13 -8 13 -19Q8 -24 3 -19z" fill="#f5c93b" stroke="#b88700" stroke-width="1.200"/><path d="M3 -6Q13 -8 13 -19" stroke="#58b64a" stroke-width="3" fill="none"/><path d="M0 -26l-3 -7M0 -26l3 -7M0 -26V-34" stroke="#d9b45a" stroke-width="2" stroke-linecap="round"/>'],
  tomate:['<path d="M0 6V-6" stroke="#6bbd3f" stroke-width="3" stroke-linecap="round"/><ellipse cx="-4" cy="-6" rx="4" ry="2.500" fill="#6bbd3f"/><ellipse cx="4" cy="-8" rx="4" ry="2.500" fill="#6bbd3f"/>',
    G_TOMA+'<circle cx="9" cy="-13" r="2" fill="#ffd54a"/><circle cx="-9" cy="-9" r="2" fill="#ffd54a"/>',
    G_TOMA+'<g fill="#e8362a" stroke="#a52018" stroke-width="1"><circle cx="-9" cy="-3" r="4.500"/><circle cx="9" cy="-5" r="4.500"/><circle cx="2" cy="-13" r="4.500"/><circle cx="-4" cy="-19" r="4"/></g><g fill="#fff" fill-opacity=".55"><circle cx="-10.500" cy="-4.500" r="1.200"/><circle cx="7.500" cy="-6.500" r="1.200"/><circle cx="0.500" cy="-14.500" r="1.200"/></g>'],
  calabaza:['<path d="M0 6V-6" stroke="#6bbd3f" stroke-width="3" stroke-linecap="round"/><ellipse cx="-4" cy="-6" rx="4" ry="2.500" fill="#6bbd3f"/><ellipse cx="4" cy="-8" rx="4" ry="2.500" fill="#6bbd3f"/>',
    G_CAL2,
    G_CAL2+'<ellipse cx="0" cy="-2" rx="15" ry="11.500" fill="#f08a24" stroke="#b85f0a" stroke-width="1.600"/><path d="M-7 -12Q-10 -2 -7 8M0 -13V9M7 -12Q10 -2 7 8" stroke="#b85f0a" stroke-opacity=".5" stroke-width="1.500" fill="none"/><path d="M0 -13Q2 -20 7 -20" stroke="#4a7a2a" stroke-width="3" stroke-linecap="round" fill="none"/><ellipse cx="-6" cy="-6" rx="3" ry="2" fill="#fff" fill-opacity=".3"/>']
};
function gSprite(c,etapa){return etapa<=0?G_MOUND:G_SPR[c][etapa-1]}
const gIcono=c=>`<svg viewBox="-22 -34 44 44" class="ic">${G_SPR[c][2]}</svg>`;
const G_HUEVO_IC='<svg viewBox="0 0 40 40" class="ic"><ellipse cx="20" cy="22" rx="11" ry="14" fill="#fff6e6" stroke="#d9b78a" stroke-width="2"/><ellipse cx="16" cy="16" rx="3" ry="4.500" fill="#fff" fill-opacity=".8"/></svg>';
const G_GALL_IC='<svg viewBox="0 0 40 40" class="ic"><ellipse cx="19" cy="25" rx="12" ry="10" fill="#fff" stroke="#c9ced6" stroke-width="2"/><circle cx="27" cy="14" r="7" fill="#fff" stroke="#c9ced6" stroke-width="2"/><path d="M24 8Q27 3 29 8Q32 4 32 10" fill="#e8362a"/><path d="M33 14l6 2-6 2z" fill="#f2a43a"/><circle cx="28" cy="13" r="1.300" fill="#222"/><path d="M12 22Q18 30 24 24" stroke="#c9ced6" stroke-width="2" fill="none"/></svg>';
const G_ABONO_IC='<svg viewBox="0 0 40 40" class="ic"><path d="M10 10h20l4 8v18H6V18z" fill="#8a6a3c" stroke="#5a4326" stroke-width="2" stroke-linejoin="round"/><path d="M10 10l-2 8h24l-2-8" fill="#a98450"/><circle cx="20" cy="27" r="6" fill="#6bbd3f"/><path d="M20 30v-6M17 26l3-3 3 3" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
const G_ALIM_IC='<svg viewBox="0 0 40 40" class="ic"><path d="M8 14h24l-3 22H11z" fill="#d9a93a" stroke="#8a6a1a" stroke-width="2" stroke-linejoin="round"/><ellipse cx="20" cy="14" rx="12" ry="4" fill="#f0c040" stroke="#8a6a1a" stroke-width="2"/><g fill="#8a6a1a"><circle cx="15" cy="13" r="1.200"/><circle cx="21" cy="14.500" r="1.200"/><circle cx="25" cy="12.500" r="1.200"/></g></svg>';

function initGranja(cont){
  return GS.crear(cont,{
    id:'granja',
    intro:'Elige una herramienta y toca las parcelas: ara la tierra, siembra, riega cada dos días, abona y cosecha. Cada acción gasta 1 de energía y, al acabarse, toca dormir. Vende tus productos en el mercado (los precios cambian cada día), compra semillas y gallinas, y llega a la meta de monedas antes de que se acaben los días. Si llueve, las plantas se riegan solas. Atajos: 1–6 herramientas, M mercado, D dormir.',
    niveles:[['1','Fácil','30 días · meta 1,500 monedas · 20 de energía por día · llueve seguido.'],['2','Medio','26 días · meta 2,200 monedas · 18 de energía.'],['3','Difícil','22 días · meta 2,800 monedas · 16 de energía · precios muy cambiantes.']],
    iniciar(api,nivel){
      const P={1:{dias:30,meta:1500,en:20,coins:80,lluvia:.35,vol:.2,sem:4},2:{dias:26,meta:2200,en:18,coins:60,lluvia:.3,vol:.28,sem:3},3:{dias:22,meta:2800,en:16,coins:50,lluvia:.25,vol:.35,sem:2}}[nivel];
      const COLS=5,ROWS=4,CW=74,CH=48,OX=98,OY=112,W=560,H=332;
      const esc=GS.escena(api,{w:W,h:H,max:640,fondo:'#9fd8f5',aria:'Granja virtual'}),E=esc.el;
      esc.svg.style.cursor='pointer';
      const S={dia:1,monedas:P.coins,energia:P.en,sem:{},cos:{},huevosL:0,huevos:0,gall:0,alim:0,abono:0,herr:'arar',sel:'zanahoria',plots:[],clima:[],mult:{},multPrev:{},multH:1,multHPrev:1,fin:false,lock:false,modal:false,tm:[]};
      G_ORDEN.forEach(c=>{S.sem[c]=0;S.cos[c]=0;S.mult[c]=1;S.multPrev[c]=1});
      S.sem.zanahoria=P.sem;S.sem.trigo=P.sem;
      for(let i=0;i<COLS*ROWS;i++)S.plots.push({e:0,c:null,edad:0,moj:0,sed:0,ab:false});
      for(let d=0;d<=P.dias+2;d++)S.clima.push(d>0&&Math.random()<P.lluvia);
      const later=(f,ms)=>{S.tm.push(setTimeout(()=>{if(!S.fin)f()},ms))};
      /* ---------------- escena ---------------- */
      E('defs').innerHTML=`<linearGradient id="grCielo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#58b6ee"/><stop offset=".7" stop-color="#c3ebfb"/><stop offset="1" stop-color="#fff2d2"/></linearGradient>
        <linearGradient id="grPasto" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fd05a"/><stop offset="1" stop-color="#4ea83e"/></linearGradient>
        <linearGradient id="grGranero" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2574a"/><stop offset="1" stop-color="#b13226"/></linearGradient>
        <radialGradient id="grSol"><stop offset="0" stop-color="#fffbe0"/><stop offset=".5" stop-color="#ffe27a"/><stop offset="1" stop-color="#ffe27a" stop-opacity="0"/></radialGradient>`;
      E('rect',{width:W,height:H,fill:'url(#grCielo)'});
      const astro=E('g');astro.innerHTML='<circle cx="490" cy="46" r="46" fill="url(#grSol)"/><circle cx="490" cy="46" r="19" fill="#ffe27a"/>';
      const nubes=E('g');nubes.innerHTML=[[80,40,1],[250,28,.8],[380,60,1.1]].map(([x,y,s],i)=>`<g transform="translate(${x} ${y}) scale(${s})"><g><animateTransform attributeName="transform" type="translate" values="0 0;22 0;0 0" dur="${18+i*5}s" repeatCount="indefinite"/><ellipse cx="0" cy="4" rx="34" ry="10" fill="#fff" fill-opacity=".95"/><ellipse cx="-11" cy="-4" rx="16" ry="11" fill="#fff"/><ellipse cx="12" cy="-7" rx="20" ry="13" fill="#fff"/></g></g>`).join('');
      E('g').innerHTML=`<path d="M0 118Q70 70 150 104T300 92T450 100T560 84V130H0z" fill="#a9d57a"/><path d="M0 130Q90 96 190 122T380 112T560 124V140H0z" fill="#8cc860"/>`;
      E('rect',{y:98,width:W,height:H-98,fill:'url(#grPasto)'});
      /* molino */
      const mol=E('g');mol.innerHTML=`<g transform="translate(508 92)"><path d="M-12 40L-7 0H7L12 40z" fill="#f1e2c4" stroke="#b89a68" stroke-width="2"/><rect x="-5" y="22" width="10" height="18" rx="5" fill="#8a5a30"/><g><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="9s" repeatCount="indefinite"/><g stroke="#fff" stroke-width="3" stroke-linecap="round"><path d="M0 0L0 -26M0 0L26 0M0 0L0 26M0 0L-26 0"/></g><g fill="#fff" stroke="#c9ced6" stroke-width="1.500"><rect x="-4" y="-27" width="8" height="15"/><rect x="12" y="-4" width="15" height="8"/><rect x="-4" y="12" width="8" height="15"/><rect x="-27" y="-4" width="15" height="8"/></g></g><circle r="4" fill="#8a5a30"/></g>`;
      /* granero */
      E('g').innerHTML=`<g transform="translate(8 116)"><path d="M0 96V30L44 4L88 30V96z" fill="url(#grGranero)" stroke="#7a1f16" stroke-width="3" stroke-linejoin="round"/><path d="M-4 32L44 2L92 32" stroke="#7a1f16" stroke-width="5" fill="none" stroke-linejoin="round" stroke-linecap="round"/><rect x="26" y="52" width="36" height="44" fill="#8a2a1f" stroke="#fff" stroke-width="3"/><path d="M26 52L62 96M62 52L26 96" stroke="#fff" stroke-width="3"/><circle cx="44" cy="30" r="8" fill="#fff4e0" stroke="#7a1f16" stroke-width="2.500"/><path d="M38 30h12M44 24v12" stroke="#7a1f16" stroke-width="1.600"/></g>`;
      /* árboles y cerca */
      E('g').innerHTML=`<g transform="translate(30 270)"><rect x="-3" y="0" width="6" height="22" fill="#7a5230"/><circle cx="0" cy="-8" r="20" fill="#3f9a4d"/><circle cx="-9" cy="2" r="13" fill="#4aa857"/><circle cx="8" cy="-16" r="10" fill="#58b865"/></g><g transform="translate(540 300)"><rect x="-3" y="0" width="6" height="20" fill="#7a5230"/><circle cx="0" cy="-8" r="18" fill="#3f9a4d"/><circle cx="8" cy="0" r="12" fill="#4aa857"/></g>`;
      E('g').innerHTML=Array.from({length:12},(_,i)=>`<g transform="translate(${6+i*46} 322)"><rect x="-3" y="-14" width="6" height="22" rx="2" fill="#e6c38c" stroke="#a98450" stroke-width="1.500"/></g>`).join('')+`<path d="M0 312H${W}M0 318H${W}" stroke="#a98450" stroke-width="3"/>`;
      /* parcelas */
      const gPl=E('g'),pl=[];
      for(let i=0;i<COLS*ROWS;i++){
        const g=GS.el('g',{class:'pl','data-i':i,transform:`translate(${OX+(i%COLS)*CW} ${OY+Math.floor(i/COLS)*CH})`},gPl);pl.push(g);
      }
      /* gallinero */
      const coopG=E('g',{style:'cursor:pointer'});
      coopG.innerHTML=`<g transform="translate(478 156)"><path d="M0 70V26L38 2L76 26V70z" fill="#d9a066" stroke="#8a5a30" stroke-width="3" stroke-linejoin="round"/><path d="M-5 28L38 -3L81 28" stroke="#b13226" stroke-width="7" fill="none" stroke-linejoin="round" stroke-linecap="round"/><path d="M0 70V26L38 2" fill="none"/><rect x="26" y="40" width="22" height="30" rx="11" fill="#5a3a1e"/><rect x="10" y="38" width="12" height="12" rx="2" fill="#f8ecd0" stroke="#8a5a30" stroke-width="2"/><rect x="54" y="38" width="12" height="12" rx="2" fill="#f8ecd0" stroke="#8a5a30" stroke-width="2"/><circle cx="38" cy="22" r="5" fill="#fff4e0" stroke="#8a5a30" stroke-width="2"/></g><rect x="470" y="150" width="90" height="170" fill="transparent" data-coop="1"/>`;
      const gallG=E('g'),huevosG=E('g');gallG.style.pointerEvents='none';huevosG.style.pointerEvents='none';
      const GPOS=[[498,262],[524,274],[548,258],[510,292],[536,300],[490,236]];
      /* noche, lluvia y avisos */
      const lluviaG=E('g',{display:'none'});lluviaG.style.pointerEvents='none';
      lluviaG.innerHTML=`<rect width="${W}" height="${H}" fill="#2a3a58" fill-opacity=".22"/>`+Array.from({length:46},(_,i)=>{const x=(i*37)%W,y=(i*53)%H;return `<path d="M${x} ${y}l-4 12" stroke="#cfe8ff" stroke-width="1.800" stroke-linecap="round" stroke-opacity=".8"><animateTransform attributeName="transform" type="translate" values="0 -30;-14 ${H+10}" dur="${(.7+(i%5)*.12).toFixed(2)}s" begin="${-(i%7)*.1}s" repeatCount="indefinite"/></path>`}).join('');
      const nocheG=E('g',{opacity:0});nocheG.style.pointerEvents='none';nocheG.style.transition='opacity .6s ease';
      nocheG.innerHTML=`<rect width="${W}" height="${H}" fill="#0b1030" fill-opacity=".72"/>${Array.from({length:26},(_,i)=>`<circle cx="${(i*83)%W}" cy="${(i*47)%150+8}" r="${i%3?1:1.800}" fill="#fff"><animate attributeName="opacity" values=".3;1;.3" dur="${1.5+(i%4)*.6}s" repeatCount="indefinite"/></circle>`).join('')}<circle cx="470" cy="52" r="20" fill="#f1e7c8"/><circle cx="462" cy="46" r="20" fill="#0b1030"/><text x="${W/2}" y="${H/2+4}" text-anchor="middle" font-family="Fredoka,Nunito,Arial,sans-serif" font-size="30" font-weight="700" fill="#cfe0ff" id="grZz">Zzz...</text>`;
      const flotG=E('g');flotG.style.pointerEvents='none';
      function flota(x,y,txt,col='#fff'){
        const t=GS.el('text',{x,y,'text-anchor':'middle','font-family':'Nunito,Arial,sans-serif','font-size':17,'font-weight':900,fill:col,stroke:'rgba(0,0,0,.5)','stroke-width':3,'paint-order':'stroke'},flotG);t.textContent=txt;
        try{t.animate([{transform:'translateY(0)',opacity:1},{transform:'translateY(-30px)',opacity:0}],{duration:950,easing:'ease-out'})}catch(e){}
        setTimeout(()=>t.remove(),960);
      }
      /* ---------------- panel HTML ---------------- */
      const HERR=[['arar','Arar'],['sembrar','Sembrar'],['regar','Regar'],['cosechar','Cosechar'],['abonar','Abonar'],['huevos','Huevos']];
      const panel=document.createElement('div');panel.className='sm-panel';
      panel.innerHTML=`<div class="sm-row" id="grHerr">${HERR.map((h,i)=>`<button class="sm-tool" data-h="${h[0]}">${G_ICO[h[0]]}<span>${h[1]}</span><span class="k">${i+1}</span></button>`).join('')}</div>
        <div class="sm-row" id="grSem"></div>
        <div class="sm-row"><button class="btn" id="grMer">${G_ICO.mercado.replace('<svg','<svg style="width:18px;height:18px;vertical-align:-3px;margin-right:4px"')}Mercado</button><button class="btn" id="grDor">${G_ICO.luna.replace('<svg','<svg style="width:18px;height:18px;vertical-align:-3px;margin-right:4px"')}Dormir</button></div>
        <div class="sm-info" id="grInfo"></div>`;
      api.area.appendChild(panel);
      const modal=document.createElement('div');modal.className='sm-modal';api.area.appendChild(modal);
      panel.style.setProperty('--acc','#5fb04a');modal.style.setProperty('--acc','#5fb04a');
      const $p=s=>panel.querySelector(s);
      /* ---------------- dibujo de parcelas ---------------- */
      const etapa=p=>{if(p.e!==2)return -1;const d=CULT[p.c].dias;return p.edad>=d?3:p.edad===0?0:p.edad<d*.5+.01?1:2};
      function dibujaPlot(i){
        const p=S.plots[i],g=pl[i],et=etapa(p),lluvia=S.clima[S.dia];
        const mojado=p.moj>0||(lluvia&&p.e===2);
        const base=p.e===0?'#b99a5f':p.e===1?'#7a4f2a':'#6b4527';
        let h=`<rect x="1" y="1" width="${CW-3}" height="${CH-3}" rx="9" fill="${mojado&&p.e>0?'#4b2f19':base}" stroke="#4a3018" stroke-width="2.200"/>`;
        if(p.e===0)h+=`<path d="M12 14l-2-6M16 14l1-7M52 36l-2-6M56 36l2-6M30 30l-2-5" stroke="#6faa3c" stroke-width="2.200" stroke-linecap="round"/><circle cx="46" cy="14" r="2" fill="#9a7d46"/><circle cx="20" cy="36" r="2.200" fill="#9a7d46"/>`;
        else h+=`<path d="M8 14H${CW-11}M8 24H${CW-11}M8 34H${CW-11}" stroke="#3c2410" stroke-opacity=".55" stroke-width="2.400" stroke-linecap="round"/>`;
        if(mojado&&p.e>0)h+=`<path d="M12 20q6 -4 12 0t12 0t12 0" stroke="#7cc4ff" stroke-opacity=".55" stroke-width="2" fill="none" stroke-linecap="round"/>`;
        if(et>=0)h+=`<g transform="translate(${CW/2-1} ${CH/2+4})">${gSprite(p.c,et)}</g>`;
        if(p.ab&&p.e===2)h+=`<circle cx="${CW-14}" cy="12" r="5" fill="#6bbd3f" stroke="#fff" stroke-width="1.500"/><path d="M${CW-14} 14.500v-5M${CW-16.500} 12l2.500-2.500 2.500 2.500" stroke="#fff" stroke-width="1.400" fill="none" stroke-linecap="round"/>`;
        if(et===3)h+=`<g transform="translate(${CW-14} 12)"><path d="M0 -6l1.800 4.200L6 0l-4.200 1.800L0 6l-1.800-4.200L-6 0l4.200-1.800z" fill="#fff6a8" stroke="#f0b400" stroke-width="1"><animateTransform attributeName="transform" type="scale" values="1;1.4;1" dur="1.2s" repeatCount="indefinite"/></path></g>`;
        if(p.e===2&&et<3&&!mojado)h+=`<g transform="translate(14 12)"><path d="M0 -7Q5 0 5 3A5 5 0 0 1 -5 3Q-5 0 0 -7z" fill="${p.sed>=2?'#e8472f':'#5aa9ee'}" stroke="#fff" stroke-width="1.400"/></g>`;
        g.innerHTML=h+`<rect x="0" y="0" width="${CW}" height="${CH}" fill="transparent"/>`;
      }
      function dibujaCoop(){
        gallG.innerHTML=Array.from({length:S.gall},(_,k)=>{const [x,y]=GPOS[k];return `<g transform="translate(${x} ${y})"><g><animateTransform attributeName="transform" type="translate" values="0 0;0 -2;0 0" dur="${(1.1+k*.17).toFixed(2)}s" repeatCount="indefinite"/><ellipse cx="0" cy="12" rx="9" ry="2.500" fill="#000" fill-opacity=".15"/><path d="M-4 9v5M3 9v5" stroke="#f2a43a" stroke-width="2" stroke-linecap="round"/><ellipse cx="0" cy="3" rx="10" ry="8.500" fill="#fff" stroke="#c9ced6" stroke-width="1.500"/><circle cx="8" cy="-5" r="5.500" fill="#fff" stroke="#c9ced6" stroke-width="1.500"/><path d="M6 -10Q8 -15 10 -10Q12 -13 12 -8" fill="#e8362a"/><path d="M13 -5l5 1.500-5 1.500z" fill="#f2a43a"/><circle cx="9" cy="-6" r="1.100" fill="#222"/><path d="M-8 2Q-3 9 4 4" stroke="#c9ced6" stroke-width="1.500" fill="none"/></g></g>`}).join('');
        huevosG.innerHTML=Array.from({length:Math.min(S.huevosL,6)},(_,k)=>`<g transform="translate(${482+k*14} 232)"><ellipse rx="5" ry="6.500" fill="#fff6e6" stroke="#d9b78a" stroke-width="1.500"><animateTransform attributeName="transform" type="scale" values="1;1.12;1" dur="1.4s" begin="${k*.2}s" repeatCount="indefinite"/></ellipse></g>`).join('');
      }
      function dibujaCielo(){
        const lluvia=S.clima[S.dia];
        lluviaG.setAttribute('display',lluvia?'inline':'none');
        astro.setAttribute('opacity',lluvia?.35:1);
      }
      /* ---------------- paneles ---------------- */
      const precio=c=>Math.round(CULT[c].precio*S.mult[c]),precioH=()=>Math.round(9*S.multH);
      const flecha=(a,b)=>b>a+.005?'<span class="sm-up">▲</span>':b<a-.005?'<span class="sm-down">▼</span>':'<span>■</span>';
      const hud=()=>api.estado(`<span>Día ${S.dia} / ${P.dias}</span><span style="margin:0 10px">Monedas ${S.monedas} / ${P.meta}</span><span>Energía ${S.energia} / ${P.en}</span>`);
      function refrescaPanel(){
        panel.querySelectorAll('#grHerr .sm-tool').forEach(b=>b.classList.toggle('on',b.dataset.h===S.herr));
        const sr=$p('#grSem');sr.style.display=S.herr==='sembrar'?'flex':'none';
        sr.innerHTML=G_ORDEN.map(c=>`<button class="sm-chip ${S.sel===c?'on':''} ${S.sem[c]<=0?'sin':''}" data-c="${c}">${gIcono(c)}<span>${CULT[c].n} <b>×${S.sem[c]}</b></span></button>`).join('');
        const sol=G_ICO[S.clima[S.dia]?'lluvia':'sol'],man=G_ICO[S.clima[S.dia+1]?'lluvia':'sol'];
        $p('#grInfo').innerHTML=`<span class="sm-pill">${sol}Hoy: <b>${S.clima[S.dia]?'lluvia':'soleado'}</b></span><span class="sm-pill">${man}Mañana: <b>${S.clima[S.dia+1]?'lluvia':'soleado'}</b></span><span class="sm-pill">Gallinas <b>${S.gall}</b></span><span class="sm-pill">Abono <b>${S.abono}</b></span>`;
        $p('#grDor').classList.toggle('sm-pulse',S.energia<=0&&!S.lock);
        hud();
      }
      function gasta(n=1){
        if(S.energia<n){flota(W/2,86,'Sin energía: ¡a dormir!','#ffb3a8');api.sonar.error&&api.sonar.error();const b=$p('#grDor');b.classList.remove('sm-pulse');void b.offsetWidth;b.classList.add('sm-pulse');return false}
        S.energia-=n;return true;
      }
      /* ---------------- acciones ---------------- */
      function accion(i){
        if(S.fin||S.lock||S.modal)return false;
        const p=S.plots[i],g=pl[i],cx=OX+(i%COLS)*CW+CW/2,cy=OY+Math.floor(i/COLS)*CH+12,h=S.herr;
        if(h==='arar'){
          if(p.e!==0){flota(cx,cy,p.e===1?'Ya está arada':'Hay un cultivo','#fff');return false}
          if(!gasta())return false;p.e=1;GS.tono(180,.08,'square',.05,120);
        }else if(h==='sembrar'){
          if(p.e===0){flota(cx,cy,'Primero ara','#ffe27a');return false}
          if(p.e===2){flota(cx,cy,'Ya hay un cultivo','#fff');return false}
          if(S.sem[S.sel]<=0){flota(cx,cy,'Sin semillas','#ffb3a8');api.sonar.error&&api.sonar.error();return false}
          if(!gasta())return false;S.sem[S.sel]--;Object.assign(p,{e:2,c:S.sel,edad:0,moj:0,sed:0,ab:false});GS.tono(520,.07,'triangle',.05,700);
        }else if(h==='regar'){
          if(p.e!==2){flota(cx,cy,'Nada que regar','#fff');return false}
          if(p.moj>=2||S.clima[S.dia]){flota(cx,cy,'Ya tiene agua','#cfe8ff');return false}
          if(!gasta())return false;p.moj=2;p.sed=0;GS.tono(700,.1,'sine',.05,400);flota(cx,cy,'Regada','#9fd4ff');
        }else if(h==='cosechar'){
          if(p.e!==2||p.edad<CULT[p.c].dias){flota(cx,cy,p.e===2?'Aún no está lista':'Nada que cosechar','#fff');return false}
          if(!gasta())return false;S.cos[p.c]++;flota(cx,cy,'+1 '+CULT[p.c].n,'#ffe27a');GS.sonar.captura&&GS.sonar.captura();GS.destello(esc,cx,cy+6,'#ffe27a',22);Object.assign(p,{e:1,c:null,edad:0,moj:0,sed:0,ab:false});
        }else if(h==='abonar'){
          if(p.e!==2||p.edad>=CULT[p.c].dias||p.ab){flota(cx,cy,p.ab?'Ya tiene abono':'No hace falta','#fff');return false}
          if(S.abono<=0){flota(cx,cy,'Sin abono','#ffb3a8');return false}
          if(!gasta())return false;S.abono--;p.ab=true;flota(cx,cy,'Abonada','#b9f08a');GS.tono(420,.1,'triangle',.05,600);
        }else if(h==='huevos'){return recogeHuevos()}
        dibujaPlot(i);refrescaPanel();return true;
      }
      function recogeHuevos(){
        if(S.fin||S.lock||S.modal)return false;
        if(S.gall===0){flota(514,200,'No tienes gallinas','#fff');return false}
        if(S.huevosL<=0){flota(514,200,'Aún no hay huevos','#fff');return false}
        if(!gasta())return false;
        flota(514,200,'+'+S.huevosL+' huevos','#fff6e6');S.huevos+=S.huevosL;S.huevosL=0;GS.tono(640,.08,'triangle',.05,900);dibujaCoop();refrescaPanel();return true;
      }
      /* ---------------- mercado ---------------- */
      function vende(k,n){
        const cant=k==='huevos'?S.huevos:S.cos[k];n=n==='todo'?cant:Math.min(n,cant);if(n<=0)return;
        const unit=k==='huevos'?precioH():precio(k);S.monedas+=unit*n;if(k==='huevos')S.huevos-=n;else S.cos[k]-=n;
        GS.sonar.captura&&GS.sonar.captura();api.puntos(S.monedas);
        if(S.monedas>=P.meta)return terminar(true);
        refrescaPanel();pintaMercado();
      }
      function compra(item,n=1){
        let c=0,ok=true;
        if(G_ORDEN.includes(item))c=CULT[item].sem*n;else if(item==='abono')c=14*n;else if(item==='alimento')c=2*n;else if(item==='gallina'){c=80;if(S.gall>=6)ok=false}
        if(!ok||S.monedas<c){api.sonar.error&&api.sonar.error();return}
        S.monedas-=c;
        if(G_ORDEN.includes(item))S.sem[item]+=n;else if(item==='abono')S.abono+=n;else if(item==='alimento')S.alim+=n;else if(item==='gallina'){S.gall++;dibujaCoop()}
        GS.tono(480,.06,'triangle',.05,640);api.puntos(S.monedas);refrescaPanel();pintaMercado();
      }
      function pintaMercado(){
        const rowV=(k,ic,nom,cant,pr,a,b)=>`<div class="sm-item">${ic}<div class="tx">${nom} <small>Tienes ${cant} · ${pr} monedas ${flecha(a,b)}</small></div><button class="btn ghost" data-v="${k}" data-n="1" ${cant<1?'disabled':''}>Vender 1</button><button class="btn" data-v="${k}" data-n="todo" ${cant<1?'disabled':''}>Todo</button></div>`;
        const rowC=(k,ic,nom,det,c,extra='')=>`<div class="sm-item">${ic}<div class="tx">${nom} <small>${det}</small></div><button class="btn ghost" data-c="${k}" data-n="1" ${S.monedas<c||extra?'disabled':''}>${c} ◎</button>${G_ORDEN.includes(k)||k==='alimento'?`<button class="btn" data-c="${k}" data-n="5" ${S.monedas<c*5?'disabled':''}>×5</button>`:''}</div>`;
        modal.innerHTML=`<div class="sm-sheet"><h3><span>Mercado · ${S.monedas} monedas</span><button class="sm-x" id="grX" aria-label="Cerrar">✕</button></h3>
          <h4>Vender</h4>${G_ORDEN.map(c=>rowV(c,gIcono(c),CULT[c].n,S.cos[c],precio(c),S.multPrev[c],S.mult[c])).join('')}${rowV('huevos',G_HUEVO_IC,'Huevos',S.huevos,precioH(),S.multHPrev,S.multH)}
          <h4>Comprar</h4>${G_ORDEN.map(c=>rowC(c,gIcono(c),'Semillas de '+CULT[c].n.toLowerCase(),`Crece en ${CULT[c].dias} días`,CULT[c].sem)).join('')}
          ${rowC('abono',G_ABONO_IC,'Abono','Acelera un día el crecimiento',14)}${rowC('alimento',G_ALIM_IC,'Alimento (tienes '+S.alim+')','1 por gallina al día',2)}${rowC('gallina',G_GALL_IC,'Gallina ('+S.gall+'/6)','Pone 1 huevo al día con alimento',80,S.gall>=6?'x':'')}</div>`;
        modal.querySelector('#grX').onclick=cierraMercado;
        modal.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>vende(b.dataset.v,b.dataset.n==='todo'?'todo':+b.dataset.n));
        modal.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>compra(b.dataset.c,+b.dataset.n));
      }
      function abreMercado(){if(S.fin||S.lock)return;S.modal=true;pintaMercado();modal.classList.add('on')}
      function cierraMercado(){S.modal=false;modal.classList.remove('on')}
      /* ---------------- día / noche ---------------- */
      function procesaDia(){
        const lluvia=S.clima[S.dia];let marchitas=0,crecidas=0;
        S.plots.forEach(p=>{
          if(p.e!==2)return;
          const reg=p.moj>0||lluvia;
          if(reg){const d=CULT[p.c].dias;if(p.edad<d){p.edad++;crecidas++;if(p.ab&&p.edad<d){p.edad++;}}p.ab=false;p.sed=0}
          else{p.sed++;if(p.sed>=3){p.e=1;p.c=null;p.edad=0;p.ab=false;marchitas++}}
          p.moj=Math.max(0,p.moj-1);
        });
        let puestos=0;
        if(S.gall>0){const n=Math.min(S.gall,S.alim);S.alim-=n;puestos=n;S.huevosL+=n}
        S.dia++;S.energia=P.en;
        G_ORDEN.forEach(c=>{S.multPrev[c]=S.mult[c];S.mult[c]=Math.max(.7,Math.min(1.4,S.mult[c]+(Math.random()*2-1)*P.vol))});
        S.multHPrev=S.multH;S.multH=Math.max(.7,Math.min(1.4,S.multH+(Math.random()*2-1)*P.vol));
        return{marchitas,puestos};
      }
      function sinRecursos(){
        const minSem=Math.min(...G_ORDEN.map(c=>CULT[c].sem));
        const tengo=S.monedas>=minSem||G_ORDEN.some(c=>S.sem[c]>0||S.cos[c]>0)||S.huevos>0||S.huevosL>0||S.plots.some(p=>p.e===2);
        return !tengo;
      }
      function despierta(res){
        S.lock=false;pintaTodo();
        let m=`Día ${S.dia}`;if(res.marchitas)m+=` · ${res.marchitas} cultivo(s) se secaron`;if(res.puestos)m+=` · ${res.puestos} huevo(s) nuevos`;
        api.msg(m);refrescaPanel();
      }
      function dormir(animado=true){
        if(S.fin||S.lock)return;
        cierraMercado();
        if(S.dia>=P.dias){return terminar(false,'Se acabó el tiempo')}
        S.lock=true;panel.querySelectorAll('button').forEach(b=>b.disabled=true);
        const resto=()=>{
          const res=procesaDia();
          if(sinRecursos())return terminar(false,'Te quedaste sin recursos');
          panel.querySelectorAll('button').forEach(b=>b.disabled=false);
          if(animado){nocheG.setAttribute('opacity',0);later(()=>despierta(res),650)}else despierta(res);
        };
        if(animado){nocheG.setAttribute('opacity',1);GS.tono(260,.5,'sine',.04,180);later(resto,1100)}else resto();
      }
      function terminar(gano,motivo=''){
        if(S.fin)return;S.fin=true;S.tm.forEach(clearTimeout);cierraMercado();document.removeEventListener('keydown',tecla);
        const pts=gano?S.monedas+(P.dias-S.dia)*25:S.monedas;api.puntos(pts);
        if(gano)api.fin({tipo:'gana',titulo:'¡Meta alcanzada!',sub:`${S.monedas} monedas en ${S.dia} días`,puntos:pts,det:`Te sobraron ${P.dias-S.dia} días`});
        else api.fin({tipo:'pierde',titulo:motivo||'Fin de la temporada',sub:`reuniste ${S.monedas} de ${P.meta} monedas`,puntos:pts,det:`Día ${S.dia} de ${P.dias}`});
      }
      function pintaTodo(){S.plots.forEach((_,i)=>dibujaPlot(i));dibujaCoop();dibujaCielo()}
      /* ---------------- eventos ---------------- */
      esc.svg.addEventListener('pointerdown',e=>{
        if(e.target.closest&&e.target.closest('[data-coop]')){recogeHuevos();return}
        const g=e.target.closest&&e.target.closest('.pl');if(g)accion(+g.dataset.i);
      });
      panel.addEventListener('click',e=>{
        const t=e.target.closest('.sm-tool');if(t&&!S.lock){S.herr=t.dataset.h;refrescaPanel();return}
        const c=e.target.closest('.sm-chip');if(c){S.sel=c.dataset.c;refrescaPanel();return}
        if(e.target.closest('#grMer'))abreMercado();
        if(e.target.closest('#grDor'))dormir();
      });
      modal.addEventListener('pointerdown',e=>{if(e.target===modal)cierraMercado()});
      function tecla(e){
        if(S.fin||e.ctrlKey||e.metaKey||e.altKey)return;
        const k=e.key.toLowerCase();
        if(k==='escape'&&S.modal){cierraMercado();return}
        if(S.lock||S.modal)return;
        if('123456'.includes(k)&&k.length===1){S.herr=HERR[+k-1][0];refrescaPanel()}
        else if(k==='m')abreMercado();else if(k==='d')dormir();
      }
      document.addEventListener('keydown',tecla);
      api.botones([]);
      pintaTodo();refrescaPanel();api.msg(`Meta: ${P.meta} monedas en ${P.dias} días`);
      return{destruir(){S.tm.forEach(clearTimeout);document.removeEventListener('keydown',tecla)},
        dbg:{S,P,accion,dormir:()=>dormir(false),vende,compra,recogeHuevos,precio,get fin(){return S.fin},pl}};
    }
  });
}

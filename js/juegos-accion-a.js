/* =====================================================================
   juegos-accion-a.js · Space Invaders, Asteroids, Carreras infinitas,
   Carreras de autos y Helicóptero de obstáculos.
   Uso:  initSpaceInvaders(document.getElementById('game-container'))
   Todo lo visual es SVG; el movimiento se actualiza cuadro a cuadro.
   ===================================================================== */

/* 1) SPACE INVADERS */
function initSpaceInvaders(cont){
  return GS.crear(cont,{
    id:'spaceinvaders',
    intro:'Mueve tu nave (flechas, A/D o arrastrando el dedo) y dispara (Espacio, o mantén el dedo en la pantalla). Destruye todas las oleadas de invasores antes de que lleguen abajo. Protégete detrás de los escudos y cuidado con sus disparos.',
    niveles:[['1','Fácil','2 oleadas, invasores lentos.'],['2','Medio','3 oleadas, disparan más seguido.'],['3','Difícil','4 oleadas, rápidos y muy agresivos.']],
    iniciar(api,nivel){
      const W=400,H=560,OLEADAS={1:2,2:3,3:4}[nivel],FILAS={1:4,2:5,3:5}[nivel],COLS=8,SEP_X=38,SEP_Y=34;
      const esc=GS.escena(api,{w:W,h:H,max:430,fondo:'#10162f',aria:'Space Invaders'}),ent=GS.entrada(esc),E=esc.el;
      for(let i=0;i<46;i++)E('circle',{cx:GS.rand(0,W),cy:GS.rand(0,H),r:GS.rand(.4,1.4),fill:'#fff','fill-opacity':GS.rand(.3,.9)});
      const capaEsc=E('g'),capaInv=E('g'),capaBal=E('g');
      let vidas=3,puntos=0,oleada=1,fin=false,jugando=false,inv=0,cool=0,tReloj=0,dirX=1,ox=0,oy=0,disparoT=0,ufoT=GS.rand(12,20);
      let invasores=[],balasJ=[],balasE=[],escudos=[],ufo=null;
      const nave=E('g'),naveG=E('g',{},nave);naveG.innerHTML='<path d="M0-22L9-4 22 10 22 16 8 12 0 20-8 12-22 16-22 10-9-4z" fill="#8bd3ff" stroke="#dff6ff" stroke-width="2" stroke-linejoin="round"/><path d="M0-12L4 2H-4z" fill="#10162f" fill-opacity=".55"/><circle cx="0" cy="-2" r="3.500" fill="#ffd54a"/>';
      const jug={x:W/2,y:520};
      const SPR=[
        (c)=>`<g><ellipse cx="0" cy="-2" rx="11" ry="9" fill="${c}"/><circle cx="-4" cy="-3" r="2.600" fill="#10162f"/><circle cx="4" cy="-3" r="2.600" fill="#10162f"/><path d="M-5-10L-8-15M5-10L8-15" stroke="${c}" stroke-width="2.500" stroke-linecap="round"/><g class="a"><path d="M-8 6L-11 12M-2 7V13M4 7V13M9 6L12 12" stroke="${c}" stroke-width="3" stroke-linecap="round"/></g><g class="b" display="none"><path d="M-8 6L-6 12M-2 7L-4 13M4 7L6 13M9 6L7 12" stroke="${c}" stroke-width="3" stroke-linecap="round"/></g></g>`,
        (c)=>`<g><rect x="-13" y="-8" width="26" height="14" rx="6" fill="${c}"/><circle cx="-5" cy="-2" r="2.800" fill="#10162f"/><circle cx="5" cy="-2" r="2.800" fill="#10162f"/><g class="a"><path d="M-13-4L-18-12M13-4L18-12" stroke="${c}" stroke-width="3.500" stroke-linecap="round"/><path d="M-8 6L-10 12M8 6L10 12" stroke="${c}" stroke-width="3" stroke-linecap="round"/></g><g class="b" display="none"><path d="M-13-4L-18-1M13-4L18-1" stroke="${c}" stroke-width="3.500" stroke-linecap="round"/><path d="M-8 6L-6 12M8 6L6 12" stroke="${c}" stroke-width="3" stroke-linecap="round"/></g></g>`,
        (c)=>`<g><path d="M-12 4A12 12 0 0 1 12 4z" fill="${c}"/><rect x="-12" y="3" width="24" height="5" rx="2" fill="${c}"/><circle cx="-5" cy="-1" r="2.600" fill="#10162f"/><circle cx="5" cy="-1" r="2.600" fill="#10162f"/><g class="a"><path d="M-9 8V13M-3 8L-5 13M3 8L5 13M9 8V13" stroke="${c}" stroke-width="3" stroke-linecap="round"/></g><g class="b" display="none"><path d="M-9 8L-11 13M-3 8L-1 13M3 8L1 13M9 8L11 13" stroke="${c}" stroke-width="3" stroke-linecap="round"/></g></g>`
      ];
      const COLS_INV=['#ff6b8a','#7ee081','#ffd166','#7ee081','#ff6b8a'];
      function nuevaOleada(){
        capaInv.innerHTML='';invasores=[];balasE.forEach(b=>b.e.remove());balasE=[];ox=20;oy=70+Math.min(oleada-1,3)*10;dirX=1;
        for(let r=0;r<FILAS;r++)for(let c=0;c<COLS;c++){const g=E('g',{},capaInv);g.innerHTML=SPR[r===0?0:r<3?1:2](COLS_INV[r]);invasores.push({r,c,vivo:true,g,a:g.querySelector('.a'),b:g.querySelector('.b'),pts:r===0?30:r<3?20:10})}
      }
      function crearEscudos(){
        capaEsc.innerHTML='';escudos=[];
        [60,170,280].forEach(x0=>{const mapa=['  XXXXX  ',' XXXXXXX ','XXXXXXXXX','XXXXXXXXX','XXX   XXX'];mapa.forEach((fila,r)=>[...fila].forEach((ch,c)=>{if(ch==='X'){const e=E('rect',{x:x0+c*7.5,y:430+r*7,width:7.5,height:7,fill:'#52c06a'},capaEsc);escudos.push({x:x0+c*7.5,y:430+r*7,w:7.5,h:7,e})}}))});
      }
      const ufoEl=E('g');ufoEl.setAttribute('display','none');ufoEl.innerHTML='<ellipse cx="0" cy="0" rx="20" ry="8" fill="#e8472f"/><ellipse cx="0" cy="-5" rx="10" ry="7" fill="#9fe7ff"/><circle cx="-10" cy="1" r="2" fill="#ffd54a"/><circle cx="0" cy="2" r="2" fill="#ffd54a"/><circle cx="10" cy="1" r="2" fill="#ffd54a"/>';
      const hud=()=>api.estado(`${GS.corazones(vidas,3)}<span style="margin:0 12px">Oleada ${Math.min(oleada,OLEADAS)} de ${OLEADAS}</span><span>Puntos ${puntos}</span>`);
      function dispara(){if(cool>0||balasJ.length>=3)return;cool=.36;balasJ.push({x:jug.x,y:jug.y-26,e:E('rect',{width:3.500,height:13,rx:1.500,fill:'#ffd54a'},capaBal)});GS.tono(900,.05,'square',.04,500)}
      function termina(gano,razon){
        if(fin)return;fin=true;lp.parar();
        if(gano){puntos+=200*nivel+vidas*100;api.fin({tipo:'gana',titulo:'¡Invasión detenida!',sub:'destruiste todas las oleadas',puntos,det:`${vidas} vidas restantes`})}
        else api.fin({tipo:'pierde',titulo:razon||'Te derrotaron',sub:'La Tierra cayó',puntos,det:`oleada ${oleada} de ${OLEADAS}`});
      }
      function golpeJugador(){
        if(inv>0||fin)return;vidas--;GS.sonar.pierde();inv=1.7;balasE.forEach(b=>b.e.remove());balasE=[];hud();if(vidas<=0)termina(false,'Te quedaste sin vidas');
      }
      const lp=GS.bucle(dt=>{
        if(!jugando||fin)return;
        tReloj+=dt;cool-=dt;inv-=dt;disparoT-=dt;
        if(ent.teclas.has('ArrowLeft'))jug.x-=250*dt;if(ent.teclas.has('ArrowRight'))jug.x+=250*dt;
        if(ent.p.abajo){const d=ent.p.x-jug.x;jug.x+=Math.sign(d)*Math.min(Math.abs(d),520*dt);dispara()}
        if(ent.teclas.has('Space'))dispara();
        jug.x=Math.max(26,Math.min(W-26,jug.x));
        nave.setAttribute('transform',`translate(${jug.x} ${jug.y})`);nave.setAttribute('opacity',inv>0&&Math.floor(inv*10)%2?.25:1);
        const vivos=invasores.filter(i=>i.vivo),total=FILAS*COLS;
        const vel=(26+oleada*9+nivel*9)*(1+(1-vivos.length/total)*3.2);
        ox+=dirX*vel*dt;
        let mn=1e9,mx=-1e9,bajo=0;vivos.forEach(i=>{const x=ox+i.c*SEP_X;mn=Math.min(mn,x);mx=Math.max(mx,x);bajo=Math.max(bajo,oy+i.r*SEP_Y)});
        if(dirX>0&&mx>W-24){dirX=-1;oy+=16;ox-=Math.max(0,mx-(W-24))}else if(dirX<0&&mn<24){dirX=1;oy+=16;ox+=Math.max(0,24-mn)}
        const anim=Math.floor(tReloj*(1.5+(1-vivos.length/total)*5))%2;
        invasores.forEach(i=>{if(!i.vivo)return;i.g.setAttribute('transform',`translate(${ox+i.c*SEP_X} ${oy+i.r*SEP_Y})`);i.a.setAttribute('display',anim?'none':'inline');i.b.setAttribute('display',anim?'inline':'none')});
        if(vivos.length&&bajo>=410){termina(false,'Los invasores aterrizaron')}
        const cadencia=Math.max(.35,({1:1.5,2:1.1,3:.75}[nivel])-oleada*.08);
        if(disparoT<=0&&vivos.length){disparoT=cadencia*GS.rand(.7,1.2);const cols={};vivos.forEach(i=>{if(!cols[i.c]||i.r>cols[i.c].r)cols[i.c]=i});const ls=Object.values(cols),t=Math.random()<.45?ls.reduce((a,b)=>Math.abs(ox+b.c*SEP_X-jug.x)<Math.abs(ox+a.c*SEP_X-jug.x)?b:a):GS.pick(ls);
          balasE.push({x:ox+t.c*SEP_X,y:oy+t.r*SEP_Y+12,v:170+oleada*14+nivel*16,e:E('path',{d:'M0 0l3 4-3 4 3 4-3 4',stroke:'#ff6b6b','stroke-width':2.800,fill:'none','stroke-linecap':'round'},capaBal)})}
        for(const b of balasJ){b.y-=520*dt;b.e.setAttribute('x',b.x-1.750);b.e.setAttribute('y',b.y)}
        for(const b of balasE){b.y+=b.v*dt;b.e.setAttribute('transform',`translate(${b.x} ${b.y})`)}
        balasJ=balasJ.filter(b=>{
          let borrar=b.y<-10;
          if(!borrar)for(const i of vivos){if(!i.vivo)continue;const x=ox+i.c*SEP_X,y=oy+i.r*SEP_Y;if(Math.abs(b.x-x)<15&&Math.abs(b.y+6-y)<12){i.vivo=false;i.g.remove();puntos+=i.pts;api.puntos(puntos);hud();GS.sonar.captura();borrar=true;break}}
          if(!borrar&&ufo&&Math.abs(b.x-ufo.x)<22&&Math.abs(b.y-44)<12){puntos+=ufo.pts;api.puntos(puntos);hud();ufo.quitar=true;GS.sonar.gana();borrar=true}
          if(!borrar)for(const s of escudos){if(s.e&&b.x>s.x&&b.x<s.x+s.w&&b.y>s.y&&b.y<s.y+s.h){s.e.remove();s.e=null;borrar=true;break}}
          if(borrar)b.e.remove();return !borrar;
        });
        escudos=escudos.filter(s=>s.e);
        balasE=balasE.filter(b=>{let borrar=b.y>H;
          if(!borrar)for(const s of escudos){if(s.e&&b.x>s.x&&b.x<s.x+s.w&&b.y+14>s.y&&b.y<s.y+s.h){s.e.remove();s.e=null;borrar=true;break}}
          if(!borrar&&inv<=0&&Math.abs(b.x-jug.x)<20&&b.y+14>jug.y-18&&b.y<jug.y+14){borrar=true;golpeJugador()}
          if(borrar)b.e.remove();return !borrar});
        escudos=escudos.filter(s=>s.e);
        ufoT-=dt;if(!ufo&&ufoT<=0){ufo={x:-30,pts:GS.pick([50,100,150])};ufoEl.setAttribute('display','inline')}
        if(ufo){ufo.x+=110*dt;ufoEl.setAttribute('transform',`translate(${ufo.x} 44)`);if(ufo.x>W+30||ufo.quitar){ufo=null;ufoEl.setAttribute('display','none');ufoT=GS.rand(14,24)}}
        if(!invasores.some(i=>i.vivo)){
          puntos+=100*oleada;api.puntos(puntos);
          if(oleada>=OLEADAS){termina(true);return}
          oleada++;hud();nuevaOleada();crearEscudos();GS.tono(660,.15);
        }
      });
      GS.iniciaConToque(esc,ent,'Toca o pulsa una tecla para empezar',()=>{jugando=true});
      GS.pad(api,ent,[{k:'ArrowLeft',ico:'izq',etq:'Izquierda'},{k:'Space',ico:'fuego',etq:'Disparar'},{k:'ArrowRight',ico:'der',etq:'Derecha'}]);
      api.botones([{txt:'Pausa',ico:'pausa',fn:()=>api.msg(lp.pausa()?'Pausa':'')}]);
      nuevaOleada();crearEscudos();hud();
      return{destruir(){lp.parar();ent.destruir()},dbg:{matarTodos(){invasores.forEach(i=>{if(i.vivo){i.vivo=false;i.g.remove()}})},golpear:golpeJugador,get vidas(){return vidas},get oleada(){return oleada},get puntos(){return puntos},get invasores(){return invasores.filter(i=>i.vivo).length},dispara,bajar(){oy=420}}};
    }
  });
}

/* 2) ASTEROIDS */
function initAsteroids(cont){
  return GS.crear(cont,{
    id:'asteroids',
    intro:'Gira (← →), impulsa (↑) y dispara (Espacio). Destruye los asteroides: al romperse se dividen en pedazos más pequeños. Si sales por un lado de la pantalla, apareces por el contrario. En el teléfono usa los botones de abajo.',
    niveles:[['1','Fácil','2 oleadas, pocos asteroides lentos.'],['2','Medio','3 oleadas con más asteroides.'],['3','Difícil','4 oleadas, rápidos y numerosos.']],
    iniciar(api,nivel){
      const W=480,H=480,OLEADAS={1:2,2:3,3:4}[nivel];
      const esc=GS.escena(api,{w:W,h:H,max:480,fondo:'#0b1026',aria:'Asteroids'}),ent=GS.entrada(esc),E=esc.el;
      for(let i=0;i<60;i++)E('circle',{cx:GS.rand(0,W),cy:GS.rand(0,H),r:GS.rand(.4,1.3),fill:'#fff','fill-opacity':GS.rand(.3,.9)});
      const capaA=E('g'),capaB=E('g'),capaP=E('g');
      let vidas=3,puntos=0,oleada=1,fin=false,jugando=false,inv=0,cool=0,muerto=0,rocas=[],balas=[],particulas=[];
      const nave={x:W/2,y:H/2,vx:0,vy:0,a:0},gNave=E('g'),cuerpo=E('g',{},gNave);
      cuerpo.innerHTML='<path d="M0-16L11 13 0 7-11 13z" fill="#dff6ff" stroke="#8bd3ff" stroke-width="2.500" stroke-linejoin="round"/><circle cx="0" cy="-2" r="3" fill="#ffd54a"/>';
      const llama=E('path',{d:'M-5 10L0 24 5 10z',fill:'#ff9f43',display:'none'},gNave);
      const hud=()=>api.estado(`${GS.corazones(vidas,3)}<span style="margin:0 12px">Oleada ${Math.min(oleada,OLEADAS)} de ${OLEADAS}</span><span>Puntos ${puntos}</span>`);
      const TAM={3:{r:36,pts:20},2:{r:22,pts:50},1:{r:12,pts:100}};
      function crearRoca(tam,x,y,vx,vy){
        const r=TAM[tam].r,n=11,pts=[];for(let i=0;i<n;i++){const a=i/n*Math.PI*2,k=GS.rand(.74,1.1);pts.push(`${(Math.cos(a)*r*k).toFixed(1)},${(Math.sin(a)*r*k).toFixed(1)}`)}
        const g=E('g',{},capaA);g.innerHTML=`<polygon points="${pts.join(' ')}" fill="#8a7f74" stroke="#d6c9b5" stroke-width="2.500" stroke-linejoin="round"/><circle cx="${-r*.2}" cy="${-r*.15}" r="${r*.16}" fill="#6f655b"/><circle cx="${r*.25}" cy="${r*.22}" r="${r*.11}" fill="#6f655b"/>`;
        rocas.push({tam,r,x,y,vx,vy,a:GS.rand(0,6.28),va:GS.rand(-1.2,1.2),g});
      }
      function nuevaOleada(){
        const n=({1:3,2:4,3:5}[nivel])+oleada;
        for(let i=0;i<n;i++){let x,y;do{x=GS.rand(0,W);y=GS.rand(0,H)}while(GS.dist({x,y},nave)<150);const v=GS.rand(28,60)*(1+nivel*.18+oleada*.1),a=GS.rand(0,6.28);crearRoca(3,x,y,Math.cos(a)*v,Math.sin(a)*v)}
      }
      function chispas(x,y,n,col){for(let i=0;i<n;i++){const a=GS.rand(0,6.28),v=GS.rand(40,160),e=E('circle',{r:GS.rand(1,2.600),fill:col},capaP);particulas.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,t:GS.rand(.3,.7),e})}}
      function termina(gano){
        if(fin)return;fin=true;lp.parar();
        if(gano){puntos+=250*nivel+vidas*120;api.fin({tipo:'gana',titulo:'¡Sector despejado!',sub:'destruiste todos los asteroides',puntos,det:`${vidas} vidas restantes`})}
        else api.fin({tipo:'pierde',titulo:'Nave destruida',sub:'Los asteroides ganaron',puntos,det:`oleada ${oleada} de ${OLEADAS}`});
      }
      function dispara(){if(cool>0||balas.length>=6||muerto>0)return;cool=.22;const dx=Math.sin(nave.a),dy=-Math.cos(nave.a);balas.push({x:nave.x+dx*16,y:nave.y+dy*16,vx:nave.vx+dx*440,vy:nave.vy+dy*440,t:1,e:E('circle',{r:2.800,fill:'#ffe9a8'},capaB)});GS.tono(800,.06,'square',.04,300)}
      function destruirNave(){
        if(inv>0||muerto>0||fin)return;vidas--;GS.sonar.pierde();chispas(nave.x,nave.y,22,'#ffd54a');hud();gNave.setAttribute('display','none');
        if(vidas<=0)return termina(false);muerto=.4;
      }
      const lp=GS.bucle(dt=>{
        if(!jugando||fin)return;cool-=dt;inv-=dt;
        if(muerto>0){muerto-=dt;if(muerto<=0){Object.assign(nave,{x:W/2,y:H/2,vx:0,vy:0,a:0});inv=2.6;gNave.setAttribute('transform',`translate(${nave.x} ${nave.y})`);gNave.setAttribute('display','inline');muerto=0}}
        else{
          if(ent.teclas.has('ArrowLeft'))nave.a-=3.8*dt;if(ent.teclas.has('ArrowRight'))nave.a+=3.8*dt;
          const emp=ent.teclas.has('ArrowUp');if(emp){nave.vx+=Math.sin(nave.a)*270*dt;nave.vy-=Math.cos(nave.a)*270*dt}
          llama.setAttribute('display',emp&&Math.floor(performance.now()/60)%2?'inline':'none');
          if(ent.teclas.has('Space'))dispara();
          const f=Math.max(0,1-.45*dt);nave.vx*=f;nave.vy*=f;const sp=Math.hypot(nave.vx,nave.vy);if(sp>330){nave.vx*=330/sp;nave.vy*=330/sp}
          nave.x=(nave.x+nave.vx*dt+W)%W;nave.y=(nave.y+nave.vy*dt+H)%H;
          gNave.setAttribute('transform',`translate(${nave.x} ${nave.y}) rotate(${nave.a*180/Math.PI})`);gNave.setAttribute('opacity',inv>0&&Math.floor(inv*10)%2?.3:1);
        }
        rocas.forEach(r=>{r.x=(r.x+r.vx*dt+W)%W;r.y=(r.y+r.vy*dt+H)%H;r.a+=r.va*dt;r.g.setAttribute('transform',`translate(${r.x} ${r.y}) rotate(${r.a*180/Math.PI})`)});
        balas=balas.filter(b=>{b.t-=dt;b.x=(b.x+b.vx*dt+W)%W;b.y=(b.y+b.vy*dt+H)%H;b.e.setAttribute('cx',b.x);b.e.setAttribute('cy',b.y);
          let borrar=b.t<=0;
          if(!borrar)for(let i=0;i<rocas.length;i++){const r=rocas[i];if(GS.dist(b,r)<r.r){borrar=true;puntos+=TAM[r.tam].pts;api.puntos(puntos);hud();GS.sonar.captura();chispas(r.x,r.y,8,'#d6c9b5');
              r.g.remove();rocas.splice(i,1);if(r.tam>1){for(let k=0;k<2;k++){const a=GS.rand(0,6.28),v=GS.rand(45,95)*(1+nivel*.15);crearRoca(r.tam-1,r.x,r.y,Math.cos(a)*v+r.vx*.3,Math.sin(a)*v+r.vy*.3)}}break}}
          if(borrar)b.e.remove();return !borrar});
        if(muerto<=0&&inv<=0)for(const r of rocas){if(GS.dist(r,nave)<r.r*.85+9){destruirNave();break}}
        particulas=particulas.filter(p=>{p.t-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.e.setAttribute('cx',p.x);p.e.setAttribute('cy',p.y);p.e.setAttribute('opacity',Math.max(0,p.t*2));if(p.t<=0){p.e.remove();return false}return true});
        if(!rocas.length&&!fin){puntos+=150*oleada;api.puntos(puntos);if(oleada>=OLEADAS)return termina(true);oleada++;hud();nuevaOleada();GS.tono(660,.15)}
      });
      GS.iniciaConToque(esc,ent,'Toca o pulsa una tecla para empezar',()=>{jugando=true});
      GS.pad(api,ent,[{k:'ArrowLeft',ico:'izq',etq:'Girar a la izquierda'},{k:'ArrowUp',ico:'impulso',etq:'Impulso'},{k:'ArrowRight',ico:'der',etq:'Girar a la derecha'},{k:'Space',ico:'fuego',etq:'Disparar'}]);
      api.botones([{txt:'Pausa',ico:'pausa',fn:()=>api.msg(lp.pausa()?'Pausa':'')}]);
      nuevaOleada();hud();
      return{destruir(){lp.parar();ent.destruir()},dbg:{destruirRocas(){rocas.forEach(r=>r.g.remove());rocas=[]},golpear:destruirNave,get vidas(){return vidas},get rocas(){return rocas.length},get puntos(){return puntos},get oleada(){return oleada},dispara}};
    }
  });
}

/* 3) CARRERAS INFINITAS (corredor automático) */
function initEndlessRunner(cont){
  return GS.crear(cont,{
    id:'carrerainfinita',
    intro:'Tu personaje corre solo. Salta (Espacio, flecha arriba o toca la pantalla) los cactus y las rocas, y agáchate (flecha abajo, o mantén presionada la parte baja de la pantalla) para pasar bajo los pájaros altos. Recoge monedas. Llega a la meta de distancia.',
    niveles:[['1','Fácil','Meta de 1,000 m, velocidad moderada.'],['2','Medio','Meta de 1,800 m, más obstáculos.'],['3','Difícil','Meta de 3,000 m, muy rápido.']],
    iniciar(api,nivel){
      const W=560,H=300,SUELO=236,META={1:1000,2:1800,3:3000}[nivel];
      const esc=GS.escena(api,{w:W,h:H,max:620,fondo:'#9fd8f5',aria:'Carrera infinita'}),ent=GS.entrada(esc),E=esc.el;
      /* ---- cielo, sol y montañas ---- */
      E('defs').innerHTML=`<linearGradient id="ciR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5db8ee"/><stop offset=".7" stop-color="#bfe8fa"/><stop offset="1" stop-color="#fff0cf"/></linearGradient>
        <linearGradient id="suR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9a7340"/><stop offset="1" stop-color="#6e5029"/></linearGradient>
        <radialGradient id="solR"><stop offset="0" stop-color="#fffbe0"/><stop offset=".5" stop-color="#ffe27a"/><stop offset="1" stop-color="#ffe27a" stop-opacity="0"/></radialGradient>`;
      E('rect',{width:W,height:H,fill:'url(#ciR)'});
      E('circle',{cx:470,cy:62,r:60,fill:'url(#solR)'});E('circle',{cx:470,cy:62,r:24,fill:'#ffe27a'});
      const montes=E('g'),nubes=E('g'),colinas=E('g'),suelo=E('g'),capaO=E('g'),capaM=E('g'),pasto=E('g');
      const mts=[];for(let i=0;i<4;i++){const g=E('g',{},montes);g.innerHTML=`<path d="M0 ${SUELO} L70 ${SUELO-120} L105 ${SUELO-85} L140 ${SUELO-135} L240 ${SUELO}z" fill="#9db9d6"/><path d="M70 ${SUELO-120} L52 ${SUELO-90} L70 ${SUELO-98} L84 ${SUELO-88}z M140 ${SUELO-135} L122 ${SUELO-100} L140 ${SUELO-108} L156 ${SUELO-97}z" fill="#fff" fill-opacity=".85"/>`;mts.push({g,x:i*200})}
      for(let i=0;i<5;i++){const g=E('g',{},nubes);g.dataset.x=i*150+GS.rand(0,40);g.dataset.y=GS.rand(24,90);g.innerHTML='<ellipse cx="0" cy="4" rx="38" ry="11" fill="#fff" fill-opacity=".95"/><ellipse cx="-12" cy="-5" rx="18" ry="12" fill="#fff"/><ellipse cx="12" cy="-8" rx="22" ry="14" fill="#fff"/>'}
      const hills=[];for(let i=0;i<4;i++){const g=E('g',{},colinas);g.innerHTML=`<path d="M0 ${SUELO} Q90 ${SUELO-86} 180 ${SUELO}z" fill="${i%2?'#7fc765':'#6bb552'}"/><g transform="translate(${60+i*8} ${SUELO-34})"><rect x="-2" y="0" width="4" height="12" fill="#6b4a2a"/><circle cy="-4" r="11" fill="#3f9a4d"/><circle cx="-6" cy="2" r="7" fill="#4aa857"/></g>`;hills.push({g,x:i*150})}
      /* ---- suelo ---- */
      E('rect',{x:0,y:SUELO,width:W,height:H-SUELO,fill:'url(#suR)'});
      E('rect',{x:0,y:SUELO,width:W,height:13,fill:'#62b946'});E('rect',{x:0,y:SUELO+9,width:W,height:5,fill:'#4a9a36'});
      const marcas=[];for(let i=0;i<10;i++){const r=E('g',{},suelo);r.innerHTML=i%2?`<ellipse cx="9" cy="2" rx="9" ry="3.5" fill="#7d5d33"/>`:`<rect width="18" height="4" rx="2" fill="#5e4524"/>`;marcas.push({r,x:i*64+GS.rand(0,30),y:SUELO+26+(i%3)*14})}
      const hierba=[];for(let i=0;i<14;i++){const g=E('g',{},pasto);g.innerHTML=`<path d="M0 0L-3 -9M2 0L2 -12M5 0L8 -8" stroke="#3f9a4d" stroke-width="2.4" stroke-linecap="round"/>`;hierba.push({g,x:i*44+GS.rand(0,20)})}
      /* ---- personaje: corre / salta / se agacha ---- */
      const px=96,pl={y:SUELO,vy:0,agachado:false,suelo:true};
      const g=E('g'),sombra=E('ellipse',{cx:0,cy:0,rx:16,ry:3.5,fill:'#000','fill-opacity':.22},g);
      const pie=`<path d="M-3 0Q-3 -4 2 -4H9Q12 -4 12 0z" fill="#fff" stroke="#c9d3e0" stroke-width="1"/><rect x="-3" y="-1" width="15" height="2.4" rx="1.2" fill="#e8472f"/>`;
      const pierna=(c1,c2)=>`<g class="mu"><rect x="-3.6" y="-2" width="7.2" height="14" rx="3.6" fill="${c1}"/><g class="ro" transform="translate(0 10)"><rect x="-3" y="-2" width="6" height="13" rx="3" fill="${c2}"/><g transform="translate(0 11)">${pie}</g></g></g>`;
      const brazo=(c)=>`<g class="mu"><rect x="-3" y="-2" width="6" height="12" rx="3" fill="${c}"/><g class="ro" transform="translate(0 9)"><rect x="-2.6" y="-2" width="5.2" height="11" rx="2.6" fill="#f5c9a0"/></g></g>`;
      const corre=E('g',{},g);
      corre.innerHTML=`<g class="bandana"><path d="M-6 -57 Q-22 -54 -28 -60 Q-20 -50 -6 -52z" fill="#ffd54a"/></g>
        <g transform="translate(0 -22)" class="legB">${pierna('#1f3f8a','#f5c9a0')}</g>
        <g transform="translate(-1 -42)" class="armB">${brazo('#c43a25')}</g>
        <rect x="-9" y="-45" width="19" height="25" rx="8" fill="#e8472f"/><rect x="-9" y="-33" width="19" height="4" fill="#fff" fill-opacity=".85"/><rect x="-9" y="-26" width="19" height="8" rx="4" fill="#2f5fbd"/>
        <g transform="translate(0 -22)" class="legF">${pierna('#2f5fbd','#f5c9a0')}</g>
        <circle cx="2" cy="-54" r="9.5" fill="#f5c9a0"/><path d="M-8 -55Q-6 -66 4 -65Q12 -64 12 -57Q4 -60 -8 -55z" fill="#3b2a1e"/><rect x="-8" y="-58" width="20" height="3.4" rx="1.7" fill="#ffd54a"/>
        <circle cx="6" cy="-53" r="1.7" fill="#222"/><path d="M5 -49Q8 -47 10.500 -49" stroke="#8a4a3a" stroke-width="1.4" fill="none" stroke-linecap="round"/>
        <g transform="translate(2 -42)" class="armF">${brazo('#e8472f')}</g>`;
      const agacha=E('g',{display:'none'},g);
      agacha.innerHTML=`<path d="M-14 -22 Q-30 -20 -34 -24 Q-26 -14 -12 -16z" fill="#ffd54a" class="bandana2"/>
        <rect x="-16" y="-14" width="9" height="14" rx="4" fill="#2f5fbd" transform="rotate(-18 -11 -2)"/><path d="M-20 0Q-20 -4 -15 -4H-8Q-6 -4 -6 0z" fill="#fff" stroke="#c9d3e0"/>
        <rect x="-12" y="-20" width="30" height="16" rx="8" fill="#e8472f" transform="rotate(-12 0 -12)"/><rect x="-2" y="-19" width="4" height="15" fill="#fff" fill-opacity=".85" transform="rotate(-12 0 -12)"/>
        <rect x="-4" y="-12" width="11" height="12" rx="4.500" fill="#2f5fbd" transform="rotate(34 0 -8)"/><path d="M1 0Q1 -4 6 -4H14Q17 -4 17 0z" fill="#fff" stroke="#c9d3e0"/>
        <circle cx="18" cy="-24" r="9" fill="#f5c9a0"/><path d="M9 -26Q11 -35 20 -34Q28 -33 27 -26Q18 -29 9 -26z" fill="#3b2a1e"/><rect x="10" y="-28.500" width="17" height="3.200" rx="1.600" fill="#ffd54a"/><circle cx="22" cy="-23" r="1.600" fill="#222"/>
        <rect x="12" y="-17" width="18" height="6" rx="3" fill="#f5c9a0" transform="rotate(-14 12 -14)"/>`;
      const pA=corre.querySelector('.legF'),pB=corre.querySelector('.legB'),aA=corre.querySelector('.armF'),aB=corre.querySelector('.armB'),band=corre.querySelector('.bandana');
      const rot=(n,a,b)=>{n.firstChild.setAttribute('transform',`rotate(${a})`);const r=n.querySelector('.ro');r.setAttribute('transform',`translate(0 ${r.getAttribute('transform').match(/translate\(0 ([\d.]+)\)/)[1]}) rotate(${b})`)};
      let vidas=3,puntos=0,monedas=0,metros=0,fin=false,jugando=false,inv=0,t=0,spawn=1.2,obst=[],mons=[];
      const hud=()=>api.estado(`${GS.corazones(vidas,3)}<span style="margin:0 12px">${Math.floor(metros)} / ${META} m</span><span>Monedas ${monedas}</span>`);
      function saltar(){if(pl.suelo&&!fin&&jugando){pl.vy=-640;pl.suelo=false;GS.tono(520,.08,'triangle',.06,820)}}
      function crearObst(){
        const v=GS.rand(0,1);let o;
        if(metros>80&&v<.28){const alto=Math.random()<.5;o={tipo:'pajaro',w:36,h:18,x:W+40,y:alto?SUELO-62:SUELO-26};const e=E('g',{},capaO);e.innerHTML='<path class="alaB" d="M-2-4L-12-20 6-6z" fill="#4a2f73"/><ellipse cx="0" cy="0" rx="15" ry="8.500" fill="#6b46a5"/><ellipse cx="2" cy="3" rx="9" ry="4.500" fill="#d9c8f2"/><path d="M-14 0L-26 -4-24 3z" fill="#4a2f73"/><circle cx="9" cy="-2" r="4.500" fill="#6b46a5"/><path d="M13-2L23 1 13 3z" fill="#f2a43a"/><circle cx="10" cy="-3" r="2" fill="#fff"/><circle cx="10.600" cy="-3" r="1" fill="#222"/><path class="ala" d="M-4-5L-14-22 6-7z" fill="#8a63c9"/>';o.e=e;o.ala=e.querySelector('.ala')}
        else if(v<.62){const alto=Math.random()<.5;o={tipo:'cactus',w:alto?30:22,h:alto?58:42,x:W+40,y:SUELO-(alto?58:42)};const e=E('g',{},capaO);
          const pinchos=(h)=>Array.from({length:Math.floor(h/10)},(_,k)=>`<path d="M${alto?9:5} ${6+k*10}l-3 -2M${alto?21:17} ${10+k*10}l3 -2" stroke="#d9f2c6" stroke-width="1.400" stroke-linecap="round"/>`).join('');
          e.innerHTML=alto?`<rect x="9" y="0" width="12" height="58" rx="6" fill="#3f9a4d"/><rect x="14" y="0" width="3" height="58" rx="1.500" fill="#57b567"/><path d="M9 34H3Q0 34 0 30V18" stroke="#3f9a4d" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 26H27Q30 26 30 22V10" stroke="#3f9a4d" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="15" cy="2" r="4" fill="#ff6b8a"/>${pinchos(56)}`:`<rect x="5" y="0" width="12" height="42" rx="6" fill="#3f9a4d"/><rect x="10" y="0" width="3" height="42" rx="1.500" fill="#57b567"/><path d="M5 26H3Q0 26 0 22V16" stroke="#3f9a4d" stroke-width="7" fill="none" stroke-linecap="round"/>${pinchos(40)}`;o.e=e}
        else{o={tipo:'roca',w:38,h:26,x:W+40,y:SUELO-26};const e=E('g',{},capaO);e.innerHTML='<path d="M0 26L5 9 15 1 30 3 38 14 36 26z" fill="#8a8f96" stroke="#5f656c" stroke-width="2.500" stroke-linejoin="round"/><path d="M15 1L30 3 38 14 24 12z" fill="#aab0b8"/><path d="M12 12L18 20M26 14L24 24" stroke="#5f656c" stroke-width="1.800" stroke-linecap="round"/>';o.e=e}
        obst.push(o);
        if(Math.random()<.6){const yy=GS.pick([SUELO-40,SUELO-110,SUELO-80]);for(let k=0;k<3;k++){const e=E('g',{},capaM);e.innerHTML='<circle r="9" fill="#ffd54a" stroke="#e0a800" stroke-width="2.500"/><circle r="5.500" fill="none" stroke="#e8b400" stroke-width="1.400"/><path d="M-3-4Q-4 0-3 4" stroke="#fff" stroke-width="1.800" stroke-linecap="round" fill="none" stroke-opacity=".8"/>';mons.push({x:W+120+k*30,y:yy,e})}}
      }
      function termina(gano){
        if(fin)return;fin=true;lp.parar();puntos=Math.floor(metros)+monedas*10;
        if(gano){puntos+=300*nivel+vidas*100;api.fin({tipo:'gana',titulo:'¡Meta alcanzada!',sub:`corriste ${META} metros`,puntos,det:`${monedas} monedas · ${vidas} vidas`})}
        else api.fin({tipo:'pierde',titulo:'Te alcanzaron los obstáculos',sub:'Sin vidas',puntos,det:`${Math.floor(metros)} m · ${monedas} monedas`});
      }
      function golpe(){if(inv>0||fin)return;vidas--;GS.sonar.pierde();inv=1.4;hud();GS.destello(esc,px+10,pl.y-30,'#ff7a59',26);if(vidas<=0)termina(false)}
      const lp=GS.bucle(dt=>{
        if(!jugando||fin)return;t+=dt;inv-=dt;
        const v=Math.min(560,300+metros*.1+nivel*22);metros+=v*dt/12;
        puntos=Math.floor(metros)+monedas*10;api.puntos(puntos);
        pl.agachado=pl.suelo&&(ent.teclas.has('ArrowDown')||(ent.p.abajo&&ent.p.y>H*.62));
        if(ent.teclas.has('ArrowUp')||ent.teclas.has('Space'))saltar();
        if(!pl.suelo){pl.vy+=1900*dt;pl.y+=pl.vy*dt;if(pl.y>=SUELO){pl.y=SUELO;pl.vy=0;pl.suelo=true}}
        const ciclo=t*15;
        corre.setAttribute('display',pl.agachado?'none':'inline');agacha.setAttribute('display',pl.agachado?'inline':'none');
        if(!pl.agachado){
          if(pl.suelo){const s=Math.sin(ciclo),c=Math.cos(ciclo);rot(pA,s*42,Math.max(0,-c)*70+8);rot(pB,-s*42,Math.max(0,c)*70+8);rot(aA,-s*50,-50-Math.max(0,s)*20);rot(aB,s*50,-50-Math.max(0,-s)*20)}
          else{rot(pA,-45,60);rot(pB,25,35);rot(aA,-120,-20);rot(aB,-100,-30)}
          band.setAttribute('transform',`translate(0 ${Math.sin(t*20)*2}) rotate(${Math.sin(t*22)*6} -6 -55)`);
        }else agacha.querySelector('.bandana2').setAttribute('transform',`rotate(${Math.sin(t*22)*5} -14 -20)`);
        sombra.setAttribute('transform',`translate(${pl.agachado?4:0} ${SUELO-pl.y}) scale(${Math.max(.4,1-(SUELO-pl.y)/220)} 1)`);
        g.setAttribute('transform',`translate(${px} ${pl.y})`);g.setAttribute('opacity',inv>0&&Math.floor(inv*10)%2?.35:1);
        nubes.childNodes.forEach(n=>{let x=+n.dataset.x-v*.08*dt;if(x<-60)x=W+60;n.dataset.x=x;n.setAttribute('transform',`translate(${x} ${n.dataset.y})`)});
        mts.forEach(m=>{m.x-=v*.05*dt;if(m.x<-240)m.x+=4*200;m.g.setAttribute('transform',`translate(${m.x} 0)`)});
        hills.forEach(h=>{h.x-=v*.25*dt;if(h.x<-190)h.x+=4*150+40;h.g.setAttribute('transform',`translate(${h.x} 0)`)});
        marcas.forEach(m=>{m.x-=v*dt;if(m.x<-30)m.x+=W+40;m.r.setAttribute('transform',`translate(${m.x} ${m.y})`)});
        hierba.forEach(h=>{h.x-=v*dt;if(h.x<-20)h.x+=W+40;h.g.setAttribute('transform',`translate(${h.x} ${SUELO+4})`)});
        spawn-=dt;if(spawn<=0){crearObst();spawn=GS.rand(.95,1.7)*(300/v)*({1:1.15,2:1,3:.85}[nivel])}
        const caja={x:px-12,y:pl.y-(pl.agachado?30:54),w:24,h:pl.agachado?30:54};
        obst=obst.filter(o=>{o.x-=v*dt;o.e.setAttribute('transform',`translate(${o.x} ${o.y+(o.tipo==='pajaro'?9:0)})`);if(o.ala)o.ala.setAttribute('transform',`scale(1 ${Math.sin(t*18)})`);
          if(o.x<-60){o.e.remove();return false}
          if(inv<=0&&GS.choca(caja,{x:o.x+4,y:o.y+3,w:o.w-8,h:o.h-5}))golpe();return true});
        mons=mons.filter(m=>{m.x-=v*dt;m.e.setAttribute('transform',`translate(${m.x} ${m.y+Math.sin(t*6+m.x*.05)*3}) scale(${Math.abs(Math.cos(t*4+m.x*.03))*.6+.4} 1)`);
          if(m.x<-20){m.e.remove();return false}
          if(GS.dist({x:m.x,y:m.y},{x:px,y:pl.y-(pl.agachado?15:28)})<26){m.e.remove();monedas++;GS.tono(1000,.06,'triangle',.06,1500);hud();return false}return true});
        if(Math.floor(metros)%20===0)hud();
        if(metros>=META)termina(true);
      });
      ent.on('abajo',p=>{if(p.y<=H*.62)saltar()});
      GS.iniciaConToque(esc,ent,'',()=>{jugando=true});
      GS.pad(api,ent,[{k:'ArrowDown',ico:'abajo',etq:'Agacharse',txt:' Agacharse'},{k:'Space',ico:'arriba',etq:'Saltar',txt:' Saltar'}]);
      api.botones([{txt:'Pausa',ico:'pausa',fn:()=>api.msg(lp.pausa()?'Pausa':'')}]);hud();
      return{destruir(){lp.parar();ent.destruir()},dbg:{acercarMeta(){metros=META-30},golpear:golpe,get vidas(){return vidas},get metros(){return metros},get puntos(){return puntos},saltar,get obst(){return obst.length}}};
    }
  });
}

/* 4) CARRERAS DE AUTOS */
function initCarRace(cont){
  const cocheSVG=(color,jug)=>`<g><rect x="-17" y="-30" width="34" height="60" rx="11" fill="${color}" stroke="rgba(0,0,0,.35)" stroke-width="2.500"/><rect x="-12" y="-18" width="24" height="14" rx="4" fill="#bfe6ff"/><rect x="-12" y="8" width="24" height="10" rx="3" fill="#9ccbe8"/><rect x="-10" y="-3" width="20" height="11" rx="3" fill="${color}" stroke="rgba(0,0,0,.25)" stroke-width="1.500"/>
    <rect x="-21" y="-22" width="6" height="14" rx="2.500" fill="#222"/><rect x="15" y="-22" width="6" height="14" rx="2.500" fill="#222"/><rect x="-21" y="10" width="6" height="14" rx="2.500" fill="#222"/><rect x="15" y="10" width="6" height="14" rx="2.500" fill="#222"/>
    ${jug?'<circle cx="-11" cy="-28" r="3" fill="#fff3a0"/><circle cx="11" cy="-28" r="3" fill="#fff3a0"/><rect x="-3" y="-30" width="6" height="40" fill="#fff" fill-opacity=".5"/>':'<circle cx="-11" cy="27" r="2.800" fill="#ff5a4d"/><circle cx="11" cy="27" r="2.800" fill="#ff5a4d"/>'}</g>`;
  return GS.crear(cont,{
    id:'carreraautos',
    intro:'Conduce con ← → (o A/D), o arrastra el dedo por la pista. Esquiva los autos que van más lento que tú. Cada choque te quita una vida. ¡Gana puntos por rebasarlos cerca! Llega a la meta de distancia.',
    niveles:[['1','Fácil','3 carriles, tráfico escaso. Meta: 1,500 m.'],['2','Medio','4 carriles, más tráfico. Meta: 2,500 m.'],['3','Difícil','4 carriles, tráfico denso y veloz. Meta: 4,000 m.']],
    iniciar(api,nivel){
      const W=360,H=560,L={1:3,2:4,3:4}[nivel],X0=40,AN=280,LW=AN/L,META={1:1500,2:2500,3:4000}[nivel];
      const esc=GS.escena(api,{w:W,h:H,max:400,fondo:'#5fae4a',aria:'Carreras de autos'}),ent=GS.entrada(esc),E=esc.el;
      E('rect',{x:X0-8,y:0,width:AN+16,height:H,fill:'#e9e2cf'});E('rect',{x:X0,y:0,width:AN,height:H,fill:'#4a4f57'});
      for(let i=0;i<6;i++){E('rect',{x:X0-26+(i%2)*(AN+40),y:i*100,width:14,height:60,rx:7,fill:'#3f9a4d'})}
      const rayas=E('g'),capaT=E('g'),capaJ=E('g');const marc=[];
      for(let l=1;l<L;l++)for(let i=0;i<8;i++){const r=E('rect',{x:X0+l*LW-2,width:4,height:34,rx:2,fill:'#f5f0e1'},rayas);marc.push({r,y:i*80})}
      const jug={x:X0+AN/2,y:470},gJ=E('g',{},capaJ);gJ.innerHTML=cocheSVG('#e8472f',true);
      let vidas=3,puntos=0,metros=0,fin=false,jugando=false,inv=0,t=0,spawn=.8,trafico=[],bonus=0;
      const COLS=['#2f7fd1','#f2c230','#43a047','#f4f4f4','#8e24aa','#2b2b2b','#fb8c00'];
      const hud=()=>api.estado(`${GS.corazones(vidas,3)}<span style="margin:0 12px">${Math.floor(metros)} / ${META} m</span><span>Puntos ${puntos}</span>`);
      function termina(gano){
        if(fin)return;fin=true;lp.parar();
        if(gano){puntos+=300*nivel+vidas*100;api.fin({tipo:'gana',titulo:'¡Llegaste a la meta!',sub:`recorriste ${META} metros`,puntos,det:`${vidas} vidas restantes`})}
        else api.fin({tipo:'pierde',titulo:'Auto destruido',sub:'Demasiados choques',puntos,det:`${Math.floor(metros)} m`});
      }
      function choque(c){if(inv>0||fin)return;vidas--;inv=1.6;GS.sonar.pierde();c.quitar=true;hud();if(vidas<=0)termina(false)}
      const lp=GS.bucle(dt=>{
        if(!jugando||fin)return;t+=dt;inv-=dt;
        const v=Math.min(560,300+metros*.045+nivel*25);metros+=v*dt/8;puntos=Math.floor(metros)+bonus;
        let dx=0;if(ent.teclas.has('ArrowLeft'))dx-=1;if(ent.teclas.has('ArrowRight'))dx+=1;
        if(ent.p.abajo){const d=ent.p.x-jug.x;jug.x+=Math.sign(d)*Math.min(Math.abs(d),330*dt)}else jug.x+=dx*270*dt;
        jug.x=Math.max(X0+19,Math.min(X0+AN-19,jug.x));
        gJ.setAttribute('transform',`translate(${jug.x} ${jug.y}) rotate(${dx*4+(ent.p.abajo?Math.sign(ent.p.x-jug.x)*3:0)})`);gJ.setAttribute('opacity',inv>0&&Math.floor(inv*10)%2?.35:1);
        marc.forEach(m=>{m.y+=v*dt;if(m.y>H)m.y-=640;m.r.setAttribute('y',m.y)});
        spawn-=dt;if(spawn<=0){
          const base={1:1.15,2:.85,3:.62}[nivel]*(320/v)*GS.rand(.8,1.3);spawn=Math.max(.32,base);
          const ocupados=new Set(trafico.filter(c=>c.y<150).map(c=>c.l)),libres=[...Array(L).keys()].filter(l=>!ocupados.has(l));
          if(libres.length>1){const l=GS.pick(libres),g=E('g',{},capaT);g.innerHTML=cocheSVG(GS.pick(COLS),false);
            trafico.push({l,x:X0+LW*(l+.5),y:-70,tv:GS.rand(95,210)*(1+nivel*.12),g,pasado:false})}
        }
        trafico=trafico.filter(c=>{c.y+=(v-c.tv)*dt;c.g.setAttribute('transform',`translate(${c.x} ${c.y}) rotate(180)`);
          if(c.quitar||c.y>H+70){c.g.remove();return false}
          const a={x:jug.x-14,y:jug.y-26,w:28,h:52},b={x:c.x-14,y:c.y-26,w:28,h:52};
          if(inv<=0&&GS.choca(a,b)){GS.destello(esc,(c.x+jug.x)/2,(c.y+jug.y)/2);choque(c);c.g.remove();return false}
          if(!c.pasado&&c.y>jug.y+30){c.pasado=true;if(Math.abs(c.x-jug.x)<LW*.9)bonus+=5}
          return true});
        api.puntos(puntos);if(Math.floor(metros)%25===0)hud();
        if(metros>=META)termina(true);
      });
      GS.iniciaConToque(esc,ent,'Toca o pulsa una tecla para arrancar',()=>{jugando=true});
      GS.pad(api,ent,[{k:'ArrowLeft',ico:'izq',etq:'Izquierda'},{k:'ArrowRight',ico:'der',etq:'Derecha'}]);
      api.botones([{txt:'Pausa',ico:'pausa',fn:()=>api.msg(lp.pausa()?'Pausa':'')}]);hud();
      return{destruir(){lp.parar();ent.destruir()},dbg:{acercarMeta(){metros=META-30},golpear(){choque({})},get vidas(){return vidas},get metros(){return metros},get puntos(){return puntos},get trafico(){return trafico.length}}};
    }
  });
}

/* 5) HELICÓPTERO DE OBSTÁCULOS */
function initHelicopter(cont){
  return GS.crear(cont,{
    id:'helicoptero',
    intro:'Mantén presionado (Espacio, flecha arriba o el dedo) para subir; suelta para bajar. Vuela por el túnel sin tocar las paredes ni los bloques. Cada choque te quita una vida. Llega a la meta de distancia.',
    niveles:[['1','Fácil','Túnel ancho. Meta: 1,200 m.'],['2','Medio','Túnel más angosto y con bloques. Meta: 2,000 m.'],['3','Difícil','Túnel estrecho y rápido. Meta: 3,000 m.']],
    iniciar(api,nivel){
      const W=560,H=300,CW=20,N=Math.ceil(W/CW)+3,META={1:1200,2:2000,3:3000}[nivel],GAP0={1:200,2:170,3:150}[nivel],GAP1={1:150,2:122,3:100}[nivel];
      const esc=GS.escena(api,{w:W,h:H,max:620,fondo:'#2a3140',aria:'Helicóptero de obstáculos'}),ent=GS.entrada(esc),E=esc.el;
      E('defs').innerHTML=`<linearGradient id="hcFondo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d2540"/><stop offset="1" stop-color="#3a3350"/></linearGradient>
        <linearGradient id="hcRoca" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a6a52"/><stop offset="1" stop-color="#5e4331"/></linearGradient>
        <linearGradient id="hcCuerpo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff7a5c"/><stop offset=".6" stop-color="#e8472f"/><stop offset="1" stop-color="#b32f1e"/></linearGradient>
        <linearGradient id="hcCrist" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e6f7ff"/><stop offset="1" stop-color="#7cbfe3"/></linearGradient>`;
      E('rect',{width:W,height:H,fill:'url(#hcFondo)'});
      for(let i=0;i<26;i++)E('circle',{cx:GS.rand(0,W),cy:GS.rand(0,H*.6),r:GS.rand(.5,1.6),fill:'#fff','fill-opacity':GS.rand(.2,.6)});
      E('circle',{cx:455,cy:62,r:20,fill:'#f1e7c8','fill-opacity':.9});E('circle',{cx:448,cy:57,r:20,fill:'#2a3050'});
      const lejos=E('g');lejos.innerHTML=`<path d="M0 ${H} L0 190 L60 150 L110 185 L170 140 L240 190 L300 160 L360 195 L430 145 L500 185 L560 160 L560 ${H}z" fill="#2b3350" fill-opacity=".8"/><path transform="translate(560 0)" d="M0 ${H} L0 190 L60 150 L110 185 L170 140 L240 190 L300 160 L360 195 L430 145 L500 185 L560 160 L560 ${H}z" fill="#2b3350" fill-opacity=".8"/>`;
      const techo=E('polygon',{fill:'url(#hcRoca)',stroke:'#3d2b20','stroke-width':3,'stroke-linejoin':'round'}),suelo=E('polygon',{fill:'url(#hcRoca)',stroke:'#3d2b20','stroke-width':3,'stroke-linejoin':'round'}),capaO=E('g'),gH=E('g');
      gH.innerHTML=`<g class="cuerpo"><ellipse cx="2" cy="26" rx="26" ry="3" fill="#000" fill-opacity=".0"/>
        <path d="M-24 4L-52 -4Q-56 -5 -56 -9L-56 -14L-50 -14L-24 -6z" fill="#b32f1e" stroke="#7c1f14" stroke-width="2" stroke-linejoin="round"/><path d="M-56 -14L-56 -22L-49 -14z" fill="#e8472f" stroke="#7c1f14" stroke-width="1.500" stroke-linejoin="round"/>
        <path d="M-14 16H18M-8 11V16M10 11V16" stroke="#444" stroke-width="3" stroke-linecap="round"/><path d="M-24 23Q-18 20 -4 21H24Q30 21 31 24" stroke="#dcdcdc" stroke-width="3.800" fill="none" stroke-linecap="round"/><path d="M-10 14L-12 22M12 14L14 22" stroke="#9a9a9a" stroke-width="2.500" stroke-linecap="round"/>
        <ellipse cx="0" cy="2" rx="27" ry="15.500" fill="url(#hcCuerpo)" stroke="#8c2417" stroke-width="2.500"/>
        <path d="M-20 8Q0 14 24 6" stroke="#fff" stroke-opacity=".75" stroke-width="2.600" fill="none" stroke-linecap="round"/>
        <path d="M5 -11Q22 -13 25 3L5 5z" fill="url(#hcCrist)" stroke="#5f9fc2" stroke-width="2" stroke-linejoin="round"/><path d="M9 -7Q16 -8 18 -2" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none" stroke-opacity=".8"/>
        <rect x="-12" y="-6" width="14" height="10" rx="3" fill="#9a2a1b" fill-opacity=".45"/>
        <rect x="-3" y="-19" width="6" height="8" rx="2" fill="#555"/><ellipse cx="0" cy="-20" rx="6" ry="2" fill="#333"/>
        <g class="aspa"><rect x="-38" y="-24" width="76" height="3.800" rx="1.900" fill="#2d2d2d"/><rect x="-38" y="-24" width="14" height="3.800" rx="1.900" fill="#e8472f"/><rect x="24" y="-24" width="14" height="3.800" rx="1.900" fill="#e8472f"/></g>
        <g class="cola"><rect x="-4" y="-9" width="8" height="2.800" rx="1.400" fill="#2d2d2d" transform="translate(-54 -13)"/><rect x="-1.400" y="-12" width="2.800" height="8" rx="1.400" fill="#2d2d2d" transform="translate(-54 -13)"/></g></g>`;
      const aspa=gH.querySelector('.aspa'),cola=gH.querySelector('.cola');
      let vidas=3,puntos=0,metros=0,fin=false,jugando=false,inv=0,t=0,off=0,centro=H/2,deriva=0,y=H/2,vy=0,obst=[],spawn=2,cols=[];
      const hx=130;
      const gapEn=()=>GAP0-(GAP0-GAP1)*Math.min(1,metros/META);
      function nuevaCol(){const gap=gapEn();deriva+=GS.rand(-6,6);deriva=Math.max(-9,Math.min(9,deriva));centro+=deriva*.6+GS.rand(-5,5);const mn=gap/2+14,mx=H-gap/2-14;if(centro<mn){centro=mn;deriva=Math.abs(deriva)}if(centro>mx){centro=mx;deriva=-Math.abs(deriva)}return{top:centro-gap/2,bot:centro+gap/2}}
      for(let i=0;i<N;i++)cols.push({top:H/2-GAP0/2,bot:H/2+GAP0/2});
      const hud=()=>api.estado(`${GS.corazones(vidas,3)}<span style="margin:0 12px">${Math.floor(metros)} / ${META} m</span><span>Puntos ${puntos}</span>`);
      function pinta(){
        let a=`0,0 `,b=`0,${H} `;cols.forEach((c,i)=>{const x=i*CW-off;a+=`${x},${c.top} ${x+CW},${c.top} `;b+=`${x},${c.bot} ${x+CW},${c.bot} `});
        techo.setAttribute('points',a+`${N*CW},0`);suelo.setAttribute('points',b+`${N*CW},${H}`);
      }
      function termina(gano){
        if(fin)return;fin=true;lp.parar();
        if(gano){puntos+=300*nivel+vidas*100;api.fin({tipo:'gana',titulo:'¡Túnel superado!',sub:`volaste ${META} metros`,puntos,det:`${vidas} vidas restantes`})}
        else api.fin({tipo:'pierde',titulo:'Helicóptero estrellado',sub:'Sin vidas',puntos,det:`${Math.floor(metros)} m`});
      }
      function choque(){if(inv>0||fin)return;vidas--;GS.sonar.pierde();inv=1.6;hud();if(vidas<=0)return termina(false);const i=Math.floor((hx+off)/CW),c=cols[i]||cols[0];y=(c.top+c.bot)/2;vy=0;obst=obst.filter(o=>{if(Math.abs(o.x-hx)<110){o.e.remove();return false}return true})}
      const lp=GS.bucle(dt=>{
        if(!jugando||fin)return;t+=dt;inv-=dt;
        const v=Math.min(330,190+metros*.03+nivel*14);metros+=v*dt/8;puntos=Math.floor(metros);api.puntos(puntos);
        const sube=ent.teclas.has('ArrowUp')||ent.teclas.has('Space')||ent.p.abajo;
        vy+=(sube?-1180:820)*dt;vy=Math.max(-310,Math.min(330,vy));y+=vy*dt;
        off+=v*dt;while(off>=CW){off-=CW;cols.shift();cols.push(nuevaCol())}
        lejos.setAttribute('transform',`translate(${-(off+metros*3)%560} 0)`);pinta();
        spawn-=dt;if(spawn<=0&&nivel>1){spawn=GS.rand(1.5,2.8)*({2:1.1,3:.8}[nivel]);const i=cols.length-2,c=cols[i],gap=c.bot-c.top,h=GS.rand(34,Math.min(70,gap*.42)),pos=GS.pick(['top','bot','mid']);
          const oy=pos==='top'?c.top:pos==='bot'?c.bot-h:(c.top+c.bot)/2-h/2,e=E('g',{},capaO);e.innerHTML=`<rect width="24" height="${h}" rx="5" fill="#a9b6c3" stroke="#56616d" stroke-width="3"/><rect x="3" y="3" width="5" height="${h-6}" rx="2.500" fill="#fff" fill-opacity=".35"/>${Array.from({length:Math.max(1,Math.floor(h/22))},(_,k)=>`<path d="M2 ${8+k*22}l20 10v-10l-20 10z" fill="#f2c230" fill-opacity=".9"/>`).join('')}`;obst.push({x:W+30,y:oy,w:24,h,e})}
        obst=obst.filter(o=>{o.x-=v*dt;o.e.setAttribute('transform',`translate(${o.x} ${o.y})`);if(o.x<-40){o.e.remove();return false}return true});
        const ang=Math.max(-14,Math.min(16,vy*.05));gH.setAttribute('transform',`translate(${hx} ${y}) rotate(${ang})`);gH.setAttribute('opacity',inv>0&&Math.floor(inv*10)%2?.35:1);
        aspa.setAttribute('transform',`scale(${Math.cos(t*38)} 1)`);cola.setAttribute('transform',`rotate(${t*900} -54 -13)`);
        {const i0=Math.floor((hx-34+off)/CW),i1=Math.floor((hx+28+off)/CW);let tp=0,bt=H;for(let i=i0;i<=i1;i++){const c=cols[i];if(c){tp=Math.max(tp,c.top);bt=Math.min(bt,c.bot)}}
          if(inv>0){if(y-13<tp){y=tp+13;vy=Math.max(vy,0)}if(y+21>bt){y=bt-21;vy=Math.min(vy,0)}}
          y=Math.max(14,Math.min(H-22,y))}
        const caja={x:hx-34,y:y-13,w:62,h:34};
        if(inv<=0){
          const i0=Math.floor((caja.x+off)/CW),i1=Math.floor((caja.x+caja.w+off)/CW);
          for(let i=i0;i<=i1;i++){const c=cols[i];if(c&&(caja.y<c.top||caja.y+caja.h>c.bot)){choque();break}}
          if(inv<=0)for(const o of obst){if(GS.choca(caja,o)){choque();break}}
        }
        if(Math.floor(metros)%25===0)hud();
        if(metros>=META)termina(true);
      });
      GS.iniciaConToque(esc,ent,'Mantén presionado para despegar',()=>{jugando=true});
      GS.pad(api,ent,[{k:'Space',ico:'arriba',etq:'Subir',txt:' Mantén para subir'}]);
      api.botones([{txt:'Pausa',ico:'pausa',fn:()=>api.msg(lp.pausa()?'Pausa':'')}]);hud();pinta();
      return{destruir(){lp.parar();ent.destruir()},dbg:{acercarMeta(){metros=META-30},golpear:choque,get vidas(){return vidas},get metros(){return metros},get y(){return y},get obst(){return obst.length}}};
    }
  });
}

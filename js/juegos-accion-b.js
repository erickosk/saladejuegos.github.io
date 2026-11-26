/* =====================================================================
   juegos-accion-b.js · Esquiva meteoritos, Plataformas 2D, Lluvia de objetos,
   Rebota la pelota y Corta frutas.
   Uso:  initMeteorDodge(document.getElementById('game-container'))
   ===================================================================== */

/* 6) ESQUIVA METEORITOS */
function initMeteorDodge(cont){
  const TIEMPO={1:40,2:60,3:90};
  return GS.crear(cont,{
    id:'esquivameteoritos',
    intro:'Mueve tu nave (flechas, A/W/S/D o arrastrando el dedo) para esquivar los meteoritos que caen. Recoge estrellas para ganar puntos y escudos azules para aguantar un golpe. Sobrevive el tiempo indicado.',
    niveles:[['1','Fácil','Sobrevive 40 segundos. Meteoritos lentos.'],['2','Medio','Sobrevive 60 segundos. Más meteoritos.'],['3','Difícil','Sobrevive 90 segundos. Lluvia intensa.']],
    iniciar(api,nivel){
      const W=400,H=560,T=TIEMPO[nivel];
      const esc=GS.escena(api,{w:W,h:H,max:430,fondo:'#0c1230',aria:'Esquiva meteoritos'}),ent=GS.entrada(esc),E=esc.el;
      const estrellas=[];for(let i=0;i<55;i++){const c=E('circle',{cx:GS.rand(0,W),cy:GS.rand(0,H),r:GS.rand(.4,1.5),fill:'#fff','fill-opacity':GS.rand(.3,.9)});estrellas.push({c,v:GS.rand(20,70)})}
      const capaM=E('g'),capaI=E('g');
      const nave={x:W/2,y:470},gN=E('g');gN.innerHTML='<path d="M0-24L12 4 20 18 8 14 0 22-8 14-20 18-12 4z" fill="#ffd9a0" stroke="#fff3da" stroke-width="2.500" stroke-linejoin="round"/><path d="M0-12L5 6H-5z" fill="#3b2a22" fill-opacity=".6"/><circle cx="0" cy="-3" r="3.500" fill="#2f7fd1"/><path class="llama" d="M-5 20L0 34 5 20z" fill="#ff9f43"/>';
      const escudoEl=E('circle',{r:30,fill:'#6fc7ff','fill-opacity':.18,stroke:'#6fc7ff','stroke-width':3,display:'none'},gN);
      const llama=gN.querySelector('.llama');
      let vidas=3,puntos=0,tiempo=0,estrellasN=0,escudo=false,fin=false,jugando=false,inv=0,spawn=.6,meteoros=[],objetos=[],tObj=4,tEsc=14;
      const hud=()=>api.estado(`${GS.corazones(vidas,3)}<span style="margin:0 12px">${Math.max(0,Math.ceil(T-tiempo))} s</span><span>Estrellas ${estrellasN}${escudo?' · Escudo':''}</span>`);
      function termina(gano){
        if(fin)return;fin=true;lp.parar();puntos=Math.floor(tiempo*10)+estrellasN*50;
        if(gano){puntos+=250*nivel+vidas*100;api.fin({tipo:'gana',titulo:'¡Sobreviviste!',sub:`aguantaste ${T} segundos`,puntos,det:`${estrellasN} estrellas · ${vidas} vidas`})}
        else api.fin({tipo:'pierde',titulo:'Nave destruida',sub:'Los meteoritos te alcanzaron',puntos,det:`${Math.floor(tiempo)} s · ${estrellasN} estrellas`});
      }
      function golpe(m){
        if(inv>0||fin)return;
        if(escudo){escudo=false;escudoEl.setAttribute('display','none');GS.tono(300,.15,'sine',.08);if(m)m.quitar=true;hud();inv=.6;return}
        vidas--;GS.sonar.pierde();inv=1.6;hud();if(m)m.quitar=true;if(vidas<=0)termina(false);
      }
      function crearMeteoro(){
        const r=GS.rand(12,30),n=9,pts=[];for(let i=0;i<n;i++){const a=i/n*6.283,k=GS.rand(.78,1.08);pts.push(`${(Math.cos(a)*r*k).toFixed(1)},${(Math.sin(a)*r*k).toFixed(1)}`)}
        const g=E('g',{},capaM);g.innerHTML=`<path d="M0 ${-r*.9}L${-r*.5} ${-r*3.4}L${r*.5} ${-r*3.4}z" fill="#ff9f43" fill-opacity=".45"/><polygon points="${pts.join(' ')}" fill="#9b8470" stroke="#e8d4b9" stroke-width="2.500" stroke-linejoin="round"/><circle cx="${-r*.25}" cy="${-r*.1}" r="${r*.2}" fill="#7a6554"/><circle cx="${r*.3}" cy="${r*.25}" r="${r*.13}" fill="#7a6554"/>`;
        const vy=GS.rand(130,230)*(1+nivel*.14+tiempo/130);meteoros.push({x:GS.rand(r,W-r),y:-r*3,r,vx:GS.rand(-55,55),vy,a:GS.rand(0,6.28),va:GS.rand(-2,2),g});
      }
      function crearObjeto(tipo){
        const g=E('g',{},capaI);g.innerHTML=tipo==='estrella'?'<polygon points="0,-13 4,-4 14,-4 6,2 9,12 0,6 -9,12 -6,2 -14,-4 -4,-4" fill="#ffd54a" stroke="#e0a800" stroke-width="2.500" stroke-linejoin="round"/>':'<circle r="13" fill="#6fc7ff" fill-opacity=".35" stroke="#6fc7ff" stroke-width="3.500"/><path d="M0-7L7-3V3Q7 8 0 11-7 8-7 3V-3z" fill="#2f7fd1"/>';
        objetos.push({tipo,x:GS.rand(30,W-30),y:-20,vy:120,g});
      }
      const lp=GS.bucle(dt=>{
        if(!jugando||fin)return;tiempo+=dt;inv-=dt;
        puntos=Math.floor(tiempo*10)+estrellasN*50;api.puntos(puntos);
        let dx=0,dy=0;if(ent.teclas.has('ArrowLeft'))dx--;if(ent.teclas.has('ArrowRight'))dx++;if(ent.teclas.has('ArrowUp'))dy--;if(ent.teclas.has('ArrowDown'))dy++;
        if(ent.p.abajo){const ddx=ent.p.x-nave.x,ddy=ent.p.y-60-nave.y,d=Math.hypot(ddx,ddy)||1,m=Math.min(d,520*dt);nave.x+=ddx/d*m;nave.y+=ddy/d*m}
        else{nave.x+=dx*320*dt;nave.y+=dy*320*dt}
        nave.x=Math.max(22,Math.min(W-22,nave.x));nave.y=Math.max(200,Math.min(H-40,nave.y));
        gN.setAttribute('transform',`translate(${nave.x} ${nave.y}) rotate(${dx*8})`);gN.setAttribute('opacity',inv>0&&Math.floor(inv*10)%2?.35:1);llama.setAttribute('opacity',Math.floor(tiempo*30)%2?1:.6);
        estrellas.forEach(s=>{const y=(+s.c.getAttribute('cy')+s.v*dt)%H;s.c.setAttribute('cy',y)});
        spawn-=dt;if(spawn<=0){crearMeteoro();spawn=Math.max(.2,({1:.78,2:.55,3:.4}[nivel])/(1+tiempo*.014))*GS.rand(.7,1.3)}
        tObj-=dt;if(tObj<=0){crearObjeto('estrella');tObj=GS.rand(3,5.5)}
        tEsc-=dt;if(tEsc<=0){if(!escudo)crearObjeto('escudo');tEsc=GS.rand(14,22)}
        meteoros=meteoros.filter(m=>{m.x+=m.vx*dt;m.y+=m.vy*dt;m.a+=m.va*dt;m.g.setAttribute('transform',`translate(${m.x} ${m.y}) rotate(${m.a*57.3})`);
          if(m.quitar||m.y>H+m.r*3||m.x<-60||m.x>W+60){m.g.remove();return false}
          if(inv<=0&&GS.dist(m,nave)<m.r*.82+10){GS.destello(esc,m.x,m.y,'#ff9f43',m.r*1.4);golpe(m)}
          if(m.quitar){m.g.remove();return false}return true});
        objetos=objetos.filter(o=>{o.y+=o.vy*dt;o.g.setAttribute('transform',`translate(${o.x} ${o.y}) rotate(${Math.sin(tiempo*4)*12})`);
          if(o.y>H+20){o.g.remove();return false}
          if(GS.dist(o,nave)<26){o.g.remove();if(o.tipo==='estrella'){estrellasN++;GS.tono(900,.08,'triangle',.07,1400)}else{escudo=true;escudoEl.setAttribute('display','inline');GS.tono(500,.12,'sine',.08,900)}hud();return false}return true});
        if(Math.floor(tiempo*4)%4===0)hud();
        if(tiempo>=T)termina(true);
      });
      GS.iniciaConToque(esc,ent,'Toca o pulsa una tecla para despegar',()=>{jugando=true});
      GS.pad(api,ent,[{k:'ArrowLeft',ico:'izq',etq:'Izquierda'},{k:'ArrowUp',ico:'arriba',etq:'Arriba'},{k:'ArrowDown',ico:'abajo',etq:'Abajo'},{k:'ArrowRight',ico:'der',etq:'Derecha'}]);
      api.botones([{txt:'Pausa',ico:'pausa',fn:()=>api.msg(lp.pausa()?'Pausa':'')}]);hud();
      return{destruir(){lp.parar();ent.destruir()},dbg:{acercarMeta(){tiempo=T-1},golpear(){golpe(null)},get vidas(){return vidas},get tiempo(){return tiempo},get meteoros(){return meteoros.length},get puntos(){return puntos}}};
    }
  });
}

/* 7) PLATAFORMAS 2D */
function initPlatformer(cont){
  return GS.crear(cont,{
    id:'plataformas',
    intro:'Corre con ← → (o A/D) y salta con Espacio o ↑. Salta sobre los enemigos para derrotarlos (si los tocas de lado te hacen daño), recoge monedas y cuidado con los huecos. Llega a la bandera al final del nivel. En el teléfono usa los botones.',
    niveles:[['1','Fácil','Nivel corto, huecos pequeños y pocos enemigos.'],['2','Medio','Nivel más largo con más enemigos.'],['3','Difícil','Nivel largo, huecos grandes y muchos enemigos.']],
    iniciar(api,nivel){
      const W=560,H=320,SUELO=262,LARGO={1:2600,2:3900,3:5400}[nivel],ENEM={1:.35,2:.55,3:.8}[nivel],HUECO={1:[50,85],2:[70,110],3:[80,115]}[nivel];
      const esc=GS.escena(api,{w:W,h:H,max:640,fondo:'#8fd3f5',aria:'Plataformas 2D'}),ent=GS.entrada(esc),E=esc.el;
      E('defs').innerHTML=`<linearGradient id="plCielo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#58b6ee"/><stop offset=".75" stop-color="#bfe8fa"/><stop offset="1" stop-color="#fff0cf"/></linearGradient><radialGradient id="plSol"><stop offset="0" stop-color="#fffbe0"/><stop offset=".5" stop-color="#ffe27a"/><stop offset="1" stop-color="#ffe27a" stop-opacity="0"/></radialGradient><linearGradient id="plTierra" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a98152"/><stop offset="1" stop-color="#6e5029"/></linearGradient>`;
      E('rect',{width:W,height:H,fill:'url(#plCielo)'});E('circle',{cx:470,cy:56,r:56,fill:'url(#plSol)'});E('circle',{cx:470,cy:56,r:22,fill:'#ffe27a'});
      const fondoMon=E('g'),fondoNub=E('g'),fondoCol=E('g'),mundo=E('g');
      for(let i=0;i<8;i++){const g=E('g',{},fondoMon);g.dataset.x=i*300;g.innerHTML=`<path d="M0 ${SUELO} L80 ${SUELO-130} L120 ${SUELO-95} L170 ${SUELO-150} L280 ${SUELO}z" fill="#a4bdd8"/><path d="M80 ${SUELO-130} L60 ${SUELO-98} L80 ${SUELO-106} L96 ${SUELO-95}z M170 ${SUELO-150} L148 ${SUELO-112} L170 ${SUELO-120} L188 ${SUELO-108}z" fill="#fff" fill-opacity=".85"/>`}
      for(let i=0;i<10;i++){const g=E('g',{},fondoNub);g.dataset.x=i*260+GS.rand(0,100);g.dataset.y=GS.rand(24,100);g.innerHTML='<ellipse cx="0" cy="4" rx="38" ry="11" fill="#fff" fill-opacity=".95"/><ellipse cx="-12" cy="-5" rx="18" ry="12" fill="#fff"/><ellipse cx="14" cy="-8" rx="22" ry="14" fill="#fff"/>'}
      for(let i=0;i<12;i++){const g=E('g',{},fondoCol);g.dataset.x=i*230;g.innerHTML=`<path d="M0 ${SUELO} Q85 ${SUELO-90} 170 ${SUELO}z" fill="${i%2?'#86c866':'#74b856'}"/><g transform="translate(${50+(i%3)*30} ${SUELO-30})"><rect x="-2" width="4" height="14" fill="#6b4a2a"/><circle cy="-4" r="12" fill="#3f9a4d"/><circle cx="-6" cy="3" r="8" fill="#4aa857"/></g><circle cx="${130-(i%2)*20}" cy="${SUELO-8}" r="3.500" fill="${i%2?'#ff6b8a':'#fff'}"/>`}
      const plat=[],monedas=[],enemigos=[];let x=0;
      const nuevaPlat=(x,w,y,suelo)=>{const g=E('g',{},mundo);
        if(suelo){g.innerHTML=`<rect x="${x}" y="${y}" width="${w}" height="${H-y+20}" fill="url(#plTierra)"/><rect x="${x}" y="${y}" width="${w}" height="13" rx="5" fill="#62c24c"/><rect x="${x}" y="${y+9}" width="${w}" height="5" fill="#4a9a36"/>${Array.from({length:Math.floor(w/22)},(_,k)=>`<path d="M${x+k*22+5} ${y+1}l-3 -7M${x+k*22+9} ${y+1}l1 -9M${x+k*22+13} ${y+1}l4 -6" stroke="#4cae3a" stroke-width="2.200" stroke-linecap="round"/>`).join('')}${Array.from({length:Math.floor(w/52)},(_,k)=>`<ellipse cx="${x+k*52+20}" cy="${y+30+(k%3)*12}" rx="${7+(k%2)*3}" ry="4" fill="#85653a"/>`).join('')}`}
        else g.innerHTML=`<rect x="${x}" y="${y}" width="${w}" height="18" rx="6" fill="#c4975a" stroke="#8a6334" stroke-width="2.500"/><rect x="${x}" y="${y}" width="${w}" height="7" rx="3.500" fill="#62c24c"/>${Array.from({length:Math.floor(w/26)},(_,k)=>`<path d="M${x+k*26+26} ${y+8}V${y+17}" stroke="#8a6334" stroke-width="2"/>`).join('')}<path d="M${x+6} ${y+13}h${w-12}" stroke="#e0b97c" stroke-width="2" stroke-linecap="round" stroke-opacity=".7"/>`;
        plat.push({x,y,w,suelo});return plat[plat.length-1]};
      nuevaPlat(0,420,SUELO,true);x=420;
      while(x<LARGO-420){
        const hueco=GS.rand(HUECO[0],HUECO[1]),w=GS.rand(190,380);x+=hueco;nuevaPlat(x,w,SUELO,true);
        if(Math.random()<.65){const pw=GS.rand(80,130),py=SUELO-GS.rand(70,95),px=x-hueco/2+GS.rand(-20,Math.min(w,150));const f=nuevaPlat(Math.max(0,px),pw,py,false);
          for(let k=0;k<3;k++)monedas.push({x:f.x+20+k*((pw-40)/2),y:py-24,tomada:false})}
        if(w>=240&&Math.random()<ENEM){const ex=x+GS.rand(110,w-70);enemigos.push({x:ex,y:SUELO,a:x+60,b:x+w-30,dir:Math.random()<.5?-1:1,vivo:true,t:0})}
        for(let k=0;k<Math.floor(w/70);k++)if(Math.random()<.5)monedas.push({x:x+30+k*60,y:SUELO-GS.rand(24,40),tomada:false});
        x+=w;
      }
      const fin_=nuevaPlat(x+60,700,SUELO,true);const meta={x:fin_.x+260};
      const gMeta=E('g',{},mundo);gMeta.innerHTML=`<g transform="translate(${meta.x+70} ${SUELO})"><rect x="-34" y="-62" width="68" height="62" fill="#b9a58a" stroke="#8a7458" stroke-width="2.500"/><path d="M-34 -62h12v-10h10v10h12v-10h10v10h12v-10h10v10h-66z" fill="#b9a58a" stroke="#8a7458" stroke-width="2.500" stroke-linejoin="round"/><path d="M-10 0V-22Q0 -34 10 -22V0z" fill="#5a4636"/><rect x="-24" y="-48" width="9" height="12" rx="4" fill="#5a4636"/><rect x="15" y="-48" width="9" height="12" rx="4" fill="#5a4636"/></g><rect x="${meta.x-3}" y="${SUELO-120}" width="6" height="120" rx="3" fill="#7d8a96"/><rect x="${meta.x-1}" y="${SUELO-120}" width="2" height="120" fill="#fff" fill-opacity=".5"/><path class="bandera" d="M${meta.x+3} ${SUELO-116}h48l-13 18 13 18h-48z" fill="#e8472f" stroke="#a52a1e" stroke-width="2" stroke-linejoin="round"/><circle cx="${meta.x}" cy="${SUELO-123}" r="7" fill="#ffd54a" stroke="#e0a800" stroke-width="2"/>`;
      const bandera=gMeta.querySelector('.bandera');
      monedas.forEach(m=>{m.e=E('g',{},mundo);m.e.innerHTML='<circle r="9" fill="#ffd54a" stroke="#e0a800" stroke-width="2.500"/><circle r="5.500" fill="none" stroke="#e8b400" stroke-width="1.400"/><path d="M-3-4Q-4 0-3 4" stroke="#fff" stroke-width="1.800" stroke-linecap="round" fill="none" stroke-opacity=".8"/>'});
      enemigos.forEach(e=>{e.e=E('g',{},mundo);e.e.innerHTML='<ellipse cx="-7" cy="-1" rx="7" ry="4" fill="#5a3b2a"/><ellipse cx="8" cy="-1" rx="7" ry="4" fill="#5a3b2a"/><path d="M-16 -7Q-16 -29 0 -29T16 -7z" fill="#a8452f" stroke="#6e2a1a" stroke-width="2.500" stroke-linejoin="round"/><circle cx="-6" cy="-21" r="3" fill="#fff" fill-opacity=".85"/><circle cx="7" cy="-23" r="2.200" fill="#fff" fill-opacity=".85"/><rect x="-10" y="-14" width="20" height="10" rx="5" fill="#f3d9b3" stroke="#6e2a1a" stroke-width="2"/><path d="M-9 -15L-2 -12M9 -15L2 -12" stroke="#2a1a14" stroke-width="2" stroke-linecap="round"/><circle cx="-4.500" cy="-9" r="2.200" fill="#222"/><circle cx="4.500" cy="-9" r="2.200" fill="#222"/>'});
      const P={x:60,y:SUELO,vx:0,vy:0,suelo:true,dir:1,coyote:0,w:22,h:34,seguro:{x:60,y:SUELO}},gP=E('g',{},mundo);
      gP.innerHTML='<ellipse cx="0" cy="0" rx="14" ry="3" fill="#000" fill-opacity=".2"/><g class="p2"><rect x="-1" y="-14" width="8" height="14" rx="3.500" fill="#1f3f8a"/><path d="M-1 0Q-1 -4 4 -4H11Q14 -4 14 0z" fill="#6b3a22"/></g><g class="c"><path d="M-8 -40Q-16 -34 -13 -26" stroke="#c43a25" stroke-width="5.500" fill="none" stroke-linecap="round"/><rect x="-10" y="-36" width="21" height="25" rx="8" fill="#2f7fd1"/><rect x="-10" y="-24" width="21" height="13" rx="5" fill="#1f3f8a"/><circle cx="-4" cy="-26" r="2.200" fill="#ffd54a"/><circle cx="6" cy="-26" r="2.200" fill="#ffd54a"/><circle cx="1" cy="-45" r="10.500" fill="#f5c9a0"/><path d="M-9 -47Q-8 -58 2 -58Q12 -58 12 -48Q4 -51 -9 -47z" fill="#e8472f"/><path d="M5 -50H17Q19 -50 18 -47H6z" fill="#c43a25"/><circle cx="6" cy="-44" r="1.900" fill="#222"/><path d="M4 -39Q7 -37 10 -39" stroke="#8a4a3a" stroke-width="1.500" fill="none" stroke-linecap="round"/><path d="M-1 -35Q8 -32 12 -28" stroke="#f5c9a0" stroke-width="5.500" fill="none" stroke-linecap="round"/><circle cx="12.500" cy="-27.500" r="3.200" fill="#fff"/></g><g class="p1"><rect x="-8" y="-14" width="8" height="14" rx="3.500" fill="#2f5fbd"/><path d="M-9 0Q-9 -4 -4 -4H3Q6 -4 6 0z" fill="#6b3a22"/></g>';
      const p1=gP.querySelector('.p1'),p2=gP.querySelector('.p2');
      let vidas=3,puntos=0,monN=0,derrotas=0,fin=false,jugando=false,inv=0,t=0,cam=0,saltoSolt=true;const registro=[];
      const hud=()=>api.estado(`${GS.corazones(vidas,3)}<span style="margin:0 12px">${Math.min(100,Math.floor(P.x/meta.x*100))}% del nivel</span><span>Monedas ${monN}</span>`);
      function termina(gano){
        if(fin)return;fin=true;lp.parar();puntos=monN*10+derrotas*100+Math.floor(P.x/10);
        if(gano){puntos+=300*nivel+vidas*150;api.fin({tipo:'gana',titulo:'¡Nivel completado!',sub:'llegaste a la bandera',puntos,det:`${monN} monedas · ${derrotas} enemigos`})}
        else api.fin({tipo:'pierde',titulo:'Fin del juego',sub:'Te quedaste sin vidas',puntos,det:`${Math.floor(P.x/meta.x*100)}% del nivel · ${monN} monedas`});
      }
      function dano(){
        if(inv>0||fin)return;registro.push(['enemigo',Math.round(P.x),Math.round(P.y)]);vidas--;GS.sonar.pierde();inv=1.6;hud();if(vidas<=0)return termina(false);P.vy=-300;P.vx=-P.dir*160;P.suelo=false;
      }
      function caeAlVacio(){if(fin)return;registro.push(['vacio',Math.round(P.x),Math.round(P.y)]);vidas--;GS.sonar.pierde();hud();if(vidas<=0)return termina(false);Object.assign(P,{x:P.seguro.x,y:P.seguro.y-4,vx:0,vy:0});inv=1.8}
      const lp=GS.bucle(dt=>{
        if(!jugando||fin)return;t+=dt;inv-=dt;
        let dir=0;if(ent.teclas.has('ArrowLeft'))dir--;if(ent.teclas.has('ArrowRight'))dir++;
        const v=210;P.vx+=(dir*v-P.vx)*Math.min(1,14*dt);if(dir)P.dir=dir;
        const quiereSaltar=ent.teclas.has('ArrowUp')||ent.teclas.has('Space');
        P.coyote=P.suelo?.09:P.coyote-dt;
        if(quiereSaltar&&saltoSolt&&P.coyote>0){P.vy=-570;P.suelo=false;P.coyote=0;saltoSolt=false;GS.tono(520,.08,'triangle',.06,820)}
        if(!quiereSaltar){saltoSolt=true;if(P.vy<-200)P.vy*=.82}
        P.vy+=1500*dt;const yAntes=P.y;P.x=Math.max(12,P.x+P.vx*dt);P.y+=P.vy*dt;P.suelo=false;
        for(const p of plat){if(P.vy>=0&&P.x+P.w/2>p.x&&P.x-P.w/2<p.x+p.w&&yAntes<=p.y+1&&P.y>=p.y){P.y=p.y;P.vy=0;P.suelo=true;P.seguro={x:Math.max(p.x+24,Math.min(p.x+p.w-24,P.x)),y:p.y}}}
        if(P.y>H+80)caeAlVacio();
        monedas.forEach(m=>{if(m.tomada)return;m.e.setAttribute('transform',`translate(${m.x} ${m.y+Math.sin(t*5+m.x)*2}) scale(${Math.abs(Math.cos(t*4+m.x*.1))*.7+.3} 1)`);
          if(Math.abs(m.x-P.x)<18&&Math.abs(m.y-(P.y-18))<24){m.tomada=true;m.e.remove();monN++;GS.tono(1000,.06,'triangle',.06,1500);hud()}});
        enemigos.forEach(e=>{if(!e.vivo)return;e.t+=dt;e.x+=e.dir*(36+nivel*8)*dt;if(e.x<e.a){e.x=e.a;e.dir=1}if(e.x>e.b){e.x=e.b;e.dir=-1}
          e.e.setAttribute('transform',`translate(${e.x} ${e.y}) scale(${1+Math.sin(e.t*8)*.05} ${1-Math.sin(e.t*8)*.07})`);
          if(Math.abs(e.x-P.x)<22&&P.y>e.y-30&&P.y-34<e.y){
            if(P.vy>80&&yAntes<=e.y-20){e.vivo=false;e.e.remove();derrotas++;P.vy=-380;GS.sonar.captura();puntos=monN*10+derrotas*100;api.puntos(puntos)}
            else dano()}});
        gP.setAttribute('transform',`translate(${P.x} ${P.y}) scale(${P.dir} 1)`);gP.setAttribute('opacity',inv>0&&Math.floor(inv*10)%2?.35:1);
        const c=Math.sin(t*18)*(P.suelo&&Math.abs(P.vx)>20?30:8);p1.setAttribute('transform',`rotate(${P.suelo?c:-30} -4 -13)`);p2.setAttribute('transform',`rotate(${P.suelo?-c:25} 4 -13)`);if(bandera)bandera.setAttribute('transform',`translate(${meta.x+3} 0) scale(${1+Math.sin(t*6)*.06} 1) translate(${-(meta.x+3)} 0)`);
        cam=Math.max(0,Math.min(meta.x+200-W,P.x-210));mundo.setAttribute('transform',`translate(${-cam} 0)`);
        fondoMon.childNodes.forEach(n=>n.setAttribute('transform',`translate(${((+n.dataset.x-cam*.08)%2400+2400)%2400-300} 0)`));
        fondoNub.childNodes.forEach(n=>n.setAttribute('transform',`translate(${((+n.dataset.x-cam*.18)%(W+300)+W+300)%(W+300)-60} ${n.dataset.y})`));
        fondoCol.childNodes.forEach(n=>n.setAttribute('transform',`translate(${((+n.dataset.x-cam*.4)%(W+300)+W+300)%(W+300)-120} 0)`));
        puntos=monN*10+derrotas*100+Math.floor(P.x/10);api.puntos(puntos);if(Math.floor(t*4)%4===0)hud();
        if(P.x>=meta.x)termina(true);
      });
      GS.iniciaConToque(esc,ent,'Toca o pulsa una tecla para empezar',()=>{jugando=true});
      GS.pad(api,ent,[{k:'ArrowLeft',ico:'izq',etq:'Izquierda'},{k:'ArrowRight',ico:'der',etq:'Derecha'},{k:'Space',ico:'arriba',etq:'Saltar',txt:' Saltar'}]);
      api.botones([{txt:'Pausa',ico:'pausa',fn:()=>api.msg(lp.pausa()?'Pausa':'')}]);hud();
      return{destruir(){lp.parar();ent.destruir()},dbg:{acercarMeta(){P.x=meta.x-60},caer(){P.y=H+100},golpear:dano,get vidas(){return vidas},get x(){return P.x},get monedas(){return monN},get enemigos(){return enemigos.filter(e=>e.vivo).length},get listaEnemigos(){return enemigos.filter(e=>e.vivo).map(e=>({x:e.x,y:e.y}))},get plataformas(){return plat.length},registro,get pos(){return {x:P.x,y:P.y,suelo:P.suelo}},plat,meta}};
    }
  });
}

/* 8) LLUVIA DE OBJETOS */
function initCatcher(cont){
  const ITEMS={
    manzana:'<circle r="13" fill="#e53935"/><path d="M0-12Q4-20 10-18" stroke="#4a8a2a" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="-4" cy="-4" r="3.500" fill="#fff" fill-opacity=".45"/>',
    moneda:'<circle r="13" fill="#ffd54a" stroke="#e0a800" stroke-width="3"/><path d="M0-6V6" stroke="#e0a800" stroke-width="3" stroke-linecap="round"/>',
    estrella:'<polygon points="0,-15 4.500,-5 15,-5 6.500,2 10,13 0,7 -10,13 -6.500,2 -15,-5 -4.500,-5" fill="#ffb300" stroke="#e08a00" stroke-width="2.500" stroke-linejoin="round"/>',
    gema:'<polygon points="0,-14 12,-4 7,12 -7,12 -12,-4" fill="#29b6f6" stroke="#0277bd" stroke-width="2.500" stroke-linejoin="round"/><path d="M-12-4H12M0-14L-4-4 0 12 4-4z" fill="none" stroke="#e1f5fe" stroke-width="1.600" stroke-linejoin="round"/>',
    corazon:'<path d="M0 12C-14 2-14-12-5-12-2-12 0-9 0-7 0-9 2-12 5-12 14-12 14 2 0 12z" fill="#ff5a7a" stroke="#c2185b" stroke-width="2.500" stroke-linejoin="round"/>',
    bomba:'<circle r="13" fill="#2b2b33"/><path d="M6-11L11-17" stroke="#8d6e63" stroke-width="3" stroke-linecap="round"/><circle cx="12" cy="-18" r="3.500" fill="#ff9f43"/><circle cx="-4" cy="-4" r="3.500" fill="#fff" fill-opacity=".3"/>',
    roca:'<polygon points="-14,8 -10,-8 0,-14 12,-8 15,6 6,13" fill="#8a8f96" stroke="#5f656c" stroke-width="2.500" stroke-linejoin="round"/>',
    pincho:'<g stroke="#7b3fa0" stroke-width="3.500" stroke-linecap="round">'+Array.from({length:8},(_,i)=>`<path d="M${(Math.cos(i*.785)*9).toFixed(1)} ${(Math.sin(i*.785)*9).toFixed(1)}L${(Math.cos(i*.785)*16).toFixed(1)} ${(Math.sin(i*.785)*16).toFixed(1)}"/>`).join('')+'</g><circle r="10" fill="#7b3fa0"/><circle cx="-3.500" cy="-2" r="2.200" fill="#fff"/><circle cx="3.500" cy="-2" r="2.200" fill="#fff"/>'
  };
  const BUENOS=[['manzana',10,5],['moneda',20,4],['gema',30,2],['estrella',50,1]],MALOS=['bomba','roca','pincho'];
  return GS.crear(cont,{
    id:'lluviaobjetos',
    intro:'Mueve la canasta (flechas, A/D o arrastrando el dedo) y atrapa los objetos buenos: manzanas, monedas, gemas y estrellas. Evita las bombas, las rocas y los pinchos: cada golpe te quita una vida. Los corazones te devuelven una.',
    niveles:[['1','Fácil','Meta de 200 puntos. Objetos lentos y pocos peligros.'],['2','Medio','Meta de 400 puntos.'],['3','Difícil','Meta de 700 puntos. Muchos peligros y muy rápido.']],
    iniciar(api,nivel){
      const W=400,H=560,META={1:200,2:400,3:700}[nivel],PMALO={1:.18,2:.28,3:.38}[nivel];
      const esc=GS.escena(api,{w:W,h:H,max:430,fondo:'#bfe6f7',aria:'Lluvia de objetos'}),ent=GS.entrada(esc),E=esc.el;
      for(let i=0;i<5;i++){const g=E('g',{transform:`translate(${GS.rand(20,360)} ${GS.rand(20,200)})`});g.innerHTML='<ellipse rx="40" ry="14" fill="#fff" fill-opacity=".85"/><ellipse cx="22" cy="-9" rx="26" ry="14" fill="#fff" fill-opacity=".85"/>'}
      E('rect',{x:0,y:520,width:W,height:40,fill:'#6fbf4d'});E('rect',{x:0,y:536,width:W,height:24,fill:'#8d6e3f'});
      const capaO=E('g'),canasta=E('g');
      canasta.innerHTML='<path d="M-38-14H38L30 24Q0 32-30 24z" fill="#c68642" stroke="#8a5a2b" stroke-width="3" stroke-linejoin="round"/><path d="M-34-4H34M-30 8H30M-22-14L-18 26M0-14V30M22-14L18 26" stroke="#8a5a2b" stroke-width="2" fill="none"/><rect x="-40" y="-20" width="80" height="9" rx="4.500" fill="#a86d35" stroke="#8a5a2b" stroke-width="2.500"/>';
      const cx={x:W/2,y:492};let vidas=3,puntos=0,combo=0,fin=false,jugando=false,inv=0,spawn=.5,cosas=[];
      const hud=()=>api.estado(`${GS.corazones(vidas,3)}<span style="margin:0 12px">${puntos} / ${META} puntos</span>${combo>=3?`<span style="color:#e8472f">Racha x${combo}</span>`:''}`);
      function crear(){
        let tipo;const r=Math.random();
        if(r<PMALO)tipo=GS.pick(MALOS);else if(r>.97&&vidas<3)tipo='corazon';else{const tot=BUENOS.reduce((s,b)=>s+b[2],0);let k=Math.random()*tot;tipo=BUENOS.find(b=>(k-=b[2])<0)[0]}
        const g=E('g',{},capaO);g.innerHTML=ITEMS[tipo];cosas.push({tipo,x:GS.rand(24,W-24),y:-24,vy:GS.rand(120,190)*(1+nivel*.14+puntos/(META*2.2)),g,va:GS.rand(-1.5,1.5),a:0});
      }
      function termina(gano){
        if(fin)return;fin=true;lp.parar();
        if(gano){puntos+=200*nivel+vidas*100;api.fin({tipo:'gana',titulo:'¡Meta alcanzada!',sub:`reuniste ${META} puntos`,puntos,det:`${vidas} vidas restantes`})}
        else api.fin({tipo:'pierde',titulo:'Te quedaste sin vidas',sub:'Demasiados peligros',puntos,det:`${puntos} de ${META} puntos`});
      }
      function golpe(){if(inv>0||fin)return;vidas--;combo=0;inv=1.2;GS.sonar.pierde();hud();if(vidas<=0)termina(false)}
      const lp=GS.bucle(dt=>{
        if(!jugando||fin)return;inv-=dt;
        let dx=0;if(ent.teclas.has('ArrowLeft'))dx--;if(ent.teclas.has('ArrowRight'))dx++;
        if(ent.p.abajo){const d=ent.p.x-cx.x;cx.x+=Math.sign(d)*Math.min(Math.abs(d),620*dt)}else cx.x+=dx*400*dt;
        cx.x=Math.max(44,Math.min(W-44,cx.x));canasta.setAttribute('transform',`translate(${cx.x} ${cx.y})`);canasta.setAttribute('opacity',inv>0&&Math.floor(inv*10)%2?.35:1);
        spawn-=dt;if(spawn<=0){crear();spawn=Math.max(.28,({1:.85,2:.65,3:.5}[nivel])*(1-puntos/(META*3)))*GS.rand(.7,1.25)}
        cosas=cosas.filter(c=>{c.y+=c.vy*dt;c.a+=c.va*dt;c.g.setAttribute('transform',`translate(${c.x} ${c.y}) rotate(${c.a*57})`);
          if(c.y>H-20){c.g.remove();if(BUENOS.some(b=>b[0]===c.tipo))combo=0;return false}
          if(Math.abs(c.x-cx.x)<44&&c.y>cx.y-24&&c.y<cx.y+10){
            c.g.remove();
            if(MALOS.includes(c.tipo)){golpe();return false}
            if(c.tipo==='corazon'){vidas=Math.min(3,vidas+1);GS.tono(700,.12,'triangle',.07,1100);hud();return false}
            const b=BUENOS.find(b=>b[0]===c.tipo);combo++;const extra=combo>=5?Math.floor(combo/5)*5:0;puntos+=b[1]+extra;api.puntos(puntos);GS.tono(600+Math.min(combo,12)*40,.06,'triangle',.06);hud();
            if(puntos>=META)termina(true);return false}
          return true});
      });
      GS.iniciaConToque(esc,ent,'Toca o pulsa una tecla para empezar',()=>{jugando=true});
      GS.pad(api,ent,[{k:'ArrowLeft',ico:'izq',etq:'Izquierda'},{k:'ArrowRight',ico:'der',etq:'Derecha'}]);
      api.botones([{txt:'Pausa',ico:'pausa',fn:()=>api.msg(lp.pausa()?'Pausa':'')}]);hud();
      return{destruir(){lp.parar();ent.destruir()},dbg:{acercarMeta(){puntos=META-5;api.puntos(puntos)},golpear:golpe,soltar(tipo,x){const g=E('g',{},capaO);g.innerHTML=ITEMS[tipo];cosas.push({tipo,x,y:420,vy:200,g,va:0,a:0})},get vidas(){return vidas},get puntos(){return puntos},get cosas(){return cosas.length},canasta:cx,ITEMS}};
    }
  });
}

/* 9) REBOTA LA PELOTA */
function initBouncer(cont){
  return GS.crear(cont,{
    id:'rebotapelota',
    intro:'Mantén la pelota en el aire moviendo la plataforma (flechas, A/D o arrastrando el dedo). Dónde la golpeas cambia hacia dónde sale: golpéala con el borde para lanzarla hacia los lados. Recoge estrellas para sumar puntos extra. Si cae, pierdes una vida.',
    niveles:[['1','Fácil','Meta: 25 rebotes. Plataforma ancha.'],['2','Medio','Meta: 45 rebotes. Plataforma mediana.'],['3','Difícil','Meta: 70 rebotes. Plataforma pequeña y pelota rápida.']],
    iniciar(api,nivel){
      const W=400,H=560,PW={1:130,2:100,3:78}[nivel],META={1:25,2:45,3:70}[nivel],PY=506,R=15;
      const esc=GS.escena(api,{w:W,h:H,max:430,fondo:'#ffe9c9',aria:'Rebota la pelota'}),ent=GS.entrada(esc),E=esc.el;
      for(let i=0;i<8;i++)E('rect',{x:i*52,y:0,width:26,height:H,fill:'#ffd9a8','fill-opacity':.35});
      E('rect',{x:0,y:H-24,width:W,height:24,fill:'#e57373'});
      const capaE=E('g'),gP=E('g'),gB=E('g');
      gP.innerHTML=`<rect x="${-PW/2}" y="-8" width="${PW}" height="16" rx="8" fill="#2f7fd1" stroke="#1b4f8a" stroke-width="3"/><rect x="${-PW/2+8}" y="-5" width="${PW-16}" height="4" rx="2" fill="#fff" fill-opacity=".4"/><path d="M${-PW/2+14} 8l6 10 6-10 6 10 6-10M${PW/2-38} 8l6 10 6-10 6 10 6-10" fill="none" stroke="#7a8793" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
      const bola=E('g',{},gB);bola.innerHTML=`<circle r="${R}" fill="#fb8c00" stroke="#c25e00" stroke-width="2.500"/><path d="M${-R} 0H${R}M0 ${-R}V${R}" stroke="#c25e00" stroke-width="2"/><path d="M${-R*.7} ${-R*.7}Q${-R*.2} 0 ${-R*.7} ${R*.7}M${R*.7} ${-R*.7}Q${R*.2} 0 ${R*.7} ${R*.7}" stroke="#c25e00" stroke-width="2" fill="none"/><circle cx="${-R*.35}" cy="${-R*.4}" r="3.500" fill="#fff" fill-opacity=".5"/>`;
      const sombra=E('ellipse',{cx:W/2,cy:H-14,rx:14,ry:4,fill:'#000','fill-opacity':.2});
      const P={x:W/2},B={x:W/2,y:200,vx:90,vy:0,sq:0};let vidas=3,rebotes=0,estrellasN=0,puntos=0,fin=false,jugando=false,inv=0,estrella=null,tEst=5;
      const g0=()=>Math.min(1600,1000+rebotes*(+nivel===3?16:11));
      const apice=()=>Math.max(70,150-rebotes*.8);
      const hud=()=>api.estado(`${GS.corazones(vidas,3)}<span style="margin:0 12px">Rebotes ${rebotes} / ${META}</span><span>Estrellas ${estrellasN}</span>`);
      function termina(gano){
        if(fin)return;fin=true;lp.parar();puntos=rebotes*10+estrellasN*50;
        if(gano){puntos+=250*nivel+vidas*100;api.fin({tipo:'gana',titulo:'¡Meta alcanzada!',sub:`${META} rebotes seguidos`,puntos,det:`${estrellasN} estrellas · ${vidas} vidas`})}
        else api.fin({tipo:'pierde',titulo:'Se cayó la pelota',sub:'Sin vidas',puntos,det:`${rebotes} rebotes · ${estrellasN} estrellas`});
      }
      function pierde(){vidas--;GS.sonar.pierde();hud();if(vidas<=0)return termina(false);inv=1.2;Object.assign(B,{x:P.x,y:PY-160,vx:GS.rand(-80,80),vy:-100})}
      const lp=GS.bucle(dt=>{
        if(!jugando||fin)return;inv-=dt;
        let dx=0;if(ent.teclas.has('ArrowLeft'))dx--;if(ent.teclas.has('ArrowRight'))dx++;
        if(ent.p.abajo){const d=ent.p.x-P.x;P.x+=Math.sign(d)*Math.min(Math.abs(d),700*dt)}else P.x+=dx*470*dt;
        P.x=Math.max(PW/2,Math.min(W-PW/2,P.x));gP.setAttribute('transform',`translate(${P.x} ${PY})`);
        const sub=Math.ceil(dt/.008),h=dt/sub;
        for(let s=0;s<sub;s++){
          const antes=B.y;B.vy+=g0()*h;B.x+=B.vx*h;B.y+=B.vy*h;
          if(B.x<R){B.x=R;B.vx=Math.abs(B.vx)}if(B.x>W-R){B.x=W-R;B.vx=-Math.abs(B.vx)}if(B.y<R){B.y=R;B.vy=Math.abs(B.vy)*.6}
          if(B.vy>0&&antes+R<=PY-8&&B.y+R>=PY-8&&B.x>P.x-PW/2-R*.5&&B.x<P.x+PW/2+R*.5){
            B.y=PY-8-R;const rel=Math.max(-1,Math.min(1,(B.x-P.x)/(PW/2)));
            B.vy=-Math.sqrt(2*g0()*(PY-apice()));B.vx=rel*(300+nivel*40);B.sq=.28;rebotes++;puntos=rebotes*10+estrellasN*50;api.puntos(puntos);hud();GS.tono(300+Math.min(rebotes,30)*14,.07,'triangle',.08,500);
            if(rebotes>=META)return termina(true);
          }
        }
        if(B.y>H+30){pierde();return}
        B.sq=Math.max(0,B.sq-dt*2.2);const e=1+B.sq*(B.vy<0?.9:-.5);
        bola.setAttribute('transform',`translate(${B.x} ${B.y}) rotate(${B.x*1.2}) scale(${1/e} ${e})`);gB.setAttribute('opacity',inv>0&&Math.floor(inv*10)%2?.4:1);
        sombra.setAttribute('cx',B.x);sombra.setAttribute('rx',Math.max(6,18-(PY-B.y)/30));
        tEst-=dt;if(!estrella&&tEst<=0){estrella={x:GS.rand(50,W-50),y:GS.rand(150,330),e:E('g',{},capaE),t:0};estrella.e.innerHTML='<polygon points="0,-14 4,-4 14,-4 6,2 9,12 0,6 -9,12 -6,2 -14,-4 -4,-4" fill="#ffd54a" stroke="#e0a800" stroke-width="2.500" stroke-linejoin="round"/>';tEst=GS.rand(4,8)}
        if(estrella){estrella.t+=dt;estrella.e.setAttribute('transform',`translate(${estrella.x} ${estrella.y}) scale(${1+Math.sin(estrella.t*5)*.12})`);
          if(GS.dist(estrella,B)<R+16){estrella.e.remove();estrella=null;estrellasN++;puntos=rebotes*10+estrellasN*50;api.puntos(puntos);hud();GS.tono(1000,.08,'triangle',.07,1500)}
          else if(estrella.t>7){estrella.e.remove();estrella=null}}
      });
      GS.iniciaConToque(esc,ent,'Toca o pulsa una tecla para empezar',()=>{jugando=true});
      GS.pad(api,ent,[{k:'ArrowLeft',ico:'izq',etq:'Izquierda'},{k:'ArrowRight',ico:'der',etq:'Derecha'}]);
      api.botones([{txt:'Pausa',ico:'pausa',fn:()=>api.msg(lp.pausa()?'Pausa':'')}]);hud();
      return{destruir(){lp.parar();ent.destruir()},dbg:{acercarMeta(){rebotes=META-1},perder:pierde,P,B,get vidas(){return vidas},get rebotes(){return rebotes},get puntos(){return puntos}}};
    }
  });
}

/* 10) CORTA FRUTAS */
function initFruitSlicer(cont){
  const FRUTAS={
    naranja:{r:26,fuera:'#fb8c00',dentro:'#ffd180'},manzana:{r:25,fuera:'#e53935',dentro:'#fff3d6'},sandia:{r:32,fuera:'#2e7d32',dentro:'#ef5350'},
    limon:{r:22,fuera:'#fdd835',dentro:'#fff9c4'},kiwi:{r:24,fuera:'#8d6e63',dentro:'#9ccc65'}
  };
  const cuerpo=k=>{const f=FRUTAS[k];return `<circle r="${f.r}" fill="${f.fuera}" stroke="rgba(0,0,0,.25)" stroke-width="2.500"/><ellipse cx="${-f.r*.35}" cy="${-f.r*.4}" rx="${f.r*.22}" ry="${f.r*.12}" fill="#fff" fill-opacity=".45" transform="rotate(-30 ${-f.r*.35} ${-f.r*.4})"/>`};
  const mitad=(k,arriba)=>{const f=FRUTAS[k],r=f.r,d=arriba?`M${-r} 0A${r} ${r} 0 0 1 ${r} 0z`:`M${-r} 0A${r} ${r} 0 0 0 ${r} 0z`;
    return `<path d="${d}" fill="${f.fuera}" stroke="rgba(0,0,0,.25)" stroke-width="2.500"/><ellipse cx="0" cy="0" rx="${r-4}" ry="${r*.28}" fill="${f.dentro}"/>`};
  return GS.crear(cont,{
    id:'cortafrutas',
    intro:'Desliza el dedo o el cursor (con el botón presionado) sobre las frutas para cortarlas. ¡Cuidado! Las bombas negras te quitan vidas. Llega a la meta de puntos antes de que se acabe el tiempo; cortar varias frutas de un solo tajo da puntos extra.',
    niveles:[['1','Fácil','200 puntos en 90 segundos. Una bomba te quita 1 vida.'],['2','Medio','400 puntos en 75 segundos.'],['3','Difícil','600 puntos en 60 segundos. Una bomba te quita 2 vidas.']],
    iniciar(api,nivel){
      const W=400,H=560,META={1:200,2:400,3:600}[nivel],TIEMPO={1:90,2:75,3:60}[nivel],PBOMBA={1:.1,2:.17,3:.24}[nivel],COSTO={1:1,2:1,3:2}[nivel];
      const esc=GS.escena(api,{w:W,h:H,max:430,fondo:'#3b2a22',aria:'Corta frutas'}),ent=GS.entrada(esc),E=esc.el;
      for(let i=0;i<7;i++)E('rect',{x:0,y:i*84,width:W,height:42,fill:'#4a3629','fill-opacity':.6});
      E('rect',{x:0,y:H-10,width:W,height:10,fill:'#2b1d17'});
      const capaF=E('g'),capaJ=E('g'),rastro=E('polyline',{fill:'none',stroke:'#fff','stroke-width':6,'stroke-linecap':'round','stroke-linejoin':'round','stroke-opacity':.85});
      let vidas=3,puntos=0,tiempo=0,fin=false,jugando=false,spawn=.3,cosas=[],pedazos=[],gotas=[],trazo=[],destello=0;
      const flash=E('rect',{width:W,height:H,fill:'#fff','fill-opacity':0,'pointer-events':'none'});
      const hud=()=>api.estado(`${GS.corazones(vidas,3)}<span style="margin:0 12px">${puntos} / ${META} puntos</span><span>${Math.max(0,Math.ceil(TIEMPO-tiempo))} s</span>`);
      function termina(gano){
        if(fin)return;fin=true;lp.parar();
        if(gano){puntos+=200*nivel+vidas*100+Math.floor(TIEMPO-tiempo)*3;api.fin({tipo:'gana',titulo:'¡Maestro del cuchillo!',sub:`llegaste a ${META} puntos`,puntos,det:`${vidas} vidas · ${Math.floor(TIEMPO-tiempo)} s sobrantes`})}
        else api.fin({tipo:'pierde',titulo:vidas<=0?'Una bomba explotó':'Se acabó el tiempo',sub:vidas<=0?'Sin vidas':`Te faltaron ${META-puntos} puntos`,puntos,det:`${puntos} de ${META} puntos`});
      }
      function lanza(){
        const bomba=Math.random()<PBOMBA,x=GS.rand(60,W-60),tipo=GS.pick(Object.keys(FRUTAS));
        const g=E('g',{},capaF);g.innerHTML=bomba?'<circle r="24" fill="#2b2b33" stroke="#555" stroke-width="3"/><path d="M8-20L14-30" stroke="#8d6e63" stroke-width="4" stroke-linecap="round"/><circle cx="16" cy="-33" r="5" fill="#ff9f43"/><circle cx="-8" cy="-8" r="6" fill="#fff" fill-opacity=".25"/><path d="M-8 6l4-6 4 6 4-6" stroke="#e8472f" stroke-width="3" fill="none" stroke-linecap="round"/>':cuerpo(tipo);
        const alto=GS.rand(380,470),vy=-Math.sqrt(2*760*alto);cosas.push({bomba,tipo,x,y:H+34,vx:(W/2-x)*GS.rand(.1,.35)+GS.rand(-40,40),vy,r:bomba?24:FRUTAS[tipo].r,g,a:0,va:GS.rand(-3,3),cortada:false});
      }
      function splash(x,y,color){for(let i=0;i<7;i++){const a=GS.rand(0,6.28),v=GS.rand(60,170),e=E('circle',{r:GS.rand(2,5),fill:color},capaJ);gotas.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-50,t:GS.rand(.4,.8),e})}}
      function corta(c){
        c.cortada=true;c.g.remove();
        if(c.bomba){vidas=Math.max(0,vidas-COSTO);GS.sonar.pierde();destello=.45;splash(c.x,c.y,'#ff9f43');hud();if(vidas<=0)termina(false);return}
        const f=FRUTAS[c.tipo];GS.tono(520,.07,'triangle',.07,900);
        for(const arriba of [true,false]){const g=E('g',{},capaF);g.innerHTML=mitad(c.tipo,arriba);pedazos.push({x:c.x,y:c.y,vx:c.vx+(arriba?-90:90),vy:c.vy*.3+(arriba?-70:-30),a:c.a,va:(arriba?-1:1)*GS.rand(2,5),g})}
        splash(c.x,c.y,f.dentro);puntos+=10;api.puntos(puntos);hud();
        if(puntos>=META)termina(true);
      }
      function segmentoToca(p,q,c){const dx=q.x-p.x,dy=q.y-p.y,l2=dx*dx+dy*dy||1;let t=((c.x-p.x)*dx+(c.y-p.y)*dy)/l2;t=Math.max(0,Math.min(1,t));return Math.hypot(c.x-(p.x+dx*t),c.y-(p.y+dy*t))<c.r+4}
      ent.on('abajo',p=>{trazo=[{x:p.x,y:p.y,t:performance.now()}]});
      ent.on('mueve',p=>{if(!p.abajo||!jugando||fin)return;const ult=trazo[trazo.length-1],nuevo={x:p.x,y:p.y,t:performance.now()};trazo.push(nuevo);if(trazo.length>10)trazo.shift();
        if(ult){let corto=0;for(const c of cosas){if(c.cortada)continue;if(segmentoToca(ult,nuevo,c)){corta(c);corto++}}
          if(corto>1){puntos+=corto*5;api.puntos(puntos);hud();api.msg(`¡Combo x${corto}!`);setTimeout(()=>api.msg(''),900)}}});
      ent.on('arriba',()=>{trazo=[]});
      const lp=GS.bucle(dt=>{
        if(!jugando||fin)return;tiempo+=dt;
        spawn-=dt;if(spawn<=0){const n=GS.rnd(1,Math.min(4,2+nivel));for(let i=0;i<n;i++)setTimeout(()=>{if(!fin)lanza()},i*140);spawn=GS.rand(.8,1.5)*({1:1.1,2:1,3:.85}[nivel])}
        cosas=cosas.filter(c=>{if(c.cortada)return false;c.vy+=760*dt;c.x+=c.vx*dt;c.y+=c.vy*dt;c.a+=c.va*dt;c.g.setAttribute('transform',`translate(${c.x} ${c.y}) rotate(${c.a*57})`);if(c.y>H+60&&c.vy>0){c.g.remove();return false}return true});
        pedazos=pedazos.filter(p=>{p.vy+=800*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.a+=p.va*dt;p.g.setAttribute('transform',`translate(${p.x} ${p.y}) rotate(${p.a*57})`);if(p.y>H+60){p.g.remove();return false}return true});
        gotas=gotas.filter(g=>{g.t-=dt;g.vy+=500*dt;g.x+=g.vx*dt;g.y+=g.vy*dt;g.e.setAttribute('cx',g.x);g.e.setAttribute('cy',g.y);g.e.setAttribute('opacity',Math.max(0,g.t*1.6));if(g.t<=0){g.e.remove();return false}return true});
        const ahora=performance.now();trazo=trazo.filter(p=>ahora-p.t<160);rastro.setAttribute('points',trazo.map(p=>`${p.x},${p.y}`).join(' '));
        destello=Math.max(0,destello-dt);flash.setAttribute('fill-opacity',destello);
        if(Math.floor(tiempo*4)%4===0)hud();
        if(tiempo>=TIEMPO)termina(puntos>=META);
      });
      GS.iniciaConToque(esc,ent,'Desliza para empezar a cortar',()=>{jugando=true});
      api.botones([{txt:'Pausa',ico:'pausa',fn:()=>api.msg(lp.pausa()?'Pausa':'')}]);hud();
      return{destruir(){lp.parar();ent.destruir()},dbg:{acercarMeta(){puntos=META-8;api.puntos(puntos)},lanzarFruta:lanza,get fruta(){return cosas.find(c=>!c.bomba&&!c.cortada)},get bomba(){return cosas.find(c=>c.bomba&&!c.cortada)},cortar:corta,get vidas(){return vidas},get puntos(){return puntos},get cosas(){return cosas.length},get pedazos(){return pedazos.length}}};
    }
  });
}

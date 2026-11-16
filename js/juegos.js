/* =========================================================
   UTILIDADES GENERALES
   ========================================================= */
function shuffle(arr){
  const a=arr.slice();
  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  return a;
}
function makeTimer(){
  const ids=[];
  return{
    setTimeout:(fn,ms)=>{const id=setTimeout(fn,ms); ids.push(id); return id;},
    setInterval:(fn,ms)=>{const id=setInterval(fn,ms); ids.push(id); return id;},
    clearAll:()=>{ids.forEach(id=>{clearTimeout(id);clearInterval(id);});}
  };
}
let _actx=null;
function playTone(freq=440,dur=.15,type='sine',vol=.18){
  try{
    const AC=window.AudioContext||window.webkitAudioContext;
    _actx=_actx||new AC();
    if(_actx.state==='suspended') _actx.resume();
    const o=_actx.createOscillator(), g=_actx.createGain();
    o.type=type; o.frequency.value=freq;
    g.gain.value=vol;
    o.connect(g); g.connect(_actx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001,_actx.currentTime+dur);
    o.stop(_actx.currentTime+dur);
  }catch(e){/* audio not available */}
}
function roundRect(ctx,x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
}

/* =========================================================
   2) PIANO TILES
   ========================================================= */
function initPiano(host,api){
  let cleanupInner=()=>{};
  function boot(){
    cleanupInner();
    host.innerHTML=`<div class="center-col">
      <div class="piano-lanes">
        <div class="lane" data-l="0"></div><div class="lane" data-l="1"></div>
        <div class="lane" data-l="2"></div><div class="lane" data-l="3"></div>
        <div class="hitline"></div>
      </div>
    </div>`;
    const lanes=[...host.querySelectorAll('.lane')];
    const wrap=host.querySelector('.piano-lanes');
    const timer=makeTimer();
    let score=0,running=true,raf,tiles=[],speed=2.4;
    api.setScore(0); api.setInfo('Toca el carril cuando el bloque llegue a la línea dorada.');

    function spawn(){
      if(!running)return;
      const lane=Math.floor(Math.random()*4);
      const el=document.createElement('div'); el.className='tile'; el.style.top='-90px';
      lanes[lane].appendChild(el);
      tiles.push({el,lane,y:-90,hit:false});
      timer.setTimeout(spawn,Math.max(480,950-score*10));
    }
    spawn();
    function loop(){
      if(!running)return;
      const H=wrap.clientHeight;
      tiles.forEach(t=>{t.y+=speed*2; t.el.style.top=t.y+'px';});
      tiles=tiles.filter(t=>{
        if(!t.hit && t.y>H-30){ end(); return true; }
        if(t.y>H+100){t.el.remove(); return false;}
        return true;
      });
      raf=requestAnimationFrame(loop);
    }
    raf=requestAnimationFrame(loop);
    function hitLane(l){
      if(!running)return;
      const H=wrap.clientHeight;
      const cand=tiles.find(t=>t.lane===l && !t.hit && t.y>H-160 && t.y<H+10);
      if(cand){
        cand.hit=true; cand.el.classList.add('hit');
        timer.setTimeout(()=>cand.el.remove(),150);
        score++; api.setScore(score); speed=2.4+score*0.06; playTone(300+l*90,.1);
      }else{ end(); }
    }
    lanes.forEach(el=>el.addEventListener('click',()=>hitLane(+el.dataset.l)));
    function end(){
      if(!running)return;
      running=false; cancelAnimationFrame(raf);
      playTone(120,.4,'sawtooth');
      const overlay=document.createElement('div');
      overlay.className='result';
      overlay.style.cssText='position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(23,29,35,.88);color:#f4ead8;border-radius:12px;';
      overlay.innerHTML=`<h3>¡Fin del juego!</h3><p>Puntaje: ${score}</p><button class="primary-btn" id="retryP">Reintentar</button>`;
      wrap.appendChild(overlay);
      overlay.querySelector('#retryP').addEventListener('click',boot);
    }
    cleanupInner=()=>{running=false; cancelAnimationFrame(raf); timer.clearAll();};
  }
  boot();
  return ()=>cleanupInner();
}

/* =========================================================
   4) PÁJARO VOLADOR
   ========================================================= */
function initFlappy(host,api){
  let cleanupInner=()=>{};
  function boot(){
    cleanupInner();
    const W=320,H=480,GH=58,S=2,PW=54,CAP=22;
    host.innerHTML=`<canvas id="fc" width="${W*S}" height="${H*S}" style="width:${W}px;cursor:pointer;touch-action:manipulation"></canvas>`;
    const c=host.querySelector('#fc'),ctx=c.getContext('2d'),ab=new AbortController();
    ctx.scale(S,S);
    let best=0;try{best=+localStorage.getItem('pv_best')||0}catch(e){}
    const bird={x:92,y:H/2-30,vy:0,r:13,fl:0},pipes=[];
    let fe=[],score=0,state='ready',raf,last=performance.now(),T=0,sc=0,shake=0;
    const clouds=Array.from({length:5},(_,i)=>({x:i*76+Math.random()*30,y:28+Math.random()*140,s:.6+Math.random()*.7,v:.1+Math.random()*.14}));
    api.setScore(0);api.setInfo('Toca la pantalla, haz clic o presiona espacio para aletear');
    const rr=(x,y,w,h,r)=>roundRect(ctx,x,y,w,h,r);

    function flap(){
      if(state==='over')return;
      if(state==='ready'){state='play';api.setInfo('Pasa por el hueco entre las columnas')}
      bird.vy=-6.3;bird.fl=1;playTone(520,.07);
      for(let i=0;i<3;i++)fe.push({x:bird.x-10,y:bird.y+2,vx:-1-Math.random()*1.6,vy:-.5+Math.random()*1.6,l:1,a:Math.random()*6});
    }
    c.addEventListener('pointerdown',e=>{e.preventDefault();flap()},{signal:ab.signal});
    addEventListener('keydown',e=>{if(e.key===' '||e.key==='ArrowUp'||e.key==='w'){e.preventDefault();flap()}},{signal:ab.signal});

    const hit=(rx,ry,rw,rh)=>{const cx=Math.max(rx,Math.min(bird.x,rx+rw)),cy=Math.max(ry,Math.min(bird.y,ry+rh));return(bird.x-cx)**2+(bird.y-cy)**2<(bird.r-2)**2};
    function die(){
      if(state==='over')return;
      state='over';shake=9;playTone(140,.4,'sawtooth');
      for(let i=0;i<16;i++)fe.push({x:bird.x,y:bird.y,vx:(Math.random()-.5)*7,vy:-Math.random()*5,l:1,a:Math.random()*6});
      const nb=score>best;if(nb){best=score;try{localStorage.setItem('pv_best',score)}catch(e){}}
      setTimeout(()=>{if(c.isConnected)overlay(nb)},650);
    }
    function overlay(nb){
      const tier=score>=20?['#e8b865','oro']:score>=10?['#cfd6dc','plata']:score>=5?['#c98b5a','bronce']:null;
      const o=document.createElement('div');o.className='fail pj';
      o.innerHTML=`<h3>¡Te estrellaste!</h3>${tier?`<svg class="medal" viewBox="0 0 64 64"><path d="M20 4h10l4 16H24zM44 4H34l-4 16h10z" fill="#d9826f"/><circle cx="32" cy="38" r="20" fill="${tier[0]}"/><circle cx="32" cy="38" r="14" fill="none" stroke="rgba(0,0,0,.2)" stroke-width="3"/><path d="M32 28l3.200 6.600 7.200 1-5.200 5 1.200 7.200L32 44.400l-6.400 3.400 1.200-7.200-5.200-5 7.200-1z" fill="#fff"/></svg><p>Medalla de ${tier[1]}</p>`:''}<p class="fs">Puntaje: ${score}</p><p>${nb&&score>0?'¡Nuevo récord!':'Mejor puntaje: '+best}</p><button class="primary-btn">Volar otra vez</button>`;
      host.appendChild(o);o.querySelector('button').onclick=boot;
    }

    function update(dt){
      T+=dt*16.7;
      clouds.forEach(k=>{k.x-=k.v*dt;if(k.x<-80)k.x=W+40});
      fe.forEach(f=>{f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=.08*dt;f.l-=.025*dt;f.a+=.1*dt});fe=fe.filter(f=>f.l>0);
      if(state==='ready'){sc+=.8*dt;bird.y=H/2-30+Math.sin(T/260)*7;bird.fl=.5+.5*Math.sin(T/90);return}
      bird.fl*=Math.pow(.88,dt);
      bird.vy=Math.min(9,bird.vy+.38*dt);
      if(state==='over'){bird.y=Math.min(H-GH-bird.r,bird.y+bird.vy*dt);return}
      const spd=2.2+Math.min(1.5,score*.045);
      sc+=spd*dt;bird.y+=bird.vy*dt;
      pipes.forEach(p=>p.x-=spd*dt);
      while(pipes.length&&pipes[0].x<-PW-20)pipes.shift();
      if(!pipes.length||pipes[pipes.length-1].x<W-205){const gap=Math.max(120,152-score*1.4);pipes.push({x:W+10,gapY:62+Math.random()*(H-GH-gap-124),gap,passed:false})}
      pipes.forEach(p=>{
        if(!p.passed&&p.x+PW<bird.x-bird.r){p.passed=true;score++;api.setScore(score);playTone(780,.08)}
        if(hit(p.x,0,PW,p.gapY-CAP)||hit(p.x-4,p.gapY-CAP,PW+8,CAP)||hit(p.x-4,p.gapY+p.gap,PW+8,CAP)||hit(p.x,p.gapY+p.gap+CAP,PW,H))die();
      });
      if(bird.y<bird.r){bird.y=bird.r;bird.vy=Math.max(bird.vy,0)}
      if(bird.y+bird.r>=H-GH){bird.y=H-GH-bird.r;die()}
    }

    const hills=(col,base,amp,par,len,ph)=>{ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(0,H-GH);for(let x=0;x<=W;x+=6)ctx.lineTo(x,base-Math.abs(Math.sin((x+sc*par)/len+ph))*amp);ctx.lineTo(W,H-GH);ctx.closePath();ctx.fill()};
    function drawBird(){
      ctx.save();ctx.translate(bird.x,bird.y);
      ctx.rotate(state==='ready'?0:Math.max(-.5,Math.min(1.2,bird.vy*.08)));
      ctx.fillStyle='#3f8fc4';ctx.beginPath();ctx.moveTo(-12,-2);ctx.lineTo(-25,-8);ctx.lineTo(-22,0);ctx.lineTo(-26,6);ctx.lineTo(-12,5);ctx.closePath();ctx.fill();
      const bg=ctx.createLinearGradient(0,-14,0,14);bg.addColorStop(0,'#7cc3ea');bg.addColorStop(1,'#3f8fc4');
      ctx.fillStyle=bg;ctx.beginPath();ctx.ellipse(0,0,17,14,0,0,7);ctx.fill();
      ctx.fillStyle='#f6ecd2';ctx.beginPath();ctx.ellipse(3,6,11,7,0,0,7);ctx.fill();
      ctx.strokeStyle='#e8b865';ctx.lineWidth=3;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(2,-13);ctx.quadraticCurveTo(0,-21,-6,-20);ctx.moveTo(6,-13);ctx.quadraticCurveTo(7,-22,13,-20);ctx.stroke();
      ctx.save();ctx.translate(-4,1);ctx.rotate(-1.0*bird.fl+.45*(1-bird.fl));
      ctx.fillStyle='#2f78ab';ctx.beginPath();ctx.ellipse(-5,0,11,5.5,0,0,7);ctx.fill();
      ctx.fillStyle='rgba(255,255,255,.25)';ctx.beginPath();ctx.ellipse(-7,-1.5,6,1.8,0,0,7);ctx.fill();ctx.restore();
      ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(8,-5,5,0,7);ctx.fill();
      if(state==='over'){ctx.strokeStyle='#1d242b';ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(5.5,-7.5);ctx.lineTo(10.5,-2.5);ctx.moveTo(10.5,-7.5);ctx.lineTo(5.5,-2.5);ctx.stroke()}
      else{ctx.fillStyle='#1d242b';ctx.beginPath();ctx.arc(9.5,-4.6,2.4,0,7);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(10.2,-5.4,.8,0,7);ctx.fill()}
      ctx.fillStyle='rgba(226,120,110,.5)';ctx.beginPath();ctx.arc(3,2,3.2,0,7);ctx.fill();
      ctx.fillStyle='#f2a541';ctx.beginPath();ctx.moveTo(14,-3);ctx.lineTo(25,1);ctx.lineTo(14,3);ctx.closePath();ctx.fill();
      ctx.fillStyle='#d9822f';ctx.beginPath();ctx.moveTo(14,1);ctx.lineTo(24,1.6);ctx.lineTo(14,6);ctx.closePath();ctx.fill();
      ctx.restore();
    }
    function draw(){
      ctx.save();
      if(shake>0){ctx.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);shake*=.88;if(shake<.4)shake=0}
      const g=ctx.createLinearGradient(0,0,0,H-GH);g.addColorStop(0,'#7fb0d3');g.addColorStop(.7,'#cfe3e0');g.addColorStop(1,'#f3e6c4');
      ctx.fillStyle=g;ctx.fillRect(-10,-10,W+20,H);
      ctx.fillStyle='rgba(255,236,190,.55)';ctx.beginPath();ctx.arc(250,92,46,0,7);ctx.fill();
      ctx.fillStyle='#fff1c9';ctx.beginPath();ctx.arc(250,92,28,0,7);ctx.fill();
      clouds.forEach(k=>{ctx.fillStyle='rgba(255,255,255,.8)';const r=16*k.s;[[0,0,1],[r*1.1,-r*.3,1.2],[r*2.3,0,.9],[r*1.1,r*.25,1]].forEach(([dx,dy,m])=>{ctx.beginPath();ctx.arc(k.x+dx,k.y+dy,r*m*.8,0,7);ctx.fill()})});
      hills('#8fb9a6',H-GH-70,26,.18,70,0);hills('#6fa58a',H-GH-38,20,.4,50,1.7);
      pipes.forEach(p=>{
        const gr=ctx.createLinearGradient(p.x,0,p.x+PW,0);gr.addColorStop(0,'#3f7f5a');gr.addColorStop(.35,'#7fc79a');gr.addColorStop(1,'#356b4b');
        const cg=ctx.createLinearGradient(p.x-4,0,p.x+PW+4,0);cg.addColorStop(0,'#336a49');cg.addColorStop(.35,'#6fb88a');cg.addColorStop(1,'#2d5e41');
        ctx.fillStyle=gr;ctx.fillRect(p.x,0,PW,p.gapY-CAP);ctx.fillRect(p.x,p.gapY+p.gap+CAP,PW,H);
        ctx.fillStyle=cg;rr(p.x-4,p.gapY-CAP,PW+8,CAP,6);ctx.fill();rr(p.x-4,p.gapY+p.gap,PW+8,CAP,6);ctx.fill();
        ctx.fillStyle='rgba(255,255,255,.18)';ctx.fillRect(p.x+8,0,5,p.gapY-CAP);ctx.fillRect(p.x+8,p.gapY+p.gap+CAP,5,H);
      });
      ctx.fillStyle='#d6b883';ctx.fillRect(0,H-GH,W,GH);
      ctx.fillStyle='#6fbf73';ctx.fillRect(0,H-GH,W,14);
      ctx.fillStyle='#5aa862';for(let x=-(sc%28);x<W;x+=28){ctx.beginPath();ctx.moveTo(x,H-GH);ctx.lineTo(x+14,H-GH);ctx.lineTo(x+4,H-GH+14);ctx.lineTo(x-10,H-GH+14);ctx.fill()}
      ctx.fillStyle='rgba(0,0,0,.08)';ctx.fillRect(0,H-GH+14,W,3);
      ctx.fillStyle='rgba(120,84,40,.25)';for(let x=-(sc%40);x<W;x+=40){ctx.fillRect(x+10,H-GH+30,12,4);ctx.fillRect(x+28,H-GH+42,8,4)}
      fe.forEach(f=>{ctx.save();ctx.translate(f.x,f.y);ctx.rotate(f.a);ctx.globalAlpha=Math.max(0,f.l);ctx.fillStyle='#a9d4ee';ctx.beginPath();ctx.ellipse(0,0,5,2,0,0,7);ctx.fill();ctx.restore()});
      drawBird();
      ctx.restore();
      ctx.textAlign='center';ctx.lineJoin='round';
      if(state!=='ready'){ctx.font='700 46px Fredoka,Nunito,sans-serif';ctx.lineWidth=7;ctx.strokeStyle='rgba(23,29,35,.55)';ctx.strokeText(score,W/2,78);ctx.fillStyle='#fff';ctx.fillText(score,W/2,78)}
      else{
        ctx.fillStyle='rgba(23,29,35,.6)';rr(W/2-96,H/2+34,192,44,22);ctx.fill();
        ctx.fillStyle='#fff';ctx.font='700 17px Nunito,sans-serif';ctx.fillText('Toca para volar',W/2,H/2+62);
        if(best){ctx.font='600 14px Nunito,sans-serif';ctx.fillStyle='rgba(255,255,255,.9)';ctx.fillText('Mejor puntaje: '+best,W/2,92)}
      }
    }
    function loop(now){const dt=Math.min(2.5,(now-last)/16.667);last=now;update(dt);draw();raf=requestAnimationFrame(loop)}
    raf=requestAnimationFrame(loop);
    cleanupInner=()=>{cancelAnimationFrame(raf);ab.abort()};
  }
  boot();
  return ()=>cleanupInner();
}

/* =========================================================
   6) 2048
   ========================================================= */
function init2048(host,api){
  let cleanupInner=()=>{};
  function boot(){
    cleanupInner();
    host.innerHTML=`<div class="center-col"><div class="t2048-board" id="board"></div></div>`;
    const boardEl=host.querySelector('#board');
    const localAbort=new AbortController();
    let grid=Array.from({length:4},()=>Array(4).fill(0));
    let score=0, over=false;
    api.setScore(0); api.setInfo('Usa las flechas del teclado para unir números');

    const COLORS={2:'#e8d3ae',4:'#e3c593',8:'#dcaa72',16:'#d99a5b',32:'#d99072',64:'#d9826f',128:'#e8cf8f',256:'#e3c070',512:'#c2d986',1024:'#8fcfa9',2048:'#7fb0d3'};

    function addRandom(){
      const empty=[];
      for(let r=0;r<4;r++)for(let c=0;c<4;c++)if(grid[r][c]===0)empty.push([r,c]);
      if(!empty.length)return;
      const [r,c]=empty[Math.floor(Math.random()*empty.length)];
      grid[r][c]=Math.random()<0.9?2:4;
    }
    function render(){
      boardEl.innerHTML='';
      const cs=(boardEl.clientWidth-40)/4;
      for(let i=0;i<16;i++){const cell=document.createElement('div'); cell.className='t2048-cell'; boardEl.appendChild(cell);}
      for(let r=0;r<4;r++)for(let c=0;c<4;c++){
        const v=grid[r][c]; if(!v)continue;
        const tile=document.createElement('div'); tile.className='t2048-tile';
        tile.style.left=(8+c*(cs+8))+'px'; tile.style.top=(8+r*(cs+8))+'px';
        tile.style.width=cs+'px'; tile.style.height=cs+'px';
        tile.style.background=COLORS[v]||'#7fb0d3';
        tile.style.fontSize=v>512?'16px':'22px';
        tile.textContent=v;
        boardEl.appendChild(tile);
      }
    }
    function slide(row){
      const nums=row.filter(v=>v!==0);
      for(let i=0;i<nums.length-1;i++){
        if(nums[i]===nums[i+1]){nums[i]*=2; score+=nums[i]; nums.splice(i+1,1); playTone(500,.08);}
      }
      while(nums.length<4)nums.push(0);
      return nums;
    }
    function move(dir){
      if(over)return;
      let changed=false;
      const before=JSON.stringify(grid);
      if(dir==='left'){ for(let r=0;r<4;r++) grid[r]=slide(grid[r]); }
      if(dir==='right'){ for(let r=0;r<4;r++) grid[r]=slide(grid[r].slice().reverse()).reverse(); }
      if(dir==='up'){ for(let c=0;c<4;c++){ const col=slide([grid[0][c],grid[1][c],grid[2][c],grid[3][c]]); for(let r=0;r<4;r++) grid[r][c]=col[r]; } }
      if(dir==='down'){ for(let c=0;c<4;c++){ const col=slide([grid[3][c],grid[2][c],grid[1][c],grid[0][c]].slice()).reverse(); for(let r=0;r<4;r++) grid[r][c]=col[r]; } }
      changed = before!==JSON.stringify(grid);
      if(changed){ if(grid.flat().includes(2048)) api.setInfo('¡Llegaste a 2048! Puedes seguir jugando.'); addRandom(); api.setScore(score); render(); checkOver(); }
    }
    function checkOver(){
      for(let r=0;r<4;r++)for(let c=0;c<4;c++){
        if(grid[r][c]===0)return;
        if(c<3 && grid[r][c]===grid[r][c+1])return;
        if(r<3 && grid[r][c]===grid[r+1][c])return;
      }
      over=true; api.setInfo('Sin movimientos posibles.');const o=document.createElement('div');o.className='fail';o.innerHTML=`<h3>Sin movimientos</h3><p class="fs">Puntaje: ${score}</p><button class="primary-btn">Reintentar</button>`;host.appendChild(o);o.querySelector('button').onclick=boot;
    }
    function onKey(e){
      const map={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down'};
      if(map[e.key]){ e.preventDefault(); move(map[e.key]); }
    }
    window.addEventListener('keydown',onKey,{signal:localAbort.signal});
    // soporte táctil simple (swipe)
    let sx=0,sy=0;
    boardEl.addEventListener('touchmove',e=>e.preventDefault(),{passive:false,signal:localAbort.signal});
    boardEl.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY;},{signal:localAbort.signal});
    boardEl.addEventListener('touchend',e=>{
      const dx=e.changedTouches[0].clientX-sx, dy=e.changedTouches[0].clientY-sy;
      if(Math.abs(dx)>Math.abs(dy)) move(dx>0?'right':'left'); else move(dy>0?'down':'up');
    },{signal:localAbort.signal});

    addRandom(); addRandom(); render();
    cleanupInner=()=>{localAbort.abort();};
  }
  boot();
  return ()=>cleanupInner();
}

/* =========================================================
   7) SIMÓN DICE
   ========================================================= */
function initSimon(host,api){
  let cleanupInner=()=>{};
  function boot(){
    cleanupInner();
    host.innerHTML=`<div class="center-col"><div class="simon-board"><button class="pad pad-tl" data-i="0"></button><button class="pad pad-tr" data-i="1"></button><button class="pad pad-bl" data-i="2"></button><button class="pad pad-br" data-i="3"></button></div></div>`;
    const pads=[...host.querySelectorAll('.pad')],board=host.querySelector('.simon-board'),freqs=[329.6,392,261.6,220],timer=makeTimer();
    let seq=[],idx=0,ok=false;
    api.setScore(0);
    const flash=(i,d=350)=>{pads[i].classList.add('active');playTone(freqs[i],d/1000);timer.setTimeout(()=>pads[i].classList.remove('active'),d)};
    function next(){
      seq.push(Math.floor(Math.random()*4));api.setScore(seq.length-1);ok=false;idx=0;api.setInfo('¡Observa la secuencia!');
      let i=0;const step=()=>{if(i>=seq.length){ok=true;api.setInfo('¡Tu turno!');return}flash(seq[i++]);timer.setTimeout(step,550)};
      timer.setTimeout(step,700);
    }
    pads.forEach(p=>p.onclick=()=>{
      if(!ok)return;const i=+p.dataset.i;flash(i,200);
      if(i===seq[idx]){if(++idx===seq.length){ok=false;timer.setTimeout(next,800)}}else fail(i);
    });
    function fail(i){
      ok=false;playTone(110,.6,'sawtooth');pads[i].classList.add('wrong');pads[seq[idx]].classList.add('right');board.classList.add('shake');
      api.setInfo('Fallaste: el color correcto quedó resaltado.');
      timer.setTimeout(()=>{
        const o=document.createElement('div');o.className='fail';
        o.innerHTML=`<svg viewBox="0 0 64 64" width="84" height="84"><circle cx="32" cy="32" r="29" fill="#fff"/><path d="M21 21l22 22M43 21L21 43" stroke="#c0392b" stroke-width="8" stroke-linecap="round"/></svg><h3>¡FALLASTE!</h3><p>Llegaste a la ronda ${seq.length}</p><p class="fs">Puntaje: ${seq.length-1}</p><button class="primary-btn">Reintentar</button>`;
        host.appendChild(o);o.querySelector('button').onclick=boot;
      },900);
    }
    timer.setTimeout(next,300); /* arranca solo al terminar la cuenta regresiva */
    cleanupInner=()=>timer.clearAll();
  }
  boot();
  return ()=>cleanupInner();
}

/* =========================================================
   8) GOLPEA AL TOPO (ilustraciones SVG + animaciones CSS)
   ========================================================= */
const MOLE_SVG=`<svg viewBox="0 0 80 90" class="msvg"><ellipse cx="40" cy="62" rx="30" ry="30" fill="#8a5a3c"/><ellipse cx="40" cy="70" rx="18" ry="16" fill="#c99a73"/><ellipse cx="40" cy="38" rx="26" ry="24" fill="#8a5a3c"/><ellipse cx="40" cy="48" rx="13" ry="10" fill="#e8b0a0"/><ellipse cx="40" cy="43" rx="6" ry="4.5" fill="#3b2418"/><g class="eo"><circle cx="29" cy="32" r="4.5" fill="#fff"/><circle cx="51" cy="32" r="4.5" fill="#fff"/><circle cx="30" cy="33" r="2.4" fill="#1d242b"/><circle cx="50" cy="33" r="2.4" fill="#1d242b"/></g><g class="ek"><path d="M24 28l10 8m0-8l-10 8M46 28l10 8m0-8l-10 8" stroke="#1d242b" stroke-width="2.6" stroke-linecap="round"/></g><rect x="36" y="50" width="3.6" height="6" rx="1" fill="#fff"/><rect x="40.4" y="50" width="3.6" height="6" rx="1" fill="#fff"/><ellipse cx="14" cy="66" rx="7" ry="5" fill="#8a5a3c"/><ellipse cx="66" cy="66" rx="7" ry="5" fill="#8a5a3c"/><g fill="#f4ead8"><rect x="9" y="68" width="2" height="5" rx="1"/><rect x="13" y="69" width="2" height="5" rx="1"/><rect x="65" y="69" width="2" height="5" rx="1"/><rect x="69" y="68" width="2" height="5" rx="1"/></g></svg>`;
const STARS_SVG=`<svg class="stars" viewBox="0 0 80 24"><text x="6" y="19" font-size="20" fill="#ffd54a">★ ★ ★</text></svg>`;
const HAMMER_SVG=`<svg class="hammer" viewBox="0 0 60 60"><rect x="26" y="20" width="8" height="38" rx="3" fill="#a9733f"/><rect x="8" y="4" width="44" height="22" rx="6" fill="#7b8794"/><rect x="8" y="4" width="44" height="8" rx="4" fill="#aab4bf"/></svg>`;
function initMole(host,api){
  let cleanupInner=()=>{};
  function boot(){
    cleanupInner();
    host.innerHTML=`<div class="center-col"><div class="mole-grid">${Array.from({length:9},(_,i)=>`<div class="mcell"><div class="pit"></div><div class="mole">${MOLE_SVG}${STARS_SVG}</div><div class="mound"></div>${HAMMER_SVG}</div>`).join('')}</div></div>`;
    const cells=[...host.querySelectorAll('.mcell')],timer=makeTimer();
    let score=0,t=30,run=true,cur=null;
    api.setScore(0);
    const info=()=>api.setInfo(`¡Golpea a los topos! Tiempo: ${t}s · el topo dorado vale 3`);info();
    const down=c=>c.classList.remove('up','hit','gold');
    function pop(){
      if(!run)return;
      if(cur)down(cur);
      let c;do{c=cells[Math.floor(Math.random()*9)]}while(c===cur);
      cur=c;c.classList.toggle('gold',Math.random()<.15);c.classList.add('up');
      const dur=Math.max(450,900-(30-t)*12)+Math.random()*350;
      timer.setTimeout(()=>{if(cur===c&&!c.classList.contains('hit')){down(c);cur=null}},dur);
      timer.setTimeout(pop,dur+250);
    }
    pop();
    cells.forEach(c=>c.onpointerdown=()=>{
      if(!run)return;
      const h=c.querySelector('.hammer');h.classList.remove('swing');void h.offsetWidth;h.classList.add('swing');
      if(c.classList.contains('up')&&!c.classList.contains('hit')){
        const p=c.classList.contains('gold')?3:1;score+=p;api.setScore(score);playTone(p>1?800:500,.1);
        c.classList.add('hit');
        const f=document.createElement('span');f.className='plus';f.textContent='+'+p;c.appendChild(f);timer.setTimeout(()=>f.remove(),700);
        timer.setTimeout(()=>{down(c);if(cur===c)cur=null},380);
      }else playTone(160,.08,'square');
    });
    timer.setInterval(()=>{
      t--;info();
      if(t<=0){
        run=false;timer.clearAll();api.setInfo('¡Se acabó el tiempo!');
        const o=document.createElement('div');o.className='fail time';
        o.innerHTML=`<h3>¡Tiempo!</h3><p class="fs">Puntaje: ${score}</p><button class="primary-btn">Reintentar</button>`;
        host.appendChild(o);o.querySelector('button').onclick=boot;
      }
    },1000);
    cleanupInner=()=>{run=false;timer.clearAll()};
  }
  boot();
  return ()=>cleanupInner();
}

/* =========================================================
   9) SERPIENTE
   ========================================================= */
function initSnake(host,api){
  let cleanupInner=()=>{};
  function boot(){
    cleanupInner();
    host.innerHTML=`<canvas id="sc" width="400" height="400"></canvas>`;
    const c=host.querySelector('#sc'),ctx=c.getContext('2d'),cell=20,N=20,ab=new AbortController();
    let best=0;try{best=+localStorage.getItem('snk_best')||0}catch(e){}
    let snake=[{x:9,y:10},{x:8,y:10},{x:7,y:10}],prev=snake.map(s=>({...s})),dir={x:1,y:0},nd=dir,score=0,eaten=0,run=true,tick=150,acc=0,last=performance.now(),T=0,raf,parts=[],gold=null,fruit=null;
    const free=p=>!snake.some(s=>s.x===p.x&&s.y===p.y)&&!(fruit&&fruit.x===p.x&&fruit.y===p.y)&&!(gold&&gold.x===p.x&&gold.y===p.y);
    function spot(){let p;do{p={x:Math.floor(Math.random()*N),y:Math.floor(Math.random()*N)}}while(!free(p));return p}
    fruit=spot();
    api.setScore(0);api.setInfo('Flechas o WASD · la fruta dorada vale 5 y desaparece pronto');
    addEventListener('keydown',e=>{
      const m={ArrowUp:[0,-1],w:[0,-1],ArrowDown:[0,1],s:[0,1],ArrowLeft:[-1,0],a:[-1,0],ArrowRight:[1,0],d:[1,0]}[e.key];
      if(!m)return;e.preventDefault();
      if(m[0]===-dir.x&&m[1]===-dir.y)return;nd={x:m[0],y:m[1]};
    },{signal:ab.signal});
    let sx=0,sy=0;
    c.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY},{signal:ab.signal,passive:true});
    c.addEventListener('touchend',e=>{
      const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy,m=Math.abs(dx)>Math.abs(dy)?[dx>0?1:-1,0]:[0,dy>0?1:-1];
      if(!(m[0]===-dir.x&&m[1]===-dir.y))nd={x:m[0],y:m[1]};
    },{signal:ab.signal});
    const burst=(p,col)=>{for(let i=0;i<16;i++){const a=Math.random()*6.28,v=1+Math.random()*3;parts.push({x:(p.x+.5)*cell,y:(p.y+.5)*cell,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:1,c:col})}};
    function step(){
      prev=snake.map(s=>({...s}));dir=nd;
      const h={x:snake[0].x+dir.x,y:snake[0].y+dir.y};
      if(h.x<0||h.y<0||h.x>=N||h.y>=N||snake.slice(0,-1).some(s=>s.x===h.x&&s.y===h.y)){over();return}
      snake.unshift(h);
      if(h.x===fruit.x&&h.y===fruit.y){
        score++;eaten++;burst(fruit,'#ff5a4d');playTone(650,.09);fruit=spot();tick=Math.max(75,150-score*3);
        if(eaten%5===0&&!gold)gold={...spot(),t:6000};
      }else if(gold&&h.x===gold.x&&h.y===gold.y){score+=5;burst(gold,'#ffd54a');playTone(900,.15);gold=null}
      else snake.pop();
      api.setScore(score);
    }
    function draw(dt){
      T+=dt;const u=Math.min(1,acc/tick);
      for(let y=0;y<N;y++)for(let x=0;x<N;x++){ctx.fillStyle=(x+y)%2?'#1c3d28':'#173222';ctx.fillRect(x*cell,y*cell,cell,cell)}
      ctx.lineWidth=4;ctx.strokeStyle='#0d1f15';ctx.strokeRect(2,2,c.width-4,c.height-4);
      /* fruta */
      const k=1+.07*Math.sin(T/180),fx=(fruit.x+.5)*cell,fy=(fruit.y+.5)*cell;
      ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(fx,fy+8,7,3,0,0,7);ctx.fill();
      const ag=ctx.createRadialGradient(fx-3,fy-3,1,fx,fy,9*k);ag.addColorStop(0,'#ff9a8a');ag.addColorStop(1,'#d62f2f');
      ctx.fillStyle=ag;ctx.beginPath();ctx.arc(fx,fy+1,8*k,0,7);ctx.fill();
      ctx.strokeStyle='#5a3a1c';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(fx,fy-6);ctx.lineTo(fx+1,fy-10);ctx.stroke();
      ctx.fillStyle='#5fd16f';ctx.beginPath();ctx.ellipse(fx+4,fy-8,4,2,-.5,0,7);ctx.fill();
      if(gold){
        const gx=(gold.x+.5)*cell,gy=(gold.y+.5)*cell;
        ctx.shadowColor='#ffd54a';ctx.shadowBlur=14;ctx.fillStyle='#ffd54a';ctx.beginPath();ctx.arc(gx,gy,8*k,0,7);ctx.fill();ctx.shadowBlur=0;
        ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(gx,gy,11,-1.57,-1.57+6.28*gold.t/6000);ctx.stroke();
      }
      /* cuerpo */
      const pts=snake.map((s,i)=>{const f=prev[Math.min(i,prev.length-1)];return{x:(f.x+(s.x-f.x)*u+.5)*cell,y:(f.y+(s.y-f.y)*u+.5)*cell}}),L=pts.length;
      ctx.lineCap='round';
      for(let i=L-1;i>0;i--){
        const q=i/L;ctx.lineWidth=cell*(.92-.34*q);ctx.strokeStyle=`hsl(${150-q*40},62%,${50-q*14}%)`;
        ctx.beginPath();ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[i-1].x,pts[i-1].y);ctx.stroke();
        if(i%2===0){ctx.fillStyle='rgba(10,40,25,.35)';ctx.beginPath();ctx.arc(pts[i].x,pts[i].y,cell*.17,0,7);ctx.fill()}
      }
      /* cabeza */
      const H=pts[0],hg=ctx.createRadialGradient(H.x-3,H.y-3,1,H.x,H.y,12);hg.addColorStop(0,'#9af0c4');hg.addColorStop(1,'#2fa874');
      if(Math.floor(T/500)%2===0){ctx.strokeStyle='#e0455a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(H.x+dir.x*10,H.y+dir.y*10);ctx.lineTo(H.x+dir.x*17,H.y+dir.y*17);ctx.stroke()}
      ctx.fillStyle=hg;ctx.beginPath();ctx.arc(H.x,H.y,11,0,7);ctx.fill();
      const px=-dir.y,py=dir.x;
      [-1,1].forEach(sd=>{const ex=H.x+dir.x*3+px*5*sd,ey=H.y+dir.y*3+py*5*sd;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(ex,ey,3.4,0,7);ctx.fill();ctx.fillStyle='#10201a';ctx.beginPath();ctx.arc(ex+dir.x*1.2,ey+dir.y*1.2,1.7,0,7);ctx.fill()});
      /* partículas */
      parts=parts.filter(p=>p.l>0);parts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.l-=.03;ctx.globalAlpha=Math.max(0,p.l);ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(p.x,p.y,3,0,7);ctx.fill()});ctx.globalAlpha=1;
      /* marcador */
      ctx.fillStyle='rgba(10,25,18,.7)';roundRect(ctx,10,10,150,26,8);ctx.fill();
      ctx.fillStyle='#e8f5ec';ctx.font='600 14px sans-serif';ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText(`Puntos ${score}  ·  Récord ${Math.max(best,score)}`,18,23);
    }
    function loop(now){
      if(!run)return;const dt=now-last;last=now;acc+=dt;
      if(acc>=tick){acc-=tick;step()}
      if(gold){gold.t-=dt;if(gold.t<=0)gold=null}
      if(run)draw(dt);
      raf=requestAnimationFrame(loop);
    }
    raf=requestAnimationFrame(loop);
    function over(){
      run=false;playTone(120,.4,'sawtooth');
      const nb=score>best;if(nb)try{localStorage.setItem('snk_best',score)}catch(e){}
      const o=document.createElement('div');o.className='fail snk';
      o.innerHTML=`<h3>¡Chocaste!</h3><p class="fs">Puntaje: ${score}</p><p>${nb?'¡Nuevo récord!':'Récord: '+best}</p><button class="primary-btn">Reintentar</button>`;
      host.appendChild(o);o.querySelector('button').onclick=boot;
    }
    cleanupInner=()=>{run=false;cancelAnimationFrame(raf);ab.abort()};
  }
  boot();
  return ()=>cleanupInner();
}

/* =========================================================
   10) ROMPELADRILLOS (estilo neón)
   ========================================================= */
function initBreakout(host,api){
  let cleanupInner=()=>{};
  function boot(){
    cleanupInner();
    host.innerHTML=`<canvas id="bc" width="400" height="500" style="cursor:none;touch-action:none"></canvas>`;
    const c=host.querySelector('#bc'),ctx=c.getContext('2d'),ab=new AbortController(),W=c.width,H=c.height;
    const COL=['#ff3c8e','#ff8a3c','#ffe03c','#3cff9e','#3cc8ff','#a86bff'],stars=Array.from({length:50},()=>({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.4+.3}));
    let bricks=[],pad={w:80,x:W/2-40},ball,trail=[],parts=[],score=0,lives=3,level=1,run=true,held=true,raf,T=0;
    function build(){
      bricks=[];const cols=8,bw=(W-24)/cols;
      for(let r=0;r<6;r++)for(let k=0;k<cols;k++){
        if(level>1&&(r+k+level)%7===0)continue;
        bricks.push({x:12+k*bw+2,y:56+r*24,w:bw-4,h:18,col:COL[r],hp:r<2&&level>1?2:1});
      }
    }
    const spd=()=>4.2+level*.5;
    function reset(){held=true;ball={x:pad.x+pad.w/2,y:H-46,vx:0,vy:0,r:7}}
    function launch(){if(!held)return;held=false;const a=-1.57+(Math.random()-.5)*.9;ball.vx=Math.cos(a)*spd();ball.vy=Math.sin(a)*spd()}
    build();reset();api.setScore(0);api.setInfo('Mueve el mouse o ← → · clic o espacio para lanzar');
    const mv=x=>{const r=c.getBoundingClientRect();pad.x=Math.max(0,Math.min(W-pad.w,(x-r.left)*W/r.width-pad.w/2))};
    c.addEventListener('pointermove',e=>mv(e.clientX),{signal:ab.signal});
    c.addEventListener('pointerdown',e=>{mv(e.clientX);launch()},{signal:ab.signal});
    addEventListener('keydown',e=>{
      if(e.key==='ArrowLeft'){pad.x=Math.max(0,pad.x-26);e.preventDefault()}
      if(e.key==='ArrowRight'){pad.x=Math.min(W-pad.w,pad.x+26);e.preventDefault()}
      if(e.key===' '){launch();e.preventDefault()}
    },{signal:ab.signal});
    const burst=(x,y,col)=>{for(let i=0;i<12;i++){const a=Math.random()*6.28,v=1+Math.random()*3;parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:1,c:col})}};
    function loop(now){
      if(!run)return;T++;
      if(held){ball.x=pad.x+pad.w/2;ball.y=H-46}
      else{
        ball.x+=ball.vx;ball.y+=ball.vy;trail.push({x:ball.x,y:ball.y});if(trail.length>9)trail.shift();
        if(ball.x<ball.r){ball.x=ball.r;ball.vx=Math.abs(ball.vx)}
        if(ball.x>W-ball.r){ball.x=W-ball.r;ball.vx=-Math.abs(ball.vx)}
        if(ball.y<ball.r){ball.y=ball.r;ball.vy=Math.abs(ball.vy)}
        const py=H-34;
        if(ball.vy>0&&ball.y+ball.r>=py&&ball.y<py+12&&ball.x>pad.x-4&&ball.x<pad.x+pad.w+4){
          const h=(ball.x-(pad.x+pad.w/2))/(pad.w/2),a=-1.57+h*1.05,s=Math.min(spd()+1.5,Math.hypot(ball.vx,ball.vy)+.08);
          ball.vx=Math.cos(a)*s;ball.vy=Math.sin(a)*s;playTone(400,.05);
        }
        if(ball.y>H+20){lives--;trail=[];if(lives<=0){end(false);return}reset()}
        let hit=false;
        bricks.forEach(b=>{
          if(hit||b.hp<=0)return;
          const cx=Math.max(b.x,Math.min(ball.x,b.x+b.w)),cy=Math.max(b.y,Math.min(ball.y,b.y+b.h)),dx=ball.x-cx,dy=ball.y-cy;
          if(dx*dx+dy*dy<ball.r*ball.r){
            if(Math.abs(dx)>Math.abs(dy))ball.vx*=-1;else ball.vy*=-1;
            hit=true;b.hp--;
            if(b.hp<=0){score+=10*level;api.setScore(score);burst(b.x+b.w/2,b.y+b.h/2,b.col);playTone(620+(b.y%5)*60,.07)}else playTone(300,.06,'square');
          }
        });
        if(bricks.every(b=>b.hp<=0)){level++;build();reset();trail=[];api.setInfo('Nivel '+level+' · ¡más rápido!')}
      }
      /* fondo */
      const bg=ctx.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#2a0f55');bg.addColorStop(1,'#07204a');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
      stars.forEach(s=>{ctx.globalAlpha=.4+.4*Math.sin(T/30+s.x);ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,7);ctx.fill()});ctx.globalAlpha=1;
      /* ladrillos */
      bricks.forEach(b=>{
        if(b.hp<=0)return;
        ctx.shadowColor=b.col;ctx.shadowBlur=10;ctx.fillStyle=b.hp>1?'#cfd6e6':b.col;roundRect(ctx,b.x,b.y,b.w,b.h,5);ctx.fill();ctx.shadowBlur=0;
        ctx.fillStyle='rgba(255,255,255,.35)';roundRect(ctx,b.x+3,b.y+2,b.w-6,5,3);ctx.fill();
        if(b.hp>1){ctx.strokeStyle=b.col;ctx.lineWidth=2;roundRect(ctx,b.x+1,b.y+1,b.w-2,b.h-2,5);ctx.stroke()}
      });
      /* paleta */
      const pg=ctx.createLinearGradient(pad.x,0,pad.x+pad.w,0);pg.addColorStop(0,'#3cc8ff');pg.addColorStop(.5,'#ffffff');pg.addColorStop(1,'#ff3c8e');
      ctx.shadowColor='#3cc8ff';ctx.shadowBlur=16;ctx.fillStyle=pg;roundRect(ctx,pad.x,H-34,pad.w,12,6);ctx.fill();ctx.shadowBlur=0;
      /* bola */
      trail.forEach((t,i)=>{ctx.globalAlpha=i/trail.length*.4;ctx.fillStyle='#ffe03c';ctx.beginPath();ctx.arc(t.x,t.y,ball.r*(i/trail.length),0,7);ctx.fill()});ctx.globalAlpha=1;
      ctx.shadowColor='#ffe03c';ctx.shadowBlur=18;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(ball.x,ball.y,ball.r,0,7);ctx.fill();ctx.shadowBlur=0;
      parts=parts.filter(p=>p.l>0);parts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.08;p.l-=.035;ctx.globalAlpha=Math.max(0,p.l);ctx.fillStyle=p.c;ctx.fillRect(p.x-2,p.y-2,4,4)});ctx.globalAlpha=1;
      /* HUD */
      ctx.fillStyle='#fff';ctx.font='600 14px sans-serif';ctx.textBaseline='middle';ctx.textAlign='left';ctx.fillText('Nivel '+level,14,24);
      ctx.textAlign='right';ctx.fillStyle='#ff3c8e';ctx.fillText('♥ '.repeat(lives).trim(),W-14,24);
      if(held){ctx.textAlign='center';ctx.fillStyle='#fff';ctx.fillText('Clic o espacio para lanzar',W/2,H-80)}
      raf=requestAnimationFrame(loop);
    }
    raf=requestAnimationFrame(loop);
    function end(won){
      run=false;playTone(120,.4,'sawtooth');
      const o=document.createElement('div');o.className='fail brk';
      o.innerHTML=`<h3>Sin vidas</h3><p class="fs">Puntaje: ${score}</p><p>Llegaste al nivel ${level}</p><button class="primary-btn">Reintentar</button>`;
      host.appendChild(o);o.querySelector('button').onclick=boot;
    }
    cleanupInner=()=>{run=false;cancelAnimationFrame(raf);ab.abort()};
  }
  boot();
  return ()=>cleanupInner();
}

/* =========================================================
   11) TETRIS (bloques con relieve, sin emojis)
   ========================================================= */
function initTetris(host,api){
  let cleanupInner=()=>{};
  function boot(){
    cleanupInner();
    host.innerHTML=`<canvas id="tc" width="440" height="600"></canvas><div class="tpad"><button data-a="L">Izquierda</button><button data-a="R">Derecha</button><button data-a="U">Girar</button><button data-a="D">Bajar</button><button data-a="H">Caer</button><button data-a="C">Guardar</button></div>`;
    const c=host.querySelector('#tc'),ctx=c.getContext('2d'),ab=new AbortController(),S=ab.signal;
    const COLS=10,ROWS=20,Z=30,PX=320;
    const SH={
      I:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
      O:[[1,1],[1,1]],
      T:[[0,1,0],[1,1,1],[0,0,0]],
      S:[[0,1,1],[1,1,0],[0,0,0]],
      Z:[[1,1,0],[0,1,1],[0,0,0]],
      J:[[1,0,0],[1,1,1],[0,0,0]],
      L:[[0,0,1],[1,1,1],[0,0,0]]
    };
    const CL={I:['#9ee3f0','#3a8fa8'],O:['#f1d27f','#b28a2c'],T:['#c7a2ee','#7446a8'],S:['#98e0b4','#3a8c5c'],Z:['#f0a095','#b24a3c'],J:['#9cc0ee','#3c64a8'],L:['#f2bd88','#b8702c']};
    let best=0;try{best=+localStorage.getItem('ttr_best')||0}catch(e){}
    const grid=Array.from({length:ROWS},()=>Array(COLS).fill(null));
    let bag=[],cur=null,nextK=null,holdK=null,canHold=true,score=0,lines=0,level=1,run=true,paused=false,clear=null,acc=0,raf,T=0,parts=[];
    const rotCW=m=>m[0].map((_,i)=>m.map(r=>r[i]).reverse());
    const take=()=>{if(!bag.length)bag=shuffle(['I','O','T','S','Z','J','L']);return bag.pop()};
    const speed=()=>Math.max(70,800-(level-1)*65);
    function hit(m,x,y){
      for(let r=0;r<m.length;r++)for(let q=0;q<m[r].length;q++){
        if(!m[r][q])continue;const nx=x+q,ny=y+r;
        if(nx<0||nx>=COLS||ny>=ROWS)return true;
        if(ny>=0&&grid[ny][nx])return true;
      }
      return false;
    }
    function spawn(k){
      k=k||nextK||take();nextK=take();
      const m=SH[k].map(r=>r.slice());
      cur={k,m,x:Math.floor((COLS-m[0].length)/2),y:0};
      acc=0;
      if(hit(cur.m,cur.x,cur.y))over();
    }
    function move(dx,dy){
      if(!cur||hit(cur.m,cur.x+dx,cur.y+dy))return false;
      cur.x+=dx;cur.y+=dy;return true;
    }
    function turn(){
      if(!cur||cur.k==='O')return;
      const m=rotCW(cur.m);
      for(const k of [0,-1,1,-2,2]){
        if(!hit(m,cur.x+k,cur.y)){cur.m=m;cur.x+=k;playTone(520,.04,'square',.06);return}
      }
    }
    function ghostY(){let y=cur.y;while(!hit(cur.m,cur.x,y+1))y++;return y}
    function hard(){
      if(!cur)return;const g=ghostY();score+=(g-cur.y)*2;cur.y=g;api.setScore(score);lock();
    }
    function hold(){
      if(!cur||!canHold)return;
      const k=cur.k;canHold=false;playTone(380,.06,'triangle',.08);
      if(holdK){const h=holdK;holdK=k;spawn(h)}else{holdK=k;spawn()}
      canHold=false;
    }
    function lock(){
      const {m,x,y,k}=cur;
      for(let r=0;r<m.length;r++)for(let q=0;q<m[r].length;q++){
        if(!m[r][q])continue;
        if(y+r<0){over();return}
        grid[y+r][x+q]=k;
      }
      cur=null;canHold=true;
      const rows=[];grid.forEach((row,i)=>{if(row.every(v=>v))rows.push(i)});
      if(rows.length){
        clear={rows,t:0};playTone(600+rows.length*120,.18,'triangle',.12);
        rows.forEach(i=>{for(let q=0;q<COLS;q++)for(let n=0;n<3;n++){const a=Math.random()*6.28,v=1+Math.random()*3;parts.push({x:q*Z+Z/2,y:i*Z+Z/2,vx:Math.cos(a)*v,vy:Math.sin(a)*v-1,l:1,c:CL[grid[i][q]][0]})}});
      }else{playTone(200,.05,'square',.08);spawn()}
    }
    function finishClear(){
      const n=clear.rows.length;
      for(let i=grid.length-1;i>=0;i--)if(clear.rows.includes(i))grid.splice(i,1);
      while(grid.length<ROWS)grid.unshift(Array(COLS).fill(null));
      lines+=n;score+=[0,100,300,500,800][n]*level;level=1+Math.floor(lines/10);
      api.setScore(score);api.setInfo('Nivel '+level+' · '+lines+' líneas');
      clear=null;spawn();
    }
    function act(a){
      if(!run||paused||clear)return;
      if(a==='L')move(-1,0);
      else if(a==='R')move(1,0);
      else if(a==='D'){if(move(0,1)){score++;api.setScore(score)}acc=0}
      else if(a==='U')turn();
      else if(a==='H')hard();
      else if(a==='C')hold();
    }
    addEventListener('keydown',e=>{
      const m={ArrowLeft:'L',a:'L',ArrowRight:'R',d:'R',ArrowDown:'D',s:'D',ArrowUp:'U',w:'U',' ':'H',c:'C',Shift:'C'}[e.key];
      if(e.key==='p'||e.key==='P'){paused=!paused;return}
      if(!m)return;e.preventDefault();act(m);
    },{signal:S});
    let rep=null;
    const stop=()=>{clearInterval(rep);rep=null};
    host.querySelectorAll('.tpad button').forEach(b=>{
      b.addEventListener('pointerdown',e=>{
        e.preventDefault();const a=b.dataset.a;act(a);stop();
        if('LRD'.includes(a))rep=setInterval(()=>act(a),110);
      },{signal:S});
      ['pointerup','pointerleave','pointercancel'].forEach(ev=>b.addEventListener(ev,stop,{signal:S}));
    });
    /* ---------- dibujo ---------- */
    function block(x,y,s,k,al=1){
      const [lt,dk]=CL[k];ctx.save();ctx.globalAlpha=al;
      const g=ctx.createLinearGradient(x,y,x+s,y+s);g.addColorStop(0,lt);g.addColorStop(1,dk);
      ctx.fillStyle=g;ctx.fillRect(x+1,y+1,s-2,s-2);
      ctx.fillStyle='rgba(255,255,255,.38)';ctx.fillRect(x+1,y+1,s-2,3);ctx.fillRect(x+1,y+1,3,s-2);
      ctx.fillStyle='rgba(0,0,0,.28)';ctx.fillRect(x+1,y+s-4,s-2,3);ctx.fillRect(x+s-4,y+1,3,s-2);
      const gl=ctx.createRadialGradient(x+s*.3,y+s*.28,1,x+s*.3,y+s*.28,s*.55);gl.addColorStop(0,'rgba(255,255,255,.45)');gl.addColorStop(1,'rgba(255,255,255,0)');
      ctx.fillStyle=gl;ctx.fillRect(x+1,y+1,s-2,s-2);
      ctx.restore();
    }
    function mini(k,cx,cy){
      if(!k)return;const m=SH[k],s=18,w=m[0].length*s,h=m.length*s;
      for(let r=0;r<m.length;r++)for(let q=0;q<m[r].length;q++)if(m[r][q])block(cx-w/2+q*s,cy-h/2+r*s,s,k);
    }
    function label(t,y){ctx.fillStyle='#a9b3b8';ctx.font='600 13px sans-serif';ctx.textAlign='center';ctx.fillText(t.toUpperCase(),PX+60,y)}
    function value(t,y){ctx.fillStyle='#ece6d9';ctx.font='600 24px sans-serif';ctx.textAlign='center';ctx.fillText(t,PX+60,y)}
    function draw(dt){
      T+=dt;
      ctx.clearRect(0,0,c.width,c.height);
      ctx.fillStyle='#161d23';ctx.fillRect(0,0,c.width,c.height);
      ctx.fillStyle='#1c252c';ctx.fillRect(0,0,COLS*Z,ROWS*Z);
      ctx.strokeStyle='rgba(236,230,217,.05)';ctx.lineWidth=1;
      for(let i=1;i<COLS;i++){ctx.beginPath();ctx.moveTo(i*Z+.5,0);ctx.lineTo(i*Z+.5,ROWS*Z);ctx.stroke()}
      for(let i=1;i<ROWS;i++){ctx.beginPath();ctx.moveTo(0,i*Z+.5);ctx.lineTo(COLS*Z,i*Z+.5);ctx.stroke()}
      ctx.strokeStyle='rgba(236,230,217,.18)';ctx.lineWidth=2;ctx.strokeRect(1,1,COLS*Z-2,ROWS*Z-2);
      for(let r=0;r<ROWS;r++)for(let q=0;q<COLS;q++)if(grid[r][q])block(q*Z,r*Z,Z,grid[r][q]);
      if(clear){
        const k=Math.sin(clear.t/240*Math.PI);
        ctx.fillStyle=`rgba(255,255,255,${.25+.6*k})`;
        clear.rows.forEach(r=>ctx.fillRect(0,r*Z,COLS*Z,Z));
      }
      if(cur){
        const gy=ghostY();
        for(let r=0;r<cur.m.length;r++)for(let q=0;q<cur.m[r].length;q++)if(cur.m[r][q]){
          const gx=(cur.x+q)*Z,gyy=(gy+r)*Z;
          ctx.strokeStyle=CL[cur.k][0];ctx.globalAlpha=.45;ctx.lineWidth=2;ctx.strokeRect(gx+3,gyy+3,Z-6,Z-6);ctx.globalAlpha=1;
        }
        for(let r=0;r<cur.m.length;r++)for(let q=0;q<cur.m[r].length;q++)if(cur.m[r][q]&&cur.y+r>=0)block((cur.x+q)*Z,(cur.y+r)*Z,Z,cur.k);
      }
      parts=parts.filter(p=>p.l>0);
      parts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.15;p.l-=.03;ctx.globalAlpha=Math.max(0,p.l);ctx.fillStyle=p.c;ctx.fillRect(p.x-2,p.y-2,4,4)});
      ctx.globalAlpha=1;
      /* panel lateral */
      label('Siguiente',26);mini(nextK,PX+60,72);
      label('Guardada',130);if(holdK){ctx.globalAlpha=canHold?1:.4;mini(holdK,PX+60,176);ctx.globalAlpha=1}
      label('Nivel',250);value(level,278);
      label('Líneas',326);value(lines,354);
      label('Récord',402);value(Math.max(best,score),430);
      ctx.fillStyle='#7f8a90';ctx.font='12px sans-serif';ctx.textAlign='center';
      ['Girar: flecha arriba','Caer: espacio','Guardar: C','Pausa: P'].forEach((t,i)=>ctx.fillText(t,PX+60,500+i*20));
      if(paused){
        ctx.fillStyle='rgba(10,14,18,.72)';ctx.fillRect(0,0,COLS*Z,ROWS*Z);
        ctx.fillStyle='#ece6d9';ctx.font='600 30px sans-serif';ctx.textAlign='center';ctx.fillText('Pausa',COLS*Z/2,ROWS*Z/2);
        ctx.font='14px sans-serif';ctx.fillText('Pulsa P para seguir',COLS*Z/2,ROWS*Z/2+28);
      }
    }
    let last=performance.now();
    function loop(t){
      const dt=Math.min(50,t-last);last=t;
      if(run&&!paused){
        if(clear){clear.t+=dt;if(clear.t>=240)finishClear()}
        else if(cur){acc+=dt;if(acc>=speed()){acc=0;if(!move(0,1))lock()}}
      }
      draw(dt);
      if(run)raf=requestAnimationFrame(loop);
    }
    function over(){
      run=false;stop();playTone(120,.5,'sawtooth');
      const nb=score>best;if(nb){best=score;try{localStorage.setItem('ttr_best',score)}catch(e){}}
      const o=document.createElement('div');o.className='fail ttr';
      o.innerHTML=`<h3>Sin espacio</h3><p class="fs">Puntaje: ${score}</p><p>${lines} líneas · nivel ${level}</p><p>${nb?'¡Nuevo récord!':'Récord: '+best}</p><button class="primary-btn">Reintentar</button>`;
      host.appendChild(o);o.querySelector('button').onclick=boot;
    }
    api.setScore(0);api.setInfo('Nivel 1 · 0 líneas');
    spawn();
    raf=requestAnimationFrame(loop);
    cleanupInner=()=>{run=false;stop();cancelAnimationFrame(raf);ab.abort()};
  }
  boot();
  return ()=>cleanupInner();
}

/* =========================================================
   ECUACIONES (versión ligera)
   ========================================================= */
const ECU=(()=>{
  const ri=(a,b)=>Math.floor(Math.random()*(b-a+1))+a,
    rz=(a,b)=>{let n;do n=ri(a,b);while(!n);return n},
    pk=a=>a[ri(0,a.length-1)],
    sg=n=>n>=0?'+ '+n:'- '+Math.abs(n),
    op=n=>n>=0?'resta':'suma';
  const mk=(s,a,v,st,o,w)=>({s,a,v,st,o:!!o,w:!!w});

  /* ----- Fácil ----- */
  function gA(){const a=ri(2,9),x=ri(-12,12),b=rz(-12,12),c=a*x+b;
    return mk(`${a}x ${sg(b)} = ${c}`,[x],['x'],[
      `Deja sola la parte de x: ${op(b)} ${Math.abs(b)} en ambos lados. Queda ${a}x = ${c-b}.`,
      `Divide ambos lados entre ${a}: x = ${c-b} ÷ ${a} = ${x}.`,
      `Comprueba: ${a}(${x}) ${sg(b)} = ${c}. Correcto.`]);}
  function gD(){const a=ri(2,9),k=ri(-9,9),x=a*k,b=rz(-12,12),c=k+b;
    return mk(`x/${a} ${sg(b)} = ${c}`,[x],['x'],[
      `Quita el ${b}: ${op(b)} ${Math.abs(b)} en ambos lados. Queda x/${a} = ${c-b}.`,
      `Multiplica ambos lados por ${a}: x = ${c-b} × ${a} = ${x}.`,
      `Comprueba: ${x}/${a} ${sg(b)} = ${k} ${sg(b)} = ${c}. Correcto.`]);}
  function gW(){
    const n=ri(3,60),a=ri(2,9),p=ri(5,40),b=ri(3,20),d=ri(2,25),y=ri(8,40),v=ri(4,15)*10,h=ri(2,12);
    return pk([
      ()=>mk(`La suma de dos números consecutivos es ${2*n+1}. ¿Cuál es el menor?`,[n],['x'],[
        `Si el menor es x, el siguiente es x + 1: x + (x + 1) = ${2*n+1}.`,
        `Simplifica: 2x + 1 = ${2*n+1}, entonces 2x = ${2*n}.`,`Despeja: x = ${n}.`],0,1),
      ()=>mk(`Compras ${a} cuadernos iguales y una pluma de $${b}. Pagas $${a*p+b} en total. ¿Cuánto cuesta cada cuaderno?`,[p],['x'],[
        `x es el precio de un cuaderno: ${a}x + ${b} = ${a*p+b}.`,
        `Resta ${b} en ambos lados: ${a}x = ${a*p}.`,`Divide entre ${a}: x = ${p}.`],0,1),
      ()=>mk(`Luis tiene ${d} años más que su prima y entre los dos suman ${2*y+d} años. ¿Cuántos años tiene la prima?`,[y],['x'],[
        `x es la edad de la prima y Luis tiene x + ${d}: x + (x + ${d}) = ${2*y+d}.`,
        `Simplifica: 2x + ${d} = ${2*y+d}, entonces 2x = ${2*y}.`,`Despeja: x = ${y}.`],0,1),
      ()=>mk(`Un auto viaja a ${v} km/h y recorre ${v*h} km. ¿Cuántas horas viajó?`,[h],['x'],[
        `Distancia = velocidad × tiempo: ${v}x = ${v*h}.`,
        `Divide entre ${v}: x = ${v*h} ÷ ${v} = ${h}.`],0,1)
    ])();}

  /* ----- Medio ----- */
  function gB(){const a=ri(2,12);let c=ri(2,12);while(c===a)c=ri(2,12);
    let x,b,d;do{x=ri(-12,12);b=rz(-12,12);d=a*x+b-c*x}while(d===0);
    return mk(`${a}x ${sg(b)} = ${c}x ${sg(d)}`,[x],['x'],[
      `Junta las x: resta ${c}x en ambos lados. Queda ${a-c}x ${sg(b)} = ${d}.`,
      `Pasa el número: ${op(b)} ${Math.abs(b)} en ambos lados. Queda ${a-c}x = ${d-b}.`,
      `Divide entre ${a-c}: x = ${d-b} ÷ ${a-c} = ${x}.`]);}
  function gC(){const a=ri(2,9),x=ri(-12,12),b=rz(-12,12),c=a*(x+b);
    return mk(`${a}(x ${sg(b)}) = ${c}`,[x],['x'],[
      `Distribuye el ${a} en el paréntesis: ${a}x ${sg(a*b)} = ${c}.`,
      `${op(a*b)[0].toUpperCase()+op(a*b).slice(1)} ${Math.abs(a*b)} en ambos lados: ${a}x = ${c-a*b}.`,
      `Divide entre ${a}: x = ${c-a*b} ÷ ${a} = ${x}.`]);}
  function gQ(){const a=ri(2,9),b=rz(-12,12),c=ri(-9,12),x=a*c-b;
    return mk(`(x ${sg(b)})/${a} = ${c}`,[x],['x'],[
      `Quita la división: multiplica ambos lados por ${a}. Queda x ${sg(b)} = ${a*c}.`,
      `${op(b)[0].toUpperCase()+op(b).slice(1)} ${Math.abs(b)} en ambos lados: x = ${a*c} ${sg(-b)} = ${x}.`,
      `Comprueba: (${x} ${sg(b)})/${a} = ${a*c}/${a} = ${c}. Correcto.`]);}
  function gU(){const b=rz(-15,15),c=ri(1,12),x=c*c-b;
    return mk(`√(x ${sg(b)}) = ${c}`,[x],['x'],[
      `Elimina la raíz elevando al cuadrado ambos lados: x ${sg(b)} = ${c*c}.`,
      `Despeja: x = ${c*c} ${sg(-b)} = ${x}.`,
      `Con raíces siempre se comprueba: √(${x} ${sg(b)}) = √${c*c} = ${c}. Correcto.`]);}

  /* ----- Difícil ----- */
  function gP(){const a=ri(2,9);let c=ri(1,9);while(c===a)c=ri(1,9);
    let x,b,e;do{x=ri(-9,9);b=rz(-9,9);e=a*(x+b)-c*x}while(e===0);
    return mk(`${a}(x ${sg(b)}) = ${c}x ${sg(e)}`,[x],['x'],[
      `Distribuye: ${a}x ${sg(a*b)} = ${c}x ${sg(e)}.`,
      `Junta las x: resta ${c}x en ambos lados. Queda ${a-c}x ${sg(a*b)} = ${e}.`,
      `Pasa el número: ${a-c}x = ${e-a*b}.`,
      `Divide entre ${a-c}: x = ${e-a*b} ÷ ${a-c} = ${x}.`]);}
  function gT(){const b=rz(-12,12),c=ri(1,12);
    return mk(`|x ${sg(b)}| = ${c}`,[-b-c,-b+c],['x1','x2'],[
      `|A| = ${c} significa A = ${c} o A = -${c}. Aquí A = x ${sg(b)}.`,
      `Caso 1: x ${sg(b)} = ${c}, entonces x = ${-b+c}.`,
      `Caso 2: x ${sg(b)} = -${c}, entonces x = ${-b-c}.`]);}
  function gE(){let r1,r2;do{r1=rz(-9,9);r2=rz(-9,9)}while(r1===r2||r1+r2===0);
    const bc=-(r1+r2),c=r1*r2;
    return mk(`x² ${sg(bc)}x ${sg(c)} = 0`,[r1,r2].sort((p,q)=>p-q),['x1','x2'],[
      `Busca dos números que multiplicados den ${c} y sumados den ${bc}: ${-r1} y ${-r2}.`,
      `Factoriza: (x ${sg(-r1)})(x ${sg(-r2)}) = 0.`,
      `Si un producto es 0, algún factor es 0: x = ${r1} o x = ${r2}.`]);}
  function gS(){const a=ri(2,5);let r1,r2;do{r1=rz(-6,6);r2=rz(-6,6)}while(r1===r2||r1+r2===0);
    const B=-a*(r1+r2),C=a*r1*r2,D=B*B-4*a*C,q=Math.abs(a*(r1-r2));
    return mk(`${a}x² ${sg(B)}x ${sg(C)} = 0`,[r1,r2].sort((p,q2)=>p-q2),['x1','x2'],[
      `Identifica a = ${a}, b = ${B}, c = ${C} y usa x = (-b ± √(b² - 4ac)) / 2a.`,
      `Discriminante: (${B})² - 4(${a})(${C}) = ${D}, y √${D} = ${q}.`,
      `x = (${-B} ± ${q}) / ${2*a}, que da x = ${Math.min(r1,r2)} y x = ${Math.max(r1,r2)}.`]);}
  function gG(){const h=rz(-8,8),k=rz(-8,8),r=ri(2,9);
    return mk(`Circunferencia: (x ${sg(-h)})² + (y ${sg(-k)})² = ${r*r}\nEscribe el centro (h, k) y el radio r.`,[h,k,r],['h','k','r'],[
      `La forma (x - h)² + (y - k)² = r² tiene centro (h, k) y radio r.`,
      `Los signos dentro del paréntesis se invierten: h = ${h} y k = ${k}.`,
      `r² = ${r*r}, entonces r = ${r}.`],1);}
  function gL(){const m=rz(-5,5),x1=ri(-5,4),x2=x1+ri(1,4),b=rz(-9,9),y1=m*x1+b,y2=m*x2+b;
    return mk(`Recta que pasa por A(${x1}, ${y1}) y B(${x2}, ${y2})\nEscribe m (pendiente) y b de y = mx + b.`,[m,b],['m','b'],[
      `Pendiente: m = (${y2} - (${y1})) / (${x2} - (${x1})) = ${y2-y1} / ${x2-x1} = ${m}.`,
      `Con el punto A: ${y1} = ${m}(${x1}) + b, entonces b = ${y1} - (${m*x1}) = ${b}.`,
      `La recta es y = ${m}x ${sg(b)}.`],1);}

  const LV={1:[gA,gD,gW],2:[gB,gC,gQ,gU],3:[gP,gT,gE,gS,gG,gL]};
  function num(s){s=s.trim().replace(/−/g,'-');const m=s.match(/^(-?\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/);return m?m[1]/m[2]:parseFloat(s)}
  function parse(v){return v.replace(/[()]/g,'').split(/[,;]/).map(num).filter(n=>!isNaN(n))}
  function check(p,v){
    const c=(a,b)=>Math.abs(a-b)<0.01;
    if(p.length!==v.a.length)return false;
    return v.o?v.a.every((a,i)=>c(a,p[i])):v.a.every(a=>p.some(q=>c(a,q)));
  }
  return{gen:lv=>pk(LV[lv])(),parse,check};
})();

function initEcuaciones(host,api){
  const timer=makeTimer(),N=10;
  const LV=[
    ['Fácil','Un paso, fracciones simples y problemas de palabras'],
    ['Medio','Paréntesis, x en ambos lados, fracciones y raíces'],
    ['Difícil','Cuadráticas, valor absoluto, circunferencia y recta']];
  function menu(){
    timer.clearAll();
    api.setScore(0);api.setInfo('Elige un nivel para empezar');
    host.innerHTML=`<div class="eq-box eq-menu"><h3>Elige tu nivel</h3>${LV.map((l,i)=>`<button class="btn ghost eq-lv" data-lv="${i+1}">${l[0]}<small>${l[1]}</small></button>`).join('')}</div>`;
    host.querySelectorAll('.eq-lv').forEach(b=>b.onclick=()=>play(+b.dataset.lv));
  }
  function play(lv){
    timer.clearAll();
    let n=0,score=0,cur,failed,seen,locked;
    api.setScore(0);
    host.innerHTML=`<div class="eq-box" id="eqBox">
      <div class="eq-prob" id="eqP"></div>
      <label class="muted" id="eqL" for="eqI"></label>
      <input type="text" class="eq-in" id="eqI" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false">
      <div class="eq-keys"><button data-k="-">−</button><button data-k=",">,</button><button data-k="/">/</button><button data-k=".">.</button><button data-k="<">Borrar</button></div>
      <div class="eq-act"><button class="btn" id="eqC">Comprobar</button><button class="btn ghost" id="eqS">Ver procedimiento</button></div>
      <div id="eqR"></div><div id="eqT" class="eq-steps"></div></div>`;
    const $=id=>host.querySelector('#'+id),P=$('eqP'),L=$('eqL'),I=$('eqI'),R=$('eqR'),T=$('eqT'),box=$('eqBox');
    host.querySelectorAll('.eq-keys button').forEach(b=>b.onclick=()=>{const k=b.dataset.k;I.value=k==='<'?I.value.slice(0,-1):I.value+k;I.focus()});
    I.addEventListener('keydown',e=>{if(e.key==='Enter')comprobar()});
    $('eqC').onclick=comprobar;$('eqS').onclick=pasos;

    function next(){
      timer.clearAll();
      if(n>=N)return fin();
      cur=ECU.gen(lv);n++;failed=false;seen=false;locked=false;
      api.setInfo(`Pregunta ${n} de ${N} · suma si aciertas a la primera sin ver el procedimiento`);
      P.textContent=cur.s;
      L.textContent=cur.v.length>1
        ?(cur.o?`Escribe ${cur.v.join(', ')} en ese orden, separados por coma`:`Escribe las ${cur.v.length} soluciones separadas por coma, en cualquier orden`)
        :`Tu respuesta (${cur.w?'número':'x ='})`;
      I.value='';I.disabled=false;R.innerHTML='';T.innerHTML='';
    }
    function comprobar(){
      if(locked)return;
      const v=I.value.trim();if(!v)return;
      if(ECU.check(ECU.parse(v),cur)){
        locked=true;I.disabled=true;
        const pt=!failed&&!seen;
        if(pt){score++;api.setScore(score)}
        playTone(660,.12);timer.setTimeout(()=>playTone(880,.16),110);
        R.innerHTML=`<div class="eq-msg ok">${pt?'¡Correcto! +1 punto.':'¡Correcto! Esta vez no suma punto.'}</div>`;
        timer.setTimeout(next,1300);
      }else{
        failed=true;playTone(160,.25,'sawtooth');
        box.classList.remove('shake');void box.offsetWidth;box.classList.add('shake');
        R.innerHTML=`<div class="eq-msg no">Todavía no es correcto. Inténtalo otra vez o mira el procedimiento.</div>`;
      }
    }
    function pasos(){
      if(locked||seen&&T.innerHTML)return;
      seen=true;
      const res=cur.v.map((nm,i)=>`${nm} = ${cur.a[i]}`).join(', ');
      T.innerHTML=`<ol>${cur.st.map((s,i)=>`<li style="animation-delay:${i*.1}s">${s}</li>`).join('')}</ol><div class="eq-msg ok">Respuesta: <b>${res}</b></div><button class="btn" id="eqN">Siguiente problema</button>`;
      T.querySelector('#eqN').onclick=next;
      T.scrollIntoView({behavior:'smooth',block:'nearest'});
    }
    function fin(){
      const o=document.createElement('div');o.className='eq-fin';
      o.innerHTML=`<h3>¡Ronda terminada!</h3><div class="big">${score}</div><p>${score} de ${N} correctas a la primera</p><div><button class="btn" id="eqA">Jugar otra vez</button><button class="btn ghost" id="eqM">Cambiar nivel</button></div>`;
      host.appendChild(o);
      playTone(score>=7?880:330,.3);
      if(score>=7)Sala.confetti();
      o.querySelector('#eqA').onclick=()=>play(lv);
      o.querySelector('#eqM').onclick=menu;
    }
    next();
  }
  menu();
  return()=>timer.clearAll();
}

/* ===== Lanzador: cada página trae data-game ===== */
const IMG=n=>`<img class="gi" src="${RAIZ}img/${n}.svg" alt="">`;
const GAMES={
 piano:{name:'Piano Tiles',icon:IMG('piano'),accent:'#f55c7a',tagline:'No dejes pasar ninguna nota',init:initPiano,how:['Toca el carril cuando el bloque llegue a la línea dorada.','Si tocas un carril vacío, pierdes.','Cada vez va más rápido.']},
 flappy:{name:'Pájaro Volador',icon:IMG('pajaro'),accent:'#f6ac69',tagline:'Atraviesa las columnas sin chocar',init:initFlappy,how:['Clic o barra espaciadora para aletear.','Pasa por el hueco entre las columnas.','No toques las columnas ni el suelo.']},
 '2048':{name:'2048',icon:IMG('2048'),accent:'#f6ac69',tagline:'Une los números hasta llegar a 2048',init:init2048,how:['Usa las flechas del teclado para deslizar las fichas.','Dos números iguales se unen y suman.','Llega a 2048 sin quedarte sin movimientos.']},
 simon:{name:'Simón Dice',icon:IMG('simon'),accent:'#f55c7a',tagline:'Memoriza y repite la secuencia',init:initSimon,how:['Mira con atención la secuencia de colores.','Repítela tocando los botones en el mismo orden.','Cada ronda añade un color más.']},
 mole:{name:'Golpea al Topo',icon:IMG('topo'),accent:'#f6ac69',tagline:'Reflejos rápidos contra reloj',init:initMole,how:['Golpea a los topos cuando asomen.','Tienes 30 segundos.','Cada topo que golpees suma puntos.']},
 snake:{name:'Serpiente',icon:IMG('serpiente'),accent:'#f6ac69',tagline:'Crece sin chocar contigo mismo',init:initSnake,how:['Muévete con las flechas del teclado.','Come para crecer.','Evita chocarte contigo mismo.']},
 tetris:{name:'Tetris',icon:IMG('tetris'),accent:'#f6ac69',tagline:'Encaja las piezas y completa líneas',init:initTetris,how:['Flechas izquierda y derecha mueven la pieza; flecha arriba la gira.','Espacio la deja caer de golpe; C la guarda para después.','Cada línea completa desaparece y suma puntos.']},
 ecuaciones:{name:'Ecuaciones',icon:IMG('ecuaciones'),accent:'#f55c7a',tagline:'Despeja la incógnita paso a paso',init:initEcuaciones,how:['Elige un nivel: fácil, medio o difícil.','Resuelve 10 problemas y escribe tu respuesta (varias soluciones se separan con coma).','Suma punto si aciertas a la primera sin ver el procedimiento.']},
 breakout:{name:'Rompeladrillos',icon:IMG('rompeladrillos'),accent:'#f57c73',tagline:'No dejes caer la bola',init:initBreakout,how:['Mueve el mouse o usa ← → para mover la paleta.','Rompe los ladrillos con la bola.','No dejes que la bola caiga.']}
};
let activeCleanup=null;
function launch(){
  const g=GAMES[document.body.dataset.game];if(!g)return;
  const $=id=>document.getElementById(id),host=$('gameHost'),pill=$('scorePill');
  document.title=g.name;$('gameTitle').innerHTML=g.icon+'<span>'+g.name+'</span>';
  document.documentElement.style.setProperty('--accent',g.accent);
  const api={setScore:v=>{pill.textContent=v},setInfo:t=>{$('gameInfo').textContent=t}};
  const start=()=>{Sala.cancel();if(activeCleanup)activeCleanup();host.innerHTML='';pill.textContent='0';$('gameInfo').textContent='';activeCleanup=g.init(host,api)||(()=>{})};
  const ask=()=>Sala.intro({icon:g.icon,title:g.name,sub:g.tagline,tips:g.how,accent:g.accent,onBack:()=>{location.href=RAIZ+'index.html'},onStart:start});
  $('replay').onclick=()=>{Sala.cancel();if(activeCleanup)activeCleanup();activeCleanup=null;host.innerHTML='';ask()};
  ask();
}
document.addEventListener('DOMContentLoaded',launch);

const RAIZ=(()=>{try{return new URL('../',document.currentScript.src).href}catch(e){return ''}})();   // raíz del sitio, sin importar desde qué carpeta se cargue
const Sala=(()=>{
const $=(s,r=document)=>r.querySelector(s),mk=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e};
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const ready=f=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',f):f();
let tm=[];const later=(f,ms)=>{const t=setTimeout(f,ms);tm.push(t);return t};
const beep=f=>{try{(window.tone||window.playTone)(f,.1,'sine',.08)}catch(e){}};
const bump=el=>{el.classList.remove('bump');void el.offsetWidth;el.classList.add('bump')};

/* ---------- Emojis -> imágenes ----------
   Cualquier emoji conocido que aparezca en la página (aunque se escriba por código)
   se cambia por una ilustración SVG propia; las banderas, por su imagen. */
const GI={'🃏':'memorama','🎹':'piano','🐦':'pajaro','🎵':'simon','🐹':'topo','🐍':'serpiente','🧱':'rompeladrillos','🔤':'scrabble','🪢':'ahorcado','🔎':'sopa','🧩':'acertijos'};
const ii=(p,c='')=>`<svg class="ii ${c}" viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
const UI={
 '💡':ii('<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.500 10.900c.6.5 1 1.200 1 2.100h5c0-.9.4-1.600 1-2.100A6 6 0 0 0 12 3z"/>'),
 '🎲':ii('<rect x="4" y="4" width="16" height="16" rx="3.500"/><g fill="currentColor" stroke="none"><circle cx="9" cy="9" r="1.200"/><circle cx="15" cy="9" r="1.200"/><circle cx="12" cy="12" r="1.200"/><circle cx="9" cy="15" r="1.200"/><circle cx="15" cy="15" r="1.200"/></g>'),
 '🎉':ii('<path d="M8 4h8v5a4 4 0 0 1-8 0V4zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8M9.500 17h5"/>','ic-star'),
 '⭐':ii('<path d="M12 3l2.700 5.600 6.100.9-4.400 4.300 1 6.100L12 17l-5.400 2.900 1-6.100L3.200 9.500l6.100-.9z"/>','f ic-star'),
 '☆':ii('<path d="M12 3l2.700 5.600 6.100.9-4.400 4.300 1 6.100L12 17l-5.400 2.900 1-6.100L3.200 9.500l6.100-.9z"/>','ic-off'),
 '❤':ii('<path d="M12 20s-7-4.400-7-10a4 4 0 0 1 7-2.500A4 4 0 0 1 19 10c0 5.600-7 10-7 10z"/>','f ic-heart'),
 '🖤':ii('<path d="M12 20s-7-4.400-7-10a4 4 0 0 1 7-2.500A4 4 0 0 1 19 10c0 5.600-7 10-7 10z"/>','ic-off'),
 '🔥':ii('<path d="M12 3c1 4 5 5.500 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z"/>','f ic-flame'),
 '🌎':ii('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>'),
 '🔬':ii('<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.800 3h10.400a2 2 0 0 0 1.800-3l-5-9V3M7.500 15h9"/>'),
 '📅':ii('<rect x="4" y="5" width="16" height="15" rx="2.500"/><path d="M4 10h16M9 3v4M15 3v4"/>'),
 '🔢':ii('<rect x="5" y="3" width="14" height="18" rx="2.500"/><path d="M8 7h8M8 12h2M12 12h2M8 16h2M12 16h2"/>'),
 '⏱':ii('<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 3h6"/>'),
 '🔀':ii('<path d="M4 7h3c4 0 6 10 10 10h3M4 17h3c1.500 0 2.600-1 3.600-2.300M14 9c1-1.300 2-2 3-2h3M17 4l3 3-3 3M17 14l3 3-3 3"/>')
};
const SRC='[\\u{1F1E6}-\\u{1F1FF}]{2}|(?:'+[...Object.keys(GI),...Object.keys(UI)].join('|')+')\\uFE0F?';
const RX=new RegExp(SRC,'gu'),TEST=new RegExp(SRC,'u');
const rep=m=>{
 const f=[...m],a=f[0].codePointAt(0);
 if(f.length===2&&a>=0x1F1E6&&a<=0x1F1FF&&f[1].codePointAt(0)>=0x1F1E6){const c=f.map(x=>String.fromCharCode(x.codePointAt(0)-0x1F1E6+97)).join('');return `<img class="flag" alt="${c.toUpperCase()}" src="https://flagcdn.com/w160/${c}.png">`}
 return GI[f[0]]?`<img class="gi" alt="" src="${RAIZ}img/${GI[f[0]]}.svg">`:UI[f[0]];
};
function conv(t){
 const s=t.nodeValue;if(!TEST.test(s))return;
 const p=t.parentNode;if(!p||/^(SCRIPT|STYLE|TEXTAREA|TITLE|OPTION)$/.test(p.nodeName)||(p.closest&&p.closest('svg')))return;
 const tp=document.createElement('template');
 tp.innerHTML=s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])).replace(RX,rep);
 t.replaceWith(tp.content);
}
function scan(n){
 if(n.nodeType===3)return conv(n);
 if(n.nodeType!==1)return;
 const w=document.createTreeWalker(n,4),a=[];while(w.nextNode())a.push(w.currentNode);a.forEach(conv);
}
ready(()=>{
 scan(document.body);
 new MutationObserver(ms=>ms.forEach(r=>{r.addedNodes.forEach(scan);if(r.type==='characterData')conv(r.target)})).observe(document.body,{childList:true,subtree:true,characterData:true});
});

ready(()=>{
 document.body.prepend(mk('div','blobs','<i></i><i></i><i></i>'));
 const p=$('#score')||$('#scorePill');
 if(p)new MutationObserver(()=>bump(p)).observe(p,{childList:true,characterData:true,subtree:true});
 let q=0;
 new MutationObserver(()=>{if(!q)q=requestAnimationFrame(()=>{q=0;fx()})}).observe(document.body,{childList:true,subtree:true,characterData:true});
});
addEventListener('pageshow',()=>document.body.classList.remove('leave'));

document.addEventListener('click',e=>{
 const a=e.target.closest('a[href]');
 if(!a||a.target||e.metaKey||e.ctrlKey||!/\.html$/.test(a.getAttribute('href')))return;
 e.preventDefault();document.body.classList.add('leave');
 setTimeout(()=>location.href=a.href,reduce?0:420);
});
document.addEventListener('pointerdown',e=>{
 const b=e.target.closest('.btn,.primary-btn,.cat,.chip,.opt,.seg button,.back,.row,.tile');
 if(!b||b.disabled)return;
 const r=b.getBoundingClientRect(),s=Math.max(r.width,r.height)*2,d=mk('span','rip');
 d.style.cssText=`width:${s}px;height:${s}px;left:${e.clientX-r.left-s/2}px;top:${e.clientY-r.top-s/2}px`;
 b.appendChild(d);setTimeout(()=>d.remove(),700);
});
document.addEventListener('animationend',e=>{if(e.target.classList.contains('deal'))e.target.classList.remove('deal')});

function fx(){
 const big=$('.res .big:not([data-c])');
 if(big){
  big.dataset.c=1;const to=+big.textContent||0,t0=performance.now();
  (function s(t){const p=Math.min(1,(t-t0)/900);big.textContent=Math.round(to*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(s)})(t0);
  const h=$('.res h2');
  if(to>0&&!(h&&/sin vidas/.test(h.textContent)))later(()=>confetti(),350);
 }
 document.querySelectorAll('.card:not([data-d])').forEach((c,i)=>{c.dataset.d=1;c.style.animationDelay=i*45+'ms';c.classList.add('deal')});
 document.querySelectorAll('#ms,#gameInfo').forEach(e=>{
  if(/Completado/.test(e.textContent)){if(e.dataset.w!==e.textContent){e.dataset.w=e.textContent;confetti()}}else delete e.dataset.w;
 });
}

function confetti(n=110){
 if(reduce)return;
 const c=mk('canvas');c.style.cssText='position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:95';
 const W=c.width=innerWidth,H=c.height=innerHeight,x=c.getContext('2d'),col=['#e8b865','#7fc4a3','#d9826f','#7fb0d3','#ece6d9'];
 document.body.appendChild(c);
 const ps=Array.from({length:n},()=>({x:W/2+(Math.random()-.5)*W*.3,y:H*.62,vx:(Math.random()-.5)*14,vy:-Math.random()*15-6,r:Math.random()*5+3,a:Math.random()*6,va:(Math.random()-.5)*.4,c:col[Math.random()*5|0]}));
 let f=0;
 (function s(){
  x.clearRect(0,0,W,H);
  ps.forEach(p=>{p.vy+=.35;p.vx*=.99;p.x+=p.vx;p.y+=p.vy;p.a+=p.va;x.save();x.translate(p.x,p.y);x.rotate(p.a);x.globalAlpha=Math.max(0,1-f/110);x.fillStyle=p.c;x.fillRect(-p.r,-p.r/2,p.r*2,p.r);x.restore()});
  if(++f<110)requestAnimationFrame(s);else c.remove();
 })();
}

function countdown(done,steps=['3','2','1','¡Va!']){
 const o=mk('div','cd');document.body.appendChild(o);let i=0;
 (function step(){
  if(i>=steps.length){o.classList.add('out');later(()=>{o.remove();done()},240);return}
  o.innerHTML=`<b>${steps[i]}</b>`;beep(i<steps.length-1?440:660);i++;
  later(step,reduce?250:650);
 })();
}

function intro(o){
 const s=mk('div','sheet');
 s.innerHTML=`<div style="--accent:${o.accent}"><span class="ico">${o.icon}</span><h2>${o.title}</h2><p>${o.sub}</p><ul>${o.tips.map(t=>`<li>${t}</li>`).join('')}</ul><button class="btn" id="sGo" style="--accent:${o.accent}">¡Estoy listo!</button><button class="btn ghost" id="sBk">Volver</button></div>`;
 document.body.appendChild(s);
 $('#sGo',s).onclick=()=>{s.classList.add('out');later(()=>{s.remove();countdown(o.onStart)},260)};
 $('#sBk',s).onclick=()=>{s.remove();o.onBack&&o.onBack()};
 $('#sGo',s).focus();
}
function cancel(){tm.forEach(clearTimeout);tm=[];document.querySelectorAll('.cd,.sheet').forEach(e=>e.remove())}
return{countdown,intro,confetti,cancel,bump};
})();

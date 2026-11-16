/* =====================================================================
   trivia-banderas.js · banderas dibujadas en SVG (viewBox 0 0 90 60)
   BANDERAS_PAISES: [id, nombre, capital, continente, dificultad(1-3), grupo]
   bandera(id) → <svg> listo para insertar
   ===================================================================== */
const _bf=(()=>{
  const n=x=>Math.round(x*100)/100;
  const H=(c,w)=>{w=w||c.map(()=>1);const t=w.reduce((a,b)=>a+b,0);let y=0;return c.map((col,i)=>{const h=60*w[i]/t,r=`<rect y="${n(y)}" width="90" height="${n(h+.35)}" fill="${col}"/>`;y+=h;return r}).join('')};
  const V=(c,w)=>{w=w||c.map(()=>1);const t=w.reduce((a,b)=>a+b,0);let x=0;return c.map((col,i)=>{const ww=90*w[i]/t,r=`<rect x="${n(x)}" width="${n(ww+.35)}" height="60" fill="${col}"/>`;x+=ww;return r}).join('')};
  const star=(cx,cy,R,fill,{r=R*.382,p=5,rot=-90,stroke}={})=>{const pts=[];for(let i=0;i<p*2;i++){const a=(rot+i*180/p)*Math.PI/180,rr=i%2?r:R;pts.push(n(cx+Math.cos(a)*rr)+','+n(cy+Math.sin(a)*rr))}return `<polygon points="${pts.join(' ')}" fill="${fill}"${stroke?` stroke="${stroke[0]}" stroke-width="${stroke[1]}" stroke-linejoin="round"`:''}/>`};
  const cres=(cx,cy,R,r,d,fill,rot=0)=>{const xi=(d*d+R*R-r*r)/(2*d),yi=Math.sqrt(R*R-xi*xi),x=cx+xi;return `<path d="M${n(x)} ${n(cy-yi)}A${R} ${R} 0 1 0 ${n(x)} ${n(cy+yi)}A${r} ${r} 0 0 1 ${n(x)} ${n(cy-yi)}z" fill="${fill}" transform="rotate(${rot} ${cx} ${cy})"/>`};
  const circ=(cx,cy,r,fill,extra='')=>`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${extra}/>`;
  const rect=(x,y,w,h,fill)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`;
  const poly=(pts,fill,extra='')=>`<polygon points="${pts}" fill="${fill}" ${extra}/>`;
  const sun=(cx,cy,r,rays,fill,len=1.7)=>{let s=circ(cx,cy,r,fill);for(let i=0;i<rays;i++){const a=i*2*Math.PI/rays;s+=`<path d="M${n(cx+Math.cos(a)*r)} ${n(cy+Math.sin(a)*r)}L${n(cx+Math.cos(a)*r*len)} ${n(cy+Math.sin(a)*r*len)}" stroke="${fill}" stroke-width="1.1" stroke-linecap="round"/>`}return s};
  const jack=(extra='')=>`<g ${extra}><clipPath id="JK_S"><path d="M0 0v30h60V0z"/></clipPath><clipPath id="JK_T"><path d="M30 15h30v15zv15H0V30zH0V15zV0h30z"/></clipPath><g clip-path="url(#JK_S)"><path d="M0 0v30h60V0z" fill="#012169"/><path d="M0 0L60 30M60 0L0 30" stroke="#fff" stroke-width="6"/><path d="M0 0L60 30M60 0L0 30" clip-path="url(#JK_T)" stroke="#c8102e" stroke-width="4"/><path d="M30 0v30M0 15h60" stroke="#fff" stroke-width="10"/><path d="M30 0v30M0 15h60" stroke="#c8102e" stroke-width="6"/></g></g>`;
  const tri=(c,x)=>poly(`0,0 ${x},30 0,60`,c);
  const stripes=(a,b,k)=>H(Array.from({length:k},(_,i)=>i%2?b:a));
  const usa=()=>{let s=stripes('#b22234','#fff',13)+rect(0,0,38,32.3,'#3c3b6e');for(let r=0;r<9;r++){const k=r%2?5:6;for(let c=0;c<k;c++)s+=star((r%2?6.3:3.2)+c*6.3,3+r*3.5,1.35,'#fff')}return s};
  const maple='<path d="M45 10L48 18L53 15L52 24L60 22L56 29L60 31L51 37L52 41L46 40V50H44V40L38 41L39 37L30 31L34 29L30 22L38 24L37 15L42 18z" fill="#e8112d"/>';
  const trig=(x,y,rot,pat)=>`<g transform="translate(${x} ${y}) rotate(${rot})">${pat.map((s,i)=>s?`<rect x="-5.5" y="${-4.6+i*3.7}" width="11" height="1.9" fill="#111"/>`:`<rect x="-5.5" y="${-4.6+i*3.7}" width="4.6" height="1.9" fill="#111"/><rect x="0.9" y="${-4.6+i*3.7}" width="4.6" height="1.9" fill="#111"/>`).join('')}</g>`;
  const kr=()=>rect(0,0,90,60,'#fff')+`<g transform="rotate(-33.7 45 30)">${circ(45,30,14,'#cd2e3a')}<path d="M31 30A7 7 0 0 1 45 30A7 7 0 0 0 59 30A14 14 0 0 1 31 30z" fill="#0047a0"/></g>`+trig(17,13,-56.3,[1,1,1])+trig(73,13,56.3,[1,0,1])+trig(17,47,56.3,[0,1,0])+trig(73,47,-56.3,[0,0,0]);
  const inChakra=()=>{let s=`<circle cx="45" cy="30" r="8" fill="none" stroke="#000080" stroke-width="1.2"/>${circ(45,30,1.4,'#000080')}`;for(let i=0;i<24;i++){const a=i*Math.PI/12;s+=`<path d="M45 30L${n(45+Math.cos(a)*8)} ${n(30+Math.sin(a)*8)}" stroke="#000080" stroke-width=".55"/>`}return s};
  const checker=(x,y,k,s,a,b)=>{let o='';for(let i=0;i<k;i++)for(let j=0;j<k;j++)o+=rect(x+i*s,y+j*s,s,s,(i+j)%2?b:a);return o};
  const my=()=>{let s=stripes('#cc0001','#fff',14);s+=rect(0,0,45,34.3,'#010066')+cres(17,17,10,8,3,'#fc0')+star(31,17,8,'#fc0',{r:4,p:14});return s};
  const F={
    fr:()=>V(['#0055a4','#fff','#ef4135']),it:()=>V(['#009246','#fff','#ce2b37']),ie:()=>V(['#169b62','#fff','#ff883e']),be:()=>V(['#000','#fdda24','#ef3340']),
    de:()=>H(['#000','#dd0000','#ffce00']),nl:()=>H(['#ae1c28','#fff','#21468b']),ru:()=>H(['#fff','#0039a6','#d52b1e']),hu:()=>H(['#cd2a3e','#fff','#436f4d']),
    at:()=>H(['#ed2939','#fff','#ed2939']),pl:()=>H(['#fff','#dc143c']),ua:()=>H(['#0057b7','#ffd700']),bg:()=>H(['#fff','#00966e','#d62612']),
    lt:()=>H(['#fdb913','#006a44','#c1272d']),ee:()=>H(['#0072ce','#000','#fff']),lu:()=>H(['#ed2939','#fff','#00a1de']),ro:()=>V(['#002b7f','#fcd116','#ce1126']),
    ng:()=>V(['#008751','#fff','#008751']),ml:()=>V(['#14b53a','#fcd116','#ce1126']),ci:()=>V(['#f77f00','#fff','#009e60']),pe:()=>V(['#d91023','#fff','#d91023']),
    co:()=>H(['#fcd116','#003893','#ce1126'],[2,1,1]),bo:()=>H(['#d52b1e','#f9e300','#007934']),am:()=>H(['#d90012','#0033a0','#f2a800']),ga:()=>H(['#009e60','#fcd116','#3a75c4']),
    th:()=>H(['#a51931','#f4f5f8','#2d2a4a','#f4f5f8','#a51931'],[1,1,2,1,1]),cr:()=>H(['#002b7f','#fff','#ce1126','#fff','#002b7f'],[1,1,2,1,1]),td:()=>V(['#002664','#fecb00','#c60c30']),
    id:()=>H(['#e70011','#fff']),
    se:()=>rect(0,0,90,60,'#006aa7')+rect(26,0,11,60,'#fecc00')+rect(0,24.5,90,11,'#fecc00'),
    no:()=>rect(0,0,90,60,'#ba0c2f')+rect(24,0,13,60,'#fff')+rect(0,23.5,90,13,'#fff')+rect(27.5,0,6,60,'#00205b')+rect(0,27,90,6,'#00205b'),
    dk:()=>rect(0,0,90,60,'#c8102e')+rect(26,0,8,60,'#fff')+rect(0,26,90,8,'#fff'),
    fi:()=>rect(0,0,90,60,'#fff')+rect(25,0,11,60,'#003580')+rect(0,24.5,90,11,'#003580'),
    is:()=>rect(0,0,90,60,'#02529c')+rect(24,0,13,60,'#fff')+rect(0,23.5,90,13,'#fff')+rect(27.5,0,6,60,'#dc1e35')+rect(0,27,90,6,'#dc1e35'),
    ch:()=>rect(0,0,90,60,'#da291c')+rect(40,13,10,34,'#fff')+rect(28,25,34,10,'#fff'),
    gr:()=>stripes('#0d5eaf','#fff',9)+rect(0,0,33.4,33.4,'#0d5eaf')+rect(13.4,0,6.6,33.4,'#fff')+rect(0,13.4,33.4,6.6,'#fff'),
    jp:()=>rect(0,0,90,60,'#fff')+circ(45,30,18,'#bc002d'),
    bd:()=>rect(0,0,90,60,'#006a4e')+circ(40,30,17,'#f42a41'),
    ca:()=>V(['#e8112d','#fff','#e8112d'],[1,2,1])+maple,
    us:usa,
    gb:()=>jack('transform="scale(1.5 2)"'),
    au:()=>rect(0,0,90,60,'#012169')+jack('transform="scale(.75 1)"')+star(22.5,45,8,'#fff',{r:3.4,p:7})+star(66,48,3.6,'#fff',{r:1.6,p:7})+star(56,31,3.6,'#fff',{r:1.6,p:7})+star(76,27,3.6,'#fff',{r:1.6,p:7})+star(66,12,3.6,'#fff',{r:1.6,p:7})+star(71,34,1.9,'#fff'),
    nz:()=>rect(0,0,90,60,'#012169')+jack('transform="scale(.75 1)"')+star(67,46,4.2,'#cc142b',{stroke:['#fff',.9]})+star(57,32,4.2,'#cc142b',{stroke:['#fff',.9]})+star(77,28,4.2,'#cc142b',{stroke:['#fff',.9]})+star(67,12,4.2,'#cc142b',{stroke:['#fff',.9]}),
    br:()=>rect(0,0,90,60,'#009c3b')+poly('45,6 83,30 45,54 7,30','#ffdf00')+circ(45,30,13,'#002776')+'<path d="M32.5 33Q45 27 57.5 33" stroke="#fff" stroke-width="2.4" fill="none"/>'+[[40,24],[50,22],[47,36],[38,35],[53,30]].map(p=>circ(p[0],p[1],.7,'#fff')).join(''),
    cn:()=>rect(0,0,90,60,'#de2910')+star(15,15,9,'#ffde00',{rot:-90})+[[30,6],[36,13],[36,22],[30,29]].map(p=>star(p[0],p[1],3,'#ffde00',{rot:Math.atan2(15-p[1],15-p[0])*180/Math.PI})).join(''),
    kr,
    in:()=>H(['#ff9933','#fff','#138808'])+inChakra(),
    tr:()=>rect(0,0,90,60,'#e30a17')+circ(34,30,12,'#fff')+circ(37.6,30,9.6,'#e30a17')+star(48,30,6.2,'#fff',{rot:0}),
    cl:()=>H(['#fff','#d52b1e'])+rect(0,0,30,30,'#0039a6')+star(15,15,8,'#fff'),
    cu:()=>stripes('#002a8f','#fff',5)+poly('0,0 52,30 0,60','#cf142b')+star(17,30,10,'#fff'),
    jm:()=>rect(0,0,90,60,'#000')+poly('0,0 90,0 45,30','#009b3a')+poly('0,60 90,60 45,30','#009b3a')+'<path d="M0 0L90 60M90 0L0 60" stroke="#fed100" stroke-width="11"/>',
    pt:()=>V(['#006600','#ff0000'],[2,3])+circ(36,30,9.5,'#fc0')+'<path d="M31 25h10v6a5 5 0 0 1-10 0z" fill="#f00" stroke="#fff" stroke-width="1.2"/><circle cx="36" cy="28.5" r="1.1" fill="#fff"/>',
    mx:()=>V(['#006847','#fff','#ce1126'])+'<circle cx="45" cy="30" r="9.5" fill="none" stroke="#3f8f4d" stroke-width="2" stroke-dasharray="3 1.2"/><ellipse cx="45" cy="29" rx="5" ry="4.2" fill="#8c5a2b"/><path d="M42 33Q45 37 48 33" stroke="#c9a24a" stroke-width="1.6" fill="none"/><circle cx="43.5" cy="26.4" r="1.6" fill="#8c5a2b"/>',
    za:()=>H(['#e03c31','#001489'])+'<path d="M0 0L30 30 0 60M30 30H90" stroke="#fff" stroke-width="19" fill="none"/>'+poly('0,3 0,57 25,30','#000','stroke="#ffb81c" stroke-width="3" stroke-linejoin="round"')+'<path d="M-1 0L30 30 -1 60M30 30H90" stroke="#007749" stroke-width="12" fill="none"/>'+poly('0,3 0,57 20,30','#000'),
    eg:()=>H(['#ce1126','#fff','#000'])+'<path d="M39 34h12v-6l-3.500 2-2.500-5-2.500 5L39 28z" fill="#c09300"/><rect x="40" y="35" width="10" height="2" fill="#c09300"/>',
    il:()=>rect(0,0,90,60,'#fff')+rect(0,7,90,6,'#0038b8')+rect(0,47,90,6,'#0038b8')+poly('45,19 54.5,35.5 35.5,35.5','none','stroke="#0038b8" stroke-width="2.2"')+poly('45,41 35.5,24.5 54.5,24.5','none','stroke="#0038b8" stroke-width="2.2"'),
    vn:()=>rect(0,0,90,60,'#da251d')+star(45,31,15,'#ff0'),
    pk:()=>rect(0,0,90,60,'#01411c')+rect(0,0,22.5,60,'#fff')+cres(57,30,13,10.6,3.6,'#fff',-25)+star(65,23,5,'#fff',{rot:-70}),
    ph:()=>H(['#0038a8','#ce1126'])+poly('0,0 52,30 0,60','#fff')+sun(13,30,5,8,'#fcd116',1.6)+star(5,7,3,'#fcd116')+star(5,53,3,'#fcd116')+star(47,30,3,'#fcd116'),
    ke:()=>H(['#000','#fff','#bb0000','#fff','#006600'],[16,3,22,3,16])+'<ellipse cx="45" cy="30" rx="8" ry="14" fill="#bb0000" stroke="#000" stroke-width="1.5"/><path d="M45 17V43M40 30H50" stroke="#fff" stroke-width="1.4"/><circle cx="45" cy="30" r="2.4" fill="#fff"/>',
    ma:()=>rect(0,0,90,60,'#c1272d')+`<path d="${[0,2,4,1,3,0].map((k,i)=>{const a=(-90+k*72)*Math.PI/180;return (i?'L':'M')+n(45+Math.cos(a)*14)+' '+n(31+Math.sin(a)*14)}).join('')}z" fill="none" stroke="#006233" stroke-width="2"/>`,
    dz:()=>V(['#006233','#fff'])+cres(44,30,13,10.4,3.8,'#d21034')+star(50,30,6,'#d21034',{rot:-90}),
    ly:()=>H(['#e70013','#000','#239e46'],[1,2,1])+cres(41,30,8.5,7,2.6,'#fff')+star(49.5,30,3.6,'#fff'),
    gh:()=>H(['#ce1126','#fcd116','#006b3f'])+star(45,30,9,'#000'),
    et:()=>H(['#078930','#fcdd09','#da121a'])+circ(45,30,13,'#0f47af')+star(45,30,9,'none',{stroke:['#fcdd09',1.5]}),
    la:()=>H(['#ce1126','#002868','#ce1126'],[1,2,1])+circ(45,30,9,'#fff'),
    uy:()=>stripes('#fff','#0038a8',9)+rect(0,0,33.4,33.4,'#fff')+sun(16.7,16.7,6,16,'#fcd116',1.55),
    ve:()=>H(['#ffcc00','#00247d','#cf142b'])+[0,1,2,3,4,5,6,7].map(i=>{const a=(200+i*20)*Math.PI/180;return star(45+Math.cos(a)*16,40+Math.sin(a)*16,2.4,'#fff')}).join(''),
    ec:()=>H(['#ffdd00','#034ea2','#ed1c24'],[2,1,1])+'<ellipse cx="45" cy="25" rx="6" ry="8" fill="#8c5a2b" stroke="#c9a24a" stroke-width="1.4"/><ellipse cx="45" cy="25" rx="3" ry="5" fill="#7ec8e3"/>',
    pa:()=>rect(0,0,90,60,'#fff')+rect(45,0,45,30,'#d21034')+rect(0,30,45,30,'#005293')+star(22.5,15,8,'#005293')+star(67.5,45,8,'#d21034'),
    py:()=>H(['#d52b1e','#fff','#0038a8'])+circ(45,30,7.5,'#fff','stroke="#6aa84f" stroke-width="1.6"')+star(45,30,3.8,'#fcd116',{stroke:['#c99a00',.4]}),
    do:()=>rect(0,0,90,60,'#002d62')+rect(45,0,45,30,'#ce1126')+rect(0,30,45,30,'#ce1126')+rect(38,0,14,60,'#fff')+rect(0,23,90,14,'#fff')+rect(40,22,10,16,'#2e8b57')+rect(42,25,6,5,'#ce1126')+rect(42,31,6,4,'#002d62'),
    my,
    sg:()=>H(['#ed2939','#fff'])+cres(17,15,9,7.4,3,'#fff')+[[29,8.5],[35,13],[33,20],[25,20],[23,13]].map(p=>star(p[0],p[1],2.4,'#fff')).join(''),
    qa:()=>rect(0,0,90,60,'#8a1538')+`<path d="M0 0H30${Array.from({length:9},(_,i)=>`L41 ${n(i*6.67+3.33)}L30 ${n((i+1)*6.67)}`).join('')}H0z" fill="#fff"/>`,
    kw:()=>H(['#007a3d','#fff','#ce1126'])+poly('0,0 22,20 22,40 0,60','#000'),
    jo:()=>H(['#000','#fff','#007a3d'])+poly('0,0 0,60 46,30','#ce1126')+star(14,30,4.2,'#fff',{p:7,r:1.9}),
    bs:()=>H(['#00abc9','#fcd116','#00abc9'])+poly('0,0 0,60 40,30','#000'),
    hn:()=>H(['#0073cf','#fff','#0073cf'])+[[45,30],[36,26],[54,26],[36,34],[54,34]].map(p=>star(p[0],p[1],2.6,'#0073cf')).join(''),
    cz:()=>H(['#fff','#d7141a'])+poly('0,0 0,60 45,30','#11457e'),
    hr:()=>H(['#f00','#fff','#171796'])+rect(37,19,16,20,'#fff')+checker(38,20,5,2.8,'#f00','#fff')+'<path d="M37 19H53V39H37z" fill="none" stroke="#f00" stroke-width="1"/>',
    sn:()=>V(['#00853f','#fdef42','#e31b23'])+star(45,30,9,'#00853f'),
    cm:()=>V(['#007a5e','#ce1126','#fcd116'])+star(45,30,8.5,'#fcd116'),
    tn:()=>rect(0,0,90,60,'#e70013')+circ(45,30,15,'#fff')+cres(44,30,10,8.2,3,'#e70013')+star(47.5,30,5,'#e70013'),
    ae:()=>H(['#00732f','#fff','#000'])+rect(0,0,23,60,'#f00'),
    es:()=>H(['#aa151b','#f1bf00','#aa151b'],[1,2,1])+'<path d="M22 23h12v8a6 6 0 0 1-12 0z" fill="#c8102e" stroke="#7a1a1a" stroke-width="1"/><rect x="21" y="21" width="14" height="2.4" fill="#c9a24a"/><rect x="26.5" y="25" width="3" height="7" fill="#f1bf00"/>',
    ar:()=>H(['#74acdf','#fff','#74acdf'])+sun(45,30,4.6,16,'#f6b40e',1.7)+circ(45,30,2.4,'#c99a00')
  };
  return F;
})();

const BANDERAS_PAISES=[
 ['fr','Francia','París','Europa',1,'tricolorV'],['it','Italia','Roma','Europa',1,'tricolorV'],['ie','Irlanda','Dublín','Europa',2,'tricolorV'],['be','Bélgica','Bruselas','Europa',2,'tricolorV'],
 ['de','Alemania','Berlín','Europa',1,'tricolorH'],['nl','Países Bajos','Ámsterdam','Europa',2,'tricolorH'],['ru','Rusia','Moscú','Europa',1,'tricolorH'],['hu','Hungría','Budapest','Europa',3,'tricolorH'],
 ['at','Austria','Viena','Europa',2,'tricolorH'],['pl','Polonia','Varsovia','Europa',2,'bicolor'],['ua','Ucrania','Kyiv','Europa',2,'bicolor'],['bg','Bulgaria','Sofía','Europa',3,'tricolorH'],
 ['lt','Lituania','Vilna','Europa',3,'tricolorH'],['ee','Estonia','Tallin','Europa',3,'tricolorH'],['lu','Luxemburgo','Luxemburgo','Europa',3,'tricolorH'],['ro','Rumania','Bucarest','Europa',3,'tricolorV'],
 ['ng','Nigeria','Abuya','África',3,'tricolorV'],['ml','Malí','Bamako','África',3,'tricolorV'],['ci','Costa de Marfil','Yamusukro','África',3,'tricolorV'],['pe','Perú','Lima','América',1,'tricolorV'],
 ['co','Colombia','Bogotá','América',1,'tricolorH'],['bo','Bolivia','Sucre y La Paz','América',2,'tricolorH'],['am','Armenia','Ereván','Asia',3,'tricolorH'],['ga','Gabón','Libreville','África',3,'tricolorH'],
 ['th','Tailandia','Bangkok','Asia',2,'franjas'],['cr','Costa Rica','San José','América',2,'franjas'],['td','Chad','Yamena','África',3,'tricolorV'],['id','Indonesia','Yakarta','Asia',3,'bicolor'],
 ['se','Suecia','Estocolmo','Europa',2,'nordica'],['no','Noruega','Oslo','Europa',2,'nordica'],['dk','Dinamarca','Copenhague','Europa',2,'nordica'],['fi','Finlandia','Helsinki','Europa',2,'nordica'],
 ['is','Islandia','Reikiavik','Europa',2,'nordica'],['ch','Suiza','Berna','Europa',1,'cruz'],['gr','Grecia','Atenas','Europa',1,'cruz'],['jp','Japón','Tokio','Asia',1,'disco'],
 ['bd','Bangladés','Daca','Asia',3,'disco'],['ca','Canadá','Ottawa','América',1,'hoja'],['us','Estados Unidos','Washington D. C.','América',1,'estrellas'],['gb','Reino Unido','Londres','Europa',1,'union'],
 ['au','Australia','Canberra','Oceanía',1,'union'],['nz','Nueva Zelanda','Wellington','Oceanía',2,'union'],['br','Brasil','Brasilia','América',1,'disco'],['cn','China','Pekín','Asia',1,'estrellas'],
 ['kr','Corea del Sur','Seúl','Asia',2,'disco'],['in','India','Nueva Delhi','Asia',1,'tricolorH'],['tr','Turquía','Ankara','Asia',2,'luna'],['cl','Chile','Santiago','América',1,'estrellas'],
 ['cu','Cuba','La Habana','América',1,'estrellas'],['jm','Jamaica','Kingston','América',2,'aspa'],['pt','Portugal','Lisboa','Europa',1,'tricolorV'],['mx','México','Ciudad de México','América',1,'tricolorV'],
 ['za','Sudáfrica','Pretoria','África',2,'aspa'],['eg','Egipto','El Cairo','África',1,'tricolorH'],['il','Israel','','Asia',1,'cruz'],['vn','Vietnam','Hanói','Asia',2,'estrellas'],
 ['pk','Pakistán','Islamabad','Asia',2,'luna'],['ph','Filipinas','Manila','Asia',2,'triangulo'],['ke','Kenia','Nairobi','África',2,'franjas'],['ma','Marruecos','Rabat','África',2,'estrellas'],
 ['dz','Argelia','Argel','África',3,'luna'],['ly','Libia','Trípoli','África',3,'luna'],['gh','Ghana','Acra','África',3,'tricolorH'],['et','Etiopía','Adís Abeba','África',3,'tricolorH'],
 ['la','Laos','Vientián','Asia',3,'franjas'],['uy','Uruguay','Montevideo','América',2,'franjas'],['ve','Venezuela','Caracas','América',1,'tricolorH'],['ec','Ecuador','Quito','América',2,'tricolorH'],
 ['pa','Panamá','Ciudad de Panamá','América',2,'estrellas'],['py','Paraguay','Asunción','América',2,'tricolorH'],['do','República Dominicana','Santo Domingo','América',2,'cruz'],['my','Malasia','Kuala Lumpur','Asia',3,'luna'],
 ['sg','Singapur','Singapur','Asia',3,'bicolor'],['qa','Catar','Doha','Asia',3,'dentada'],['kw','Kuwait','Ciudad de Kuwait','Asia',3,'triangulo'],['jo','Jordania','Amán','Asia',3,'triangulo'],
 ['bs','Bahamas','Nasáu','América',3,'triangulo'],['hn','Honduras','Tegucigalpa','América',3,'tricolorH'],['cz','Chequia','Praga','Europa',2,'triangulo'],['hr','Croacia','Zagreb','Europa',2,'tricolorH'],
 ['sn','Senegal','Dakar','África',3,'tricolorV'],['cm','Camerún','Yaundé','África',3,'tricolorV'],['tn','Túnez','Túnez','África',3,'luna'],['ae','Emiratos Árabes Unidos','Abu Dabi','Asia',3,'tricolorH'],
 ['es','España','Madrid','Europa',1,'tricolorH'],['ar','Argentina','Buenos Aires','América',1,'tricolorH']
];
/* bandera(id): SVG con brillo y pliegue animado. Cada llamada usa ids propios. */
let _bUid=0;
function bandera(id,{ancho=''}={}){
  const f=_bf[id];if(!f)return '';
  const u='bf'+(++_bUid);
  return `<svg viewBox="-3 -3 96 66" ${ancho?`width="${ancho}"`:''} role="img" aria-label="Bandera"><defs><clipPath id="${u}c"><rect width="90" height="60" rx="3"/></clipPath>
    <linearGradient id="${u}g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".07"/><stop offset=".22" stop-color="#fff" stop-opacity=".05"/><stop offset=".5" stop-color="#000" stop-opacity=".04"/><stop offset=".78" stop-color="#fff" stop-opacity=".06"/><stop offset="1" stop-color="#000" stop-opacity=".09"/></linearGradient></defs>
    <g clip-path="url(#${u}c)">${f().replace(/JK_S/g,u+'s').replace(/JK_T/g,u+'t')}<rect width="90" height="60" fill="url(#${u}g)"><animate attributeName="x" values="-4;4;-4" dur="3.6s" repeatCount="indefinite"/></rect></g><rect width="90" height="60" rx="3" fill="none" stroke="rgba(0,0,0,.28)" stroke-width=".8"/></svg>`;
}

/* Motor de ajedrez: reglas completas + computadora (negamax con poda alfa-beta).
   Casillas en formato 0x88: sq = fila*16 + columna (fila 0 = primera fila de las blancas).
   Piezas: tipo 1..6 (P,N,B,R,Q,K) | (color<<3); color 0 = blancas, 1 = negras. */
const Ajedrez=(()=>{
'use strict';
const P=1,N=2,B=3,R=4,Q=5,K=6;
const VAL=[0,100,320,330,500,900,20000];
const NAVEG=[33,31,18,14,-33,-31,-18,-14],DIAG=[17,15,-17,-15],REC=[16,-16,1,-1],TODAS=[17,15,-17,-15,16,-16,1,-1];
const F_EP=1,F_ENR=2,F_DOBLE=4;
const PST=[null,
 [0,0,0,0,0,0,0,0,50,50,50,50,50,50,50,50,10,10,20,30,30,20,10,10,5,5,10,25,25,10,5,5,0,0,0,20,20,0,0,0,5,-5,-10,0,0,-10,-5,5,5,10,10,-20,-20,10,10,5,0,0,0,0,0,0,0,0],
 [-50,-40,-30,-30,-30,-30,-40,-50,-40,-20,0,0,0,0,-20,-40,-30,0,10,15,15,10,0,-30,-30,5,15,20,20,15,5,-30,-30,0,15,20,20,15,0,-30,-30,5,10,15,15,10,5,-30,-40,-20,0,5,5,0,-20,-40,-50,-40,-30,-30,-30,-30,-40,-50],
 [-20,-10,-10,-10,-10,-10,-10,-20,-10,0,0,0,0,0,0,-10,-10,0,5,10,10,5,0,-10,-10,5,5,10,10,5,5,-10,-10,0,10,10,10,10,0,-10,-10,10,10,10,10,10,10,-10,-10,5,0,0,0,0,5,-10,-20,-10,-10,-10,-10,-10,-10,-20],
 [0,0,0,0,0,0,0,0,5,10,10,10,10,10,10,5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,0,0,0,5,5,0,0,0],
 [-20,-10,-10,-5,-5,-10,-10,-20,-10,0,0,0,0,0,0,-10,-10,0,5,5,5,5,0,-10,-5,0,5,5,5,5,0,-5,0,0,5,5,5,5,0,-5,-10,5,5,5,5,5,0,-10,-10,0,5,0,0,0,0,-10,-20,-10,-10,-5,-5,-10,-10,-20],
 [-30,-40,-40,-50,-50,-40,-40,-30,-30,-40,-40,-50,-50,-40,-40,-30,-30,-40,-40,-50,-50,-40,-40,-30,-30,-40,-40,-50,-50,-40,-40,-30,-20,-30,-30,-40,-40,-30,-30,-20,-10,-20,-20,-20,-20,-20,-20,-10,20,20,0,0,0,0,20,20,20,30,10,0,0,10,30,20]];
const sqName=s=>'abcdefgh'[s&7]+((s>>4)+1);
const nameSq=n=>(n.charCodeAt(0)-97)+(parseInt(n[1])-1)*16;
const mv=(f,t,pr=0,fl=0)=>f|(t<<7)|(pr<<14)|(fl<<18);
const mFrom=m=>m&127,mTo=m=>(m>>7)&127,mPromo=m=>(m>>14)&15,mFlags=m=>m>>18;

class Partida{
  constructor(fen){this.b=new Int8Array(128);this.pila=[];this.cargar(fen||'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')}
  cargar(fen){
    const [pos,lado,enr,ep,hm,fm]=fen.split(' ');this.b.fill(0);
    const T={p:P,n:N,b:B,r:R,q:Q,k:K};let r=7,c=0;
    for(const ch of pos){if(ch==='/'){r--;c=0}else if(/\d/.test(ch))c+=+ch;else{const t=T[ch.toLowerCase()],col=ch===ch.toLowerCase()?1:0;this.b[r*16+c]=t|(col<<3);c++}}
    this.lado=lado==='b'?1:0;this.enr=(enr.includes('K')?1:0)|(enr.includes('Q')?2:0)|(enr.includes('k')?4:0)|(enr.includes('q')?8:0);
    this.ep=ep&&ep!=='-'?nameSq(ep):-1;this.mm=+hm||0;this.nm=+fm||1;this.pila=[];this.rey=[0,0];
    for(let s=0;s<128;s++){if(s&0x88){s+=7;continue}const p=this.b[s];if((p&7)===K)this.rey[p>>3]=s}
    this.claves=[this.clave()];
  }
  fen(){
    let o='';for(let r=7;r>=0;r--){let v=0;for(let c=0;c<8;c++){const p=this.b[r*16+c];if(!p)v++;else{if(v){o+=v;v=0}const ch='pnbrqk'[(p&7)-1];o+=(p>>3)?ch:ch.toUpperCase()}}if(v)o+=v;if(r)o+='/'}
    return o+' '+(this.lado?'b':'w')+' '+((this.enr&1?'K':'')+(this.enr&2?'Q':'')+(this.enr&4?'k':'')+(this.enr&8?'q':'')||'-')+' '+(this.ep>=0?sqName(this.ep):'-')+' '+this.mm+' '+this.nm;
  }
  clave(){return this.fen().split(' ').slice(0,4).join(' ')}
  atacada(sq,por){ // ¿la casilla está atacada por el color "por"?
    const b=this.b,pc=por<<3;
    const dp=por?-16:16; // los peones del color "por" atacan hacia delante: desde sq miramos hacia atrás
    for(const d of [dp-1,dp+1]){const s=sq-d;if(!(s&0x88)&&b[s]===(P|pc))return true}
    for(const d of NAVEG){const s=sq+d;if(!(s&0x88)&&b[s]===(N|pc))return true}
    for(const d of TODAS){const s=sq+d;if(!(s&0x88)&&b[s]===(K|pc))return true}
    for(const d of DIAG){let s=sq+d;while(!(s&0x88)){const p=b[s];if(p){if(p===(B|pc)||p===(Q|pc))return true;break}s+=d}}
    for(const d of REC){let s=sq+d;while(!(s&0x88)){const p=b[s];if(p){if(p===(R|pc)||p===(Q|pc))return true;break}s+=d}}
    return false;
  }
  enJaque(color=this.lado){return this.atacada(this.rey[color],color^1)}
  pseudo(soloCapt){
    const b=this.b,me=this.lado,out=[];
    for(let s=0;s<128;s++){
      if(s&0x88){s+=7;continue}
      const p=b[s];if(!p||(p>>3)!==me)continue;const t=p&7;
      if(t===P){
        const dir=me?-16:16,ini=me?6:1,prom=me?0:7;
        const f=s+dir;
        if(!soloCapt&&!(f&0x88)&&!b[f]){
          if((f>>4)===prom)for(const pr of [Q,R,B,N])out.push(mv(s,f,pr));else{out.push(mv(s,f));const f2=f+dir;if((s>>4)===ini&&!b[f2])out.push(mv(s,f2,0,F_DOBLE))}
        }
        for(const dd of [dir-1,dir+1]){const to=s+dd;if(to&0x88)continue;const q=b[to];
          if(q&&(q>>3)!==me){if((to>>4)===prom)for(const pr of [Q,R,B,N])out.push(mv(s,to,pr));else out.push(mv(s,to))}
          else if(to===this.ep)out.push(mv(s,to,0,F_EP))}
      }else if(t===N||t===K){
        for(const d of (t===N?NAVEG:TODAS)){const to=s+d;if(to&0x88)continue;const q=b[to];if(!q){if(!soloCapt)out.push(mv(s,to))}else if((q>>3)!==me)out.push(mv(s,to))}
        if(t===K&&!soloCapt&&!this.enJaque(me)){
          const base=me?112:0,rk=me?4:1,rq=me?8:2,op=me^1;
          if(s===base+4){
            if((this.enr&rk)&&!b[base+5]&&!b[base+6]&&b[base+7]===(R|(me<<3))&&!this.atacada(base+5,op)&&!this.atacada(base+6,op))out.push(mv(s,base+6,0,F_ENR));
            if((this.enr&rq)&&!b[base+3]&&!b[base+2]&&!b[base+1]&&b[base]===(R|(me<<3))&&!this.atacada(base+3,op)&&!this.atacada(base+2,op))out.push(mv(s,base+2,0,F_ENR));
          }
        }
      }else{
        for(const d of (t===B?DIAG:t===R?REC:TODAS)){let to=s+d;while(!(to&0x88)){const q=b[to];if(!q){if(!soloCapt)out.push(mv(s,to))}else{if((q>>3)!==me)out.push(mv(s,to));break}to+=d}}
      }
    }
    return out;
  }
  hacer(m){
    const b=this.b,f=mFrom(m),t=mTo(m),pr=mPromo(m),fl=mFlags(m),p=b[f],me=this.lado;
    let cap=b[t],capSq=t;
    if(fl&F_EP){capSq=t+(me?16:-16);cap=b[capSq]}
    this.pila.push({m,cap,capSq,enr:this.enr,ep:this.ep,mm:this.mm,rey0:this.rey[0],rey1:this.rey[1]});
    b[f]=0;if(capSq!==t)b[capSq]=0;
    b[t]=pr?(pr|(me<<3)):p;
    if(fl&F_ENR){if(t&4){b[t+1]=0;b[t-1]=R|(me<<3)}else{b[t-2]=0;b[t+1]=R|(me<<3)}}
    if((p&7)===K)this.rey[me]=t;
    // derechos de enroque
    if((p&7)===K)this.enr&=me?3:12;
    for(const [sq,bit] of [[0,2],[7,1],[112,8],[119,4]])if(f===sq||t===sq)this.enr&=~bit;
    this.ep=(fl&F_DOBLE)?(f+t)/2:-1;
    this.mm=((p&7)===P||cap)?0:this.mm+1;
    if(me)this.nm++;
    this.lado^=1;
  }
  deshacer(){
    const u=this.pila.pop(),m=u.m,b=this.b,f=mFrom(m),t=mTo(m),fl=mFlags(m),pr=mPromo(m);this.lado^=1;const me=this.lado;
    const p=pr?(P|(me<<3)):b[t];
    b[f]=p;b[t]=0;
    if(fl&F_EP)b[u.capSq]=u.cap;else b[t]=u.cap;
    if(fl&F_ENR){if(t&4){b[t-1]=0;b[t+1]=R|(me<<3)}else{b[t+1]=0;b[t-2]=R|(me<<3)}}
    this.enr=u.enr;this.ep=u.ep;this.mm=u.mm;this.rey[0]=u.rey0;this.rey[1]=u.rey1;if(me)this.nm--;
  }
  legales(){
    const out=[];for(const m of this.pseudo(false)){this.hacer(m);if(!this.atacada(this.rey[this.lado^1],this.lado))out.push(m);this.deshacer()}return out;
  }
  /* Juega un movimiento legal y lo registra en el historial de la partida */
  jugar(m){this.hacer(m);this.claves.push(this.clave())}
  retroceder(){this.deshacer();this.claves.pop()}
  buscarMov(f,t,promo){return this.legales().find(m=>mFrom(m)===f&&mTo(m)===t&&(mPromo(m)||0)===(promo||0))}
  movsDesde(f){return this.legales().filter(m=>mFrom(m)===f)}
  material(){const mat=[0,0],menores=[[],[]];for(let s=0;s<128;s++){if(s&0x88){s+=7;continue}const p=this.b[s];if(!p)continue;const t=p&7,c=p>>3;if(t===K)continue;if(t===P||t===R||t===Q)mat[c]+=9;else{mat[c]++;menores[c].push([t,((s>>4)+(s&7))&1])}}return{mat,menores}}
  /* Estado: null | 'mate' | 'ahogado' | 'repeticion' | '50' | 'material' */
  estado(){
    const L=this.legales();
    if(!L.length)return this.enJaque()?'mate':'ahogado';
    if(this.mm>=100)return '50';
    const k=this.claves[this.claves.length-1];let n=0;for(const c of this.claves)if(c===k)n++;if(n>=3)return 'repeticion';
    const {mat,menores}=this.material();
    if(mat[0]===0&&mat[1]===0&&menores[0].length+menores[1].length<=1)return 'material';
    if(mat[0]===0&&mat[1]===0&&menores[0].length===1&&menores[1].length===1&&menores[0][0][0]===B&&menores[1][0][0]===B&&menores[0][0][1]===menores[1][0][1])return 'material';
    return null;
  }
  /* ---------- Evaluación y búsqueda ---------- */
  eval(){
    let s=0;const b=this.b;
    for(let q=0;q<128;q++){if(q&0x88){q+=7;continue}const p=b[q];if(!p)continue;const t=p&7,c=p>>3,r=q>>4,f=q&7;
      const v=VAL[t]+(t===K?0:PST[t][c?r*8+f:(7-r)*8+f])+(t===K?PST[K][c?r*8+f:(7-r)*8+f]:0);
      s+=c?-v:v}
    return this.lado?-s:s;
  }
  ordenar(L){
    const b=this.b;return L.map(m=>{const t=mTo(m),cap=b[t]?VAL[b[t]&7]*10-VAL[b[mFrom(m)]&7]/10:0;return[m,cap+(mPromo(m)?VAL[mPromo(m)]:0)+((mFlags(m)&F_EP)?1000:0)]}).sort((a,c)=>c[1]-a[1]).map(x=>x[0]);
  }
  quies(a,be,prof){
    const est=this.eval();if(prof<=0)return est;if(est>=be)return be;if(est>a)a=est;
    for(const m of this.ordenar(this.pseudo(true))){
      this.hacer(m);
      if(this.atacada(this.rey[this.lado^1],this.lado)){this.deshacer();continue}
      const v=-this.quies(-be,-a,prof-1);this.deshacer();
      if(v>=be)return be;if(v>a)a=v;
    }
    return a;
  }
  nega(prof,a,be,ply){
    this.nodos++;if((this.nodos&1023)===0&&Date.now()>this.limite)this.agotado=true;if(this.agotado)return 0;
    const enJ=this.enJaque();if(enJ)prof++;
    if(prof<=0)return this.quies(a,be,4);
    let hay=false;
    for(const m of this.ordenar(this.pseudo(false))){
      this.hacer(m);
      if(this.atacada(this.rey[this.lado^1],this.lado)){this.deshacer();continue}
      hay=true;const v=-this.nega(prof-1,-be,-a,ply+1);this.deshacer();
      if(this.agotado)return 0;
      if(v>=be)return be;if(v>a)a=v;
    }
    if(!hay)return enJ?-30000+ply:0;
    return a;
  }
  /* Elige el mejor movimiento. nivel: 1 fácil, 2 medio, 3 difícil. */
  elegir(nivel=2,ms=1500){
    const L=this.legales();if(!L.length)return null;
    if(nivel===1&&Math.random()<.25)return L[Math.floor(Math.random()*L.length)];
    const prof=[0,1,2,4][nivel];this.nodos=0;this.agotado=false;this.limite=Date.now()+ms;
    let mejor=L[0],puntos=this.ordenar(L).map(m=>[m,0]);
    const ord=this.ordenar(L);
    for(let d=1;d<=prof;d++){
      let a=-1e9,cand=null,res=[];
      const lista=cand||ord.slice().sort((x,y)=>{const ix=puntos.find(p=>p[0]===x),iy=puntos.find(p=>p[0]===y);return (iy?iy[1]:0)-(ix?ix[1]:0)});
      for(const m of lista){
        this.hacer(m);const v=nivel<3?-this.nega(d-1,-1e9,1e9,1):-this.nega(d-1,-1e9,-a,1);this.deshacer();
        if(this.agotado)break;res.push([m,v]);if(v>a){a=v;cand=m}
      }
      if(this.agotado){break}
      mejor=cand||mejor;puntos=res;
    }
    if(nivel<=2&&puntos.length>1){ // pequeña variedad: elegir entre jugadas casi iguales
      const top=Math.max(...puntos.map(p=>p[1])),umbral=nivel===1?60:12,cs=puntos.filter(p=>p[1]>=top-umbral);
      return cs[Math.floor(Math.random()*cs.length)][0];
    }
    return mejor;
  }
}
const api={Partida,sqName,nameSq,mFrom,mTo,mPromo,mFlags,mv,P,N,B,R,Q,K,F_EP,F_ENR,F_DOBLE};
if(typeof module!=='undefined')module.exports=api;
return api;
})();

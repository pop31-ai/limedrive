"use strict";

let prof=null;
let droneAng=0;
const CARSCALE=1.35;
const BUILD="v15";
const EV={cur:null,cooldown:{},lastCheck:0,pushedPrev:false,lastPlace:0,init:false};

function ph(arr){return arr[Math.floor(Math.random()*arr.length)];}

function ev(id,phrases,color,dur){
  const now=performance.now();
  const st=EV.cooldown[id]||0;
  if(now-st<2400)return;
  EV.cooldown[id]=now;
  EV.cur={msg:ph(typeof phrases==="string"?[phrases]:phrases),color,due:now+dur*1000,t0:now};
}

function updateEvents(){
  const p=CARS[0];
  const now=performance.now();
  if(EV.cur&&now>EV.cur.due)EV.cur=null;
  if(now-EV.lastCheck<220)return;
  EV.lastCheck=now;
  if(!EV.init){EV.init=true;EV.lastPlace=p.place;}
  rankCars();
  if(p.place!==EV.lastPlace){
    if(p.place<EV.lastPlace)ev("overtake",["ДА-А! ВЫШЕ ЖИВЁМ!","ОБОШЁЛ! Ха-ха!","ГОУ-ГОУ!","ВОТ ЭТО ОБГОН!","Э-ГО-ГОЙ!"],"#7CFC9B",.9);
    else ev("lost",["А-А-А, ОБОШЛИ!","НУ ВОТ, ТОЛЬКО НЕ ЭТО!","ДА ЛАДНО?","ОЙ-ЁЙ..."],"#ff8f8f",.8);
    EV.lastPlace=p.place;
  }
  if(p.pushT>1e-6&&!EV.pushedPrev)ev("push",["РА-ЗО-ЗА-ЗА!","БЕРЕГИСЬ, ГОЛУБЧИК!","СЕЙЧАС ТОЛКОМ!","ТАРАН!!","В ДОРОГУ ДАЁТСЯ!"],"#ff5b5b",1.1);
  EV.pushedPrev=p.pushT>1e-6;
  const spd=p.v;
  const look=T.M*clamp(spd/900,0.055,0.22);
  let maxCurv=0,hasRamp=false,hasPad=false,iceAhead=false,slowAhead=false;
  for(let k=4;k<look;k+=4){
    const q=at(T,p.a+k);
    const cu=Math.abs(q.curv);
    if(cu>maxCurv)maxCurv=cu;
    if(q.crest)hasRamp=true;
    if(q.surf===3)iceAhead=true;
    if(q.surf===1||q.surf===2)slowAhead=true;
  }
  for(const pd of T.pads){
    const dp=sDiff(p.a,pd.lo,T.M);
    if(dp>=0&&dp<look){hasPad=true;break;}
  }
  let done=false;
  if(!done&&Math.abs(p.d)>WH*1.15)ev("offroad",["ОЙ-ОЙ, СРЕЗАЛ!","ТОЛЬКО НЕ В ГРЯЗЬ!","МОЯ ПОЛОСА В ДРУГОМ МЕСТЕ!","АЙ, ВЪЕХАЛ В ГАЗОН!"],"#ff5b5b",1);
  if(!done&&Math.abs(p.d)>WH*1.15)done=true;
  if(!done&&hasRamp)ev("ramp",["УХ ТЫ, ГОРКА!","ЛЕТИ-И-ИМ!","БОЖЕ, ПОДБРАСЫВАЕТ!","ВАУ-У-У!","ЩА ПОЛЕТИМ!"],"#ffa21a",.9);
  if(!done&&hasRamp)done=true;
  if(!done&&maxCurv>0.0012&&spd>200)ev("turn",["ОСТОРОЖНО-О, ПРЕСС-ПРЕСС!","АЙ-ЯЙ-ЯЙ, КРУТО!","ТОРМОЗИ, ТОРМОЗИ!","НЕ ВЫЛЕЧУ!"],"#ff5b5b",.9);
  if(!done&&maxCurv>0.0012&&spd>200)done=true;
  if(!done&&maxCurv>0.0012)ev("turn2",["ВИРАЖ-ВИРАЖ!","ПОВОРОТИК, КРАСОТА!","ТУДА-СЮДА, ОСТОРОЖНО!"],"#ffd23e",.8);
  if(!done&&maxCurv>0.0012)done=true;
  if(!done&&hasPad)ev("boost",["ЕЕЕС! БУСТ!","ГОУ-ГОУ-ГОУ!","ХА-ХА, ГАЗУЕТ!","ВПЕРЁЁЁД!"],"#5cf",.9);
  if(!done&&hasPad)done=true;
  if(!done&&iceAhead)ev("ice",["ХОЛОДНО-О СО СКОЛЬЗКОЙ!","ФУХ, КАТОК! ДЕРЖИМСЯ!","АЙ, ЛЁД!"],"#aef",.9);
  if(!done&&iceAhead)done=true;
  if(!done&&slowAhead)ev("slow",["УХ, ГРЯЗЦА...","ТЯЖЕЛО БЕЖИТ МАШИНКА!","ЕЛЕ-ЕЛЕ ТАЩУ!"],"#c9b778",.9);
  if(!done&&slowAhead)done=true;
  if(!done&&maxCurv<0.0005&&spd>160)ev("straight",["ПРЯМИКОМ-КРАСОТА!","ПОГНАЛИИ!","СКОРОСТЬ-СКОРОСТЬ!","КРЫЛЬЯ РАСПРАВИЛ!"],"#7CFC9B",.8);
}

function drawShout(){
  if(!EV.cur)return;
  const e=EV.cur;
  const p=CARS[0];
  const now=performance.now();
  const prog=1-(e.due-now)/(e.dur*1000);
  const lift=clamp(p.airH*.5,0,100);
  const rise=prog*14;
  const alpha=Math.min(1,(e.due-now)/400);
  const bx=p.x,by=p.y-lift-58-rise;
  ctx.font="800 20px system-ui";
  const tw=ctx.measureText(e.msg).width;
  const bw2=tw+38,bh2=38;
  ctx.globalAlpha=clamp(alpha,0,1);
  ctx.fillStyle="rgba(255,255,255,0.96)";
  rr2(bx-bw2/2,by,bw2,bh2,10);
  ctx.fill();
  ctx.strokeStyle="#0b0e14";
  ctx.lineWidth=2.5;
  rr2(bx-bw2/2,by,bw2,bh2,10);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(bx-9,by+bh2-6);
  ctx.lineTo(bx+9,by+bh2-6);
  ctx.lineTo(bx,p.y-lift-34-rise);
  ctx.closePath();
  ctx.fillStyle="rgba(255,255,255,0.96)";
  ctx.fill();
  ctx.strokeStyle="#0b0e14";
  ctx.stroke();
  ctx.globalAlpha=1;
  ctx.fillStyle="#111";
  ctx.textAlign="center";
  ctx.fillText(e.msg,bx,by+25);
  ctx.globalAlpha=1;
}

function rr2(x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();
}

function drawMinimap(){
  const bw=198,bh=20;
  const bx=W-214,by=H-172;
  ctx.fillStyle="rgba(10,14,20,0.8)";
  ctx.fillRect(bx,by,bw,88);
  ctx.strokeStyle="rgba(255,255,255,0.12)";
  ctx.lineWidth=1;
  ctx.strokeRect(bx,by,bw,88);
  const pw=Math.max(prof.xmax-prof.xmin,1);
  const ph=Math.max(prof.ymax-prof.ymin,1);
  const sc=Math.min((bw-20)/pw,(66)/ph);
  const ox=bx+bw/2,oy=by+10+66/2;
  ctx.beginPath();
  for(let i=0;i<M;i++){
    const x=ox+(T.X[i]-CX)*sc,y=oy+(T.Y[i]-CY)*sc;
    if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
  }
  ctx.closePath();
  ctx.strokeStyle="rgba(255,255,255,0.24)";
  ctx.lineWidth=2;
  ctx.stroke();
  ctx.font="700 10px system-ui";
  ctx.textAlign="left";
  ctx.fillStyle="#9fb2c6";
  ctx.fillText("ПОЛЕ",bx+8,by+86);
  for(const c of CARS){
    const x=ox+(c.x-CX)*sc,y=oy+(c.y-CY)*sc;
    ctx.fillStyle=c.player?"#ffd23e":c.color;
    ctx.beginPath();ctx.arc(x,y,c.player?5:3.5,0,7);ctx.fill();
    ctx.strokeStyle="#0b0e14";
    ctx.lineWidth=1.5;
    ctx.stroke();
    if(c.player){
      ctx.strokeStyle="rgba(255,210,62,0.9)";
      ctx.lineWidth=1.5;
      ctx.beginPath();ctx.arc(x,y,8,0,7);ctx.stroke();
    }
  }
}

function buildProf(){
  const n=80,pp=[],ar=[];
  let mx=-9999,mn=9999,xmin=1e9,xmax=-1e9,ymin=1e9,ymax=-1e9;
  for(let i=0;i<M;i++){
    if(T.X[i]<xmin)xmin=T.X[i];
    if(T.X[i]>xmax)xmax=T.X[i];
    if(T.Y[i]<ymin)ymin=T.Y[i];
    if(T.Y[i]>ymax)ymax=T.Y[i];
  }
  for(let i=0;i<n;i++){
    const q=at(T,i/n*T.M);
    pp.push(q.h);
    if(q.h>mx)mx=q.h;
    if(q.h<mn)mn=q.h;
  }
  if(mx<1)mx=1;
  return {pp,mx,mn,xmin,xmax,ymin,ymax};
}

function insidePa(c,p,Tc){
  const d=sDiff(c.a,p.lo,Tc.M);
  const len=wrap2(p.hi-p.lo,Tc.M);
  return d>=0&&d<=len&&Math.abs(c.d)<WH*1.4;
}

function pt(x,y,n,col){
  const a=Math.random()*6.28,s=Math.random()*30+10;
  return {x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.35+Math.random()*.3,n,col};
}

function rankCars(){
  const list=CARS.slice().sort((a,b)=>bPos(b)-bPos(a));
  for(let i=0;i<list.length;i++)list[i].place=i+1;
  return list;
}
function bPos(c){
  return (c.lap-1)*T.M+wrap2(c.a-T.finish,T.M);
}

function collide(a,b,dt){
  const ga=sDiff(a.a,b.a,T.M);
  const gd=a.d-b.d;
  if(Math.abs(ga)>26||Math.abs(gd)>26)return;
  const rel=Math.abs(a.v-b.v);
  const strong=(a.pushT>1e-6&&a.player)||(b.pushT>1e-6&&b.player)||rel>200;
  const k=strong?2.2:1;
  if(Math.abs(gd)>2){
    const x=gd>0?1:-1;
    const step=Math.min((26-Math.abs(gd))/2,2.2*dt*120);
    const roomA=a.d>0?a.d<WH*1.4:a.d>-WH*1.4;
    const roomB=b.d>0?b.d<WH*1.4:b.d>-WH*1.4;
    if(roomA)a.d+=x*step*k;
    if(roomB)b.d-=x*step*k;
    a.dv+=x*(24+rel*.12)*k*dt;
    b.dv-=x*(24+rel*.12)*k*dt;
  }else{
    const px=ga>=0?1:-1;
    const step=Math.min((Math.abs(ga)||2)/2,1.2*dt*120);
    a.a+=px*step;
    b.a-=px*step;
    a.a=wrap2(a.a,T.M);b.a=wrap2(b.a,T.M);
  }
  const ex=Math.max(0,(b.v-a.v)*0.22);
  a.v+=ex;b.v-=ex;
  a.wob+=.7*k;b.wob+=.7*k;
  if(strong){
    a.flip=Math.max(a.flip||0,.7);
    b.flip=Math.max(b.flip||0,.7);
  }
  const mx=(a.x+b.x)/2,my=(a.y+b.y)/2;
  PARTS.push(pt(mx,my,Math.min(8,k*4),"#ffd23e"));
  if(performance.now()-audio.lastBump>90){
    audio.lastBump=performance.now();
    beep(120,.08,1,.035,60);
  }
}

function update(dt){
  if(raced)raceT+=dt;
  dt=Math.min(dt,0.033);
  const Tc=T;
  for(const c of CARS){
    let thr=1,brk=0,steer=0;
    if(c.player){
      steer=(keys.left?-1:0)+(keys.right?1:0);
      if(keys.down)brk=.6;
      c.pushT=keys.push?1:Math.max(0,c.pushT-dt*2);
    }else{
      const q=at(Tc,c.a);
      let want=-q.curv*(8+Math.min(4,c.v/200));
      want+=Math.sin(performance.now()*.0006+c.osc)*1.4*(.6+(c.skill-.9)*6);
      steer=clamp((want-c.d)*.05-c.dv*.007,-1,1);
      if(Math.abs(c.d)>WH*.8)steer=clamp(steer+(c.d>0?-1:1)*Math.min(.55,(Math.abs(c.d)-WH*.8)/10),-1,1);
      for(const o of CARS){
        if(o!==c&&Math.abs(sDiff(c.a,o.a,Tc.M))<8&&Math.abs(c.d-o.d)<26){
          steer=(sDiff(c.a,o.a,Tc.M)>0?1:-1)*1;
          thr=.65;
        }
      }
      c.pushT=Math.max(0,c.pushT-dt*2);
    }
    const q1=at(Tc,c.a);
    c.surf=q1.surf;
    const sf=SURF[c.surf];
    let onPad=false;
    for(const p of Tc.pads){
      if(insidePa(c,p,Tc)){onPad=true;break;}
    }
    const maxV=360*sf.spd*(c.pushT>0?1.35:1)*(onPad?2.1:1)*(c.boostT>0?1.5:1);
    if(c.grounded){
      const tg=maxV*(brk>0?(1-brk):1)*thr;
      if(c.v<tg)c.v+=300*sf.acc*(onPad?3:1)*thr*dt;
      else c.v-=300*dt;
      c.v=clamp(c.v,0,720);
    }
    if(c.pushT>0)c.v=Math.min(720,c.v+140*dt);
    if(onPad&&c.grounded){
      c.boostT=.5;
      PARTS.push(pt(c.x,c.y,20,"#8ccbff"));
    }
    if(c.boostT>0)c.boostT-=dt;
    const aPrev=c.a;
    c.a=wrap2(c.a+c.v*dt/Tc.avgU,Tc.M);
    const gripQ=c.grounded?sf.grip:.18;
    let lat=steer*220*gripQ*(.35+.65*Math.min(1,Math.abs(c.v)/220));
    lat*=Math.max(.25,Math.min(1,Math.abs(c.v)/160));
    c.dv=lerp(c.dv,lat,1-Math.exp(-dt*(c.grounded?4:.9)));
    if(Math.abs(lat)<20)c.dv*=Math.exp(-dt*2.5);
    c.d+=c.dv*dt;
    if(Math.abs(c.d)>WH*0.82){
      const over=Math.abs(c.d)-WH*0.82;
      c.dv-=Math.sign(c.d)*Math.min(18+over*8,150)*dt;
      if(over<9)c.dv*=Math.exp(-dt*5);
    }
    if(Math.abs(c.d)>WH*1.5)c.dv*=.5;
    c.d=clamp(c.d,-WH*1.6,WH*1.6);

    const q=at(Tc,c.a);
    if(c.grounded){
      c.airH=0;c.vz=0;
      if(q.crest&&c.v>120){
        c.vz=Math.min(120+c.v*.25,340);
        c.grounded=false;
        PARTS.push(pt(q.x,q.y,10,"#ffd9a6"));
        if(c.player&&performance.now()-audio.lastFx>200){
          audio.lastFx=performance.now();beep(300,.15,2,.03,90);
        }
      }else if(q.slope<-0.14&&-q.slope*c.v>170){
        c.vz=Math.min(-q.slope*c.v*.6,260);
        c.grounded=false;
        PARTS.push(pt(q.x,q.y,8,"#cfd8e0"));
        if(c.player&&performance.now()-audio.lastFx>200){
          audio.lastFx=performance.now();beep(260,.12,2,.03,110);
        }
      }else if(q.slope>0){
        c.v=Math.max(0,c.v-q.slope*GRAV*.4*dt);
      }
    }else{
      c.vz-=GRAV*dt;
      c.airH+=c.vz*dt;
      c.dv*=Math.exp(-dt*2.2);
      if(c.airH<=0){
        c.airH=0;c.grounded=true;
        if(c.vz< -140)c.v*=.9;
        if(c.vz< -200)c.flip=Math.max(c.flip||0,.9);
        if(c.player&&performance.now()-audio.lastFx>200){
          audio.lastFx=performance.now();beep(70,.1,1,.025,40);
        }
        if(c.vz<-200)for(let i=0;i<10;i++)PARTS.push(pt(q.x+(Math.random()-.5)*34,q.y+(Math.random()-.5)*12,4+Math.random()*5,"#d8cfc4"));
        else for(let i=0;i<6;i++)PARTS.push(pt(q.x,q.y,6,"#cfc9bd"));
      }
      c.d+=steer*12*dt;
      c.d=clamp(c.d,-WH*1.6,WH*1.6);
    }
    c.vz=Math.max(c.vz,-900);
    c.wob=Math.max(0,c.wob-dt*2);
    c.flip=Math.max(0,(c.flip||0)-dt*1.4);

    let crossed=false;
    if(aPrev<=Tc.finish&&c.a>Tc.finish)crossed=true;
    else if(c.a<aPrev&&c.a>Tc.finish)crossed=true;
    c.prevA=c.a;
    if(crossed){
      c.lap++;
      if(c.player){
        score+=100;
        beep(c.lap>=LAPS?520:380,.25,3,.04,c.lap>=LAPS?760:540);
      }
      if(c.lap>LAPS&&!c.finished){
        c.finished=true;
        rankCars();
        if(c.player){raced=true;raceT=.01;}
      }
    }
    c.x=q.x+q.nx*c.d;
    c.y=q.y+q.ny*c.d;
    c.ang=lerp(c.ang,q.ang,1-Math.exp(-dt*5));
    if(!isFinite(c.a)){c.a=wrap2(c.prevA,Tc.M);if(!isFinite(c.a))c.a=Tc.start;onErr("a=NaN, сброс");}
    if(!isFinite(c.d)){c.d=0;onErr("d=NaN, сброс");}
    if(!isFinite(c.v)){c.v=0;onErr("v=NaN, сброс");}
    if(!isFinite(c.x)||!isFinite(c.y)){onErr("x/y=NaN, сброс");c.x=q.x;c.y=q.y;}
  }
  for(let i=0;i<CARS.length;i++){
    for(let j=i+1;j<CARS.length;j++)collide(CARS[i],CARS[j],dt);
  }
  for(let i=PARTS.length-1;i>=0;i--){
    const p=PARTS[i];
    p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;
    if(p.life<=0)PARTS.splice(i,1);
  }
  updateEvents();
}

let LASTERR=null;
function onErr(e){
  try{
    LASTERR=(LASTERR?LASTERR+" | ":"")+String(e&&e.message||e).slice(0,80);
  }catch(_){}
  try{console.error("GAME:",e);}catch(_){}
}

function carStatus(c){
  if(c.flip>0)return {t:"ПЕРЕВЁРНУЛСЯ!",c:"#ff5b5b"};
  if(!c.grounded){
    if(c.vz>0)return {t:"В ПРЫЖКЕ!",c:"#ffa21a"};
    return {t:"ПОЛЁТ",c:"#5cf"};
  }
  if(c.surf===3&&Math.abs(c.dv)>60)return {t:"ЮЗ!",c:"#aef"};
  if(c.pushT>1e-6)return {t:"ТОЛКАШКА",c:"#ff8f8f"};
  return null;
}

function drawCar(c,tNow){
  try{drawCarFancy(c,tNow);}catch(e){onErr(e);}
  if(!isFinite(c.x)||!isFinite(c.y)){onErr("NaN-позиция машины");return;}
  const lift=clamp(c.airH*.4,0,46);
  const st=carStatus(c);
  if(st){
    const yy=c.y-lift-20;
    ctx.font="800 12px system-ui";
    ctx.textAlign="center";
    const tw=Math.max(20,ctx.measureText(st.t).width);
    ctx.fillStyle="rgba(8,12,16,0.85)";
    ctx.fillRect(c.x-tw/2-6,yy-13,tw+12,17);
    ctx.strokeStyle=st.c;
    ctx.lineWidth=1.5;
    ctx.strokeRect(c.x-tw/2-6,yy-13,tw+12,17);
    ctx.fillStyle=st.c;
    ctx.fillText(st.t,c.x,yy);
  }
  if(c.player){
    ctx.fillStyle="#ffd23e";
    ctx.strokeStyle="#0b0e14";
    ctx.lineWidth=2;
    ctx.font="800 14px system-ui";
    ctx.textAlign="center";
    ctx.fillText("ТЫ",c.x,c.y-lift-44);
  }
}

function drawCarFancy(c,tNow){
  const S=CARSCALE;
  const lift=clamp(c.airH*.5,0,100)+(c.airH>0?Math.sin(tNow*26+c.num)*2:0);
  ctx.globalAlpha=.16;
  ctx.fillStyle=c.color;
  ctx.beginPath();ctx.arc(c.x,c.y,18*S,0,7);ctx.fill();
  ctx.globalAlpha=clamp(.35*(1-lift/140),.06,.45);
  ctx.fillStyle="#000";
  ctx.beginPath();ctx.ellipse(c.x,c.y-4,15*S,9*S,0,0,7);ctx.fill();
  ctx.globalAlpha=1;
  ctx.save();
  ctx.translate(c.x,c.y-lift);
  ctx.rotate(c.ang+(c.flip>0?Math.PI:0));
  const hl=13*S,hw=10*S;
  ctx.fillStyle="#1a1c20";
  ctx.beginPath();ctx.ellipse(-hl*0.85,-hw*0.85,4.5*S,4.5*S,0,0,7);ctx.fill();
  ctx.beginPath();ctx.ellipse(-hl*0.85,hw*0.85,4.5*S,4.5*S,0,0,7);ctx.fill();
  ctx.beginPath();ctx.ellipse(hl*0.85,-hw*0.85,4.5*S,4.5*S,0,0,7);ctx.fill();
  ctx.beginPath();ctx.ellipse(hl*0.85,hw*0.85,4.5*S,4.5*S,0,0,7);ctx.fill();
  ctx.fillStyle="#0d0e11";
  ctx.fillRect(-hl,-hw,2*hl,2*hw);
  ctx.fillStyle=c.color;
  ctx.beginPath();
  ctx.moveTo(-hl, -hw);ctx.lineTo(hl,-hw);ctx.lineTo(hl+S,hw*0.3);ctx.lineTo(hl+S,hw);
  ctx.lineTo(hl-3*S,hw);ctx.lineTo(hl-3*S,hw);ctx.lineTo(-hl,hw);ctx.lineTo(-hl-2*S,hw*0.6);
  ctx.lineTo(-hl-2*S,-hw*0.6);
  ctx.closePath();ctx.fill();
  ctx.strokeStyle="#000";ctx.lineWidth=3*S;ctx.stroke();
  ctx.fillStyle="rgba(255,255,255,0.9)";
  ctx.beginPath();ctx.arc(2*S,0,4.5*S,0,7);ctx.fill();
  ctx.fillStyle="#111";
  ctx.font="800 "+Math.round(8*S)+"px system-ui";
  ctx.textAlign="center";
  ctx.fillText(c.num,2*S,3*S);
  ctx.fillStyle="#eef6ff";
  ctx.beginPath();ctx.arc(hl-2*S,-hw*0.55,2.6*S,0,7);ctx.fill();
  ctx.fillStyle="#ffd23e";
  ctx.beginPath();ctx.arc(-hl+3*S,0,2*S,0,7);ctx.fill();
  if(c.boostT>0||c.pushT>1e-6){
    const fl=(6+Math.random()*10)*S;
    ctx.fillStyle=c.pushT>1e-6?"rgba(255,70,70,0.85)":"rgba(120,205,255,0.9)";
    ctx.beginPath();
    ctx.moveTo(-hl-2*S,-3*S);ctx.lineTo(-hl-2*S-fl,0);ctx.lineTo(-hl-2*S,3*S);
    ctx.closePath();ctx.fill();
  }
  ctx.strokeStyle="rgba(255,255,255,0.85)";
  ctx.lineWidth=1.5*S;
  ctx.setLineDash([4,4]);
  ctx.beginPath();ctx.arc(0,0,hl+5*S,0,7);ctx.stroke();
  ctx.setLineDash([]);
  if(c.pushT>1e-6){
    ctx.strokeStyle="rgba(255,80,80,0.95)";
    ctx.lineWidth=3;
    ctx.setLineDash([5,4]);
    ctx.beginPath();ctx.arc(0,0,20*S,0,7);ctx.stroke();
    ctx.setLineDash([]);
  }
  if(c.player){
    ctx.strokeStyle="rgba(80,220,255,0.95)";
    ctx.lineWidth=2.5;
    ctx.setLineDash([6,5]);
    ctx.beginPath();ctx.arc(0,0,22*S,0,7);ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.restore();
  if(c.airH>0){
    ctx.save();
    ctx.translate(c.x,c.y-lift);
    ctx.rotate(tNow*18+c.num);
    ctx.fillStyle="rgba(185,215,245,0.32)";
    for(let k=0;k<5;k++){
      ctx.rotate(2.094);
      ctx.beginPath();
      ctx.ellipse(0,0,9*S,2.8*S,0,0,Math.PI*1.9);
      ctx.fill();
    }
    ctx.restore();
    ctx.fillStyle="rgba(40,60,80,0.9)";
    ctx.beginPath();ctx.arc(c.x,c.y-lift,2.2*S,0,7);ctx.fill();
  }
}

function drawSpectators(tNow){
  const rx=AX+40,ry=AY+40;
  for(let i=0;i<5;i++){
    const a=i*1.2566+tNow*.18;
    const x=CX+Math.cos(a)*rx, y=CY+Math.sin(a)*ry+Math.sin(tNow*2.5+i)*2;
    ctx.save();
    ctx.translate(x,y);
    ctx.strokeStyle="rgba(160,200,255,0.55)";
    ctx.lineWidth=1.4;
    const sp=tNow*40+i;
    ctx.beginPath();
    ctx.moveTo(Math.cos(sp)*7,Math.sin(sp)*7);
    ctx.lineTo(Math.cos(sp+Math.PI)*7,Math.sin(sp+Math.PI)*7);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(Math.cos(sp+Math.PI/2)*7,Math.sin(sp+Math.PI/2)*7);
    ctx.lineTo(Math.cos(sp+Math.PI*1.5)*7,Math.sin(sp+Math.PI*1.5)*7);
    ctx.stroke();
    ctx.fillStyle=i%2?"#ffd23e":"#aef";
    ctx.beginPath();ctx.arc(0,0,2.4,0,7);ctx.fill();
    ctx.fillStyle="rgba(120,220,255,0.2)";
    ctx.beginPath();
    ctx.moveTo(-4,-6);ctx.lineTo(4,-6);ctx.lineTo(0,26);
    ctx.closePath();ctx.fill();
    ctx.strokeStyle="rgba(255,255,255,0.75)";
    ctx.fillStyle="rgba(8,12,16,0.6)";
    ctx.fillRect(-16,-22,32,12);
    ctx.strokeRect(-16,-22,32,12);
    ctx.fillStyle="#c7e8ff";
    ctx.font="600 8px system-ui";
    ctx.textAlign="center";
    ctx.fillText("КАМ"+(i+1),0,-13);
    ctx.restore();
  }
}

function drawProfile(){
  const bx=W-214,by=H-76,bw=198,bh=60;
  ctx.fillStyle="rgba(10,14,20,0.78)";
  ctx.fillRect(bx,by,bw,bh);
  ctx.strokeStyle="rgba(255,255,255,0.12)";
  ctx.lineWidth=1;
  ctx.strokeRect(bx,by,bw,bh);
  ctx.font="600 10px system-ui";
  ctx.textAlign="left";
  ctx.fillStyle="#9fb2c6";
  ctx.fillText("ПРОФИЛЬ ГОРКИ",bx+6,by+12);
  const n=prof.pp.length;
  const hs=prof.mx-prof.mn||1;
  ctx.strokeStyle="#ffd23e";
  ctx.lineWidth=1.5;
  ctx.beginPath();
  for(let i=0;i<n;i++){
    const x=bx+12+i/(n-1)*(bw-24);
    const y=by+bh-10-((prof.pp[i]-prof.mn)/hs)*(bh-20);
    if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
  }
  ctx.stroke();
  const pc=CARS[0];
  const mi=wrap2(pc.a/T.M,1)*(n-1);
  const mx2=bx+12+mi/(n-1)*(bw-24);
  const my2=by+bh-10-((prof.pp[Math.floor(mi)]-prof.mn)/hs)*(bh-20);
  ctx.fillStyle="#5cf";
  ctx.beginPath();ctx.arc(mx2,my2,3,0,7);ctx.fill();
}

function panel(x,y,w,h,label,value){
  ctx.fillStyle="rgba(10,14,20,0.78)";
  ctx.fillRect(x,y,w,h);
  ctx.strokeStyle="rgba(255,255,255,0.12)";
  ctx.lineWidth=1;
  ctx.strokeRect(x,y,w,h);
  ctx.font="700 12px system-ui";
  ctx.textAlign="left";
  ctx.fillStyle="#9fb2c6";
  ctx.fillText(label,x+12,y+20);
  ctx.font="800 22px system-ui";
  ctx.fillStyle="#ffd23e";
  ctx.fillText(value,x+12,y+46);
}

function drawHUD(){
  rankCars();
  const p=CARS[0];
  if(LASTERR){
    ctx.fillStyle="rgba(200,50,50,0.92)";
    ctx.font="700 13px system-ui";
    ctx.textAlign="left";
    ctx.fillText("ОШИБКА: "+LASTERR,26,228);
  }
  panel(24,24,190,64,"МЕСТО",""+p.place+" / "+CARS.length);
  panel(24,102,190,64,"КРУГ",""+Math.min(p.lap,LAPS)+" / "+LAPS);
  panel(24,180,190,64,"СКОРОСТЬ",""+Math.round(p.v*.28)+" КМ/Ч");
  const stP=carStatus(p);
  ctx.font="800 15px system-ui";
  ctx.textAlign="left";
  ctx.fillStyle=stP?stP.c:"#9fb2c6";
  ctx.fillText("СОСТОЯНИЕ: "+(stP?stP.t:"еду ровно"),28,262);
  ctx.font="700 13px system-ui";
  ctx.fillStyle="#7CFC9B";
  ctx.fillText("ВВОД: "+(keys.left?"\u25C0 ":"- ")+(keys.right?"\u25B6 ":"- ")+(keys.down?"\u25BC ":"- ")+(keys.push?"G":"-"),28,282);
  const sf=SURF[p.surf];
  ctx.fillStyle="rgba(10,14,20,0.78)";
  ctx.fillRect(W-224,24,200,52);
  ctx.strokeStyle="rgba(255,255,255,0.12)";
  ctx.strokeRect(W-224,24,200,52);
  ctx.fillStyle=sf.col;
  ctx.beginPath();ctx.arc(W-204,50,9,0,7);ctx.fill();
  ctx.font="800 18px system-ui";
  ctx.textAlign="left";
  ctx.fillStyle="#ffffff";
  ctx.fillText("ПОКРЫТИЕ",W-184,42);
  ctx.fillStyle="#ffd23e";
  ctx.font="700 16px system-ui";
  ctx.fillText(sf.name,W-184,66);
  if(p.boostT>0){
    ctx.fillStyle="rgba(10,14,20,0.8)";
    ctx.fillRect(W-224,84,Math.max(10,200*(p.boostT/.5)),12);
  }
  drawMinimap();
  ctx.fillStyle="rgba(10,14,20,0.85)";
  ctx.fillRect(24,H-150,420,120);
  ctx.strokeStyle="rgba(255,255,255,0.12)";
  ctx.strokeRect(24,H-150,420,120);
  ctx.font="600 12px system-ui";
  ctx.textAlign="left";
  ctx.fillStyle="#aebecf";
  ctx.fillText("УПРАВЛЕНИЕ",40,H-128);
  ctx.font="600 16px system-ui";
  ctx.fillStyle="#e8eef5";
  const lines=[
    "\u2190 \u2192 / A D  \u2014 руль",
    "S / \u2193          \u2014 тормоз",
    "G               \u2014 ТОЛКАШКА (разбег + таран)",
    "R                 \u2014 реванш",
    "Enter           \u2014 следующий трек",
    "M                 \u2014 звук вкл/выкл"
  ];
  for(let i=0;i<lines.length;i++)ctx.fillText(lines[i],40,H-104+i*20);
  drawProfile();
  drawBanner();
  ctx.font="11px system-ui";
  ctx.fillStyle="rgba(255,255,255,0.4)";
  ctx.textAlign="left";
  ctx.fillText("build "+BUILD,26,H-14);
}

function drawOverlay(){
  rankCars();
  ctx.fillStyle="rgba(5,8,12,0.66)";
  ctx.fillRect(0,0,W,H);
  ctx.textAlign="center";
  ctx.font="800 56px system-ui";
  ctx.fillStyle="#ffd23e";
  ctx.fillText("ФИНИШ!",CX,250);
  const p=CARS[0];
  ctx.font="800 34px system-ui";
  ctx.fillStyle="#ffffff";
  ctx.fillText("МЕСТО "+p.place+" / "+CARS.length,CX,310);
  ctx.font="600 20px system-ui";
  ctx.fillStyle="#aebecf";
  ctx.fillText("ТРЕК «"+T.name+"» · кругов пройдено: "+Math.min(p.lap-1,LAPS),CX,350);
  const rows=CARS.slice().sort((a,b)=>a.place-b.place);
  const tw=460,th=12+rows.length*27;
  const tx=CX-tw/2, ty=382;
  ctx.fillStyle="rgba(10,14,20,0.88)";
  ctx.fillRect(tx,ty,tw,th);
  ctx.strokeStyle="rgba(255,255,255,0.15)";
  ctx.strokeRect(tx,ty,tw,th);
  ctx.font="800 15px system-ui";
  ctx.textAlign="left";
  ctx.fillStyle="#ffd23e";
  ctx.fillText("ТАБЛО ЗАЕЗДА",tx+16,ty+20);
  rows.forEach((c,i)=>{
    const y=ty+46+i*27;
    ctx.font="700 15px system-ui";
    ctx.fillStyle=c.player?"#ffd23e":"#aebecf";
    ctx.fillText((c.place)+".",tx+18,y);
    ctx.beginPath();
    ctx.fillStyle=c.color;
    ctx.arc(tx+58,y-5,8,0,7);
    ctx.fill();
    ctx.fillStyle=c.player?"#ffe9a8":"#ffffff";
    ctx.fillText((c.player?"ТЫ — №":"№")+c.num,tx+76,y);
    ctx.textAlign="right";
    ctx.fillStyle=c.player?"#ffd23e":"#d7e2ec";
    ctx.fillText(c.lap>LAPS?"ФИНИШ":("круг "+Math.min(c.lap,LAPS)),tx+tw-16,y);
    ctx.textAlign="left";
  });
  ctx.font="600 20px system-ui";
  ctx.fillStyle="#aebecf";
  ctx.textAlign="center";
  ctx.fillText("Enter — следующий трек ("+((T.seed%30)+1)+"/30)   ·   R — реванш",CX,ty+th+34);
}

function frame(tNow){
  const now=performance.now();
  const dt=Math.min(.05,(now-frame.tPrev)/1000);
  frame.tPrev=now;
  try{update(dt);}catch(e){onErr(e);}
  const tt=tNow/1000;
  ctx.drawImage(T.img,0,0);
  try{drawSpectators(tt);}catch(e){}
  const sorted=CARS.slice().sort((a,b)=>a.a-b.a);
  for(const c of sorted){
    try{drawCar(c,tt,0);}catch(e){}
  }
  for(const p of PARTS){
    ctx.globalAlpha=clamp(p.life/.4,0,1);
    ctx.fillStyle=p.col;
    ctx.beginPath();ctx.arc(p.x,p.y,p.n,0,7);ctx.fill();
  }
  ctx.globalAlpha=1;
  try{drawHUD();}catch(e){}
  if(raced&&raceT>1)drawOverlay();
  requestAnimationFrame(frame);
}
frame.tPrev=0;

window.addEventListener("keydown",e=>{
  const c=e.code;
  if(c==="ArrowLeft"||c==="ArrowRight"||c==="ArrowUp"||c==="ArrowDown"||c==="Space")e.preventDefault();
  if(c==="ArrowLeft"||c==="KeyA")keys.left=true;
  else if(c==="ArrowRight"||c==="KeyD")keys.right=true;
  else if(c==="ArrowDown"||c==="KeyS")keys.down=true;
  else if(c==="KeyG")keys.push=true;
  else if(c==="Enter"){
    if(raced&&raceT>1)resetRace((T.seed+1)%30);
  }
  else if(c==="KeyR"){
    resetRace(T?(T.seed%30):0);
  }
  else if(c==="KeyM"){
    audio.muted=!audio.muted;
    beep(400,.06,2,.04,600);
  }
});
window.addEventListener("keyup",e=>{
  const c=e.code;
  if(c==="ArrowLeft"||c==="KeyA")keys.left=false;
  else if(c==="ArrowRight"||c==="KeyD")keys.right=false;
  else if(c==="ArrowDown"||c==="KeyS")keys.down=false;
  else if(c==="KeyG")keys.push=false;
});

resetRace(0);
prof=buildProf();

const splash=document.getElementById("splash");
function dismissSplash(){
  if(splash){splash.style.display="none";}
  cv.focus({preventScroll:true});
}
if(splash)splash.addEventListener("click",dismissSplash);
window.addEventListener("keydown",()=>{
  if(splash&&splash.style.display!=="none")dismissSplash();
},{capture:true});
document.addEventListener("pointerdown",()=>{
  if(splash&&splash.style.display!=="none")dismissSplash();
  else if(document.activeElement!==cv)cv.focus({preventScroll:true});
});
window.addEventListener("blur",()=>{
  keys.left=keys.right=keys.down=keys.push=false;
});
cv.focus({preventScroll:true});

requestAnimationFrame(frame);
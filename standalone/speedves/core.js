"use strict";
const cv=document.getElementById("cv");
const ctx=cv.getContext("2d");
const W=1280,H=720,CX=W/2,CY=H/2+10,AX=545,AY=300;
const M=720,WH=34,GRAV=1700,LAPS=3;
const NAMES=["Старт","Вихрь","Лиман","Браво","Гром","Замок","Метла","Пик","Урал",
"Лагуна","Кобра","Молния","Орбита","Радуга","Шаман","Пурга","Вулкан","Тайфун",
"Космос","Заря","Скала","Носта","Гейзер","Купол","Сирена","Атом","Герц",
"Байкал","Тамара","Финал"];
const SURF=[
{name:"Асфальт",col:"#3a3d42",grip:1,  spd:1,  acc:1 },
{name:"Газон",  col:"#4c8f3a",grip:.55, spd:.5, acc:.5},
{name:"Гравий", col:"#a98c62",grip:.8,  spd:.62,acc:.7},
{name:"Лёд",    col:"#c2e9f8",grip:.55, spd:.9, acc:.65}
];
const CARCOL=["#ff4436","#2f9bff","#31e04f","#ff0f76","#ffa21a","#9b51e0","#19c8bd","#f5f2e8"];

let T=null,CARS=[],PARTS=[];
let raced=false,raceT=0,score=0;
const keys={left:false,right:false,down:false,push:false};
const audio={ac:null,lastBump:0,lastFx:0,lastAny:0,muted:false};
const OSC=["square","triangle","sawtooth","sine"];

function initAudio(){
  if(!audio.ac){
    try{
      const AC=window.AudioContext||window.webkitAudioContext;
      if(AC)audio.ac=new AC();
    }catch(e){}
  }
  if(audio.ac&&audio.ac.state==="suspended"){
    try{audio.ac.resume();}catch(e){}
  }
}

function beep(f,dur,type,vol,slide){
  if(audio.muted)return;
  if(!audio.ac)return;
  try{
    if(performance.now()-audio.lastAny<35)return;
    audio.lastAny=performance.now();
    const t=audio.ac.currentTime;
    const o=audio.ac.createOscillator();
    const g=audio.ac.createGain();
    if(typeof type==="number")o.type=OSC[type]||"square";
    else o.type=type||"square";
    o.frequency.setValueAtTime(f,t);
    if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(40,slide),t+dur);
    g.gain.setValueAtTime(vol||.05,t);
    g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g);g.connect(audio.ac.destination);o.start(t);o.stop(t+dur);
  }catch(e){}
}

function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);
t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

function lerp(a,b,t){return a+(b-a)*t;}
function clamp(v,a,b){return v<a?a:(v>b?b:v);}
function wrap2(v,n){v=v%n;if(v<0)v+=n;return v;}
function sDiff(a,b,n){let d=wrap2(a-b,n);if(d>n/2)d-=n;return d;}

function genTrack(seed){
  const RNG=mulberry32(seed);
  const name=NAMES[seed%30];
  const X=[],Y=[],hA=[],angA=[],dsA=[],surfA=[],crestA=[];
  const p1=RNG()*6.28,p2=RNG()*6.28,p3=RNG()*6.28,p4=RNG()*6.28;
  const w1=.02+RNG()*.06, w2=.01+RNG()*.05, w3=RNG()*.03;
  for(let i=0;i<M;i++){
    const t=i/M*Math.PI*2;
    let f=.8+w1*Math.sin(2*t+p1)+w2*Math.sin(3*t+p2)+w3*Math.sin(5*t+p3);
    f=clamp(f,.66,.92);
    X[i]=CX+Math.cos(t)*AX*f;
    Y[i]=CY+Math.sin(t)*AY*f;
  }
  let U=0,prev=0;
  for(let i=0;i<M;i++){
    const i0=(i-1+M)%M,i1=(i+1)%M;
    const base=Math.atan2(Y[i1]-Y[i0],X[i1]-X[i0]);
    let d=base-prev;
    while(d>Math.PI)d-=Math.PI*2;
    while(d< -Math.PI)d+=Math.PI*2;
    U+=d;prev=base;
    angA[i]=U;
    dsA[i]=Math.hypot(X[(i+1)%M]-X[i],Y[(i+1)%M]-Y[i]);
  }
  let L=0;for(let i=0;i<M;i++)L+=dsA[i];
  const avgU=L/M;
  const rampA=[];
  for(let i=0;i<M;i++){hA[i]=1.1*Math.sin(6.283*(i/M)*3+p4)+.6*Math.sin(6.283*(i/M)*7+p4*1.7);}
  const nR=2+Math.floor(RNG()*3);
  for(let r=0;r<nR;r++){
    const span=(.07+RNG()*.05)*M;
    const mid=Math.floor(RNG()*M);
    const lo=mid-span/2,hi=mid+span/2;
    const rh=16+RNG()*18;
    for(let i=0;i<M;i++){
      const d=Math.abs(((i-mid+M*2)%M+M)%M);
      if(d<=span/2){
        const k=Math.sin(Math.PI*d/span);
        hA[i]+=rh*k*k;
      }
    }
    rampA.push({lo,hi,mid,h:rh});
    crestA[mid]=true;
  }
  const surfMode=Math.floor(RNG()*4);
  for(let i=0;i<M;i++)surfA[i]=0;
  if(surfMode===1){for(let i=0;i<M;i++)surfA[i]=1;}
  else if(surfMode===2){for(let i=0;i<M;i++)surfA[i]=2;}
  else if(surfMode===3){for(let i=0;i<M;i++)surfA[i]=3;}
  else{
    let run=0;
    for(let i=0;i<M;i++){
      if(run<=0){
        const ty=1+Math.floor(RNG()*3);
        run=Math.floor(40+RNG()*110);
        for(let k=0;k<run&&i+k<M;k++)surfA[i+k]=ty;
      }else run--;
    }
  }
  const pads=[];
  const nP=3+Math.floor(RNG()*3);
  for(let p=0;p<nP;p++){
    const lo=Math.floor(RNG()*M);
    const sp=Math.floor((.05+RNG()*.06)*M);
    const pi=Math.floor((lo+sp/2)%M);
    pads.push({lo,hi:wrap2(lo+sp,M),sp,tx:Math.cos(angA[pi]),ty:Math.sin(angA[pi])});
  }
  const curvA=[],ST=14;
  for(let i=0;i<M;i++){
    let a1=angA[(i-ST+M)%M],a2=angA[(i+ST)%M];
    let d=a2-a1;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;
    curvA[i]=d/(2*ST*avgU);
  }
  const NX=[],NY=[];
  for(let i=0;i<M;i++){
    NX[i]=-Math.sin(angA[i]);
    NY[i]=Math.cos(angA[i]);
  }
  const finish=30,start=70;
  return {seed,name,X,Y,NX,NY,angA,dsA,hA,surfA,crestA,rampA,pads,curvA,L,avgU,finish,start,M,
          img:document.createElement("canvas")};
}

function at(T,a){
  a=wrap2(a,T.M);
  const i0=Math.floor(a),f=a-i0,i1=(i0+1)%T.M;
  return {
    x:lerp(T.X[i0],T.X[i1],f), y:lerp(T.Y[i0],T.Y[i1],f),
    nx:lerp(T.NX[i0],T.NX[i1],f), ny:lerp(T.NY[i0],T.NY[i1],f),
    h:lerp(T.hA[i0],T.hA[i1],f),
    surf:T.surfA[i0],
    crest:T.crestA[i0]||T.crestA[(i0+3)%T.M]||T.crestA[(i0+6)%T.M],
    slope:(T.hA[i1]-T.hA[i0])/Math.max(1,T.dsA[i0]),
    curv:T.curvA[i0],
    ang:lerp(T.angA[i0],T.angA[i1],f)
  };
}

function makeCars(T){
  CARS=[];
  for(let i=0;i<8;i++){
    const d=(i-3.5)*8;
    CARS.push({
      player:i===0,
      a:T.start, prevA:T.start,
      d, dv:0, v:0, airH:0, vz:0, grounded:true,
      lap:1, finished:false, place:8, wob:0,
      boostT:0, pushT:0, flip:0,
      color:CARCOL[i%CARCOL.length], num:i+1,
      skill:.9+Math.random()*.25, osc:Math.random()*6.28,
      surf:0, x:CX, y:CY, ang:0
    });
  }
}

function resetRace(seed){
  T=genTrack(seed);
  makeCars(T);
  preRender(T);
  PARTS=[];
  raced=false;raceT=0;score=0;
}
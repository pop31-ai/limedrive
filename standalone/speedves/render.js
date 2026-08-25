"use strict";

function preRender(T){
  const c=T.img;
  c.width=W;c.height=H;
  const g=c.getContext("2d");
  g.clearRect(0,0,W,H);
  g.fillStyle="#17202b";g.fillRect(0,0,W,H);
  g.strokeStyle="rgba(255,255,255,0.05)";g.lineWidth=30;
  g.strokeRect(20,20,W-40,H-40);
  g.strokeStyle="#3b4b5f";g.lineWidth=6;g.strokeRect(16,16,W-32,H-32);
  const rows=[["#b5443c",.5],["#8c3630",.42],["#e8dcc4",.9]];
  for(let i=0;i<rows.length;i++){
    const m=26+i*4;
    g.strokeStyle=rows[i][0];g.globalAlpha=rows[i][1];
    g.lineWidth=7;g.strokeRect(m,m,W-2*m,H-2*m);
  }
  g.globalAlpha=1;
  g.fillStyle="#3e7a33";
  g.beginPath();g.ellipse(CX,CY,AX+46,AY+46,0,0,7);g.fill();
  g.save();
  g.beginPath();g.ellipse(CX,CY,AX+46,AY+46,0,0,7);g.clip();
  for(let i=0;i<26;i++){
    g.fillStyle=i%2?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.06)";
    g.fillRect(i*90-W,0,90,H);
  }
  g.restore();

  const band=(lo,hi,inset,cc,alpha)=>{
    if(alpha!==1)g.globalAlpha=alpha;
    g.fillStyle=cc;
    g.beginPath();
    for(let k=Math.ceil(lo);k<=Math.floor(hi);k++){
      const q=at(T,k);
      g.lineTo(q.x+q.nx*(WH+inset),q.y+q.ny*(WH+inset));
    }
    for(let k=Math.floor(hi);k>=Math.ceil(lo);k--){
      const q=at(T,k);
      g.lineTo(q.x-q.nx*(WH+inset),q.y-q.ny*(WH+inset));
    }
    g.closePath();g.fill();g.globalAlpha=1;
  };

  band(0,M-1,0,"#31343a",1);

  let runStart=0,runTy=T.surfA[0];
  for(let i=1;i<=M;i++){
    const ty=i<M?T.surfA[i]:T.surfA[0];
    if(ty!==runTy||i===M){
      if(runTy>0)band(runStart-0.6,i-1.6,0,SURF[runTy].col,1);
      runStart=i;runTy=ty;
    }
  }

  for(let i=0;i<M;i++){
    const s=T.surfA[i];
    if(s===1){g.fillStyle="rgba(0,0,0,0.07)";g.fillRect(T.X[i]-2,T.Y[i]-2,4,4);}
    else if(s===2){g.fillStyle="rgba(0,0,0,0.18)";g.beginPath();g.arc(T.X[i],T.Y[i],1.6,0,7);g.fill();}
  }

  g.strokeStyle="rgba(255,255,255,0.28)";g.lineWidth=2;
  const offs=[-WH*0.5,WH*0.5];
  for(const off of offs){
    let even=true;
    for(let i=0;i<M;i+=5){
      if(even){
        const q=at(T,i),q2=at(T,i+4);
        g.beginPath();
        g.moveTo(q.x+q.nx*off,q.y+q.ny*off);
        g.lineTo(q2.x+q2.nx*off,q2.y+q2.ny*off);
        g.stroke();
      }
      even=!even;
    }
  }

  for(let off=-WH*0.92;off<=-WH*0.6;off+=WH*0.32){
    for(let i=0;i<M;i+=3){
      const q=at(T,i);
      g.fillStyle=i%6<3?"#d43a3a":"#f0ede6";
      g.beginPath();g.arc(q.x+q.nx*off,q.y+q.ny*off,3,0,7);g.fill();
    }
  }

  for(const p of T.pads){
    band(p.lo,p.hi,0,"rgba(255,102,0,0.95)",1);
    let n=0;
    for(let i=Math.ceil(p.lo);i<Math.floor(p.hi);i+=6){
      const q=at(T,i);
      const xc=q.x+q.nx*6, yc=q.y+q.ny*6;
      if(n%3===0){
        g.fillStyle="rgba(255,255,255,0.85)";
        g.beginPath();
        g.moveTo(xc+p.tx*10-3, yc+p.ty*10-6);
        g.lineTo(xc+p.tx*10+4, yc+p.ty*10);
        g.lineTo(xc+p.tx*10-3, yc+p.ty*10+6);
        g.closePath();g.fill();
      }
      n++;
    }
  }

  for(const r of T.rampA){
    band(r.lo,r.hi,0,"rgba(232,84,42,0.45)",1);
    for(let i=Math.ceil(r.lo);i<Math.floor(r.hi);i+=4){
      const q=at(T,i);
      g.strokeStyle=i%8<4?"#ffd23e":"#ffffff";
      g.lineWidth=3;
      g.beginPath();
      const p1=at(T,i-1),p2=at(T,i+1);
      const dx=p2.x-p1.x,dy=p2.y-p1.y,ll=Math.hypot(dx,dy)||1;
      const nx=-dy/ll,ny=dx/ll;
      g.moveTo(q.x+nx*(WH+4),q.y+ny*(WH+4));
      g.lineTo(q.x-nx*(WH+4),q.y-ny*(WH+4));
      g.stroke();
    }
  }

  band(T.finish-2,T.finish+2,0,"#f3f0e8",1);
  g.save();
  g.beginPath();
  g.rect(0,0,W,H);g.clip();
  for(let i=0;i<9;i++){
    const q=at(T,lerp(T.finish-2,T.finish+2,i/8));
    g.fillStyle=i%2?"#141414":"#ffffff";
    g.fillRect(q.x-4,q.y-13,8,26);
  }
  const fq=at(T,T.finish);
  g.fillStyle="rgba(20,26,34,0.75)";
  g.fillRect(fq.x-fq.ny*44-30, fq.y-fq.nx*44-10,60,20);
  g.fillStyle="#ffffff";
  g.font="700 13px system-ui";
  g.textAlign="center";
  g.fillText("ФИНИШ", fq.x, fq.y+5);
  g.restore();

  for(let i=0;i<8;i++){
    const q=at(T,T.start+2+i*1.1);
    g.fillStyle="rgba(255,255,255,0.8)";
    g.fillRect(q.x-1.5,q.y-12,3,24);
  }

  g.save();
  g.translate(CX,42);
  g.textAlign="center";
  g.font="700 30px system-ui";
  g.fillStyle="#ffd23e";
  g.fillText("АРЕНА ДРОН-ГОНКИ",0,0);
  g.font="600 18px system-ui";
  g.fillStyle="#aebecf";
  g.fillText("ТРЕК "+((T.seed%30)+1)+"/30 · «"+T.name+"»",0,26);
  g.restore();
}
import { useState, useEffect, useRef } from "react";
import { C } from "../constants/colors";
import { Btn, Msg, Controls, Lgd, Label, TInput } from "./UI";

export function SortViz({compute,isSel}) {
  const [inp,setInp]=useState("64 34 25 12 22 11 90 45 37 60");
  const [steps,setSteps]=useState([]);
  const [step,setStep]=useState(-1);
  const [playing,setPlaying]=useState(false);
  const [speed,setSpeed]=useState(450);
  const tmr=useRef(null);

  const run=()=>{
    clearInterval(tmr.current);
    const raw=inp.trim().split(/\s+/).map(Number).filter(n=>isFinite(n));
    if(raw.length<2) return;
    const s=compute(raw.slice(0,16));
    setSteps(s); setStep(0); setPlaying(false);
  };

  useEffect(()=>{
    if(!playing||!steps.length) return;
    tmr.current=setInterval(()=>setStep(p=>p>=steps.length-1?(clearInterval(tmr.current),p):p+1),speed);
    return()=>clearInterval(tmr.current);
  },[playing,speed,steps.length]);

  useEffect(()=>{
    if(playing&&step>=steps.length-1&&steps.length>0) setPlaying(false);
  },[step,playing,steps.length]);

  const cs=steps[step];
  const arr=cs?cs.arr:[];
  const maxV=arr.length?Math.max(...arr,1):1;
  const go=fn=>{clearInterval(tmr.current);setPlaying(false);fn();};

  const barColor=i=>{
    if(!cs) return C.accent;
    if(cs.sorted?.[i]) return C.green;
    if(cs.cmp?.includes(i)){
      if(cs.swapped) return C.red;
      if(isSel&&i===cs.cmp[0]) return C.purple;
      return C.amber;
    }
    return C.accent;
  };

  const message=!cs?"Masukkan angka dan klik Mulai"
    :cs.done?"✓ Array telah terurut sepenuhnya!"
    :cs.swapped?`↔ Tukar ${cs.vA} dengan ${cs.vB} (indeks ${cs.cmp[0]} ↔ ${cs.cmp[1]})`
    :isSel?`Cari minimum: arr[${cs.cmp[0]}]=${cs.vA} vs arr[${cs.cmp[1]}]=${cs.vB}`
    :`Bandingkan arr[${cs.cmp[0]}]=${cs.vA} dengan arr[${cs.cmp[1]}]=${cs.vB}`;

  return (
    <div>
      <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:20}}>
        <div style={{flex:1,minWidth:180}}>
          <Label>Array angka (spasi-terpisah, maks 16 elemen)</Label>
          <TInput value={inp} onChange={e=>setInp(e.target.value)}/>
        </div>
        <Btn primary onClick={run} style={{alignSelf:"flex-end"}}>Mulai</Btn>
      </div>

      <div style={{background:C.surface,borderRadius:10,border:`1px solid ${C.border}`,padding:"14px 12px 0",marginBottom:4,minHeight:200}}>
        <div style={{display:"flex",alignItems:"flex-end",gap:4,height:155}}>
          {arr.map((v,i)=>(
            <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2,height:"100%",justifyContent:"flex-end"}}>
              <span style={{fontSize:10,color:C.muted,lineHeight:1}}>{v}</span>
              <div style={{width:"100%",minHeight:6,height:`${Math.max((v/maxV)*130,6)}px`,
                background:barColor(i),borderRadius:"3px 3px 0 0",
                transition:"height 0.22s ease,background 0.22s ease"}}/>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:4,paddingTop:4,paddingBottom:8}}>
          {arr.map((_,i)=><div key={i} style={{flex:1,textAlign:"center",fontSize:10,color:C.muted}}>{i}</div>)}
        </div>
      </div>

      <Msg>{message}</Msg>
      {steps.length>0&&(
        <Controls step={step} total={steps.length} playing={playing}
          onPrev={()=>go(()=>setStep(s=>Math.max(0,s-1)))}
          onPlay={()=>{
            if(!playing&&step>=steps.length-1){setStep(0);setPlaying(true);}
            else setPlaying(p=>!p);
          }}
          onNext={()=>go(()=>setStep(s=>Math.min(steps.length-1,s+1)))}
          onReset={()=>go(()=>setStep(0))}
          speed={speed} onSpeed={setSpeed}/>
      )}
      <Lgd items={[
        {color:C.accent,label:"Normal"},
        {color:C.amber,label:isSel?"Dibandingkan":"Membandingkan"},
        {color:C.red,label:"Menukar"},
        ...(isSel?[{color:C.purple,label:"Minimum saat ini"}]:[]),
        {color:C.green,label:"Sudah urut"},
      ]}/>
    </div>
  );
}

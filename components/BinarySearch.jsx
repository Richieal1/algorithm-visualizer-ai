import { useState, useEffect, useRef } from "react";
import { C } from "../constants/colors";
import { binarySteps } from "../algorithms";
import { Btn, Msg, Controls, Lgd, Label, TInput } from "./UI";

export function BinarySearch() {
  const [inp,setInp]=useState("2 5 8 12 16 23 38 56 72 91");
  const [tgt,setTgt]=useState("23");
  const [arr,setArr]=useState([]);
  const [target,setTarget]=useState(0);
  const [steps,setSteps]=useState([]);
  const [step,setStep]=useState(-1);
  const [playing,setPlaying]=useState(false);
  const [speed,setSpeed]=useState(900);
  const tmr=useRef(null);

  const run=()=>{
    clearInterval(tmr.current);
    const raw=inp.trim().split(/\s+/).map(Number).filter(n=>isFinite(n));
    if(!raw.length) return;
    const sorted=[...new Set(raw)].sort((a,b)=>a-b);
    const t=parseInt(tgt); if(isNaN(t)) return;
    setArr(sorted); setTarget(t);
    const s=binarySteps(sorted,t);
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
  const go=fn=>{clearInterval(tmr.current);setPlaying(false);fn();};

  const bStyle=i=>{
    if(!cs) return {bg:C.surface2,bd:C.border,tx:C.text};
    if(i===cs.mid) return cs.found>=0?{bg:"#0e2a1f",bd:C.green,tx:C.green}:{bg:"#2a2012",bd:C.amber,tx:C.amber};
    if(i<cs.lo||i>cs.hi) return {bg:C.surface,bd:C.border,tx:C.muted};
    return {bg:"#141b2e",bd:C.accent,tx:C.text};
  };

  const message=!cs?"Masukkan array dan target, lalu klik Mulai"
    :cs.found>=0?`✓ Nilai ${target} ditemukan di indeks ${cs.found}!`
    :cs.done?`✗ Nilai ${target} tidak ada dalam array`
    :arr[cs.mid]<target?`arr[${cs.mid}] = ${arr[cs.mid]} < ${target} → geser Left ke indeks ${cs.mid+1}`
    :`arr[${cs.mid}] = ${arr[cs.mid]} > ${target} → geser Right ke indeks ${cs.mid-1}`;

  return (
    <div>
      <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:20}}>
        <div style={{flex:1,minWidth:180}}>
          <Label>Array angka (akan diurutkan otomatis)</Label>
          <TInput value={inp} onChange={e=>setInp(e.target.value)}/>
          <div style={{fontSize:11,color:C.muted,marginTop:6,lineHeight:1.4}}>
            Binary Search harus memakai array terurut, jadi input acak akan disortir dulu.
          </div>
        </div>
        <div style={{width:110}}>
          <Label>Target pencarian (angka yang dicari)</Label>
          <TInput value={tgt} onChange={e=>setTgt(e.target.value)}/>
        </div>
        <Btn primary onClick={run} style={{alignSelf:"flex-end"}}>Mulai</Btn>
      </div>

      {arr.length>0&&(
        <div style={{display:"flex",gap:6,flexWrap:"wrap",padding:"14px 12px 8px",
          background:C.surface,borderRadius:10,border:`1px solid ${C.border}`,
          marginBottom:14,alignItems:"flex-end",minHeight:90}}>
          {arr.map((v,i)=>{
            const {bg,bd,tx}=bStyle(i);
            const isMid=cs&&i===cs.mid;
            const isL=cs&&i===cs.lo&&!isMid;
            const isR=cs&&i===cs.hi&&!isMid;
            return (
              <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                <div style={{height:16,fontSize:10,fontWeight:700,
                  color:isMid?bd:(isL&&isR)?C.purple:isL?C.cyan:isR?C.purple:"transparent"}}>
                  {isMid?"mid":(isL&&isR)?"L=R":isL?"L":isR?"R":"·"}
                </div>
                <div style={{width:44,height:44,display:"flex",alignItems:"center",justifyContent:"center",
                  background:bg,border:`2px solid ${bd}`,borderRadius:8,color:tx,
                  fontFamily:"monospace",fontWeight:700,fontSize:14,transition:"all 0.3s"}}>{v}</div>
                <div style={{fontSize:10,color:C.muted}}>{i}</div>
              </div>
            );
          })}
        </div>
      )}

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
        {color:C.accent,label:"Rentang aktif"},{color:C.amber,label:"Mid (diperiksa)"},
        {color:C.green,label:"Ditemukan"},{color:C.muted,label:"Di luar rentang"},
        {color:C.cyan,label:"Left"},{color:C.purple,label:"Right"},
      ]}/>
    </div>
  );
}

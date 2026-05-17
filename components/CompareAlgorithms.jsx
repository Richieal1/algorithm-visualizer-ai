import { useState } from "react";
import { binarySteps, bubbleSteps, selectionSteps } from "../algorithms";
import { C } from "../constants/colors";
import { Btn, Label } from "./UI";

const sample = [64,34,25,12,22,11,90,45,37,60];
const binarySample = [2,5,8,12,16,23,38,56,72,91];

const algos = {
  binary: { name:"Binary Search", badge:"O(log n)", color:C.cyan },
  bubble: { name:"Bubble Sort", badge:"O(n²)", color:C.amber },
  selection: { name:"Selection Sort", badge:"O(n²)", color:C.purple },
};

function makeRun(id) {
  if(id==="binary") {
    const target=23;
    return { target, base:binarySample, steps:binarySteps(binarySample,target) };
  }
  if(id==="bubble") return { base:sample, steps:bubbleSteps(sample) };
  return { base:sample, steps:selectionSteps(sample) };
}

function message(id,run,step) {
  const cs=run.steps[step];
  if(!cs) return "Klik Mulai untuk melihat proses.";
  if(id==="binary") {
    if(cs.found>=0) return `Target ${run.target} ditemukan di indeks ${cs.found}.`;
    if(cs.done) return `Target ${run.target} tidak ada dalam array.`;
    const midVal=run.base[cs.mid];
    return midVal<run.target
      ? `${midVal} lebih kecil dari ${run.target}, area kiri dibuang.`
      : `${midVal} lebih besar dari ${run.target}, area kanan dibuang.`;
  }
  if(cs.done) return "Array sudah terurut.";
  if(cs.swapped) return `Tukar ${cs.vA} dan ${cs.vB}.`;
  return id==="selection"
    ? `Cari minimum: bandingkan ${cs.vA} dengan ${cs.vB}.`
    : `Bandingkan ${cs.vA} dengan ${cs.vB}.`;
}

function ProcessView({id}) {
  const [run,setRun]=useState(null);
  const [step,setStep]=useState(0);
  const info=algos[id];
  const cs=run?.steps[step];
  const arr=id==="binary" ? (run?.base||binarySample) : (cs?.arr||sample);
  const max=Math.max(...arr,1);

  const start=()=>{ setRun(makeRun(id)); setStep(0); };
  const prev=()=>setStep(s=>Math.max(0,s-1));
  const next=()=>setStep(s=>Math.min((run?.steps.length||1)-1,s+1));

  return (
    <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:14,minWidth:0}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,marginBottom:12}}>
        <div>
          <div style={{fontSize:15,fontWeight:800,color:C.text}}>{info.name}</div>
          <div style={{fontSize:12,color:C.muted,marginTop:2}}>{run?`Langkah ${step+1}/${run.steps.length}`:"Belum mulai"}</div>
        </div>
        <span style={{fontSize:11,fontWeight:700,color:info.color,background:info.color+"18",
          border:`1px solid ${info.color}55`,borderRadius:6,padding:"3px 8px"}}>{info.badge}</span>
      </div>

      <div style={{height:150,display:"flex",alignItems:"flex-end",gap:4,padding:"12px 8px",
        background:C.surface2,border:`1px solid ${C.border}`,borderRadius:8,marginBottom:12}}>
        {arr.map((v,i)=>{
          let color=info.color;
          if(id==="binary"&&cs){
            if(i===cs.mid) color=cs.found>=0?C.green:C.amber;
            else if(i<cs.lo||i>cs.hi) color=C.border;
            else color=C.accent;
          } else if(cs) {
            if(cs.sorted?.[i]) color=C.green;
            else if(cs.cmp?.includes(i)) color=cs.swapped?C.red:C.amber;
          }
          return (
            <div key={i} style={{flex:1,minWidth:0,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
              <span style={{fontSize:10,color:C.muted}}>{v}</span>
              <div style={{
                width:"100%",height:id==="binary"?34:Math.max((v/max)*92,8),
                borderRadius:id==="binary"?7:"4px 4px 0 0",background:color,
                display:"flex",alignItems:"center",justifyContent:"center",
                color:"#fff",fontSize:id==="binary"?11:0,fontWeight:800,transition:"all .2s"
              }}>{id==="binary"?i:""}</div>
            </div>
          );
        })}
      </div>

      <div style={{background:C.surface2,border:`1px solid ${C.border}`,borderRadius:8,
        padding:"10px 12px",fontSize:13,color:C.text,lineHeight:1.5,minHeight:42,marginBottom:12}}>
        {run?message(id,run,step):id==="binary"?"Target contoh: 23. Binary mencari angka ini di array terurut.":"Contoh data acak akan diurutkan."}
      </div>

      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        <Btn primary onClick={start}>Mulai</Btn>
        <Btn onClick={prev} disabled={!run||step===0}>Prev</Btn>
        <Btn onClick={next} disabled={!run||step>=run.steps.length-1}>Next</Btn>
      </div>
    </div>
  );
}

export function CompareAlgorithms() {
  const [left,setLeft]=useState("binary");
  const [right,setRight]=useState("bubble");

  return (
    <div>
      <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:16}}>
        <div style={{flex:"1 1 220px"}}>
          <Label>Proses kiri</Label>
          <select value={left} onChange={e=>setLeft(e.target.value)} style={{
            width:"100%",background:C.surface2,border:`1px solid ${C.border}`,borderRadius:8,
            padding:"10px 12px",color:C.text,fontSize:14,fontFamily:"inherit",outline:"none"
          }}>
            {Object.entries(algos).map(([id,a])=><option key={id} value={id}>{a.name}</option>)}
          </select>
        </div>
        <div style={{flex:"1 1 220px"}}>
          <Label>Proses kanan</Label>
          <select value={right} onChange={e=>setRight(e.target.value)} style={{
            width:"100%",background:C.surface2,border:`1px solid ${C.border}`,borderRadius:8,
            padding:"10px 12px",color:C.text,fontSize:14,fontFamily:"inherit",outline:"none"
          }}>
            {Object.entries(algos).map(([id,a])=><option key={id} value={id}>{a.name}</option>)}
          </select>
        </div>
      </div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
        {Object.entries(algos).map(([id,a])=>(
          <button key={id} onClick={()=>setLeft(id)} style={{background:left===id?C.accent:C.surface2,border:`1px solid ${left===id?C.accent:C.border}`,borderRadius:8,padding:"8px 12px",color:left===id?"#fff":C.text,cursor:"pointer",fontSize:13,fontFamily:"inherit"}}>Kiri: {a.name}</button>
        ))}
      </div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
        {Object.entries(algos).map(([id,a])=>(
          <button key={id} onClick={()=>setRight(id)} style={{background:right===id?C.accent:C.surface2,border:`1px solid ${right===id?C.accent:C.border}`,borderRadius:8,padding:"8px 12px",color:right===id?"#fff":C.text,cursor:"pointer",fontSize:13,fontFamily:"inherit"}}>Kanan: {a.name}</button>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:14}}>
        <ProcessView id={algos[left]?left:"binary"}/>
        <ProcessView id={algos[right]?right:"bubble"}/>
      </div>
    </div>
  );
}

import { C } from "../constants/colors";

export const Label = ({children}) => (
  <div style={{fontSize:12,color:C.muted,marginBottom:5}}>{children}</div>
);

export const TInput = ({value,onChange,placeholder}) => (
  <input value={value} onChange={onChange} placeholder={placeholder}
    style={{width:"100%",background:C.surface2,border:`1px solid ${C.border}`,borderRadius:8,
      padding:"9px 12px",color:C.text,fontFamily:"monospace",fontSize:14,boxSizing:"border-box",outline:"none"}}/>
);

export const Btn = ({children,onClick,primary,disabled,style:ext={}}) => (
  <button onClick={onClick} disabled={disabled} style={{
    background:primary?C.accent:C.surface2, border:`1px solid ${primary?C.accent:C.border}`,
    borderRadius:8, padding:"9px 18px", color:primary?"#fff":C.text,
    fontWeight:600, cursor:disabled?"not-allowed":"pointer", fontSize:13,
    opacity:disabled?0.5:1, fontFamily:"inherit", ...ext
  }}>{children}</button>
);

export const Msg = ({children}) => (
  <div style={{background:C.surface2,border:`1px solid ${C.border}`,borderRadius:8,
    padding:"11px 14px",marginBottom:14,fontSize:13,color:C.text,minHeight:42,lineHeight:1.55}}>
    {children||" "}
  </div>
);

export function Controls({step,total,playing,onPrev,onPlay,onNext,onReset,speed,onSpeed}) {
  return (
    <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap",marginBottom:14}}>
      <Btn onClick={onPrev} disabled={step<=0}>‹ Prev</Btn>
      <button onClick={onPlay} style={{
        background:playing?"#2a1212":"#141a2e", border:`1px solid ${playing?C.red:C.accent}`,
        borderRadius:8, padding:"9px 16px", color:playing?C.red:C.accent,
        fontWeight:600, cursor:"pointer", fontSize:13, fontFamily:"inherit"
      }}>{playing?"⏸ Pause":"▶ Play"}</button>
      <Btn onClick={onNext} disabled={step>=total-1}>Next ›</Btn>
      <Btn onClick={onReset}>↺ Reset</Btn>
      <div style={{display:"flex",alignItems:"center",gap:8,marginLeft:"auto"}}>
        <span style={{fontSize:12,color:C.muted}}>Kecepatan:</span>
        <input type="range" min={100} max={2000} step={100} value={speed}
          onChange={e=>onSpeed(+e.target.value)} style={{width:80}}/>
        <span style={{fontSize:12,color:C.muted,minWidth:44}}>{speed}ms</span>
      </div>
      <span style={{fontSize:12,color:C.muted}}>Langkah {step+1}/{total}</span>
    </div>
  );
}

export function Lgd({items}) {
  return (
    <div style={{display:"flex",gap:14,flexWrap:"wrap",marginTop:14}}>
      {items.map(({color,label})=>(
        <div key={label} style={{display:"flex",alignItems:"center",gap:5}}>
          <div style={{width:10,height:10,borderRadius:2,background:color,flexShrink:0}}/>
          <span style={{fontSize:12,color:C.muted}}>{label}</span>
        </div>
      ))}
    </div>
  );
}

export function SectionHead({title,badge,desc}) {
  return (
    <div style={{marginBottom:20}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
        <h2 style={{fontSize:16,fontWeight:700,color:C.text,margin:0}}>{title}</h2>
        <span style={{fontSize:11,fontWeight:600,color:C.accent,background:C.accent+"18",
          border:`1px solid ${C.accent}44`,borderRadius:6,padding:"2px 8px"}}>{badge}</span>
      </div>
      <p style={{fontSize:13,color:C.muted,lineHeight:1.6,margin:0}}>{desc}</p>
    </div>
  );
}

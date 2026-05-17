import { useEffect, useState } from "react";
import { C } from "./constants/colors";
import { bubbleSteps, selectionSteps } from "./algorithms";
import { SectionHead } from "./components/UI";
import { BinarySearch } from "./components/BinarySearch";
import { SortViz } from "./components/SortVisualizer";
import { AIChat } from "./components/AIChat";
import { CompareAlgorithms } from "./components/CompareAlgorithms";

export default function App() {
  const [tab,setTab]=useState("binary");
  const [aiOpen,setAiOpen]=useState(false);
  const tabs=[
    {id:"binary",icon:"🔍",label:"Binary Search"},
    {id:"bubble",icon:"🫧",label:"Bubble Sort"},
    {id:"selection",icon:"🎯",label:"Selection Sort"},
    {id:"compare",icon:"⚖️",label:"Compare"},
    {id:"chat",icon:"💬",label:"AI Chat"},
  ];

  const sections={
    binary:{title:"Binary Search",badge:"O(log n)",
      desc:"Pencarian efisien pada array terurut. Setiap langkah, rentang dibagi dua berdasarkan perbandingan dengan elemen tengah (mid). Sangat cepat untuk array besar."},
    bubble:{title:"Bubble Sort",badge:"O(n²)",
      desc:"Bandingkan elemen bersebelahan, tukar jika tidak urut. Elemen besar 'menggelembung' ke akhir di setiap pass. Sederhana namun kurang efisien untuk data besar."},
    selection:{title:"Selection Sort",badge:"O(n²)",
      desc:"Temukan elemen minimum dari sisa array, lalu letakkan di posisi yang benar. Hanya butuh maks n-1 penukaran — lebih sedikit swap dibanding Bubble Sort."},
    compare:{title:"Compare Algorithms",badge:"Menu khusus",
      desc:"Bandingkan Binary Search, Bubble Sort, dan Selection Sort dari tujuan, syarat data, kompleksitas, serta contoh jumlah langkah."},
    chat:{title:"AI Chat",badge:"Gratis",
      desc:"Tanya apa saja tentang algoritma, struktur data, pemrograman, atau topik lainnya. AI berjalan langsung dari browser tanpa API key."},
  };

  const s=sections[tab];
  const aiTopics={
    binary:"Binary Search",
    bubble:"Bubble Sort",
    selection:"Selection Sort",
  };
  const hasSideAI=tab==="binary"||tab==="bubble"||tab==="selection";

  useEffect(()=>{ setAiOpen(false); },[tab]);

  return (
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:'"Segoe UI",system-ui,sans-serif',color:C.text}}>
      <style>{`
        @keyframes pulse{0%,100%{opacity:.2}50%{opacity:1}}
        *{box-sizing:border-box;margin:0;padding:0;}
        input:focus{border-color:${C.accent}!important;box-shadow:0 0 0 2px ${C.accent}22;}
        button{transition:opacity 0.15s,background 0.2s,color 0.2s,border-color 0.2s;}
        button:hover:not(:disabled){opacity:0.85;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:${C.border};border-radius:4px;}
        .ai-drawer{position:fixed;top:0;right:0;width:min(380px,92vw);height:100vh;background:${C.surface};border-left:1px solid ${C.border};z-index:20;box-shadow:-18px 0 40px #0006;display:flex;flex-direction:column;}
        .ai-fab{position:fixed;right:22px;bottom:24px;z-index:18;}
        @media(max-width:720px){.ai-fab{right:14px;bottom:16px}.ai-drawer{width:100vw;}}
      `}</style>

      {/* Header */}
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"16px 24px 0"}}>
        <div style={{marginBottom:12}}>
          <h1 style={{fontSize:19,fontWeight:700,color:C.text,letterSpacing:-0.3}}>🧠 Algorithm Visualizer</h1>
          <p style={{fontSize:12,color:C.muted,marginTop:3}}>Visualisasi interaktif • Binary Search • Bubble Sort • Selection Sort • AI Chat</p>
        </div>
        <div style={{display:"flex",gap:2,overflowX:"auto"}}>
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              background:"none",border:"none",padding:"10px 16px",
              color:tab===t.id?C.accent:C.muted,
              borderBottom:`2px solid ${tab===t.id?C.accent:"transparent"}`,
              cursor:"pointer",fontSize:13,fontWeight:tab===t.id?600:400,
              whiteSpace:"nowrap",fontFamily:"inherit",
              transition:"color 0.2s,border-color 0.2s"
            }}>{t.icon} {t.label}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{padding:24,maxWidth:860,margin:"0 auto"}}>
        <SectionHead title={s.title} badge={s.badge} desc={s.desc}/>
        {tab==="binary"&&<BinarySearch/>}
        {tab==="bubble"&&<SortViz compute={bubbleSteps} isSel={false}/>}
        {tab==="selection"&&<SortViz compute={selectionSteps} isSel={true}/>}
        {tab==="compare"&&<CompareAlgorithms/>}
        {tab==="chat"&&<AIChat key="general-chat" topic="algoritma dan pemrograman" mode="general"/>}
      </div>

      {hasSideAI&&(
        <button className="ai-fab" onClick={()=>setAiOpen(true)} style={{
          width:54,height:54,borderRadius:"50%",border:`1px solid ${C.accent}`,
          background:C.accent,color:"#fff",fontWeight:800,cursor:"pointer",
          boxShadow:"0 10px 30px #0008",fontFamily:"inherit",fontSize:14
        }}>AI</button>
      )}

      {hasSideAI&&aiOpen&&(
        <div className="ai-drawer">
          <div style={{padding:"14px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
            <div>
              <div style={{fontSize:14,fontWeight:800,color:C.text}}>AI Pendamping</div>
              <div style={{fontSize:12,color:C.muted,marginTop:2}}>{aiTopics[tab]}</div>
            </div>
            <button onClick={()=>setAiOpen(false)} style={{width:34,height:34,borderRadius:8,border:`1px solid ${C.border}`,background:C.surface2,color:C.text,cursor:"pointer",fontSize:18}}>×</button>
          </div>
          <div style={{padding:14,flex:1,minHeight:0}}>
            <AIChat key={`tutor-${tab}`} compact topic={aiTopics[tab]} mode="tutor" showHeader={false} panelHeight="calc(100vh - 146px)"/>
          </div>
        </div>
      )}
    </div>
  );
}

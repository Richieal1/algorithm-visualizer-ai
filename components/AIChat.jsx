import { useState, useEffect, useRef } from "react";
import { C } from "../constants/colors";
import { Msg } from "./UI";

const PUTER_SCRIPT_ID="puter-js-sdk";
const GEMINI_MODEL="gemini-2.5-flash-lite";
const GROQ_MODEL="llama-3.1-8b-instant";

function loadPuter(){
  if(window.puter?.ai?.chat) return Promise.resolve(window.puter);
  return new Promise((resolve,reject)=>{
    const existing=document.getElementById(PUTER_SCRIPT_ID);
    if(existing){
      existing.addEventListener("load",()=>resolve(window.puter),{once:true});
      existing.addEventListener("error",()=>reject(new Error("Gagal memuat Puter.js")),{once:true});
      return;
    }
    const script=document.createElement("script");
    script.id=PUTER_SCRIPT_ID;
    script.src="https://js.puter.com/v2/";
    script.async=true;
    script.onload=()=>resolve(window.puter);
    script.onerror=()=>reject(new Error("Gagal memuat Puter.js"));
    document.head.appendChild(script);
  });
}

function readPuterReply(response){
  if(typeof response==="string") return response;
  if(typeof response?.message?.content==="string") return response.message.content;
  if(typeof response?.text==="string") return response.text;
  if(Array.isArray(response?.message?.content)){
    return response.message.content.map(part=>part?.text||"").join("").trim();
  }
  return "Maaf, respons AI kosong.";
}

function readGeminiReply(data){
  const parts=data?.candidates?.[0]?.content?.parts||[];
  const text=parts.map(part=>part.text||"").join("").trim();
  return text||"Maaf, respons Gemini kosong.";
}

async function askGemini(messages,apiKey){
  if(!apiKey) throw new Error("API key Gemini belum diisi.");
  const system=messages.find(m=>m.role==="system")?.content||"";
  const contents=messages.filter(m=>m.role!=="system").map(m=>({
    role:m.role==="assistant"?"model":"user",
    parts:[{text:m.content}]
  }));
  const res=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "x-goog-api-key":apiKey,
    },
    body:JSON.stringify({
      systemInstruction:{parts:[{text:system}]},
      contents,
      generationConfig:{temperature:0.35,maxOutputTokens:900},
    })
  });
  const data=await res.json();
  if(!res.ok) throw new Error(data?.error?.message||`Gemini gagal (${res.status})`);
  return readGeminiReply(data);
}

async function askGroq(messages,apiKey){
  if(!apiKey) throw new Error("API key Groq belum diisi.");
  const res=await fetch("https://api.groq.com/openai/v1/chat/completions",{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization":`Bearer ${apiKey}`,
    },
    body:JSON.stringify({
      model:GROQ_MODEL,
      messages,
      temperature:0.35,
      max_tokens:900,
    })
  });
  const data=await res.json();
  if(!res.ok) throw new Error(data?.error?.message||`Groq gagal (${res.status})`);
  return data?.choices?.[0]?.message?.content?.trim()||"Maaf, respons Groq kosong.";
}

async function askPollinations(messages){
  const prompt=messages.map(m=>`${m.role==="assistant"?"Assistant":m.role==="system"?"System":"User"}: ${m.content}`).join("\n")+"\nAssistant:";
  const res=await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}?model=openai`);
  if(!res.ok) throw new Error(`Pollinations gagal (${res.status})`);
  const text=await res.text();
  return text.trim()||"Maaf, respons AI kosong.";
}

export function AIChat({compact=false,topic="algoritma",mode="general",showHeader=true,panelHeight}) {
  const isTutor=mode==="tutor";
  const [provider,setProvider]=useState("gemini");
  const [keys,setKeys]=useState(()=>({
    gemini:localStorage.getItem("gemini_api_key")||"",
    groq:localStorage.getItem("groq_api_key")||"",
  }));
  const [msgs,setMsgs]=useState([
    {role:"assistant",content:isTutor
      ?`Saya AI pendamping untuk ${topic}. Tanyakan langkah visualisasi, kenapa nilai berubah, atau minta contoh kecil.`
      :"Halo! Saya AI Chat umum. Tanya apa saja tentang algoritma, struktur data, pemrograman, atau topik lainnya."}
  ]);
  const [inp,setInp]=useState("");
  const [loading,setLoading]=useState(false);
  const endRef=useRef(null);
  const inpRef=useRef(null);
  const providerKey=keys[provider]||"";

  const updateProviderKey=value=>{
    setKeys(prev=>({...prev,[provider]:value}));
    const storageKey=provider==="groq"?"groq_api_key":"gemini_api_key";
    if(value.trim()) localStorage.setItem(storageKey,value.trim());
    else localStorage.removeItem(storageKey);
  };

  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:"smooth"}); },[msgs,loading]);

  const send=async()=>{
    const text=inp.trim();
    if(!text||loading) return;
    setInp("");
    const newMsgs=[...msgs,{role:"user",content:text}];
    setMsgs(newMsgs); setLoading(true);
    const chatMessages=[
      {role:"system",content:isTutor
        ?`Kamu adalah AI pendamping khusus untuk visualisasi ${topic}. Jawab dalam Bahasa Indonesia. Fokus pada algoritma yang sedang dibuka, jelaskan langkah visualizer dengan bahasa sederhana, ringkas, dan praktis. Jika pertanyaan keluar topik, jawab singkat lalu kaitkan kembali ke ${topic}.`
        :"Kamu adalah asisten AI umum yang membantu dan cerdas. Jawab dalam Bahasa Indonesia kecuali pengguna menulis dalam bahasa lain. Bantu tentang algoritma, struktur data, pemrograman, dan topik belajar lainnya dengan jelas dan ringkas."},
      ...newMsgs.map(m=>({role:m.role,content:m.content}))
    ];
    try {
      try {
        const primary=provider==="groq"
            ? await askGroq(chatMessages,keys.groq)
            : await askGemini(chatMessages,keys.gemini);
        setMsgs(p=>[...p,{role:"assistant",content:primary}]);
      } catch(primaryError) {
        try {
          const secondary=provider==="gemini"
            ? await askGroq(chatMessages,keys.groq)
            : await askGemini(chatMessages,keys.gemini);
          setMsgs(p=>[...p,{role:"assistant",content:secondary}]);
        } catch(secondaryError) {
          try {
            const puter=await loadPuter();
            const response=await puter.ai.chat(chatMessages,false,{model:"gemini-2.5-flash-lite"});
            setMsgs(p=>[...p,{role:"assistant",content:readPuterReply(response)}]);
          } catch(puterError) {
            const fallback=await askPollinations(chatMessages);
            setMsgs(p=>[...p,{role:"assistant",content:fallback}]);
          }
        }
      }
    } catch(e) {
      setMsgs(p=>[...p,{role:"assistant",content:`Koneksi AI error: ${e.message}`}]);
    }
    setLoading(false);
    setTimeout(()=>inpRef.current?.focus(),50);
  };

  const Bubble=({m})=>(
    <div style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",alignItems:"flex-start",gap:8}}>
      {m.role==="assistant"&&(
        <div style={{width:28,height:28,borderRadius:"50%",background:C.accent+"25",border:`1px solid ${C.accent}`,
          display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:C.accent,
          flexShrink:0,marginTop:2,fontWeight:700}}>AI</div>
      )}
      <div style={{maxWidth:"80%",padding:"10px 14px",
        background:m.role==="user"?C.accent:C.surface2,
        border:`1px solid ${m.role==="user"?"transparent":C.border}`,
        borderRadius:m.role==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px",
        color:m.role==="user"?"#fff":C.text,fontSize:14,lineHeight:1.65,
        whiteSpace:"pre-wrap",wordBreak:"break-word"}}>{m.content}</div>
    </div>
  );

  return (
    <div>
      {showHeader&&<div style={{background:C.surface2,border:`1px solid ${C.border}`,borderRadius:8,
        padding:14,marginBottom:14,display:"grid",gap:10}}>
        <div style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"center",flexWrap:"wrap"}}>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:C.text}}>{isTutor?"AI Pendamping":"AI Chat Umum"}</div>
            <div style={{fontSize:12,color:C.muted,marginTop:2}}>
              {isTutor?`Khusus bantu ${topic} yang sedang dibuka.`:"Untuk pertanyaan umum algoritma dan pemrograman."} Gratis tanpa API key.
            </div>
          </div>
          <span style={{fontSize:11,fontWeight:700,color:C.green,
            background:C.green+"18",border:`1px solid ${C.green+"55"}`,
            borderRadius:6,padding:"4px 8px"}}>Gratis aktif</span>
        </div>
        <label style={{display:"grid",gap:5}}>
          <span style={{fontSize:11,color:C.muted}}>Provider AI</span>
          <select value={provider} onChange={e=>setProvider(e.target.value)} style={{
            background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,
            color:C.text,padding:"9px 10px",fontFamily:"inherit",fontSize:13,outline:"none"
          }}>
            <option value="gemini">Gemini API</option>
            <option value="groq">Groq</option>
          </select>
        </label>
        <label style={{display:"grid",gap:5}}>
          <span style={{fontSize:11,color:C.muted}}>API key {provider==="groq"?"Groq":"Gemini"}</span>
          <input value={providerKey} onChange={e=>updateProviderKey(e.target.value)}
            type="password" placeholder={provider==="groq"?"gsk_...":"AIza..."}
            style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,
              color:C.text,padding:"9px 10px",fontFamily:"inherit",fontSize:13,outline:"none"}}/>
        </label>
      </div>}
      {!showHeader&&(
        <label style={{display:"grid",gap:5,marginBottom:10}}>
          <span style={{fontSize:11,color:C.muted}}>Provider AI</span>
          <select value={provider} onChange={e=>setProvider(e.target.value)} style={{
            background:C.surface2,border:`1px solid ${C.border}`,borderRadius:8,
            color:C.text,padding:"9px 10px",fontFamily:"inherit",fontSize:13,outline:"none"
          }}>
            <option value="gemini">Gemini API</option>
            <option value="groq">Groq</option>
          </select>
        </label>
        <label style={{display:"grid",gap:5,marginBottom:10}}>
          <span style={{fontSize:11,color:C.muted}}>API key {provider==="groq"?"Groq":"Gemini"}</span>
          <input value={providerKey} onChange={e=>updateProviderKey(e.target.value)}
            type="password" placeholder={provider==="groq"?"gsk_...":"AIza..."}
            style={{background:C.surface2,border:`1px solid ${C.border}`,borderRadius:8,
              color:C.text,padding:"9px 10px",fontFamily:"inherit",fontSize:13,outline:"none"}}/>
        </label>
      )}
      <div style={{height:panelHeight||(compact?320:400),overflowY:"auto",display:"flex",flexDirection:"column",gap:10,paddingBottom:8}}>
        {msgs.map((m,i)=><Bubble key={i} m={m}/>)}
        {loading&&(
          <div style={{display:"flex",alignItems:"flex-start",gap:8}}>
            <div style={{width:28,height:28,borderRadius:"50%",background:C.accent+"25",border:`1px solid ${C.accent}`,
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:C.accent,flexShrink:0,fontWeight:700}}>AI</div>
            <div style={{padding:"12px 16px",background:C.surface2,border:`1px solid ${C.border}`,
              borderRadius:"16px 16px 16px 4px",display:"flex",gap:5,alignItems:"center"}}>
              {[0,1,2].map(i=>(
                <div key={i} style={{width:7,height:7,borderRadius:"50%",background:C.muted,
                  animationName:"pulse",animationDuration:"1.2s",animationDelay:`${i*0.2}s`,
                  animationIterationCount:"infinite",animationTimingFunction:"ease-in-out"}}/>
              ))}
            </div>
          </div>
        )}
        <div ref={endRef}/>
      </div>
      <div style={{display:"flex",gap:8,borderTop:`1px solid ${C.border}`,paddingTop:12}}>
        <input ref={inpRef} value={inp} onChange={e=>setInp(e.target.value)}
          onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
          placeholder={isTutor?`Tanya tentang ${topic}...`:"Tanya sesuatu... (Enter untuk kirim)"}
          style={{flex:1,background:C.surface2,border:`1px solid ${C.border}`,borderRadius:10,
            padding:"10px 14px",color:C.text,fontSize:14,outline:"none",fontFamily:"inherit"}}/>
        <button onClick={send} disabled={loading||!inp.trim()} style={{
          background:inp.trim()&&!loading?C.accent:C.surface2,
          border:`1px solid ${inp.trim()&&!loading?C.accent:C.border}`,
          borderRadius:10,padding:"10px 20px",
          color:inp.trim()&&!loading?"#fff":C.muted,
          fontWeight:600,cursor:loading||!inp.trim()?"not-allowed":"pointer",
          fontSize:14,transition:"all 0.2s",flexShrink:0,fontFamily:"inherit"
        }}>Kirim</button>
      </div>
    </div>
  );
}

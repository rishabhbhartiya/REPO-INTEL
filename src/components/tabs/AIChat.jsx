import React, { useState, useRef, useEffect } from 'react'
import { PageHeader } from '../ui.jsx'

const MODELS=[
  {id:'claude-sonnet-4-5',label:'Claude Sonnet 4.5',provider:'anthropic',hint:'api.anthropic.com key (sk-ant-...)'},
  {id:'claude-haiku-4-5-20251001',label:'Claude Haiku 4.5',provider:'anthropic',hint:'api.anthropic.com key (sk-ant-...)'},
  {id:'gpt-4o',label:'GPT-4o',provider:'openai',hint:'platform.openai.com key (sk-...)'},
  {id:'gpt-4o-mini',label:'GPT-4o mini',provider:'openai',hint:'platform.openai.com key (sk-...)'},
  {id:'gemini-1.5-pro',label:'Gemini 1.5 Pro',provider:'google',hint:'aistudio.google.com key'},
  {id:'gemini-1.5-flash',label:'Gemini 1.5 Flash',provider:'google',hint:'aistudio.google.com key'},
]

function buildContext(data){
  const {classified,allDeps,cycles,deadCode,owner,repo,branch,langMap,deployUrl}=data
  const engines=classified.filter(f=>f.role==='engine')
  const byRole=r=>classified.filter(f=>f.role===r)
  const topLangs=Object.entries(langMap).sort((a,b)=>b[1]-a[1]).slice(0,5)
  const withSymbols=classified.filter(f=>f.exports.length>0||f.imports.length>0)

  return`You are an expert code analyst helping a developer understand a GitHub repository.

REPOSITORY: ${owner}/${repo} (branch: ${branch})${deployUrl?`\nDEPLOYED AT: ${deployUrl}`:''}
PRIMARY LANGUAGES: ${topLangs.map(([l,n])=>`${l}(${n})`).join(', ')}
TOTAL FILES: ${classified.length}
ENTRY POINTS: ${engines.map(f=>f.path).join(', ')||'none detected'}
CIRCULAR DEPS: ${cycles?.length||0}
DEAD CODE SIGNALS: ${deadCode?.length||0}

FILE ROLES:
${['engine','route','component','service','model','state','hook','middleware','util','config','test'].map(r=>`  ${r}: ${byRole(r).length}`).join('\n')}

RUNTIME DEPENDENCIES: ${Object.keys(allDeps.runtime).slice(0,20).join(', ')}${Object.keys(allDeps.runtime).length>20?` +${Object.keys(allDeps.runtime).length-20} more`:''}
DEV DEPENDENCIES: ${Object.keys(allDeps.dev).slice(0,10).join(', ')}

FILE LIST (top 60 by priority score):
${classified.slice(0,60).map(f=>`  [${f.role.padEnd(10)}] ${f.path}${f.exports.length>0?` | exports: ${f.exports.slice(0,3).map(e=>e.name).join(', ')}`:''}`).join('\n')}

SYMBOL DATA (files with analysed imports/exports):
${withSymbols.slice(0,20).map(f=>`  ${f.path}:
    exports: ${f.exports.slice(0,5).map(e=>`${e.name}(${e.type})`).join(', ')||'none'}
    imports: ${f.imports.slice(0,4).map(i=>`${i.name} from ${i.source}`).join(', ')||'none'}
    importedBy: ${f.importedBy.slice(0,3).join(', ')||'none'}`).join('\n')}

Answer questions concisely and accurately based on this context. Reference specific files and functions. If asked about something not in context, say so clearly.`
}

async function callAnthropic(key,model,msgs,sys){
  const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},body:JSON.stringify({model,max_tokens:1024,system:sys,messages:msgs})})
  if(!r.ok){const e=await r.json();throw new Error(e.error?.message||'Anthropic API error')}
  const d=await r.json();return d.content[0].text
}

async function callOpenAI(key,model,msgs,sys){
  const r=await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${key}`},body:JSON.stringify({model,max_tokens:1024,messages:[{role:'system',content:sys},...msgs]})})
  if(!r.ok){const e=await r.json();throw new Error(e.error?.message||'OpenAI API error')}
  const d=await r.json();return d.choices[0].message.content
}

async function callGemini(key,model,msgs,sys){
  const contents=msgs.map(m=>({role:m.role==='assistant'?'model':'user',parts:[{text:m.content}]}))
  const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({systemInstruction:{parts:[{text:sys}]},contents,generationConfig:{maxOutputTokens:1024}})})
  if(!r.ok){const e=await r.json();throw new Error(e.error?.message||'Gemini API error')}
  const d=await r.json();return d.candidates[0].content.parts[0].text
}

const SUGGESTIONS=['What is the main purpose of this codebase?','Where is the authentication logic?','Which file handles API routing?','What is the data flow from frontend to database?','Which files should I read first to understand the architecture?','Are there any architectural concerns I should know about?','What testing framework is used?','How is state managed in this app?']

export default function AIChat({data}){
  const [model,setModel]=useState(MODELS[0].id)
  const [apiKey,setApiKey]=useState('')
  const [showKey,setShowKey]=useState(false)
  const [messages,setMessages]=useState([])
  const [input,setInput]=useState('')
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')
  const bottomRef=useRef()
  const inputRef=useRef()
  const selModel=MODELS.find(m=>m.id===model)
  const sys=buildContext(data)

  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:'smooth'})},[messages])

  const send=async(text)=>{
    const content=(text||input).trim()
    if(!content||loading)return
    if(!apiKey.trim()){setError('Enter your API key first');return}
    setError('');setInput('')
    const newMsgs=[...messages,{role:'user',content}]
    setMessages(newMsgs);setLoading(true)
    try{
      let reply
      const apiMsgs=newMsgs.map(m=>({role:m.role,content:m.content}))
      if(selModel.provider==='anthropic')reply=await callAnthropic(apiKey,model,apiMsgs,sys)
      else if(selModel.provider==='openai')reply=await callOpenAI(apiKey,model,apiMsgs,sys)
      else reply=await callGemini(apiKey,model,apiMsgs,sys)
      setMessages(prev=>[...prev,{role:'assistant',content:reply}])
    }catch(e){setError(e.message);setMessages(prev=>prev.slice(0,-1))}
    setLoading(false);inputRef.current?.focus()
  }

  return(
    <div className="fadeUp" style={{display:'flex',flexDirection:'column',height:'calc(100vh - 160px)'}}>
      <PageHeader title="AI Chat" subtitle="Ask questions about this repository using your own API key — never stored or sent to our servers"/>

      {/* Config */}
      <div style={{background:'var(--gh-canvas-overlay)',border:'1px solid var(--gh-border-default)',borderRadius:8,padding:'14px 16px',marginBottom:14,display:'flex',gap:12,alignItems:'flex-end',flexWrap:'wrap'}}>
        <div>
          <div style={{fontFamily:'var(--mono)',fontSize:9,color:'var(--gh-fg-muted)',marginBottom:5,textTransform:'uppercase',letterSpacing:'0.06em'}}>Model</div>
          <select value={model} onChange={e=>setModel(e.target.value)} style={{background:'var(--gh-canvas-default)',border:'1px solid var(--gh-border-default)',borderRadius:6,padding:'7px 10px',fontFamily:'var(--mono)',fontSize:11,color:'var(--gh-fg-default)',outline:'none',cursor:'pointer'}}>
            {MODELS.map(m=><option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
        </div>
        <div style={{flex:1,minWidth:200}}>
          <div style={{fontFamily:'var(--mono)',fontSize:9,color:'var(--gh-fg-muted)',marginBottom:5,textTransform:'uppercase',letterSpacing:'0.06em'}}>API Key — {selModel?.hint}</div>
          <div style={{display:'flex',gap:6}}>
            <input type={showKey?'text':'password'} value={apiKey} onChange={e=>setApiKey(e.target.value)} placeholder="Paste your API key…"
              style={{flex:1,background:'var(--gh-canvas-inset)',border:'1px solid var(--gh-border-default)',borderRadius:6,padding:'7px 12px',fontFamily:'var(--mono)',fontSize:11,color:'var(--gh-fg-default)',outline:'none',transition:'border-color 0.15s'}}
              onFocus={e=>e.target.style.borderColor='var(--gh-accent-fg)'}
              onBlur={e=>e.target.style.borderColor='var(--gh-border-default)'}
            />
            <button onClick={()=>setShowKey(v=>!v)} style={{background:'var(--gh-btn-bg)',border:'1px solid var(--gh-border-default)',borderRadius:6,padding:'0 10px',fontFamily:'var(--mono)',fontSize:10,color:'var(--gh-fg-muted)',cursor:'pointer'}}>{showKey?'Hide':'Show'}</button>
          </div>
        </div>
        <div style={{fontFamily:'var(--mono)',fontSize:9,color:'var(--gh-fg-subtle)',lineHeight:2,flexShrink:0}}>
          <div>🔒 Key stays in your browser</div>
          <div>📄 {data.classified.filter(f=>f.exports.length>0||f.imports.length>0).length} files in context</div>
        </div>
      </div>

      {error&&(
        <div style={{background:'var(--gh-danger-subtle)',border:'1px solid var(--gh-danger-muted)',borderRadius:6,padding:'10px 14px',marginBottom:10,fontFamily:'var(--mono)',fontSize:11,color:'var(--gh-danger-fg)',display:'flex',gap:8,alignItems:'center'}}>
          ✗ {error}
          <button onClick={()=>setError('')} style={{marginLeft:'auto',background:'none',border:'none',color:'var(--gh-danger-fg)',cursor:'pointer',fontSize:16,lineHeight:1}}>×</button>
        </div>
      )}

      {/* Messages */}
      <div style={{flex:1,overflowY:'auto',minHeight:0}}>
        {messages.length===0&&(
          <div style={{paddingBottom:16}}>
            <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--gh-fg-muted)',marginBottom:12,textTransform:'uppercase',letterSpacing:'0.06em'}}>Suggested Questions</div>
            <div style={{display:'flex',flexWrap:'wrap',gap:7}}>
              {SUGGESTIONS.map(s=>(
                <button key={s} onClick={()=>send(s)} disabled={!apiKey.trim()}
                  style={{background:'var(--gh-canvas-overlay)',border:'1px solid var(--gh-border-muted)',borderRadius:6,padding:'8px 14px',fontFamily:'var(--sans)',fontSize:12,color:apiKey.trim()?'var(--gh-fg-default)':'var(--gh-fg-subtle)',cursor:apiKey.trim()?'pointer':'not-allowed',transition:'all 0.15s',textAlign:'left',lineHeight:1.4}}
                  onMouseEnter={e=>{if(apiKey.trim())e.currentTarget.style.borderColor='var(--gh-accent-fg)'}}
                  onMouseLeave={e=>e.currentTarget.style.borderColor='var(--gh-border-muted)'}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg,i)=>(
          <div key={i} style={{display:'flex',gap:12,alignItems:'flex-start',marginBottom:16,animation:'fadeIn 0.2s ease'}}>
            <div style={{width:28,height:28,borderRadius:6,background:msg.role==='user'?'var(--gh-neutral-subtle)':'var(--gh-accent-subtle)',border:`1px solid ${msg.role==='user'?'var(--gh-border-default)':'var(--gh-accent-muted)'}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontFamily:'var(--mono)',fontSize:10,color:msg.role==='user'?'var(--gh-fg-muted)':'var(--gh-accent-fg)',fontWeight:600}}>
              {msg.role==='user'?'U':'AI'}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:'var(--mono)',fontSize:9,color:'var(--gh-fg-subtle)',marginBottom:5,textTransform:'uppercase'}}>{msg.role==='user'?'You':'AI Assistant'}</div>
              <div style={{fontFamily:'var(--sans)',fontSize:13,color:'var(--gh-fg-default)',lineHeight:1.75,whiteSpace:'pre-wrap',wordBreak:'break-word'}}>{msg.content}</div>
            </div>
          </div>
        ))}
        {loading&&(
          <div style={{display:'flex',gap:12,alignItems:'flex-start',marginBottom:16}}>
            <div style={{width:28,height:28,borderRadius:6,background:'var(--gh-accent-subtle)',border:'1px solid var(--gh-accent-muted)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--mono)',fontSize:10,color:'var(--gh-accent-fg)',fontWeight:600}}>AI</div>
            <div style={{display:'flex',gap:5,alignItems:'center',paddingTop:6}}>
              {[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:'50%',background:'var(--gh-accent-fg)',animation:`pulse 1.2s ease-in-out ${i*0.2}s infinite`}}/>)}
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div style={{display:'flex',gap:8,paddingTop:12,borderTop:'1px solid var(--gh-border-muted)',marginTop:8,flexShrink:0}}>
        <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}}
          placeholder={apiKey.trim()?'Ask anything about this repo… (Enter to send, Shift+Enter for newline)':'Enter your API key above to start chatting'}
          disabled={loading||!apiKey.trim()}
          rows={2}
          style={{flex:1,background:'var(--gh-canvas-overlay)',border:'1px solid var(--gh-border-default)',borderRadius:8,padding:'10px 14px',fontFamily:'var(--sans)',fontSize:13,color:'var(--gh-fg-default)',outline:'none',resize:'none',lineHeight:1.6,transition:'border-color 0.15s'}}
          onFocus={e=>e.target.style.borderColor='var(--gh-accent-fg)'}
          onBlur={e=>e.target.style.borderColor='var(--gh-border-default)'}
        />
        <button onClick={()=>send()} disabled={!input.trim()||loading||!apiKey.trim()}
          style={{background:input.trim()&&!loading&&apiKey.trim()?'var(--gh-btn-primary-bg)':'var(--gh-btn-bg)',color:input.trim()&&!loading&&apiKey.trim()?'#fff':'var(--gh-fg-muted)',border:'none',borderRadius:8,padding:'0 20px',fontFamily:'var(--sans)',fontSize:13,fontWeight:600,cursor:input.trim()&&!loading&&apiKey.trim()?'pointer':'not-allowed',transition:'all 0.15s',flexShrink:0}}>
          {loading?'…':'Send'}
        </button>
      </div>
    </div>
  )
}

import React, { useRef, useEffect } from 'react'

export default function ScanningPage({logs}){
  const termRef=useRef()
  useEffect(()=>{if(termRef.current)termRef.current.scrollTop=termRef.current.scrollHeight},[logs])
  return(
    <div style={{minHeight:'100vh',background:'var(--gh-canvas-default)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:32}}>
      <div style={{position:'relative',width:64,height:64,marginBottom:32}}>
        <div style={{position:'absolute',inset:0,border:'2px solid var(--gh-border-default)',borderTopColor:'var(--gh-accent-fg)',borderRadius:'50%',animation:'spin 1s linear infinite'}}/>
        <div style={{position:'absolute',inset:8,border:'1px solid var(--gh-border-muted)',borderTopColor:'var(--gh-success-fg)',borderRadius:'50%',animation:'spin 1.5s linear infinite reverse'}}/>
        <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--mono)',fontSize:18}}>⬡</div>
      </div>
      <div style={{fontFamily:'var(--sans)',fontSize:16,fontWeight:600,color:'var(--gh-fg-default)',marginBottom:4}}>Analysing repository…</div>
      <div style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--gh-fg-muted)',marginBottom:28}}>reading files · extracting symbols · mapping imports</div>
      <div ref={termRef} style={{width:'100%',maxWidth:640,background:'var(--gh-canvas-overlay)',border:'1px solid var(--gh-border-default)',borderRadius:8,padding:'16px 20px',fontFamily:'var(--mono)',fontSize:12,lineHeight:2,maxHeight:280,overflowY:'auto'}}>
        {logs.map((l,i)=>(
          <div key={l.id} style={{color:l.type==='ok'?'var(--gh-success-fg)':l.type==='err'?'var(--gh-danger-fg)':l.type==='warn'?'var(--gh-attention-fg)':l.type==='accent'?'var(--gh-accent-fg)':'var(--gh-fg-muted)',animation:i===logs.length-1?'fadeIn 0.15s ease':'none'}}>
            <span style={{color:'var(--gh-fg-subtle)',marginRight:10,userSelect:'none'}}>{String(i+1).padStart(3,'0')}</span>{l.text}
          </div>
        ))}
        <div><span style={{color:'var(--gh-fg-subtle)',marginRight:10}}>---</span><span style={{display:'inline-block',width:7,height:13,background:'var(--gh-accent-fg)',verticalAlign:'middle',animation:'blink 0.8s step-end infinite'}}/></div>
      </div>
    </div>
  )
}

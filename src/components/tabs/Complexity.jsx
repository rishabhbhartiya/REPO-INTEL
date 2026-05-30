import React, { useMemo, useState } from 'react'
import { PageHeader, Toggle } from '../ui.jsx'
import Badge from '../Badge.jsx'
import { NOISE_ROLES } from '../../utils/github.js'

function heatColor(s){
  if(s>=80)return'#f85149'
  if(s>=60)return'#db6d28'
  if(s>=40)return'#d29922'
  if(s>=20)return'#3fb950'
  return'#58a6ff'
}

export default function Complexity({data}){
  const {classified}=data
  const [showNoise,setShowNoise]=useState(false)
  const [view,setView]=useState('list')

  const files=useMemo(()=>classified.filter(f=>showNoise||!NOISE_ROLES.has(f.role)).sort((a,b)=>b.complexity-a.complexity),[classified,showNoise])

  const buckets={
    critical:files.filter(f=>f.complexity>=80),
    high:files.filter(f=>f.complexity>=60&&f.complexity<80),
    medium:files.filter(f=>f.complexity>=30&&f.complexity<60),
    low:files.filter(f=>f.complexity<30),
  }

  return(
    <div className="fadeUp">
      <PageHeader title="Complexity Heatmap" subtitle="Scored by exports + import frequency + depth. No file sizes used."
        right={<div style={{display:'flex',gap:10,alignItems:'center'}}>
          <Toggle label="Noise" value={showNoise} onChange={()=>setShowNoise(v=>!v)}/>
          <div style={{display:'flex',gap:3}}>
            {['list','grid'].map(v=>(
              <button key={v} onClick={()=>setView(v)} style={{background:view===v?'var(--gh-accent-subtle)':'var(--gh-btn-bg)',border:`1px solid ${view===v?'var(--gh-accent-muted)':'var(--gh-border-default)'}`,borderRadius:5,padding:'4px 10px',fontFamily:'var(--mono)',fontSize:10,cursor:'pointer',color:view===v?'var(--gh-accent-fg)':'var(--gh-fg-muted)'}}>
                {v}
              </button>
            ))}
          </div>
        </div>}
      />

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:20}}>
        {[{l:'Critical',n:buckets.critical.length,c:'var(--gh-danger-fg)',r:'80–100'},{l:'High',n:buckets.high.length,c:'var(--gh-severe-fg)',r:'60–79'},{l:'Medium',n:buckets.medium.length,c:'var(--gh-attention-fg)',r:'30–59'},{l:'Low',n:buckets.low.length,c:'var(--gh-success-fg)',r:'0–29'}].map(b=>(
          <div key={b.l} style={{background:'var(--gh-canvas-overlay)',border:'1px solid var(--gh-border-muted)',borderRadius:8,padding:'12px 14px',textAlign:'center'}}>
            <div style={{fontFamily:'var(--mono)',fontSize:24,fontWeight:700,color:b.c,lineHeight:1}}>{b.n}</div>
            <div style={{fontFamily:'var(--sans)',fontSize:11,fontWeight:600,color:b.c,marginTop:4}}>{b.l}</div>
            <div style={{fontFamily:'var(--mono)',fontSize:9,color:'var(--gh-fg-subtle)',marginTop:2}}>{b.r}</div>
          </div>
        ))}
      </div>

      <div style={{display:'flex',alignItems:'center',gap:0,marginBottom:6,height:8,borderRadius:4,overflow:'hidden',border:'1px solid var(--gh-border-muted)'}}>
        {['#58a6ff','#3fb950','#d29922','#db6d28','#f85149'].map((c,i)=>(
          <div key={i} style={{flex:1,height:'100%',background:c,opacity:0.8}}/>
        ))}
      </div>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:20,fontFamily:'var(--mono)',fontSize:9,color:'var(--gh-fg-subtle)'}}>
        <span>LOW</span><span>HIGH COMPLEXITY</span>
      </div>

      {view==='list'&&(
        <div style={{display:'flex',flexDirection:'column',gap:4}}>
          {files.slice(0,60).map((f,i)=>(
            <div key={f.path} style={{display:'flex',alignItems:'center',gap:12,background:'var(--gh-canvas-overlay)',border:'1px solid var(--gh-border-muted)',borderRadius:7,padding:'10px 14px',animation:`fadeUp 0.2s ease ${i*8}ms both`,transition:'border-color 0.15s'}}
              onMouseEnter={e=>e.currentTarget.style.borderColor='var(--gh-border-default)'}
              onMouseLeave={e=>e.currentTarget.style.borderColor='var(--gh-border-muted)'}>
              <div style={{width:3,height:32,borderRadius:2,background:heatColor(f.complexity),flexShrink:0}}/>
              <Badge role={f.role} small/>
              <span style={{fontFamily:'var(--mono)',fontSize:12,color:'var(--gh-fg-default)',flex:1,minWidth:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{f.path}</span>
              <div style={{display:'flex',gap:14,alignItems:'center',flexShrink:0}}>
                {f.exports.length>0&&<span style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--gh-fg-subtle)'}}>↗{f.exports.length}</span>}
                {f.importedBy.length>0&&<span style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--gh-fg-subtle)'}}>⬡{f.importedBy.length}</span>}
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <div style={{width:80,height:5,background:'var(--gh-border-muted)',borderRadius:3,overflow:'hidden'}}>
                    <div style={{width:`${f.complexity}%`,height:'100%',background:heatColor(f.complexity),borderRadius:3}}/>
                  </div>
                  <span style={{fontFamily:'var(--mono)',fontSize:10,color:heatColor(f.complexity),fontWeight:600,minWidth:24}}>{f.complexity}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {view==='grid'&&(
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:6}}>
          {files.slice(0,80).map((f,i)=>(
            <div key={f.path} title={`${f.path}\nScore: ${f.complexity}`} style={{background:'var(--gh-canvas-overlay)',border:`1px solid ${heatColor(f.complexity)}33`,borderRadius:6,padding:'10px 10px',animation:`fadeUp 0.2s ease ${i*6}ms both`,transition:'transform 0.15s'}}
              onMouseEnter={e=>e.currentTarget.style.transform='scale(1.02)'}
              onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
              <div style={{fontFamily:'var(--mono)',fontSize:13,color:heatColor(f.complexity),fontWeight:700,lineHeight:1,marginBottom:5}}>{f.complexity}</div>
              <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--gh-fg-default)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{f.path.split('/').pop()}</div>
              <div style={{fontFamily:'var(--mono)',fontSize:9,color:'var(--gh-fg-muted)',marginTop:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{f.path.split('/').slice(0,-1).join('/')}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

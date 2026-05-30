import React from 'react'
import Badge from '../Badge.jsx'
import { PageHeader, EmptyState, GhLink } from '../ui.jsx'

export default function DeadCode({data}){
  const {deadCode,classified,owner,repo,branch}=data
  const ghUrl=p=>owner?`https://github.com/${owner}/${repo}/blob/${branch}/${p}`:null

  if(!deadCode||deadCode.length===0){
    return(
      <div className="fadeUp">
        <PageHeader title="Dead Code" subtitle="Content-aware + import-based unused file detection"/>
        <EmptyState icon="✓" title="No dead code signals detected" sub="All analysed files appear to be referenced by imports or content usage"/>
      </div>
    )
  }

  return(
    <div className="fadeUp">
      <PageHeader title="Dead Code" subtitle={`${deadCode.length} files with zero inbound references — checked by imports AND content usage`}/>

      <div style={{background:'var(--gh-attention-subtle)',border:'1px solid var(--gh-attention-muted)',borderRadius:8,padding:'14px 18px',marginBottom:20,display:'flex',gap:14,alignItems:'flex-start'}}>
        <span style={{fontSize:20}}>⚠️</span>
        <div>
          <div style={{fontFamily:'var(--sans)',fontSize:14,fontWeight:600,color:'var(--gh-attention-fg)',marginBottom:5}}>
            {deadCode.length} potentially unused file{deadCode.length>1?'s':''} detected
          </div>
          <div style={{fontFamily:'var(--sans)',fontSize:13,color:'var(--gh-fg-default)',lineHeight:1.6}}>
            These files have no detected inbound imports <strong>and</strong> none of their exported function/class names appear in any other file's content. They may be: dynamically imported, CLI scripts, or genuinely dead code. Review carefully before removing.
          </div>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:8}}>
        {deadCode.map((f,i)=>(
          <div key={f.path} style={{background:'var(--gh-canvas-overlay)',border:'1px solid var(--gh-border-muted)',borderRadius:8,padding:'14px 16px',animation:`fadeUp 0.3s ease ${i*20}ms both`,transition:'border-color 0.15s'}}
            onMouseEnter={e=>e.currentTarget.style.borderColor='var(--gh-attention-muted)'}
            onMouseLeave={e=>e.currentTarget.style.borderColor='var(--gh-border-muted)'}>
            <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:8}}>
              <Badge role={f.role} small/>
              {f.language&&<span style={{fontFamily:'var(--mono)',fontSize:9,color:'var(--gh-fg-muted)',background:'var(--gh-neutral-subtle)',border:'1px solid var(--gh-border-muted)',padding:'1px 6px',borderRadius:3}}>{f.language}</span>}
              <span style={{marginLeft:'auto',fontFamily:'var(--mono)',fontSize:9,color:'var(--gh-attention-fg)'}}>0 inbound</span>
            </div>
            {ghUrl(f.path)?(
              <GhLink href={ghUrl(f.path)} style={{fontFamily:'var(--mono)',fontSize:11,display:'block',wordBreak:'break-all',lineHeight:1.5,marginBottom:8}}>
                {f.path}
              </GhLink>
            ):(
              <div style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--gh-fg-default)',wordBreak:'break-all',lineHeight:1.5,marginBottom:8}}>{f.path}</div>
            )}
            <div style={{display:'flex',gap:12,fontFamily:'var(--mono)',fontSize:10,color:'var(--gh-fg-muted)'}}>
              {f.exports.length>0&&<span>↗ {f.exports.length} exports</span>}
              {f.imports.length>0&&<span>↙ {f.imports.length} imports</span>}
            </div>
            {f.exports.length>0&&(
              <div style={{marginTop:8,display:'flex',gap:4,flexWrap:'wrap'}}>
                {f.exports.slice(0,4).map((exp,j)=>(
                  <span key={j} style={{fontFamily:'var(--mono)',fontSize:9,color:'var(--gh-fg-muted)',background:'var(--gh-neutral-subtle)',border:'1px solid var(--gh-border-muted)',padding:'1px 6px',borderRadius:3}}>{exp.name}</span>
                ))}
                {f.exports.length>4&&<span style={{fontFamily:'var(--mono)',fontSize:9,color:'var(--gh-fg-subtle)',padding:'1px 4px'}}>+{f.exports.length-4}</span>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

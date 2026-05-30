import React from 'react'
import { PageHeader, EmptyState, GhLink } from '../ui.jsx'

export default function CircularDeps({data}){
  const {cycles,owner,repo,branch}=data
  const ghUrl=p=>owner?`https://github.com/${owner}/${repo}/blob/${branch}/${p}`:null

  if(!cycles||cycles.length===0){
    return(
      <div className="fadeUp">
        <PageHeader title="Circular Dependencies" subtitle="Import cycle detection via transitive import chain tracing"/>
        <EmptyState icon="✓" title="No circular dependencies detected" sub="All import chains are acyclic"/>
      </div>
    )
  }

  return(
    <div className="fadeUp">
      <PageHeader title="Circular Dependencies" subtitle={`${cycles.length} import cycle${cycles.length>1?'s':''} detected`}/>

      <div style={{background:'var(--gh-danger-subtle)',border:'1px solid var(--gh-danger-muted)',borderRadius:8,padding:'14px 18px',marginBottom:20,display:'flex',gap:14,alignItems:'flex-start'}}>
        <span style={{fontSize:20}}>🔄</span>
        <div>
          <div style={{fontFamily:'var(--sans)',fontSize:14,fontWeight:600,color:'var(--gh-danger-fg)',marginBottom:4}}>
            {cycles.length} circular import chain{cycles.length>1?'s':''} found
          </div>
          <div style={{fontFamily:'var(--sans)',fontSize:13,color:'var(--gh-fg-default)',lineHeight:1.6}}>
            Circular dependencies can cause initialisation-order bugs, memory leaks, and build failures. Fix by extracting shared logic into a new module that both files import — breaking the cycle.
          </div>
        </div>
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {cycles.map((cycle,i)=>(
          <div key={i} style={{background:'var(--gh-canvas-overlay)',border:'1px solid var(--gh-danger-muted)',borderRadius:8,padding:'16px 18px',animation:`fadeUp 0.3s ease ${i*40}ms both`}}>
            <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--gh-danger-fg)',letterSpacing:'0.06em',marginBottom:14,textTransform:'uppercase'}}>
              Cycle #{i+1} — {cycle.length-1} files
            </div>
            <div style={{display:'flex',alignItems:'center',flexWrap:'wrap',gap:6}}>
              {cycle.map((path,j)=>(
                <React.Fragment key={j}>
                  <div style={{background:'var(--gh-danger-subtle)',border:'1px solid var(--gh-danger-muted)',borderRadius:5,padding:'6px 12px'}}>
                    {ghUrl(path)?(
                      <GhLink href={ghUrl(path)} style={{fontFamily:'var(--mono)',fontSize:11,fontWeight:j===0?600:400}}>
                        {path.split('/').pop()}
                      </GhLink>
                    ):(
                      <span style={{fontFamily:'var(--mono)',fontSize:11,color:j===0?'var(--gh-danger-fg)':'var(--gh-fg-default)',fontWeight:j===0?600:400}}>
                        {path.split('/').pop()}
                      </span>
                    )}
                  </div>
                  {j<cycle.length-1&&<span style={{fontFamily:'var(--mono)',fontSize:14,color:'var(--gh-danger-fg)',opacity:0.6}}>→</span>}
                </React.Fragment>
              ))}
            </div>
            <div style={{marginTop:12,fontFamily:'var(--mono)',fontSize:9,color:'var(--gh-fg-muted)',lineHeight:2.2}}>
              {cycle.slice(0,-1).map((path,j)=>(
                <div key={j}>{path}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

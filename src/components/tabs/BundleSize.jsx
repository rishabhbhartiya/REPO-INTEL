import React from 'react'
import { PageHeader, EmptyState, GhLink } from '../ui.jsx'

function fmt(b){if(!b)return'0 B';if(b<1024)return b+' B';if(b<1048576)return(b/1024).toFixed(1)+' KB';return(b/1048576).toFixed(2)+' MB'}

export default function BundleSize({data}){
  const {bundleMap,classified,owner,repo,branch}=data
  const ghUrl=p=>owner?`https://github.com/${owner}/${repo}/blob/${branch}/${p}`:null
  const entries=Object.entries(bundleMap||{})

  if(!entries.length){
    return(
      <div className="fadeUp">
        <PageHeader title="Bundle Size Estimator" subtitle="Import-chain size estimation from each entry point"/>
        <EmptyState icon="⊟" title="No entry points found" sub="Bundle estimation requires at least one engine/entry file"/>
      </div>
    )
  }

  const maxSize=Math.max(...entries.map(([,v])=>v.size),1)
  const totalAllFiles=classified.reduce((a,f)=>a+(f.size||0),0)

  return(
    <div className="fadeUp">
      <PageHeader title="Bundle Size Estimator" subtitle="Estimated raw size of the import chain from each entry point. No file sizes shown per-file."/>

      <div style={{background:'var(--gh-accent-subtle)',border:'1px solid var(--gh-accent-muted)',borderRadius:8,padding:'12px 16px',marginBottom:20}}>
        <div style={{fontFamily:'var(--sans)',fontSize:13,color:'var(--gh-fg-default)',lineHeight:1.7}}>
          <strong style={{color:'var(--gh-accent-fg)'}}>How this works:</strong> From each entry point, we trace the full import graph recursively and sum raw file sizes. This is a rough upper-bound estimate — actual bundle size after minification and tree-shaking will be smaller. Dynamic imports are not followed.
        </div>
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:20}}>
        {entries.sort(([,a],[,b])=>b.size-a.size).map(([entryPath,info],i)=>{
          const pct=maxSize>0?(info.size/maxSize)*100:0
          const ofTotal=totalAllFiles>0?(info.size/totalAllFiles)*100:0
          return(
            <div key={entryPath} style={{background:'var(--gh-canvas-overlay)',border:'1px solid var(--gh-border-muted)',borderRadius:8,padding:'16px 18px',animation:`fadeUp 0.3s ease ${i*40}ms both`}}>
              <div style={{display:'flex',alignItems:'flex-start',gap:12,marginBottom:12}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                    {ghUrl(entryPath)?(
                      <GhLink href={ghUrl(entryPath)} style={{fontFamily:'var(--mono)',fontSize:13,fontWeight:600}}>
                        {entryPath}
                      </GhLink>
                    ):(
                      <span style={{fontFamily:'var(--mono)',fontSize:13,color:'var(--gh-success-fg)',fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{entryPath}</span>
                    )}
                  </div>
                  <div style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--gh-fg-muted)'}}>
                    {info.fileCount} file{info.fileCount!==1?'s':''} in import chain · {ofTotal.toFixed(1)}% of repo
                  </div>
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <div style={{fontFamily:'var(--mono)',fontSize:22,fontWeight:700,color:'var(--gh-accent-fg)',lineHeight:1}}>{fmt(info.size)}</div>
                  <div style={{fontFamily:'var(--mono)',fontSize:9,color:'var(--gh-fg-subtle)',marginTop:2}}>raw estimate</div>
                </div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{flex:1,height:6,background:'var(--gh-border-muted)',borderRadius:3,overflow:'hidden'}}>
                  <div style={{width:`${pct}%`,height:'100%',background:'var(--gh-accent-emphasis)',borderRadius:3,transition:'width 0.6s ease'}}/>
                </div>
                <span style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--gh-fg-muted)',flexShrink:0,minWidth:36,textAlign:'right'}}>{pct.toFixed(0)}%</span>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{background:'var(--gh-canvas-overlay)',border:'1px solid var(--gh-border-muted)',borderRadius:8,padding:'14px 18px'}}>
        <div style={{fontFamily:'var(--sans)',fontSize:12,fontWeight:600,color:'var(--gh-fg-muted)',letterSpacing:'0.04em',marginBottom:10,textTransform:'uppercase'}}>Repo Totals</div>
        <div style={{display:'flex',gap:24,flexWrap:'wrap',fontFamily:'var(--mono)',fontSize:12,color:'var(--gh-fg-muted)'}}>
          <div>Total files: <span style={{color:'var(--gh-fg-default)',fontWeight:600}}>{classified.length}</span></div>
          <div>Total raw: <span style={{color:'var(--gh-fg-default)',fontWeight:600}}>{fmt(totalAllFiles)}</span></div>
          <div>Avg file: <span style={{color:'var(--gh-fg-default)',fontWeight:600}}>{fmt(Math.round(totalAllFiles/Math.max(classified.length,1)))}</span></div>
        </div>
      </div>
    </div>
  )
}

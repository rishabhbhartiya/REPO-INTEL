import React, { useMemo } from 'react'
import Badge from '../Badge.jsx'
import { PageHeader, EmptyState, GhLink } from '../ui.jsx'

function timeAgo(d){if(!d)return'?';const diff=Date.now()-new Date(d).getTime(),days=Math.floor(diff/86400000);if(days<1)return'today';if(days<7)return days+'d ago';if(days<30)return Math.floor(days/7)+'w ago';if(days<365)return Math.floor(days/30)+'mo ago';return Math.floor(days/365)+'y ago'}

export default function GitHistory({data}){
  const {classified,owner,repo,branch}=data
  const filesWithGit=useMemo(()=>classified.filter(f=>f.gitInfo).sort((a,b)=>b.gitInfo.churnRate-a.gitInfo.churnRate),[classified])
  const maxChurn=filesWithGit[0]?.gitInfo?.churnRate||1
  const ghUrl=p=>owner?`https://github.com/${owner}/${repo}/blob/${branch}/${p}`:null

  if(!filesWithGit.length){
    return(
      <div className="fadeUp">
        <PageHeader title="Git History" subtitle="Commit history, churn rate, last author per file"/>
        <EmptyState icon="⊕" title="No git history loaded" sub="Git data is fetched for the top-scored files during analysis"/>
      </div>
    )
  }

  return(
    <div className="fadeUp">
      <PageHeader title="Git History" subtitle={`${filesWithGit.length} files with git data · sorted by churn rate (commits = change frequency)`}/>

      <div style={{background:'var(--gh-accent-subtle)',border:'1px solid var(--gh-accent-muted)',borderRadius:8,padding:'12px 16px',marginBottom:20}}>
        <div style={{fontFamily:'var(--sans)',fontSize:13,color:'var(--gh-fg-default)',lineHeight:1.6}}>
          <strong style={{color:'var(--gh-accent-fg)'}}>Churn rate</strong> = number of commits to this file in the last 10 commits sampled. Higher churn = changes more frequently = higher risk of bugs. Git data is only fetched for the top {filesWithGit.length} highest-scored files.
        </div>
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:5}}>
        {filesWithGit.map((f,i)=>{
          const pct=maxChurn>0?Math.min(100,(f.gitInfo.churnRate/maxChurn)*100):0
          const churnColor=pct>75?'var(--gh-danger-fg)':pct>50?'var(--gh-severe-fg)':pct>25?'var(--gh-attention-fg)':'var(--gh-success-fg)'
          return(
            <div key={f.path} style={{display:'flex',alignItems:'center',gap:14,background:'var(--gh-canvas-overlay)',border:'1px solid var(--gh-border-muted)',borderRadius:7,padding:'12px 16px',animation:`fadeUp 0.25s ease ${i*20}ms both`,transition:'border-color 0.15s'}}
              onMouseEnter={e=>e.currentTarget.style.borderColor='var(--gh-border-default)'}
              onMouseLeave={e=>e.currentTarget.style.borderColor='var(--gh-border-muted)'}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:5}}>
                  <Badge role={f.role} small/>
                  {ghUrl(f.path)?(
                    <GhLink href={ghUrl(f.path)} style={{fontFamily:'var(--mono)',fontSize:12,fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1}}>
                      {f.path}
                    </GhLink>
                  ):(
                    <span style={{fontFamily:'var(--mono)',fontSize:12,color:'var(--gh-fg-default)',fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1}}>{f.path}</span>
                  )}
                </div>
                <div style={{display:'flex',gap:16,fontFamily:'var(--mono)',fontSize:10,color:'var(--gh-fg-muted)'}}>
                  <span>Last: <span style={{color:'var(--gh-fg-default)'}}>{timeAgo(f.gitInfo.lastCommit)}</span></span>
                  <span>Author: <span style={{color:'var(--gh-accent-fg)'}}>{f.gitInfo.lastAuthor}</span></span>
                </div>
              </div>
              <div style={{textAlign:'right',flexShrink:0}}>
                <div style={{fontFamily:'var(--mono)',fontSize:9,color:'var(--gh-fg-subtle)',marginBottom:5,textTransform:'uppercase'}}>Churn</div>
                <div style={{display:'flex',alignItems:'center',gap:7}}>
                  <div style={{width:72,height:5,background:'var(--gh-border-muted)',borderRadius:3,overflow:'hidden'}}>
                    <div style={{width:`${pct}%`,height:'100%',background:churnColor,borderRadius:3}}/>
                  </div>
                  <span style={{fontFamily:'var(--mono)',fontSize:11,color:churnColor,fontWeight:600,minWidth:14}}>{f.gitInfo.churnRate}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{marginTop:16,textAlign:'center'}}>
        <a href={`https://github.com/${owner}/${repo}/commits/${branch}`} target="_blank" rel="noreferrer"
          style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--gh-accent-fg)'}}>
          View full commit history on GitHub ↗
        </a>
      </div>
    </div>
  )
}

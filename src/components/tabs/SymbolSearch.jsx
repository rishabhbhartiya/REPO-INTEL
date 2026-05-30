import React, { useState, useMemo } from 'react'
import Badge from '../Badge.jsx'
import { PageHeader, GhLink } from '../ui.jsx'

export default function SymbolSearch({data}){
  const {classified,owner,repo,branch}=data
  const [query,setQuery]=useState('')
  const ghUrl=p=>owner?`https://github.com/${owner}/${repo}/blob/${branch}/${p}`:null

  const results=useMemo(()=>{
    if(!query.trim()||query.length<2)return[]
    const q=query.toLowerCase(),hits=[]
    classified.forEach(file=>{
      file.exports.forEach(exp=>{
        if(exp.name.toLowerCase().includes(q)){
          const usedBy=classified.filter(o=>o.path!==file.path&&o.imports.some(i=>i.name===exp.name))
          hits.push({kind:'export',name:exp.name,type:exp.type,file,usedBy})
        }
      })
      file.imports.forEach(imp=>{
        if(imp.name.toLowerCase().includes(q)||imp.source.toLowerCase().includes(q))
          hits.push({kind:'import',name:imp.name,source:imp.source,type:imp.type,file})
      })
    })
    return hits.slice(0,60)
  },[query,classified])

  const exports=results.filter(r=>r.kind==='export')
  const imports=results.filter(r=>r.kind==='import')
  const TC={default:'var(--gh-attention-fg)',named:'var(--gh-accent-fg)',class:'var(--gh-done-fg)',function:'var(--gh-success-fg)',pub:'var(--gh-success-fg)',from:'var(--gh-accent-fg)',import:'var(--gh-accent-fg)'}

  return(
    <div className="fadeUp">
      <PageHeader title="Symbol Search" subtitle="Search across all exported functions, classes, and imported modules"/>
      <div style={{position:'relative',marginBottom:24}}>
        <span style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',color:'var(--gh-fg-muted)',fontSize:16,pointerEvents:'none'}}>⌕</span>
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search functions, classes, modules…" autoFocus
          style={{width:'100%',background:'var(--gh-canvas-overlay)',border:'1px solid var(--gh-border-default)',borderRadius:8,padding:'13px 16px 13px 42px',fontFamily:'var(--mono)',fontSize:14,color:'var(--gh-fg-default)',outline:'none',transition:'border-color 0.15s',boxShadow:'inset 0 1px 2px rgba(0,0,0,0.2)'}}
          onFocus={e=>e.target.style.borderColor='var(--gh-accent-fg)'}
          onBlur={e=>e.target.style.borderColor='var(--gh-border-default)'}
        />
        {query&&<span style={{position:'absolute',right:14,top:'50%',transform:'translateY(-50%)',fontFamily:'var(--mono)',fontSize:11,color:'var(--gh-fg-muted)'}}>{results.length} results</span>}
      </div>
      {!query&&<div style={{textAlign:'center',padding:'60px 0',color:'var(--gh-fg-muted)'}}>
        <div style={{fontSize:40,marginBottom:12,opacity:0.3}}>⌕</div>
        <div style={{fontFamily:'var(--mono)',fontSize:13}}>Start typing to search symbols</div>
        <div style={{fontFamily:'var(--mono)',fontSize:10,marginTop:8,color:'var(--gh-fg-subtle)'}}>Searches export names, import names, and module paths</div>
      </div>}
      {query.length>0&&query.length<2&&<div style={{textAlign:'center',padding:'40px 0',fontFamily:'var(--mono)',fontSize:12,color:'var(--gh-fg-muted)'}}>Type at least 2 characters</div>}
      {results.length===0&&query.length>=2&&<div style={{textAlign:'center',padding:'40px 0',fontFamily:'var(--mono)',fontSize:13,color:'var(--gh-fg-muted)'}}>No symbols matching "{query}"</div>}

      {exports.length>0&&(
        <div style={{marginBottom:20}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10,fontFamily:'var(--mono)',fontSize:10,color:'var(--gh-success-fg)',letterSpacing:'0.08em',textTransform:'uppercase'}}>
            <div style={{width:5,height:5,borderRadius:'50%',background:'var(--gh-success-fg)'}}/> Exported Symbols ({exports.length}) <div style={{flex:1,height:1,background:'var(--gh-border-muted)'}}/>
          </div>
          {exports.map((r,i)=>(
            <div key={i} style={{background:'var(--gh-canvas-overlay)',border:'1px solid var(--gh-border-muted)',borderRadius:8,padding:'12px 16px',marginBottom:5,animation:`fadeUp 0.25s ease ${i*15}ms both`}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                <span style={{fontFamily:'var(--mono)',fontSize:9,color:TC[r.type]||'var(--gh-fg-muted)',background:'var(--gh-neutral-subtle)',border:'1px solid var(--gh-border-muted)',padding:'1px 6px',borderRadius:3}}>{r.type}</span>
                <span style={{fontFamily:'var(--mono)',fontSize:15,color:'var(--gh-fg-default)',fontWeight:600}}>{r.name}</span>
                {r.usedBy.length>0&&<span style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--gh-attention-fg)',marginLeft:'auto'}}>{r.usedBy.length} consumer{r.usedBy.length>1?'s':''}</span>}
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:r.usedBy.length>0?8:0}}>
                <Badge role={r.file.role} small/>
                {ghUrl(r.file.path)?<GhLink href={ghUrl(r.file.path)} style={{fontFamily:'var(--mono)',fontSize:11}}>{r.file.path}</GhLink>:<span style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--gh-fg-muted)'}}>{r.file.path}</span>}
              </div>
              {r.usedBy.length>0&&(
                <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                  {r.usedBy.slice(0,5).map((f,j)=>ghUrl(f.path)?(
                    <GhLink key={j} href={ghUrl(f.path)} style={{fontFamily:'var(--mono)',fontSize:9,background:'var(--gh-attention-subtle)',border:'1px solid var(--gh-attention-muted)',padding:'1px 7px',borderRadius:20}}>
                      {f.path.split('/').pop()}
                    </GhLink>
                  ):(
                    <span key={j} style={{fontFamily:'var(--mono)',fontSize:9,color:'var(--gh-attention-fg)',background:'var(--gh-attention-subtle)',border:'1px solid var(--gh-attention-muted)',padding:'1px 7px',borderRadius:20}}>{f.path.split('/').pop()}</span>
                  ))}
                  {r.usedBy.length>5&&<span style={{fontFamily:'var(--mono)',fontSize:9,color:'var(--gh-fg-muted)'}}>+{r.usedBy.length-5}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {imports.length>0&&(
        <div>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10,fontFamily:'var(--mono)',fontSize:10,color:'var(--gh-accent-fg)',letterSpacing:'0.08em',textTransform:'uppercase'}}>
            <div style={{width:5,height:5,borderRadius:'50%',background:'var(--gh-accent-fg)'}}/> Import References ({imports.length}) <div style={{flex:1,height:1,background:'var(--gh-border-muted)'}}/>
          </div>
          {imports.map((r,i)=>(
            <div key={i} style={{background:'var(--gh-canvas-overlay)',border:'1px solid var(--gh-border-muted)',borderRadius:6,padding:'9px 14px',marginBottom:4,display:'flex',gap:10,alignItems:'center',animation:`fadeUp 0.2s ease ${i*10}ms both`}}>
              <span style={{fontFamily:'var(--mono)',fontSize:9,color:TC[r.type]||'var(--gh-fg-muted)',background:'var(--gh-neutral-subtle)',border:'1px solid var(--gh-border-muted)',padding:'1px 5px',borderRadius:3,flexShrink:0}}>{r.type}</span>
              <span style={{fontFamily:'var(--mono)',fontSize:12,color:'var(--gh-fg-default)',fontWeight:500}}>{r.name}</span>
              <span style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--gh-fg-subtle)'}}>from</span>
              <span style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--gh-done-fg)',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.source}</span>
              <Badge role={r.file.role} small/>
              {ghUrl(r.file.path)?<GhLink href={ghUrl(r.file.path)} style={{fontFamily:'var(--mono)',fontSize:10,flexShrink:0}}>{r.file.path.split('/').pop()}</GhLink>:<span style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--gh-fg-muted)',flexShrink:0}}>{r.file.path.split('/').pop()}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

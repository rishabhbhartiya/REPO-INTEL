import React, { useState, useMemo } from 'react'
import Badge from '../Badge.jsx'
import { PageHeader, SearchInput, FilterBtn, GhLink } from '../ui.jsx'

const TC={default:'var(--gh-attention-fg)',named:'var(--gh-accent-fg)',class:'var(--gh-done-fg)',function:'var(--gh-success-fg)',pub:'var(--gh-success-fg)',from:'var(--gh-accent-fg)',import:'var(--gh-accent-fg)',use:'var(--gh-accent-fg)',namespace:'var(--gh-success-fg)',require:'var(--gh-danger-fg)',type:'var(--gh-accent-fg)'}
const II={named:'{ }',default:'def',namespace:'* as',require:'req',from:'from',import:'imp',use:'use'}

function FileAccordion({file,allFiles,owner,repo,branch}){
  const [open,setOpen]=useState(false)
  const [sub,setSub]=useState('exports')
  if(!file.imports.length&&!file.exports.length)return null
  const localImps=file.imports.filter(i=>i.source.startsWith('.')||i.source.startsWith('/'))
  const extImps=file.imports.filter(i=>!i.source.startsWith('.')&&!i.source.startsWith('/'))
  const ghUrl=owner?`https://github.com/${owner}/${repo}/blob/${branch}/${file.path}`:null

  const exportUsage=useMemo(()=>{
    if(!open)return{}
    const m={}
    file.exports.forEach(exp=>{m[exp.name]=allFiles.filter(o=>o.path!==file.path&&o.imports.some(i=>i.name===exp.name))})
    return m
  },[open,file,allFiles])

  return(
    <div style={{background:'var(--gh-canvas-overlay)',border:'1px solid var(--gh-border-muted)',borderRadius:8,overflow:'hidden',marginBottom:6,transition:'border-color 0.15s'}}
      onMouseEnter={e=>{if(!open)e.currentTarget.style.borderColor='var(--gh-border-default)'}}
      onMouseLeave={e=>{if(!open)e.currentTarget.style.borderColor='var(--gh-border-muted)'}}>
      <div onClick={()=>setOpen(o=>!o)} style={{display:'flex',alignItems:'center',gap:10,padding:'11px 16px',cursor:'pointer',background:open?'var(--gh-canvas-subtle)':'transparent',borderBottom:open?'1px solid var(--gh-border-muted)':'none'}}>
        <span style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--gh-fg-muted)',transition:'transform 0.15s',display:'inline-block',transform:open?'rotate(90deg)':'none',flexShrink:0}}>▸</span>
        <Badge role={file.role} small/>
        <div style={{flex:1,minWidth:0,display:'flex',alignItems:'center',gap:8}}>
          {ghUrl?(
            <GhLink href={ghUrl} onClick={e=>e.stopPropagation()} style={{fontFamily:'var(--mono)',fontSize:12,fontWeight:500,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
              {file.path}
            </GhLink>
          ):(
            <span style={{fontFamily:'var(--mono)',fontSize:12,color:'var(--gh-fg-default)',fontWeight:500,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{file.path}</span>
          )}
        </div>
        <div style={{display:'flex',gap:8,flexShrink:0}}>
          {file.exports.length>0&&<span style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--gh-success-fg)',background:'var(--gh-success-subtle)',border:'1px solid var(--gh-success-muted)',padding:'1px 7px',borderRadius:20}}>↗ {file.exports.length}</span>}
          {file.imports.length>0&&<span style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--gh-accent-fg)',background:'var(--gh-accent-subtle)',border:'1px solid var(--gh-accent-muted)',padding:'1px 7px',borderRadius:20}}>↙ {file.imports.length}</span>}
        </div>
      </div>
      {open&&(
        <div>
          <div style={{display:'flex',borderBottom:'1px solid var(--gh-border-muted)',padding:'0 16px'}}>
            {[{k:'exports',l:`Exports (${file.exports.length})`,s:file.exports.length>0},{k:'local',l:`Local Imports (${localImps.length})`,s:localImps.length>0},{k:'external',l:`External (${extImps.length})`,s:extImps.length>0}].filter(t=>t.s).map(t=>(
              <button key={t.k} onClick={()=>setSub(t.k)} style={{background:'none',border:'none',borderBottom:`2px solid ${sub===t.k?'var(--gh-accent-fg)':'transparent'}`,padding:'9px 12px',fontFamily:'var(--mono)',fontSize:11,cursor:'pointer',color:sub===t.k?'var(--gh-accent-fg)':'var(--gh-fg-muted)',transition:'all 0.15s',marginBottom:-1}}>{t.l}</button>
            ))}
          </div>
          <div style={{padding:'14px 16px'}}>
            {sub==='exports'&&(
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                {file.exports.map((exp,i)=>{
                  const usedBy=exportUsage[exp.name]||[]
                  return(
                    <div key={i} style={{background:'var(--gh-canvas-default)',border:'1px solid var(--gh-border-muted)',borderRadius:6,padding:'10px 14px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <span style={{fontFamily:'var(--mono)',fontSize:9,color:TC[exp.type]||'var(--gh-fg-muted)',background:'var(--gh-neutral-subtle)',border:'1px solid var(--gh-border-muted)',padding:'1px 6px',borderRadius:3,flexShrink:0}}>{exp.type}</span>
                        <span style={{fontFamily:'var(--mono)',fontSize:13,color:'var(--gh-fg-default)',fontWeight:500}}>{exp.name}</span>
                        {usedBy.length>0&&<span style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--gh-attention-fg)',marginLeft:'auto'}}>used in {usedBy.length} file{usedBy.length>1?'s':''}</span>}
                      </div>
                      {usedBy.length>0&&(
                        <div style={{marginTop:8,display:'flex',gap:5,flexWrap:'wrap'}}>
                          {usedBy.slice(0,5).map((f,j)=>(
                            owner?(
                              <GhLink key={j} href={`https://github.com/${owner}/${repo}/blob/${branch}/${f.path}`}
                                style={{fontFamily:'var(--mono)',fontSize:9,background:'var(--gh-neutral-subtle)',border:'1px solid var(--gh-border-muted)',padding:'2px 8px',borderRadius:4,display:'flex',alignItems:'center',gap:4}}>
                                ← {f.path.split('/').pop()}
                              </GhLink>
                            ):(
                              <span key={j} style={{fontFamily:'var(--mono)',fontSize:9,color:'var(--gh-fg-muted)',background:'var(--gh-neutral-subtle)',border:'1px solid var(--gh-border-muted)',padding:'2px 8px',borderRadius:4}}>← {f.path.split('/').pop()}</span>
                            )
                          ))}
                          {usedBy.length>5&&<span style={{fontFamily:'var(--mono)',fontSize:9,color:'var(--gh-fg-muted)',padding:'2px 6px'}}>+{usedBy.length-5}</span>}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
            {sub==='local'&&localImps.map((imp,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:10,background:'var(--gh-canvas-default)',border:'1px solid var(--gh-border-muted)',borderRadius:6,padding:'8px 14px',marginBottom:4}}>
                <span style={{fontFamily:'var(--mono)',fontSize:9,color:'var(--gh-accent-fg)',background:'var(--gh-accent-subtle)',border:'1px solid var(--gh-accent-muted)',padding:'1px 6px',borderRadius:3,flexShrink:0}}>{II[imp.type]||imp.type}</span>
                <span style={{fontFamily:'var(--mono)',fontSize:12,color:'var(--gh-fg-default)',fontWeight:500}}>{imp.name}</span>
                <span style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--gh-fg-muted)'}}>from</span>
                <span style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--gh-accent-fg)',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{imp.source}</span>
              </div>
            ))}
            {sub==='external'&&(
              <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
                {extImps.map((imp,i)=>(
                  <div key={i} style={{fontFamily:'var(--mono)',fontSize:11,background:'var(--gh-canvas-default)',border:'1px solid var(--gh-border-muted)',borderRadius:6,padding:'5px 10px',display:'flex',alignItems:'center',gap:7}}>
                    <span style={{fontSize:9,color:TC[imp.type]||'var(--gh-fg-muted)'}}>{II[imp.type]||imp.type}</span>
                    <span style={{color:'var(--gh-fg-muted)'}}>{imp.name}</span>
                    <span style={{color:'var(--gh-fg-subtle)',fontSize:9}}>from</span>
                    <span style={{color:'var(--gh-done-fg)'}}>{imp.source}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Symbols({data}){
  const {classified,owner,repo,branch}=data
  const [search,setSearch]=useState('')
  const [sort,setSort]=useState('exports')
  const files=useMemo(()=>classified.filter(f=>(f.exports.length>0||f.imports.length>0)&&(!search||f.path.toLowerCase().includes(search.toLowerCase()))).sort((a,b)=>sort==='exports'?b.exports.length-a.exports.length:sort==='imports'?b.imports.length-a.imports.length:a.path.localeCompare(b.path)),[classified,search,sort])
  return(
    <div className="fadeUp">
      <PageHeader title="Symbols" subtitle={`${files.length} files with symbol data · expand for function/class detail · click path to open on GitHub`}
        right={<div style={{display:'flex',gap:8,alignItems:'center'}}><SearchInput value={search} onChange={setSearch} placeholder="Filter files…"/><div style={{display:'flex',gap:3}}>{['exports','imports','path'].map(s=><FilterBtn key={s} active={sort===s} onClick={()=>setSort(s)}>{s.charAt(0).toUpperCase()+s.slice(1)}</FilterBtn>)}</div></div>}
      />
      {files.length===0?<div style={{textAlign:'center',padding:'60px 0',fontFamily:'var(--mono)',fontSize:13,color:'var(--gh-fg-muted)'}}>No symbol data — files are deep-read during analysis</div>
      :files.map(f=><FileAccordion key={f.path} file={f} allFiles={classified} owner={owner} repo={repo} branch={branch}/>)}
    </div>
  )
}

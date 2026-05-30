import React, { useRef, useEffect, useState, useCallback } from 'react'
import { PageHeader } from '../ui.jsx'
import { BADGE } from '../../utils/github.js'

// SOLID HEX only — CSS vars don't work on canvas
const RC = {
  engine:'#3fb950',route:'#58a6ff',component:'#58a6ff',hook:'#39d353',
  state:'#a371f7',service:'#d29922',model:'#db61a2',middleware:'#f85149',
  util:'#7ee787',types:'#79c0ff',config:'#d29922',manifest:'#db6d28',
  ci:'#39d353',docker:'#58a6ff',infra:'#f85149',test:'#3fb950',
  style:'#db61a2',script:'#7ee787',doc:'#8b949e',
  noise:'#1c2128',lockfile:'#1c2128','asset-image':'#1c2128',
  'asset-svg':'#1c2128','asset-media':'#1c2128','asset-font':'#1c2128','asset-doc':'#1c2128',
  misc:'#21262d',
}
const rc = r => RC[r] || '#21262d'

function buildH(files) {
  const root={name:'root',path:'',ch:{},files:[],tot:0}
  files.forEach(f=>{
    const pts=f.path.split('/')
    let n=root
    for(let i=0;i<pts.length-1;i++){if(!n.ch[pts[i]])n.ch[pts[i]]={name:pts[i],path:pts.slice(0,i+1).join('/'),ch:{},files:[],tot:0};n=n.ch[pts[i]]}
    n.files.push(f)
  })
  function calc(n){let s=n.files.reduce((a,f)=>a+(f.size||1500),0);Object.values(n.ch).forEach(c=>{s+=calc(c)});n.tot=s;return s}
  calc(root);return root
}

function flatten(node,depth=0,sa=0,ea=Math.PI*2,max=4){
  const segs=[]
  if(depth>max)return segs
  const tot=node.tot||1
  const kids=[
    ...node.files.map(f=>({name:f.path.split('/').pop(),path:f.path,role:f.role,isFile:true,size:f.size||1500})),
    ...Object.values(node.ch).map(c=>({name:c.name,path:c.path,size:c.tot,isDir:true,node:c})),
  ]
  let a=sa
  kids.forEach(k=>{
    const span=((ea-sa)*k.size)/tot
    if(span<0.004){a+=span;return}
    segs.push({...k,depth,startAngle:a,endAngle:a+span})
    if(k.isDir&&k.node)segs.push(...flatten(k.node,depth+1,a,a+span,max))
    a+=span
  })
  return segs
}

export default function Sunburst({data}){
  const {classified,owner,repo,branch}=data
  const ref=useRef()
  const [hov,setHov]=useState(null)
  const [focus,setFocus]=useState(null)
  const segRef=useRef([])
  const DIM=600, RING=56, INN=80

  const drawAll=useCallback((segs,hovered,foc)=>{
    const c=ref.current;if(!c)return
    const ctx=c.getContext('2d'),W=c.width,H=c.height,CX=W/2,CY=H/2
    ctx.clearRect(0,0,W,H)
    // GitHub dark bg
    ctx.fillStyle='#0d1117';ctx.fillRect(0,0,W,H)
    // subtle radial glow
    const grd=ctx.createRadialGradient(CX,CY,0,CX,CY,CX*.9)
    grd.addColorStop(0,'rgba(31,111,235,0.06)');grd.addColorStop(1,'rgba(0,0,0,0)')
    ctx.fillStyle=grd;ctx.fillRect(0,0,W,H)
    // center
    ctx.beginPath();ctx.arc(CX,CY,INN,0,Math.PI*2)
    ctx.fillStyle='#010409';ctx.fill()
    ctx.strokeStyle='#30363d';ctx.lineWidth=1.5;ctx.stroke()

    segs.forEach(seg=>{
      const r0=INN+seg.depth*RING,r1=r0+RING-2
      const isH=hovered&&hovered.path===seg.path&&hovered.depth===seg.depth
      const hasFoc=!!foc,inFoc=foc&&(seg.path.startsWith(foc)||foc.startsWith(seg.path)||seg.path===foc)
      ctx.globalAlpha=hasFoc?(inFoc?1:0.08):1
      ctx.beginPath()
      ctx.arc(CX,CY,r1,seg.startAngle,seg.endAngle)
      ctx.arc(CX,CY,r0,seg.endAngle,seg.startAngle,true)
      ctx.closePath()
      if(seg.isFile){
        const col=rc(seg.role)
        ctx.fillStyle=isH?col:col+'99'
      } else {
        const darks=['#161b22','#1c2128','#1f2937','#1a2332','#1c2740']
        ctx.fillStyle=isH?'#21262d':(darks[seg.depth]||'#161b22')
      }
      ctx.fill()
      ctx.strokeStyle=isH?(seg.isFile?rc(seg.role):'#58a6ff'):'rgba(0,0,0,0.6)'
      ctx.lineWidth=isH?2:0.5;ctx.stroke()
      const span=seg.endAngle-seg.startAngle,mid=(seg.startAngle+seg.endAngle)/2
      if(span>0.09){
        const mr=r0+RING*.5,lx=CX+Math.cos(mid)*mr,ly=CY+Math.sin(mid)*mr
        ctx.save();ctx.translate(lx,ly);ctx.rotate(mid+Math.PI/2)
        ctx.textAlign='center';ctx.textBaseline='middle'
        const sz=span>0.28?10:9
        ctx.font=`${isH?600:400} ${sz}px 'JetBrains Mono',monospace`
        const maxC=Math.max(3,Math.floor((span*(r0+RING*.5))/sz*1.05))
        const lbl=seg.name.length>maxC?seg.name.slice(0,maxC-1)+'…':seg.name
        ctx.fillStyle=seg.isFile?(isH?'#e6edf3':rc(seg.role)):(isH?'#58a6ff':'#6e7681')
        ctx.fillText(lbl,0,0)
        ctx.restore()
      }
      ctx.globalAlpha=1
    })

    ctx.textAlign='center';ctx.textBaseline='middle'
    if(hovered){
      const col=hovered.isFile?rc(hovered.role):'#58a6ff'
      ctx.font='700 13px JetBrains Mono,monospace';ctx.fillStyle=col
      ctx.fillText(hovered.name.length>18?hovered.name.slice(0,17)+'…':hovered.name,CX,CY-14)
      ctx.font='400 10px JetBrains Mono,monospace';ctx.fillStyle='#6e7681'
      ctx.fillText(hovered.isFile?(BADGE[hovered.role]?.label||'FILE'):'DIRECTORY',CX,CY+4)
    } else {
      ctx.font='600 14px JetBrains Mono,monospace';ctx.fillStyle='#adbac7'
      ctx.fillText(classified.length+' files',CX,CY-7)
      ctx.font='400 9px JetBrains Mono,monospace';ctx.fillStyle='#444c56'
      ctx.fillText('hover to inspect',CX,CY+9)
    }
  },[classified.length])

  useEffect(()=>{
    const segs=flatten(buildH(classified))
    segRef.current=segs;drawAll(segs,null,null)
  },[classified,drawAll])

  useEffect(()=>{drawAll(segRef.current,hov,focus)},[hov,focus,drawAll])

  const hitTest=useCallback((mx,my)=>{
    const c=ref.current;if(!c)return null
    const W=c.width,H=c.height,CX=W/2,CY=H/2
    const dx=mx-CX,dy=my-CY,dist=Math.sqrt(dx*dx+dy*dy)
    let angle=Math.atan2(dy,dx);if(angle<0)angle+=Math.PI*2
    const depth=Math.floor((dist-INN)/RING)
    if(depth<0||dist<INN||depth>4)return null
    return segRef.current.find(s=>s.depth===depth&&angle>=s.startAngle&&angle<=s.endAngle)||null
  },[])

  const onMM=useCallback(e=>{
    const rect=ref.current.getBoundingClientRect()
    const sx=ref.current.width/rect.width,sy=ref.current.height/rect.height
    setHov(hitTest((e.clientX-rect.left)*sx,(e.clientY-rect.top)*sy))
  },[hitTest])

  const onCk=useCallback(e=>{
    const rect=ref.current.getBoundingClientRect()
    const sx=ref.current.width/rect.width,sy=ref.current.height/rect.height
    const hit=hitTest((e.clientX-rect.left)*sx,(e.clientY-rect.top)*sy)
    if(!hit)return
    if(hit.isFile&&owner)window.open(`https://github.com/${owner}/${repo}/blob/${branch}/${hit.path}`,'_blank')
    else if(hit.isDir)setFocus(p=>p===hit.path?null:hit.path)
  },[hitTest,owner,repo,branch])

  const roles=Object.keys(RC).filter(r=>!['noise','lockfile','asset-image','asset-svg','asset-media','asset-font','asset-doc'].includes(r)&&classified.some(f=>f.role===r))

  return(
    <div className="fadeUp">
      <PageHeader title="Sunburst Chart" subtitle="Directory structure as nested rings · hover to inspect · click file → GitHub · click folder → focus"/>
      <div style={{display:'flex',justifyContent:'center',gap:28,alignItems:'flex-start',flexWrap:'wrap'}}>
        {/* Canvas centered */}
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:12}}>
          <div style={{position:'relative'}}>
            <canvas ref={ref} width={DIM} height={DIM}
              style={{width:DIM,height:DIM,display:'block',borderRadius:16,border:'1px solid #30363d',cursor:'crosshair',boxShadow:'0 8px 32px rgba(0,0,0,0.5)'}}
              onMouseMove={onMM} onMouseLeave={()=>setHov(null)} onClick={onCk}
            />
            {focus&&<button onClick={()=>setFocus(null)} style={{position:'absolute',top:12,right:12,background:'#0d1117',border:'1px solid #30363d',borderRadius:5,padding:'4px 10px',fontFamily:'JetBrains Mono,monospace',fontSize:9,color:'#58a6ff',cursor:'pointer'}}>Clear focus ×</button>}
          </div>
          <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--gh-fg-subtle)',textAlign:'center'}}>
            Click file → GitHub · Click folder → Focus · Hover → Details
          </div>
        </div>

        {/* Legend */}
        <div style={{minWidth:180,maxWidth:220}}>
          <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--gh-fg-muted)',letterSpacing:'0.08em',marginBottom:12,textTransform:'uppercase'}}>File Roles</div>
          <div style={{display:'flex',flexDirection:'column',gap:5}}>
            {roles.map(role=>{
              const count=classified.filter(f=>f.role===role).length
              return(
                <div key={role} style={{display:'flex',alignItems:'center',gap:8}}>
                  <div style={{width:10,height:10,borderRadius:'50%',background:RC[role],flexShrink:0,border:`1px solid ${RC[role]}55`}}/>
                  <span style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--gh-fg-default)',flex:1}}>{BADGE[role]?.label||role.toUpperCase()}</span>
                  <span style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--gh-fg-muted)',minWidth:20,textAlign:'right'}}>{count}</span>
                </div>
              )
            })}
          </div>
          {hov&&(
            <div style={{marginTop:16,background:'var(--gh-canvas-overlay)',border:'1px solid var(--gh-border-default)',borderRadius:8,padding:'12px 14px'}}>
              <div style={{fontFamily:'var(--mono)',fontSize:12,color:hov.isFile?rc(hov.role):'var(--gh-accent-fg)',marginBottom:8,fontWeight:600,wordBreak:'break-all'}}>{hov.name}</div>
              <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--gh-fg-muted)',lineHeight:2.2}}>
                {hov.isFile&&<div>Role: <span style={{color:'var(--gh-fg-default)'}}>{BADGE[hov.role]?.label||hov.role}</span></div>}
                {hov.isDir&&<div>Directory: <span style={{color:'var(--gh-fg-default)'}}>{hov.path}</span></div>}
                {owner&&hov.isFile&&<a href={`https://github.com/${owner}/${repo}/blob/${branch}/${hov.path}`} target="_blank" rel="noreferrer" style={{color:'var(--gh-accent-fg)',fontSize:10,display:'block',marginTop:6}}>Open on GitHub ↗</a>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { NOISE_ROLES } from '../../utils/github.js'
import { PageHeader, Toggle, GhLink } from '../ui.jsx'

const ROLE_COLOR = {
  engine:'#3fb950',route:'#58a6ff',component:'#58a6ff',hook:'#39d353',
  state:'#a371f7',service:'#d29922',model:'#db61a2',middleware:'#f85149',
  util:'#7ee787',types:'#58a6ff',config:'#d29922',manifest:'#db6d28',
  ci:'#39d353',docker:'#58a6ff',infra:'#f85149',test:'#3fb950',
  style:'#db61a2',script:'#7ee787',misc:'#6e7681',
}
const gc = r => ROLE_COLOR[r] || '#6e7681'
function hr(hex) { return `${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)}` }

export default function Graph({ data }) {
  const { classified, owner, repo, branch } = data
  const canvasRef = useRef()
  const containerRef = useRef()
  const S = useRef({ nodes:[], edges:[], dragging:null, offset:{x:0,y:0}, pan:{x:0,y:0}, zoom:1, panning:false, panStart:{x:0,y:0}, animFrame:null, ticksLeft:0, hoverId:null, selectedId:null })
  const [selected, setSelected] = useState(null)
  const [showNoise, setShowNoise] = useState(false)
  const [showLock, setShowLock] = useState(false)

  const draw = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const s = S.current, ctx = canvas.getContext('2d'), W = canvas.width, H = canvas.height
    ctx.clearRect(0,0,W,H)
    ctx.save(); ctx.translate(s.pan.x, s.pan.y); ctx.scale(s.zoom, s.zoom)

    s.edges.forEach(({a,b}) => {
      const sel = s.selectedId===a.id || s.selectedId===b.id
      if (s.selectedId && !sel) return
      ctx.beginPath(); ctx.moveTo(a.x,a.y)
      const mx=(a.x+b.x)/2-(b.y-a.y)*.08, my=(a.y+b.y)/2+(b.x-a.x)*.08
      ctx.quadraticCurveTo(mx,my,b.x,b.y)
      ctx.strokeStyle = sel ? 'rgba(88,166,255,0.85)' : `rgba(${hr(b.color)},0.3)`
      ctx.lineWidth = sel ? 2 : 1; ctx.stroke()
      if (sel) {
        const dx=b.x-mx,dy=b.y-my,len=Math.sqrt(dx*dx+dy*dy)||1,nx=dx/len,ny=dy/len
        const ax=b.x-nx*(b.r+2),ay=b.y-ny*(b.r+2)
        ctx.beginPath(); ctx.moveTo(ax-ny*4-nx*8,ay+nx*4-ny*8); ctx.lineTo(ax,ay); ctx.lineTo(ax+ny*4-nx*8,ay-nx*4-ny*8)
        ctx.strokeStyle='rgba(88,166,255,0.8)'; ctx.lineWidth=1; ctx.stroke()
      }
    })

    s.nodes.forEach(n => {
      const isSel=s.selectedId===n.id, isHov=s.hoverId===n.id
      const dim=s.selectedId&&!isSel&&!s.edges.some(e=>(e.a.id===s.selectedId&&e.b.id===n.id)||(e.b.id===s.selectedId&&e.a.id===n.id))
      ctx.globalAlpha = dim ? 0.15 : 1
      const r = n.r + (isSel||isHov ? 4 : 0)
      if (isSel||isHov) {
        const g=ctx.createRadialGradient(n.x,n.y,r*.3,n.x,n.y,r*3)
        g.addColorStop(0,`rgba(${hr(n.color)},0.25)`); g.addColorStop(1,'rgba(0,0,0,0)')
        ctx.beginPath(); ctx.arc(n.x,n.y,r*3,0,Math.PI*2); ctx.fillStyle=g; ctx.fill()
      }
      ctx.beginPath(); ctx.arc(n.x,n.y,r,0,Math.PI*2)
      ctx.fillStyle=`rgba(${hr(n.color)},0.12)`; ctx.fill()
      ctx.strokeStyle=n.color; ctx.lineWidth=isSel?2.5:1.5; ctx.stroke()
      ctx.font=`${isSel?700:400} ${r>20?11:10}px 'JetBrains Mono',monospace`
      ctx.textAlign='center'; ctx.textBaseline='middle'
      ctx.fillStyle=isSel||isHov?n.color:`rgba(${hr(n.color)},0.9)`
      const lbl=n.label.length>14?n.label.slice(0,13)+'…':n.label
      ctx.fillText(lbl,n.x,n.y)
      ctx.globalAlpha=1
    })
    ctx.restore()
  }, [])

  const tick = useCallback(() => {
    const s=S.current
    if (s.ticksLeft<=0){draw();return}
    s.ticksLeft--
    const nodes=s.nodes
    for(let i=0;i<nodes.length;i++){for(let j=i+1;j<nodes.length;j++){
      const a=nodes[i],b=nodes[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.sqrt(dx*dx+dy*dy)||1,min=(a.r+b.r)*4.2
      if(d<min){const f=(min-d)/d*.65;a.vx-=dx*f/d;a.vy-=dy*f/d;b.vx+=dx*f/d;b.vy+=dy*f/d}
    }}
    s.edges.forEach(({a,b})=>{const dx=b.x-a.x,dy=b.y-a.y,d=Math.sqrt(dx*dx+dy*dy)||1,t=155;if(d>t){const f=(d-t)*.012;a.vx+=dx*f/d;a.vy+=dy*f/d;b.vx-=dx*f/d;b.vy-=dy*f/d}})
    const W=canvasRef.current?.width||900,H=canvasRef.current?.height||500
    nodes.forEach(n=>{n.vx+=(W/2-n.x)*.002;n.vy+=(H/2-n.y)*.002;n.x+=n.vx;n.y+=n.vy;n.vx*=.80;n.vy*=.80;n.x=Math.max(n.r+4,Math.min(W-n.r-4,n.x));n.y=Math.max(n.r+4,Math.min(H-n.r-4,n.y))})
    draw(); s.animFrame=requestAnimationFrame(tick)
  }, [draw])

  useEffect(()=>{
    const s=S.current; if(s.animFrame)cancelAnimationFrame(s.animFrame)
    const files=classified.filter(f=>{if(!showNoise&&NOISE_ROLES.has(f.role))return false;if(!showLock&&f.role==='lockfile')return false;return true}).slice(0,65)
    const W=containerRef.current?.clientWidth||900,H=500
    if(canvasRef.current){canvasRef.current.width=W;canvasRef.current.height=H}
    const roleRing={engine:0,route:1,service:1,state:1,model:1,component:2,hook:2,middleware:2,util:3,config:3,types:3,manifest:3,test:4,style:4,misc:5}
    const rings=[0,0,0,0,0,0],angles=[0,0,0,0,0,0],radii=[0,90,185,280,365,440]
    files.forEach(f=>{const r=roleRing[f.role]??5;rings[r]++})
    s.nodes=files.map(f=>{
      const ring=roleRing[f.role]??5,angle=(angles[ring]++/Math.max(rings[ring],1))*Math.PI*2,rad=radii[ring]
      return{id:f.path,label:f.path.split('/').pop().replace(/\.[^.]+$/,''),fullPath:f.path,role:f.role,color:gc(f.role),imports:f.imports,exports:f.exports,importedBy:f.importedBy,x:W/2+(ring===0?0:Math.cos(angle)*rad),y:H/2+(ring===0?0:Math.sin(angle)*rad),vx:0,vy:0,r:ring===0?26:ring===1?20:16}
    })
    const ni={};s.nodes.forEach(n=>{ni[n.id]=n});const seen=new Set();s.edges=[]
    s.nodes.forEach(src=>{src.importedBy.forEach(ip=>{const tgt=ni[ip];if(!tgt)return;const key=[src.id,tgt.id].sort().join('|');if(seen.has(key))return;seen.add(key);s.edges.push({a:tgt,b:src})})})
    s.hoverId=null;s.selectedId=null;s.pan={x:0,y:0};s.zoom=1;s.ticksLeft=130
    s.animFrame=requestAnimationFrame(tick)
    return()=>{if(s.animFrame)cancelAnimationFrame(s.animFrame)}
  },[classified,showNoise,showLock,tick])

  const toWorld=useCallback((cx,cy)=>{const s=S.current,rect=canvasRef.current.getBoundingClientRect();return{x:(cx-rect.left-s.pan.x)/s.zoom,y:(cy-rect.top-s.pan.y)/s.zoom}},[])
  const hitTest=useCallback((wx,wy)=>S.current.nodes.find(n=>{const dx=n.x-wx,dy=n.y-wy;return Math.sqrt(dx*dx+dy*dy)<=n.r+6})||null,[])

  useEffect(()=>{
    const canvas=canvasRef.current;if(!canvas)return;const s=S.current
    const onDown=e=>{const{x,y}=toWorld(e.clientX,e.clientY);const hit=hitTest(x,y);if(hit){s.dragging=hit;s.offset={x:x-hit.x,y:y-hit.y};s.ticksLeft=0}else{s.panStart={x:e.clientX-s.pan.x,y:e.clientY-s.pan.y};s.panning=true}}
    const onMove=e=>{const{x,y}=toWorld(e.clientX,e.clientY);const hit=hitTest(x,y);const newHov=hit?.id||null;if(s.hoverId!==newHov){s.hoverId=newHov;canvas.style.cursor=hit?'pointer':s.panning?'grabbing':'grab';draw()}if(s.dragging){s.dragging.x=x-s.offset.x;s.dragging.y=y-s.offset.y;s.dragging.vx=0;s.dragging.vy=0;draw()}else if(s.panning){s.pan.x=e.clientX-s.panStart.x;s.pan.y=e.clientY-s.panStart.y;draw()}}
    const onUp=()=>{if(s.dragging){s.ticksLeft=30;s.animFrame=requestAnimationFrame(tick);s.dragging=null}s.panning=false}
    const onClick=e=>{const{x,y}=toWorld(e.clientX,e.clientY);const hit=hitTest(x,y);if(hit){const ns=s.selectedId===hit.id?null:hit.id;s.selectedId=ns;setSelected(ns?hit:null);draw()}else{s.selectedId=null;setSelected(null);draw()}}
    const onWheel=e=>{e.preventDefault();s.zoom=Math.max(0.25,Math.min(4,s.zoom*(e.deltaY<0?1.1:.9)));draw()}
    canvas.addEventListener('mousedown',onDown);window.addEventListener('mousemove',onMove);window.addEventListener('mouseup',onUp);canvas.addEventListener('click',onClick);canvas.addEventListener('wheel',onWheel,{passive:false})
    return()=>{canvas.removeEventListener('mousedown',onDown);window.removeEventListener('mousemove',onMove);window.removeEventListener('mouseup',onUp);canvas.removeEventListener('click',onClick);canvas.removeEventListener('wheel',onWheel)}
  },[draw,hitTest,toWorld,tick])

  const ghUrl = p => owner ? `https://github.com/${owner}/${repo}/blob/${branch}/${p}` : null

  return (
    <div className="fadeUp">
      <PageHeader title="Dependency Graph" subtitle="Physics-settled · drag nodes · scroll to zoom · click to inspect"
        right={<div style={{display:'flex',gap:10}}><Toggle label="Noise" value={showNoise} onChange={()=>setShowNoise(v=>!v)}/><Toggle label="Lockfiles" value={showLock} onChange={()=>setShowLock(v=>!v)}/><button onClick={()=>{const s=S.current;s.pan={x:0,y:0};s.zoom=1;draw()}} style={{background:'var(--gh-btn-bg)',border:'1px solid var(--gh-border-default)',borderRadius:5,padding:'4px 10px',fontFamily:'var(--mono)',fontSize:10,color:'var(--gh-fg-muted)',cursor:'pointer'}}>Reset</button></div>}
      />
      <div style={{display:'flex',gap:8,marginBottom:12,flexWrap:'wrap'}}>
        {Object.entries(ROLE_COLOR).slice(0,12).map(([role,color])=>(
          <div key={role} style={{display:'flex',alignItems:'center',gap:4}}>
            <div style={{width:8,height:8,borderRadius:'50%',background:color}}/>
            <span style={{fontFamily:'var(--mono)',fontSize:9,color:'var(--gh-fg-muted)'}}>{role}</span>
          </div>
        ))}
      </div>
      <div ref={containerRef} style={{position:'relative',background:'var(--gh-canvas-inset)',border:'1px solid var(--gh-border-default)',borderRadius:10,overflow:'hidden'}}>
        <canvas ref={canvasRef} style={{display:'block',cursor:'grab',width:'100%'}}/>
        <div style={{position:'absolute',bottom:10,left:12,fontFamily:'var(--mono)',fontSize:9,color:'var(--gh-fg-subtle)'}}>drag · scroll zoom · click to inspect</div>
      </div>
      {selected && (
        <div style={{marginTop:14,background:'var(--gh-canvas-overlay)',border:`1px solid ${gc(selected.role)}44`,borderRadius:10,padding:'16px 20px',animation:'fadeUp 0.2s ease'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
            <div style={{width:8,height:8,borderRadius:'50%',background:gc(selected.role)}}/>
            <span style={{fontFamily:'var(--mono)',fontSize:13,color:'var(--gh-fg-default)',fontWeight:600,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{selected.fullPath}</span>
            {ghUrl(selected.fullPath)&&<GhLink href={ghUrl(selected.fullPath)} style={{fontFamily:'var(--mono)',fontSize:10,background:'var(--gh-accent-subtle)',border:'1px solid var(--gh-accent-muted)',padding:'3px 10px',borderRadius:4}}>View on GitHub ↗</GhLink>}
            <button onClick={()=>{S.current.selectedId=null;setSelected(null);draw()}} style={{background:'none',border:'none',color:'var(--gh-fg-muted)',fontSize:18,cursor:'pointer',lineHeight:1}}>×</button>
          </div>
          <div style={{display:'flex',gap:28,flexWrap:'wrap'}}>
            {selected.imports.length>0&&<div><div style={{fontFamily:'var(--mono)',fontSize:9,color:'var(--gh-fg-subtle)',letterSpacing:'0.08em',marginBottom:6,textTransform:'uppercase'}}>Imports ({selected.imports.length})</div>{selected.imports.slice(0,8).map((imp,i)=><div key={i} style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--gh-fg-muted)',padding:'2px 0'}}><span style={{color:'var(--gh-fg-subtle)'}}>←</span> <span style={{color:'var(--gh-fg-default)'}}>{imp.name}</span><span style={{color:'var(--gh-fg-subtle)'}}> from </span>{imp.source}</div>)}</div>}
            {selected.exports.length>0&&<div><div style={{fontFamily:'var(--mono)',fontSize:9,color:'var(--gh-fg-subtle)',letterSpacing:'0.08em',marginBottom:6,textTransform:'uppercase'}}>Exports ({selected.exports.length})</div>{selected.exports.slice(0,8).map((exp,i)=><div key={i} style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--gh-fg-muted)',padding:'2px 0'}}><span style={{color:'var(--gh-fg-subtle)'}}>→</span> <span style={{color:'var(--gh-fg-default)'}}>{exp.name}</span><span style={{color:'var(--gh-fg-subtle)',fontSize:9}}> ({exp.type})</span></div>)}</div>}
            {selected.importedBy.length>0&&<div><div style={{fontFamily:'var(--mono)',fontSize:9,color:'var(--gh-fg-subtle)',letterSpacing:'0.08em',marginBottom:6,textTransform:'uppercase'}}>Used By ({selected.importedBy.length})</div>{selected.importedBy.slice(0,6).map((p,i)=>ghUrl(p)?<GhLink key={i} href={ghUrl(p)} style={{display:'block',fontFamily:'var(--mono)',fontSize:11,padding:'2px 0'}}>⬡ {p.split('/').pop()}</GhLink>:<div key={i} style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--gh-attention-fg)',padding:'2px 0'}}>⬡ {p.split('/').pop()}</div>)}</div>}
          </div>
        </div>
      )}
    </div>
  )
}

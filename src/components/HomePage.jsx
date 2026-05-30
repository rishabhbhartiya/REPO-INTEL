import React, { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

const FEATURES = [
  {icon:'🌳',title:'File Tree',sub:'Role-classified, collapsible, GitHub-linked'},
  {icon:'📊',title:'Priority Map',sub:'Ranked reading order by import frequency'},
  {icon:'🕸',title:'Dep Graph',sub:'Physics simulation with edge arrows'},
  {icon:'🌞',title:'Sunburst',sub:'Directory rings, click to focus'},
  {icon:'🔍',title:'Symbol Search',sub:'Find functions & classes globally'},
  {icon:'🔥',title:'Complexity Heat',sub:'Hot/cold file scoring'},
  {icon:'💀',title:'Dead Code',sub:'Content + import based detection'},
  {icon:'🔄',title:'Circular Deps',sub:'Cycle chain detection'},
  {icon:'📦',title:'Bundle Est.',sub:'Import-chain size estimator'},
  {icon:'🔗',title:'Dependencies',sub:'Categorised package registry'},
  {icon:'📅',title:'Git History',sub:'Churn rate & author per file'},
  {icon:'💡',title:'Insights',sub:'Framework & architecture detection'},
  {icon:'🚀',title:'Deploy Status',sub:'Live URL, stars, forks, issues'},
  {icon:'🤖',title:'AI Chat',sub:'GPT-4 / Claude / Gemini with repo context'},
]

const EXAMPLES = [
  'rishabhbhartiya/GitCity',
  'KalpakPS/GitWrapped',
  'vercel/next.js',
  'facebook/react',
  'tiangolo/fastapi',
]

function BgCanvas() {
  const ref = useRef()
  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    let W = canvas.width = window.innerWidth
    let H = canvas.height = window.innerHeight
    const onResize = () => { W=canvas.width=window.innerWidth; H=canvas.height=window.innerHeight }
    window.addEventListener('resize',onResize)
    const pts = Array.from({length:50},()=>({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.25,vy:(Math.random()-.5)*.25,a:Math.random()*.6+.2}))
    let raf
    const draw = () => {
      ctx.clearRect(0,0,W,H)
      ctx.strokeStyle='rgba(48,54,61,0.6)'; ctx.lineWidth=1
      const g=80
      for(let x=0;x<W;x+=g){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}
      for(let y=0;y<H;y+=g){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
      pts.forEach(p=>{
        p.x+=p.vx;p.y+=p.vy
        if(p.x<0)p.x=W;if(p.x>W)p.x=0;if(p.y<0)p.y=H;if(p.y>H)p.y=0
        ctx.beginPath();ctx.arc(p.x,p.y,1.5,0,Math.PI*2)
        ctx.fillStyle=`rgba(88,166,255,${p.a})`;ctx.fill()
      })
      pts.forEach((a,i)=>pts.slice(i+1).forEach(b=>{
        const dx=a.x-b.x,dy=a.y-b.y,d=Math.sqrt(dx*dx+dy*dy)
        if(d<130){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle=`rgba(56,139,253,${(1-d/130)*.12})`;ctx.lineWidth=1;ctx.stroke()}
      }))
      raf=requestAnimationFrame(draw)
    }
    draw()
    return()=>{window.removeEventListener('resize',onResize);cancelAnimationFrame(raf)}
  },[])
  return <canvas ref={ref} style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:0}}/>
}

export default function HomePage({onScan}){
  const [url,setUrl]=useState('')
  const wrapRef=useRef()
  const titleRef=useRef()
  const subRef=useRef()
  const inputRef=useRef()
  const cardsRef=useRef()

  useEffect(()=>{
    const tl=gsap.timeline({defaults:{ease:'power3.out'}})
    tl.fromTo(titleRef.current,{y:30,opacity:0},{y:0,opacity:1,duration:0.8})
      .fromTo(subRef.current,{y:20,opacity:0},{y:0,opacity:1,duration:0.6},'-=0.4')
      .fromTo(inputRef.current,{y:16,opacity:0},{y:0,opacity:1,duration:0.5},'-=0.3')
      .fromTo('.feat-card',{y:20,opacity:0},{y:0,opacity:1,duration:0.4,stagger:0.03},'-=0.2')
  },[])

  const go=(u)=>{
    const target=(u||url).trim()
    if(!target)return
    const full=target.startsWith('http')?target:`https://github.com/${target}`
    gsap.to(wrapRef.current,{opacity:0,y:-12,duration:0.3,ease:'power2.in',onComplete:()=>onScan(full)})
  }

  return(
    <div ref={wrapRef} style={{minHeight:'100vh',background:'var(--gh-canvas-default)',position:'relative',overflow:'hidden'}}>
      <BgCanvas/>
      {/* GitHub-style top header bar */}
      <div style={{position:'relative',zIndex:2,background:'var(--gh-canvas-overlay)',borderBottom:'1px solid var(--gh-border-default)',padding:'12px 24px',display:'flex',alignItems:'center',gap:12}}>
        <div style={{fontFamily:'var(--mono)',fontSize:14,fontWeight:700,color:'var(--gh-fg-default)',display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontSize:18}}>⬡</span> REPO·INTEL
        </div>
        <span style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--gh-fg-muted)',background:'var(--gh-neutral-subtle)',border:'1px solid var(--gh-border-default)',padding:'1px 8px',borderRadius:20}}>v3.1</span>
      </div>

      <div style={{position:'relative',zIndex:2,display:'flex',flexDirection:'column',alignItems:'center',padding:'80px 24px 60px'}}>
        {/* Hero */}
        <div ref={titleRef} style={{opacity:0,textAlign:'center',marginBottom:16}}>
          <h1 style={{fontFamily:'var(--sans)',fontSize:'clamp(28px,4vw,52px)',fontWeight:800,color:'var(--gh-fg-default)',lineHeight:1.15,letterSpacing:'-0.02em'}}>
            Understand any GitHub<br/>
            <span style={{color:'var(--gh-accent-fg)'}}>repository</span> instantly
          </h1>
        </div>
        <p ref={subRef} style={{opacity:0,fontFamily:'var(--sans)',fontSize:16,color:'var(--gh-fg-muted)',textAlign:'center',maxWidth:560,lineHeight:1.7,marginBottom:36}}>
          Architecture breakdown, dependency graph, complexity heatmap, dead code signals, circular deps, bundle estimator, and AI chat — all rule-based, no API needed for analysis.
        </p>

        {/* Input */}
        <div ref={inputRef} style={{opacity:0,width:'100%',maxWidth:600,marginBottom:48}}>
          <div style={{background:'var(--gh-canvas-overlay)',border:'1px solid var(--gh-border-default)',borderRadius:10,padding:6,display:'flex',gap:6,boxShadow:'0 8px 24px rgba(0,0,0,0.3)'}}>
            <div style={{flex:1,display:'flex',alignItems:'center',gap:8,padding:'0 10px'}}>
              <span style={{color:'var(--gh-fg-muted)',fontSize:14,flexShrink:0}}>🔗</span>
              <input value={url} onChange={e=>setUrl(e.target.value)} onKeyDown={e=>e.key==='Enter'&&go()}
                placeholder="github.com/owner/repository"
                style={{flex:1,background:'none',border:'none',outline:'none',fontFamily:'var(--mono)',fontSize:13,color:'var(--gh-fg-default)',padding:'10px 0'}}
              />
            </div>
            <button onClick={()=>go()} style={{background:'var(--gh-btn-primary-bg)',color:'#fff',border:'none',borderRadius:7,padding:'10px 22px',fontFamily:'var(--sans)',fontSize:13,fontWeight:600,cursor:'pointer',flexShrink:0,transition:'background 0.15s'}}
              onMouseEnter={e=>e.currentTarget.style.background='var(--gh-btn-primary-hover)'}
              onMouseLeave={e=>e.currentTarget.style.background='var(--gh-btn-primary-bg)'}>
              Analyse ▶
            </button>
          </div>
          <div style={{display:'flex',gap:8,marginTop:10,flexWrap:'wrap',justifyContent:'center'}}>
            {EXAMPLES.map(u=>(
              <button key={u} onClick={()=>go(`https://github.com/${u}`)}
                style={{background:'var(--gh-canvas-overlay)',border:'1px solid var(--gh-border-muted)',borderRadius:20,padding:'4px 12px',fontFamily:'var(--mono)',fontSize:10,color:'var(--gh-fg-muted)',cursor:'pointer',transition:'all 0.15s'}}
                onMouseEnter={e=>{e.currentTarget.style.color='var(--gh-accent-fg)';e.currentTarget.style.borderColor='var(--gh-accent-muted)'}}
                onMouseLeave={e=>{e.currentTarget.style.color='var(--gh-fg-muted)';e.currentTarget.style.borderColor='var(--gh-border-muted)'}}>
                {u}
              </button>
            ))}
          </div>
        </div>

        {/* Feature cards */}
        <div style={{width:'100%',maxWidth:900}}>
          <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--gh-fg-muted)',textAlign:'center',marginBottom:16,letterSpacing:'0.08em'}}>14 ANALYSIS VIEWS</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:8}}>
            {FEATURES.map(f=>(
              <div key={f.title} className="feat-card" style={{background:'var(--gh-canvas-overlay)',border:'1px solid var(--gh-border-muted)',borderRadius:8,padding:'14px 14px',opacity:0,transition:'all 0.2s'}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--gh-border-default)';e.currentTarget.style.transform='translateY(-1px)'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--gh-border-muted)';e.currentTarget.style.transform='translateY(0)'}}>
                <div style={{fontSize:18,marginBottom:8}}>{f.icon}</div>
                <div style={{fontFamily:'var(--sans)',fontSize:13,fontWeight:600,color:'var(--gh-fg-default)',marginBottom:3}}>{f.title}</div>
                <div style={{fontFamily:'var(--sans)',fontSize:11,color:'var(--gh-fg-muted)',lineHeight:1.5}}>{f.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

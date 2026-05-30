import React, { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import FileTree from './tabs/FileTree.jsx'
import Priority from './tabs/Priority.jsx'
import Graph from './tabs/Graph.jsx'
import Sunburst from './tabs/Sunburst.jsx'
import Symbols from './tabs/Symbols.jsx'
import SymbolSearch from './tabs/SymbolSearch.jsx'
import Complexity from './tabs/Complexity.jsx'
import DeadCode from './tabs/DeadCode.jsx'
import CircularDeps from './tabs/CircularDeps.jsx'
import BundleSize from './tabs/BundleSize.jsx'
import Dependencies from './tabs/Dependencies.jsx'
import GitHistory from './tabs/GitHistory.jsx'
import Insights from './tabs/Insights.jsx'
import AIChat from './tabs/AIChat.jsx'

const NAV = [
  { id:'tree',       icon:'⬡', label:'File Tree',      color:'#00d9ff' },
  { id:'priority',   icon:'◈', label:'Priority',        color:'#00f0a0' },
  { id:'graph',      icon:'⬢', label:'Dep Graph',       color:'#b388ff' },
  { id:'sunburst',   icon:'◎', label:'Sunburst',        color:'#ffb300' },
  { id:'symbols',    icon:'⊞', label:'Symbols',         color:'#ff6eb4' },
  { id:'search',     icon:'◇', label:'Symbol Search',   color:'#00e5cc' },
  { id:'complexity', icon:'▣', label:'Complexity',      color:'#c6ff00' },
  { id:'deadcode',   icon:'◌', label:'Dead Code',       color:'#ff8c00' },
  { id:'circular',   icon:'↻', label:'Circular Deps',   color:'#ff4f6e' },
  { id:'bundle',     icon:'⊟', label:'Bundle Size',     color:'#4d9fff' },
  { id:'deps',       icon:'◆', label:'Dependencies',    color:'#ffb300' },
  { id:'git',        icon:'⊕', label:'Git History',     color:'#00f0a0' },
  { id:'insights',   icon:'◉', label:'Insights',        color:'#b388ff' },
  { id:'chat',       icon:'⚡', label:'AI Chat',         color:'#00d9ff' },
]

function ScanningScreen({ logs }) {
  const termRef = useRef()
  useEffect(() => { if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight }, [logs])

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:40}}>
      {/* Animated logo */}
      <div style={{marginBottom:40,position:'relative',width:80,height:80}}>
        <div style={{position:'absolute',inset:0,borderRadius:'50%',border:'2px solid rgba(0,217,255,0.1)',animation:'spin 8s linear infinite'}}/>
        <div style={{position:'absolute',inset:6,borderRadius:'50%',border:'1px solid rgba(0,217,255,0.2)',animation:'spin 4s linear infinite reverse'}}/>
        <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{width:24,height:24,background:'linear-gradient(135deg,#00d9ff,#00f0a0)',borderRadius:6,animation:'pulse 1.5s ease-in-out infinite'}}/>
        </div>
      </div>

      <div style={{fontFamily:'var(--mono)',fontSize:13,color:'var(--cyan)',letterSpacing:'0.1em',marginBottom:8}}>SCANNING REPOSITORY</div>
      <div style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--t3)',marginBottom:32}}>Analysing structure, symbols, dependencies…</div>

      <div ref={termRef} style={{width:'100%',maxWidth:680,background:'var(--bg2)',border:'1px solid var(--b1)',borderRadius:12,padding:'20px 24px',fontFamily:'var(--mono)',fontSize:12,lineHeight:2,maxHeight:320,overflowY:'auto',position:'relative'}}>
        <div style={{position:'absolute',top:14,right:16,display:'flex',gap:5}}>
          {['#ff4f6e','#ffb300','#00f0a0'].map(c=><div key={c} style={{width:10,height:10,borderRadius:'50%',background:c,opacity:0.5}}/>)}
        </div>
        {logs.map((l,i)=>(
          <div key={l.id} style={{color:l.type==='ok'?'var(--green)':l.type==='err'?'var(--rose)':l.type==='warn'?'var(--amber)':l.type==='accent'?'var(--cyan)':'var(--t2)',animation:i===logs.length-1?'fadeIn 0.15s ease':'none'}}>
            <span style={{color:'var(--t3)',marginRight:12,userSelect:'none'}}>{String(i+1).padStart(3,'0')}</span>{l.text}
          </div>
        ))}
        <div style={{color:'var(--t3)'}}>
          <span style={{marginRight:12}}>---</span>
          <span style={{display:'inline-block',width:8,height:14,background:'var(--cyan)',verticalAlign:'middle',animation:'blink 0.8s step-end infinite'}}/>
        </div>
      </div>
    </div>
  )
}

export default function AnalysisPage({ scanning, data, logs, activeView, setActiveView, onScan }) {
  const contentRef = useRef()
  const navRef = useRef()

  useEffect(() => {
    if (!data) return
    gsap.fromTo(navRef.current, {y:-20,opacity:0},{y:0,opacity:1,duration:0.5,ease:'power2.out'})
    gsap.fromTo(contentRef.current, {opacity:0,y:10},{opacity:1,y:0,duration:0.4,ease:'power2.out',delay:0.2})
  }, [data])

  useEffect(() => {
    if (!contentRef.current || !data) return
    gsap.fromTo(contentRef.current, {opacity:0,x:8},{opacity:1,x:0,duration:0.3,ease:'power2.out'})
  }, [activeView])

  if (scanning) return <ScanningScreen logs={logs} />

  const { classified, allDeps, cycles, deadCode } = data
  const stats = [
    { val:classified.length, label:'Files', color:'var(--cyan)' },
    { val:classified.filter(f=>f.role==='engine').length, label:'Entries', color:'var(--green)' },
    { val:classified.filter(f=>f.exports.length>0).length, label:'Analysed', color:'var(--violet)' },
    { val:Object.keys(allDeps.runtime).length, label:'Deps', color:'var(--amber)' },
    { val:classified.filter(f=>f.role==='test').length, label:'Tests', color:'var(--teal)' },
    { val:cycles?.length||0, label:'Cycles', color:cycles?.length>0?'var(--rose)':'var(--t3)' },
    { val:deadCode?.length||0, label:'Dead', color:deadCode?.length>0?'var(--orange)':'var(--t3)' },
    { val:classified.filter(f=>f.role==='component').length, label:'Components', color:'var(--blue)' },
  ]

  const activeNav = NAV.find(n=>n.id===activeView)

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)',display:'flex',flexDirection:'column'}}>
      {/* Top navbar */}
      <div ref={navRef} style={{background:'var(--bg1)',borderBottom:'1px solid var(--b1)',padding:'0 24px',position:'sticky',top:0,zIndex:100,opacity:0}}>
        {/* Repo info + stats bar */}
        <div style={{display:'flex',alignItems:'center',gap:0,height:48,borderBottom:'1px solid var(--b0)'}}>
          <div style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--cyan)',fontWeight:600,marginRight:24,flexShrink:0}}>
            REPO<span style={{color:'var(--t3)',margin:'0 4px'}}>·</span>INTEL
          </div>
          <div style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--t1)',marginRight:24,flexShrink:0}}>
            {data.owner}/<span style={{color:'var(--cyan)'}}>{data.repo}</span>
            <span style={{color:'var(--t3)',marginLeft:8}}>:{data.branch}</span>
          </div>
          <div style={{flex:1,display:'flex',gap:0,overflowX:'auto'}}>
            {stats.map((s,i)=>(
              <div key={s.label} style={{display:'flex',alignItems:'center',gap:8,padding:'0 16px',borderRight:'1px solid var(--b0)',flexShrink:0}}>
                <span style={{fontFamily:'var(--mono)',fontSize:15,fontWeight:700,color:s.color,lineHeight:1}}>{s.val}</span>
                <span style={{fontFamily:'var(--mono)',fontSize:9,color:'var(--t3)',letterSpacing:'0.06em'}}>{s.label.toUpperCase()}</span>
              </div>
            ))}
          </div>
          <button onClick={()=>{ window.location.reload() }}
            style={{background:'var(--bg3)',border:'1px solid var(--b1)',borderRadius:6,padding:'6px 14px',fontFamily:'var(--mono)',fontSize:10,color:'var(--t2)',cursor:'pointer',marginLeft:16,flexShrink:0,transition:'all 0.15s'}}
            onMouseEnter={e=>{e.currentTarget.style.color='var(--cyan)';e.currentTarget.style.borderColor='var(--b2)'}}
            onMouseLeave={e=>{e.currentTarget.style.color='var(--t2)';e.currentTarget.style.borderColor='var(--b1)'}}>
            ← NEW SCAN
          </button>
        </div>

        {/* Nav tabs */}
        <div style={{display:'flex',gap:0,overflowX:'auto',height:42,alignItems:'stretch'}}>
          {NAV.map(item=>{
            const active = activeView===item.id
            const alert = (item.id==='circular'&&cycles?.length>0)||(item.id==='deadcode'&&deadCode?.length>0)
            return(
              <button key={item.id} onClick={()=>setActiveView(item.id)}
                style={{display:'flex',alignItems:'center',gap:6,padding:'0 14px',background:'none',border:'none',borderBottom:`2px solid ${active?item.color:'transparent'}`,fontFamily:'var(--mono)',fontSize:10,color:active?item.color:'var(--t3)',cursor:'pointer',transition:'all 0.15s',whiteSpace:'nowrap',flexShrink:0,letterSpacing:'0.03em'}}
                onMouseEnter={e=>{if(!active){e.currentTarget.style.color='var(--t1)'}}}
                onMouseLeave={e=>{if(!active){e.currentTarget.style.color='var(--t3)'}}}>
                <span style={{fontSize:12}}>{item.icon}</span>
                {item.label}
                {alert&&<span style={{width:6,height:6,borderRadius:'50%',background:item.color,flexShrink:0}}/>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div ref={contentRef} style={{flex:1,padding:'28px 32px',maxWidth:1400,width:'100%',margin:'0 auto',opacity:0}}>
        {activeView==='tree'       && <FileTree data={data}/>}
        {activeView==='priority'   && <Priority data={data}/>}
        {activeView==='graph'      && <Graph data={data}/>}
        {activeView==='sunburst'   && <Sunburst data={data}/>}
        {activeView==='symbols'    && <Symbols data={data}/>}
        {activeView==='search'     && <SymbolSearch data={data}/>}
        {activeView==='complexity' && <Complexity data={data}/>}
        {activeView==='deadcode'   && <DeadCode data={data}/>}
        {activeView==='circular'   && <CircularDeps data={data}/>}
        {activeView==='bundle'     && <BundleSize data={data}/>}
        {activeView==='deps'       && <Dependencies data={data}/>}
        {activeView==='git'        && <GitHistory data={data}/>}
        {activeView==='insights'   && <Insights data={data}/>}
        {activeView==='chat'       && <AIChat data={data}/>}
      </div>
    </div>
  )
}

import React, { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import Badge from './Badge.jsx'
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

// Main nav groups
const NAV_GROUPS = [
  {
    id:'overview', label:'Overview', icon:'⊞',
    views:[{id:'dashboard',label:'Dashboard'}]
  },
  {
    id:'code', label:'Code', icon:'⬡',
    views:[
      {id:'tree',    label:'File Tree'},
      {id:'priority',label:'Priority'},
      {id:'symbols', label:'Symbols'},
      {id:'search',  label:'Symbol Search'},
    ]
  },
  {
    id:'visuals', label:'Visuals', icon:'◎',
    views:[
      {id:'graph',     label:'Dep Graph'},
      {id:'sunburst',  label:'Sunburst'},
      {id:'complexity',label:'Complexity'},
    ]
  },
  {
    id:'analysis', label:'Analysis', icon:'◈',
    views:[
      {id:'deadcode', label:'Dead Code'},
      {id:'circular', label:'Circular Deps'},
      {id:'bundle',   label:'Bundle Size'},
      {id:'git',      label:'Git History'},
    ]
  },
  {
    id:'deps', label:'Deps & Insights', icon:'◆',
    views:[
      {id:'deps',    label:'Dependencies'},
      {id:'insights',label:'Insights'},
    ]
  },
  {
    id:'ai', label:'AI Chat', icon:'⚡',
    views:[{id:'chat',label:'AI Chat'}]
  },
]

function timeAgo(d){
  if(!d)return'?'
  const diff=Date.now()-new Date(d).getTime(),days=Math.floor(diff/86400000)
  if(days<1)return'today';if(days<7)return days+'d';if(days<30)return Math.floor(days/7)+'w';if(days<365)return Math.floor(days/30)+'mo';return Math.floor(days/365)+'y'
}

function RepoCard({data}){
  const {meta,deployUrl,owner,repo,branch,classified,allDeps,cycles,deadCode}=data
  const lang=meta.language
  const langColors={'JavaScript':'#f1e05a','TypeScript':'#3178c6','Python':'#3572A5','Go':'#00ADD8','Rust':'#dea584','Ruby':'#701516','Java':'#b07219','Kotlin':'#A97BFF','C++':'#f34b7d','C':'#555555','Swift':'#F05138','PHP':'#4F5D95','C#':'#178600','Dart':'#00B4AB','Vue':'#41b883','Svelte':'#ff3e00','HTML':'#e34c26','CSS':'#563d7c'}
  const langColor=langColors[lang]||'#8b949e'

  return(
    <div style={{background:'var(--gh-canvas-overlay)',border:'1px solid var(--gh-border-default)',borderRadius:10,padding:'20px 24px',marginBottom:16}}>
      {/* Repo header */}
      <div style={{display:'flex',alignItems:'flex-start',gap:14,marginBottom:14}}>
        <div style={{width:40,height:40,borderRadius:8,background:'var(--gh-canvas-inset)',border:'1px solid var(--gh-border-muted)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>📁</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
            <a href={`https://github.com/${owner}/${repo}`} target="_blank" rel="noreferrer"
              style={{fontFamily:'var(--sans)',fontSize:18,fontWeight:600,color:'var(--gh-accent-fg)',lineHeight:1.2}}>
              {owner}/<strong>{repo}</strong>
            </a>
            <span style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--gh-fg-muted)',background:'var(--gh-neutral-subtle)',border:'1px solid var(--gh-border-default)',padding:'1px 8px',borderRadius:20}}>
              {meta.private?'Private':'Public'}
            </span>
            {deployUrl&&(
              <a href={deployUrl} target="_blank" rel="noreferrer"
                style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--gh-success-fg)',background:'var(--gh-success-subtle)',border:'1px solid var(--gh-success-muted)',padding:'1px 8px',borderRadius:20,display:'flex',alignItems:'center',gap:4}}>
                <span style={{width:6,height:6,borderRadius:'50%',background:'var(--gh-success-fg)',display:'inline-block'}}/>
                Live ↗
              </a>
            )}
          </div>
          {meta.description&&<div style={{fontFamily:'var(--sans)',fontSize:13,color:'var(--gh-fg-muted)',marginTop:4,lineHeight:1.5}}>{meta.description}</div>}
        </div>
      </div>

      {/* Stats row — GitHub style */}
      <div style={{display:'flex',gap:20,flexWrap:'wrap',marginBottom:16,paddingBottom:16,borderBottom:'1px solid var(--gh-border-muted)'}}>
        {[
          {icon:'⭐',val:(meta.stargazers_count||0).toLocaleString(),label:'Stars'},
          {icon:'🍴',val:(meta.forks_count||0).toLocaleString(),label:'Forks'},
          {icon:'⚠',val:(meta.open_issues_count||0).toLocaleString(),label:'Issues'},
          {icon:'👁',val:(meta.watchers_count||0).toLocaleString(),label:'Watchers'},
        ].map(s=>(
          <div key={s.label} style={{display:'flex',alignItems:'center',gap:5}}>
            <span style={{fontSize:13}}>{s.icon}</span>
            <span style={{fontFamily:'var(--mono)',fontSize:13,fontWeight:600,color:'var(--gh-fg-default)'}}>{s.val}</span>
            <span style={{fontFamily:'var(--sans)',fontSize:12,color:'var(--gh-fg-muted)'}}>{s.label}</span>
          </div>
        ))}
        {lang&&(
          <div style={{display:'flex',alignItems:'center',gap:5,marginLeft:'auto'}}>
            <div style={{width:12,height:12,borderRadius:'50%',background:langColor}}/>
            <span style={{fontFamily:'var(--sans)',fontSize:12,color:'var(--gh-fg-default)'}}>{lang}</span>
          </div>
        )}
        {meta.updated_at&&<div style={{fontFamily:'var(--sans)',fontSize:12,color:'var(--gh-fg-muted)',display:'flex',alignItems:'center',gap:4}}><span>🕐</span>Updated {timeAgo(meta.updated_at)}</div>}
        {meta.license&&<div style={{fontFamily:'var(--sans)',fontSize:12,color:'var(--gh-fg-muted)',display:'flex',alignItems:'center',gap:4}}><span>⚖</span>{meta.license.spdx_id}</div>}
      </div>

      {/* Analysis stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(120px,1fr))',gap:10}}>
        {[
          {val:classified.length,label:'Total Files',color:'var(--gh-fg-default)'},
          {val:classified.filter(f=>f.role==='engine').length,label:'Entry Points',color:'var(--gh-success-fg)'},
          {val:classified.filter(f=>f.exports.length>0).length,label:'Files Read',color:'var(--gh-accent-fg)'},
          {val:Object.keys(allDeps.runtime).length,label:'Runtime Deps',color:'var(--gh-attention-fg)'},
          {val:classified.filter(f=>f.role==='test').length,label:'Test Files',color:'var(--gh-success-fg)'},
          {val:cycles?.length||0,label:'Cycles',color:cycles?.length>0?'var(--gh-danger-fg)':'var(--gh-fg-muted)'},
          {val:deadCode?.length||0,label:'Dead Code',color:deadCode?.length>0?'var(--gh-severe-fg)':'var(--gh-fg-muted)'},
          {val:classified.filter(f=>f.role==='component').length,label:'Components',color:'var(--gh-done-fg)'},
        ].map(s=>(
          <div key={s.label} style={{background:'var(--gh-canvas-default)',border:'1px solid var(--gh-border-muted)',borderRadius:8,padding:'12px 14px',textAlign:'center'}}>
            <div style={{fontFamily:'var(--mono)',fontSize:22,fontWeight:700,color:s.color,lineHeight:1}}>{s.val}</div>
            <div style={{fontFamily:'var(--sans)',fontSize:11,color:'var(--gh-fg-muted)',marginTop:4}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Topics / topics from GitHub */}
      {meta.topics?.length>0&&(
        <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:14}}>
          {meta.topics.map(t=>(
            <span key={t} style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--gh-accent-fg)',background:'var(--gh-accent-subtle)',border:'1px solid var(--gh-accent-muted)',padding:'2px 10px',borderRadius:20}}>{t}</span>
          ))}
        </div>
      )}
    </div>
  )
}

function DashboardHome({data, setView}){
  const {classified,cycles,deadCode,allDeps,owner,repo,branch}=data
  const engines=classified.filter(f=>f.role==='engine')
  const topFiles=classified.filter(f=>f.exports.length>0).sort((a,b)=>b.score-a.score).slice(0,5)
  const topDeps=Object.entries(allDeps.runtime).slice(0,6)

  const QuickCard=({title,icon,onClick,badge,badgeColor})=>(
    <button onClick={onClick} style={{background:'var(--gh-canvas-overlay)',border:'1px solid var(--gh-border-default)',borderRadius:8,padding:'14px 16px',display:'flex',alignItems:'center',gap:12,cursor:'pointer',transition:'all 0.15s',width:'100%',textAlign:'left'}}
      onMouseEnter={e=>{e.currentTarget.style.background='var(--gh-canvas-subtle)';e.currentTarget.style.borderColor='var(--gh-border-default)'}}
      onMouseLeave={e=>{e.currentTarget.style.background='var(--gh-canvas-overlay)';e.currentTarget.style.borderColor='var(--gh-border-default)'}}>
      <span style={{fontSize:18}}>{icon}</span>
      <span style={{fontFamily:'var(--sans)',fontSize:13,fontWeight:500,color:'var(--gh-fg-default)',flex:1}}>{title}</span>
      {badge!==undefined&&<span style={{fontFamily:'var(--mono)',fontSize:12,fontWeight:700,color:badgeColor||'var(--gh-fg-muted)',background:'var(--gh-neutral-subtle)',border:'1px solid var(--gh-border-default)',padding:'1px 8px',borderRadius:20}}>{badge}</span>}
      <span style={{color:'var(--gh-fg-muted)'}}>›</span>
    </button>
  )

  return(
    <div className="fadeUp">
      <RepoCard data={data}/>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        {/* Quick navigation */}
        <div style={{background:'var(--gh-canvas-overlay)',border:'1px solid var(--gh-border-default)',borderRadius:10,padding:'16px 18px'}}>
          <div style={{fontFamily:'var(--sans)',fontSize:13,fontWeight:600,color:'var(--gh-fg-default)',marginBottom:12}}>Quick Navigation</div>
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            <QuickCard title="File Tree" icon="🌳" onClick={()=>setView('tree')} badge={classified.length}/>
            <QuickCard title="Dependency Graph" icon="🕸" onClick={()=>setView('graph')}/>
            <QuickCard title="Complexity Heatmap" icon="🔥" onClick={()=>setView('complexity')}/>
            {cycles?.length>0&&<QuickCard title="Circular Dependencies" icon="🔄" onClick={()=>setView('circular')} badge={cycles.length} badgeColor="var(--gh-danger-fg)"/>}
            {deadCode?.length>0&&<QuickCard title="Dead Code" icon="💀" onClick={()=>setView('deadcode')} badge={deadCode.length} badgeColor="var(--gh-severe-fg)"/>}
            <QuickCard title="AI Chat" icon="🤖" onClick={()=>setView('chat')}/>
          </div>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          {/* Entry points */}
          <div style={{background:'var(--gh-canvas-overlay)',border:'1px solid var(--gh-border-default)',borderRadius:10,padding:'16px 18px'}}>
            <div style={{fontFamily:'var(--sans)',fontSize:13,fontWeight:600,color:'var(--gh-fg-default)',marginBottom:10}}>Entry Points</div>
            {engines.length>0?engines.map(f=>(
              <div key={f.path} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 0',borderBottom:'1px solid var(--gh-border-muted)'}}>
                <span style={{fontSize:12}}>◆</span>
                <a href={`https://github.com/${owner}/${repo}/blob/${branch}/${f.path}`} target="_blank" rel="noreferrer"
                  style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--gh-accent-fg)',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                  {f.path}
                </a>
                <Badge role={f.role} small/>
              </div>
            )):<div style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--gh-fg-muted)'}}>No entry points detected</div>}
          </div>

          {/* Top deps */}
          {topDeps.length>0&&(
            <div style={{background:'var(--gh-canvas-overlay)',border:'1px solid var(--gh-border-default)',borderRadius:10,padding:'16px 18px'}}>
              <div style={{fontFamily:'var(--sans)',fontSize:13,fontWeight:600,color:'var(--gh-fg-default)',marginBottom:10}}>Top Dependencies</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
                {topDeps.map(([name,ver])=>(
                  <span key={name} style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--gh-fg-muted)',background:'var(--gh-neutral-subtle)',border:'1px solid var(--gh-border-muted)',padding:'2px 8px',borderRadius:20}}>
                    {name}
                  </span>
                ))}
                {Object.keys(allDeps.runtime).length>6&&<span style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--gh-fg-muted)',padding:'2px 8px'}}>+{Object.keys(allDeps.runtime).length-6} more</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage({data,onNewScan}){
  const [activeGroup,setActiveGroup]=useState('overview')
  const [activeView,setActiveView]=useState('dashboard')
  const contentRef=useRef()

  useEffect(()=>{
    if(contentRef.current) gsap.fromTo(contentRef.current,{opacity:0,y:6},{opacity:1,y:0,duration:0.3,ease:'power2.out'})
  },[activeView])

  const setView=(v)=>{
    setActiveView(v)
    // find which group this view belongs to
    for(const g of NAV_GROUPS){
      if(g.views.some(view=>view.id===v)){setActiveGroup(g.id);break}
    }
  }

  const activeG=NAV_GROUPS.find(g=>g.id===activeGroup)
  const {classified,cycles,deadCode}=data

  return(
    <div style={{minHeight:'100vh',background:'var(--gh-canvas-default)',display:'flex',flexDirection:'column'}}>
      {/* Top header */}
      <div style={{background:'var(--gh-header-bg)',borderBottom:'1px solid var(--gh-border-default)',padding:'0 20px',display:'flex',alignItems:'center',gap:16,height:52,flexShrink:0,position:'sticky',top:0,zIndex:100}}>
        <div style={{fontFamily:'var(--mono)',fontSize:14,fontWeight:700,color:'var(--gh-fg-default)',display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
          <span>⬡</span> REPO·INTEL
        </div>
        <div style={{width:1,height:20,background:'var(--gh-border-default)'}}/>
        <div style={{fontFamily:'var(--mono)',fontSize:12,color:'var(--gh-fg-muted)',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
          <span style={{color:'var(--gh-accent-fg)'}}>{data.owner}</span>/{data.repo}
          <span style={{color:'var(--gh-fg-subtle)',marginLeft:8}}>:{data.branch}</span>
        </div>
        <button onClick={onNewScan} style={{background:'var(--gh-btn-bg)',border:'1px solid var(--gh-btn-border)',borderRadius:6,padding:'5px 14px',fontFamily:'var(--sans)',fontSize:12,color:'var(--gh-fg-default)',cursor:'pointer',flexShrink:0,transition:'background 0.15s'}}
          onMouseEnter={e=>e.currentTarget.style.background='var(--gh-btn-hover-bg)'}
          onMouseLeave={e=>e.currentTarget.style.background='var(--gh-btn-bg)'}>
          ← New Scan
        </button>
      </div>

      {/* Main nav tabs */}
      <div style={{background:'var(--gh-canvas-overlay)',borderBottom:'1px solid var(--gh-border-default)',padding:'0 20px',display:'flex',gap:0,flexShrink:0}}>
        {NAV_GROUPS.map(g=>{
          const active=activeGroup===g.id
          const hasAlert=(g.id==='analysis'&&(cycles?.length>0||deadCode?.length>0))
          return(
            <button key={g.id} onClick={()=>{setActiveGroup(g.id);setView(g.views[0].id)}}
              style={{display:'flex',alignItems:'center',gap:6,padding:'10px 16px',background:'none',border:'none',borderBottom:`2px solid ${active?'var(--gh-accent-fg)':'transparent'}`,fontFamily:'var(--sans)',fontSize:13,fontWeight:active?600:400,color:active?'var(--gh-fg-default)':'var(--gh-fg-muted)',cursor:'pointer',transition:'all 0.15s',whiteSpace:'nowrap',position:'relative'}}
              onMouseEnter={e=>{if(!active)e.currentTarget.style.color='var(--gh-fg-default)'}}
              onMouseLeave={e=>{if(!active)e.currentTarget.style.color='var(--gh-fg-muted)'}}>
              <span>{g.icon}</span>{g.label}
              {hasAlert&&<span style={{width:6,height:6,borderRadius:'50%',background:'var(--gh-danger-fg)',flexShrink:0}}/>}
            </button>
          )
        })}
      </div>

      <div style={{display:'flex',flex:1,minHeight:0}}>
        {/* Sub-nav sidebar (only when group has >1 view) */}
        {activeG&&activeG.views.length>1&&(
          <div style={{width:200,flexShrink:0,background:'var(--gh-canvas-overlay)',borderRight:'1px solid var(--gh-border-muted)',padding:'12px 8px',display:'flex',flexDirection:'column',gap:2}}>
            {activeG.views.map(v=>{
              const active=activeView===v.id
              const showAlert=(v.id==='circular'&&cycles?.length>0)||(v.id==='deadcode'&&deadCode?.length>0)
              return(
                <button key={v.id} onClick={()=>setView(v.id)}
                  style={{display:'flex',alignItems:'center',gap:8,padding:'7px 10px',background:active?'var(--gh-accent-subtle)':'none',border:`1px solid ${active?'var(--gh-accent-muted)':'transparent'}`,borderRadius:6,fontFamily:'var(--sans)',fontSize:13,color:active?'var(--gh-accent-fg)':'var(--gh-fg-muted)',cursor:'pointer',transition:'all 0.15s',textAlign:'left',width:'100%'}}
                  onMouseEnter={e=>{if(!active){e.currentTarget.style.background='var(--gh-canvas-subtle)';e.currentTarget.style.color='var(--gh-fg-default)'}}}
                  onMouseLeave={e=>{if(!active){e.currentTarget.style.background='none';e.currentTarget.style.color='var(--gh-fg-muted)'}}}>
                  <span style={{flex:1}}>{v.label}</span>
                  {showAlert&&<span style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--gh-danger-fg)',background:'var(--gh-danger-subtle)',padding:'0 5px',borderRadius:10}}>
                    {v.id==='circular'?cycles.length:deadCode.length}
                  </span>}
                </button>
              )
            })}
          </div>
        )}

        {/* Content */}
        <div ref={contentRef} style={{flex:1,overflowY:'auto',padding:'24px 28px',minWidth:0}}>
          {activeView==='dashboard' && <DashboardHome data={data} setView={setView}/>}
          {activeView==='tree'       && <FileTree data={data}/>}
          {activeView==='priority'   && <Priority data={data}/>}
          {activeView==='symbols'    && <Symbols data={data}/>}
          {activeView==='search'     && <SymbolSearch data={data}/>}
          {activeView==='graph'      && <Graph data={data}/>}
          {activeView==='sunburst'   && <Sunburst data={data}/>}
          {activeView==='complexity' && <Complexity data={data}/>}
          {activeView==='deadcode'   && <DeadCode data={data}/>}
          {activeView==='circular'   && <CircularDeps data={data}/>}
          {activeView==='bundle'     && <BundleSize data={data}/>}
          {activeView==='git'        && <GitHistory data={data}/>}
          {activeView==='deps'       && <Dependencies data={data}/>}
          {activeView==='insights'   && <Insights data={data}/>}
          {activeView==='chat'       && <AIChat data={data}/>}
        </div>
      </div>
    </div>
  )
}

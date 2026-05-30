import React, { useState } from 'react'

export function PageHeader({ title, subtitle, right }) {
  return (
    <div style={{display:'flex',alignItems:'flex-start',marginBottom:20,gap:16}}>
      <div style={{flex:1}}>
        <h2 style={{fontFamily:'var(--sans)',fontSize:20,fontWeight:600,color:'var(--gh-fg-default)',lineHeight:1.25}}>{title}</h2>
        {subtitle&&<div style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--gh-fg-muted)',marginTop:4,letterSpacing:'0.04em'}}>{subtitle}</div>}
      </div>
      {right&&<div style={{flexShrink:0}}>{right}</div>}
    </div>
  )
}

export function SectionLabel({ children, color='var(--gh-fg-muted)' }) {
  return (
    <div style={{display:'flex',alignItems:'center',gap:8,margin:'20px 0 10px',fontFamily:'var(--mono)',fontSize:10,color,letterSpacing:'0.08em',textTransform:'uppercase'}}>
      <div style={{width:3,height:3,borderRadius:'50%',background:color,flexShrink:0}}/>
      {children}
      <div style={{flex:1,height:1,background:'var(--gh-border-muted)'}}/>
    </div>
  )
}

export function Toggle({ label, value, onChange }) {
  return (
    <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',userSelect:'none'}}>
      <div onClick={onChange} style={{width:32,height:18,borderRadius:9,position:'relative',background:value?'var(--gh-success-emphasis)':'var(--gh-btn-bg)',border:'1px solid var(--gh-border-default)',cursor:'pointer',transition:'background 0.2s'}}>
        <div style={{position:'absolute',top:2,left:value?14:2,width:12,height:12,borderRadius:'50%',background:'#fff',transition:'left 0.2s',boxShadow:'0 1px 2px rgba(0,0,0,0.3)'}}/>
      </div>
      <span style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--gh-fg-muted)'}}>{label}</span>
    </label>
  )
}

export function SearchInput({ value, onChange, placeholder='Search…' }) {
  return (
    <div style={{position:'relative',display:'flex',alignItems:'center'}}>
      <span style={{position:'absolute',left:10,color:'var(--gh-fg-muted)',fontSize:13,pointerEvents:'none'}}>⌕</span>
      <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{background:'var(--gh-canvas-default)',border:'1px solid var(--gh-border-default)',borderRadius:6,padding:'6px 10px 6px 28px',fontFamily:'var(--mono)',fontSize:12,color:'var(--gh-fg-default)',outline:'none',width:220,transition:'border-color 0.15s'}}
        onFocus={e=>e.target.style.borderColor='var(--gh-accent-fg)'}
        onBlur={e=>e.target.style.borderColor='var(--gh-border-default)'}
      />
    </div>
  )
}

export function FilterBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{background:active?'var(--gh-accent-subtle)':'var(--gh-btn-bg)',border:`1px solid ${active?'var(--gh-accent-muted)':'var(--gh-border-default)'}`,borderRadius:6,padding:'5px 12px',fontFamily:'var(--mono)',fontSize:11,cursor:'pointer',color:active?'var(--gh-accent-fg)':'var(--gh-fg-muted)',transition:'all 0.15s'}}>
      {children}
    </button>
  )
}

export function EmptyState({ icon='○', title, sub }) {
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'80px 0',gap:12}}>
      <div style={{fontSize:40,opacity:0.3}}>{icon}</div>
      <div style={{fontFamily:'var(--sans)',fontSize:15,fontWeight:500,color:'var(--gh-fg-default)'}}>{title}</div>
      {sub&&<div style={{fontFamily:'var(--sans)',fontSize:13,color:'var(--gh-fg-muted)',textAlign:'center',maxWidth:400}}>{sub}</div>}
    </div>
  )
}

// GitHub confirm dialog before opening links
export function GhLink({ href, children, style={} }) {
  const [show, setShow] = useState(false)
  const filename = href?.split('/').pop() || ''

  return (
    <>
      <span onClick={e=>{e.stopPropagation();e.preventDefault();setShow(true)}}
        style={{color:'var(--gh-accent-fg)',cursor:'pointer',textDecoration:'none',...style}}>
        {children}
      </span>
      {show&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setShow(false)}>
          <div style={{background:'var(--gh-canvas-overlay)',border:'1px solid var(--gh-border-default)',borderRadius:12,padding:'24px 28px',maxWidth:400,width:'90%',boxShadow:'0 16px 48px rgba(0,0,0,0.6)'}} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:20,marginBottom:12}}>🔗</div>
            <div style={{fontFamily:'var(--sans)',fontSize:15,fontWeight:600,color:'var(--gh-fg-default)',marginBottom:8}}>Open on GitHub?</div>
            <div style={{fontFamily:'var(--mono)',fontSize:12,color:'var(--gh-fg-muted)',marginBottom:20,wordBreak:'break-all',background:'var(--gh-canvas-inset)',padding:'8px 12px',borderRadius:6,border:'1px solid var(--gh-border-muted)'}}>{filename}</div>
            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>{window.open(href,'_blank');setShow(false)}}
                style={{flex:1,background:'var(--gh-btn-primary-bg)',border:'none',borderRadius:6,padding:'8px 16px',fontFamily:'var(--sans)',fontSize:13,fontWeight:600,color:'#fff',cursor:'pointer',transition:'background 0.15s'}}
                onMouseEnter={e=>e.currentTarget.style.background='var(--gh-btn-primary-hover)'}
                onMouseLeave={e=>e.currentTarget.style.background='var(--gh-btn-primary-bg)'}>
                Open on GitHub ↗
              </button>
              <button onClick={()=>setShow(false)}
                style={{flex:1,background:'var(--gh-btn-bg)',border:'1px solid var(--gh-border-default)',borderRadius:6,padding:'8px 16px',fontFamily:'var(--sans)',fontSize:13,color:'var(--gh-fg-default)',cursor:'pointer'}}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export function StatPill({ label, value, color='var(--gh-fg-muted)' }) {
  return (
    <div style={{display:'flex',alignItems:'center',gap:6,padding:'4px 10px',background:'var(--gh-canvas-overlay)',border:'1px solid var(--gh-border-default)',borderRadius:6}}>
      <span style={{fontFamily:'var(--mono)',fontSize:13,fontWeight:600,color}}>{value}</span>
      <span style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--gh-fg-muted)'}}>{label}</span>
    </div>
  )
}

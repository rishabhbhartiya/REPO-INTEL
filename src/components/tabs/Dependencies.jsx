import React, { useState, useMemo } from 'react'
import { PageHeader, SearchInput, FilterBtn } from '../ui.jsx'

const DEP_CAT={'react':'UI','react-dom':'UI','vue':'UI','svelte':'UI','solid-js':'UI','preact':'UI','angular':'UI','next':'Framework','nuxt':'Framework','remix':'Framework','@remix-run/react':'Framework','gatsby':'Framework','@sveltejs/kit':'Framework','astro':'Framework','express':'Server','fastify':'Server','koa':'Server','@nestjs/core':'Server','@nestjs/common':'Server','hono':'Server','elysia':'Server','prisma':'Database','@prisma/client':'Database','typeorm':'Database','sequelize':'Database','mongoose':'Database','drizzle-orm':'Database','knex':'Database','pg':'Database','mysql2':'Database','sqlite3':'Database','redis':'Database','ioredis':'Database','@reduxjs/toolkit':'State','redux':'State','zustand':'State','mobx':'State','recoil':'State','jotai':'State','pinia':'State','react-router':'Routing','react-router-dom':'Routing','vue-router':'Routing','wouter':'Routing','jsonwebtoken':'Auth','passport':'Auth','next-auth':'Auth','lucia':'Auth','bcrypt':'Auth','bcryptjs':'Auth','jest':'Testing','vitest':'Testing','mocha':'Testing','@testing-library/react':'Testing','cypress':'Testing','playwright':'Testing','supertest':'Testing','chai':'Testing','vite':'Build','webpack':'Build','rollup':'Build','esbuild':'Build','typescript':'Build','@babel/core':'Build','tailwindcss':'Styling','styled-components':'Styling','@emotion/react':'Styling','@chakra-ui/react':'Styling','sass':'Styling','postcss':'Styling','autoprefixer':'Styling','axios':'HTTP','got':'HTTP','node-fetch':'HTTP','undici':'HTTP','zod':'Validation','yup':'Validation','joi':'Validation','lodash':'Utility','date-fns':'Utility','dayjs':'Utility','uuid':'Utility','nanoid':'Utility','clsx':'Utility','classnames':'Utility'}
function getCat(name){for(const[k,v]of Object.entries(DEP_CAT)){if(name===k||name.startsWith(k+'/'))return v}return'Other'}

const CAT_COLOR={'UI':'var(--gh-accent-fg)','Framework':'var(--gh-done-fg)','Server':'var(--gh-success-fg)','Database':'var(--gh-sponsors-fg)','State':'var(--gh-done-fg)','Routing':'var(--teal)','Auth':'var(--gh-danger-fg)','Testing':'var(--gh-success-fg)','Build':'var(--gh-attention-fg)','Styling':'var(--gh-sponsors-fg)','HTTP':'var(--gh-accent-fg)','Validation':'var(--gh-attention-fg)','Utility':'var(--gh-fg-muted)','Other':'var(--gh-fg-subtle)'}

export default function Dependencies({data}){
  const {allDeps}=data
  const [search,setSearch]=useState('')
  const [kind,setKind]=useState('all')
  const [group,setGroup]=useState(true)

  const all=useMemo(()=>{
    const e=[]
    Object.entries(allDeps.runtime).forEach(([k,v])=>e.push({name:k,ver:v,kind:'runtime'}))
    Object.entries(allDeps.dev).forEach(([k,v])=>e.push({name:k,ver:v,kind:'dev'}))
    Object.entries(allDeps.peer).forEach(([k,v])=>e.push({name:k,ver:v,kind:'peer'}))
    return e
  },[allDeps])

  const filtered=useMemo(()=>all.filter(d=>(kind==='all'||d.kind===kind)&&(!search||d.name.toLowerCase().includes(search.toLowerCase()))),[all,search,kind])

  const grouped=useMemo(()=>{
    if(!group)return{'':filtered}
    const g={}
    filtered.forEach(d=>{const c=getCat(d.name);if(!g[c])g[c]=[];g[c].push(d)})
    return g
  },[filtered,group])

  const rt=Object.keys(allDeps.runtime).length,dv=Object.keys(allDeps.dev).length,pr=Object.keys(allDeps.peer).length

  if(all.length===0){
    return(
      <div className="fadeUp">
        <PageHeader title="Dependencies" subtitle="Package manifest analysis"/>
        <div style={{textAlign:'center',padding:'80px 0',fontFamily:'var(--mono)',fontSize:13,color:'var(--gh-fg-muted)'}}>
          <div style={{fontSize:36,marginBottom:12,opacity:0.3}}>◆</div>
          No dependency manifest parsed.<br/>
          <span style={{fontSize:11,color:'var(--gh-fg-subtle)'}}>Supports: package.json, requirements.txt, go.mod, Cargo.toml, Gemfile</span>
        </div>
      </div>
    )
  }

  return(
    <div className="fadeUp">
      <PageHeader title="Dependencies" subtitle={`${all.length} packages from manifest · categorised by function`}
        right={<div style={{display:'flex',gap:8,alignItems:'center'}}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search packages…"/>
          {['all','runtime','dev','peer'].map(k=><FilterBtn key={k} active={kind===k} onClick={()=>setKind(k)}>{k.charAt(0).toUpperCase()+k.slice(1)}</FilterBtn>)}
          <button onClick={()=>setGroup(v=>!v)} style={{background:'var(--gh-btn-bg)',border:'1px solid var(--gh-border-default)',borderRadius:5,padding:'5px 10px',fontFamily:'var(--mono)',fontSize:10,cursor:'pointer',color:'var(--gh-fg-muted)'}}>
            {group?'Grouped':'Flat'}
          </button>
        </div>}
      />

      <div style={{display:'flex',gap:8,marginBottom:20}}>
        {[{l:'Total',v:all.length,c:'var(--gh-fg-default)'},{l:'Runtime',v:rt,c:'var(--gh-success-fg)'},{l:'Dev',v:dv,c:'var(--gh-attention-fg)'},{l:'Peer',v:pr,c:'var(--gh-done-fg)'}].map(s=>(
          <div key={s.l} style={{background:'var(--gh-canvas-overlay)',border:'1px solid var(--gh-border-muted)',borderRadius:8,padding:'10px 16px',textAlign:'center',minWidth:80}}>
            <div style={{fontFamily:'var(--mono)',fontSize:22,fontWeight:700,color:s.c,lineHeight:1}}>{s.v}</div>
            <div style={{fontFamily:'var(--sans)',fontSize:11,color:'var(--gh-fg-muted)',marginTop:4}}>{s.l}</div>
          </div>
        ))}
      </div>

      {Object.entries(grouped).map(([cat,deps])=>(
        <div key={cat}>
          {cat&&(
            <div style={{display:'flex',alignItems:'center',gap:8,margin:'16px 0 10px',fontFamily:'var(--mono)',fontSize:10,color:CAT_COLOR[cat]||'var(--gh-fg-muted)',letterSpacing:'0.08em',textTransform:'uppercase'}}>
              <div style={{width:6,height:6,borderRadius:'50%',background:CAT_COLOR[cat]||'var(--gh-fg-muted)'}}/>
              {cat}<div style={{flex:1,height:1,background:'var(--gh-border-muted)'}}/><span style={{color:'var(--gh-fg-subtle)'}}>{deps.length}</span>
            </div>
          )}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:7}}>
            {deps.map((d,i)=>{
              const cc=CAT_COLOR[getCat(d.name)]||'var(--gh-fg-subtle)'
              return(
                <div key={d.name} style={{background:'var(--gh-canvas-overlay)',border:'1px solid var(--gh-border-muted)',borderRadius:7,padding:'11px 13px',animation:`fadeUp 0.2s ease ${i*10}ms both`,transition:'border-color 0.15s'}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor='var(--gh-border-default)'}
                  onMouseLeave={e=>e.currentTarget.style.borderColor='var(--gh-border-muted)'}>
                  <div style={{display:'flex',gap:7,marginBottom:7}}>
                    <div style={{width:4,height:4,borderRadius:'50%',background:cc,flexShrink:0,marginTop:5}}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--gh-fg-default)',fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{d.name}</div>
                      <div style={{fontFamily:'var(--mono)',fontSize:9,color:'var(--gh-fg-muted)',marginTop:2}}>{d.ver}</div>
                    </div>
                  </div>
                  <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                    <span style={{fontFamily:'var(--mono)',fontSize:8,padding:'1px 5px',borderRadius:20,background:d.kind==='runtime'?'var(--gh-success-subtle)':d.kind==='dev'?'var(--gh-attention-subtle)':'var(--gh-done-subtle)',color:d.kind==='runtime'?'var(--gh-success-fg)':d.kind==='dev'?'var(--gh-attention-fg)':'var(--gh-done-fg)',border:`1px solid ${d.kind==='runtime'?'var(--gh-success-muted)':d.kind==='dev'?'var(--gh-attention-muted)':'var(--gh-done-muted)'}`}}>{d.kind}</span>
                    {getCat(d.name)!=='Other'&&<span style={{fontFamily:'var(--mono)',fontSize:8,padding:'1px 5px',borderRadius:20,color:cc,background:'var(--gh-neutral-subtle)',border:'1px solid var(--gh-border-muted)'}}>{getCat(d.name)}</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

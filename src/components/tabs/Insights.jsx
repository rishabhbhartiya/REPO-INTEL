import React from 'react'
import { PageHeader } from '../ui.jsx'

function Card({icon,title,body,sev='info',delay=0}){
  const C={info:{l:'var(--gh-accent-fg)',bg:'var(--gh-accent-subtle)',br:'var(--gh-accent-muted)'},good:{l:'var(--gh-success-fg)',bg:'var(--gh-success-subtle)',br:'var(--gh-success-muted)'},warn:{l:'var(--gh-attention-fg)',bg:'var(--gh-attention-subtle)',br:'var(--gh-attention-muted)'},alert:{l:'var(--gh-danger-fg)',bg:'var(--gh-danger-subtle)',br:'var(--gh-danger-muted)'},purple:{l:'var(--gh-done-fg)',bg:'var(--gh-done-subtle)',br:'var(--gh-done-muted)'}}
  const c=C[sev]||C.info
  return(
    <div style={{background:'var(--gh-canvas-overlay)',borderLeft:`3px solid ${c.l}`,borderRight:'1px solid var(--gh-border-muted)',borderTop:'1px solid var(--gh-border-muted)',borderBottom:'1px solid var(--gh-border-muted)',borderRadius:'0 8px 8px 0',padding:'14px 18px',marginBottom:7,display:'flex',gap:14,alignItems:'flex-start',animation:`fadeUp 0.3s ease ${delay}ms both`}}>
      <span style={{fontSize:18,flexShrink:0,lineHeight:1.3}}>{icon}</span>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontFamily:'var(--sans)',fontSize:13,fontWeight:600,color:c.l,marginBottom:5}}>{title}</div>
        <div style={{fontFamily:'var(--sans)',fontSize:13,color:'var(--gh-fg-default)',lineHeight:1.7}} dangerouslySetInnerHTML={{__html:body}}/>
      </div>
    </div>
  )
}

function Sec({title,color='var(--gh-fg-muted)'}){
  return(
    <div style={{display:'flex',alignItems:'center',gap:8,margin:'24px 0 12px',fontFamily:'var(--mono)',fontSize:10,color,letterSpacing:'0.08em',textTransform:'uppercase'}}>
      <div style={{width:4,height:4,borderRadius:'50%',background:color}}/>
      {title}<div style={{flex:1,height:1,background:'var(--gh-border-muted)'}}/>
    </div>
  )
}

function code(s){return`<code style="font-family:var(--mono);font-size:11px;color:var(--gh-accent-fg);background:var(--gh-accent-subtle);border:1px solid var(--gh-accent-muted);padding:1px 5px;border-radius:3px">${s}</code>`}

export default function Insights({data}){
  const {classified,allDeps,langMap,owner,repo,branch,meta,cycles,deadCode,deployUrl}=data
  const rt=allDeps.runtime,dev=allDeps.dev
  const byRole=r=>classified.filter(f=>f.role===r)
  const engines=byRole('engine'),tests=byRole('test'),components=byRole('component')
  const services=byRole('service'),routes=byRole('route'),models=byRole('model')
  const stateFiles=byRole('state'),dockerFiles=byRole('docker'),ciFiles=byRole('ci'),infraFiles=byRole('infra'),typeFiles=byRole('types')
  const topDirs=new Set(classified.map(f=>f.path.split('/')[0]))
  const arch=[],fw=[],quality=[],recs=[]

  // Deployment
  if(deployUrl) arch.push({icon:'🚀',title:'Deployed Application',body:`Live at: <a href="${deployUrl}" target="_blank" style="color:var(--gh-accent-fg)">${deployUrl} ↗</a>`,sev:'good'})

  // Entry points
  if(!engines.length) arch.push({icon:'⚠️',title:'No Entry Point Detected',body:'No conventional entry file found (main.*, index.*, app.*). The app may use a non-standard entry.',sev:'warn'})
  else arch.push({icon:'◆',title:`${engines.length} Entry Point${engines.length>1?'s':''}`,body:engines.map(f=>code(f.path)).join('  ')+'<br><span style="color:var(--gh-fg-muted)">Start reading here to trace execution flow.</span>',sev:'good'})

  // Architecture pattern
  if(routes.length>0&&services.length>0&&models.length>0) arch.push({icon:'⬡',title:'MVC / Layered Architecture',body:`Detected ${routes.length} route${routes.length>1?'s':''}, ${services.length} service${services.length>1?'s':''}, ${models.length} model${models.length>1?'s':''}. Classic layered pattern: Routes → Services → Models.`,sev:'info'})
  else if(components.length>5&&stateFiles.length>0) arch.push({icon:'⬡',title:'Component + State Architecture',body:`${components.length} UI components with ${stateFiles.length} state management file${stateFiles.length>1?'s':''}. Modern SPA pattern.`,sev:'info'})

  if(['packages','apps','libs','modules'].some(d=>topDirs.has(d))) arch.push({icon:'⊞',title:'Monorepo Structure',body:`Root folders suggest a monorepo. Check ${code('packages/')}, ${code('apps/')}, or ${code('libs/')} for sub-projects.`,sev:'purple'})
  if(cycles?.length>0) arch.push({icon:'🔄',title:`${cycles.length} Circular Dep${cycles.length>1?'s':''}`,body:`Import cycles detected. Check the Circular Deps view. These can cause initialisation bugs.`,sev:'alert'})
  if(deadCode?.length>0) arch.push({icon:'💀',title:`${deadCode.length} Dead Code Signal${deadCode.length>1?'s':''}`,body:`${deadCode.length} file${deadCode.length>1?'s':''} have zero inbound imports and no content references. Check Dead Code view.`,sev:'warn'})

  // Frameworks
  const FW=[
    [rt.react||rt['react-dom'],'React','⚛',`Component-based UI. Entry typically ${code('src/main.jsx')} or ${code('src/index.tsx')}.`,'good'],
    [rt.next,'Next.js','▲',`File-system routing in ${code('pages/')} or ${code('app/')}.`,'good'],
    [rt.vue,'Vue.js','💚',`SFCs (.vue). Entry typically ${code('src/main.js')}.`,'good'],
    [rt.svelte||dev['@sveltejs/kit'],'Svelte / SvelteKit','🔥',`File-based routing under ${code('src/routes/')}.`,'good'],
    [rt.astro||dev.astro,'Astro','🚀',`Static-site + islands. Pages in ${code('src/pages/')}.`,'good'],
    [rt.express,'Express.js','⚡',`Minimal Node server. Look for ${code('app.use()')} and ${code('router.get/post()')}.`,'info'],
    [rt.fastify,'Fastify','⚡',`High-perf Node server. Look for ${code('fastify.register()')}.`,'info'],
    [rt['@nestjs/core']||rt['@nestjs/common'],'NestJS','🐈',`Opinionated framework with decorators. Start from ${code('AppModule')}.`,'info'],
    [rt.fastapi,'FastAPI','⚡',`Python async API. Routes via ${code('@app.get()')}.`,'info'],
    [rt.django,'Django','🐍',`Batteries-included Python. Check ${code('urls.py')} + ${code('views.py')}.`,'info'],
    [rt.flask,'Flask','🌶',`Lightweight Python. Routes via ${code('@app.route()')}.`,'info'],
    [rt['@reduxjs/toolkit']||rt.redux,'Redux Toolkit','◉',`Global state via ${code('createSlice')} and ${code('configureStore')}.`,'purple'],
    [rt.zustand,'Zustand','◉',`Minimal state. Stores defined with ${code('create()')}.`,'purple'],
    [rt.prisma||rt['@prisma/client'],'Prisma ORM','🗄',`Check ${code('prisma/schema.prisma')} for the data model.`,'info'],
    [rt.mongoose,'Mongoose','🗄',`MongoDB ODM. Schemas with ${code('new Schema()')}.`,'info'],
  ]
  FW.forEach(([det,name,icon,body,sev])=>{ if(det) fw.push({icon,title:`Framework: ${name}`,body,sev}) })

  // Quality
  const testRatio=classified.length>0?tests.length/classified.length:0
  if(!tests.length) quality.push({icon:'⚠️',title:'No Test Files',body:'No test/spec files found. Consider Jest/Vitest (JS), pytest (Python), or go test (Go).',sev:'alert'})
  else if(testRatio<0.05) quality.push({icon:'⚠️',title:'Low Test Coverage Signal',body:`Only ${tests.length} test file${tests.length>1?'s':''} for ${classified.length} total files (~${Math.round(testRatio*100)}%).`,sev:'warn'})
  else quality.push({icon:'✓',title:`${tests.length} Test Files`,body:`~${Math.round(testRatio*100)}% of files are tests. Good hygiene.`,sev:'good'})

  if(langMap['TypeScript']||langMap['TypeScript/React']){
    const n=(langMap['TypeScript']||0)+(langMap['TypeScript/React']||0)
    quality.push({icon:'🔷',title:'TypeScript',body:`${n} TypeScript files. ${typeFiles.length>0?'Types in '+typeFiles.slice(0,3).map(f=>code(f.path.split('/').pop())).join(', '):'Types distributed across files.'} Check ${code('tsconfig.json')}.`,sev:'good'})
  }
  if(dockerFiles.length>0) quality.push({icon:'🐳',title:'Docker',body:`${dockerFiles.length} Docker file${dockerFiles.length>1?'s':''}: ${dockerFiles.slice(0,3).map(f=>code(f.path.split('/').pop())).join(' ')}`,sev:'good'})
  if(ciFiles.length>0) quality.push({icon:'↻',title:'CI/CD Configured',body:`${ciFiles.length} pipeline file${ciFiles.length>1?'s':''}. Automated build and deploy set up.`,sev:'good'})
  if(infraFiles.length>0) quality.push({icon:'🏗',title:'Infrastructure as Code',body:`${infraFiles.length} IaC file${infraFiles.length>1?'s':''}. Cloud infrastructure managed programmatically.`,sev:'info'})

  // Recommendations
  const readOrder=[
    engines.length>0?`<strong style="color:var(--gh-fg-default)">1. Entry:</strong> ${engines.slice(0,2).map(f=>code(f.path)).join(', ')}`:null,
    routes.length>0?`<strong style="color:var(--gh-fg-default)">2. Routes:</strong> ${routes.slice(0,2).map(f=>code(f.path.split('/').pop())).join(', ')}`:null,
    services.length>0?`<strong style="color:var(--gh-fg-default)">3. Services:</strong> ${services.slice(0,2).map(f=>code(f.path.split('/').pop())).join(', ')}`:null,
    models.length>0?`<strong style="color:var(--gh-fg-default)">4. Models:</strong> ${models.slice(0,2).map(f=>code(f.path.split('/').pop())).join(', ')}`:null,
  ].filter(Boolean)
  if(readOrder.length>0) recs.push({icon:'→',title:'Suggested Reading Order',body:readOrder.join('<br>'),sev:'info'})
  recs.push({icon:'🔗',title:'GitHub Repository',body:`<a href="https://github.com/${owner}/${repo}" target="_blank" style="color:var(--gh-accent-fg)">github.com/${owner}/${repo} ↗</a><br>Branch: ${code(branch)} · Stars: ${code((meta?.stargazers_count||0).toLocaleString())} · Language: ${code(meta?.language||'?')}${deployUrl?`<br>Live: <a href="${deployUrl}" target="_blank" style="color:var(--gh-success-fg)">${deployUrl} ↗</a>`:''}`,sev:'info'})

  return(
    <div className="fadeUp">
      <PageHeader title="Insights" subtitle="Automated architecture and code quality analysis"/>
      <Sec title="Architecture"/>
      {arch.map((ins,i)=><Card key={i} {...ins} delay={i*30}/>)}
      {fw.length>0&&<><Sec title="Framework & Library Detection" color="var(--gh-done-fg)"/>{fw.map((ins,i)=><Card key={i} {...ins} delay={i*30}/>)}</>}
      <Sec title="Code Quality Signals" color="var(--gh-success-fg)"/>
      {quality.map((ins,i)=><Card key={i} {...ins} delay={i*30}/>)}
      <Sec title="Recommendations" color="var(--gh-attention-fg)"/>
      {recs.map((ins,i)=><Card key={i} {...ins} delay={i*30}/>)}
    </div>
  )
}

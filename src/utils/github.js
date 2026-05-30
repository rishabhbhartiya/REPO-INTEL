const GH = 'https://api.github.com'
export async function ghFetch(url) {
  const headers = { Accept: 'application/vnd.github.v3+json' }
  if (import.meta.env.VITE_GITHUB_TOKEN) {
    headers.Authorization = `token ${import.meta.env.VITE_GITHUB_TOKEN}`
  }
  const r = await fetch(url, { headers })
  if (!r.ok) throw new Error(`GitHub ${r.status}: ${url.split('?')[0].split('/').slice(-3).join('/')}`)
  return r.json()
}
export const getRepoMeta    = (o,r)     => ghFetch(`${GH}/repos/${o}/${r}`)
export const getTree        = (o,r,b)   => ghFetch(`${GH}/repos/${o}/${r}/git/trees/${b}?recursive=1`)
export const getCommits     = (o,r,p,b) => ghFetch(`${GH}/repos/${o}/${r}/commits?path=${encodeURIComponent(p)}&sha=${b}&per_page=10`)
export const getContent     = async (o,r,path,b) => {
  try {
    const d = await ghFetch(`${GH}/repos/${o}/${r}/contents/${encodeURIComponent(path)}?ref=${b}`)
    if (d.encoding==='base64') return atob(d.content.replace(/\n/g,''))
    return null
  } catch { return null }
}

export const EXT_LANG = {
  js:'JavaScript',jsx:'JavaScript/React',mjs:'JavaScript',cjs:'JavaScript',
  ts:'TypeScript',tsx:'TypeScript/React',
  py:'Python',pyw:'Python',java:'Java',kt:'Kotlin',kts:'Kotlin',
  go:'Go',rs:'Rust',rb:'Ruby',php:'PHP',cs:'C#',fs:'F#',
  cpp:'C++',cc:'C++',c:'C',h:'C/C++ Header',hpp:'C++ Header',
  swift:'Swift',m:'Objective-C',vue:'Vue',svelte:'Svelte',astro:'Astro',
  dart:'Dart',scala:'Scala',ex:'Elixir',exs:'Elixir',r:'R',lua:'Lua',hs:'Haskell',
  html:'HTML',htm:'HTML',css:'CSS',scss:'SCSS',sass:'SASS',less:'LESS',
  json:'JSON',yaml:'YAML',yml:'YAML',toml:'TOML',xml:'XML',ini:'INI',
  md:'Markdown',mdx:'MDX',rst:'reStructuredText',
  sh:'Shell',bash:'Bash',zsh:'Zsh',bat:'Batch',ps1:'PowerShell',
  sql:'SQL',graphql:'GraphQL',gql:'GraphQL',proto:'Protobuf',
  tf:'Terraform',hcl:'HCL',lock:'Lockfile',sum:'Checksum',
}
export function getExt(filename) { const p=filename.split('.'); return p.length>1?p.pop().toLowerCase():'' }
export function getLang(filepath) {
  const name=filepath.split('/').pop()
  if(/^dockerfile$/i.test(name))return'Docker'
  if(/^makefile$/i.test(name))return'Makefile'
  if(/^rakefile$/i.test(name))return'Ruby'
  return EXT_LANG[getExt(name)]||null
}

export const NOISE_ROLES = new Set(['noise','lockfile','asset-image','asset-svg','asset-media','asset-font','asset-doc'])
const MANIFEST_NAMES = new Set(['package.json','package-lock.json','yarn.lock','pnpm-lock.yaml','bun.lockb','requirements.txt','pipfile','pipfile.lock','pyproject.toml','poetry.lock','go.mod','go.sum','cargo.toml','cargo.lock','pom.xml','build.gradle','build.gradle.kts','gemfile','gemfile.lock','composer.json','composer.lock','pubspec.yaml','pubspec.lock','mix.exs','mix.lock'])

export function classifyFile(filepath) {
  const name=filepath.split('/').pop().toLowerCase(), parts=filepath.toLowerCase().split('/'), ext=getExt(name)
  if(/\.(png|jpe?g|gif|webp|ico|bmp|tiff?|avif)$/i.test(name))return'asset-image'
  if(/\.svg$/i.test(name))return'asset-svg'
  if(/\.(mp4|mp3|wav|ogg|flac|webm|avi|mov)$/i.test(name))return'asset-media'
  if(/\.(ttf|woff2?|eot|otf)$/i.test(name))return'asset-font'
  if(/\.(pdf|docx?|xlsx?|pptx?)$/i.test(name))return'asset-doc'
  const noiseNames=new Set(['readme.md','readme.txt','readme','license','license.md','license.txt','contributing.md','changelog.md','changelog','history.md','authors.md','code_of_conduct.md','security.md','.gitignore','.gitattributes','.editorconfig','.npmignore','.dockerignore','thumbs.db','.ds_store'])
  if(noiseNames.has(name))return'noise'
  if(MANIFEST_NAMES.has(name))return name.endsWith('.lock')||name==='go.sum'||name==='package-lock.json'||name==='yarn.lock'||name==='bun.lockb'||name==='pnpm-lock.yaml'?'lockfile':'manifest'
  const testPath=parts.some(p=>['__tests__','tests','test','spec','specs','e2e','cypress','vitest','fixtures','mocks','__mocks__'].includes(p))
  const testFile=/\.(test|spec)\.(js|jsx|ts|tsx|py|rb|go|java|rs|php|cs)$/i.test(name)||/^test_.*\.py$/.test(name)||/^.*_test\.(go|py|rb)$/.test(name)
  if(testPath||testFile)return'test'
  if(/\.stor(y|ies)\.(js|jsx|ts|tsx|mdx)$/i.test(name))return'story'
  if(/\.(d\.ts)$/i.test(name)||name==='types.ts'||name==='types.js'||/^(types?|interfaces?)\.ts$/.test(name))return'types'
  const ciPath=parts.some(p=>['.github','workflows','.gitlab','.circleci','.travis','jenkins'].includes(p))
  if(ciPath)return'ci'
  if(/^(dockerfile|docker-compose)/i.test(name)||(parts.includes('docker')&&ext!=='md'))return'docker'
  if(/\.(tf|tfvars)$/i.test(name)||parts.some(p=>['terraform','infra','infrastructure'].includes(p)))return'infra'
  const isConfig=/\.(config\.|rc$|rc\.)/.test(name)||/^(tsconfig|jsconfig|babel\.config|jest\.config|vite\.config|webpack\.config|rollup\.config|next\.config|nuxt\.config|svelte\.config|tailwind\.config|postcss\.config|eslint|prettier|stylelint|\.env)/i.test(name)||(['json','toml','ini','cfg','conf'].includes(ext)&&!/index|package/.test(name))
  if(isConfig)return'config'
  const isEntry=/^(main|index|app|server|start|run|init|bootstrap|entry|program)\.(js|jsx|ts|tsx|py|go|java|rb|php|cs|rs|swift|dart)$/i.test(name)||name==='__main__.py'||name==='main.go'||name==='main.rs'
  if(isEntry)return'engine'
  if(parts.some(p=>['routes','routing','router','pages','views','controllers','handlers','endpoints'].includes(p))||/\.(routes?|router|controller|handler|endpoint)\.(js|jsx|ts|tsx|py|rb|go|java|php|cs)$/i.test(name))return'route'
  const isUiPath=parts.some(p=>['components','component','ui','widgets','atoms','molecules','organisms','templates','layouts','screens'].includes(p))
  const isUiFile=['jsx','tsx','vue','svelte','astro'].includes(ext)&&!isEntry
  if(isUiPath||isUiFile)return'component'
  if(parts.some(p=>['store','stores','state','redux','context','contexts','zustand','mobx','recoil','atoms','slices'].includes(p))||/\.(store|slice|atom|reducer|actions?|mutations?|selectors?)\.(js|ts|jsx|tsx)$/i.test(name))return'state'
  if(/^use[A-Z]/.test(filepath.split('/').pop().replace(/\.[^.]+$/,''))||parts.includes('hooks'))return'hook'
  if(parts.some(p=>['middleware','middlewares','interceptors','guards','pipes','filters'].includes(p))||/\.(middleware|guard|interceptor|pipe|filter)\.(js|ts|go|py|rb|java|cs)$/i.test(name))return'middleware'
  if(parts.some(p=>['models','model','schema','schemas','entities','entity','db','database','migrations','seeders'].includes(p))||/\.(model|schema|entity|migration|seeder)\.(js|ts|py|rb|go|java|php|cs)$/i.test(name))return'model'
  if(parts.some(p=>['services','service','business','domain','usecases','lib','library'].includes(p))||/\.(service|provider|repository|repo)\.(js|ts|py|rb|go|java|php|cs)$/i.test(name))return'service'
  if(parts.some(p=>['utils','util','helpers','helper','common','shared','tools','support'].includes(p))||/\.(utils?|helpers?|common)\.(js|ts|py|rb|go|java|php|cs)$/i.test(name))return'util'
  if(['css','scss','sass','less'].includes(ext))return'style'
  if(['sh','bash','zsh','bat','ps1'].includes(ext)||parts.some(p=>['scripts','bin','cli'].includes(p)))return'script'
  if(['md','mdx','rst','txt'].includes(ext))return'doc'
  return'misc'
}

export const BADGE = {
  engine:    {label:'ENGINE',    color:'green'},
  route:     {label:'ROUTE',     color:'cyan'},
  component: {label:'COMPONENT', color:'blue'},
  hook:      {label:'HOOK',      color:'teal'},
  state:     {label:'STATE',     color:'violet'},
  service:   {label:'SERVICE',   color:'amber'},
  model:     {label:'MODEL',     color:'pink'},
  middleware:{label:'MIDDLEWARE',color:'rose'},
  util:      {label:'UTIL',      color:'lime'},
  types:     {label:'TYPES',     color:'cyan'},
  config:    {label:'CONFIG',    color:'amber'},
  test:      {label:'TEST',      color:'green'},
  story:     {label:'STORY',     color:'pink'},
  manifest:  {label:'MANIFEST',  color:'orange'},
  lockfile:  {label:'LOCKFILE',  color:'neutral'},
  ci:        {label:'CI/CD',     color:'teal'},
  docker:    {label:'DOCKER',    color:'blue'},
  infra:     {label:'INFRA',     color:'rose'},
  style:     {label:'STYLE',     color:'pink'},
  script:    {label:'SCRIPT',    color:'lime'},
  doc:       {label:'DOC',       color:'neutral'},
  noise:     {label:'META',      color:'neutral'},
  'asset-image':{label:'IMAGE',  color:'neutral'},
  'asset-svg':  {label:'SVG',    color:'neutral'},
  'asset-media':{label:'MEDIA',  color:'neutral'},
  'asset-font': {label:'FONT',   color:'neutral'},
  'asset-doc':  {label:'DOC',    color:'neutral'},
  misc:      {label:'FILE',      color:'neutral'},
}

export function extractSymbols(content, filepath) {
  if(!content)return{imports:[],exports:[]}
  const ext=getExt(filepath), imports=[], exports=[]
  if(['js','jsx','ts','tsx','mjs','cjs'].includes(ext)){
    let m
    const r1=/import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g
    while((m=r1.exec(content))!==null)m[1].split(',').forEach(s=>{const[orig,alias]=s.trim().split(/\s+as\s+/).map(x=>x.trim());if(orig)imports.push({name:alias||orig,original:orig,source:m[2],type:'named'})})
    const r2=/import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g
    while((m=r2.exec(content))!==null)imports.push({name:m[1],source:m[2],type:'default'})
    const r3=/import\s+\*\s+as\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g
    while((m=r3.exec(content))!==null)imports.push({name:m[1],source:m[2],type:'namespace'})
    const r4=/(?:const|let|var)\s+\{?([^}=\n]+)\}?\s*=\s*require\s*\(\s*['"]([^'"]+)['"]\s*\)/g
    while((m=r4.exec(content))!==null)m[1].split(',').forEach(s=>{const n=s.trim();if(n)imports.push({name:n,source:m[2],type:'require'})})
    const r5=/export\s+(?:default\s+)?(?:async\s+)?(?:function\s*\*?\s*|class\s+|const\s+|let\s+|var\s+)(\w+)/g
    while((m=r5.exec(content))!==null)exports.push({name:m[1],type:m[0].includes('default')?'default':'named'})
    const r6=/export\s+\{([^}]+)\}/g
    while((m=r6.exec(content))!==null)m[1].split(',').forEach(s=>{const n=(s.trim().split(/\s+as\s+/)[1]||s.trim().split(/\s+as\s+/)[0]).trim();if(n)exports.push({name:n,type:'named'})})
  }
  if(ext==='py'){
    let m
    const r1=/^from\s+([\w.]+)\s+import\s+(.+)$/gm
    while((m=r1.exec(content))!==null)m[2].split(',').forEach(s=>{const[orig,alias]=s.trim().split(/\s+as\s+/);const n=(alias||orig).trim().replace(/[()]/g,'');if(n&&n!=='*')imports.push({name:n,source:m[1],type:'from'})})
    const r2=/^import\s+([\w.,\s]+)$/gm
    while((m=r2.exec(content))!==null)m[1].split(',').forEach(s=>{const n=(s.trim().split(/\s+as\s+/)[1]||s.trim().split(/\s+as\s+/)[0]).trim();if(n)imports.push({name:n,source:n,type:'import'})})
    const r3=/^(?:async\s+)?def\s+(\w+)/gm
    while((m=r3.exec(content))!==null)exports.push({name:m[1],type:'function'})
    const r4=/^class\s+(\w+)/gm
    while((m=r4.exec(content))!==null)exports.push({name:m[1],type:'class'})
  }
  if(ext==='go'){
    let m
    const r1=/import\s+\(([^)]+)\)/g
    while((m=r1.exec(content))!==null){const r2=/(?:(\w+)\s+)?"([^"]+)"/g;let m2;while((m2=r2.exec(m[1]))!==null)imports.push({name:m2[1]||m2[2].split('/').pop(),source:m2[2],type:'import'})}
    const r3=/^func\s+(?:\([^)]+\)\s+)?([A-Z]\w*)/gm
    while((m=r3.exec(content))!==null)exports.push({name:m[1],type:'function'})
    const r4=/^type\s+([A-Z]\w*)\s+(?:struct|interface)/gm
    while((m=r4.exec(content))!==null)exports.push({name:m[1],type:'type'})
  }
  if(['java','kt'].includes(ext)){
    let m
    const r1=/^import\s+([\w.]+)/gm
    while((m=r1.exec(content))!==null)imports.push({name:m[1].split('.').pop(),source:m[1],type:'import'})
    const r2=/(?:public\s+)?(?:abstract\s+)?(?:class|interface|enum|object|data class)\s+(\w+)/g
    while((m=r2.exec(content))!==null)exports.push({name:m[1],type:'class'})
  }
  if(ext==='rs'){
    let m
    const r1=/^use\s+([\w:]+)(?:::\{([^}]+)\})?;$/gm
    while((m=r1.exec(content))!==null){if(m[2])m[2].split(',').forEach(s=>imports.push({name:s.trim(),source:m[1],type:'use'}));else imports.push({name:m[1].split('::').pop(),source:m[1],type:'use'})}
    const r2=/^pub\s+(?:async\s+)?(?:fn|struct|enum|trait|mod)\s+(\w+)/gm
    while((m=r2.exec(content))!==null)exports.push({name:m[1],type:'pub'})
  }
  return{imports:imports.slice(0,80),exports:exports.slice(0,100)}
}

export function parseDeps(content, filename) {
  const name=filename.split('/').pop().toLowerCase(), r={runtime:{},dev:{},peer:{}}
  try{
    if(name==='package.json'){const j=JSON.parse(content);Object.entries(j.dependencies||{}).forEach(([k,v])=>r.runtime[k]=v);Object.entries(j.devDependencies||{}).forEach(([k,v])=>r.dev[k]=v);Object.entries(j.peerDependencies||{}).forEach(([k,v])=>r.peer[k]=v)}
    else if(name==='requirements.txt'){content.split('\n').forEach(l=>{l=l.trim();if(!l||l.startsWith('#')||l.startsWith('-'))return;const m=l.match(/^([A-Za-z0-9_\-\[\].]+)\s*([><=!~^].+)?$/);if(m)r.runtime[m[1]]=m[2]?.trim()||'*'})}
    else if(name==='go.mod'){content.split('\n').forEach(l=>{const m=l.trim().match(/^([\w.\-/]+)\s+(v[\d.]+[-\w]*)/);if(m)r.runtime[m[1]]=m[2]})}
    else if(name==='cargo.toml'){let sec='';content.split('\n').forEach(l=>{if(l.match(/^\[(dependencies|dev-dependencies)/)){sec=l.includes('dev')?'dev':'runtime';return}if(l.startsWith('['))sec='';if(sec){const m=l.match(/^([\w\-]+)\s*=\s*"([^"]+)"/)??l.match(/^([\w\-]+)\s*=\s*\{[^}]*version\s*=\s*"([^"]+)"/);if(m)r[sec][m[1]]=m[2]}})}
    else if(name==='gemfile'){content.split('\n').forEach(l=>{const m=l.trim().match(/^gem\s+['"]([^'"]+)['"],?\s*['"]?([^'"#\s,)]+)?/);if(m)r.runtime[m[1]]=m[2]||'*'})}
  }catch{}
  return r
}

const ROLE_SCORE={engine:100,route:80,service:70,state:65,model:60,component:55,middleware:55,hook:50,util:40,types:35,config:25,manifest:20,ci:15,docker:15,infra:15,test:10,story:8,style:6,script:12,doc:3,lockfile:1,noise:0,misc:5}
export function scoreFile(file,importedByCount){
  let s=ROLE_SCORE[file.role]||0
  s+=(importedByCount||0)*8
  s+=(file.exports?.length||0)*2
  s+=(file.imports?.length||0)*0.5
  s-=((file.path.match(/\//g)||[]).length)*1.5
  return Math.max(0,s)
}

export function buildTree(files){
  const root={name:'',path:'',type:'dir',children:{},file:null}
  files.forEach(file=>{
    const parts=file.path.split('/')
    let node=root
    for(let i=0;i<parts.length-1;i++){
      const p=parts[i]
      if(!node.children[p])node.children[p]={name:p,path:parts.slice(0,i+1).join('/'),type:'dir',children:{},file:null}
      node=node.children[p]
    }
    const leaf=parts[parts.length-1]
    node.children[leaf]={name:leaf,path:file.path,type:'file',children:{},file}
  })
  return root
}

export function detectCircularDeps(files){
  const adj={},pathIndex={}
  files.forEach(f=>{pathIndex[f.path]=f;adj[f.path]=[]})
  files.forEach(src=>{
    src.imports.forEach(imp=>{
      if(!imp.source.startsWith('.')&&!imp.source.startsWith('/'))return
      const impBase=imp.source.split('/').pop().replace(/\.[^.]+$/,'').toLowerCase()
      files.forEach(tgt=>{
        if(tgt.path===src.path)return
        const tgtBase=tgt.path.split('/').pop().replace(/\.[^.]+$/,'').toLowerCase()
        if(tgtBase===impBase&&!adj[src.path].includes(tgt.path))adj[src.path].push(tgt.path)
      })
    })
  })
  const cycles=[],visited=new Set(),inStack=new Set()
  function dfs(node,path){
    if(inStack.has(node)){const ci=path.indexOf(node);if(ci!==-1)cycles.push([...path.slice(ci),node]);return}
    if(visited.has(node))return
    visited.add(node);inStack.add(node);path.push(node)
    for(const next of(adj[node]||[]))dfs(next,path)
    path.pop();inStack.delete(node)
  }
  Object.keys(adj).forEach(n=>dfs(n,[]))
  const seen=new Set()
  const unique=cycles.filter(c=>{const k=[...c].sort().join('|');if(seen.has(k))return false;seen.add(k);return true})
  return{adj,cycles:unique.slice(0,20)}
}

export function complexityScore(file){
  const exps=file.exports?.length||0,imps=file.imports?.length||0
  const depth=(file.path.match(/\//g)||[]).length,importedBy=file.importedBy?.length||0
  const raw=(exps*4)+(imps*2)+(importedBy*6)-(depth*1)
  return Math.min(100,Math.max(0,Math.round(raw)))
}

// Enhanced dead code — checks imports AND content references
export function detectDeadCode(files){
  // Build a set of all names referenced in content across files
  const allContentRefs=new Set()
  files.forEach(f=>{
    if(!f.content)return
    // collect all identifiers referenced in other files' content
    f.exports.forEach(exp=>allContentRefs.add(exp.name))
  })
  // For each file, check if any of its exports appear in other files' content
  return files.filter(f=>{
    if(NOISE_ROLES.has(f.role))return false
    if(['engine','manifest','config','ci','docker','infra','lockfile','noise','test','script'].includes(f.role))return false
    if(['md','mdx','rst','txt','json','yaml','yml','toml','css','scss','sass','less'].includes(getExt(f.path)))return false
    // Check 1: no inbound imports
    if(f.importedBy.length>0)return false
    // Check 2: if file has exports, check if any export name appears in any other file's content
    if(f.exports.length>0){
      const usedInContent=files.some(other=>{
        if(other.path===f.path||!other.content)return false
        return f.exports.some(exp=>{
          const re=new RegExp(`\\b${exp.name}\\b`)
          return re.test(other.content)
        })
      })
      if(usedInContent)return false
    }
    return true
  })
}

export function estimateBundleSize(files,adj){
  const engines=files.filter(f=>f.role==='engine'),result={},pathIndex={}
  files.forEach(f=>{pathIndex[f.path]=f})
  engines.forEach(entry=>{
    const visited=new Set(),queue=[entry.path]
    let totalSize=0
    while(queue.length){const cur=queue.shift();if(visited.has(cur))continue;visited.add(cur);const f=pathIndex[cur];if(f)totalSize+=f.size||0;(adj[cur]||[]).forEach(next=>{if(!visited.has(next))queue.push(next)})}
    result[entry.path]={size:totalSize,fileCount:visited.size}
  })
  return result
}

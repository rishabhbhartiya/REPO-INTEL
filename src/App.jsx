import React, { useState, useCallback, useRef } from 'react'
import HomePage from './components/HomePage.jsx'
import ScanningPage from './components/ScanningPage.jsx'
import DashboardPage from './components/DashboardPage.jsx'
import {
  getRepoMeta, getTree, getContent, getCommits,
  getLang, classifyFile, extractSymbols, parseDeps,
  scoreFile, buildTree, detectCircularDeps, complexityScore,
  detectDeadCode, estimateBundleSize, NOISE_ROLES
} from './utils/github.js'

export default function App() {
  const [phase, setPhase] = useState('home')
  const [logs, setLogs] = useState([])
  const [scanData, setScanData] = useState(null)
  const abortRef = useRef(false)

  const addLog = useCallback((text, type='') => {
    setLogs(prev => [...prev.slice(-80), { text, type, id: Date.now()+Math.random() }])
  }, [])

  const scan = useCallback(async (url) => {
    const match = url.match(/github\.com\/([^/\s?#]+)\/([^/\s?#]+)/)
    if (!match) { addLog('✗ Invalid GitHub URL','err'); return }
    const [,owner,repoRaw] = match
    const repo = repoRaw.replace(/\.git$/,'')
    setPhase('scanning'); setScanData(null); setLogs([]); abortRef.current=false
    try {
      addLog(`▶  ${owner}/${repo}`,'accent')
      const meta = await getRepoMeta(owner, repo)
      const branch = meta.default_branch||'main'
      addLog(`branch: ${branch}  ·  ${meta.language||'?'}  ·  ★ ${(meta.stargazers_count||0).toLocaleString()}`,'ok')
      // Check deployment
      let deployUrl = null
      try {
        const pages = await ghFetch(`https://api.github.com/repos/${owner}/${repo}/pages`)
        if (pages?.html_url) deployUrl = pages.html_url
      } catch {}
      if (!deployUrl && meta.homepage) deployUrl = meta.homepage
      addLog('Fetching file tree…')
      const treeData = await getTree(owner, repo, branch)
      const rawFiles = (treeData.tree||[]).filter(n=>n.type==='blob')
      if (treeData.truncated) addLog(`⚠ Tree truncated at ${rawFiles.length}`,'warn')
      addLog(`${rawFiles.length} files discovered`,'ok')
      const classified = rawFiles.map(f=>({
        ...f, language:getLang(f.path), role:classifyFile(f.path),
        imports:[], exports:[], importedBy:[], deps:{runtime:{},dev:{},peer:{}}, content:null, gitInfo:null,
      }))
      const langMap={}
      classified.forEach(f=>{ if(f.language) langMap[f.language]=(langMap[f.language]||0)+1 })
      const topLangs=Object.entries(langMap).sort((a,b)=>b[1]-a[1])
      addLog(`Languages: ${topLangs.slice(0,5).map(([l,n])=>`${l}(${n})`).join('  ')}`,'ok')
      const byRole=r=>classified.filter(f=>f.role===r)
      const toRead=[
        ...byRole('engine'),...byRole('manifest'),
        ...byRole('route').slice(0,5),...byRole('service').slice(0,5),
        ...byRole('state').slice(0,4),...byRole('model').slice(0,4),
        ...byRole('component').slice(0,4),...byRole('hook').slice(0,3),
        ...byRole('util').slice(0,3),...byRole('middleware').slice(0,3),
        ...byRole('config').slice(0,2),
      ].slice(0,30)
      addLog(`Reading ${toRead.length} key files…`,'accent')
      const allDeps={runtime:{},dev:{},peer:{}}
      for (const f of toRead) {
        if (abortRef.current) break
        const content = await getContent(owner, repo, f.path, branch)
        if (content) {
          f.content=content
          const sym=extractSymbols(content, f.path)
          f.imports=sym.imports; f.exports=sym.exports
          if (f.role==='manifest') {
            f.deps=parseDeps(content, f.path)
            Object.entries(f.deps.runtime).forEach(([k,v])=>allDeps.runtime[k]=v)
            Object.entries(f.deps.dev).forEach(([k,v])=>allDeps.dev[k]=v)
            Object.entries(f.deps.peer).forEach(([k,v])=>allDeps.peer[k]=v)
          }
          addLog(`  ✓ ${f.path.split('/').pop()}  ${f.imports.length}↙  ${f.exports.length}↗`,'ok')
        }
      }
      classified.forEach(src=>{
        src.imports.forEach(imp=>{
          if(!imp.source.startsWith('.')&&!imp.source.startsWith('/'))return
          const impBase=imp.source.split('/').pop().replace(/\.[^.]+$/,'').toLowerCase()
          classified.forEach(tgt=>{
            if(tgt.path===src.path)return
            const tgtBase=tgt.path.split('/').pop().replace(/\.[^.]+$/,'').toLowerCase()
            if(tgtBase===impBase&&!tgt.importedBy.includes(src.path))tgt.importedBy.push(src.path)
          })
        })
      })
      classified.forEach(f=>{ if(f.role==='util'&&f.importedBy.length>=3)f.role='service' })
      classified.forEach(f=>{ f.score=scoreFile(f,f.importedBy.length); f.complexity=complexityScore(f) })
      const prioritized=[...classified].sort((a,b)=>b.score-a.score)
      addLog('Running analysis…','accent')
      const {adj,cycles}=detectCircularDeps(classified)
      const deadCode=detectDeadCode(classified)
      const bundleMap=estimateBundleSize(classified,adj)
      addLog('Fetching git history…')
      const gitFiles=prioritized.filter(f=>f.exports.length>0||f.role==='engine').slice(0,10)
      for (const f of gitFiles) {
        if (abortRef.current) break
        try {
          const commits=await getCommits(owner,repo,f.path,branch)
          if(commits?.length>0)f.gitInfo={lastCommit:commits[0].commit.committer.date,lastAuthor:commits[0].commit.author.name,commitCount:commits.length,churnRate:commits.length}
        } catch {}
      }
      const tree=buildTree(classified)
      addLog(`✓ Done — ${cycles.length} cycles · ${deadCode.length} dead · ${Object.keys(allDeps.runtime).length} deps`,'accent')
      setScanData({owner,repo,branch,meta,deployUrl,classified,prioritized,tree,allDeps,langMap,topLangs,adj,cycles,deadCode,bundleMap})
      setPhase('done')
    } catch(err) {
      addLog(`✗ ${err.message}`,'err')
      setPhase('home')
    }
  }, [addLog])

  function ghFetch(url){ return fetch(url,{headers:{Accept:'application/vnd.github.v3+json'}}).then(r=>r.json()) }

  if (phase==='home') return <HomePage onScan={scan}/>
  if (phase==='scanning') return <ScanningPage logs={logs}/>
  return <DashboardPage data={scanData} onNewScan={()=>setPhase('home')}/>
}

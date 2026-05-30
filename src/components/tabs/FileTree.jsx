import React, { useState, useMemo } from 'react'
import Badge from '../Badge.jsx'
import { PageHeader, Toggle, GhLink } from '../ui.jsx'
import { NOISE_ROLES, getExt } from '../../utils/github.js'

const ICONS = {
  js:'🟨',jsx:'⚛',mjs:'🟨',ts:'🔷',tsx:'⚛',py:'🐍',java:'☕',kt:'🎯',
  go:'🐹',rs:'🦀',rb:'💎',php:'🐘',cs:'💜',cpp:'⚙',c:'⚙',h:'⚙',
  swift:'🍎',vue:'💚',svelte:'🔥',astro:'🚀',dart:'🎯',css:'🎨',scss:'🎨',
  html:'🌐',json:'{}',yaml:'📋',yml:'📋',toml:'📋',md:'📝',sh:'🖥',
  sql:'🗄',graphql:'◈',tf:'🏗',png:'🖼',jpg:'🖼',svg:'🎭',
}
function getIcon(path) {
  const n = path.split('/').pop().toLowerCase()
  if (/^dockerfile/i.test(n)) return '🐳'
  if (/^makefile/i.test(n)) return '⚒'
  if (/^\.env/i.test(n)) return '🔐'
  if (/package\.json/.test(n)) return '📦'
  return ICONS[getExt(n)] || '📄'
}

function TreeNode({ node, depth, showNoise, owner, repo, branch }) {
  const [open, setOpen] = useState(depth < 2)
  const isDir = node.type === 'dir'
  const f = node.file
  if (!showNoise && f && NOISE_ROLES.has(f.role)) return null

  if (isDir) {
    const children = Object.values(node.children)
      .sort((a, b) => {
        if (a.type !== b.type) return a.type === 'dir' ? -1 : 1
        return a.name.localeCompare(b.name)
      })
      .filter(c => showNoise || c.type === 'dir' || !NOISE_ROLES.has(c.file?.role))
    if (!children.length) return null
    return (
      <div>
        <div onClick={() => setOpen(o => !o)}
          style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 6px', borderRadius:5, cursor:'pointer', marginLeft:depth*18, userSelect:'none' }}
          onMouseEnter={e => e.currentTarget.style.background='var(--gh-neutral-subtle)'}
          onMouseLeave={e => e.currentTarget.style.background='transparent'}>
          <span style={{ fontFamily:'var(--mono)', fontSize:11, color:'var(--gh-fg-muted)', width:14, textAlign:'center', flexShrink:0 }}>{open ? '▾' : '▸'}</span>
          <span style={{ fontSize:13, flexShrink:0 }}>📁</span>
          <span style={{ fontFamily:'var(--mono)', fontSize:12, color:'var(--gh-accent-fg)', fontWeight:500 }}>{node.name}/</span>
          <span style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--gh-fg-subtle)' }}>{children.length}</span>
        </div>
        {open && (
          <div style={{ position:'relative' }}>
            <div style={{ position:'absolute', left:depth*18+20, top:0, bottom:0, width:1, background:'var(--gh-border-muted)', pointerEvents:'none' }}/>
            {children.map(c => <TreeNode key={c.path} node={c} depth={depth+1} showNoise={showNoise} owner={owner} repo={repo} branch={branch}/>)}
          </div>
        )}
      </div>
    )
  }

  const ghUrl = owner ? `https://github.com/${owner}/${repo}/blob/${branch}/${f?.path}` : null

  return (
    <div style={{ display:'flex', alignItems:'center', gap:6, padding:'3px 6px', borderRadius:5, marginLeft:depth*18 }}
      onMouseEnter={e => e.currentTarget.style.background='var(--gh-neutral-subtle)'}
      onMouseLeave={e => e.currentTarget.style.background='transparent'}>
      <span style={{ width:14, flexShrink:0 }}/>
      <span style={{ fontSize:12, flexShrink:0 }}>{getIcon(node.path)}</span>
      {ghUrl ? (
        <GhLink href={ghUrl} style={{ fontFamily:'var(--mono)', fontSize:12, flex:1, minWidth:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {node.name}
        </GhLink>
      ) : (
        <span style={{ fontFamily:'var(--mono)', fontSize:12, color:'var(--gh-fg-default)', flex:1, minWidth:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{node.name}</span>
      )}
      {f?.language && <span style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--gh-fg-subtle)', flexShrink:0 }}>{f.language}</span>}
      {f?.role && <Badge role={f.role} small/>}
      {f?.imports?.length > 0 && <span style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--gh-fg-subtle)' }}>↙{f.imports.length}</span>}
      {f?.exports?.length > 0 && <span style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--gh-fg-subtle)' }}>↗{f.exports.length}</span>}
    </div>
  )
}

export default function FileTree({ data }) {
  const [showNoise, setShowNoise] = useState(false)
  const { tree, classified, owner, repo, branch } = data

  const roleCounts = useMemo(() => {
    const m = {}
    classified.forEach(f => { m[f.role] = (m[f.role] || 0) + 1 })
    return Object.entries(m).filter(([r]) => !NOISE_ROLES.has(r)).sort((a, b) => b[1] - a[1]).slice(0, 10)
  }, [classified])

  const rootChildren = Object.values(tree.children).sort((a, b) => {
    if (a.type !== b.type) return a.type === 'dir' ? -1 : 1
    return a.name.localeCompare(b.name)
  })

  return (
    <div className="fadeUp">
      <PageHeader title="File Tree" subtitle={`${classified.length} files — click filename to open on GitHub (with confirmation)`}
        right={<Toggle label="Show noise files" value={showNoise} onChange={() => setShowNoise(v => !v)}/>}/>
      <div style={{ display:'flex', gap:6, marginBottom:14, flexWrap:'wrap' }}>
        {roleCounts.map(([role, n]) => (
          <div key={role} style={{ display:'flex', alignItems:'center', gap:4 }}>
            <Badge role={role} small/><span style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--gh-fg-muted)' }}>{n}</span>
          </div>
        ))}
      </div>
      <div style={{ background:'var(--gh-canvas-overlay)', border:'1px solid var(--gh-border-default)', borderRadius:8, padding:'12px 8px' }}>
        <div style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--gh-fg-subtle)', padding:'0 6px 10px', display:'flex', gap:16, borderBottom:'1px solid var(--gh-border-muted)', marginBottom:8 }}>
          <span>▸/▾ toggle folder</span><span>↙ imports  ↗ exports</span>
          <span style={{ marginLeft:'auto', color:'var(--gh-accent-fg)' }}>click filename → GitHub (confirm)</span>
        </div>
        {rootChildren.map(c => <TreeNode key={c.path} node={c} depth={0} showNoise={showNoise} owner={owner} repo={repo} branch={branch}/>)}
      </div>
    </div>
  )
}

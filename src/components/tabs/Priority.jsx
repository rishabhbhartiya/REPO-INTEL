import React, { useState, useMemo } from 'react'
import Badge from '../Badge.jsx'
import { PageHeader, FilterBtn, Toggle, SearchInput, GhLink } from '../ui.jsx'
import { NOISE_ROLES, BADGE } from '../../utils/github.js'

const REASONS = {
  engine:'Application entry point — execution begins here',
  route:'Router/controller — handles URL dispatch and request flow',
  service:'Business logic — core domain operations and data processing',
  state:'State management — app-wide reactive data store',
  model:'Data model / ORM — entity structure and database access',
  component:'UI component — rendered in routes or parent layouts',
  middleware:'Middleware / guard — intercepts request lifecycle',
  hook:'Custom hook — reusable stateful logic',
  util:'Utility module — widely-used helper functions',
  types:'Type definitions — consumed by many modules',
  config:'Configuration — controls build or runtime behaviour',
  manifest:'Package manifest — defines project metadata and deps',
  ci:'CI/CD pipeline — build and deploy automation',
  docker:'Container config — defines the runtime environment',
  infra:'Infrastructure as code — cloud and deployment config',
  test:'Test / spec file — validates application behaviour',
  story:'Storybook story — documents component states',
  style:'Stylesheet — visual styles imported by components',
  script:'Script / CLI — automation tooling',
  doc:'Documentation',
  noise:'Repo metadata (README, LICENSE…)',
  misc:'Uncategorised file',
}

export default function Priority({ data }) {
  const { prioritized, owner, repo, branch } = data
  const [showNoise, setShowNoise] = useState(false)
  const [filterRole, setFilterRole] = useState('all')
  const [search, setSearch] = useState('')

  const roles = useMemo(() => ['all', ...Object.keys(BADGE).filter(r => prioritized.some(f => f.role === r))], [prioritized])
  const filtered = useMemo(() => prioritized.filter(f => {
    if (!showNoise && NOISE_ROLES.has(f.role)) return false
    if (filterRole !== 'all' && f.role !== filterRole) return false
    if (search && !f.path.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }), [prioritized, showNoise, filterRole, search])

  const ghUrl = path => owner ? `https://github.com/${owner}/${repo}/blob/${branch}/${path}` : null

  return (
    <div className="fadeUp">
      <PageHeader title="Reading Priority" subtitle={`${filtered.length} files ranked by role + import frequency + connectivity score`}
        right={<div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Filter paths…"/>
          <Toggle label="Noise" value={showNoise} onChange={() => setShowNoise(v => !v)}/>
        </div>}
      />
      <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginBottom:16 }}>
        {roles.slice(0, 12).map(r => (
          <FilterBtn key={r} active={filterRole === r} onClick={() => setFilterRole(r)}>
            {r === 'all' ? 'All' : (BADGE[r]?.label || r)}
          </FilterBtn>
        ))}
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
        {filtered.slice(0, 50).map((f, i) => (
          <div key={f.path} style={{ display:'flex', gap:14, alignItems:'flex-start', background:'var(--gh-canvas-overlay)', border:`1px solid ${i < 3 ? 'var(--gh-border-default)' : 'var(--gh-border-muted)'}`, borderRadius:8, padding:'12px 16px', transition:'border-color 0.15s', animation:`fadeUp 0.3s ease ${i*15}ms both` }}
            onMouseEnter={e => e.currentTarget.style.borderColor='var(--gh-border-default)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = i<3 ? 'var(--gh-border-default)' : 'var(--gh-border-muted)'}>
            <div style={{ fontFamily:'var(--mono)', fontSize:18, fontWeight:700, color:i<3?'var(--gh-accent-fg)':'var(--gh-fg-subtle)', minWidth:32, flexShrink:0, lineHeight:1, paddingTop:3 }}>
              {String(i+1).padStart(2,'0')}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                {ghUrl(f.path) ? (
                  <GhLink href={ghUrl(f.path)} style={{ fontFamily:'var(--mono)', fontSize:13, fontWeight:500, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {f.path}
                  </GhLink>
                ) : (
                  <span style={{ fontFamily:'var(--mono)', fontSize:13, color:'var(--gh-fg-default)', fontWeight:500, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.path}</span>
                )}
              </div>
              <div style={{ fontFamily:'var(--sans)', fontSize:12, color:'var(--gh-fg-muted)', lineHeight:1.5 }}>
                {REASONS[f.role] || 'Utility file'}
                {f.importedBy.length > 0 && <span style={{ color:'var(--gh-attention-fg)', marginLeft:8 }}>· used by {f.importedBy.length} file{f.importedBy.length > 1 ? 's' : ''}</span>}
              </div>
              <div style={{ display:'flex', gap:6, marginTop:7, alignItems:'center', flexWrap:'wrap' }}>
                <Badge role={f.role} small/>
                {f.language && <span style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--gh-fg-muted)', background:'var(--gh-neutral-subtle)', border:'1px solid var(--gh-border-muted)', padding:'1px 6px', borderRadius:4 }}>{f.language}</span>}
                {f.imports.length > 0 && <span style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--gh-fg-subtle)' }}>↙{f.imports.length} imports</span>}
                {f.exports.length > 0 && <span style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--gh-fg-subtle)' }}>↗{f.exports.length} exports</span>}
                {f.importedBy.slice(0,3).map(p => <span key={p} style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--gh-fg-muted)', background:'var(--gh-neutral-subtle)', border:'1px solid var(--gh-border-muted)', padding:'1px 6px', borderRadius:4 }}>← {p.split('/').pop()}</span>)}
              </div>
            </div>
            <div style={{ textAlign:'right', flexShrink:0 }}>
              <div style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--gh-fg-subtle)', marginBottom:2 }}>SCORE</div>
              <div style={{ fontFamily:'var(--mono)', fontSize:18, fontWeight:700, color:i<5?'var(--gh-accent-fg)':'var(--gh-fg-muted)', lineHeight:1 }}>{Math.round(f.score)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

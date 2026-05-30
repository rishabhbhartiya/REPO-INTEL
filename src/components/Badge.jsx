import React from 'react'
import { BADGE } from '../utils/github.js'

const C = {
  green:   ['var(--green)',  'var(--greenBg)',  'var(--green2)'],
  cyan:    ['var(--cyan)',   'var(--cyanBg)',   'var(--cyan2)'],
  amber:   ['var(--amber)',  'var(--amberBg)',  'var(--amber2)'],
  violet:  ['var(--violet)', 'var(--violetBg)', 'var(--violet2)'],
  rose:    ['var(--rose)',   'var(--roseBg)',   'var(--rose2)'],
  pink:    ['var(--pink)',   'rgba(219,61,135,0.15)', 'var(--pink2)'],
  teal:    ['var(--teal)',   'rgba(57,211,83,0.15)',  '#2ea043'],
  lime:    ['var(--lime)',   'rgba(126,231,135,0.15)','#2ea043'],
  blue:    ['var(--cyan)',   'var(--cyanBg)',   'var(--cyan2)'],
  orange:  ['var(--orange)', 'var(--orangeBg)', 'var(--orange2)'],
  neutral: ['var(--t2)',     'var(--gh-neutral-subtle)', 'var(--gh-border-default)'],
}

export default function Badge({ role, small=false }) {
  const meta = BADGE[role] || BADGE.misc
  const [fg, bg, border] = C[meta.color] || C.neutral
  return (
    <span title={meta.label} style={{
      display:'inline-flex', alignItems:'center',
      fontFamily:'var(--mono)', fontSize:small?9:10,
      fontWeight:600, letterSpacing:'0.04em',
      color:fg, background:bg, border:`1px solid ${border}`,
      padding:small?'1px 5px':'2px 7px', borderRadius:4,
      flexShrink:0, whiteSpace:'nowrap',
    }}>
      {meta.label}
    </span>
  )
}

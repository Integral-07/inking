import { NavLink } from 'react-router-dom'

const SCREENS = [
  { num: '01', label: 'Library', to: '/' },
  { num: '02', label: 'Vocabulary', to: '/vocab' },
  { num: '03', label: 'Writing', to: '/write' },
]

export function Sidebar() {
  return (
    <nav className="drawer">
      <div className="wordmark">Inkling</div>
      <span className="wordmark-sub">a hunch, inked in</span>

      <div className="drawer-label">Screens</div>
      <ul className="tab-list">
        {SCREENS.map((screen) => (
          <li key={screen.to}>
            <NavLink
              to={screen.to}
              end={screen.to === '/'}
              className={({ isActive }) => `tab${isActive ? ' active' : ''}`}
            >
              <span className="num">{screen.num}</span> {screen.label}
            </NavLink>
          </li>
        ))}
      </ul>

      <p className="drawer-note">"inkling, n. — a faint notion; a hint not yet fully understood."</p>
    </nav>
  )
}

import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useSession, signOut } from '../hooks/auth'

const SCREENS = [
  { num: '00', label: 'How to use', to: '/help' },
  { num: '01', label: 'Library', to: '/' },
  { num: '02', label: 'Vocabulary', to: '/vocab' },
  { num: '03', label: 'Writings', to: '/writings' },
]

export function Sidebar() {
  const { user, loading } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  return (
    <nav className="drawer">
      <div className="wordmark">Inkling</div>
      <span className="wordmark-sub">a hunch, inked in</span>

      <div className="drawer-label">Index</div>
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

      <p className="drawer-note"></p>

      {!loading && (
        <div className="account-box">
          {user ? (
            <div className="account-menu-wrapper" ref={menuRef}>
              {menuOpen && (
                <div className="account-menu">
                  <NavLink to="/settings" className="account-menu-item" onClick={() => setMenuOpen(false)}>
                    設定
                  </NavLink>
                  <button
                    className="account-menu-item"
                    onClick={() => {
                      setMenuOpen(false)
                      signOut()
                    }}
                  >
                    ログアウト
                  </button>
                </div>
              )}
              <button className="account-plate" onClick={() => setMenuOpen((open) => !open)}>
                <span className="account-plate-email">{user.email}</span>
              </button>
            </div>
          ) : (
            <NavLink to="/login" className="account-action">
              ログイン
            </NavLink>
          )}
        </div>
      )}
    </nav>
  )
}

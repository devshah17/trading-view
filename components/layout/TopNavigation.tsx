'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart2, Bell, Settings, User, Globe, BookOpen, Filter } from 'lucide-react'
import { SymbolSearch } from './SymbolSearch'
import { ConnectionStatus } from '@/components/ui/ConnectionStatus'
import { Badge } from '@/components/ui/Badge'

const NAV_LINKS = [
  { href: '/markets',  label: 'Markets',   icon: Globe },
  { href: '/watchlist', label: 'Watchlist', icon: BookOpen },
  { href: '/screener', label: 'Screener',  icon: Filter },
  { href: '/alerts',   label: 'Alerts',    icon: Bell },
]

export function TopNavigation() {
  const pathname = usePathname()

  return (
    <nav className="top-nav" role="navigation" aria-label="Main navigation">
      {/* Logo */}
      <Link href="/" className="nav-logo" aria-label="QuantTerminal Home">
        <div className="nav-logo-icon" aria-hidden>
          <BarChart2 size={12} color="#fff" />
        </div>
        <span>QuantTerminal</span>
      </Link>

      <div className="nav-divider" />

      {/* Symbol Search */}
      <SymbolSearch />

      <div className="nav-divider" />

      {/* Nav links */}
      {NAV_LINKS.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={`nav-btn ${pathname.startsWith(href) ? 'active' : ''}`}
          aria-current={pathname.startsWith(href) ? 'page' : undefined}
        >
          <Icon size={13} />
          <span>{label}</span>
        </Link>
      ))}

      <div style={{ flex: 1 }} />

      {/* Right side */}
      <ConnectionStatus />
      <div className="nav-divider" />
      <Badge variant="open">YAHOO FINANCE</Badge>
      <div className="nav-divider" />
      <Link href="/settings" className="icon-btn" aria-label="Settings">
        <Settings size={15} />
      </Link>
      <button className="icon-btn" aria-label="User profile">
        <User size={15} />
      </button>
    </nav>
  )
}

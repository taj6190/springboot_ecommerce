'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { getAllowedSections } from '@/lib/rbac';
import {
  LayoutDashboard, Package, Layers, Tag as TagIcon, ShoppingCart,
  Image, Users, Ticket, LogOut, ShoppingBag, ChevronLeft, ChevronRight,
  Star, Zap, BarChart3, Settings, Warehouse, PanelTop, UserCog, FileText, Tags,
} from 'lucide-react';
import { useState } from 'react';

const navSections = [
  {
    title: 'Overview',
    items: [
      { href: '/dashboard',            icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/dashboard/reports',     icon: BarChart3,       label: 'Reports' },
    ],
  },
  {
    title: 'Catalog',
    items: [
      { href: '/dashboard/products',    icon: Package,         label: 'Products' },
      { href: '/dashboard/categories',  icon: Layers,          label: 'Categories' },
      { href: '/dashboard/brands',      icon: TagIcon,         label: 'Brands' },
      { href: '/dashboard/tags',        icon: Tags,            label: 'Tags' },
      { href: '/dashboard/inventory',   icon: Warehouse,       label: 'Inventory' },
    ],
  },
  {
    title: 'Sales',
    items: [
      { href: '/dashboard/orders',      icon: ShoppingCart,     label: 'Orders' },
      { href: '/dashboard/coupons',     icon: Ticket,          label: 'Coupons' },
      { href: '/dashboard/flash-sales', icon: Zap,             label: 'Flash Sales' },
    ],
  },
  {
    title: 'Content',
    items: [
      { href: '/dashboard/sliders',      icon: Image,           label: 'Sliders' },
      { href: '/dashboard/sections',     icon: PanelTop,        label: 'Homepage' },
      { href: '/dashboard/reviews',      icon: Star,            label: 'Reviews' },
      { href: '/dashboard/static-pages', icon: FileText,        label: 'Pages' },
    ],
  },
  {
    title: 'Users',
    items: [
      { href: '/dashboard/customers',   icon: Users,           label: 'Customers' },
      { href: '/dashboard/users',       icon: UserCog,         label: 'Staff & Roles' },
    ],
  },
  {
    title: 'System',
    items: [
      { href: '/dashboard/settings',    icon: Settings,        label: 'Settings' },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const userRoles = user?.roles ?? [];
  const allowedSections = getAllowedSections(userRoles);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Filter sections by RBAC
  const visibleSections = navSections.filter((s) => allowedSections.includes(s.title));

  return (
    <aside
      className="h-screen sticky top-0 flex flex-col transition-all duration-300 border-r"
      style={{
        width: collapsed ? 72 : 260,
        background: 'var(--bg-secondary)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b" style={{ borderColor: 'var(--border)' }}>
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/10 group-hover:scale-105 transition-transform"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 4H10L14 14V4H18V20H14L10 10V20H6V4Z" fill="white" />
          </svg>
        </div>
        {!collapsed && (
          <div className="animate-slide-in">
            <p className="font-bold text-sm text-white leading-none">Nexora</p>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Admin Panel</p>
          </div>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex-1 py-3 px-3 overflow-y-auto space-y-4">
        {visibleSections.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-1.5"
                style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-link ${isActive ? 'active' : ''}`}
                    title={collapsed ? item.label : undefined}
                    style={collapsed ? { justifyContent: 'center', padding: '10px' } : {}}
                  >
                    <item.icon size={17} className="flex-shrink-0" />
                    {!collapsed && <span className="animate-slide-in text-[13px]">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User + Collapse */}
      <div className="border-t p-3 space-y-2" style={{ borderColor: 'var(--border)' }}>
        {!collapsed && user && (
          <div className="px-2 py-1.5 animate-slide-in">
            <p className="text-sm font-medium text-white truncate">{user.fullName}</p>
            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {userRoles.map(r => (
                <span key={r} className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400">
                  {r.replace('ROLE_', '')}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="flex items-center gap-1">
          <button
            onClick={handleLogout}
            className="nav-link flex-1 text-red-400 hover:bg-red-500/10 hover:text-red-400"
            title="Logout"
            style={collapsed ? { justifyContent: 'center', padding: '10px' } : {}}
          >
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
            style={{ color: 'var(--text-muted)' }}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </div>
    </aside>
  );
}

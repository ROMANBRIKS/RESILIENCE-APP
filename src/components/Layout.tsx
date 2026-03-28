import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Search, Users, HeartHandshake, ShoppingBag, LogOut, Bell, Calculator, Newspaper, Globe } from 'lucide-react';
import { User } from '../types';
import { cn } from '../lib/utils';

interface LayoutProps {
  user: User;
  onLogout: () => void;
}

export default function Layout({ user, onLogout }: LayoutProps) {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/assistant', icon: MessageSquare, label: 'AI Assistant' },
    { path: '/news', icon: Newspaper, label: 'Financial News' },
    { path: '/global-economy', icon: Globe, label: 'World Economy' },
    { path: '/compare', icon: Search, label: 'Price Compare' },
    { path: '/budget', icon: Calculator, label: 'Budget AI' },
    { path: '/community', icon: Users, label: 'Community' },
    { path: '/counseling', icon: HeartHandshake, label: 'Support' },
    { path: '/marketplace', icon: ShoppingBag, label: 'Marketplace' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-black" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Resilience</h1>
          </div>
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black">Financial Support Network</p>
        </div>

        <nav className="flex-1 px-6 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold transition-all group",
                location.pathname === item.path
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-transform group-hover:scale-110",
                location.pathname === item.path ? "text-emerald-400" : "text-slate-400"
              )} />
              {item.label}
              {item.path === '/community' && (
                <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </Link>
          ))}
        </nav>

        <div className="p-6 mt-auto">
          <div className="bg-slate-50 rounded-3xl p-4 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 overflow-hidden">
                <img src={user.avatarUrl || `https://picsum.photos/seed/${user.id}/100/100`} alt="Me" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-slate-900 truncate uppercase italic tracking-tighter">{user.displayName || 'Anonymous'}</p>
                <p className="text-[10px] text-slate-400 font-bold truncate uppercase tracking-widest">{user.region}</p>
              </div>
              <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-slate-50" />
              </button>
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl text-xs font-black uppercase italic tracking-tighter text-rose-500 hover:bg-rose-50 transition-colors border border-rose-100"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6 md:p-12">
        <div className="max-w-5xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

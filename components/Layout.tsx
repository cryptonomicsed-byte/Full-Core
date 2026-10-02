
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Dna, LayoutDashboard, Sparkles, Megaphone, Bot, 
  Layout as LayoutIcon, Target, Users, 
  Zap, Settings, Activity, ChevronLeft, ChevronRight,
  LogOut, CreditCard, Video, Brain
} from 'lucide-react';
import { SonicOrb } from './SonicOrb';
import { ToastContainer } from './ToastContainer';
import { useStore } from '../store';

interface LayoutProps {
  children: React.ReactNode;
}

const SidebarItem: React.FC<{ to: string, icon: any, label: string, active: boolean, collapsed: boolean }> = ({ to, icon: Icon, label, active, collapsed }) => (
  <Link 
    to={to} 
    title={collapsed ? label : undefined}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative ${
      active 
        ? 'bg-brand-500/10 text-brand-500 border-l-2 border-brand-500' 
        : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
    } ${collapsed ? 'justify-center px-2' : ''}`}
  >
    <Icon className={`w-5 h-5 shrink-0 ${active ? 'animate-pulse' : ''}`} />
    
    {!collapsed && (
      <>
        <span className="font-medium tracking-wide whitespace-nowrap overflow-hidden">{label}</span>
        {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(20,184,166,0.6)]" />}
      </>
    )}
    
    {/* Tooltip for collapsed state */}
    {collapsed && (
      <div className="absolute left-full ml-2 px-2 py-1 bg-black border border-zinc-800 rounded text-xs text-white opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
        {label}
      </div>
    )}
  </Link>
);

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const isPublicRoute = location.pathname === '/landing' || location.pathname === '/login' || location.pathname.startsWith('/share');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isPublicRoute) {
     return <div className="min-h-screen bg-dark-bg text-zinc-100 font-sans">{children}</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-dark-bg text-zinc-100 font-sans selection:bg-brand-500/30">
      <ToastContainer />
      
      {/* Sidebar */}
      <aside className={`${isCollapsed ? 'w-20' : 'w-64'} border-r border-dark-border flex flex-col bg-dark-surface/50 backdrop-blur-xl z-20 shrink-0 transition-all duration-300 relative`}>
        
        {/* Collapse Toggle */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-8 bg-dark-surface border border-dark-border text-zinc-400 hover:text-white rounded-full p-1 z-50 shadow-lg hover:bg-brand-600 hover:border-brand-500 transition-all"
        >
          {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>

        <div className={`p-6 flex items-center gap-3 border-b border-dark-border/50 h-20 ${isCollapsed ? 'justify-center px-2' : ''}`}>
          <div className="relative shrink-0">
            <div className="absolute inset-0 bg-brand-500 blur-lg opacity-20 animate-pulse-slow"></div>
            <Dna className="w-8 h-8 text-brand-500 relative z-10" />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden whitespace-nowrap animate-in fade-in duration-300">
              <h1 className="text-xl font-bold tracking-tighter text-white">CoreDNA<span className="text-brand-500">2</span></h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Enterprise OS</p>
            </div>
          )}
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar overflow-x-hidden">
          <SidebarItem collapsed={isCollapsed} to="/" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/' || location.pathname === '/simulator' || location.pathname === '/battle'} />
          <SidebarItem collapsed={isCollapsed} to="/campaigns" icon={Megaphone} label="Campaign Forge" active={location.pathname === '/campaigns'} />
          <SidebarItem collapsed={isCollapsed} to="/leads" icon={Target} label="Lead Hunter" active={location.pathname === '/leads'} />
          <SidebarItem collapsed={isCollapsed} to="/agents" icon={Bot} label="Agent Forge" active={location.pathname === '/agents'} />
          <SidebarItem collapsed={isCollapsed} to="/builder" icon={LayoutIcon} label="Website Builder" active={location.pathname === '/builder'} />
          <SidebarItem collapsed={isCollapsed} to="/live" icon={Users} label="Live Sessions" active={location.pathname === '/live'} />
          <SidebarItem collapsed={isCollapsed} to="/video" icon={Video} label="Video Studio" active={location.pathname === '/video'} />
          <SidebarItem collapsed={isCollapsed} to="/intelligence" icon={Brain} label="Intelligence Hub" active={location.pathname === '/intelligence'} />
          <SidebarItem collapsed={isCollapsed} to="/automations" icon={Zap} label="Automations & Ops" active={location.pathname === '/automations'} />
          <SidebarItem collapsed={isCollapsed} to="/subscriptions" icon={CreditCard} label="Billing" active={location.pathname === '/subscriptions'} />
          <SidebarItem collapsed={isCollapsed} to="/settings" icon={Settings} label="Settings" active={location.pathname === '/settings'} />
        </nav>

        <div className={`p-4 border-t border-dark-border/50 flex flex-col gap-2 ${isCollapsed ? 'items-center' : ''}`}>
          <button 
            onClick={handleLogout}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-400/5 transition-all group relative w-full ${isCollapsed ? 'justify-center px-2' : ''}`}
            title={isCollapsed ? 'Logout' : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="font-medium tracking-wide">Logout</span>}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-black border border-zinc-800 rounded text-xs text-white opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                Logout
              </div>
            )}
          </button>

          {isCollapsed ? (
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-brand-900/20 text-brand-500">
               <Activity className="w-4 h-4" />
            </div>
          ) : (
            <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-gradient-to-r from-brand-950 to-transparent border border-brand-900/30 animate-in fade-in">
              <Activity className="w-4 h-4 text-brand-500" />
              <div className="flex-1 overflow-hidden whitespace-nowrap">
                <div className="text-xs font-medium text-brand-200">System Online</div>
                <div className="text-[10px] text-brand-500/60">v2.5.0-alpha</div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Background Ambient Effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-brand-900/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px]" />
        </div>
        
        {/* Page Content */}
        <div className="relative z-10 flex-1 overflow-y-auto scroll-smooth">
          {children}
        </div>

        {/* Floating Sonic Orb (Always accessible) */}
        <div className="absolute bottom-8 right-8 z-50">
           <SonicOrb />
        </div>
      </main>
    </div>
  );
};

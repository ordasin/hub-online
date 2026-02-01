import React from 'react';
import { 
  LayoutDashboard, PlusCircle, Files, 
  MessageSquare, Settings, BarChart3, 
  Users, LogOut 
} from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-black flex flex-col pt-8">
        <div className="px-8 mb-12">
          <div className="text-xl font-black uppercase tracking-tighter italic">Nebula<span className="text-cyan-500">Core</span></div>
          <div className="text-[8px] font-bold text-cyan-500 uppercase tracking-[0.3em] mt-1">Admin Terminal</div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <NavItem icon={<LayoutDashboard size={18}/>} label="Overview" active />
          <NavItem icon={<PlusCircle size={18}/>} label="Upload Project" />
          <NavItem icon={<Files size={18}/>} label="Manage Files" />
          <NavItem icon={<MessageSquare size={18}/>} label="Moderation" />
          <NavItem icon={<Users size={18}/>} label="User Base" />
          <NavItem icon={<BarChart3 size={18}/>} label="Analytics" />
        </nav>

        <div className="p-4 border-t border-white/5">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-bold uppercase tracking-widest">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 overflow-y-auto">
        <header className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter">Command <span className="text-cyan-500">Center</span></h1>
            <p className="text-white/40 mt-2 text-sm uppercase tracking-widest">Bienvenido de nuevo, Comandante.</p>
          </div>
          <div className="flex gap-4">
             <div className="px-6 py-3 border border-white/10 bg-white/5 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2">
               <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
               Server Load: 12%
             </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <StatCard label="Total Downloads" value="24.5k" change="+12%" />
          <StatCard label="Active Users" value="1,204" change="+5%" />
          <StatCard label="Avg. Rating" value="4.8" change="0.0" />
          <StatCard label="Disk Usage" value="12.4 GB" change="78%" />
        </div>

        {/* Action Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Upload Form Mockup */}
          <div className="p-8 border border-white/5 bg-white/[0.02]">
            <h3 className="text-xl font-black uppercase italic mb-8 flex items-center gap-3">
              <PlusCircle className="text-cyan-500" /> New Deployment
            </h3>
            <form className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Project Name</label>
                <input type="text" className="w-full bg-black border border-white/10 px-4 py-3 focus:border-cyan-500 outline-none transition-colors" placeholder="e.g. Zenith Optimizer" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Version</label>
                  <input type="text" className="w-full bg-black border border-white/10 px-4 py-3 focus:border-cyan-500 outline-none transition-colors" placeholder="v1.0.0" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Category</label>
                  <select className="w-full bg-black border border-white/10 px-4 py-3 focus:border-cyan-500 outline-none transition-colors">
                    <option>App</option>
                    <option>Game</option>
                    <option>Tool</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Binary File (.exe, .zip)</label>
                <div className="w-full border-2 border-dashed border-white/10 p-8 text-center hover:border-cyan-500/50 cursor-pointer transition-colors group">
                  <PlusCircle className="mx-auto mb-2 text-white/20 group-hover:text-cyan-500" />
                  <span className="text-xs font-bold text-white/40 group-hover:text-white transition-colors uppercase tracking-widest">Click to upload file</span>
                </div>
              </div>
              <button className="w-full py-4 bg-cyan-500 text-black font-black uppercase tracking-widest text-sm hover:bg-cyan-400 transition-all">
                DEPLOY TO MATRIX
              </button>
            </form>
          </div>

          {/* Recent Activity / Chat Mod */}
          <div className="p-8 border border-white/5 bg-white/[0.02]">
            <h3 className="text-xl font-black uppercase italic mb-8 flex items-center gap-3">
              <Activity className="text-purple-500" /> System Activity
            </h3>
            <div className="space-y-6">
              <ActivityRow user="User_99" action="downloaded" target="Zenith Optimizer" time="2m ago" />
              <ActivityRow user="Admin" action="deployed" target="Void Runner v0.2" time="15m ago" />
              <ActivityRow user="Hacker_X" action="commented on" target="Pulse Scraper" time="1h ago" />
              <ActivityRow user="System" action="blocked" target="IP: 192.168.1.1" time="2h ago" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <div className={`flex items-center gap-4 px-6 py-4 cursor-pointer transition-all border-l-2 ${active ? 'border-cyan-500 bg-cyan-500/5 text-cyan-400' : 'border-transparent text-white/40 hover:text-white hover:bg-white/5'}`}>
      {icon}
      <span className="text-xs font-black uppercase tracking-widest">{label}</span>
    </div>
  );
}

function StatCard({ label, value, change }: { label: string, value: string, change: string }) {
  return (
    <div className="p-8 border border-white/5 bg-white/[0.01]">
      <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">{label}</div>
      <div className="flex items-end justify-between">
        <div className="text-3xl font-black italic tracking-tighter">{value}</div>
        <div className={`text-[10px] font-bold ${change.startsWith('+') ? 'text-green-500' : 'text-white/20'}`}>{change}</div>
      </div>
    </div>
  );
}

function ActivityRow({ user, action, target, time }: { user: string, action: string, target: string, time: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 text-xs">
      <div>
        <span className="text-cyan-500 font-bold uppercase italic">{user}</span>
        <span className="text-white/40 mx-2 uppercase tracking-widest">{action}</span>
        <span className="text-white font-bold uppercase">{target}</span>
      </div>
      <span className="text-white/20 font-mono italic">{time}</span>
    </div>
  );
}

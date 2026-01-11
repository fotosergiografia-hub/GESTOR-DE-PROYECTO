
import React from 'react';
import { UserRole } from '../types';
import { Icons, COLORS } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  userRole: UserRole;
  userName: string;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, userRole, userName, onLogout, activeTab, setActiveTab }) => {
  const isAdmin = userRole === UserRole.ADMIN;

  const menuItems = isAdmin 
    ? [
        { id: 'dashboard', label: 'Dashboard', icon: Icons.Project },
        { id: 'projects', label: 'Proyectos & Tareas', icon: Icons.Project },
        { id: 'users', label: 'Gestionar Personal', icon: Icons.Users },
      ]
    : [
        { id: 'dashboard', label: 'Mis Tareas', icon: Icons.Task },
      ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="p-8 border-b border-slate-100 bg-slate-50/30">
          <h1 className="text-xl font-black text-blue-900 leading-tight">
            P&E <span className="text-blue-600">de la 18</span>
          </h1>
          <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-bold">Gestión Interna</p>
        </div>
        
        <nav className="flex-1 p-6 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'
              }`}
            >
              <item.icon />
              <span className="font-bold text-sm tracking-tight">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-100">
          <div className="mb-6 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Identificado como</p>
            <p className="text-sm font-bold text-slate-700 truncate">{userName}</p>
            <p className="text-[10px] text-blue-500 font-bold uppercase">{isAdmin ? 'Acceso Administrativo' : 'Perfil Operativo'}</p>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-bold text-sm"
          >
            <Icons.Logout />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center shadow-sm">
          <h1 className="text-lg font-black text-blue-900 uppercase">P&E 18</h1>
          <div className="flex items-center space-x-4">
             <span className="text-xs font-bold text-slate-500">{userName.split(' ')[0]}</span>
             <button onClick={onLogout} className="text-red-500">
               <Icons.Logout />
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-10">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;

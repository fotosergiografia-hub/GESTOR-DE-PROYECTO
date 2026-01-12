import React, { useState } from 'react'; // 1. Importamos useState
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
  
  // 2. Estado para controlar el menú en móviles
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = isAdmin 
    ? [
        { id: 'dashboard', label: 'Dashboard', icon: Icons.Project },
        { id: 'projects', label: 'Proyectos & Tareas', icon: Icons.Project },
        { id: 'users', label: 'Gestionar Personal', icon: Icons.Users },
        { id: 'metrics', label: 'Métricas & Análisis', icon: Icons.Task },
      ]
    : [
        { id: 'dashboard', label: 'Mis Tareas', icon: Icons.Task },
      ];

  // Función para cambiar de pestaña y cerrar el menú en móvil
  const handleTabChange = (id: string) => {
    setActiveTab(id);
    setIsMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* 3. Overlay para cerrar el menú al tocar fuera (Solo móvil) */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-[60] md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* 4. Sidebar MODIFICADO para ser responsivo */}
      <aside className={`
        fixed inset-y-0 left-0 z-[70] w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out
        ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:relative md:translate-x-0 md:flex
      `}>
        <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black text-blue-900 leading-tight">
              P&E <span className="text-blue-600">de la 18</span>
            </h1>
            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-bold">Gestión Interna</p>
          </div>
          {/* Botón para cerrar en móvil */}
          <button className="md:hidden text-slate-400" onClick={() => setIsMenuOpen(false)}>
            <Icons.Logout />
          </button>
        </div>
        
        <nav className="flex-1 p-6 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
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
        
        {/* 5. Mobile Header CORREGIDO con botón de menú */}
        <header className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center shadow-sm z-50">
          <div className="flex items-center space-x-3">
            {/* BOTÓN HAMBURGUESA */}
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="p-2 bg-blue-50 text-blue-600 rounded-lg"
            >
              <Icons.Plus /> {/* Puedes cambiar este icono por uno de barras/menu */}
            </button>
            <h1 className="text-lg font-black text-blue-900 uppercase">P&E 18</h1>
          </div>
          <div className="flex items-center space-x-4">
             <span className="text-xs font-bold text-slate-500">{userName.split(' ')[0]}</span>
             <button onClick={onLogout} className="text-red-500 p-2">
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
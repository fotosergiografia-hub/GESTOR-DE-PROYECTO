
import React, { useState, useEffect } from 'react';
import { Task, User, Project, TaskStatus, UserRole } from '../types';
import { Card, ProgressBar, Badge } from './UI';
import { getAdminInsights } from '../geminiService';

interface AdminMetricsProps {
  tasks: Task[];
  users: User[];
  projects: Project[];
}

const AdminMetrics: React.FC<AdminMetricsProps> = ({ tasks, users, projects }) => {
  const [insights, setInsights] = useState<string>("Analizando datos del equipo...");
  const [loadingInsights, setLoadingInsights] = useState(true);

  // Filter out admins for performance metrics
  const operatives = users.filter(u => u.role === UserRole.USER);

  // Compute metrics per user
  const userMetrics = operatives.map(user => {
    const userTasks = tasks.filter(t => t.assignedTo === user.id);
    const completed = userTasks.filter(t => t.status === TaskStatus.APPROVED).length;
    const pending = userTasks.filter(t => t.status !== TaskStatus.APPROVED).length;
    
    // Simple overdue check: DueDate < Now and not completed
    const now = new Date();
    const overdue = userTasks.filter(t => t.status !== TaskStatus.APPROVED && new Date(t.dueDate) < now).length;
    
    // Compliance %
    const compliance = userTasks.length > 0 ? (completed / userTasks.length) * 100 : 0;
    
    // Revision count
    const totalRevisions = userTasks.reduce((sum, t) => sum + (t.revisionsCount || 0), 0);

    // Traffic light logic
    let statusColor = 'bg-green-500';
    if (overdue > 0 || compliance < 40) statusColor = 'bg-red-500';
    else if (compliance < 70 || totalRevisions > userTasks.length) statusColor = 'bg-yellow-500';

    return {
      user,
      total: userTasks.length,
      completed,
      pending,
      overdue,
      compliance,
      totalRevisions,
      statusColor
    };
  });

  // Global Stats
  const globalCompleted = tasks.filter(t => t.status === TaskStatus.APPROVED).length;
  const globalPending = tasks.filter(t => t.status !== TaskStatus.APPROVED).length;
  const globalCompliance = tasks.length > 0 ? (globalCompleted / tasks.length) * 100 : 0;

  useEffect(() => {
    const fetchInsights = async () => {
      setLoadingInsights(true);
      const dataForGemini = userMetrics.map(m => ({
        name: m.user.name,
        compliance: m.compliance.toFixed(1),
        overdue: m.overdue,
        revisions: m.totalRevisions
      }));
      const res = await getAdminInsights(dataForGemini);
      setInsights(res);
      setLoadingInsights(false);
    };

    if (tasks.length > 0) {
      fetchInsights();
    } else {
      setInsights("No hay tareas suficientes para generar análisis.");
      setLoadingInsights(false);
    }
  }, []);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10">
      <header>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight underline decoration-blue-500 decoration-4 underline-offset-8">Métricas & Análisis Operativo</h2>
        <p className="text-slate-500 mt-4 font-medium italic">Visión objetiva del rendimiento del equipo Papelería de la 18.</p>
      </header>

      {/* Global Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-slate-800 text-white border-none shadow-xl">
           <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Tareas Totales</p>
           <p className="text-4xl font-black mt-1">{tasks.length}</p>
        </Card>
        <Card className="bg-green-600 text-white border-none shadow-xl">
           <p className="text-green-100 text-[10px] font-black uppercase tracking-widest">Completadas</p>
           <p className="text-4xl font-black mt-1">{globalCompleted}</p>
        </Card>
        <Card className="bg-blue-600 text-white border-none shadow-xl">
           <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest">Cumplimiento Global</p>
           <p className="text-4xl font-black mt-1">{Math.round(globalCompliance)}%</p>
        </Card>
        <Card className="bg-red-600 text-white border-none shadow-xl">
           <p className="text-red-100 text-[10px] font-black uppercase tracking-widest">Pendientes Críticas</p>
           <p className="text-4xl font-black mt-1">{tasks.filter(t => t.status !== TaskStatus.APPROVED && new Date(t.dueDate) < new Date()).length}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Rankings / Individual metrics */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Desempeño Individual" className="shadow-2xl border-none">
            <div className="space-y-6">
              {userMetrics.map(m => (
                <div key={m.user.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-300 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                       <div className={`w-3 h-3 rounded-full ${m.statusColor} shadow-lg shadow-current/20 animate-pulse`} />
                       <p className="font-black text-slate-800 text-lg">{m.user.name}</p>
                    </div>
                    <Badge className="bg-white text-slate-500 border border-slate-200 uppercase text-[10px] font-black">
                      {m.completed}/{m.total} TAREAS
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                       <p className="text-[10px] font-black text-slate-400 uppercase">Cumplimiento</p>
                       <p className="text-xl font-black text-blue-600">{Math.round(m.compliance)}%</p>
                    </div>
                    <div className="text-center">
                       <p className="text-[10px] font-black text-slate-400 uppercase">Atrasos</p>
                       <p className={`text-xl font-black ${m.overdue > 0 ? 'text-red-500' : 'text-slate-400'}`}>{m.overdue}</p>
                    </div>
                    <div className="text-center">
                       <p className="text-[10px] font-black text-slate-400 uppercase">Revisiones</p>
                       <p className="text-xl font-black text-slate-700">{m.totalRevisions}</p>
                    </div>
                  </div>

                  <ProgressBar value={m.compliance} color={m.statusColor} />
                </div>
              ))}
              {operatives.length === 0 && (
                <p className="text-center py-10 text-slate-400 italic">No hay empleados operativos registrados.</p>
              )}
            </div>
          </Card>
        </div>

        {/* AI Insights & Alerts */}
        <div className="space-y-6">
          <Card title="Análisis Inteligente" className="bg-blue-900 text-white border-none shadow-2xl">
             <div className="space-y-6">
                {loadingInsights ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-4 bg-blue-800 rounded w-3/4"></div>
                    <div className="h-4 bg-blue-800 rounded w-5/6"></div>
                    <div className="h-4 bg-blue-800 rounded w-1/2"></div>
                  </div>
                ) : (
                  <div className="text-sm font-medium leading-relaxed text-blue-100 whitespace-pre-line">
                    {insights}
                  </div>
                )}
                <div className="pt-4 border-t border-blue-800">
                   <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-2">Alertas Sugeridas</p>
                   <ul className="space-y-2">
                     {userMetrics.filter(m => m.overdue > 0).map(m => (
                       <li key={m.user.id} className="text-xs bg-red-900/30 p-2 rounded border border-red-800 text-red-100">
                         <strong>{m.user.name.split(' ')[0]}</strong> tiene {m.overdue} tareas vencidas.
                       </li>
                     ))}
                     {userMetrics.filter(m => m.totalRevisions > (m.total * 1.5)).map(m => (
                       <li key={m.user.id} className="text-xs bg-yellow-900/30 p-2 rounded border border-yellow-800 text-yellow-100">
                         Fricción detectada: {m.user.name.split(' ')[0]} requiere muchas correcciones.
                       </li>
                     ))}
                     {userMetrics.every(m => m.overdue === 0 && m.compliance > 80) && userMetrics.length > 0 && (
                       <li className="text-xs bg-green-900/30 p-2 rounded border border-green-800 text-green-100">
                         Todo el equipo al día. Excelente ritmo operativo.
                       </li>
                     )}
                   </ul>
                </div>
             </div>
          </Card>

          <Card title="Distribución por Proyecto">
             <div className="space-y-4">
                {projects.map(p => {
                  const pTasks = tasks.filter(t => t.projectId === p.id);
                  const pComp = pTasks.filter(t => t.status === TaskStatus.APPROVED).length;
                  const pPerc = pTasks.length > 0 ? (pComp / pTasks.length) * 100 : 0;
                  return (
                    <div key={p.id}>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-slate-600 truncate max-w-[150px]">{p.name}</span>
                        <span className="text-slate-400">{Math.round(pPerc)}%</span>
                      </div>
                      <ProgressBar value={pPerc} />
                    </div>
                  );
                })}
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminMetrics;

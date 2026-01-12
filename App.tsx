
import React, { useState, useEffect } from 'react';
import { AppState, User, Project, Task, UserRole, TaskStatus, ProjectStatus, Comment } from './types';
import Layout from './components/Layout';
import { Button, Card, Badge, ProgressBar } from './components/UI';
import { STATUS_COLORS, STATUS_LABELS, Icons, PROJECT_STATUS_LABELS } from './constants';
import { getMotivationalMessage, getAdminInsights } from './geminiService';
import AdminMetrics from './components/AdminMetrics';

const ROOT_ADMIN: User = {
  id: 'root-admin',
  username: 'admin18',
  password: 'PE18_admin_2024',
  name: 'Administrador Root',
  role: UserRole.ADMIN,
  isActive: true,
  mustChangePassword: true,
  isRoot: true
};

const INITIAL_STATE: AppState = {
  currentUser: null,
  users: [ROOT_ADMIN],
  projects: [
    { id: 'p1', name: 'Inventario Escolar 2024', description: 'Revisión y actualización de stock para temporada escolar.', status: ProjectStatus.ACTIVE, createdAt: '2024-03-01', assignedUsers: [], comments: [] },
  ],
  tasks: [],
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('pe18_state_v4');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.users.find((u: User) => u.isRoot)) {
        parsed.users.unshift(ROOT_ADMIN);
      }
      return parsed;
    }
    return INITIAL_STATE;
  });

  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [passwordChangeForm, setPasswordChangeForm] = useState({ newPassword: '', confirmPassword: '' });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [motivation, setMotivation] = useState<string | null>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  
  const [detailProjectId, setDetailProjectId] = useState<string | null>(null);
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    localStorage.setItem('pe18_state_v4', JSON.stringify(state));
  }, [state]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = state.users.find(u => u.username === loginForm.username && u.password === loginForm.password && u.isActive);
    if (user) {
      setState(prev => ({ ...prev, currentUser: user }));
      setLoginForm({ username: '', password: '' });
    } else {
      alert('Credenciales incorrectas');
    }
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordChangeForm.newPassword !== passwordChangeForm.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === prev.currentUser?.id ? { ...u, password: passwordChangeForm.newPassword, mustChangePassword: false } : u),
      currentUser: { ...prev.currentUser!, mustChangePassword: false }
    }));
  };

  const handleLogout = () => {
    setState(prev => ({ ...prev, currentUser: null }));
    setActiveTab('dashboard');
    setDetailProjectId(null);
    setDetailTaskId(null);
  };

  const updateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => {
        if (t.id === taskId) {
          const isAdjustment = newStatus === TaskStatus.REQUIRES_ADJUSTMENT;
          const isApproved = newStatus === TaskStatus.APPROVED;
          return { 
            ...t, 
            status: newStatus, 
            progress: isApproved ? 100 : t.progress,
            updatedAt: new Date().toISOString(),
            completedAt: isApproved ? new Date().toISOString() : t.completedAt,
            revisionsCount: isAdjustment ? t.revisionsCount + 1 : t.revisionsCount
          };
        }
        return t;
      })
    }));

    if (newStatus === TaskStatus.APPROVED || newStatus === TaskStatus.IN_REVIEW) {
      const msg = await getMotivationalMessage(STATUS_LABELS[newStatus]);
      setMotivation(msg);
      setTimeout(() => setMotivation(null), 4000);
    }
  };

  const handleAddComment = (targetId: string, type: 'project' | 'task') => {
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      authorId: state.currentUser!.id,
      authorName: state.currentUser!.name,
      text: newComment,
      createdAt: new Date().toLocaleString()
    };

    setState(prev => {
      if (type === 'project') {
        return {
          ...prev,
          projects: prev.projects.map(p => p.id === targetId ? { ...p, comments: [...(p.comments || []), comment] } : p)
        };
      } else {
        return {
          ...prev,
          tasks: prev.tasks.map(t => t.id === targetId ? { ...t, comments: [...t.comments, comment] } : t)
        };
      }
    });
    setNewComment("");
  };

  const handleAddTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      projectId: formData.get('projectId') as string,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      status: TaskStatus.PENDING,
      assignedTo: formData.get('assignedTo') as string,
      dueDate: formData.get('dueDate') as string,
      comments: [],
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      revisionsCount: 0
    };
    setState(prev => ({ ...prev, tasks: [...prev.tasks, newTask] }));
    setShowTaskModal(false);
  };

  const handleAddProject = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newProject: Project = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      status: ProjectStatus.ACTIVE,
      createdAt: new Date().toISOString().split('T')[0],
      assignedUsers: [],
      comments: []
    };
    setState(prev => ({ ...prev, projects: [...prev.projects, newProject] }));
    setShowProjectModal(false);
  };

  const handleAddUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      username: formData.get('username') as string,
      password: formData.get('username') as string,
      name: formData.get('name') as string,
      role: formData.get('role') as UserRole,
      isActive: true,
      mustChangePassword: true
    };
    setState(prev => ({ ...prev, users: [...prev.users, newUser] }));
    setShowUserModal(false);
  };

  const toggleUserStatus = (userId: string) => {
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === userId && !u.isRoot ? { ...u, isActive: !u.isActive } : u)
    }));
  };

  const resetUserPassword = (userId: string) => {
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === userId ? { ...u, password: u.username, mustChangePassword: true } : u)
    }));
    alert("Contraseña reseteada al nombre de usuario.");
  };

  const isAdmin = state.currentUser?.role === UserRole.ADMIN;
  const filteredTasks = isAdmin ? state.tasks : state.tasks.filter(t => t.assignedTo === state.currentUser?.id);
  const activeProjectsCount = state.projects.filter(p => p.status === ProjectStatus.ACTIVE).length;
  const tasksInReviewCount = state.tasks.filter(t => t.status === TaskStatus.IN_REVIEW).length;
  const tasksPendingCount = filteredTasks.filter(t => t.status !== TaskStatus.APPROVED).length;

  if (!state.currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-blue-800 tracking-tight">P&E de la 18</h1>
            <p className="text-slate-500 mt-2">Gestión Interna de Equipo</p>
          </div>
          <Card className="shadow-2xl border-t-4 border-t-blue-600">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Usuario</label>
                <input type="text" required className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={loginForm.username} onChange={e => setLoginForm(prev => ({ ...prev, username: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Contraseña</label>
                <input type="password" required className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={loginForm.password} onChange={e => setLoginForm(prev => ({ ...prev, password: e.target.value }))} />
              </div>
              <Button type="submit" className="w-full py-4 text-lg font-bold" size="lg">Entrar</Button>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  if (state.currentUser.mustChangePassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl" title="Actualización de Seguridad">
            <p className="text-sm text-slate-500 mb-6">Como es tu primer ingreso, debes cambiar tu contraseña.</p>
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <input type="password" required placeholder="Nueva contraseña" title="Nueva Contraseña" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500" value={passwordChangeForm.newPassword} onChange={e => setPasswordChangeForm(prev => ({ ...prev, newPassword: e.target.value }))} />
              <input type="password" required placeholder="Confirmar contraseña" title="Confirmar Contraseña" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500" value={passwordChangeForm.confirmPassword} onChange={e => setPasswordChangeForm(prev => ({ ...prev, confirmPassword: e.target.value }))} />
              <Button type="submit" className="w-full font-bold">Actualizar Contraseña</Button>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <Layout
      userRole={state.currentUser.role}
      userName={state.currentUser.name}
      onLogout={handleLogout}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      {motivation && (
        <div className="fixed bottom-8 right-8 z-[100] animate-bounce">
          <div className="bg-blue-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 border-2 border-white">
            <div className="bg-white text-blue-600 rounded-full p-1"><Icons.Task /></div>
            <p className="font-bold">{motivation}</p>
          </div>
        </div>
      )}

      {/* DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8 max-w-6xl mx-auto">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">¡Hola, {state.currentUser.name.split(' ')[0]}!</h2>
              <p className="text-slate-500 font-medium">Tienes {tasksPendingCount} tareas activas.</p>
            </div>
            {isAdmin && (
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setShowTaskModal(true)}><Icons.Plus /> <span>Tarea</span></Button>
                <Button onClick={() => setShowProjectModal(true)}><Icons.Plus /> <span>Proyecto</span></Button>
              </div>
            )}
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-blue-600 text-white border-none shadow-xl">
              <p className="text-blue-100 text-sm font-bold uppercase tracking-wider">{isAdmin ? 'Proyectos Activos' : 'Mi Avance'}</p>
              <p className="text-5xl font-black mt-3">{isAdmin ? activeProjectsCount : `${Math.round(filteredTasks.filter(t => t.status === TaskStatus.APPROVED).length / filteredTasks.length * 100 || 0)}%`}</p>
            </Card>
            <Card className="shadow-lg border-slate-100">
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">{isAdmin ? 'Por Revisar' : 'Pendientes'}</p>
              <p className="text-5xl font-black mt-3 text-slate-800">{isAdmin ? tasksInReviewCount : tasksPendingCount}</p>
              <div className="mt-4"><ProgressBar value={isAdmin ? (tasksInReviewCount > 0 ? 50 : 0) : (tasksPendingCount > 0 ? (1 - (tasksPendingCount/filteredTasks.length))*100 : 100)} /></div>
            </Card>
            <Card className="shadow-lg border-slate-100">
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Cumplimiento Global</p>
              <p className="text-5xl font-black mt-3 text-slate-800">{Math.round(state.tasks.filter(t => t.status === TaskStatus.APPROVED).length / state.tasks.length * 100 || 0)}%</p>
              <div className="mt-4"><ProgressBar value={Math.round(state.tasks.filter(t => t.status === TaskStatus.APPROVED).length / state.tasks.length * 100 || 0)} color="bg-green-500" /></div>
            </Card>
          </div>

          <Card title="Listado de Tareas" className="shadow-xl">
            <div className="space-y-4">
              {filteredTasks.length > 0 ? filteredTasks.map(task => (
                <div key={task.id} 
                     onClick={() => setDetailTaskId(task.id)}
                     className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:shadow-lg transition-all cursor-pointer group hover:border-blue-300">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <p className="font-black text-slate-800 text-xl group-hover:text-blue-700">{task.title}</p>
                      <Badge className={STATUS_COLORS[task.status]}>{STATUS_LABELS[task.status]}</Badge>
                    </div>
                    <p className="text-sm text-slate-500 mt-2 font-medium">{task.description}</p>
                    <div className="mt-3 flex items-center space-x-4">
                       <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-50 px-2 py-1 rounded">{state.projects.find(p => p.id === task.projectId)?.name}</span>
                       <span className="text-[10px] font-bold text-red-400 uppercase">Vence: {task.dueDate}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mt-4 md:mt-0">
                    <Button variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">Ver Detalles</Button>
                    {!isAdmin && task.status === TaskStatus.PENDING && (
                      <Button size="sm" onClick={(e) => { e.stopPropagation(); updateTaskStatus(task.id, TaskStatus.IN_PROGRESS); }}>Iniciar</Button>
                    )}
                    {!isAdmin && (task.status === TaskStatus.IN_PROGRESS || task.status === TaskStatus.REQUIRES_ADJUSTMENT) && (
                      <Button size="sm" onClick={(e) => { e.stopPropagation(); updateTaskStatus(task.id, TaskStatus.IN_REVIEW); }}>Completar</Button>
                    )}
                  </div>
                </div>
              )) : (
                <div className="text-center py-12 text-slate-400 italic">No hay tareas pendientes.</div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* METRICS - ADMIN ONLY */}
      {activeTab === 'metrics' && isAdmin && (
        <AdminMetrics 
          tasks={state.tasks} 
          users={state.users} 
          projects={state.projects} 
        />
      )}

      {/* PROJECTS & TASKS - ADMIN VIEW */}
      {activeTab === 'projects' && isAdmin && (
        <div className="space-y-8 max-w-6xl mx-auto">
          <header className="flex justify-between items-center">
            <h2 className="text-3xl font-black text-slate-800">Gestor de Proyectos</h2>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => { setDetailProjectId(null); setShowTaskModal(true); }}><Icons.Plus /> <span>Nueva Tarea</span></Button>
              <Button onClick={() => setShowProjectModal(true)}><Icons.Plus /> <span>Nuevo Proyecto</span></Button>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {state.projects.map(project => {
              const projectTasks = state.tasks.filter(t => t.projectId === project.id);
              const progress = Math.round(projectTasks.filter(t => t.status === TaskStatus.APPROVED).length / projectTasks.length * 100 || 0);
              return (
                <Card key={project.id} 
                      className={`hover:border-blue-500 transition-all cursor-pointer group shadow-lg hover:shadow-2xl border-2 ${detailProjectId === project.id ? 'border-blue-600' : 'border-transparent'}`} 
                      onClick={() => setDetailProjectId(project.id)}>
                  <div className="flex justify-between items-center mb-4">
                    <Badge className="bg-blue-50 text-blue-700">{PROJECT_STATUS_LABELS[project.status]}</Badge>
                    <span className="text-[10px] font-black text-slate-300 uppercase">{project.createdAt}</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 group-hover:text-blue-700 leading-tight">{project.name}</h3>
                  <p className="text-sm text-slate-500 mt-2 line-clamp-2 font-medium">{project.description}</p>
                  <div className="mt-8 space-y-3">
                    <div className="flex justify-between items-end">
                       <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{projectTasks.length} TAREAS</span>
                       <span className="text-lg font-black text-slate-700">{progress}%</span>
                    </div>
                    <ProgressBar value={progress} color="bg-green-500" />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* USERS - ADMIN VIEW */}
      {activeTab === 'users' && isAdmin && (
        <div className="space-y-8 max-w-6xl mx-auto">
          <header className="flex justify-between items-center">
            <h2 className="text-3xl font-black text-slate-800">Personal del Equipo</h2>
            <Button onClick={() => setShowUserModal(true)}><Icons.Plus /> <span>Registrar Colaborador</span></Button>
          </header>
          <Card className="!p-0 shadow-2xl border-none">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Nombre</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Usuario</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {state.users.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-8 py-6 flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-blue-200">{user.name[0]}</div>
                      <div>
                        <p className="font-black text-slate-800">{user.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{user.role}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <Badge className={user.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}>{user.username}</Badge>
                    </td>
                    <td className="px-8 py-6 text-right space-x-2">
                      <Button variant="secondary" size="sm" onClick={() => toggleUserStatus(user.id)} disabled={user.isRoot}>Estatus</Button>
                      <Button variant="ghost" size="sm" onClick={() => resetUserPassword(user.id)}>Reset Pass</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* --- DETAIL MODALS (Monday.com style) --- */}

      {/* PROJECT DETAILS POPUP */}
      {detailProjectId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-end bg-slate-900/60 p-0 md:p-10 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full h-full max-w-4xl bg-white md:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right-20 duration-500">
            {/* Header */}
            <header className="p-8 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                   <Badge className="bg-blue-600 text-white px-3 py-1">PROYECTO</Badge>
                   <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{state.projects.find(p => p.id === detailProjectId)?.createdAt}</span>
                </div>
                <h3 className="text-4xl font-black text-slate-800">{state.projects.find(p => p.id === detailProjectId)?.name}</h3>
                <p className="text-slate-500 mt-2 font-medium">{state.projects.find(p => p.id === detailProjectId)?.description}</p>
              </div>
              <button onClick={() => setDetailProjectId(null)} className="text-slate-400 hover:text-slate-800 transition-colors p-2 bg-white rounded-xl border border-slate-200 shadow-sm"><Icons.Logout /></button>
            </header>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Tasks */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center">
                  <h4 className="text-xl font-black text-slate-800">Tareas del Proyecto</h4>
                  {isAdmin && (
                    <Button variant="secondary" size="sm" onClick={() => setShowTaskModal(true)}>+ Nueva Tarea</Button>
                  )}
                </div>
                <div className="space-y-3">
                  {state.tasks.filter(t => t.projectId === detailProjectId).map(task => (
                    <div key={task.id} 
                         onClick={() => setDetailTaskId(task.id)}
                         className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:bg-white hover:shadow-md transition-all cursor-pointer group">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${task.status === TaskStatus.APPROVED ? 'bg-green-500' : 'bg-blue-500'}`} />
                        <div>
                          <p className="font-bold text-slate-700 leading-none">{task.title}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase mt-1">{state.users.find(u => u.id === task.assignedTo)?.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {isAdmin && task.status === TaskStatus.IN_REVIEW && (
                           <div className="flex gap-1">
                             <Button size="sm" variant="primary" className="text-[10px] px-2 py-1" onClick={(e) => { e.stopPropagation(); updateTaskStatus(task.id, TaskStatus.APPROVED); }}>✓</Button>
                             <Button size="sm" variant="danger" className="text-[10px] px-2 py-1" onClick={(e) => { e.stopPropagation(); updateTaskStatus(task.id, TaskStatus.REQUIRES_ADJUSTMENT); }}>✕</Button>
                           </div>
                        )}
                        <Badge className={STATUS_COLORS[task.status]}>{STATUS_LABELS[task.status]}</Badge>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 text-[10px]">Ver</Button>
                      </div>
                    </div>
                  ))}
                  {state.tasks.filter(t => t.projectId === detailProjectId).length === 0 && (
                    <p className="text-center py-10 text-slate-400 italic bg-slate-50 border border-dashed rounded-2xl">No hay tareas asignadas.</p>
                  )}
                </div>
              </div>

              {/* Right Column: Comments & Info */}
              <div className="space-y-8">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <h4 className="text-sm font-black text-slate-400 uppercase mb-4 tracking-widest">Conversación</h4>
                  <div className="space-y-4 max-h-96 overflow-y-auto mb-4 pr-2">
                    {state.projects.find(p => p.id === detailProjectId)?.comments?.map(c => (
                      <div key={c.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                        <p className="text-xs font-black text-blue-600 mb-1">{c.authorName}</p>
                        <p className="text-sm text-slate-600 leading-tight">{c.text}</p>
                        <p className="text-[9px] text-slate-300 mt-2 text-right uppercase font-bold">{c.createdAt}</p>
                      </div>
                    ))}
                    {(state.projects.find(p => p.id === detailProjectId)?.comments?.length || 0) === 0 && (
                       <p className="text-xs text-slate-400 text-center italic py-4">Sin mensajes todavía.</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Escribe un mensaje..." 
                           className="flex-1 text-sm px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500" 
                           value={newComment} onChange={e => setNewComment(e.target.value)} 
                           onKeyPress={e => e.key === 'Enter' && handleAddComment(detailProjectId!, 'project')} />
                    <Button onClick={() => handleAddComment(detailProjectId!, 'project')} size="sm">Enviar</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TASK DETAILS POPUP */}
      {detailTaskId && (() => {
        const task = state.tasks.find(t => t.id === detailTaskId);
        if (!task) return null;

        const isAssigned = state.currentUser?.id === task.assignedTo;
        const canStatusBeChangedByMe = (s: TaskStatus) => {
          if (isAdmin) return true;
          // Prompt logic: users update their assigned tasks except for Ajustes (REQUIRES_ADJUSTMENT) and Aprobada (APPROVED)
          if (isAssigned) {
            return s === TaskStatus.PENDING || s === TaskStatus.IN_PROGRESS || s === TaskStatus.IN_REVIEW;
          }
          return false;
        };

        return (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
              <header className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                 <div className="flex items-center space-x-3">
                   <Badge className={STATUS_COLORS[task.status]}>TAREA</Badge>
                   <span className="font-black text-slate-800 uppercase tracking-widest text-xs">Información Detallada</span>
                 </div>
                 <button onClick={() => setDetailTaskId(null)} className="text-slate-400 hover:text-slate-800 transition-colors p-2"><Icons.Logout /></button>
              </header>
              <div className="p-8 space-y-8 overflow-y-auto max-h-[80vh]">
                 <div>
                    <h3 className="text-3xl font-black text-slate-800">{task.title}</h3>
                    <p className="text-slate-500 mt-4 text-lg font-medium bg-slate-50 p-6 rounded-2xl border-l-4 border-blue-600 italic">
                      {task.description}
                    </p>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                       <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Responsable</p>
                       <p className="font-bold text-slate-700">{state.users.find(u => u.id === task.assignedTo)?.name}</p>
                    </div>
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                       <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Fecha de Entrega</p>
                       <p className="font-bold text-red-500">{task.dueDate}</p>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Actualizar Estatus</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.values(TaskStatus).map(st => {
                        const isModifiable = canStatusBeChangedByMe(st);
                        const isCurrent = task.status === st;
                        return (
                          <button key={st} 
                                  disabled={!isModifiable}
                                  onClick={() => updateTaskStatus(detailTaskId!, st)}
                                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all border-2 
                                    ${isCurrent 
                                      ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md' 
                                      : isModifiable 
                                        ? 'border-transparent bg-slate-100 text-slate-500 hover:bg-blue-100 hover:text-blue-600 hover:border-blue-300' 
                                        : 'border-transparent bg-slate-50 text-slate-300 cursor-not-allowed grayscale'}`}>
                            {STATUS_LABELS[st]}
                          </button>
                        );
                      })}
                    </div>
                    {!isAdmin && !isAssigned && <p className="text-[10px] text-orange-400 font-bold">Solo el responsable puede actualizar el progreso.</p>}
                    {!isAdmin && isAssigned && <p className="text-[10px] text-blue-400 font-bold">Ajustes y Aprobación requieren revisión administrativa.</p>}
                 </div>

                 <div className="border-t border-slate-100 pt-8">
                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Instrucciones & Feedback</h4>
                    <div className="space-y-4 mb-6">
                      {task.comments.map(c => (
                        <div key={c.id} className="flex space-x-4">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xs shrink-0">{c.authorName[0]}</div>
                          <div className="flex-1 bg-slate-50 p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm">
                             <p className="text-xs font-black text-slate-800 mb-1">{c.authorName}</p>
                             <p className="text-sm text-slate-600 font-medium leading-relaxed">{c.text}</p>
                             <p className="text-[8px] font-black text-slate-300 mt-2 text-right uppercase">{c.createdAt}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input type="text" placeholder="Añadir una nota o instrucción..." 
                             className="flex-1 px-6 py-4 rounded-2xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                             value={newComment} onChange={e => setNewComment(e.target.value)}
                             onKeyPress={e => e.key === 'Enter' && handleAddComment(detailTaskId!, 'task')} />
                      <Button onClick={() => handleAddComment(detailTaskId!, 'task')} size="lg" className="rounded-2xl">Enviar</Button>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* OTHER MODALS */}
      {showProjectModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="w-full max-w-lg shadow-2xl" title="Nuevo Proyecto Estratégico">
            <form onSubmit={handleAddProject} className="space-y-4">
              <input name="name" required placeholder="Nombre del proyecto" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500" />
              <textarea name="description" required placeholder="Descripción técnica y objetivos..." className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 h-32" />
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
                <Button variant="secondary" type="button" onClick={() => setShowProjectModal(false)}>Cancelar</Button>
                <Button type="submit">Crear Proyecto</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {showTaskModal && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="w-full max-w-lg shadow-2xl" title="Asignar Tarea Operativa">
            <form onSubmit={handleAddTask} className="space-y-4">
              <select name="projectId" defaultValue={detailProjectId || ""} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-blue-500">
                <option value="" disabled>Seleccionar Proyecto...</option>
                {state.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <input name="title" required placeholder="Título de la tarea" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500" />
              <textarea name="description" required placeholder="Instrucciones claras..." className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 h-24" />
              <div className="grid grid-cols-2 gap-4">
                <select name="assignedTo" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-blue-500">
                  {state.users.filter(u => u.role === UserRole.USER).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
                <input type="date" name="dueDate" required className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
                <Button variant="secondary" type="button" onClick={() => setShowTaskModal(false)}>Cancelar</Button>
                <Button type="submit">Asignar Tarea</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {showUserModal && (
        <div className="fixed inset-0 z-[170] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="w-full max-w-md shadow-2xl" title="Nuevo Colaborador">
            <form onSubmit={handleAddUser} className="space-y-4">
              <input name="name" required placeholder="Nombre completo" className="w-full px-4 py-3 rounded-xl border border-slate-200" />
              <input name="username" required placeholder="Nombre de usuario" className="w-full px-4 py-3 rounded-xl border border-slate-200" />
              <select name="role" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white">
                <option value={UserRole.USER}>Usuario Operativo</option>
                <option value={UserRole.ADMIN}>Administrador</option>
              </select>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
                <Button variant="secondary" type="button" onClick={() => setShowUserModal(false)}>Cancelar</Button>
                <Button type="submit">Registrar</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </Layout>
  );
};

export default App;

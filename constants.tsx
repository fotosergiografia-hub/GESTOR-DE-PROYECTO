
import React from 'react';
import { TaskStatus, ProjectStatus } from './types';

export const COLORS = {
  primary: '#1E40AF', // Blue 800
  secondary: '#3B82F6', // Blue 500
  background: '#F8FAFC',
  text: '#1E293B'
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.PENDING]: 'Pendiente',
  [TaskStatus.IN_PROGRESS]: 'En Proceso',
  [TaskStatus.IN_REVIEW]: 'En Revisión',
  [TaskStatus.REQUIRES_ADJUSTMENT]: 'Ajustes',
  [TaskStatus.APPROVED]: 'Aprobada'
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  [TaskStatus.PENDING]: 'bg-gray-100 text-gray-600',
  [TaskStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-600',
  [TaskStatus.IN_REVIEW]: 'bg-yellow-100 text-yellow-700',
  [TaskStatus.REQUIRES_ADJUSTMENT]: 'bg-orange-100 text-orange-600',
  [TaskStatus.APPROVED]: 'bg-green-100 text-green-600'
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  [ProjectStatus.ACTIVE]: 'Activo',
  [ProjectStatus.COMPLETED]: 'Completado',
  [ProjectStatus.ON_HOLD]: 'En Pausa'
};

export const Icons = {
  Project: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
    </svg>
  ),
  Task: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  Users: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a7 7 0 00-7 7v1h11v-1a7 7 0 00-7-7z" />
    </svg>
  ),
  Logout: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
    </svg>
  ),
  Plus: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
  )
};

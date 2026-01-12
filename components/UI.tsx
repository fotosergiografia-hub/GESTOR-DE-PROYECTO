
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
    danger: 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100',
    ghost: 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg font-semibold'
  };

  return (
    <button 
      className={`rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center space-x-2 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const Badge: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}>
    {children}
  </span>
);

// Added onClick prop to the Card interface and applied it to the root div to support interactivity
export const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string; onClick?: () => void }> = ({ children, className = '', title, onClick }) => (
  <div 
    className={`bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm ${className}`}
    onClick={onClick}
  >
    {title && (
      <div className="px-6 py-4 border-b border-slate-100">
        <h3 className="font-semibold text-slate-800">{title}</h3>
      </div>
    )}
    <div className="p-6">
      {children}
    </div>
  </div>
);

export const ProgressBar: React.FC<{ value: number; color?: string }> = ({ value, color = 'bg-blue-600' }) => (
  <div className="w-full bg-slate-100 rounded-full h-2">
    <div 
      className={`${color} h-2 rounded-full transition-all duration-500`} 
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

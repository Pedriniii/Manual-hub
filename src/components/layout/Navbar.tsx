import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { 
  BookOpen, 
  LayoutDashboard, 
  Plus, 
  History, 
  LogOut, 
  ShieldCheck,
  Users as UsersIcon
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;
  const canManageUsers = user?.role === 'superadmin' || user?.role === 'admin' || user?.permissions?.can_manage_users;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand logo & Navigation */}
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                ManualHub
              </span>
              <span className="text-[10px] text-slate-400 block -mt-1 font-medium">Manuais Técnicos PDF</span>
            </div>
          </Link>

          {/* Admin Navigation */}
          {user && (
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                to="/"
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/') 
                    ? 'bg-slate-100 text-blue-700' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/logs"
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/logs') 
                    ? 'bg-slate-100 text-blue-700' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <History className="w-4 h-4" />
                <span>Logs de Acesso</span>
              </Link>

              {canManageUsers && (
                <Link
                  to="/users"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/users') 
                      ? 'bg-slate-100 text-blue-700' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <UsersIcon className="w-4 h-4" />
                  <span>Usuários</span>
                </Link>
              )}
            </nav>
          )}
        </div>

        {/* Right: Actions & User Info */}
        <div className="flex items-center space-x-3">
          {user ? (
            <>
              {user.permissions?.can_edit !== false && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/manuals/new')}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Novo Manual
                </Button>
              )}

              <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

              <div className="flex items-center space-x-2 pl-1">
                <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-semibold text-xs shrink-0">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-semibold text-slate-800 truncate max-w-[140px]">
                    {user.name || user.email}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate capitalize">
                    {user.role === 'superadmin' ? 'Super Admin' : user.role}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => logout()}
                  title="Sair da Conta"
                  className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 ml-1"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <Link to="/login">
              <Button variant="outline" size="sm" icon={<ShieldCheck className="w-4 h-4" />}>
                Área Administrativa
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

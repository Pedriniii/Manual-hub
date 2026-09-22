import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/common/Card';
import { BookOpen, Lock, User as UserIcon, ShieldAlert, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { loginWithEmail } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      await loginWithEmail(email, password);
      navigate('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao realizar login. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Top Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30 mb-2">
            <BookOpen className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">ManualHub</h1>
          <p className="text-xs text-slate-400">Sistema de Gestão & Armazenamento de Manuais Técnicos</p>
        </div>

        {/* Login Card */}
        <Card className="bg-slate-900 border-slate-800 shadow-2xl">
          <CardHeader className="border-slate-800 text-center pb-2">
            <CardTitle className="text-white text-lg">Acesso Administrativo</CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              Informe suas credenciais registradas no banco Neon PostgreSQL
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4 space-y-4">
            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center space-x-2 text-rose-300 text-xs">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Usuário ou E-mail
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Digite seu usuário (ex: SUP)"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md mt-2"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Entrar no Painel
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

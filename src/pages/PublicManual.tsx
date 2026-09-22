import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchPublicLinkByToken, recordAccessLog } from '../lib/api';
import { PublicLink, Manual } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';
import { PdfViewer } from '../components/pdf/PdfViewer';
import { 
  BookOpen, 
  Download, 
  Eye, 
  Lock, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2,
  FileText,
  ShieldAlert,
  Building2,
  FolderGit2
} from 'lucide-react';

export const PublicManual: React.FC = () => {
  const { token } = useParams<{ token: string }>();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ link: PublicLink; manual: Manual } | null>(null);

  // Password Protection Gate
  const [passwordInput, setPasswordInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // View state
  const [hasLoggedView, setHasLoggedView] = useState(false);

  useEffect(() => {
    if (!token) return;

    fetchPublicLinkByToken(token).then((result) => {
      setData(result);
      if (result && !result.link.password_hash) {
        setIsUnlocked(true);
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [token]);

  // Record VIEW event on load / unlock
  useEffect(() => {
    if (data && isUnlocked && !hasLoggedView) {
      const isExpired = data.link.expires_at && new Date(data.link.expires_at) < new Date();
      if (data.link.active && !isExpired) {
        recordAccessLog(data.link.id, 'view');
        setHasLoggedView(true);
      }
    }
  }, [data, isUnlocked, hasLoggedView]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.link.password_hash) return;

    if (passwordInput === data.link.password_hash) {
      setIsUnlocked(true);
      setPasswordError('');
    } else {
      setPasswordError('Senha incorreta. Verifique com a construtora emissora.');
    }
  };

  const handleDownload = () => {
    if (!data) return;
    recordAccessLog(data.link.id, 'download');

    if (data.manual.signed_url) {
      const link = document.createElement('a');
      link.href = data.manual.signed_url;
      link.download = `${data.manual.title.replace(/[^a-zA-Z0-9]/g, '_')}_${data.manual.revision}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-white">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
        <h2 className="text-lg font-semibold">Carregando Manual Técnico...</h2>
        <p className="text-xs text-slate-400 mt-1">Verificando token de segurança</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8 space-y-4">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Link não encontrado</h2>
          <p className="text-sm text-slate-500">
            O token do manual é inválido ou foi removido do sistema.
          </p>
        </Card>
      </div>
    );
  }

  const { link, manual } = data;
  const isExpired = link.expires_at && new Date(link.expires_at) < new Date();
  const isInactive = !link.active || isExpired;

  // Inactive / Expired State UI
  if (isInactive) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8 space-y-4 shadow-xl">
          <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Link Indisponível ou Expirado</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            {isExpired 
              ? `Este link de acesso expirou no dia ${new Date(link.expires_at!).toLocaleDateString('pt-BR')}.` 
              : 'Este link de acesso foi temporariamente desativado pela construtora.'}
          </p>
          <p className="text-xs text-slate-400 pt-2 border-t border-slate-100">
            Entre em contato com <strong>{manual.company}</strong> para solicitar um novo link de compartilhamento.
          </p>
        </Card>
      </div>
    );
  }

  // Password Protection Form UI
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-slate-800 border-slate-700 text-white p-6 shadow-2xl">
          <div className="text-center space-y-3 mb-6">
            <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold">Manual Protegido por Senha</h2>
            <p className="text-xs text-slate-400">
              Digite a senha de acesso fornecida por <strong>{manual.company}</strong>
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {passwordError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs">
                {passwordError}
              </div>
            )}

            <div>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Digite a senha"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full">
              Acessar Manual
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  // MAIN PUBLIC VISITOR VIEW (EXPANDED AMPLE LAYOUT)
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-900">
      {/* Top Header Banner */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo & Construtora info */}
          <div className="flex items-center space-x-3.5 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {manual.company}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-300 flex items-center gap-1">
                  <FolderGit2 className="w-3.5 h-3.5 text-slate-400" />
                  {manual.project}
                </span>
              </div>
              <h1 className="text-lg font-bold text-white truncate max-w-2xl mt-0.5">
                {manual.title}
              </h1>
            </div>
          </div>

          {/* Action Buttons: Visualizar / Baixar */}
          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <Badge variant="default" size="md" className="bg-blue-500/20 text-blue-300 border-blue-500/40 hidden md:inline-flex">
              Revisão {manual.revision}
            </Badge>

            <Button
              variant="primary"
              size="md"
              onClick={handleDownload}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold"
              icon={<Download className="w-4 h-4" />}
            >
              Baixar PDF Completo
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area - Full Width & Maximum Height */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto px-2 sm:px-6 lg:px-8 py-4 space-y-3">
        {/* Document verification banner */}
        <div className="bg-slate-900/90 text-slate-300 p-3 px-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-400" />
              Documento Técnico Oficial em Alta Resolução
            </span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden sm:inline">Revisão Vigente: <strong className="text-blue-400">{manual.revision}</strong></span>
          </div>

          <div className="flex items-center space-x-2 text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4" />
            <span>Documento Verificado por ManualHub</span>
          </div>
        </div>

        {/* Embedded Interactive PDF Viewer with Tall Height */}
        <PdfViewer
          url={manual.signed_url}
          title={manual.title}
          revision={manual.revision}
          onDownload={handleDownload}
        />
      </main>

      {/* Clean Public Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-3 text-center text-xs text-slate-400">
        <p>Disponibilizado via <strong className="text-slate-200">ManualHub</strong> por {manual.company}</p>
      </footer>
    </div>
  );
};

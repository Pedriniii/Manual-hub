import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchManualById, addManualVersion, togglePublicLinkStatus } from '../lib/api';
import { Layout } from '../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { PdfViewer } from '../components/pdf/PdfViewer';
import { GenerateLinkModal } from '../components/links/GenerateLinkModal';
import { formatDateUTC, formatDateShort } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, 
  Link2, 
  UploadCloud, 
  History, 
  FileText, 
  Building2, 
  FolderGit2, 
  Download, 
  Eye, 
  Check, 
  Copy, 
  Clock, 
  Loader2,
  Lock,
  Globe,
  AlertCircle
} from 'lucide-react';

export const ManualDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'preview' | 'versions' | 'links'>('preview');
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);

  // New Version Form State
  const [newRevisionCode, setNewRevisionCode] = useState('');
  const [newVersionFile, setNewVersionFile] = useState<File | null>(null);
  const [isSubmittingVersion, setIsSubmittingVersion] = useState(false);
  const [versionError, setVersionError] = useState('');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Fetch Manual details
  const { data, isLoading, isError } = useQuery({
    queryKey: ['manual-detail', id],
    queryFn: () => fetchManualById(id!),
    enabled: Boolean(id),
  });

  const manual = data?.manual;
  const versions = data?.versions || [];
  const links = data?.links || [];

  const handleUploadNewVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newVersionFile || !newRevisionCode.trim()) {
      setVersionError('Por favor selecione o arquivo PDF e informe a nova revisão.');
      return;
    }

    setIsSubmittingVersion(true);
    setVersionError('');

    try {
      await addManualVersion({
        manual_id: id,
        revision: newRevisionCode.trim(),
        file: newVersionFile,
      }, user?.id);

      setIsVersionModalOpen(false);
      setNewRevisionCode('');
      setNewVersionFile(null);
      queryClient.invalidateQueries({ queryKey: ['manual-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['manuals'] });
    } catch (err: any) {
      setVersionError(err.message || 'Erro ao enviar nova versão.');
    } finally {
      setIsSubmittingVersion(false);
    }
  };

  const handleToggleLink = async (linkId: string, currentActive: boolean) => {
    try {
      await togglePublicLinkStatus(linkId, !currentActive);
      queryClient.invalidateQueries({ queryKey: ['manual-detail', id] });
    } catch (err: any) {
      alert(`Erro ao alterar status do link: ${err.message}`);
    }
  };

  const handleCopyLink = (token: string) => {
    const fullUrl = `${window.location.origin}/m/${token}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="py-16 text-center text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-600" />
          <p className="font-medium">Carregando detalhes do manual...</p>
        </div>
      </Layout>
    );
  }

  if (isError || !manual) {
    return (
      <Layout>
        <div className="max-w-md mx-auto text-center py-16 space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Manual não encontrado</h2>
          <p className="text-sm text-slate-500">O manual solicitado não existe ou foi removido.</p>
          <Button variant="primary" onClick={() => navigate('/')}>
            Voltar ao Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Back navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Voltar ao Dashboard
          </Button>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsVersionModalOpen(true)}
              icon={<UploadCloud className="w-4 h-4 text-blue-600" />}
            >
              Nova Revisão
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsLinkModalOpen(true)}
              icon={<Link2 className="w-4 h-4" />}
            >
              Gerar Link Público
            </Button>
          </div>
        </div>

        {/* Top Header Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-2 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="default" size="md">
                    Revisão Atual: {manual.revision}
                  </Badge>
                  <span className="text-xs text-slate-400 font-mono">
                    ({versions.length} {versions.length === 1 ? 'revisão cadastrada' : 'revisões no histórico'})
                  </span>
                </div>

                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{manual.title}</h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 font-medium pt-1">
                  <div className="flex items-center space-x-1.5">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span>{manual.company}</span>
                  </div>
                  <span className="text-slate-300">•</span>
                  <div className="flex items-center space-x-1.5">
                    <FolderGit2 className="w-4 h-4 text-slate-400" />
                    <span>{manual.project}</span>
                  </div>
                  <span className="text-slate-300">•</span>
                  <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Atualizado em: {formatDateUTC(manual.updated_at)}</span>
                  </div>
                </div>

                {manual.description && (
                  <p className="text-sm text-slate-500 mt-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {manual.description}
                  </p>
                )}
              </div>

              {/* Direct Download Button */}
              {manual.signed_url && (
                <a href={manual.signed_url} download target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm" icon={<Download className="w-4 h-4 text-slate-600" />}>
                    Baixar PDF Atual
                  </Button>
                </a>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center space-x-2 py-3 px-5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'preview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Visualização do PDF</span>
          </button>

          <button
            onClick={() => setActiveTab('versions')}
            className={`flex items-center space-x-2 py-3 px-5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'versions'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Histórico de Revisões ({versions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('links')}
            className={`flex items-center space-x-2 py-3 px-5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'links'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Link2 className="w-4 h-4" />
            <span>Links Públicos Gerados ({links.length})</span>
          </button>
        </div>

        {/* TAB 1: PDF PREVIEW */}
        {activeTab === 'preview' && (
          <PdfViewer
            url={manual.signed_url}
            title={manual.title}
            revision={manual.revision}
            onDownload={() => {
              if (manual.signed_url) {
                window.open(manual.signed_url, '_blank');
              }
            }}
            height="650px"
          />
        )}

        {/* TAB 2: VERSION HISTORY */}
        {activeTab === 'versions' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Histórico de Versões do Manual</CardTitle>
                <CardDescription>
                  Todas as versões enviadas são preservadas permanentemente. O link público sempre aponta para a revisão atual.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsVersionModalOpen(true)}
                icon={<UploadCloud className="w-4 h-4 text-blue-600" />}
              >
                Enviar Nova Revisão
              </Button>
            </CardHeader>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-6">Código da Revisão</th>
                    <th className="py-3 px-4">Data do Envio (UTC)</th>
                    <th className="py-3 px-4">Caminho de Armazenamento</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-6 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {versions.map((ver, idx) => {
                    const isLatest = ver.revision === manual.revision;
                    return (
                      <tr key={ver.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-6 font-mono font-semibold text-slate-900">
                          {ver.revision}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 text-xs">
                          {formatDateUTC(ver.uploaded_at)}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono text-xs max-w-xs truncate">
                          {ver.storage_path}
                        </td>
                        <td className="py-3.5 px-4">
                          {isLatest ? (
                            <Badge variant="success" size="sm">Atual (Versão ativa)</Badge>
                          ) : (
                            <Badge variant="secondary" size="sm">Histórica</Badge>
                          )}
                        </td>
                        <td className="py-3.5 px-6 text-right whitespace-nowrap">
                          {ver.signed_url && (
                            <a href={ver.signed_url} target="_blank" rel="noreferrer">
                              <Button variant="ghost" size="sm" icon={<Download className="w-3.5 h-3.5" />}>
                                Baixar
                              </Button>
                            </a>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* TAB 3: PUBLIC LINKS */}
        {activeTab === 'links' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Links Públicos Ativos e Inativos</CardTitle>
                <CardDescription>
                  Links públicos permitem que clientes e construtoras visualizem e baixem o PDF sem precisar de login.
                </CardDescription>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsLinkModalOpen(true)}
                icon={<Link2 className="w-4 h-4" />}
              >
                Gerar Novo Link
              </Button>
            </CardHeader>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-6">Token / URL</th>
                    <th className="py-3 px-4">Tipo / Validade</th>
                    <th className="py-3 px-4">Proteção</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Criado em</th>
                    <th className="py-3 px-6 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {links.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Nenhum link público foi gerado para este manual até o momento.
                      </td>
                    </tr>
                  ) : (
                    links.map((link) => {
                      const fullUrl = `${window.location.origin}/m/${link.token}`;
                      const isExpired = link.expires_at && new Date(link.expires_at) < new Date();

                      return (
                        <tr key={link.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-6 font-mono text-xs">
                            <span className="font-semibold text-blue-600">/m/{link.token}</span>
                          </td>
                          <td className="py-3.5 px-4 text-xs">
                            {link.expires_at ? (
                              <span className={isExpired ? 'text-rose-600 font-medium' : 'text-slate-600'}>
                                {isExpired ? 'Expirou em: ' : 'Expira em: '}
                                {formatDateShort(link.expires_at)}
                              </span>
                            ) : (
                              <Badge variant="secondary" size="sm" className="gap-1">
                                <Globe className="w-3 h-3 text-blue-500" />
                                Permanente
                              </Badge>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-xs">
                            {link.password_hash ? (
                              <Badge variant="warning" size="sm" className="gap-1">
                                <Lock className="w-3 h-3" /> Protegido
                              </Badge>
                            ) : (
                              <span className="text-slate-400">Livre</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => handleToggleLink(link.id, link.active)}
                              className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                                link.active && !isExpired
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${link.active && !isExpired ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                              <span>{link.active && !isExpired ? 'Ativo' : isExpired ? 'Expirado' : 'Inativo'}</span>
                            </button>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-500">
                            {formatDateShort(link.created_at)}
                          </td>
                          <td className="py-3.5 px-6 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant={copiedToken === link.token ? 'primary' : 'outline'}
                                size="sm"
                                onClick={() => handleCopyLink(link.token)}
                                icon={copiedToken === link.token ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              >
                                {copiedToken === link.token ? 'Copiado!' : 'Copiar URL'}
                              </Button>

                              <a href={fullUrl} target="_blank" rel="noreferrer">
                                <Button variant="ghost" size="sm" icon={<Eye className="w-3.5 h-3.5" />}>
                                  Abrir
                                </Button>
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Modal Nova Revisão */}
      <Modal
        isOpen={isVersionModalOpen}
        onClose={() => setIsVersionModalOpen(false)}
        title="Enviar Nova Revisão do Manual"
        description={`Atualizar o arquivo PDF mantendo o histórico de versões anteriores para "${manual.title}"`}
      >
        <form onSubmit={handleUploadNewVersion} className="space-y-4">
          {versionError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs">
              {versionError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Código da Nova Revisão *
            </label>
            <input
              type="text"
              required
              value={newRevisionCode}
              onChange={(e) => setNewRevisionCode(e.target.value)}
              placeholder="Ex: v1.3 ou Rev B"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 font-mono outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Novo Arquivo PDF *
            </label>
            <input
              type="file"
              required
              accept=".pdf,application/pdf"
              onChange={(e) => setNewVersionFile(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 outline-none"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsVersionModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmittingVersion} icon={<UploadCloud className="w-4 h-4" />}>
              Salvar Revisão
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Gerar Link */}
      <GenerateLinkModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        manualId={manual.id}
        manualTitle={manual.title}
        onLinkCreated={() => queryClient.invalidateQueries({ queryKey: ['manual-detail', id] })}
      />
    </Layout>
  );
};

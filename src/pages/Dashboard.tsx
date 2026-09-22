import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { fetchDashboardStats, fetchManuals } from '../lib/api';
import { Layout } from '../components/layout/Layout';
import { Card, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { SearchInput } from '../components/common/SearchInput';
import { GenerateLinkModal } from '../components/links/GenerateLinkModal';
import { formatDateShort } from '../lib/utils';
import { 
  BookOpen, 
  Link2, 
  Eye, 
  Download, 
  Plus, 
  FileText, 
  Building2, 
  FolderGit2, 
  ChevronRight,
  ExternalLink,
  Loader2
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLinkModal, setSelectedLinkModal] = useState<{ id: string; title: string } | null>(null);

  // Queries
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
  });

  const { data: manuals = [], isLoading: isManualsLoading, refetch } = useQuery({
    queryKey: ['manuals', searchQuery],
    queryFn: () => fetchManuals(searchQuery),
  });

  return (
    <Layout>
      <div className="space-y-8">
        {/* Top Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Painel de Manuais Técnicos</h1>
            <p className="text-sm text-slate-500 mt-1">
              Gerencie, versione e compartilhe manuais de construtoras com links diretos seguros.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/manuals/new')}
            icon={<Plus className="w-4 h-4" />}
          >
            Novo Manual
          </Button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:border-blue-300 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Total de Manuais</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {isStatsLoading ? <Loader2 className="w-5 h-5 animate-spin text-blue-600" /> : stats?.totalManuals || 0}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <BookOpen className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:border-blue-300 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Links Ativos</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {isStatsLoading ? <Loader2 className="w-5 h-5 animate-spin text-blue-600" /> : stats?.activeLinks || 0}
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Link2 className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:border-blue-300 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Visualizações</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {isStatsLoading ? <Loader2 className="w-5 h-5 animate-spin text-blue-600" /> : stats?.totalViews || 0}
                  </p>
                </div>
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Eye className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:border-blue-300 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Downloads</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {isStatsLoading ? <Loader2 className="w-5 h-5 animate-spin text-blue-600" /> : stats?.totalDownloads || 0}
                  </p>
                </div>
                <div className="p-3 bg-violet-50 text-violet-600 rounded-xl">
                  <Download className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Manuals Listing Section */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/90 shadow-subtle">
            <div className="w-full md:w-96">
              <SearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery('')}
              />
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Exibindo <strong>{manuals.length}</strong> {manuals.length === 1 ? 'manual' : 'manuais'}
            </div>
          </div>

          {/* Table Card */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4 sm:px-6">Título do Manual</th>
                    <th className="py-3.5 px-4">Construtora</th>
                    <th className="py-3.5 px-4">Empreendimento</th>
                    <th className="py-3.5 px-4 text-center">Revisão</th>
                    <th className="py-3.5 px-4">Última Atualização</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {isManualsLoading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                        Carregando lista de manuais...
                      </td>
                    </tr>
                  ) : manuals.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        <FileText className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                        <p className="font-semibold text-slate-700">Nenhum manual encontrado</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {searchQuery ? 'Tente buscar com outros termos.' : 'Clique em "Novo Manual" para cadastrar o primeiro PDF.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    manuals.map((manual) => (
                      <tr
                        key={manual.id}
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        onClick={() => navigate(`/manuals/${manual.id}`)}
                      >
                        <td className="py-4 px-4 sm:px-6 font-medium text-slate-900 max-w-xs">
                          <div className="flex items-start space-x-3">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0 mt-0.5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="truncate">
                              <span className="truncate block font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                                {manual.title}
                              </span>
                              {manual.description && (
                                <span className="text-xs text-slate-400 truncate block mt-0.5">
                                  {manual.description}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-slate-700 font-medium">
                          <div className="flex items-center space-x-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>{manual.company}</span>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-slate-600">
                          <div className="flex items-center space-x-1.5">
                            <FolderGit2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>{manual.project}</span>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-center">
                          <Badge variant="default" size="sm">
                            {manual.revision}
                          </Badge>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            v{manual.current_version}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-xs text-slate-500 whitespace-nowrap">
                          {formatDateShort(manual.updated_at)}
                        </td>

                        <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedLinkModal({ id: manual.id, title: manual.title })}
                              icon={<Link2 className="w-3.5 h-3.5 text-blue-600" />}
                            >
                              Gerar Link
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/manuals/${manual.id}`)}
                              icon={<ChevronRight className="w-4 h-4" />}
                            >
                              Detalhes
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      {/* Generate Link Modal */}
      {selectedLinkModal && (
        <GenerateLinkModal
          isOpen={Boolean(selectedLinkModal)}
          onClose={() => setSelectedLinkModal(null)}
          manualId={selectedLinkModal.id}
          manualTitle={selectedLinkModal.title}
          onLinkCreated={() => refetch()}
        />
      )}
    </Layout>
  );
};

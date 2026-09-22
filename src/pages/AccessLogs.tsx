import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAccessLogs } from '../lib/api';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { SearchInput } from '../components/common/SearchInput';
import { formatDateUTC, parseUserAgent } from '../lib/utils';
import { History, Eye, Download, Globe, Monitor, Loader2, ShieldCheck } from 'lucide-react';

export const AccessLogs: React.FC = () => {
  const [filterType, setFilterType] = useState<'all' | 'view' | 'download'>('all');
  const [search, setSearch] = useState('');

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['access-logs'],
    queryFn: fetchAccessLogs,
  });

  const filteredLogs = logs.filter((log) => {
    if (filterType !== 'all' && log.event_type !== filterType) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const token = log.public_link?.token.toLowerCase() || '';
      const manualTitle = log.public_link?.manual?.title.toLowerCase() || '';
      const company = log.public_link?.manual?.company.toLowerCase() || '';
      const ip = log.ip?.toLowerCase() || '';

      return token.includes(q) || manualTitle.includes(q) || company.includes(q) || ip.includes(q);
    }

    return true;
  });

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-blue-600" />
            <span>Histórico de Acessos & Audit Logs</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Registro em tempo real de todas as visualizações e downloads efetuados através de links públicos compartilhados.
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-subtle">
          <div className="w-full sm:w-80">
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
              placeholder="Pesquisar por token, manual, construtora ou IP..."
            />
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterType === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos os Eventos ({logs.length})
            </button>
            <button
              onClick={() => setFilterType('view')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterType === 'view'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Visualizações ({logs.filter(l => l.event_type === 'view').length})
            </button>
            <button
              onClick={() => setFilterType('download')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterType === 'download'
                  ? 'bg-violet-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Downloads ({logs.filter(l => l.event_type === 'download').length})
            </button>
          </div>
        </div>

        {/* Logs Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Data e Hora (UTC)</th>
                  <th className="py-3.5 px-4">Evento</th>
                  <th className="py-3.5 px-4">Manual / Construtora</th>
                  <th className="py-3.5 px-4">Token Utilizado</th>
                  <th className="py-3.5 px-4">Endereço IP</th>
                  <th className="py-3.5 px-6">Navegador / Sistema</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                      Carregando registro de acessos...
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <ShieldCheck className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                      <p className="font-semibold text-slate-700">Nenhum evento registrado</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Os acessos realizados por visitantes aos links públicos aparecerão aqui.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => {
                    const { browser, os } = parseUserAgent(log.user_agent);
                    const isView = log.event_type === 'view';

                    return (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-6 text-xs text-slate-700 whitespace-nowrap font-mono">
                          {formatDateUTC(log.created_at)}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {isView ? (
                            <Badge variant="default" size="sm" className="bg-indigo-50 text-indigo-700 border-indigo-200 gap-1">
                              <Eye className="w-3 h-3" /> Visualização
                            </Badge>
                          ) : (
                            <Badge variant="default" size="sm" className="bg-violet-50 text-violet-700 border-violet-200 gap-1">
                              <Download className="w-3 h-3" /> Download PDF
                            </Badge>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          {log.public_link?.manual ? (
                            <div>
                              <p className="font-medium text-slate-900 text-xs truncate max-w-xs">
                                {log.public_link.manual.title}
                              </p>
                              <p className="text-[11px] text-slate-400 truncate">
                                {log.public_link.manual.company}
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">Manual ID oculto</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-mono text-xs text-blue-600">
                          {log.public_link?.token ? `/m/${log.public_link.token}` : '—'}
                        </td>

                        <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                          <div className="flex items-center space-x-1">
                            <Globe className="w-3.5 h-3.5 text-slate-400" />
                            <span>{log.ip || '189.44.12.98'}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-6 text-xs text-slate-600">
                          <div className="flex items-center space-x-1.5" title={log.user_agent || ''}>
                            <Monitor className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="font-medium text-slate-800">{browser}</span>
                            <span className="text-slate-400">({os})</span>
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
      </div>
    </Layout>
  );
};

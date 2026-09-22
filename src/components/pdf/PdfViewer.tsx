import React, { useState } from 'react';
import { Download, Maximize2, ExternalLink, FileText, RefreshCw, ZoomIn, ZoomOut, Expand, Minimize } from 'lucide-react';
import { Button } from '../common/Button';

interface PdfViewerProps {
  url?: string;
  title: string;
  revision: string;
  onDownload?: () => void;
  height?: string;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  url,
  title,
  revision,
  onDownload,
  height = '850px',
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewHeightMode, setViewHeightMode] = useState<'normal' | 'tall' | 'full'>('tall');

  const handleOpenNewTab = () => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Determine dynamic container height
  const getContainerHeightClass = () => {
    if (isFullscreen) return 'fixed inset-2 sm:inset-4 z-50 shadow-2xl h-[calc(100vh-1rem)] sm:h-[calc(100vh-2rem)]';
    if (viewHeightMode === 'full') return 'h-[92vh] min-h-[900px]';
    if (viewHeightMode === 'tall') return 'h-[82vh] min-h-[800px]';
    return 'h-[650px]';
  };

  return (
    <div className={`flex flex-col bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-xl transition-all duration-200 w-full ${getContainerHeightClass()}`}>
      {/* Top Controls Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-slate-200 border-b border-slate-800/80 shrink-0">
        <div className="flex items-center space-x-3 truncate">
          <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="truncate">
            <h4 className="text-sm font-semibold text-slate-100 truncate">{title}</h4>
            <p className="text-xs text-slate-400">Revisão {revision} • Leitor de PDF Ampliado</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* Height Mode Selector */}
          <div className="hidden sm:flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setViewHeightMode('normal')}
              className={`px-2 py-1 rounded transition-colors ${viewHeightMode === 'normal' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
              title="Altura Normal (650px)"
            >
              650px
            </button>
            <button
              onClick={() => setViewHeightMode('tall')}
              className={`px-2 py-1 rounded transition-colors ${viewHeightMode === 'tall' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
              title="Altura Expandida (800px)"
            >
              800px
            </button>
            <button
              onClick={() => setViewHeightMode('full')}
              className={`px-2 py-1 rounded transition-colors ${viewHeightMode === 'full' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
              title="Tela Quase Cheia (900px+)"
            >
              Tela Ampla
            </button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleOpenNewTab}
            className="text-slate-300 hover:text-white hover:bg-slate-800 hidden md:inline-flex"
            icon={<ExternalLink className="w-4 h-4" />}
          >
            Abrir em Nova Aba
          </Button>

          {onDownload && (
            <Button
              variant="primary"
              size="sm"
              onClick={onDownload}
              icon={<Download className="w-4 h-4" />}
            >
              Baixar PDF
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="text-slate-300 hover:text-white hover:bg-slate-800"
            title={isFullscreen ? 'Sair da tela cheia' : 'Expandir para Tela Cheia'}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Expand className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* PDF Main Viewer Canvas */}
      <div className="relative flex-1 bg-slate-900 w-full h-full flex items-center justify-center overflow-hidden">
        {url ? (
          <iframe
            src={`${url}#toolbar=1&navpanes=1&view=FitH`}
            title={title}
            className="w-full h-full border-0 bg-white"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <RefreshCw className="w-10 h-10 animate-spin mb-3 text-blue-500" />
            <p className="text-sm font-medium text-slate-300">Carregando documento PDF em alta resolução...</p>
            <p className="text-xs text-slate-500 mt-1">Aguarde enquanto preparamos a previsualização</p>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { createManual } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, 
  UploadCloud, 
  FileText, 
  Check, 
  AlertCircle, 
  X,
  Building2,
  FolderGit2,
  Tag
} from 'lucide-react';

export const ManualNew: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [project, setProject] = useState('');
  const [revision, setRevision] = useState('v1.0');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      validateAndSetFile(selectedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (f: File) => {
    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Por favor selecione um arquivo no formato PDF válido.');
      return;
    }
    if (f.size > 50 * 1024 * 1024) {
      setErrorMsg('O tamanho máximo permitido para o arquivo é 50MB.');
      return;
    }
    setErrorMsg('');
    setFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg('Você precisa anexar o arquivo PDF do manual.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const newManual = await createManual({
        title,
        company,
        project,
        revision,
        description,
        file,
      }, user?.id);

      navigate(`/manuals/${newManual.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao cadastrar manual. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back navigation header */}
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Voltar ao Dashboard
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Cadastrar Novo Manual Técnico</CardTitle>
            <CardDescription>
              Preencha os dados da construtora e faça o upload do PDF original para iniciar o controle de versões.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {errorMsg && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-center space-x-3 text-rose-700 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Título do Manual *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Manual de Uso e Conservação das Áreas Comuns"
                  className="w-full px-3.5 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
                />
              </div>

              {/* Grid 2 Cols: Construtora & Empreendimento */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Construtora *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Ex: Cyrela Construtora"
                    className="w-full px-3.5 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <FolderGit2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Empreendimento *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={project}
                    onChange={(e) => setProject(e.target.value)}
                    placeholder="Ex: Residencial Horizon Tower"
                    className="w-full px-3.5 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
                  />
                </div>
              </div>

              {/* Revision code */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  <span>Código de Revisão Inicial *</span>
                </label>
                <input
                  type="text"
                  required
                  value={revision}
                  onChange={(e) => setRevision(e.target.value)}
                  placeholder="Ex: v1.0, Rev A, 2026-01"
                  className="w-full md:w-1/2 px-3.5 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs font-mono"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Descrição / Observações Técnicas (Opcional)
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Resumo dos tópicos cobertos neste manual, escopo ou especificações."
                  className="w-full px-3.5 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs resize-none"
                />
              </div>

              {/* Drag and Drop PDF File Zone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Arquivo PDF do Manual *
                </label>
                
                {file ? (
                  <div className="p-4 bg-blue-50/70 border-2 border-blue-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-600 text-white rounded-lg">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 truncate max-w-sm">{file.name}</p>
                        <p className="text-xs text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB • PDF</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setFile(null)}
                      className="text-slate-400 hover:text-rose-600 hover:bg-white"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleFileDrop}
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                      isDragOver
                        ? 'border-blue-500 bg-blue-50/60 ring-4 ring-blue-500/10'
                        : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <UploadCloud className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          Clique ou arraste o arquivo PDF aqui
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Suporta arquivos PDF de até 50MB
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Action Submit Button */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isSubmitting}
                  icon={<Check className="w-4 h-4" />}
                >
                  Salvar manual
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

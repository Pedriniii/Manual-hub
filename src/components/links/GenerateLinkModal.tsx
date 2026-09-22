import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { PublicLink } from '../../types';
import { createPublicLink } from '../../lib/api';
import { Copy, Check, Link2, Calendar, Lock, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface GenerateLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  manualId: string;
  manualTitle: string;
  onLinkCreated?: (link: PublicLink) => void;
}

export const GenerateLinkModal: React.FC<GenerateLinkModalProps> = ({
  isOpen,
  onClose,
  manualId,
  manualTitle,
  onLinkCreated,
}) => {
  const { user } = useAuth();
  const [isPermanent, setIsPermanent] = useState(true);
  const [expiresAt, setExpiresAt] = useState('');
  const [password, setPassword] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdLink, setCreatedLink] = useState<PublicLink | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newLink = await createPublicLink({
        manual_id: manualId,
        is_permanent: isPermanent,
        expires_at: isPermanent ? undefined : expiresAt,
        password: password.trim() || undefined,
        active: isActive,
      }, user?.id);

      setCreatedLink(newLink);
      if (onLinkCreated) onLinkCreated(newLink);
    } catch (err: any) {
      alert(`Erro ao gerar link: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFullUrl = (token: string) => {
    return `${window.location.origin}/m/${token}`;
  };

  const handleCopyLink = () => {
    if (!createdLink) return;
    const fullUrl = getFullUrl(createdLink.token);
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setCreatedLink(null);
    setCopied(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title={createdLink ? 'Link gerado com sucesso!' : 'Gerar Link Público'}
      description={createdLink ? 'Compartilhe o link abaixo com a construtora ou clientes.' : `Criar novo link de acesso para "${manualTitle}"`}
      maxWidth="lg"
    >
      {createdLink ? (
        <div className="space-y-5 py-2">
          {/* Link Box */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col space-y-3">
            <div className="flex items-center space-x-2 text-slate-500 text-xs font-medium">
              <Link2 className="w-4 h-4 text-blue-600" />
              <span>URL permanente / compartilhável:</span>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={getFullUrl(createdLink.token)}
                className="flex-1 bg-white text-slate-900 px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono focus:outline-none"
              />
              <Button
                variant={copied ? 'primary' : 'outline'}
                onClick={handleCopyLink}
                icon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              >
                {copied ? 'Copiado!' : 'Copiar'}
              </Button>
            </div>
          </div>

          {/* Details Summary */}
          <div className="text-xs text-slate-600 bg-blue-50/60 border border-blue-100 rounded-lg p-3 space-y-1">
            <p><strong>Tipo:</strong> {createdLink.expires_at ? 'Com data de expiração' : 'Link Permanente'}</p>
            {createdLink.expires_at && (
              <p><strong>Expira em:</strong> {new Date(createdLink.expires_at).toLocaleDateString('pt-BR')}</p>
            )}
            <p><strong>Status:</strong> {createdLink.active ? 'Ativo' : 'Inativo'}</p>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" onClick={handleReset}>
              Fechar
            </Button>
            <Button variant="primary" onClick={handleCopyLink} icon={<Copy className="w-4 h-4" />}>
              Copiar Link
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleCreateLink} className="space-y-4">
          {/* Validity Mode */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Validade do Link
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsPermanent(true)}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border text-sm font-medium transition-all ${
                  isPermanent
                    ? 'border-blue-600 bg-blue-50/50 text-blue-700 ring-2 ring-blue-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Globe className="w-5 h-5 mb-1 text-blue-600" />
                <span>Permanente</span>
                <span className="text-[11px] text-slate-400 font-normal">Sem data de expiração</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPermanent(false)}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border text-sm font-medium transition-all ${
                  !isPermanent
                    ? 'border-blue-600 bg-blue-50/50 text-blue-700 ring-2 ring-blue-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Calendar className="w-5 h-5 mb-1 text-amber-600" />
                <span>Com Expiração</span>
                <span className="text-[11px] text-slate-400 font-normal">Definir data limite</span>
              </button>
            </div>
          </div>

          {/* Expiration Date Input */}
          {!isPermanent && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Data de Expiração (UTC)
              </label>
              <input
                type="date"
                required={!isPermanent}
                value={expiresAt}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>
          )}

          {/* Password (Optional) */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center justify-between">
              <span>Senha de Proteção (Opcional)</span>
              <Lock className="w-3.5 h-3.5 text-slate-400" />
            </label>
            <input
              type="password"
              placeholder="Deixe em branco para acesso público direto"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200/80">
            <div>
              <p className="text-xs font-medium text-slate-900">Ativar link imediatamente</p>
              <p className="text-[11px] text-slate-500">Links desativados exibem mensagem amigável ao visitante</p>
            </div>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting} icon={<Link2 className="w-4 h-4" />}>
              Gerar Link
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

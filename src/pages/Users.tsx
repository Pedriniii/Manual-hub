import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchUsers, createUser, updateUser, deleteUser } from '../lib/api';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { SearchInput } from '../components/common/SearchInput';
import { formatDateShort } from '../lib/utils';
import { UserRecord, UserPermissions } from '../types';
import { 
  Users as UsersIcon, 
  UserPlus, 
  ShieldCheck, 
  Edit3, 
  Trash2, 
  Check, 
  Loader2, 
  Lock, 
  Eye, 
  FileEdit, 
  UserX,
  AlertCircle
} from 'lucide-react';

export const Users: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'editor' | 'viewer'>('admin');
  const [permissions, setPermissions] = useState<UserPermissions>({
    can_view: true,
    can_edit: true,
    can_delete: true,
    can_manage_users: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { data: usersList = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setPassword('');
    setRole('admin');
    setPermissions({
      can_view: true,
      can_edit: true,
      can_delete: true,
      can_manage_users: true,
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: UserRecord) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setPassword('');
    setRole(user.role === 'superadmin' ? 'admin' : user.role);
    setPermissions(user.permissions || {
      can_view: true,
      can_edit: true,
      can_delete: true,
      can_manage_users: true,
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleRoleChange = (newRole: 'admin' | 'editor' | 'viewer') => {
    setRole(newRole);
    if (newRole === 'admin') {
      setPermissions({
        can_view: true,
        can_edit: true,
        can_delete: true,
        can_manage_users: true,
      });
    } else if (newRole === 'editor') {
      setPermissions({
        can_view: true,
        can_edit: true,
        can_delete: false,
        can_manage_users: false,
      });
    } else {
      setPermissions({
        can_view: true,
        can_edit: false,
        can_delete: false,
        can_manage_users: false,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      if (editingUser) {
        await updateUser(editingUser.id, {
          name: name.trim(),
          email: email.trim(),
          password: password.trim() || undefined,
          role,
          permissions,
        });
      } else {
        if (!password.trim()) {
          setErrorMsg('A senha é obrigatória para cadastrar um novo usuário.');
          setIsSubmitting(false);
          return;
        }
        await createUser({
          name: name.trim(),
          email: email.trim(),
          password: password.trim(),
          role,
          permissions,
        });
      }

      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao salvar usuário.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (user: UserRecord) => {
    if (user.email === 'SUP' || user.role === 'superadmin') {
      alert('O usuário mestre (SUP) não pode ser desativado.');
      return;
    }
    try {
      await updateUser(user.id, { active: !user.active });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (err: any) {
      alert(`Erro ao alterar status: ${err.message}`);
    }
  };

  const handleDeleteUser = async (user: UserRecord) => {
    if (user.email === 'SUP' || user.role === 'superadmin') {
      alert('O usuário mestre (SUP) não pode ser excluído.');
      return;
    }

    if (window.confirm(`Tem certeza que deseja excluir o usuário "${user.name}" (${user.email})?`)) {
      try {
        await deleteUser(user.id);
        queryClient.invalidateQueries({ queryKey: ['users'] });
      } catch (err: any) {
        alert(`Erro ao excluir usuário: ${err.message}`);
      }
    }
  };

  const filteredUsers = usersList.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase().trim();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
  });

  return (
    <Layout>
      <div className="space-y-6">
        {/* Title & Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <UsersIcon className="w-6 h-6 text-blue-600" />
              <span>Gerenciamento de Usuários e Permissões</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Cadastre usuários, defina papéis de acesso e atribua permissões de visualização, edição e exclusão.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={handleOpenCreateModal}
            icon={<UserPlus className="w-4 h-4" />}
          >
            Novo Usuário
          </Button>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-subtle">
          <div className="w-full sm:w-80">
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
              placeholder="Pesquisar por nome, usuário ou e-mail..."
            />
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Total de <strong>{filteredUsers.length}</strong> {filteredUsers.length === 1 ? 'usuário' : 'usuários'}
          </div>
        </div>

        {/* Users Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Nome Completo</th>
                  <th className="py-3.5 px-4">Usuário / E-mail</th>
                  <th className="py-3.5 px-4">Função</th>
                  <th className="py-3.5 px-4">Permissões Atribuídas</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Cadastrado em</th>
                  <th className="py-3.5 px-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                      Carregando lista de usuários...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      <UsersIcon className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                      <p className="font-semibold text-slate-700">Nenhum usuário encontrado</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isSuper = u.role === 'superadmin' || u.email === 'SUP';
                    const perms = u.permissions || { can_view: true, can_edit: true, can_delete: true, can_manage_users: true };

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-6 font-semibold text-slate-900 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center border border-blue-200 shrink-0">
                              {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <span>{u.name}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-xs text-slate-700 whitespace-nowrap">
                          {u.email}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {isSuper ? (
                            <Badge variant="default" size="sm" className="bg-purple-50 text-purple-700 border-purple-200">
                              Super Admin (Mestre)
                            </Badge>
                          ) : u.role === 'admin' ? (
                            <Badge variant="default" size="sm" className="bg-blue-50 text-blue-700 border-blue-200">
                              Administrador
                            </Badge>
                          ) : u.role === 'editor' ? (
                            <Badge variant="warning" size="sm" className="bg-amber-50 text-amber-700 border-amber-200">
                              Editor
                            </Badge>
                          ) : (
                            <Badge variant="secondary" size="sm">
                              Visualizador
                            </Badge>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1">
                            {perms.can_view && <Badge variant="outline" size="sm" className="text-[10px]">Ver</Badge>}
                            {perms.can_edit && <Badge variant="default" size="sm" className="text-[10px]">Editar</Badge>}
                            {perms.can_delete && <Badge variant="destructive" size="sm" className="text-[10px]">Excluir</Badge>}
                            {perms.can_manage_users && <Badge variant="warning" size="sm" className="text-[10px]">Gerenciar Usuários</Badge>}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleActive(u)}
                            disabled={isSuper}
                            className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              isSuper ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'
                            } ${
                              u.active
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${u.active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            <span>{u.active ? 'Ativo' : 'Inativo'}</span>
                          </button>
                        </td>

                        <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                          {formatDateShort(u.created_at)}
                        </td>

                        <td className="py-3.5 px-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEditModal(u)}
                              icon={<Edit3 className="w-3.5 h-3.5 text-blue-600" />}
                            >
                              Editar
                            </Button>

                            {!isSuper && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteUser(u)}
                                className="text-rose-600 hover:bg-rose-50"
                                icon={<Trash2 className="w-3.5 h-3.5" />}
                              >
                                Excluir
                              </Button>
                            )}
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

      {/* Modal Criar / Editar Usuário */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? `Editar Usuário: ${editingUser.name}` : 'Cadastrar Novo Usuário'}
        description="Defina os dados de acesso e configure as permissões de acesso ao sistema."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center space-x-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Nome Completo *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Engenheiro Gabriel Santos"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Usuário / E-mail de Login *
            </label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ex: gabriel@construtora.com.br ou gabriel"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              {editingUser ? 'Nova Senha (Deixe em branco para não alterar)' : 'Senha de Acesso *'}
            </label>
            <input
              type="password"
              required={!editingUser}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Função do Usuário (Perfil)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleRoleChange('admin')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                  role === 'admin'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Administrador
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('editor')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                  role === 'editor'
                    ? 'border-amber-600 bg-amber-50 text-amber-700 ring-2 ring-amber-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Editor
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('viewer')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                  role === 'viewer'
                    ? 'border-slate-600 bg-slate-100 text-slate-800 ring-2 ring-slate-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Visualizador
              </button>
            </div>
          </div>

          {/* Granular Permissions Checkboxes */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <p className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
              Permissões Específicas
            </p>

            <div className="space-y-2">
              <label className="flex items-center space-x-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={permissions.can_view}
                  onChange={(e) => setPermissions({ ...permissions, can_view: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span>Pode visualizar manuais e histórico de revisões (`can_view`)</span>
              </label>

              <label className="flex items-center space-x-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={permissions.can_edit}
                  onChange={(e) => setPermissions({ ...permissions, can_edit: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span>Pode cadastrar e enviar novas revisões (`can_edit`)</span>
              </label>

              <label className="flex items-center space-x-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={permissions.can_delete}
                  onChange={(e) => setPermissions({ ...permissions, can_delete: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span>Pode excluir manuais ou revisões (`can_delete`)</span>
              </label>

              <label className="flex items-center space-x-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={permissions.can_manage_users}
                  onChange={(e) => setPermissions({ ...permissions, can_manage_users: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span>Pode criar, editar e desativar outros usuários (`can_manage_users`)</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting} icon={<Check className="w-4 h-4" />}>
              {editingUser ? 'Salvar Alterações' : 'Cadastrar Usuário'}
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

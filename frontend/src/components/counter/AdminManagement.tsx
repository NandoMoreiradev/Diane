import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { api, brl } from '../../services/api';
import { AdminUser, PermissionCatalogItem, Product, RoleDefinition } from '../../types/diane';
import { BigButton, Chip } from './CounterStyles';

const PanelGrid = styled.div`
  display: grid;
  gap: 18px;
`;

const Card = styled.div`
  background: #fff;
  border-radius: 18px;
  padding: 20px;
  h2 {
    font-size: 16px;
    font-weight: 800;
    color: var(--torra);
    margin-bottom: 14px;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
  label {
    display: grid;
    gap: 5px;
    font-size: 12.5px;
    font-weight: 700;
    color: var(--torra);
    input, select {
      padding: 10px 12px;
      border-radius: 10px;
      border: 1px solid #E3D5C4;
      font-size: 14px;
      background: #fff;
    }
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13.5px;
  th, td {
    padding: 10px 8px;
    border-bottom: 1px solid #E3D5C4;
    text-align: left;
  }
  th { font-size: 12px; text-transform: uppercase; color: #6B5444; }
  input[type='number'] {
    width: 82px;
    padding: 6px 8px;
    border-radius: 8px;
    border: 1px solid #E3D5C4;
  }
`;

const PermsBox = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 10px 0;
  label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 999px;
    border: 1px solid #E3D5C4;
    font-size: 12.5px;
    font-weight: 600;
    cursor: pointer;
    background: var(--creme);
  }
`;

export const CatalogManagement: React.FC<{
  canEditConfig: boolean;
  onToast: (msg: string) => void;
  onCatalogUpdated: () => void;
}> = ({ canEditConfig, onToast, onCatalogUpdated }) => {
  const [products, setProducts] = useState<Array<Product & { ativo: boolean }>>([]);
  const [cfg, setCfg] = useState({
    whatsapp: '',
    urlSite: '',
    abre: 7,
    fecha: 17,
    entrega: true,
    pedidoMinimo: 25,
    freteGratisAcima: 80,
  });

  const load = () => {
    api.getAdminCatalog().then((res) => {
      setProducts(res.products);
      const c = res.config as Record<string, unknown>;
      setCfg({
        whatsapp: String(c.whatsapp ?? ''),
        urlSite: String(c.urlSite ?? ''),
        abre: Number(c.abre ?? 7),
        fecha: Number(c.fecha ?? 17),
        entrega: Boolean(c.entrega ?? true),
        pedidoMinimo: Number(c.pedidoMinimo ?? 25),
        freteGratisAcima: Number(c.freteGratisAcima ?? 80),
      });
    }).catch(() => onToast('Erro ao carregar cardápio administrativo.'));
  };

  useEffect(() => { load(); }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateConfig(cfg);
      onToast('Configurações salvas');
      onCatalogUpdated();
    } catch {
      onToast('Não foi possível salvar configurações.');
    }
  };

  const handleToggleProduct = async (p: Product & { ativo: boolean }) => {
    try {
      await api.updateProduct(p.id, { ativo: !p.ativo });
      setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, ativo: !p.ativo } : x)));
      onToast(`${p.nome}: ${!p.ativo ? 'ativo' : 'pausado'}`);
      onCatalogUpdated();
    } catch {
      onToast('Erro ao atualizar produto.');
    }
  };

  const handlePriceBlur = async (id: string, preco: number, custo: number) => {
    try {
      await api.updateProduct(id, { preco, custo });
      onToast('Preço atualizado');
      onCatalogUpdated();
    } catch {
      onToast('Erro ao salvar preço.');
    }
  };

  return (
    <PanelGrid>
      {canEditConfig && (
        <Card>
          <h2>Configurações da Loja</h2>
          <form onSubmit={handleSaveConfig}>
            <FormGrid>
              <label>
                WhatsApp (DDI + DDD + número)
                <input
                  placeholder="5579999999999"
                  value={cfg.whatsapp}
                  onChange={(e) => setCfg({ ...cfg, whatsapp: e.target.value })}
                />
              </label>
              <label>
                URL pública (para QR Codes)
                <input
                  placeholder="https://diane.up.railway.app"
                  value={cfg.urlSite}
                  onChange={(e) => setCfg({ ...cfg, urlSite: e.target.value })}
                />
              </label>
              <label>
                Abre (hora)
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={cfg.abre}
                  onChange={(e) => setCfg({ ...cfg, abre: Number(e.target.value) })}
                />
              </label>
              <label>
                Fecha (hora)
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={cfg.fecha}
                  onChange={(e) => setCfg({ ...cfg, fecha: Number(e.target.value) })}
                />
              </label>
              <label>
                Pedido mínimo entrega (R$)
                <input
                  type="number"
                  step="0.5"
                  value={cfg.pedidoMinimo}
                  onChange={(e) => setCfg({ ...cfg, pedidoMinimo: Number(e.target.value) })}
                />
              </label>
              <label>
                Frete grátis acima (R$, 0 = off)
                <input
                  type="number"
                  step="1"
                  value={cfg.freteGratisAcima}
                  onChange={(e) => setCfg({ ...cfg, freteGratisAcima: Number(e.target.value) })}
                />
              </label>
            </FormGrid>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <Chip
                type="button"
                aria-pressed={cfg.entrega}
                onClick={() => setCfg({ ...cfg, entrega: !cfg.entrega })}
              >
                {cfg.entrega ? 'Entrega ativa' : 'Entrega desativada'}
              </Chip>
              <BigButton type="submit" style={{ width: 'auto', padding: '10px 20px', fontSize: 14 }}>
                Salvar configurações
              </BigButton>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <h2>Produtos do Cardápio</h2>
        <div style={{ overflowX: 'auto' }}>
          <Table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Categoria</th>
                <th>Preço (R$)</th>
                <th>Custo (R$)</th>
                <th>Margem</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const margin = p.preco > 0 ? Math.round(((p.preco - p.custo) / p.preco) * 100) : 0;
                return (
                  <tr key={p.id}>
                    <td>
                      <b>{p.nome}</b>
                    </td>
                    <td>{p.cat}</td>
                    <td>
                      <input
                        type="number"
                        step="0.5"
                        defaultValue={p.preco}
                        onBlur={(e) => {
                          const v = Number(e.target.value);
                          if (v !== p.preco) handlePriceBlur(p.id, v, p.custo);
                        }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.1"
                        defaultValue={p.custo}
                        onBlur={(e) => {
                          const v = Number(e.target.value);
                          if (v !== p.custo) handlePriceBlur(p.id, p.preco, v);
                        }}
                      />
                    </td>
                    <td>{margin}% ({brl(p.preco - p.custo)})</td>
                    <td>
                      <Chip type="button" aria-pressed={p.ativo} onClick={() => handleToggleProduct(p)}>
                        {p.ativo ? 'Ativo' : 'Pausado'}
                      </Chip>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      </Card>
    </PanelGrid>
  );
};

export const UsersManagement: React.FC<{ onToast: (msg: string) => void }> = ({ onToast }) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [permsCatalog, setPermsCatalog] = useState<PermissionCatalogItem[]>([]);

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRoleId, setNewRoleId] = useState('');
  const [newDirectPerms, setNewDirectPerms] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = () => {
    Promise.all([api.listUsers(), api.listRoles(), api.getPermissionsCatalog()])
      .then(([u, r, p]) => {
        setUsers(u);
        setRoles(r);
        setPermsCatalog(p);
        if (!newRoleId && r.length) {
          const balcao = r.find((x) => x.slug === 'balcao') || r[0];
          setNewRoleId(balcao.id);
        }
      })
      .catch(() => onToast('Erro ao carregar equipe e permissões.'));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createUser({
        name: newName,
        email: newEmail,
        password: newPassword,
        roleId: newRoleId || undefined,
        directPermissions: newDirectPerms,
      });
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      setNewDirectPerms([]);
      onToast('Usuário criado');
      load();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Erro ao criar usuário.');
    }
  };

  const toggleDirectPerm = (perm: string, list: string[], setter: (v: string[]) => void) => {
    setter(list.includes(perm) ? list.filter((x) => x !== perm) : [...list, perm]);
  };

  return (
    <PanelGrid>
      <Card>
        <h2>Novo integrante da equipe</h2>
        <form onSubmit={handleCreate}>
          <FormGrid>
            <label>
              Nome
              <input required value={newName} onChange={(e) => setNewName(e.target.value)} />
            </label>
            <label>
              E-mail
              <input type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
            </label>
            <label>
              Senha inicial
              <input
                type="password"
                minLength={6}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </label>
            <label>
              Cargo base
              <select value={newRoleId} onChange={(e) => setNewRoleId(e.target.value)}>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nome}
                  </option>
                ))}
              </select>
            </label>
          </FormGrid>

          <p style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--torra)' }}>
            Permissões extras diretas (opcionais, somam ao cargo):
          </p>
          <PermsBox>
            {permsCatalog.map((p) => (
              <label key={p.key}>
                <input
                  type="checkbox"
                  checked={newDirectPerms.includes(p.key)}
                  onChange={() => toggleDirectPerm(p.key, newDirectPerms, setNewDirectPerms)}
                />
                {p.label}
              </label>
            ))}
          </PermsBox>

          <BigButton type="submit" style={{ width: 'auto', padding: '10px 20px', fontSize: 14 }}>
            Criar usuário
          </BigButton>
        </form>
      </Card>

      <Card>
        <h2>Equipe e Permissões Granulares</h2>
        <Table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Cargo</th>
              <th>Permissões efetivas</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <React.Fragment key={u.id}>
                <tr>
                  <td><b>{u.name}</b></td>
                  <td>{u.email}</td>
                  <td>
                    <select
                      value={u.roleId || ''}
                      onChange={async (e) => {
                        await api.updateUser(u.id, { roleId: e.target.value || null });
                        onToast('Cargo atualizado');
                        load();
                      }}
                    >
                      <option value="">Sem cargo</option>
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>{r.nome}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ fontSize: 12 }}>{u.effectivePermissions.length} permissões</td>
                  <td>
                    <Chip
                      type="button"
                      aria-pressed={u.active}
                      onClick={async () => {
                        await api.updateUser(u.id, { active: !u.active });
                        onToast(`${u.name}: ${!u.active ? 'ativo' : 'desativado'}`);
                        load();
                      }}
                    >
                      {u.active ? 'Ativo' : 'Inativo'}
                    </Chip>
                  </td>
                  <td>
                    <Chip
                      type="button"
                      aria-pressed={editingId === u.id}
                      onClick={() => setEditingId(editingId === u.id ? null : u.id)}
                    >
                      Permissões
                    </Chip>
                  </td>
                </tr>
                {editingId === u.id && (
                  <tr>
                    <td colSpan={6} style={{ background: 'var(--creme)', padding: 14 }}>
                      <b style={{ fontSize: 13 }}>Permissões diretas de {u.name}:</b>
                      <PermsBox>
                        {permsCatalog.map((p) => (
                          <label key={p.key}>
                            <input
                              type="checkbox"
                              checked={u.directPermissions.includes(p.key)}
                              onChange={async () => {
                                const next = u.directPermissions.includes(p.key)
                                  ? u.directPermissions.filter((x) => x !== p.key)
                                  : [...u.directPermissions, p.key];
                                await api.updateUser(u.id, { directPermissions: next });
                                onToast('Permissões atualizadas');
                                load();
                              }}
                            />
                            {p.label}
                          </label>
                        ))}
                      </PermsBox>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </Table>
      </Card>
    </PanelGrid>
  );
};

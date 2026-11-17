import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CatalogManagement, UsersManagement } from '../components/counter/AdminManagement';
import {
  BigButton,
  BoardColumn,
  BoardGrid,
  Chip,
  CounterHeader,
  CounterMain,
  CounterSaleGrid,
  CounterToast,
  CounterWrapper,
  DeliveredDetails,
  FiltersRow,
  MobileSeg,
  OrderCard,
  Overlay,
} from '../components/counter/CounterStyles';
import { ResultsDre } from '../components/counter/ResultsDre';
import { api, brl, findCatalogItem, getToken, isCombo, setToken } from '../services/api';
import { AuthUser, CatalogData, Order, OrderStatus, PaymentMethod } from '../types/diane';

const ROTULO: Record<string, string> = {
  mesa: 'Mesa',
  retirada: 'Retirada',
  entrega: 'Entrega',
  balcao: 'Balcão',
};

const startOfDay = (d = new Date()) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const formatHora = (ms: number) =>
  new Date(ms).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

function printOrderSlip(p: Order) {
  const win = window.open('', '_blank', 'width=360,height=600');
  if (!win) return;
  const itensHtml = p.itens
    .map(
      (i) =>
        `<tr><td><b>${i.q}x</b> ${i.nome}${i.sabor ? `<br><small>${i.sabor}</small>` : ''}</td><td style="text-align:right">${brl(i.preco * i.q)}</td></tr>`,
    )
    .join('');
  win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Comanda ${p.codigo}</title>
    <style>body{font-family:monospace;padding:12px;max-width:300px;margin:0 auto;font-size:13px}
    h1{font-size:20px;margin:0 0 4px}table{width:100%;border-collapse:collapse;margin:10px 0}
    td{padding:4px 0;border-bottom:1px dashed #999;vertical-align:top}.tot{font-size:16px;font-weight:bold}</style>
    </head><body>
    <h1>DIANÊ · ${p.codigo}</h1>
    <div>${ROTULO[p.canal] || p.canal}${p.mesa ? ` ${p.mesa}` : ''} · ${formatHora(p.criadoEm)}</div>
    <div>Cliente: <b>${p.nome || 'Balcão'}</b></div>
    ${p.local ? `<div>Entregar em: ${p.local}</div>` : ''}
    ${p.quando && p.quando !== 'agora' ? `<div><b>Agendado: ${p.quando}</b></div>` : ''}
    <table>${itensHtml}</table>
    ${p.obs ? `<div><b>Obs.:</b> ${p.obs}</div>` : ''}
    <div class="tot">Total: ${brl(p.total)} (${p.pagamento})</div>
    <script>window.onload=()=>{window.print();setTimeout(()=>window.close(),300);}</script>
    </body></html>`);
  win.document.close();
}

export const CounterPage: React.FC = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginErr, setLoginErr] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [balcaoAberto, setBalcaoAberto] = useState(false);
  const [catalog, setCatalog] = useState<CatalogData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [connected, setConnected] = useState(true);

  const [vista, setVista] = useState<'pedidos' | 'venda' | 'resultado' | 'cardapio' | 'equipe'>('pedidos');
  const [filtro, setFiltro] = useState<'todos' | 'retirada' | 'entrega'>('todos');
  const [colMovel, setColMovel] = useState<'novo' | 'preparo' | 'pronto'>('novo');
  const [somLigado, setSomLigado] = useState(true);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState('');
  const [toastOn, setToastOn] = useState(false);
  const [, setTick] = useState(0);

  const [caixa, setCaixa] = useState<Array<{ id: string; sabor: string | null; q: number }>>([]);
  const [saborCaixa, setSaborCaixa] = useState<Record<string, string>>({});
  const [vendaNome, setVendaNome] = useState('');
  const [vendaPag, setVendaPag] = useState<PaymentMethod>('Pix');
  const [registrando, setRegistrando] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const somRef = useRef(somLigado);
  somRef.current = somLigado;
  const toastTimer = useRef<number | null>(null);

  const hasPerm = useCallback(
    (perm: string) => Boolean(user && (user.role === 'ADMIN' || user.permissions?.includes(perm))),
    [user],
  );

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastOn(true);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastOn(false), 2200);
  }, []);

  const tocar = useCallback(() => {
    if (!somRef.current) return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
      const ctx = audioCtxRef.current;
      const t0 = ctx.currentTime;
      [
        [880, 0],
        [1318.5, 0.18],
        [880, 0.5],
        [1318.5, 0.68],
      ].forEach(([f, d]) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = f;
        g.gain.setValueAtTime(0, t0 + d);
        g.gain.linearRampToValueAtTime(0.35, t0 + d + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, t0 + d + 0.4);
        o.connect(g).connect(ctx.destination);
        o.start(t0 + d);
        o.stop(t0 + d + 0.45);
      });
    } catch {
      // ignore
    }
    try {
      navigator.vibrate?.([200, 100, 200]);
    } catch {
      // ignore
    }
  }, []);

  const notificar = useCallback((p: Order) => {
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        const onde =
          p.canal === 'mesa' ? `Mesa ${p.mesa}` : p.canal === 'entrega' ? 'Entrega' : 'Retirada';
        new Notification(`Novo pedido ${p.codigo} · ${onde}`, {
          body: `${p.nome} · ${p.itens.reduce((s, i) => s + i.q, 0)} itens · ${brl(p.total)}`,
          icon: '/midia/diane-simbolo-caramelo.svg',
          tag: p.id,
        });
      }
    } catch {
      // ignore
    }
  }, []);

  // Re-adquire wakeLock quando a aba volta a ficar visível
  const acquireWakeLock = useCallback(async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible' && balcaoAberto) {
        acquireWakeLock();
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [balcaoAberto, acquireWakeLock]);

  // Verifica sessão via accessToken ou refresh cookie HttpOnly
  useEffect(() => {
    const restoreSession = async () => {
      if (!getToken()) {
        await api.refresh();
      }
      if (getToken()) {
        try {
          const u = await api.me();
          setUser(u);
        } catch {
          setToken(null);
        }
      }
      setAuthChecked(true);
    };
    restoreSession();
  }, []);

  const loadCatalog = useCallback(() => {
    api
      .getCatalog()
      .then((cat) => {
        setCatalog(cat);
        setSaborCaixa(Object.fromEntries(Object.entries(cat.sabores).map(([g, l]) => [g, l[0]])));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  useEffect(() => {
    if (!user || !balcaoAberto || !hasPerm('orders:read')) return;

    const token = getToken();
    if (!token) return;

    const d = new Date();
    const ini = new Date(d.getFullYear(), d.getMonth(), 1);
    const sete = startOfDay(new Date(Date.now() - 6 * 864e5));
    const desde = (ini < sete ? ini : sete).toISOString();

    api
      .listOrders(desde)
      .then((list) => {
        setOrders(list);
        setConnected(true);
      })
      .catch(() => setConnected(false));

    const es = new EventSource(`/api/orders/stream/board?token=${encodeURIComponent(token)}`);

    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);

    es.addEventListener('order.created', (e: MessageEvent) => {
      try {
        const ord = JSON.parse(e.data) as Order;
        setOrders((prev) => (prev.some((x) => x.id === ord.id) ? prev : [...prev, ord]));
        if (ord.status === 'novo') {
          tocar();
          notificar(ord);
          toast(`Novo pedido ${ord.codigo}`);
        }
      } catch {
        // ignore
      }
    });

    es.addEventListener('order.updated', (e: MessageEvent) => {
      try {
        const ord = JSON.parse(e.data) as Order;
        setOrders((prev) => prev.map((x) => (x.id === ord.id ? ord : x)));
      } catch {
        // ignore
      }
    });

    const minTimer = window.setInterval(() => setTick((t) => t + 1), 30000);
    return () => {
      es.close();
      window.clearInterval(minTimer);
    };
  }, [user, balcaoAberto, hasPerm, tocar, notificar, toast]);

  const hojeOrders = useMemo(
    () => orders.filter((p) => p.criadoEm >= +startOfDay()),
    [orders],
  );

  useEffect(() => {
    if (!balcaoAberto) return;
    const soundLoop = window.setInterval(() => {
      if (hojeOrders.some((p) => p.status === 'novo')) tocar();
    }, 25000);

    let piscar = false;
    const titleLoop = window.setInterval(() => {
      const n = hojeOrders.filter((p) => p.status === 'novo').length;
      piscar = !piscar;
      document.title = n ? (piscar ? `(${n}) Novo pedido` : 'Dianê · Balcão') : 'Dianê · Balcão';
    }, 1200);

    return () => {
      window.clearInterval(soundLoop);
      window.clearInterval(titleLoop);
      document.title = 'Dianê · Balcão';
    };
  }, [balcaoAberto, hojeOrders, tocar]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErr('');
    setLoggingIn(true);
    try {
      const res = await api.login(loginEmail.trim(), loginPass);
      setToken(res.accessToken);
      setUser(res.user);
    } catch (err) {
      setLoginErr(err instanceof Error ? err.message : 'E-mail ou senha incorretos.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleOpenCounter = async () => {
    setBalcaoAberto(true);
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
      await audioCtxRef.current.resume();
    } catch {
      // ignore
    }
    try {
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    } catch {
      // ignore
    }
    acquireWakeLock();
  };

  const handleStatusChange = async (id: string, status: OrderStatus) => {
    try {
      const updated = await api.updateOrderStatus(id, status);
      setOrders((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      if (status === 'cancelado') toast('Pedido cancelado');
    } catch {
      toast('Não foi possível atualizar. Verifique a internet.');
    }
  };

  const handleRegisterSale = async () => {
    if (!caixa.length) return;
    setRegistrando(true);
    try {
      const reg = await api.createCounterSale({
        nome: vendaNome.trim().slice(0, 60),
        pagamento: vendaPag,
        itens: caixa.map((l) => ({ id: l.id, q: l.q, sabor: l.sabor })),
      });
      setOrders((prev) => (prev.some((x) => x.id === reg.id) ? prev : [...prev, reg]));
      setCaixa([]);
      setVendaNome('');
      toast(`Venda ${reg.codigo} registrada`);
    } catch {
      toast('Não foi possível registrar. Verifique a internet.');
    } finally {
      setRegistrando(false);
    }
  };

  if (!authChecked) {
    return (
      <Overlay>
        <p>Carregando painel...</p>
      </Overlay>
    );
  }

  if (!user) {
    return (
      <Overlay>
        <form className="caixa-capa" onSubmit={handleLogin}>
          <img src="/midia/diane-logo-creme.svg" alt="Dianê" />
          <h1>Painel do balcão</h1>
          <p>Entre com o e-mail da equipe.</p>
          <input
            type="email"
            autoComplete="username"
            placeholder="E-mail"
            required
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
          />
          <input
            type="password"
            autoComplete="current-password"
            placeholder="Senha"
            required
            value={loginPass}
            onChange={(e) => setLoginPass(e.target.value)}
          />
          {loginErr && <p className="erro">{loginErr}</p>}
          <BigButton type="submit" disabled={loggingIn}>
            {loggingIn ? 'Entrando...' : 'Entrar'}
          </BigButton>
        </form>
      </Overlay>
    );
  }

  if (!balcaoAberto) {
    return (
      <Overlay>
        <div className="caixa-capa">
          <img src="/midia/diane-logo-creme.svg" alt="Dianê" />
          <h1>Bom dia, {user.name.split(' ')[0]}</h1>
          <p>
            Toque para abrir o balcão. Assim o som de novo pedido e as notificações ficam ligados, e a tela
            não apaga.
          </p>
          <BigButton type="button" onClick={handleOpenCounter}>
            Abrir o balcão
          </BigButton>
        </div>
      </Overlay>
    );
  }

  const novosCount = hojeOrders.filter((p) => p.status === 'novo').length;
  const filteredBoard = hojeOrders.filter(
    (p) => p.canal !== 'balcao' && (filtro === 'todos' || p.canal === filtro),
  );
  const grupos = {
    novo: filteredBoard.filter((p) => p.status === 'novo'),
    preparo: filteredBoard.filter((p) => p.status === 'preparo'),
    pronto: filteredBoard.filter((p) => p.status === 'pronto'),
  };
  const feitos = hojeOrders
    .filter((p) => p.status === 'entregue' || p.status === 'cancelado')
    .slice()
    .reverse();
  const validToday = hojeOrders.filter((p) => p.status !== 'cancelado');

  const caixaTotal = catalog
    ? caixa.reduce((s, l) => s + (findCatalogItem(catalog, l.id)?.preco ?? 0) * l.q, 0)
    : 0;

  return (
    <CounterWrapper>
      <CounterHeader>
        <div className="lin1">
          <div className="marca">
            <img src="/midia/diane-nome-creme.svg" alt="Dianê" />
            <small>balcão</small>
          </div>
          <nav className="abas" role="tablist">
            {hasPerm('orders:read') && (
              <button role="tab" aria-selected={vista === 'pedidos'} onClick={() => setVista('pedidos')}>
                Pedidos{novosCount > 0 && <span className="n">{novosCount}</span>}
              </button>
            )}
            {hasPerm('counter:sale') && (
              <button role="tab" aria-selected={vista === 'venda'} onClick={() => setVista('venda')}>
                Venda no balcão
              </button>
            )}
            {hasPerm('dre:read') && (
              <button role="tab" aria-selected={vista === 'resultado'} onClick={() => setVista('resultado')}>
                Resultado
              </button>
            )}
            {(hasPerm('catalog:manage') || hasPerm('config:manage')) && (
              <button role="tab" aria-selected={vista === 'cardapio'} onClick={() => setVista('cardapio')}>
                Cardápio
              </button>
            )}
            {hasPerm('users:manage') && (
              <button role="tab" aria-selected={vista === 'equipe'} onClick={() => setVista('equipe')}>
                Equipe
              </button>
            )}
          </nav>
          <div className="dir">
            <Link
              to="/qr-codes"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--areia)', fontSize: 13, fontWeight: 600 }}
            >
              QR Codes
            </Link>
            <span className={`conexao ${!connected ? 'off' : ''}`}>
              <span>{connected ? 'Conectado' : 'Reconectando'}</span>
            </span>
            <button
              className={`btn-som ${!somLigado ? 'mudo' : ''}`}
              type="button"
              aria-pressed={somLigado}
              onClick={() => {
                const next = !somLigado;
                setSomLigado(next);
                somRef.current = next;
                if (next) tocar();
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10 21a2 2 0 0 0 4 0" />
              </svg>
              <span>{somLigado ? 'Som ligado' : 'Som desligado'}</span>
            </button>
            <button
              className="btn-sair"
              type="button"
              onClick={async () => {
                await api.logout().catch(() => {});
                setToken(null);
                setUser(null);
                setBalcaoAberto(false);
              }}
            >
              Sair
            </button>
          </div>
        </div>
      </CounterHeader>

      <CounterMain>
        {vista === 'pedidos' && hasPerm('orders:read') && (
          <section>
            <FiltersRow>
              {(
                [
                  ['todos', 'Todos'],
                  ['retirada', 'Retirada'],
                  ['entrega', 'Entrega'],
                ] as const
              ).map(([f, label]) => (
                <Chip key={f} aria-pressed={filtro === f} onClick={() => setFiltro(f)}>
                  {label}
                </Chip>
              ))}
              <span className="resumo-dia">
                Hoje: {validToday.length} pedidos · {brl(validToday.reduce((s, p) => s + p.total, 0))}
              </span>
            </FiltersRow>

            <MobileSeg role="tablist">
              {(
                [
                  ['novo', 'Novos'],
                  ['preparo', 'Preparo'],
                  ['pronto', 'Prontos'],
                ] as const
              ).map(([s, label]) => (
                <button
                  key={s}
                  role="tab"
                  aria-selected={colMovel === s}
                  onClick={() => setColMovel(s)}
                >
                  {label} ({grupos[s].length})
                </button>
              ))}
            </MobileSeg>

            <BoardGrid>
              {(
                [
                  ['novo', 'Novos'],
                  ['preparo', 'Em preparo'],
                  ['pronto', 'Prontos'],
                ] as const
              ).map(([st, label]) => (
                <BoardColumn key={st} $status={st} $activeMobile={colMovel === st}>
                  <h2>
                    {label} <span className="n">{grupos[st].length}</span>
                  </h2>
                  <div className="cartoes">
                    {!grupos[st].length ? (
                      <p className="vazio-col">
                        {st === 'novo'
                          ? 'Nenhum pedido novo. Quando chegar um, toca o alerta.'
                          : 'Nada aqui.'}
                      </p>
                    ) : (
                      grupos[st].map((p) => {
                        const min = Math.floor((Date.now() - p.criadoEm) / 60000);
                        const fone = (p.telefone || '').replace(/\D/g, '');
                        const mesaInfo = catalog?.config.mesas.find((m) => m.n === p.mesa);
                        return (
                          <OrderCard key={p.id} $status={p.status}>
                            <div className="c-topo">
                              <div>
                                <div className="cod">{p.codigo}</div>
                                <span className={`canal ${p.canal}`}>
                                  {p.canal === 'mesa'
                                    ? `Mesa ${p.mesa}${mesaInfo ? ` · ${mesaInfo.nome}` : ''}`
                                    : ROTULO[p.canal] || p.canal}
                                </span>
                              </div>
                              <div className={`tempo ${min >= 15 && p.status !== 'pronto' ? 'atraso' : ''}`}>
                                <b>{min < 1 ? 'agora' : `${min} min`}</b>
                                {formatHora(p.criadoEm)}
                              </div>
                            </div>

                            <div className="quem">
                              {p.nome || 'Sem nome'}
                              {fone && (
                                <a
                                  href={`https://wa.me/55${fone.replace(/^55/, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {p.telefone}
                                </a>
                              )}
                            </div>

                            {p.local && <div className="local">Entregar em: {p.local}</div>}
                            {p.canal === 'entrega' && (
                              <div className="agendado">
                                Taxa de entrega: {p.frete ? brl(p.frete) : 'grátis'}
                              </div>
                            )}
                            {p.quando && p.quando !== 'agora' && (
                              <div className="agendado">Para as {p.quando}</div>
                            )}

                            <ul className="itens">
                              {p.itens.map((i, idx) => (
                                <li key={`${i.id}-${idx}`}>
                                  <b>{i.q}x</b>
                                  {i.nome}
                                  {i.sabor && <small>{i.sabor}</small>}
                                </li>
                              ))}
                            </ul>

                            {p.obs && <div className="obs">Obs.: {p.obs}</div>}

                            <div className="c-rodape">
                              <span className="valor">{brl(p.total)}</span>
                              <span className="pag">{p.pagamento}</span>
                              <button
                                className="cancelar"
                                type="button"
                                onClick={() => printOrderSlip(p)}
                              >
                                Imprimir
                              </button>
                              {hasPerm('orders:manage') && (
                                <>
                                  {p.status === 'novo' && (
                                    <button
                                      className="acao aceitar"
                                      onClick={() => handleStatusChange(p.id, 'preparo')}
                                    >
                                      Aceitar e preparar
                                    </button>
                                  )}
                                  {p.status === 'preparo' && (
                                    <button
                                      className="acao pronto"
                                      onClick={() => handleStatusChange(p.id, 'pronto')}
                                    >
                                      Está pronto
                                    </button>
                                  )}
                                  {p.status === 'pronto' && (
                                    <button
                                      className="acao"
                                      onClick={() => handleStatusChange(p.id, 'entregue')}
                                    >
                                      {p.canal === 'mesa' ? 'Entregue na mesa' : 'Entregue'}
                                    </button>
                                  )}
                                  <button
                                    className={`cancelar ${confirmCancelId === p.id ? 'confirma' : ''}`}
                                    onClick={() => {
                                      if (confirmCancelId !== p.id) {
                                        setConfirmCancelId(p.id);
                                        window.setTimeout(
                                          () =>
                                            setConfirmCancelId((curr) => (curr === p.id ? null : curr)),
                                          4000,
                                        );
                                        return;
                                      }
                                      setConfirmCancelId(null);
                                      handleStatusChange(p.id, 'cancelado');
                                    }}
                                  >
                                    {confirmCancelId === p.id ? 'Confirmar cancelamento' : 'Cancelar'}
                                  </button>
                                </>
                              )}
                            </div>
                          </OrderCard>
                        );
                      })
                    )}
                  </div>
                </BoardColumn>
              ))}
            </BoardGrid>

            <DeliveredDetails>
              <summary>Entregues e cancelados hoje ({feitos.length})</summary>
              <table>
                <tbody>
                  {feitos.length ? (
                    feitos.map((p) => (
                      <tr key={p.id}>
                        <td>{formatHora(p.criadoEm)}</td>
                        <td>{p.codigo}</td>
                        <td>
                          {ROTULO[p.canal]}
                          {p.mesa ? ` ${p.mesa}` : ''}
                        </td>
                        <td>{p.nome}</td>
                        <td>{p.status === 'cancelado' ? 'Cancelado' : p.pagamento}</td>
                        <td>{brl(p.total)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td>Nenhum ainda.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </DeliveredDetails>
          </section>
        )}

        {vista === 'venda' && hasPerm('counter:sale') && catalog && (
          <CounterSaleGrid>
            <div className="grade">
              <div className="sabor-sel">
                {Object.keys(catalog.sabores).map((g) => (
                  <div className="linha-sabor" key={g}>
                    <b>{catalog.saboresNome[g] || g}:</b>
                    {catalog.sabores[g].map((s) => (
                      <Chip
                        key={s}
                        aria-pressed={s === saborCaixa[g]}
                        onClick={() => setSaborCaixa((prev) => ({ ...prev, [g]: s }))}
                      >
                        {s}
                      </Chip>
                    ))}
                  </div>
                ))}
              </div>

              {(
                [
                  ['doces', 'Doces'],
                  ['lanches', 'Lanches'],
                  ['cafes', 'Cafés e bebidas'],
                ] as const
              ).map(([catKey, catLabel]) => (
                <React.Fragment key={catKey}>
                  <h3>{catLabel}</h3>
                  {catalog.produtos
                    .filter((p) => p.cat === catKey)
                    .map((p) => (
                      <button
                        key={p.id}
                        className="prod"
                        onClick={() => {
                          const sabor = p.sabores ? saborCaixa[p.sabores] || null : null;
                          setCaixa((prev) => {
                            const idx = prev.findIndex((x) => x.id === p.id && x.sabor === sabor);
                            if (idx >= 0) {
                              return prev.map((x, i) => (i === idx ? { ...x, q: x.q + 1 } : x));
                            }
                            return [...prev, { id: p.id, sabor, q: 1 }];
                          });
                        }}
                      >
                        <b>{p.nome}</b>
                        <span>{brl(p.preco)}</span>
                      </button>
                    ))}
                </React.Fragment>
              ))}

              <h3>Combos</h3>
              {catalog.combos.map((c) => (
                <button
                  key={c.id}
                  className="prod"
                  onClick={() => {
                    const sabor = c.sabores ? saborCaixa[c.sabores] || null : null;
                    setCaixa((prev) => {
                      const idx = prev.findIndex((x) => x.id === c.id && x.sabor === sabor);
                      if (idx >= 0) {
                        return prev.map((x, i) => (i === idx ? { ...x, q: x.q + 1 } : x));
                      }
                      return [...prev, { id: c.id, sabor, q: 1 }];
                    });
                  }}
                >
                  <b>Combo {c.nome}</b>
                  <span>{brl(c.preco)}</span>
                </button>
              ))}
            </div>

            <aside className="caixa">
              <h2>Venda no balcão</h2>
              <div>
                {!caixa.length ? (
                  <p style={{ color: '#6B5444', fontSize: 14 }}>
                    Toque nos produtos para lançar a venda.
                  </p>
                ) : (
                  caixa.map((l, k) => {
                    const info = findCatalogItem(catalog, l.id);
                    if (!info) return null;
                    return (
                      <div className="lin" key={`${l.id}-${l.sabor}-${k}`}>
                        <span>
                          {isCombo(info) ? 'Combo ' : ''}
                          {info.nome}
                          {l.sabor && <small style={{ color: '#6B5444' }}> ({l.sabor})</small>}
                        </span>
                        <span className="mini">
                          <button
                            onClick={() =>
                              setCaixa((prev) =>
                                prev
                                  .map((x, idx) => (idx === k ? { ...x, q: x.q - 1 } : x))
                                  .filter((x) => x.q > 0),
                              )
                            }
                          >
                            −
                          </button>
                          <span>{l.q}</span>
                          <button
                            onClick={() =>
                              setCaixa((prev) =>
                                prev.map((x, idx) => (idx === k ? { ...x, q: x.q + 1 } : x)),
                              )
                            }
                          >
                            +
                          </button>
                        </span>
                        <b>{brl(info.preco * l.q)}</b>
                      </div>
                    );
                  })
                )}
              </div>

              <label className="campo">
                Nome do cliente (opcional)
                <input
                  maxLength={60}
                  value={vendaNome}
                  onChange={(e) => setVendaNome(e.target.value)}
                />
              </label>

              <div className="campo">
                Pagamento
                <FiltersRow style={{ margin: 0 }}>
                  {(['Pix', 'Cartão', 'Dinheiro'] as const).map((pg) => (
                    <Chip key={pg} aria-pressed={vendaPag === pg} onClick={() => setVendaPag(pg)}>
                      {pg}
                    </Chip>
                  ))}
                </FiltersRow>
              </div>

              <div className="total-caixa">
                <span>Total</span>
                <b>{brl(caixaTotal)}</b>
              </div>

              <BigButton disabled={!caixa.length || registrando} onClick={handleRegisterSale}>
                {registrando ? 'Registrando...' : 'Registrar venda'}
              </BigButton>
            </aside>
          </CounterSaleGrid>
        )}

        {vista === 'resultado' && hasPerm('dre:read') && catalog && (
          <ResultsDre catalog={catalog} orders={orders} />
        )}

        {vista === 'cardapio' && (hasPerm('catalog:manage') || hasPerm('config:manage')) && (
          <CatalogManagement
            canEditConfig={hasPerm('config:manage')}
            onToast={toast}
            onCatalogUpdated={loadCatalog}
          />
        )}

        {vista === 'equipe' && hasPerm('users:manage') && <UsersManagement onToast={toast} />}
      </CounterMain>

      <CounterToast $on={toastOn}>{toastMsg}</CounterToast>
    </CounterWrapper>
  );
};

import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { api, brl, calcFrete, findCatalogItem, findZone, isCombo, matchBairro } from '../../services/api';
import { CartItem, CatalogData, Order, PaymentMethod } from '../../types/diane';
import { ProductArt } from '../ProductArt';
import { Btn, Stepper } from './HomeStyles';

const Backdrop = styled.div<{ $on: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(30, 15, 7, .5);
  z-index: 50;
  opacity: ${(p) => (p.$on ? 1 : 0)};
  pointer-events: ${(p) => (p.$on ? 'auto' : 'none')};
  transition: opacity .3s;
`;

const Drawer = styled.aside<{ $on: boolean }>`
  position: fixed;
  z-index: 60;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(460px, 100%);
  background: var(--creme);
  display: flex;
  flex-direction: column;
  transform: ${(p) => (p.$on ? 'none' : 'translateX(100%)')};
  transition: transform .35s cubic-bezier(.2, .8, .2, 1);

  @media (max-width: 620px) {
    top: auto;
    left: 0;
    width: 100%;
    height: 92svh;
    border-radius: 26px 26px 0 0;
    transform: ${(p) => (p.$on ? 'none' : 'translateY(100%)')};
  }

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 22px;
    border-bottom: 1px solid var(--linha);
    h2 {
      font-size: 20px;
      font-weight: 800;
      color: var(--torra);
    }
  }

  .fechar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: var(--leite);
    display: grid;
    place-items: center;
    font-size: 22px;
    color: var(--torra);
  }

  .rolar {
    flex: 1;
    overflow-y: auto;
    padding: 8px 22px 22px;
  }

  .lin {
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 14px 0;
    border-bottom: 1px solid var(--linha);
    .nome {
      flex: 1;
      min-width: 0;
      b { display: block; font-size: 15px; color: var(--torra); }
      small { color: var(--suave); font-size: 12.5px; }
    }
    .v {
      font-weight: 800;
      color: var(--caramelo);
      min-width: 72px;
      text-align: right;
      font-variant-numeric: tabular-nums;
    }
  }

  .vazia {
    text-align: center;
    padding: 48px 10px;
    color: var(--suave);
    svg { width: 80px; height: 80px; margin: 0 auto 12px; }
  }

  .adicionais {
    margin: 4px 0 18px;
    padding: 14px;
    border-radius: 16px;
    background: var(--leite);
    p {
      font-size: 13px;
      font-weight: 700;
      color: var(--torra);
      margin-bottom: 10px;
    }
    .chips-add {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      button {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: #fff;
        border: 1px solid var(--linha);
        border-radius: 999px;
        padding: 8px 12px;
        font-size: 13px;
        font-weight: 700;
        color: var(--torra);
        svg { width: 12px; height: 12px; color: var(--caramelo); }
        span { color: var(--suave); font-weight: 600; }
        em {
          font-style: normal;
          background: var(--caramelo);
          color: #fff;
          border-radius: 999px;
          min-width: 20px;
          height: 20px;
          display: inline-grid;
          place-items: center;
          font-size: 11px;
        }
      }
    }
  }

  .form {
    display: grid;
    gap: 16px;
    margin-top: 20px;
    label {
      display: grid;
      gap: 6px;
      font-size: 13px;
      font-weight: 700;
      color: var(--torra);
    }
    input, select, textarea {
      width: 100%;
      padding: 13px 14px;
      border-radius: 14px;
      border: 1px solid var(--linha);
      background: #fff;
      font-size: 15px;
      outline: none;
      &:focus {
        border-color: var(--caramelo);
        box-shadow: 0 0 0 3px rgba(164, 86, 13, .15);
      }
    }
  }

  .grupo {
    display: grid;
    gap: 6px;
    > span {
      font-size: 13px;
      font-weight: 700;
      color: var(--torra);
    }
  }

  .opcoes {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    &.tres { grid-template-columns: 1fr 1fr 1fr; }
    button {
      padding: 12px 8px;
      border-radius: 14px;
      border: 1px solid var(--linha);
      background: #fff;
      font-size: 13.5px;
      font-weight: 700;
      color: var(--suave);
      &[aria-pressed='true'] {
        border-color: var(--caramelo);
        background: #F6E6D6;
        color: var(--torra);
      }
    }
  }

  .entrega-box { display: grid; gap: 12px; }
  .dupla { display: grid; grid-template-columns: 1fr 1.3fr; gap: 10px; }
  .frete-info {
    font-size: 13px;
    line-height: 1.45;
    color: var(--suave);
    background: var(--leite);
    border-radius: 14px;
    padding: 11px 14px;
    b { color: var(--torra); }
    &.alerta { background: #F8E6DA; color: #8A3B16; }
  }

  .mesa-aviso {
    background: #F6E6D6;
    color: var(--torra);
    border-radius: 14px;
    padding: 12px 14px;
    font-size: 14px;
    font-weight: 600;
  }

  .feito {
    display: grid;
    gap: 12px;
    padding: 18px 0 8px;
    text-align: left;
    .feito-sub { font-size: 14px; font-weight: 600; color: var(--ok); }
    h3 { font-size: 30px; font-weight: 800; color: var(--torra); line-height: 1.1; }
    > p:not(.feito-sub) { color: var(--suave); }
  }

  .etapas {
    list-style: none;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
    margin: 8px 0 6px;
    li {
      font-size: 12px;
      font-weight: 700;
      color: #7E6656;
      text-align: center;
      padding-top: 14px;
      border-top: 4px solid var(--linha);
      &.ok { color: var(--torra); border-color: var(--caramelo); }
      &.agora { color: var(--caramelo); }
    }
  }

  footer.sacola-footer {
    padding: 16px 22px calc(16px + env(safe-area-inset-bottom));
    border-top: 1px solid var(--linha);
    background: #fff;
    .sub-total {
      display: flex;
      justify-content: space-between;
      font-size: 13.5px;
      color: var(--suave);
      margin-bottom: 6px;
      b { color: var(--torra); font-weight: 700; }
    }
    .total {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 12px;
      span { color: var(--suave); font-size: 14px; }
      b { font-size: 24px; font-weight: 800; color: var(--torra); font-variant-numeric: tabular-nums; }
    }
    .erro {
      color: #B4441F;
      font-size: 12.5px;
      font-weight: 600;
      margin-bottom: 10px;
    }
    .btn-enviar {
      width: 100%;
      padding: 16px;
      &.inativo { opacity: .5; cursor: not-allowed; }
    }
    .aviso {
      font-size: 12px;
      color: var(--suave);
      text-align: center;
      margin-top: 10px;
    }
  }
`;

const ADICIONAIS = ['brigadeiro', 'pao', 'expresso', 'cappuccino', 'agua', 'refri'];

const STATUS_TEXT: Record<string, string> = {
  novo: 'Recebemos o seu pedido. Já já começamos a preparar.',
  preparo: 'Seu pedido está sendo preparado.',
  pronto: 'Seu pedido está pronto.',
  entregue: 'Pedido entregue. Bom proveito.',
  cancelado: 'Este pedido foi cancelado. Fale com a gente no balcão.',
};

interface Props {
  open: boolean;
  onClose: () => void;
  catalog: CatalogData;
  sacola: CartItem[];
  onChangeQty: (k: string, delta: number) => void;
  onAdd: (id: string, sabor?: string | null) => void;
  onClearCart: () => void;
  mesa: { n: number; nome: string } | null;
  activeOrder: { id: string; codigo: string } | null;
  onOrderCreated: (reg: { id: string; codigo: string }) => void;
  onOrderFinished: () => void;
  showingDone: boolean;
  setShowingDone: (v: boolean) => void;
}

export const CartDrawer: React.FC<Props> = ({
  open,
  onClose,
  catalog,
  sacola,
  onChangeQty,
  onAdd,
  onClearCart,
  mesa,
  activeOrder,
  onOrderCreated,
  onOrderFinished,
  showingDone,
  setShowingDone,
}) => {
  const [nome, setNome] = useState(() => {
    try { return localStorage.getItem('diane-nome') || ''; } catch { return ''; }
  });
  const [fone, setFone] = useState(() => {
    try { return localStorage.getItem('diane-fone') || ''; } catch { return ''; }
  });
  const [receber, setReceber] = useState<'Retirar no balcão' | 'Entrega aqui perto'>('Retirar no balcão');
  const [cep, setCep] = useState('');
  const [bairro, setBairro] = useState('');
  const [bairroDoCep, setBairroDoCep] = useState<string | null>(null);
  const [cepMsg, setCepMsg] = useState<string | null>(null);
  const [rua, setRua] = useState('');
  const [comp, setComp] = useState('');
  const [quando, setQuando] = useState<'Agora' | 'Agendar'>('Agora');
  const [hora, setHora] = useState(`${String(catalog.config.abre).padStart(2, '0')}:00`);
  const [pagamento, setPagamento] = useState<PaymentMethod>('Pix');
  const [obs, setObs] = useState('');
  const [erro, setErro] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [zapUrl, setZapUrl] = useState<string | null>(null);
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);

  const horarios = useMemo(() => {
    const list: string[] = [];
    for (let h = catalog.config.abre; h < catalog.config.fecha; h++) {
      for (const m of ['00', '30']) {
        list.push(`${String(h).padStart(2, '0')}:${m}`);
      }
    }
    return list;
  }, [catalog.config.abre, catalog.config.fecha]);

  const bairrosList = useMemo(
    () =>
      catalog.config.delivery.zonas
        .flatMap((z) => z.bairros)
        .sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [catalog.config.delivery.zonas],
  );

  const subtotal = useMemo(
    () =>
      sacola.reduce((sum, l) => {
        const info = findCatalogItem(catalog, l.id);
        return sum + (info ? info.preco : 0) * l.q;
      }, 0),
    [catalog, sacola],
  );

  const ehEntrega = !mesa && receber === 'Entrega aqui perto' && catalog.config.entrega;
  const zona = bairro && bairro !== '__outro' ? findZone(catalog, bairro) : null;
  const frete = zona ? calcFrete(catalog, subtotal, bairro) : null;
  const faltaMin = Math.max(0, (catalog.config.delivery.pedidoMinimo || 0) - subtotal);
  const totalFinal = ehEntrega ? subtotal + (frete || 0) : subtotal;

  useEffect(() => {
    if (!activeOrder) {
      setTrackedOrder(null);
      return;
    }

    let cancelled = false;
    api.getOrder(activeOrder.id).then((ord) => {
      if (!cancelled) {
        setTrackedOrder(ord);
        if (ord.status === 'entregue' || ord.status === 'cancelado') {
          onOrderFinished();
        }
      }
    }).catch(() => {});

    const es = new EventSource(`/api/orders/${encodeURIComponent(activeOrder.id)}/stream`);
    const handleEvent = (e: MessageEvent) => {
      try {
        const ord = JSON.parse(e.data) as Order;
        setTrackedOrder(ord);
        if (ord.status === 'entregue' || ord.status === 'cancelado') {
          onOrderFinished();
        }
      } catch {
        // ignore
      }
    };
    es.addEventListener('order.updated', handleEvent);
    es.addEventListener('order.created', handleEvent);

    return () => {
      cancelled = true;
      es.close();
    };
  }, [activeOrder, onOrderFinished]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const handleCepChange = async (raw: string) => {
    const d = raw.replace(/\D/g, '').slice(0, 8);
    const formatted = d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
    setCep(formatted);
    setCepMsg(null);
    if (d.length !== 8) return;
    try {
      const r = await fetch(`https://viacep.com.br/ws/${d}/json/`).then((res) => res.json());
      if (r.erro) throw new Error('CEP não encontrado');
      if (r.logradouro && !rua.trim()) setRua(`${r.logradouro}, `);
      const b = r.localidade === 'Aracaju' ? matchBairro(catalog, r.bairro) : null;
      const nextBairro = b || '__outro';
      setBairro(nextBairro);
      setBairroDoCep(nextBairro);
      if (!b) {
        setCepMsg(
          `Esse CEP fica em ${r.bairro || r.localidade}. Ainda não entregamos lá. Você pode pedir para retirar no balcão, sem fila.`,
        );
      }
    } catch {
      setCepMsg('Não encontramos esse CEP. Escolha o bairro na lista.');
    }
  };

  const bloqueiaEnvio =
    !sacola.length ||
    (ehEntrega && (bairro === '__outro' || faltaMin > 0 || !zona));

  const handleSubmit = async () => {
    const foneDigits = fone.replace(/\D/g, '');
    let falta = '';
    if (!sacola.length) falta = 'Escolha pelo menos um item.';
    else if (!nome.trim()) falta = 'Diga seu nome para chamarmos você.';
    else if (!mesa && foneDigits.length < 10) falta = 'Informe seu WhatsApp com DDD para falarmos com você.';
    else if (ehEntrega) {
      if (bairro === '__outro') falta = 'Ainda não entregamos nesse bairro. Escolha retirar no balcão.';
      else if (!zona) falta = 'Escolha o bairro da entrega (ou digite o CEP).';
      else if (faltaMin > 0) falta = `Faltam ${brl(faltaMin)} para o pedido mínimo de entrega.`;
      else if (rua.trim().replace(/,\s*$/, '').length < 4) falta = 'Diga a rua e o número para a entrega.';
    }

    setErro(falta);
    if (falta) return;

    setSubmitting(true);
    try {
      try {
        localStorage.setItem('diane-nome', nome.trim());
        localStorage.setItem('diane-fone', fone);
      } catch {
        // ignore
      }

      const localText = ehEntrega
        ? [rua.trim().replace(/,\s*$/, ''), comp.trim(), bairro, cep.trim() && `CEP ${cep.trim()}`]
            .filter(Boolean)
            .join(' · ')
        : '';

      const created = await api.createOrder({
        canal: mesa ? 'mesa' : ehEntrega ? 'entrega' : 'retirada',
        mesa: mesa ? mesa.n : null,
        nome: nome.trim().slice(0, 60),
        telefone: mesa ? '' : foneDigits.slice(0, 15),
        local: localText.slice(0, 200),
        bairro: ehEntrega ? bairro : '',
        quando: mesa || quando !== 'Agendar' ? 'agora' : hora,
        pagamento,
        obs: obs.trim().slice(0, 300),
        itens: sacola.map((l) => ({ id: l.id, q: l.q, sabor: l.sabor })),
      });

      if (catalog.config.whatsapp && !mesa) {
        const linhas = created.itens.map(
          (i) => `• ${i.q}x ${i.nome}${i.sabor ? ` (${i.sabor})` : ''} — ${brl(i.preco * i.q)}`,
        );
        const msg = [
          `Olá, Dianê. Acabei de fazer o pedido ${created.codigo} pelo site:`,
          '',
          ...linhas,
          '',
          ...(created.canal === 'entrega'
            ? [`Entrega: ${created.frete ? brl(created.frete) : 'grátis'} · ${created.local}`]
            : []),
          `*Total: ${brl(created.total)}*`,
        ].join('\n');
        setZapUrl(`https://wa.me/${catalog.config.whatsapp}?text=${encodeURIComponent(msg)}`);
      } else {
        setZapUrl(null);
      }

      onClearCart();
      setShowingDone(true);
      onOrderCreated({ id: created.id, codigo: created.codigo });
      setTrackedOrder(created);
    } catch (err) {
      setErro(
        err instanceof Error
          ? err.message
          : 'Não conseguimos enviar agora. Verifique a internet e tente de novo.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const taxas = catalog.config.delivery.zonas.map((z) => z.taxa);
  const currentStatus = trackedOrder?.status || 'novo';
  const stepIndex = ['novo', 'preparo', 'pronto', 'entregue'].indexOf(currentStatus);

  return (
    <>
      <Backdrop $on={open} onClick={onClose} />
      <Drawer $on={open} role="dialog" aria-modal="true" aria-hidden={!open}>
        <header>
          <h2>{showingDone ? 'Acompanhe o pedido' : 'Seu pedido'}</h2>
          <button className="fechar" onClick={onClose} aria-label="Fechar">
            ×
          </button>
        </header>

        <div className="rolar">
          {showingDone && activeOrder ? (
            <div className="feito">
              <p className="feito-sub">Pedido enviado</p>
              <h3>Pedido {activeOrder.codigo}</h3>
              <p>
                {mesa && currentStatus === 'pronto'
                  ? 'Seu pedido está pronto e já vai até a sua mesa.'
                  : STATUS_TEXT[currentStatus] || STATUS_TEXT.novo}
              </p>
              <ol className="etapas">
                {[
                  ['novo', 'Recebido'],
                  ['preparo', 'Preparando'],
                  ['pronto', 'Pronto'],
                  ['entregue', 'Entregue'],
                ].map(([key, label], idx) => (
                  <li
                    key={key}
                    className={`${idx <= stepIndex ? 'ok' : ''} ${idx === stepIndex ? 'agora' : ''}`}
                  >
                    {label}
                  </li>
                ))}
              </ol>
              {zapUrl && (
                <Btn $variant="zap" href={zapUrl} target="_blank" rel="noopener noreferrer">
                  Falar com a Dianê no WhatsApp
                </Btn>
              )}
              <Btn
                as="button"
                $variant="primario"
                onClick={() => {
                  setShowingDone(false);
                  onClose();
                  document.getElementById('combos')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Fazer outro pedido
              </Btn>
            </div>
          ) : (
            <>
              {!sacola.length ? (
                <div className="vazia">
                  <ProductArt name="cappuccino" />
                  <p>
                    Seu pedido está vazio.
                    <br />
                    Escolha um combo ou algo do cardápio.
                  </p>
                </div>
              ) : (
                <>
                  {sacola.map((l) => {
                    const info = findCatalogItem(catalog, l.id);
                    if (!info) return null;
                    const sub = [isCombo(info) ? 'Combo' : '', l.sabor ? `Sabor: ${l.sabor}` : '']
                      .filter(Boolean)
                      .join(' · ');
                    return (
                      <div className="lin" key={l.k}>
                        <div className="nome">
                          <b>
                            {isCombo(info) ? 'Combo ' : ''}
                            {info.nome}
                          </b>
                          {sub && <small>{sub}</small>}
                        </div>
                        <Stepper>
                          <button aria-label="Tirar um" onClick={() => onChangeQty(l.k, -1)}>
                            −
                          </button>
                          <span>{l.q}</span>
                          <button aria-label="Pôr mais um" onClick={() => onChangeQty(l.k, 1)}>
                            +
                          </button>
                        </Stepper>
                        <span className="v">{brl(info.preco * l.q)}</span>
                      </div>
                    );
                  })}

                  <div className="adicionais">
                    <p>Quer juntar um docinho ou uma bebida?</p>
                    <div className="chips-add">
                      {ADICIONAIS.map((id) => {
                        const p = catalog.produtos.find((x) => x.id === id);
                        if (!p || (!mesa && p.soNaMesa)) return null;
                        const q = sacola.filter((x) => x.id === id).reduce((s, x) => s + x.q, 0);
                        return (
                          <button key={id} type="button" onClick={() => onAdd(id)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                              <path d="M12 5v14M5 12h14" />
                            </svg>
                            {p.nome} <span>{brl(p.preco)}</span>
                            {q > 0 && <em>{q}</em>}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="form">
                    {mesa && (
                      <p className="mesa-aviso">
                        Você está na mesa {mesa.n} ({mesa.nome}). Levamos o pedido até você.
                      </p>
                    )}

                    <label>
                      Seu nome
                      <input
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        autoComplete="name"
                        placeholder="Como podemos te chamar"
                      />
                    </label>

                    {!mesa && (
                      <label>
                        Seu WhatsApp
                        <input
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          value={fone}
                          onChange={(e) => setFone(e.target.value)}
                          placeholder="(79) 9 0000-0000"
                        />
                      </label>
                    )}

                    {!mesa && catalog.config.entrega && (
                      <div className="grupo">
                        <span>Como você quer receber</span>
                        <div className="opcoes">
                          {(['Retirar no balcão', 'Entrega aqui perto'] as const).map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              aria-pressed={receber === opt}
                              onClick={() => setReceber(opt)}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {ehEntrega && (
                      <div className="entrega-box">
                        <div className="dupla">
                          <label>
                            CEP
                            <input
                              inputMode="numeric"
                              autoComplete="postal-code"
                              placeholder="49000-000"
                              maxLength={9}
                              value={cep}
                              onChange={(e) => handleCepChange(e.target.value)}
                            />
                          </label>
                          <label>
                            Bairro
                            <select
                              value={bairro}
                              onChange={(e) => {
                                const v = e.target.value;
                                if (cep && v !== bairroDoCep) setCep('');
                                setCepMsg(null);
                                setBairro(v);
                              }}
                            >
                              <option value="">Escolha</option>
                              {bairrosList.map((b) => (
                                <option key={b} value={b}>
                                  {b}
                                </option>
                              ))}
                              <option value="__outro">Outro bairro</option>
                            </select>
                          </label>
                        </div>
                        <label>
                          Rua e número
                          <input
                            autoComplete="address-line1"
                            maxLength={90}
                            value={rua}
                            onChange={(e) => setRua(e.target.value)}
                            placeholder="Rua ou avenida, número"
                          />
                        </label>
                        <label>
                          Complemento
                          <input
                            maxLength={60}
                            value={comp}
                            onChange={(e) => setComp(e.target.value)}
                            placeholder="Empresa, sala, apto ou referência"
                          />
                        </label>
                        <p
                          className={`frete-info ${
                            bairro === '__outro' || faltaMin > 0 || cepMsg ? 'alerta' : ''
                          }`}
                        >
                          {cepMsg ? (
                            cepMsg
                          ) : bairro === '__outro' ? (
                            'Ainda não entregamos nesse bairro. Você pode pedir para retirar no balcão, sem fila.'
                          ) : faltaMin > 0 ? (
                            <>
                              Faltam <b>{brl(faltaMin)}</b> para o pedido mínimo de entrega (
                              {brl(catalog.config.delivery.pedidoMinimo)}). Para retirar no balcão não há
                              mínimo.
                            </>
                          ) : !zona ? (
                            taxas.length ? (
                              `Digite o CEP ou escolha o bairro para ver a taxa. Entregamos por ${brl(
                                Math.min(...taxas),
                              )} a ${brl(Math.max(...taxas))}.`
                            ) : (
                              'Escolha o bairro.'
                            )
                          ) : frete === 0 ? (
                            <>
                              <b>Entrega grátis</b> em {bairro}. Chega em {zona.prazo}.
                            </>
                          ) : (
                            <>
                              Entrega em {bairro}: <b>{brl(frete)}</b>. Chega em {zona.prazo}.
                              {catalog.config.delivery.freteGratisAcima > 0 &&
                                ` A partir de ${brl(
                                  catalog.config.delivery.freteGratisAcima,
                                )} em produtos, a entrega é grátis.`}
                            </>
                          )}
                        </p>
                      </div>
                    )}

                    {!mesa && (
                      <>
                        <div className="grupo">
                          <span>Para quando</span>
                          <div className="opcoes">
                            {(['Agora', 'Agendar'] as const).map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                aria-pressed={quando === opt}
                                onClick={() => setQuando(opt)}
                              >
                                {opt === 'Agora' ? 'O quanto antes' : 'Escolher horário'}
                              </button>
                            ))}
                          </div>
                        </div>
                        {quando === 'Agendar' && (
                          <label>
                            Horário
                            <select value={hora} onChange={(e) => setHora(e.target.value)}>
                              {horarios.map((h) => (
                                <option key={h} value={h}>
                                  {h}
                                </option>
                              ))}
                            </select>
                          </label>
                        )}
                      </>
                    )}

                    <div className="grupo">
                      <span>Pagamento</span>
                      <div className="opcoes tres">
                        {(['Pix', 'Cartão', 'Dinheiro'] as const).map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            aria-pressed={pagamento === opt}
                            onClick={() => setPagamento(opt)}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <label>
                      Observação
                      <textarea
                        rows={2}
                        maxLength={300}
                        value={obs}
                        onChange={(e) => setObs(e.target.value)}
                        placeholder="Sabores da caixa, sem açúcar, um bilhete..."
                      />
                    </label>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {!showingDone && (
          <footer className="sacola-footer">
            {ehEntrega && sacola.length > 0 && (
              <>
                <div className="sub-total">
                  <span>Produtos</span>
                  <b>{brl(subtotal)}</b>
                </div>
                <div className="sub-total">
                  <span>Entrega</span>
                  <b>{frete === null ? '—' : frete === 0 ? 'Grátis' : brl(frete)}</b>
                </div>
              </>
            )}
            <div className="total">
              <span>Total</span>
              <b>{brl(totalFinal)}</b>
            </div>
            {erro && <p className="erro">{erro}</p>}
            <Btn
              as="button"
              $variant="primario"
              className={`btn-enviar ${bloqueiaEnvio ? 'inativo' : ''}`}
              disabled={submitting}
              onClick={handleSubmit}
            >
              {submitting
                ? 'Enviando...'
                : mesa
                  ? `Enviar pedido da mesa ${mesa.n}`
                  : 'Enviar pedido'}
            </Btn>
            <p className="aviso">
              {mesa
                ? 'O pedido chega na hora ao balcão. Você paga no balcão quando quiser.'
                : 'O pedido chega na hora ao balcão da Dianê. O pagamento é feito na retirada ou na entrega.'}
            </p>
          </footer>
        )}
      </Drawer>
    </>
  );
};

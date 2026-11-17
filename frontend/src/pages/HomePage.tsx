import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ProductArt, ProductArtSprite } from '../components/ProductArt';
import { CartDrawer } from '../components/home/CartDrawer';
import {
  Actions,
  AddButton,
  BagButton,
  Btn,
  Cab,
  ComboCard,
  CombosGrid,
  EmpresasSection,
  FlavorsRow,
  FloatingBar,
  GalleryGrid,
  HeroSection,
  Lead,
  MenuItemCard,
  MenuSectionWrapper,
  NumbersRow,
  OndeSection,
  PilaresBand,
  RitualSection,
  Section,
  SectionTitle,
  SiteFooter,
  Stepper,
  Tabs,
  ToastBanner,
  TopHeader,
  TrackFloatingBtn,
  Wrap,
} from '../components/home/HomeStyles';
import { api, brl, findCatalogItem, isCombo } from '../services/api';
import { CartItem, CatalogData, Combo, Product } from '../types/diane';

const CATS = [
  ['doces', 'Doces'],
  ['lanches', 'Lanches'],
  ['cafes', 'Cafés e bebidas'],
] as const;

const SORTIDOS = 'Sortidos, um de cada sabor';

export const HomePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [catalog, setCatalog] = useState<CatalogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [solido, setSolido] = useState(false);
  const [abaCat, setAbaCat] = useState<string>('doces');
  const [pessoas, setPessoas] = useState<number>(1);
  const [saborEscolhido, setSaborEscolhido] = useState<Record<string, string>>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showingDone, setShowingDone] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastOn, setToastOn] = useState(false);
  const toastTimer = useRef<number | null>(null);

  const [sacola, setSacola] = useState<CartItem[]>(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem('diane-sacola') || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [activeOrder, setActiveOrder] = useState<{ id: string; codigo: string } | null>(() => {
    try {
      return JSON.parse(localStorage.getItem('diane-ultimo') || 'null');
    } catch {
      return null;
    }
  });

  useEffect(() => {
    api
      .getCatalog()
      .then((data) => {
        setCatalog(data);
        setLoading(false);
      })
      .catch((err) => {
        setLoadError(err instanceof Error ? err.message : 'Erro ao carregar o cardápio.');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const onScroll = () => setSolido(window.scrollY > window.innerHeight * 0.7);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('diane-sacola', JSON.stringify(sacola));
    } catch {
      // ignore
    }
  }, [sacola]);

  const mesa = useMemo(() => {
    if (!catalog) return null;
    const n = parseInt(searchParams.get('mesa') || '', 10);
    return catalog.config.mesas.find((m) => m.n === n) || null;
  }, [catalog, searchParams]);

  const disponivel = useCallback(
    (item: Product | Combo) => {
      if (isCombo(item)) {
        return item.onde ? item.onde.includes(mesa ? 'mesa' : 'delivery') : true;
      }
      return Boolean(mesa) || !item.soNaMesa;
    },
    [mesa],
  );

  const pessoasOpts = useMemo(() => {
    if (!catalog || mesa) return [];
    return [...new Set(catalog.combos.filter((c) => c.pessoas && disponivel(c)).map((c) => c.pessoas))].sort(
      (a, b) => a - b,
    );
  }, [catalog, mesa, disponivel]);

  useEffect(() => {
    if (pessoasOpts.length && !pessoasOpts.includes(pessoas)) {
      setPessoas(pessoasOpts[0]);
    }
  }, [pessoasOpts, pessoas]);

  const saboresDe = useCallback(
    (item: Product | Combo): string[] => {
      if (!catalog || !item.sabores) return [];
      const g = item.sabores;
      const lista = catalog.sabores[g] || [];
      if (isCombo(item)) {
        const count = item.itens.filter(
          (pid) => catalog.produtos.find((p) => p.id === pid)?.sabores === g,
        ).length;
        return count > 1 ? [SORTIDOS, ...lista] : lista;
      }
      return lista;
    },
    [catalog],
  );

  const showToast = useCallback((txt: string) => {
    setToastMsg(txt);
    setToastOn(true);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastOn(false), 1800);
  }, []);

  const adicionar = useCallback(
    (id: string, sabor?: string | null) => {
      if (!catalog) return;
      const info = findCatalogItem(catalog, id);
      if (!info || !disponivel(info)) return;
      let chosenFlavor = sabor ?? null;
      if (info.sabores && !chosenFlavor) {
        chosenFlavor = saborEscolhido[id] || saboresDe(info)[0] || null;
      }
      const k = chosenFlavor ? `${id}|${chosenFlavor}` : id;
      setSacola((prev) => {
        const idx = prev.findIndex((x) => x.k === k);
        if (idx >= 0) {
          return prev.map((x, i) => (i === idx ? { ...x, q: x.q + 1 } : x));
        }
        return [...prev, { k, id, sabor: chosenFlavor, q: 1 }];
      });
      showToast(`${isCombo(info) ? 'Combo ' : ''}${info.nome} no pedido`);
    },
    [catalog, disponivel, saborEscolhido, saboresDe, showToast],
  );

  const mudarQtd = useCallback((k: string, delta: number) => {
    setSacola((prev) =>
      prev
        .map((x) => (x.k === k ? { ...x, q: x.q + delta } : x))
        .filter((x) => x.q > 0),
    );
  }, []);

  const removerUltimoPorId = useCallback((id: string) => {
    setSacola((prev) => {
      const idx = [...prev].reverse().findIndex((x) => x.id === id);
      if (idx === -1) return prev;
      const realIdx = prev.length - 1 - idx;
      return prev
        .map((x, i) => (i === realIdx ? { ...x, q: x.q - 1 } : x))
        .filter((x) => x.q > 0);
    });
  }, []);

  const qtdDe = (id: string) => sacola.filter((l) => l.id === id).reduce((s, l) => s + l.q, 0);
  const totalQtd = sacola.reduce((s, l) => s + l.q, 0);
  const subtotal = catalog
    ? sacola.reduce((s, l) => s + (findCatalogItem(catalog, l.id)?.preco ?? 0) * l.q, 0)
    : 0;

  const handleOrderCreated = useCallback((reg: { id: string; codigo: string }) => {
    setActiveOrder(reg);
    try {
      localStorage.setItem('diane-ultimo', JSON.stringify(reg));
    } catch {
      // ignore
    }
  }, []);

  const handleOrderFinished = useCallback(() => {
    setActiveOrder(null);
    try {
      localStorage.removeItem('diane-ultimo');
    } catch {
      // ignore
    }
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: 'var(--torra)' }}>
        <p style={{ fontWeight: 700 }}>Carregando o cardápio da Dianê...</p>
      </div>
    );
  }

  if (loadError || !catalog) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, textAlign: 'center' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--titulo)', color: 'var(--torra)', marginBottom: 8 }}>Dianê</h1>
          <p style={{ color: 'var(--suave)' }}>{loadError || 'Cardápio indisponível no momento.'}</p>
        </div>
      </div>
    );
  }

  const now = new Date();
  const hNow = now.getHours() + now.getMinutes() / 60;
  const aberto =
    catalog.config.diasAbertos.includes(now.getDay()) &&
    hNow >= catalog.config.abre &&
    hNow < catalog.config.fecha;

  const pedidoMinimo = catalog.config.delivery.pedidoMinimo || 25;
  const caixa12 = catalog.produtos.find((p) => p.id === 'caixa-12');
  const itensFora = catalog.produtos.filter((p) => p.cat === abaCat && !disponivel(p));

  const renderControl = (item: Product | Combo) => {
    if (!item.sabores) {
      const q = qtdDe(item.id);
      if (q > 0) {
        return (
          <Stepper>
            <button aria-label="Tirar um" onClick={() => removerUltimoPorId(item.id)}>
              −
            </button>
            <span>{q}</span>
            <button aria-label="Pôr mais um" onClick={() => adicionar(item.id)}>
              +
            </button>
          </Stepper>
        );
      }
    }
    return (
      <AddButton onClick={() => adicionar(item.id)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Adicionar
      </AddButton>
    );
  };

  return (
    <>
      <ProductArtSprite />

      <TopHeader $solido={solido}>
        <Wrap className="inner">
          <a className="marca" href="#inicio" aria-label="Dianê, início">
            <img
              src={solido ? '/midia/diane-nome-caramelo.svg' : '/midia/diane-nome-creme.svg'}
              alt="Dianê"
            />
          </a>
          <nav aria-label="Principal">
            <a href="#combos">Combos</a>
            <a href="#cardapio">Cardápio</a>
            <a href="#caixa">Caixas</a>
            <a href="#empresas">Reuniões</a>
            <a href="#loja">A loja</a>
            <a href="#onde">Onde fica</a>
          </nav>
          <BagButton
            onClick={() => {
              if (sacola.length) setShowingDone(false);
              setDrawerOpen(true);
            }}
            aria-label="Abrir pedido"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 7h12l-1 13H7z" />
              <path d="M9 7a3 3 0 0 1 6 0" />
            </svg>
            Pedido <span className="n">{totalQtd}</span>
          </BagButton>
        </Wrap>
      </TopHeader>

      <main id="inicio">
        <HeroSection aria-label="Abertura">
          <img
            className="poster"
            src="/midia/loja-entrada.jpg"
            alt="Fachada da Dianê no pátio da galeria, com o letreiro e o toldo caramelo"
          />
          <Wrap className="hero-wrap">
            {mesa ? (
              <>
                <h1>
                  Bem-vindo à Dianê.
                  <br />
                  <i>Peça daqui da mesa {mesa.n}.</i>
                </h1>
                <p>
                  Escolha no cardápio e envie. O pedido aparece na hora no balcão e levamos até a sua mesa.
                </p>
              </>
            ) : (
              <>
                <h1>
                  Doces, lanches e café para levar.
                  <i>Um pedacinho de felicidade no meio do dia.</i>
                </h1>
                <p>
                  Brigadeiros feitos à mão, bolos e tortas, sanduíche natural, pão de queijo mineiro e café
                  moído na hora. Peça por aqui e retire no balcão sem fila, ou receba no trabalho.
                </p>
              </>
            )}
            <Actions>
              <Btn $variant="primario" href="#cardapio">
                Fazer meu pedido
              </Btn>
              <Btn $variant="claro" href="#empresas">
                Pedidos para reunião
              </Btn>
            </Actions>
            <div className="chips">
              {mesa && <span className="chip-mesa">Mesa {mesa.n} · peça por aqui</span>}
              <span className={`aberto ${!aberto ? 'fechado' : ''}`}>
                {aberto
                  ? `Aberto agora · até ${catalog.config.fecha}h`
                  : `Fechado agora · seg a sáb, ${catalog.config.abre}h às ${catalog.config.fecha}h`}
              </span>
              <span>Av. Augusto Maynard, 201 · São José</span>
            </div>
          </Wrap>
        </HeroSection>

        <PilaresBand>
          <Wrap>
            <p>
              Feito com <b>afeto</b>, do jeito da <b>tradição</b>, com <b>sabor</b> de verdade, para chegar
              à sua <b>mesa</b>.
            </p>
          </Wrap>
        </PilaresBand>

        <Section id="combos">
          <Wrap>
            <Cab>
              <div>
                <SectionTitle>Combos prontos, de 1 a 20 pessoas</SectionTitle>
              </div>
              <Lead>
                {mesa
                  ? 'Junte o café com o que combina e pague menos. Nos combos você escolhe o sabor.'
                  : `Escolha para quantas pessoas. Retire no balcão sem fila, ou receba aqui perto a partir de ${brl(pedidoMinimo)}.`}
              </Lead>
            </Cab>

            {!mesa && pessoasOpts.length > 0 && (
              <Tabs role="tablist">
                {pessoasOpts.map((n) => (
                  <button
                    key={n}
                    role="tab"
                    aria-selected={n === pessoas}
                    onClick={() => setPessoas(n)}
                  >
                    {n === 1 ? 'Para 1 pessoa' : n >= 6 ? `Reunião · ${n}` : `Para ${n} pessoas`}
                  </button>
                ))}
              </Tabs>
            )}

            <CombosGrid>
              {catalog.combos
                .filter((c) => disponivel(c) && (mesa || !pessoasOpts.length || c.pessoas === pessoas))
                .map((c) => {
                  const cheio = c.itens.reduce(
                    (s, pid) => s + (catalog.produtos.find((p) => p.id === pid)?.preco ?? 0),
                    0,
                  );
                  const artes = c.arte?.length ? c.arte : [...new Set(c.itens)];
                  const flavors = saboresDe(c);
                  const activeFlavor = saborEscolhido[c.id] || flavors[0];
                  return (
                    <ComboCard key={c.id}>
                      <div className="arte">
                        {c.selo && <span className="selo">{c.selo}</span>}
                        {artes.map((a, idx) => (
                          <ProductArt key={`${a}-${idx}`} name={a} />
                        ))}
                      </div>
                      <div className="corpo">
                        <h3>{c.nome}</h3>
                        <p>{c.desc}</p>
                        {flavors.length > 0 && (
                          <FlavorsRow role="group" aria-label={catalog.saboresNome[c.sabores || ''] || 'Sabor'}>
                            {flavors.map((s) => (
                              <button
                                key={s}
                                type="button"
                                aria-pressed={s === activeFlavor}
                                onClick={() => setSaborEscolhido((prev) => ({ ...prev, [c.id]: s }))}
                              >
                                {s}
                              </button>
                            ))}
                          </FlavorsRow>
                        )}
                        <div className="preco">
                          <div>
                            <b>{brl(c.preco)}</b>
                            <s>{brl(cheio)}</s>
                          </div>
                          {renderControl(c)}
                        </div>
                      </div>
                    </ComboCard>
                  );
                })}
            </CombosGrid>
          </Wrap>
        </Section>

        <MenuSectionWrapper id="cardapio">
          <Wrap>
            <Cab>
              <div>
                <SectionTitle>Doces, lanches e café</SectionTitle>
              </div>
              <Lead>
                Doces feitos à mão todos os dias, lanches leves e as bebidas da máquina Nestlé, com o grão
                moído na hora.
              </Lead>
            </Cab>

            {!mesa && (
              <p className="monte-status">
                {subtotal === 0 ? (
                  <>
                    Toque em <b>+</b> para montar. Entregamos a partir de {brl(pedidoMinimo)}.
                  </>
                ) : subtotal < pedidoMinimo ? (
                  <>
                    Seu pedido está em <b>{brl(subtotal)}</b>. Faltam {brl(pedidoMinimo - subtotal)} para a
                    entrega.
                  </>
                ) : (
                  <>
                    Seu pedido está em <b>{brl(subtotal)}</b>. Já dá para entregar.
                  </>
                )}
              </p>
            )}

            <Tabs role="tablist">
              {CATS.map(([k, label]) => (
                <button key={k} role="tab" aria-selected={k === abaCat} onClick={() => setAbaCat(k)}>
                  {label}
                </button>
              ))}
            </Tabs>

            <div className="itens" role="tabpanel">
              {catalog.produtos
                .filter((p) => p.cat === abaCat && disponivel(p))
                .map((p) => {
                  const flavors = saboresDe(p);
                  const activeFlavor = saborEscolhido[p.id] || flavors[0];
                  return (
                    <MenuItemCard key={p.id}>
                      <div className="arte">
                        <ProductArt name={p.arte} />
                      </div>
                      <div className="txt">
                        {p.tag && <span className="tag">{p.tag}</span>}
                        <h3>{p.nome}</h3>
                        <p>{p.desc}</p>
                        {flavors.length > 0 && (
                          <FlavorsRow role="group" aria-label={catalog.saboresNome[p.sabores || ''] || 'Sabor'}>
                            {flavors.map((s) => (
                              <button
                                key={s}
                                type="button"
                                aria-pressed={s === activeFlavor}
                                onClick={() => setSaborEscolhido((prev) => ({ ...prev, [p.id]: s }))}
                              >
                                {s}
                              </button>
                            ))}
                          </FlavorsRow>
                        )}
                        <div className="linha-add">
                          <span className="valor">{brl(p.preco)}</span>
                          {renderControl(p)}
                        </div>
                      </div>
                    </MenuItemCard>
                  );
                })}
              {itensFora.length > 0 && (
                <p className="nota-cat">{itensFora.map((p) => p.nome).join(', ')}: servido só aqui na loja.</p>
              )}
            </div>
          </Wrap>
        </MenuSectionWrapper>

        <RitualSection id="caixa">
          <Wrap className="ritual-wrap">
            <div>
              <SectionTitle>Monte sua caixa de brigadeiros</SectionTitle>
              <Lead className="lead">
                Sete sabores feitos à mão: tradicional, ninho, pistache, morango, churros, café e maracujá. A
                caixa sai lacrada com o selo da casa.
              </Lead>
              <div className="passos">
                <div className="passo">
                  <div>
                    <b>Escolha o tamanho</b>
                    <span>4, 6, 12 ou 25 brigadeiros.</span>
                  </div>
                </div>
                <div className="passo">
                  <div>
                    <b>Escolha os sabores</b>
                    <span>A sortida da casa, só os clássicos ou do seu jeito.</span>
                  </div>
                </div>
                <div className="passo">
                  <div>
                    <b>Leve com um bilhete</b>
                    <span>O cartão "pra você" vai junto, para escrever à mão.</span>
                  </div>
                </div>
              </div>
              <Btn as="button" $variant="primario" onClick={() => adicionar('caixa-12')}>
                Quero a caixa com 12 · {brl(caixa12?.preco ?? 48)}
              </Btn>
            </div>
            <figure>
              <img
                src="/midia/caixas.jpg"
                alt="Caixas de brigadeiro da Dianê: tampa caramelo, caixa aberta com doze sabores e a caixa de seis com cinta"
                loading="lazy"
              />
            </figure>
          </Wrap>
        </RitualSection>

        <Section id="loja">
          <Wrap>
            <Cab>
              <div>
                <SectionTitle>Pequena, no caminho do seu dia</SectionTitle>
              </div>
              <Lead>
                Uma loja de 8,8 m² no pátio da galeria, feita para pedir, pegar e levar. O pedido do site
                chega na hora ao balcão.
              </Lead>
            </Cab>
            <GalleryGrid>
              <figure>
                <img src="/midia/loja-balcao.jpg" alt="Balcão caramelo com a vitrine de brigadeiros" loading="lazy" />
              </figure>
              <figure>
                <img src="/midia/takeaway.jpg" alt="Embalagens para levar" loading="lazy" />
              </figure>
              <figure>
                <img src="/midia/bolos.jpg" alt="Caixa de bolo inteiro e fatia de bolo" loading="lazy" />
              </figure>
              <figure>
                <img src="/midia/copos.jpg" alt="Copos da Dianê em três tamanhos" loading="lazy" />
              </figure>
              <figure>
                <img src="/midia/sacola.jpg" alt="Sacola caramelo da Dianê com papel de seda" loading="lazy" />
              </figure>
            </GalleryGrid>
            <NumbersRow>
              <div>
                <b>
                  {catalog.config.abre}h às {catalog.config.fecha}h
                </b>
                <span>de segunda a sábado</span>
              </div>
              <div>
                <b>Sem fila</b>
                <span>peça no site e só retire</span>
              </div>
              <div>
                <b>~3 min</b>
                <span>para o seu café sair</span>
              </div>
              <div>
                <b>Entrega perto</b>
                <span>no São José e arredores</span>
              </div>
            </NumbersRow>
          </Wrap>
        </Section>

        <EmpresasSection id="empresas">
          <Wrap>
            <div className="cartao-emp">
              <div>
                <SectionTitle>O café da sua reunião, pronto e embalado</SectionTitle>
                <div className="emp-lista">
                  <div>
                    <b>Combos para reunião</b>
                    <span>
                      Para 6, 10 ou 20 pessoas: sanduíches, pão de queijo, café com leite e brigadeiros. Peça
                      até a véspera.
                    </span>
                  </div>
                  <div>
                    <b>Coffee breaks especiais</b>
                    <span>Para cursos, eventos e lançamentos, com o cardápio montado sob medida.</span>
                  </div>
                  <div>
                    <b>Encomendas</b>
                    <span>Bolos e tortas inteiros, brigadeiros por cento e caixas para brindes e datas especiais.</span>
                  </div>
                </div>
                <Actions className="acoes">
                  <Btn
                    as="button"
                    $variant="primario"
                    onClick={() => {
                      setPessoas(6);
                      document.getElementById('combos')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Ver combos para reunião
                  </Btn>
                  {catalog.config.whatsapp && (
                    <Btn
                      $variant="zap"
                      href={`https://wa.me/${catalog.config.whatsapp}?text=${encodeURIComponent(
                        'Olá, Dianê. Quero um orçamento para coffee break ou encomenda.',
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Pedir orçamento
                    </Btn>
                  )}
                </Actions>
              </div>
              <img
                src="/midia/takeaway.jpg"
                alt="Caixa de reunião chocolate com alça caramelo, ao lado das embalagens para levar"
                loading="lazy"
              />
            </div>
          </Wrap>
        </EmpresasSection>

        <OndeSection id="onde">
          <Wrap className="onde-wrap">
            <div>
              <SectionTitle>Pertinho da Caixa, no pátio da galeria</SectionTitle>
              <div className="info">
                <div>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z" />
                    <circle cx="12" cy="10" r="2.5" />
                  </svg>
                  <div>
                    <b>Av. Augusto Maynard, 201</b>
                    <span>Bairro São José, Aracaju · SE · entrada pela lateral, no pátio</span>
                  </div>
                </div>
                <div>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                  <div>
                    <b>
                      Segunda a sábado, das {catalog.config.abre}h às {catalog.config.fecha}h
                    </b>
                    <span>Do café da manhã ao doce da tarde</span>
                  </div>
                </div>
                <div>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z" />
                  </svg>
                  <div>
                    <b>Pedidos pelo site</b>
                    <span>Monte o pedido aqui e acompanhe até ficar pronto</span>
                  </div>
                </div>
              </div>
              <Actions>
                <Btn
                  $variant="primario"
                  href="https://www.google.com/maps/search/?api=1&query=Av.+Augusto+Maynard,+201,+S%C3%A3o+Jos%C3%A9,+Aracaju"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Abrir no mapa
                </Btn>
                {catalog.config.whatsapp && (
                  <Btn
                    $variant="zap"
                    href={`https://wa.me/${catalog.config.whatsapp}?text=${encodeURIComponent(
                      'Olá, Dianê. Tenho uma dúvida.',
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Falar no WhatsApp
                  </Btn>
                )}
              </Actions>
            </div>
            <img src="/midia/loja-rua.jpg" alt="A Dianê vista da rua, com a placa sobre a janela" loading="lazy" />
          </Wrap>
        </OndeSection>
      </main>

      <SiteFooter>
        <Wrap className="footer-wrap">
          <p className="frase">
            um pedacinho
            <br />
            <span>de felicidade.</span>
          </p>
          <img src="/midia/diane-logo-creme.svg" alt="Dianê" />
          <p>
            <i>O sabor que faltava no seu dia.</i>
            <br />
            Av. Augusto Maynard, 201 · São José · Aracaju · SE
            <br />
            Seg a sáb · {catalog.config.abre}h às {catalog.config.fecha}h
          </p>
          <p>
            © {new Date().getFullYear()} Dianê ·{' '}
            <Link to="/balcao" style={{ color: 'var(--areia)' }}>
              Área da equipe
            </Link>
          </p>
        </Wrap>
      </SiteFooter>

      <FloatingBar $on={totalQtd > 0 && !drawerOpen} role="region" aria-label="Resumo do pedido">
        <div>
          <small>{totalQtd === 1 ? '1 item' : `${totalQtd} itens`}</small>
          <b>{brl(subtotal)}</b>
        </div>
        <Btn
          as="button"
          $variant="primario"
          style={{ padding: '12px 18px' }}
          onClick={() => {
            if (sacola.length) setShowingDone(false);
            setDrawerOpen(true);
          }}
        >
          Ver pedido
        </Btn>
      </FloatingBar>

      {activeOrder && !drawerOpen && (
        <TrackFloatingBtn
          type="button"
          onClick={() => {
            setShowingDone(true);
            setDrawerOpen(true);
          }}
        >
          Acompanhar pedido {activeOrder.codigo}
        </TrackFloatingBtn>
      )}

      <ToastBanner $on={toastOn}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M5 12l5 5L20 7" />
        </svg>
        <span>{toastMsg}</span>
      </ToastBanner>

      <CartDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        catalog={catalog}
        sacola={sacola}
        onChangeQty={mudarQtd}
        onAdd={adicionar}
        onClearCart={() => setSacola([])}
        mesa={mesa}
        activeOrder={activeOrder}
        onOrderCreated={handleOrderCreated}
        onOrderFinished={handleOrderFinished}
        showingDone={showingDone}
        setShowingDone={setShowingDone}
      />
    </>
  );
};

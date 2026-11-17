import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { brl, itemCost, pct } from '../../services/api';
import { CatalogData, Order } from '../../types/diane';
import { Chip, FiltersRow } from './CounterStyles';

const KpisGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 16px;
  @media (max-width: 900px) { grid-template-columns: 1fr 1fr; }
`;

const KpiCard = styled.div<{ $destaque?: boolean; $neg?: boolean }>`
  background: ${(p) => (p.$destaque ? 'var(--torra)' : '#fff')};
  border-radius: 18px;
  padding: 18px;
  span {
    font-size: 12.5px;
    font-weight: 700;
    color: ${(p) => (p.$destaque ? 'var(--areia)' : '#6B5444')};
    text-transform: uppercase;
    letter-spacing: .06em;
  }
  b {
    display: block;
    font-size: 28px;
    font-weight: 800;
    color: ${(p) => (p.$neg ? '#F2A58C' : p.$destaque ? '#fff' : 'var(--torra)')};
    margin-top: 6px;
  }
  small {
    font-size: 12.5px;
    color: ${(p) => (p.$destaque ? 'var(--areia)' : '#6B5444')};
  }
`;

const BlocksGrid = styled.div`
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 16px;
  @media (max-width: 1000px) { grid-template-columns: 1fr; }
`;

const Block = styled.div`
  background: #fff;
  border-radius: 18px;
  padding: 20px;
  min-width: 0;
  h2 { font-size: 15px; font-weight: 800; color: var(--torra); margin-bottom: 12px; }
  p.nota { font-size: 12.5px; color: #6B5444; margin-top: 10px; }
`;

const DreTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  td {
    padding: 9px 4px;
    border-bottom: 1px solid #E3D5C4;
    &:nth-child(2) { text-align: right; white-space: nowrap; }
    &:nth-child(3) { text-align: right; color: #6B5444; font-size: 12.5px; width: 60px; }
  }
  tr.sub td { font-weight: 800; color: var(--torra); background: var(--creme); }
  tr.menos td:first-child { padding-left: 18px; color: #6B5444; }
  tr.fim td { font-weight: 800; font-size: 16px; color: #fff; background: var(--torra); }
  tr.fim.neg td { background: #C8461F; }
`;

const EqBar = styled.div`
  height: 14px;
  background: var(--leite);
  border-radius: 999px;
  overflow: hidden;
  margin: 10px 0 6px;
  div { height: 100%; background: #2F7D4F; border-radius: 999px; transition: width .4s; }
`;

const HoursChart = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 6px;
  height: 150px;
  padding-top: 18px;
  div {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    gap: 4px;
    height: 100%;
    min-width: 0;
  }
  i { display: block; width: 100%; background: var(--caramelo); border-radius: 6px 6px 0 0; min-height: 2px; }
  small { font-size: 11px; color: #6B5444; }
  em { font-size: 10.5px; font-style: normal; color: var(--torra); font-weight: 700; }
`;

const RankList = styled.div`
  display: grid;
  gap: 8px;
  div { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 2px 10px; font-size: 13.5px; }
  i { grid-column: 1 / -1; height: 8px; border-radius: 999px; background: var(--leite); overflow: hidden; }
  i u { display: block; height: 100%; background: var(--avela); }
  b { text-align: right; }
`;

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

interface Props {
  catalog: CatalogData;
  orders: Order[];
}

export const ResultsDre: React.FC<Props> = ({ catalog, orders }) => {
  const [periodo, setPeriodo] = useState<'hoje' | '7d' | 'mes'>('hoje');

  const data = useMemo(() => {
    const D = catalog.config.dre;
    const agora = new Date();
    const ini =
      periodo === 'hoje'
        ? startOfDay()
        : periodo === '7d'
          ? startOfDay(new Date(Date.now() - 6 * 864e5))
          : new Date(agora.getFullYear(), agora.getMonth(), 1);

    const v = orders.filter((p) => p.criadoEm >= +ini && p.status !== 'cancelado');
    const receita = v.reduce((s, p) => s + p.total, 0);
    const fretes = v.reduce((s, p) => s + (p.frete || 0), 0);
    const entregas = v.filter((p) => p.canal === 'entrega').length;
    const custoEntregas = entregas * (catalog.config.delivery.custoPorEntrega || 0);
    const cmv = v.reduce(
      (s, p) => s + p.itens.reduce((x, i) => x + (i.custo ?? itemCost(catalog, i.id)) * i.q, 0),
      0,
    );
    const simples = receita * D.simples;
    const taxas = v.reduce((s, p) => s + p.total * (D.taxas[p.pagamento] || 0), 0);
    const perdas = (receita - fretes) * D.perdas;
    const liquida = receita - simples - taxas;
    const bruto = liquida - cmv - perdas - custoEntregas;
    const fixoMes = D.custosFixos.reduce((s, c) => s + c.valor, 0);

    let dias = 0;
    if (periodo === 'hoje') {
      dias = catalog.config.diasAbertos.includes(agora.getDay()) ? 1 : 0;
    } else {
      for (let d = startOfDay(ini); d <= agora; d = new Date(+d + 864e5)) {
        if (catalog.config.diasAbertos.includes(d.getDay())) dias++;
      }
    }

    const fixo = (fixoMes * dias) / D.diasAbertosNoMes;
    const lucro = bruto - fixo;
    const reserva = lucro > 0 ? lucro * D.reserva : 0;
    const div = lucro > 0 ? (lucro - reserva) / D.socios.length : 0;
    const ped = v.length;
    const ticket = ped ? receita / ped : 0;

    const margemContrib = receita ? bruto / receita : 1 - D.simples - D.perdas - 0.3;
    const eqDia = fixoMes / D.diasAbertosNoMes / Math.max(margemContrib, 0.05);
    const meta = eqDia * Math.max(dias, 1);
    const prog = meta ? Math.min(receita / meta, 1) : 0;

    const hs: number[] = [];
    for (let h = catalog.config.abre; h < catalog.config.fecha; h++) hs.push(h);
    const porHora = hs.map((h) =>
      v.filter((p) => new Date(p.criadoEm).getHours() === h).reduce((s, p) => s + p.total, 0),
    );
    const mxHora = Math.max(...porHora, 1);

    const prods: Record<string, { q: number; r: number }> = {};
    v.forEach((p) =>
      p.itens.forEach((i) => {
        prods[i.nome] = prods[i.nome] || { q: 0, r: 0 };
        prods[i.nome].q += i.q;
        prods[i.nome].r += i.preco * i.q;
      }),
    );
    const top = Object.entries(prods)
      .sort((a, b) => b[1].r - a[1].r)
      .slice(0, 7);
    const mr = top.length ? top[0][1].r : 1;

    const soma = (fn: (p: Order) => string) => {
      const o: Record<string, number> = {};
      v.forEach((p) => {
        const k = fn(p);
        o[k] = (o[k] || 0) + p.total;
      });
      return Object.entries(o).sort((a, b) => b[1] - a[1]);
    };
    const canais = [...soma((p) => ROTULO[p.canal] || p.canal), ...soma((p) => p.pagamento)];

    return {
      D,
      receita,
      fretes,
      entregas,
      custoEntregas,
      cmv,
      simples,
      taxas,
      perdas,
      liquida,
      bruto,
      dias,
      lucro,
      reserva,
      div,
      ped,
      ticket,
      meta,
      prog,
      hs,
      porHora,
      mxHora,
      top,
      mr,
      canais,
    };
  }, [catalog, orders, periodo]);

  const row = (label: string, val: number, cls = '') => (
    <tr key={label} className={cls}>
      <td>{label}</td>
      <td>{brl(val)}</td>
      <td>{data.receita ? pct(Math.abs(val) / data.receita) : ''}</td>
    </tr>
  );

  return (
    <section>
      <FiltersRow>
        {(
          [
            ['hoje', 'Hoje'],
            ['7d', 'Últimos 7 dias'],
            ['mes', 'Este mês'],
          ] as const
        ).map(([p, label]) => (
          <Chip key={p} aria-pressed={periodo === p} onClick={() => setPeriodo(p)}>
            {label}
          </Chip>
        ))}
        <span className="resumo-dia">Atualiza sozinho a cada venda</span>
      </FiltersRow>

      <KpisGrid>
        <KpiCard>
          <span>Faturamento</span>
          <b>{brl(data.receita)}</b>
          <small>{data.ped} pedidos</small>
        </KpiCard>
        <KpiCard>
          <span>Ticket médio</span>
          <b>{brl(data.ticket)}</b>
          <small>por pedido</small>
        </KpiCard>
        <KpiCard>
          <span>Margem dos produtos</span>
          <b>{pct(data.receita ? (data.receita - data.cmv) / data.receita : NaN)}</b>
          <small>CMV de {brl(data.cmv)}</small>
        </KpiCard>
        <KpiCard $destaque $neg={data.lucro < 0}>
          <span>Lucro operacional</span>
          <b>{brl(data.lucro)}</b>
          <small>depois dos custos fixos</small>
        </KpiCard>
      </KpisGrid>

      <BlocksGrid>
        <Block>
          <h2>DRE do período</h2>
          <DreTable>
            <tbody>
              {row('Receita bruta de vendas', data.receita, 'sub')}
              {data.fretes > 0 &&
                row(`dos quais, taxas de entrega (${data.entregas} entregas)`, data.fretes, 'menos')}
              {row('(−) Simples Nacional', -data.simples, 'menos')}
              {row('(−) Taxas de cartão', -data.taxas, 'menos')}
              {row('Receita líquida', data.liquida, 'sub')}
              {row('(−) Custo dos produtos (CMV)', -data.cmv, 'menos')}
              {row('(−) Perdas estimadas', -data.perdas, 'menos')}
              {data.custoEntregas > 0 &&
                row('(−) Custo das entregas (motoboy)', -data.custoEntregas, 'menos')}
              {row('Lucro bruto', data.bruto, 'sub')}
              {data.D.custosFixos.map((c) =>
                row(`(−) ${c.nome}`, -((c.valor * data.dias) / data.D.diasAbertosNoMes), 'menos'),
              )}
              {row('Lucro operacional', data.lucro, `fim ${data.lucro < 0 ? 'neg' : ''}`)}
              {data.lucro > 0 && (
                <>
                  {row(`(−) Reserva no caixa (${pct(data.D.reserva)})`, -data.reserva, 'menos')}
                  {data.D.socios.map((s) => row(`Dividendo · ${s}`, data.div, 'menos'))}
                </>
              )}
            </tbody>
          </DreTable>
          <p className="nota">
            Custos fixos proporcionais a {data.dias} dia(s) de funcionamento (de {data.D.diasAbertosNoMes}{' '}
            no mês). CMV pelo custo de cada produto no cardápio. Simples, taxas e perdas são estimativas:
            confira com o contador.
          </p>
        </Block>

        <div style={{ display: 'grid', gap: 16, minWidth: 0 }}>
          <Block>
            <h2>{periodo === 'hoje' ? 'Equilíbrio de hoje' : 'Equilíbrio do período'}</h2>
            <EqBar>
              <div style={{ width: `${(data.prog * 100).toFixed(1)}%` }} />
            </EqBar>
            <p style={{ fontSize: 14 }}>
              {brl(data.receita)} de {brl(data.meta)}{' '}
              <span style={{ color: '#6B5444' }}>({pct(data.receita / data.meta)})</span>
            </p>
            <p className="nota">
              {data.receita >= data.meta
                ? 'Custos do período pagos. Daqui em diante é lucro.'
                : `Faltam ${brl(data.meta - data.receita)} para pagar os custos do período, cerca de ${Math.ceil(
                    (data.meta - data.receita) / (data.ticket || 17),
                  )} pedidos.`}
            </p>
          </Block>

          <Block>
            <h2>Vendas por hora</h2>
            <HoursChart>
              {data.hs.map((h, k) => (
                <div key={h} title={`${h}h: ${brl(data.porHora[k])}`}>
                  {data.porHora[k] > 0 && <em>{Math.round(data.porHora[k])}</em>}
                  <i style={{ height: `${((data.porHora[k] / data.mxHora) * 100).toFixed(1)}%` }} />
                  <small>{h}h</small>
                </div>
              ))}
            </HoursChart>
          </Block>

          <Block>
            <h2>O que mais vende</h2>
            <RankList>
              {data.top.length ? (
                data.top.map(([n, x]) => (
                  <div key={n}>
                    <span>
                      {n} <small style={{ color: '#6B5444' }}>· {x.q} un.</small>
                    </span>
                    <b>{brl(x.r)}</b>
                    <i>
                      <u style={{ width: `${((x.r / data.mr) * 100).toFixed(1)}%` }} />
                    </i>
                  </div>
                ))
              ) : (
                <p className="nota">Sem vendas no período.</p>
              )}
            </RankList>
          </Block>

          <Block>
            <h2>Por canal e pagamento</h2>
            <RankList>
              {data.canais.length ? (
                data.canais.map(([n, x]) => (
                  <div key={n}>
                    <span>{n}</span>
                    <b>
                      {brl(x)}{' '}
                      <small style={{ color: '#6B5444', fontWeight: 600 }}>
                        {pct(data.receita ? x / data.receita : 0)}
                      </small>
                    </b>
                    <i>
                      <u
                        style={{
                          width: `${data.receita ? ((x / data.receita) * 100).toFixed(1) : 0}%`,
                        }}
                      />
                    </i>
                  </div>
                ))
              ) : (
                <p className="nota">Sem vendas no período.</p>
              )}
            </RankList>
          </Block>
        </div>
      </BlocksGrid>
    </section>
  );
};

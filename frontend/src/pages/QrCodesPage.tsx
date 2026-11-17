import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import styled from 'styled-components';
import { api } from '../services/api';
import { CatalogData } from '../types/diane';

const Page = styled.div`
  min-height: 100vh;
  background: #E9E1D6;
  color: var(--torra);
  padding: 24px 16px;
  @media print {
    background: #fff;
    padding: 0;
  }
`;

const Bar = styled.div`
  max-width: 900px;
  margin: 0 auto 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  h1 { font-size: 22px; font-weight: 800; }
  p { font-size: 13.5px; color: var(--suave); max-width: 560px; }
  button {
    background: var(--caramelo);
    color: #fff;
    border-radius: 999px;
    padding: 12px 20px;
    font: 700 14px Jost, sans-serif;
  }
  @media print { display: none; }
`;

const Sheet = styled.div`
  max-width: 900px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  @media (max-width: 640px) { grid-template-columns: 1fr; }
  @media print { gap: 8mm; max-width: none; }
`;

const Plaque = styled.section<{ $escura: boolean }>`
  background: ${(p) => (p.$escura ? 'var(--torra)' : 'var(--leite)')};
  color: ${(p) => (p.$escura ? '#fff' : 'var(--torra)')};
  border-radius: 22px;
  padding: 26px 22px;
  display: grid;
  justify-items: center;
  text-align: center;
  gap: 10px;
  break-inside: avoid;
  aspect-ratio: 10 / 14;
  @media print { border: 1px dashed #ccc; }

  img.logo { width: 170px; }
  .mesa {
    font-size: 13px;
    font-weight: 800;
    letter-spacing: .2em;
    text-transform: uppercase;
    color: ${(p) => (p.$escura ? '#E39A8C' : 'var(--caramelo)')};
  }
  h2 {
    font-family: Fraunces, Georgia, serif;
    font-size: 26px;
    font-weight: 800;
    line-height: 1.1;
  }
  .qr {
    background: #fff;
    padding: 12px;
    border-radius: 16px;
    width: 62%;
    aspect-ratio: 1;
    svg { width: 100%; height: 100%; display: block; }
  }
  .sub { font-size: 14px; font-weight: 600; color: ${(p) => (p.$escura ? 'var(--areia)' : 'var(--suave)')}; }
  .slogan { font-style: italic; font-size: 12.5px; color: ${(p) => (p.$escura ? 'var(--areia)' : 'var(--suave)')}; }
  .url { font-size: 10.5px; word-break: break-all; color: ${(p) => (p.$escura ? 'var(--areia)' : 'var(--suave)')}; }
`;

interface PlaqueItem {
  url: string;
  mesa: string;
  titulo: string;
  sub: string;
  escura: boolean;
  svg: string;
}

export const QrCodesPage: React.FC = () => {
  const [catalog, setCatalog] = useState<CatalogData | null>(null);
  const [plaques, setPlaques] = useState<PlaqueItem[]>([]);

  useEffect(() => {
    api.getCatalog().then(async (cat) => {
      setCatalog(cat);
      const base = (cat.config.urlSite || window.location.origin).replace(/\/?$/, '/');
      const raw = [
        ...cat.config.mesas.map((m) => ({
          url: `${base}?mesa=${m.n}`,
          mesa: `Mesa ${m.n} · ${m.nome}`,
          titulo: 'Peça daqui da mesa',
          sub: 'Aponte a câmera, escolha e envie. Levamos até você.',
          escura: m.n % 2 === 0,
        })),
        {
          url: base,
          mesa: 'Pedido para levar',
          titulo: 'Peça antes de chegar',
          sub: 'Retire no balcão sem fila ou receba no trabalho ou em casa.',
          escura: true,
        },
        {
          url: `${base}#empresas`,
          mesa: 'Reuniões e eventos',
          titulo: 'O café da sua reunião',
          sub: 'Combos para 6, 10 ou 20 pessoas, coffee breaks e encomendas.',
          escura: false,
        },
      ];

      const rendered = await Promise.all(
        raw.map(async (item) => ({
          ...item,
          svg: await QRCode.toString(item.url, { type: 'svg', margin: 0, errorCorrectionLevel: 'M' }),
        })),
      );
      setPlaques(rendered);
    }).catch(() => {});
  }, []);

  return (
    <Page>
      <Bar>
        <div>
          <h1>QR Codes da Dianê</h1>
          <p>
            Placas para o balcão, a vitrine e a sacola: o cliente aponta a câmera e pede pelo site. Imprima
            em papel firme (A4, sem margens extras) e use em displays de acrílico.
            {catalog && !catalog.config.urlSite && (
              <> Atenção: os QR Codes apontam para o endereço atual.</>
            )}
          </p>
        </div>
        <button type="button" onClick={() => window.print()}>
          Imprimir
        </button>
      </Bar>

      <Sheet>
        {plaques.map((p) => (
          <Plaque key={p.mesa} $escura={p.escura}>
            <img
              className="logo"
              src={p.escura ? '/midia/diane-logo-creme.svg' : '/midia/diane-logo-caramelo.svg'}
              alt="Dianê"
            />
            <span className="mesa">{p.mesa}</span>
            <h2>{p.titulo}</h2>
            <div className="qr" dangerouslySetInnerHTML={{ __html: p.svg }} />
            <p className="sub">{p.sub}</p>
            <p className="slogan">O sabor que faltava no seu dia</p>
            <p className="url">{p.url}</p>
          </Plaque>
        ))}
      </Sheet>
    </Page>
  );
};

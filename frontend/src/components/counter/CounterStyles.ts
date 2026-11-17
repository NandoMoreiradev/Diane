import styled, { keyframes } from 'styled-components';

const pulsa = keyframes`
  50% { box-shadow: 0 0 0 6px rgba(200, 70, 31, .18); }
`;

export const CounterWrapper = styled.div`
  min-height: 100vh;
  background: var(--leite);
  color: #3B2416;
  font-variant-numeric: tabular-nums;
`;

export const CounterHeader = styled.header`
  position: sticky;
  top: 0;
  z-index: 20;
  background: var(--torra);
  color: #fff;
  padding: 0 max(16px, env(safe-area-inset-right)) 0 max(16px, env(safe-area-inset-left));
  padding-top: env(safe-area-inset-top);

  .lin1 {
    display: flex;
    align-items: center;
    gap: 14px;
    height: 60px;
    @media (max-width: 760px) {
      flex-wrap: wrap;
      height: auto;
      padding: 10px 0;
      row-gap: 10px;
    }
  }

  .marca {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 800;
    font-size: 20px;
    img { width: auto; height: 26px; }
    small { font-weight: 600; font-size: 13px; color: var(--areia); margin-left: 4px; }
  }

  .abas {
    display: flex;
    gap: 4px;
    margin-left: 12px;
    @media (max-width: 760px) {
      order: 3;
      margin-left: 0;
      width: 100%;
      overflow-x: auto;
    }
    button {
      padding: 9px 14px;
      border-radius: 999px;
      font-weight: 700;
      font-size: 14px;
      color: var(--areia);
      @media (max-width: 760px) { flex: 1; white-space: nowrap; }
      &[aria-selected='true'] { background: #fff; color: var(--torra); }
    }
    .n {
      display: inline-grid;
      place-items: center;
      min-width: 20px;
      height: 20px;
      border-radius: 999px;
      background: #C8461F;
      color: #fff;
      font-size: 11px;
      margin-left: 6px;
      padding: 0 5px;
    }
  }

  .dir {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .conexao {
    font-size: 12px;
    font-weight: 600;
    color: var(--areia);
    display: flex;
    align-items: center;
    gap: 6px;
    &::before {
      content: "";
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #7BD39A;
    }
    &.off::before { background: #E8A48A; }
    @media (max-width: 760px) { span { display: none; } }
  }

  .btn-som {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border-radius: 999px;
    background: rgba(255, 255, 255, .12);
    font-size: 13px;
    font-weight: 700;
    svg { width: 16px; height: 16px; }
    &.mudo { background: #C8461F; }
  }

  .btn-sair {
    font-size: 12.5px;
    font-weight: 600;
    color: var(--areia);
    padding: 6px 10px;
    border-radius: 999px;
    &:hover { background: rgba(255, 255, 255, .1); }
  }
`;

export const CounterMain = styled.main`
  padding: 20px max(16px, env(safe-area-inset-right)) 40px max(16px, env(safe-area-inset-left));
  max-width: 1500px;
  margin: 0 auto;
`;

export const FiltersRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
  align-items: center;
  .resumo-dia {
    margin-left: auto;
    font-size: 13px;
    color: #6B5444;
    font-weight: 600;
  }
`;

export const Chip = styled.button`
  padding: 8px 14px;
  border-radius: 999px;
  background: #fff;
  border: 1px solid #E3D5C4;
  font-size: 13px;
  font-weight: 700;
  color: #6B5444;
  &[aria-pressed='true'] {
    background: var(--torra);
    border-color: var(--torra);
    color: #fff;
  }
`;

export const MobileSeg = styled.div`
  display: none;
  gap: 6px;
  margin-bottom: 14px;
  background: #fff;
  padding: 5px;
  border-radius: 999px;
  @media (max-width: 900px) { display: flex; }
  button {
    flex: 1;
    padding: 10px;
    border-radius: 999px;
    font-weight: 700;
    font-size: 13.5px;
    color: #6B5444;
    &[aria-selected='true'] { background: var(--torra); color: #fff; }
  }
`;

export const BoardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  align-items: start;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
`;

export const BoardColumn = styled.div<{ $status: string; $activeMobile: boolean }>`
  background: rgba(255, 255, 255, .55);
  border-radius: 20px;
  padding: 12px;
  min-height: 200px;

  @media (max-width: 900px) {
    display: ${(p) => (p.$activeMobile ? 'block' : 'none')};
  }

  h2 {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .08em;
    padding: 6px 6px 12px;
    color: ${(p) =>
      p.$status === 'novo' ? '#C8461F' : p.$status === 'pronto' ? '#2F7D4F' : 'var(--torra)'};
    .n {
      background: ${(p) =>
        p.$status === 'novo' ? '#C8461F' : p.$status === 'pronto' ? '#2F7D4F' : 'var(--torra)'};
      color: #fff;
      border-radius: 999px;
      font-size: 12px;
      min-width: 24px;
      height: 24px;
      display: grid;
      place-items: center;
      padding: 0 6px;
    }
  }

  .cartoes { display: grid; gap: 12px; }
  .vazio-col { font-size: 13.5px; color: #A8978A; text-align: center; padding: 28px 10px; }
`;

export const OrderCard = styled.article<{ $status: string }>`
  background: #fff;
  border-radius: 18px;
  padding: 16px;
  display: grid;
  gap: 10px;
  box-shadow: 0 4px 14px rgba(89, 47, 26, .08);
  border-left: 6px solid
    ${(p) => (p.$status === 'novo' ? '#C8461F' : p.$status === 'pronto' ? '#2F7D4F' : 'var(--caramelo)')};
  ${(p) => p.$status === 'novo' && `animation: ${pulsa} 1.6s ease-in-out infinite;`}

  .c-topo { display: flex; align-items: flex-start; gap: 10px; }
  .cod { font-size: 26px; font-weight: 800; color: var(--torra); letter-spacing: .02em; line-height: 1; }
  .canal {
    display: inline-block;
    font-size: 12px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .06em;
    padding: 5px 9px;
    border-radius: 8px;
    background: var(--leite);
    color: var(--torra);
    margin-top: 6px;
    &.mesa { background: var(--torra); color: #fff; }
    &.entrega { background: #E1EBF5; color: #2F5F8A; }
    &.balcao { background: #EEE; color: #555; }
  }
  .tempo {
    margin-left: auto;
    text-align: right;
    font-size: 12.5px;
    color: #6B5444;
    font-weight: 600;
    b { display: block; font-size: 18px; color: #3B2416; }
    &.atraso b { color: #C8461F; }
  }
  .quem {
    font-size: 14.5px;
    font-weight: 700;
    a { color: #2F5F8A; font-weight: 600; font-size: 13px; margin-left: 6px; }
  }
  .local { font-size: 13.5px; color: #2F5F8A; font-weight: 700; }
  .agendado {
    font-size: 13px;
    font-weight: 800;
    color: #7A4B00;
    background: #FFF0C9;
    padding: 4px 8px;
    border-radius: 8px;
    width: max-content;
  }
  .itens {
    list-style: none;
    display: grid;
    gap: 4px;
    font-size: 15px;
    border-top: 1px dashed #E3D5C4;
    border-bottom: 1px dashed #E3D5C4;
    padding: 8px 0;
    b { display: inline-block; min-width: 28px; color: var(--caramelo); }
    small { display: block; margin-left: 28px; color: #6B5444; font-size: 12.5px; }
  }
  .obs {
    background: #FFF4D6;
    color: #6B4B00;
    font-size: 13.5px;
    font-weight: 600;
    padding: 8px 10px;
    border-radius: 10px;
  }
  .c-rodape {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    .pag { font-size: 13px; color: #6B5444; font-weight: 600; }
    .valor { font-weight: 800; font-size: 17px; margin-right: auto; }
  }
  .acao {
    padding: 11px 16px;
    border-radius: 12px;
    font-weight: 800;
    font-size: 14px;
    color: #fff;
    background: var(--torra);
    &.aceitar { background: #C8461F; }
    &.pronto { background: #2F7D4F; }
    &:active { transform: scale(.97); }
  }
  .cancelar {
    font-size: 12.5px;
    font-weight: 700;
    color: #6B5444;
    padding: 8px;
    text-decoration: underline;
    &.confirma {
      color: #fff;
      background: #C8461F;
      text-decoration: none;
      border-radius: 10px;
    }
  }
`;

export const DeliveredDetails = styled.details`
  margin-top: 20px;
  background: #fff;
  border-radius: 18px;
  padding: 14px 18px;
  summary { font-weight: 800; color: var(--torra); cursor: pointer; }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 12px;
    font-size: 13.5px;
    td {
      padding: 8px 6px;
      border-top: 1px solid #E3D5C4;
      &:last-child { text-align: right; font-weight: 700; }
    }
  }
`;

export const CounterSaleGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 20px;
  align-items: start;
  @media (max-width: 900px) { grid-template-columns: 1fr; }

  .grade {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 10px;
    h3 {
      grid-column: 1 / -1;
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: .1em;
      color: var(--caramelo);
      margin-top: 8px;
    }
    .sabor-sel {
      display: flex;
      flex-direction: column;
      gap: 6px;
      grid-column: 1 / -1;
      font-size: 13px;
      font-weight: 700;
      color: #6B5444;
      .linha-sabor {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        align-items: center;
      }
    }
    .prod {
      background: #fff;
      border-radius: 16px;
      padding: 14px;
      text-align: left;
      display: grid;
      gap: 4px;
      border: 2px solid transparent;
      min-height: 84px;
      &:hover { border-color: var(--areia); }
      &:active { transform: scale(.97); }
      b { font-size: 14.5px; color: var(--torra); }
      span { font-size: 13px; color: var(--caramelo); font-weight: 700; }
    }
  }

  .caixa {
    background: #fff;
    border-radius: 20px;
    padding: 18px;
    display: grid;
    gap: 14px;
    position: sticky;
    top: 80px;
    h2 { font-size: 18px; font-weight: 800; color: var(--torra); }
    .lin {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      padding: 6px 0;
      border-bottom: 1px solid #E3D5C4;
      > span:first-child { flex: 1; }
    }
    .mini {
      display: inline-flex;
      align-items: center;
      background: var(--leite);
      border-radius: 999px;
      button { width: 30px; height: 30px; border-radius: 50%; font-weight: 800; color: var(--torra); }
      span { min-width: 22px; text-align: center; font-weight: 800; }
    }
    .campo {
      display: grid;
      gap: 6px;
      font-size: 13px;
      font-weight: 700;
      color: var(--torra);
      input { padding: 12px; border-radius: 12px; border: 1px solid #E3D5C4; font-size: 15px; }
    }
    .total-caixa {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-size: 15px;
      b { font-size: 26px; color: var(--torra); }
    }
  }
`;

export const BigButton = styled.button`
  width: 100%;
  padding: 16px;
  border-radius: 14px;
  background: var(--caramelo);
  color: #fff;
  font-weight: 800;
  font-size: 16px;
  &:disabled { opacity: .45; cursor: not-allowed; }
`;

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 50;
  background: var(--torra);
  color: #fff;
  display: grid;
  place-items: center;
  padding: 24px;
  .caixa-capa {
    width: min(420px, 100%);
    display: grid;
    gap: 16px;
    text-align: center;
    img { width: 110px; margin: 0 auto 6px; }
    h1 { font-size: 26px; font-weight: 800; }
    p { color: var(--areia); font-size: 15px; }
    input {
      width: 100%;
      padding: 14px;
      border-radius: 12px;
      border: 0;
      font-size: 16px;
      color: #3B2416;
      background: #fff;
    }
    .erro { color: #F2A58C; font-size: 13.5px; font-weight: 600; }
  }
`;

export const CounterToast = styled.div<{ $on: boolean }>`
  max-width: calc(100% - 32px);
  text-align: center;
  position: fixed;
  left: 50%;
  bottom: 24px;
  transform: ${(p) => (p.$on ? 'translate(-50%, 0)' : 'translate(-50%, 20px)')};
  background: var(--torra);
  color: #fff;
  padding: 12px 18px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 14px;
  opacity: ${(p) => (p.$on ? 1 : 0)};
  transition: .3s;
  z-index: 60;
  pointer-events: none;
`;

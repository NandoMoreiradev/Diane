import styled, { keyframes } from 'styled-components';

const fotoZoom = keyframes`
  from { transform: scale(1.08); filter: blur(10px) saturate(.7); }
  to { transform: none; filter: none; }
`;

const entra = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: none; }
`;

export const Wrap = styled.div`
  width: min(1180px, 100% - 32px);
  margin-inline: auto;
`;

export const Section = styled.section`
  padding: clamp(64px, 9vw, 112px) 0;
`;

export const SectionTitle = styled.h2`
  font-family: var(--titulo);
  font-variation-settings: "SOFT" 100, "WONK" 1;
  font-size: clamp(32px, 5vw, 52px);
  font-weight: 800;
  line-height: 1.04;
  color: var(--torra);
  letter-spacing: -.025em;
  text-wrap: balance;
`;

export const Lead = styled.p`
  font-size: clamp(16px, 2vw, 19px);
  color: var(--suave);
  max-width: 560px;
`;

export const Cab = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  justify-content: space-between;
  gap: 16px 40px;
  margin-bottom: 36px;

  > div {
    display: grid;
    gap: 12px;
  }
`;

export const TopHeader = styled.header<{ $solido: boolean }>`
  position: fixed;
  inset: 0 0 auto;
  z-index: 40;
  transition: background .3s, box-shadow .3s;
  background: ${(p) => (p.$solido ? 'rgba(251, 247, 241, .94)' : 'transparent')};
  backdrop-filter: ${(p) => (p.$solido ? 'blur(12px)' : 'none')};
  box-shadow: ${(p) => (p.$solido ? '0 1px 0 var(--linha)' : 'none')};

  .inner {
    display: flex;
    align-items: center;
    gap: 20px;
    height: 68px;
  }

  .marca {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    color: ${(p) => (p.$solido ? 'var(--torra)' : '#fff')};
    font-weight: 800;
    font-size: 24px;
    letter-spacing: -.02em;
    img {
      height: 34px;
      width: auto;
    }
  }

  nav {
    display: flex;
    gap: 26px;
    margin-left: auto;
    font-size: 14px;
    font-weight: 600;
    a {
      text-decoration: none;
      color: ${(p) => (p.$solido ? 'var(--torra)' : '#fff')};
      opacity: .9;
      &:hover {
        opacity: 1;
      }
    }
    @media (max-width: 820px) {
      display: none;
    }
  }
`;

export const BagButton = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--caramelo);
  color: #fff;
  padding: 10px 16px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 14px;

  svg {
    width: 18px;
    height: 18px;
  }

  .n {
    min-width: 20px;
    height: 20px;
    border-radius: 999px;
    background: #fff;
    color: var(--caramelo);
    font-size: 12px;
    display: grid;
    place-items: center;
    padding: 0 5px;
    font-variant-numeric: tabular-nums;
  }

  @media (max-width: 820px) {
    margin-left: auto;
  }
`;

export const HeroSection = styled.section`
  position: relative;
  min-height: min(100svh, 960px);
  display: flex;
  align-items: flex-end;
  color: #fff;
  padding: 96px 0 clamp(40px, 7vh, 96px);
  overflow: hidden;
  background: var(--torra);

  .poster {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 68% 40%;
    animation: ${fotoZoom} 1.6s cubic-bezier(.16, 1, .3, 1) both;
  }

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, rgba(40, 20, 12, .78) 0%, rgba(40, 20, 12, .45) 45%, rgba(40, 20, 12, 0) 75%),
      linear-gradient(180deg, rgba(40, 20, 12, .35) 0%, rgba(40, 20, 12, 0) 30%, rgba(40, 20, 12, .55) 100%);
    @media (max-width: 760px) {
      background: linear-gradient(180deg, rgba(40, 20, 12, .4) 0%, rgba(40, 20, 12, .6) 32%, rgba(40, 20, 12, .92) 100%);
    }
  }

  .hero-wrap {
    position: relative;
    z-index: 1;
    display: grid;
    gap: 22px;
    > * {
      animation: ${entra} .9s cubic-bezier(.16, 1, .3, 1) both;
      animation-delay: .25s;
    }
    > *:nth-child(2) { animation-delay: .33s; }
    > *:nth-child(3) { animation-delay: .41s; }
    > *:nth-child(4) { animation-delay: .49s; }
  }

  h1 {
    font-family: var(--titulo);
    font-variation-settings: "SOFT" 100, "WONK" 1;
    font-size: clamp(38px, min(7.6vw, 10vh), 92px);
    font-weight: 800;
    line-height: .98;
    letter-spacing: -.03em;
    max-width: 860px;

    i {
      font-family: Jost, sans-serif;
      font-weight: 500;
      font-size: .62em;
      color: var(--morango);
      display: block;
      margin-top: 10px;
      letter-spacing: 0;
    }
  }

  p {
    font-size: clamp(16px, 2.2vw, 20px);
    max-width: 560px;
    color: #F4E6D6;
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    font-size: 13px;
    font-weight: 600;
    span {
      background: rgba(255, 255, 255, .12);
      border: 1px solid rgba(255, 255, 255, .22);
      padding: 7px 12px;
      border-radius: 999px;
    }
    .aberto {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      &::before {
        content: "";
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #7BD39A;
      }
      &.fechado::before {
        background: #E8A48A;
      }
    }
    .chip-mesa {
      background: var(--caramelo);
      border-color: var(--caramelo);
      color: #fff;
      font-weight: 700;
    }
  }
`;

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

export const Btn = styled.a<{ $variant?: 'primario' | 'claro' | 'zap' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 15px 24px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 15px;
  text-decoration: none;
  transition: transform .15s, background .2s;
  &:active { transform: scale(.97); }
  svg { width: 18px; height: 18px; }

  ${({ $variant = 'primario' }) =>
    $variant === 'primario' &&
    `
    background: var(--caramelo);
    color: #fff;
    box-shadow: 0 8px 20px -10px rgba(61,33,22,.45);
    &:hover { background: #8a470b; transform: translateY(-1px); }
  `}
  ${({ $variant }) =>
    $variant === 'claro' &&
    `
    background: rgba(255,255,255,.12);
    color: #fff;
    box-shadow: inset 0 0 0 1px rgba(255,255,255,.4);
    &:hover { background: rgba(255,255,255,.2); }
  `}
  ${({ $variant }) =>
    $variant === 'zap' &&
    `
    background: #1f7a4a;
    color: #fff;
    &:hover { background: #18663d; }
  `}
`;

export const PilaresBand = styled.div`
  background: var(--leite);
  padding: clamp(48px, 7vw, 88px) 0;
  p {
    font-family: var(--titulo);
    font-variation-settings: "SOFT" 100, "WONK" 1;
    font-weight: 600;
    font-size: clamp(26px, 4vw, 54px);
    line-height: 1.14;
    letter-spacing: -.025em;
    color: var(--torra-2);
    max-width: 26ch;
    text-wrap: balance;
    b {
      font-weight: 800;
      color: var(--caramelo);
    }
  }
`;

export const Tabs = styled.div`
  display: flex;
  gap: 8px;
  background: var(--leite);
  padding: 6px;
  border-radius: 999px;
  width: max-content;
  max-width: 100%;
  overflow-x: auto;
  scrollbar-width: none;
  margin-bottom: 28px;
  button {
    padding: 10px 20px;
    border-radius: 999px;
    font-weight: 700;
    font-size: 14px;
    color: var(--suave);
    white-space: nowrap;
    &[aria-selected='true'] {
      background: var(--torra);
      color: #fff;
    }
  }
`;

export const CombosGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  @media (max-width: 980px) {
    grid-template-columns: 1fr 1fr;
  }
  @media (max-width: 620px) {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    margin-inline: -16px;
    padding: 4px 16px 12px;
    gap: 14px;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
  }
`;

export const ComboCard = styled.article`
  background: #fff;
  border-radius: var(--raio);
  box-shadow: var(--sombra);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: transform .3s cubic-bezier(.2, .8, .2, 1), box-shadow .3s;
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 22px 40px -14px rgba(61, 33, 22, .3);
  }
  @media (max-width: 620px) {
    flex: 0 0 82%;
    scroll-snap-align: start;
  }
  .arte {
    background: var(--leite);
    height: 168px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    svg {
      width: 92px;
      height: 92px;
      margin: 0 -8px;
    }
  }
  .selo {
    position: absolute;
    top: 14px;
    left: 14px;
    background: #fff;
    color: var(--torra);
    font-size: 12.5px;
    font-weight: 600;
    padding: 5px 12px;
    border-radius: 999px;
  }
  .corpo {
    padding: 20px 20px 22px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1;
  }
  h3 {
    font-family: var(--titulo);
    font-size: 22px;
    font-weight: 800;
    color: var(--torra);
  }
  p {
    font-size: 14px;
    color: var(--suave);
  }
  .preco {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-top: auto;
    padding-top: 12px;
    b {
      font-size: 22px;
      font-weight: 800;
      color: var(--caramelo);
      font-variant-numeric: tabular-nums;
    }
    s {
      font-size: 14px;
      color: #7E6656;
      margin-left: 6px;
    }
  }
`;

export const FlavorsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
  button {
    font-size: 12px;
    font-weight: 600;
    padding: 6px 10px;
    border-radius: 999px;
    border: 1px solid var(--linha);
    color: var(--suave);
    background: #fff;
    &[aria-pressed='true'] {
      background: var(--torra);
      border-color: var(--torra);
      color: #fff;
    }
  }
`;

export const AddButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--torra);
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  padding: 10px 16px;
  border-radius: 999px;
  transition: background .2s, transform .15s;
  &:hover { background: var(--caramelo); }
  &:active { transform: scale(.95); }
  svg { width: 16px; height: 16px; }
`;

export const Stepper = styled.div`
  display: inline-flex;
  align-items: center;
  background: var(--leite);
  border-radius: 999px;
  padding: 4px;
  button {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    font-size: 20px;
    font-weight: 700;
    color: var(--torra);
    &:hover { background: #fff; }
  }
  span {
    min-width: 26px;
    text-align: center;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
  }
`;

export const MenuSectionWrapper = styled(Section)`
  background: #fff;
  .monte-status {
    margin: -8px 0 22px;
    font-size: 14px;
    color: var(--torra);
    background: var(--leite);
    border-radius: 999px;
    padding: 10px 18px;
    width: max-content;
    max-width: 100%;
    b { color: var(--caramelo); }
  }
  .itens {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    @media (max-width: 760px) {
      grid-template-columns: 1fr;
    }
  }
  .nota-cat {
    font-size: 13px;
    color: var(--suave);
    font-style: italic;
    margin-top: 14px;
    grid-column: 1 / -1;
  }
`;

export const MenuItemCard = styled.article`
  display: flex;
  gap: 18px;
  align-items: center;
  padding: 16px;
  border-radius: var(--raio);
  background: var(--creme);
  transition: transform .3s cubic-bezier(.2, .8, .2, 1), background .3s;
  &:hover {
    transform: translateY(-2px);
    background: #FFF0E2;
  }
  .arte {
    flex: 0 0 96px;
    height: 96px;
    border-radius: 12px;
    background: var(--leite);
    display: grid;
    place-items: center;
    svg { width: 78px; height: 78px; }
  }
  .txt {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .tag {
    display: inline-block;
    font-size: 12px;
    font-weight: 600;
    color: var(--caramelo);
    background: #F6E6D6;
    padding: 3px 10px;
    border-radius: 999px;
    width: max-content;
  }
  h3 {
    font-family: var(--titulo);
    font-size: 19px;
    font-weight: 800;
    color: var(--torra);
    letter-spacing: -.01em;
  }
  p {
    font-size: 13.5px;
    color: var(--suave);
  }
  .linha-add {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-top: 8px;
  }
  .valor {
    font-size: 18px;
    font-weight: 800;
    color: var(--caramelo);
    font-variant-numeric: tabular-nums;
  }
`;

export const RitualSection = styled(Section)`
  background: var(--torra);
  color: var(--leite);
  .ritual-wrap {
    display: grid;
    grid-template-columns: 1.05fr 1fr;
    gap: clamp(32px, 6vw, 80px);
    align-items: center;
    @media (max-width: 860px) { grid-template-columns: 1fr; }
  }
  h2 { color: #fff; margin: 0 0 16px; }
  .lead { color: var(--areia); }
  figure {
    overflow: hidden;
    border-radius: var(--raio);
    img {
      border-radius: var(--raio);
      width: 100%;
      aspect-ratio: 4/3;
      object-fit: cover;
      transition: transform .6s;
    }
    &:hover img { transform: scale(1.03); }
  }
  .passos {
    display: grid;
    gap: 14px;
    margin: 28px 0 30px;
    counter-reset: p;
  }
  .passo {
    display: flex;
    gap: 16px;
    align-items: flex-start;
    &::before {
      counter-increment: p;
      content: counter(p);
      flex: 0 0 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--caramelo);
      color: #fff;
      font-weight: 800;
      display: grid;
      place-items: center;
    }
    b { color: #fff; display: block; }
    span { color: var(--areia); font-size: 15px; }
  }
`;

export const GalleryGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  grid-template-rows: 260px 260px;
  gap: 12px;
  figure {
    position: relative;
    border-radius: var(--raio);
    overflow: hidden;
    background: var(--leite);
    &:first-child { grid-row: span 2; }
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transform: scale(1.02);
      transition: transform .8s cubic-bezier(.16, 1, .3, 1);
    }
    &:hover img { transform: scale(1.05); }
  }
  @media (max-width: 760px) {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    margin-inline: -16px;
    padding: 0 16px;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
    figure {
      flex: 0 0 84%;
      height: 300px;
      scroll-snap-align: start;
    }
  }
`;

export const NumbersRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  margin-top: 40px;
  border-top: 1px solid var(--linha);
  div {
    padding: 22px 24px 0 0;
    & + div {
      padding-left: 24px;
      border-left: 1px solid var(--linha);
    }
  }
  b {
    display: block;
    font-family: var(--titulo);
    font-variation-settings: "SOFT" 100;
    font-size: clamp(22px, 2.4vw, 30px);
    font-weight: 800;
    color: var(--torra);
    letter-spacing: -.02em;
    font-variant-numeric: tabular-nums;
  }
  span {
    font-size: 14px;
    color: var(--suave);
  }
  @media (max-width: 760px) {
    grid-template-columns: 1fr 1fr;
    row-gap: 8px;
    div:nth-child(3) { padding-left: 0; border-left: 0; }
  }
`;

export const EmpresasSection = styled(Section)`
  background: var(--leite);
  .cartao-emp {
    display: grid;
    grid-template-columns: 1fr 1.1fr;
    gap: clamp(32px, 6vw, 80px);
    align-items: center;
    @media (max-width: 760px) { grid-template-columns: 1fr; }
    img {
      border-radius: var(--raio);
      width: 100%;
      aspect-ratio: 4/3;
      object-fit: cover;
      box-shadow: var(--sombra);
    }
    .acoes { margin-top: 22px; }
  }
  .emp-lista {
    display: grid;
    margin-top: 24px;
    border-top: 1px solid #EBCBAE;
    div {
      display: grid;
      gap: 2px;
      padding: 16px 0;
      border-bottom: 1px solid #EBCBAE;
    }
    b { color: var(--torra); font-size: 17px; }
    span { color: var(--suave); font-size: 14.5px; }
  }
`;

export const OndeSection = styled(Section)`
  .onde-wrap {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: clamp(28px, 5vw, 64px);
    align-items: center;
    @media (max-width: 860px) { grid-template-columns: 1fr; }
    img {
      border-radius: var(--raio);
      aspect-ratio: 16/10;
      object-fit: cover;
      width: 100%;
    }
  }
  .info {
    display: grid;
    gap: 18px;
    margin: 26px 0 30px;
    > div {
      display: flex;
      gap: 14px;
      align-items: flex-start;
    }
    svg {
      flex: 0 0 22px;
      width: 22px;
      height: 22px;
      color: var(--caramelo);
      margin-top: 2px;
    }
    b { display: block; color: var(--torra); }
    span { color: var(--suave); font-size: 15px; }
  }
`;

export const SiteFooter = styled.footer`
  background: var(--torra);
  color: var(--areia);
  padding: 56px 0 120px;
  .footer-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 28px;
    align-items: center;
    justify-content: space-between;
  }
  img { width: 170px; }
  p { font-size: 14px; }
  i { color: var(--morango); }
  .frase {
    font-family: var(--titulo);
    font-variation-settings: "SOFT" 100, "WONK" 1;
    font-weight: 800;
    font-size: clamp(40px, 8vw, 104px);
    line-height: .95;
    color: var(--leite);
    width: 100%;
    margin-bottom: 20px;
    letter-spacing: -.02em;
    span { color: var(--morango); }
  }
`;

export const FloatingBar = styled.div<{ $on: boolean }>`
  position: fixed;
  left: 12px;
  right: 12px;
  bottom: calc(12px + env(safe-area-inset-bottom));
  z-index: 45;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: var(--torra);
  color: #fff;
  padding: 12px 12px 12px 20px;
  border-radius: 999px;
  box-shadow: 0 14px 36px rgba(45, 22, 10, .35);
  transform: ${(p) => (p.$on ? 'none' : 'translateY(150%)')};
  transition: transform .45s cubic-bezier(.16, 1, .3, 1);
  max-width: 560px;
  margin-inline: auto;
  small { display: block; font-size: 12px; color: var(--areia); }
  b { font-size: 17px; font-variant-numeric: tabular-nums; }
`;

export const TrackFloatingBtn = styled.button`
  position: fixed;
  right: 12px;
  bottom: calc(84px + env(safe-area-inset-bottom));
  z-index: 44;
  background: #fff;
  color: var(--torra);
  border: 1px solid var(--linha);
  box-shadow: var(--sombra);
  padding: 10px 16px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 13.5px;
`;

export const ToastBanner = styled.div<{ $on: boolean }>`
  position: fixed;
  left: 50%;
  top: 84px;
  transform: ${(p) => (p.$on ? 'translate(-50%, 0)' : 'translate(-50%, -20px)')};
  background: var(--torra);
  color: #fff;
  padding: 11px 18px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  z-index: 70;
  opacity: ${(p) => (p.$on ? 1 : 0)};
  transition: .3s;
  pointer-events: none;
  display: flex;
  gap: 8px;
  align-items: center;
  white-space: nowrap;
  svg { width: 16px; height: 16px; color: #7BD39A; }
`;

import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  :root {
    --torra: #3D2116;
    --torra-2: #5A3322;
    --caramelo: #A4560D;
    --avela: #C99B72;
    --morango: #E39A8C;
    --leite: #FFE7D0;
    --creme: #FFF6EC;
    --areia: #F2CDB0;
    --texto: #3D2116;
    --suave: #6F4F3D;
    --linha: #EAD3BC;
    --ok: #2F7D4F;
    --raio: 16px;
    --sombra: 0 12px 32px -12px rgba(61,33,22,.22);
    --titulo: Fraunces, Georgia, serif;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    scroll-behavior: smooth;
    scroll-padding-top: 76px;
    scrollbar-color: var(--avela) var(--creme);
    accent-color: var(--caramelo);
  }

  body {
    font-family: Jost, Arial, sans-serif;
    background: var(--creme);
    color: var(--texto);
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }

  img, video, svg {
    display: block;
    max-width: 100%;
  }

  button {
    font: inherit;
    cursor: pointer;
    border: 0;
    background: none;
    color: inherit;
  }

  input, select, textarea {
    font: inherit;
    color: inherit;
    caret-color: var(--caramelo);
  }

  a {
    color: inherit;
    text-underline-offset: .2em;
  }

  ::selection {
    background: var(--morango);
    color: var(--torra);
  }

  :focus-visible {
    outline: 2px solid var(--caramelo);
    outline-offset: 3px;
    border-radius: 6px;
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      transition: none !important;
      scroll-behavior: auto !important;
    }
  }
`;

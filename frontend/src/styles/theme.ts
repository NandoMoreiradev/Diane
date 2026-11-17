export const theme = {
  colors: {
    torra: '#3D2116',
    torra2: '#5A3322',
    caramelo: '#A4560D',
    avela: '#C99B72',
    morango: '#E39A8C',
    leite: '#FFE7D0',
    creme: '#FFF6EC',
    areia: '#F2CDB0',
    texto: '#3D2116',
    textoBalcao: '#3B2416',
    suave: '#6F4F3D',
    suaveBalcao: '#6B5444',
    linha: '#EAD3BC',
    linhaBalcao: '#E3D5C4',
    ok: '#2F7D4F',
    novo: '#C8461F',
    novoBg: '#FBE5DC',
    pronto: '#2F7D4F',
    prontoBg: '#E3F2E8',
    azul: '#2F5F8A',
  },
  fonts: {
    titulo: 'Fraunces, Georgia, serif',
    corpo: 'Jost, Arial, sans-serif',
  },
  radius: {
    card: '16px',
  },
  shadow: {
    card: '0 12px 32px -12px rgba(61,33,22,.22)',
  },
} as const;

export type DianeTheme = typeof theme;

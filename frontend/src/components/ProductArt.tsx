import React from 'react';

export const ProductArtSprite: React.FC = () => (
  <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
    <defs>
      <symbol id="i-espresso" viewBox="0 0 120 120">
        <path d="M52 22c-6 6 6 10 0 18M64 20c-6 6 6 10 0 18" fill="none" stroke="#C99B72" strokeWidth="3.5" strokeLinecap="round" opacity=".7" />
        <ellipse cx="60" cy="92" rx="38" ry="9" fill="#F2D2B3" />
        <path d="M36 52h48l-5 32c-1 5-5 8-10 8H51c-5 0-9-3-10-8z" fill="#FFF6EC" stroke="#3D2116" strokeWidth="3" />
        <path d="M84 58c10-1 13 5 11 11-2 6-8 8-14 7" fill="none" stroke="#3D2116" strokeWidth="3" />
        <ellipse cx="60" cy="52" rx="24" ry="5" fill="#6B3A22" stroke="#3D2116" strokeWidth="3" />
        <ellipse cx="57" cy="51.5" rx="9" ry="1.6" fill="#C98B55" />
      </symbol>
      <symbol id="i-cappuccino" viewBox="0 0 120 120">
        <ellipse cx="60" cy="96" rx="44" ry="9" fill="#F2D2B3" />
        <path d="M24 46h72l-7 38c-1 6-6 10-12 10H43c-6 0-11-4-12-10z" fill="#A4560D" stroke="#3D2116" strokeWidth="3" />
        <path d="M95 54c12-1 15 7 12 13-3 7-10 8-17 7" fill="none" stroke="#3D2116" strokeWidth="3" />
        <ellipse cx="60" cy="46" rx="36" ry="8" fill="#FFE7D0" stroke="#3D2116" strokeWidth="3" />
        <path d="M60 50c-7-3-10-6-8-8 2-3 6-2 8 1 2-3 6-4 8-1 2 2-1 5-8 8z" fill="#C08A5E" />
      </symbol>
      <symbol id="i-coado" viewBox="0 0 120 120">
        <ellipse cx="60" cy="104" rx="34" ry="6" fill="#F2D2B3" />
        <path d="M38 60h44l-4 40c0 3-3 5-6 5H48c-3 0-6-2-6-5z" fill="#FFE7D0" stroke="#3D2116" strokeWidth="3" />
        <path d="M40 84h40l-2 16c0 3-3 5-6 5H48c-3 0-6-2-6-5z" fill="#6B3A22" />
        <path d="M26 24h68L70 58H50z" fill="#A4560D" stroke="#3D2116" strokeWidth="3" strokeLinejoin="round" />
        <path d="M46 58h28v6H46z" fill="#3D2116" />
        <path d="M60 66v10" stroke="#6B3A22" strokeWidth="3" strokeLinecap="round" strokeDasharray="3 4" />
        <path d="M34 30h52" stroke="#FFE7D0" strokeWidth="3" opacity=".5" />
      </symbol>
      <symbol id="i-viagem" viewBox="0 0 120 120">
        <ellipse cx="60" cy="106" rx="26" ry="5" fill="#F2D2B3" />
        <path d="M38 34h44l-6 68c0 2-2 3-4 3H48c-2 0-4-1-4-3z" fill="#3D2116" />
        <path d="M41 70h38l-3 32c0 2-2 3-4 3H48c-2 0-4-1-4-3z" fill="#A4560D" />
        <path d="M34 26h52l-2 10H36z" fill="#2a160e" />
        <path d="M42 18h36c3 0 5 3 5 8H37c0-5 2-8 5-8z" fill="#2a160e" />
        <circle cx="60" cy="54" r="7" fill="#C08A5E" />
      </symbol>
      <symbol id="i-pao" viewBox="0 0 120 120">
        <ellipse cx="60" cy="96" rx="46" ry="9" fill="#F2D2B3" />
        <circle cx="38" cy="74" r="20" fill="#E3A85A" stroke="#A4560D" strokeWidth="3" />
        <circle cx="82" cy="74" r="20" fill="#E3A85A" stroke="#A4560D" strokeWidth="3" />
        <circle cx="60" cy="56" r="22" fill="#EDB86A" stroke="#A4560D" strokeWidth="3" />
        <circle cx="53" cy="50" r="2.4" fill="#C98B55" />
        <circle cx="66" cy="60" r="2.4" fill="#C98B55" />
        <circle cx="62" cy="47" r="1.8" fill="#C98B55" />
        <circle cx="33" cy="72" r="2" fill="#C98B55" />
        <circle cx="86" cy="76" r="2" fill="#C98B55" />
        <path d="M48 46c4-6 10-7 16-5" stroke="#F8DCA8" strokeWidth="3" strokeLinecap="round" fill="none" />
      </symbol>
      <symbol id="i-sanduiche" viewBox="0 0 120 120">
        <ellipse cx="60" cy="98" rx="46" ry="8" fill="#F2D2B3" />
        <path d="M16 84 60 30l44 54z" fill="#F0DDB8" stroke="#C99B72" strokeWidth="3" strokeLinejoin="round" />
        <path d="M22 78c8 3 12-3 19 0s11-3 19 0 11-3 19 0 12-3 19 0" fill="none" stroke="#7FA05A" strokeWidth="6" strokeLinecap="round" />
        <path d="M30 70h20M66 70h22" stroke="#C9573A" strokeWidth="6" strokeLinecap="round" />
        <path d="M16 90h88" stroke="#E7CFA0" strokeWidth="10" strokeLinecap="round" />
        <path d="M16 90h88" stroke="#C99B72" strokeWidth="3" strokeLinecap="round" opacity=".5" />
      </symbol>
      <symbol id="i-agua" viewBox="0 0 120 120">
        <ellipse cx="60" cy="106" rx="22" ry="5" fill="#F2D2B3" />
        <rect x="52" y="12" width="16" height="10" rx="2" fill="#A4560D" />
        <path d="M50 22h20v8c8 4 10 10 10 18v52c0 3-2 5-5 5H45c-3 0-5-2-5-5V48c0-8 2-14 10-18z" fill="#E8F0F0" stroke="#7E9A9C" strokeWidth="3" />
        <rect x="40" y="58" width="40" height="22" fill="#3D2116" />
        <path d="M48 69h24" stroke="#FFE7D0" strokeWidth="3" strokeLinecap="round" />
      </symbol>
      <symbol id="i-suco" viewBox="0 0 120 120">
        <ellipse cx="60" cy="104" rx="30" ry="6" fill="#F2D2B3" />
        <path d="M72 14 62 50" stroke="#3D2116" strokeWidth="4" strokeLinecap="round" />
        <path d="M34 36h52l-6 64c0 3-3 5-6 5H46c-3 0-6-2-6-5z" fill="#FFF6EC" stroke="#3D2116" strokeWidth="3" />
        <path d="M37 50h46l-5 50c0 3-3 5-6 5H48c-3 0-6-2-6-5z" fill="#F0A33A" />
        <circle cx="84" cy="38" r="12" fill="#F7C35A" stroke="#C98B55" strokeWidth="3" />
        <path d="M84 30v16M76 38h16" stroke="#C98B55" strokeWidth="2" />
      </symbol>
      <symbol id="i-lata" viewBox="0 0 120 120">
        <ellipse cx="60" cy="106" rx="24" ry="5" fill="#F2D2B3" />
        <path d="M42 22h36l4 8v66l-4 8H42l-4-8V30z" fill="#A4560D" stroke="#3D2116" strokeWidth="3" strokeLinejoin="round" />
        <path d="M38 40h44M38 88h44" stroke="#3D2116" strokeWidth="3" />
        <path d="M48 52h6v28h-6z" fill="#FFE7D0" opacity=".35" />
      </symbol>
      <symbol id="i-brigadeiro" viewBox="0 0 120 120">
        <ellipse cx="60" cy="100" rx="36" ry="7" fill="#F2D2B3" />
        <path d="M28 70h64l-8 26c-1 3-4 5-7 5H43c-3 0-6-2-7-5z" fill="#A4560D" />
        <path d="M36 70l4 31M46 70l2 31M56 70v31M66 70l-1 31M76 70l-3 31M86 70l-6 31" stroke="#7d4009" strokeWidth="2" />
        <circle cx="60" cy="56" r="27" fill="#3D2116" />
        <g fill="#6B3A22">
          <rect x="44" y="40" width="5" height="2.4" rx="1.2" transform="rotate(30 46 41)" />
          <rect x="62" y="34" width="5" height="2.4" rx="1.2" transform="rotate(-20 64 35)" />
          <rect x="72" y="50" width="5" height="2.4" rx="1.2" transform="rotate(60 74 51)" />
          <rect x="50" y="58" width="5" height="2.4" rx="1.2" transform="rotate(-50 52 59)" />
          <rect x="66" y="66" width="5" height="2.4" rx="1.2" transform="rotate(15 68 67)" />
          <rect x="40" y="56" width="5" height="2.4" rx="1.2" transform="rotate(80 42 57)" />
        </g>
        <path d="M44 44c5-7 13-9 20-7" stroke="#8a5a40" strokeWidth="3" strokeLinecap="round" fill="none" />
      </symbol>
      <symbol id="i-caixa" viewBox="0 0 120 120">
        <ellipse cx="60" cy="104" rx="46" ry="6" fill="#F2D2B3" />
        <path d="M20 46h80v52c0 3-2 5-5 5H25c-3 0-5-2-5-5z" fill="#3D2116" />
        <circle cx="40" cy="62" r="9" fill="#FFE7D0" />
        <circle cx="60" cy="62" r="9" fill="#A9B37A" />
        <circle cx="80" cy="62" r="9" fill="#E39A8C" />
        <circle cx="40" cy="84" r="9" fill="#6B3A22" />
        <circle cx="60" cy="84" r="9" fill="#C98B50" />
        <circle cx="80" cy="84" r="9" fill="#F2C14E" />
        <path d="M16 22h88v18H16z" fill="#A4560D" transform="rotate(-8 60 31)" />
        <path d="M50 20h20v18H50z" fill="#3D2116" transform="rotate(-8 60 31)" />
        <circle cx="88" cy="22" r="7" fill="#E39A8C" />
      </symbol>
      <symbol id="i-pote" viewBox="0 0 120 120">
        <ellipse cx="60" cy="104" rx="32" ry="6" fill="#F2D2B3" />
        <path d="M32 46h56l-5 52c0 3-3 5-6 5H43c-3 0-6-2-6-5z" fill="#3D2116" />
        <rect x="32" y="64" width="56" height="20" fill="#A4560D" />
        <path d="M44 74h32" stroke="#FFE7D0" strokeWidth="3" strokeLinecap="round" />
        <rect x="28" y="36" width="64" height="12" rx="4" fill="#5A3322" />
        <path d="M70 34 90 10" stroke="#C99B72" strokeWidth="6" strokeLinecap="round" />
        <ellipse cx="91" cy="9" rx="6" ry="4" fill="#C99B72" />
      </symbol>
      <symbol id="i-bolo" viewBox="0 0 120 120">
        <ellipse cx="60" cy="98" rx="48" ry="9" fill="#F2D2B3" />
        <path d="M18 88l70-24v24z" fill="#6B3A22" />
        <path d="M88 64l14 8v16l-14 0z" fill="#5a2f1b" />
        <path d="M18 88h70" stroke="#3D2116" strokeWidth="6" />
        <path d="M22 76l66-22" stroke="#3D2116" strokeWidth="5" />
        <path d="M18 70l70-24 14 8-70 24z" fill="#3D2116" />
        <circle cx="74" cy="46" r="7" fill="#2a160e" />
        <circle cx="56" cy="52" r="6" fill="#2a160e" />
      </symbol>
      <symbol id="i-torta" viewBox="0 0 120 120">
        <ellipse cx="60" cy="98" rx="48" ry="9" fill="#F2D2B3" />
        <path d="M18 90l72-26v26z" fill="#E7C08A" />
        <path d="M90 64l12 8v18H90z" fill="#d6a86c" />
        <path d="M22 80l68-24v10L22 90z" fill="#FFF3D6" />
        <path d="M18 72l72-26 12 8-72 26z" fill="#FFE7D0" stroke="#E7C08A" strokeWidth="2" />
        <circle cx="62" cy="54" r="7" fill="#E39A8C" />
        <circle cx="78" cy="50" r="6" fill="#d9675d" />
        <circle cx="44" cy="62" r="6" fill="#E39A8C" />
      </symbol>
      <symbol id="i-frutales" viewBox="0 0 120 120">
        <ellipse cx="60" cy="106" rx="26" ry="5" fill="#F2D2B3" />
        <path d="M32 34h56l-7 68c0 2-2 3-4 3H43c-2 0-4-1-4-3z" fill="#FFF6EC" stroke="#C99B72" strokeWidth="2" />
        <path d="M38 84h44l-2 18c0 2-2 3-4 3H44c-2 0-4-1-4-3z" fill="#F2C14E" />
        <path d="M36 66h48l-2 18H38z" fill="#A9B37A" />
        <path d="M35 50h50l-1 16H36z" fill="#E39A8C" />
        <path d="M34 34h52l-1 16H35z" fill="#7b4a8a" />
        <rect x="35" y="56" width="50" height="12" fill="#A4560D" />
        <path d="M28 34q32-30 64 0z" fill="#fff" opacity=".55" stroke="#C99B72" strokeWidth="2" />
      </symbol>
      <symbol id="i-chocolate" viewBox="0 0 120 120">
        <ellipse cx="60" cy="106" rx="26" ry="5" fill="#F2D2B3" />
        <path d="M38 34h44l-6 68c0 2-2 3-4 3H48c-2 0-4-1-4-3z" fill="#A4560D" />
        <path d="M40 58h40l-1 14H41z" fill="#3D2116" />
        <path d="M34 26h52l-2 10H36z" fill="#3D2116" />
        <path d="M42 18h36c3 0 5 3 5 8H37c0-5 2-8 5-8z" fill="#3D2116" />
        <path d="M52 64h16" stroke="#E39A8C" strokeWidth="3" strokeLinecap="round" />
      </symbol>
    </defs>
  </svg>
);

export const ProductArt: React.FC<{ name: string }> = ({ name }) => (
  <svg aria-hidden="true">
    <use href={`#i-${name}`} />
  </svg>
);

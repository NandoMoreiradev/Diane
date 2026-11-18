import React, { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { CounterPage } from './pages/CounterPage';
import { HomePage } from './pages/HomePage';
import { QrCodesPage } from './pages/QrCodesPage';
import { detectHostMode, staffAppOrigin } from './services/hosts';
import { GlobalStyle } from './styles/GlobalStyle';
import { theme } from './styles/theme';

/** No site público, rotas da equipe levam para o sistema em app.<domínio>. */
const ToStaffApp: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.location.replace(`${staffAppOrigin()}${pathname}`);
  }, [pathname]);
  return null;
};

export const App: React.FC = () => {
  const mode = detectHostMode();

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <BrowserRouter>
        <Routes>
          {mode !== 'app' && <Route path="/" element={<HomePage />} />}
          {mode === 'app' && <Route path="/" element={<Navigate to="/balcao" replace />} />}

          {mode !== 'site' && (
            <>
              <Route path="/balcao" element={<CounterPage />} />
              <Route path="/qr-codes" element={<QrCodesPage />} />
              <Route path="/mesas" element={<QrCodesPage />} />
            </>
          )}
          {mode === 'site' && (
            <>
              <Route path="/balcao" element={<ToStaffApp />} />
              <Route path="/qr-codes" element={<ToStaffApp />} />
              <Route path="/mesas" element={<ToStaffApp />} />
            </>
          )}

          <Route
            path="*"
            element={<Navigate to={mode === 'app' ? '/balcao' : '/'} replace />}
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { CounterPage } from './pages/CounterPage';
import { HomePage } from './pages/HomePage';
import { QrCodesPage } from './pages/QrCodesPage';
import { GlobalStyle } from './styles/GlobalStyle';
import { theme } from './styles/theme';

export const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/balcao" element={<CounterPage />} />
          <Route path="/qr-codes" element={<QrCodesPage />} />
          <Route path="/mesas" element={<QrCodesPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

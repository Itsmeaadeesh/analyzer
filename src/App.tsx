import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GsaProvider } from './context/GsaContext';
import { HomePage } from './pages/HomePage';
import { ReelsStudioPage } from './pages/ReelsStudioPage';
import { LinkedInHubPage } from './pages/LinkedInHubPage';

export function App() {
  return (
    <GsaProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/reels" element={<ReelsStudioPage />} />
          <Route path="/linkedin" element={<LinkedInHubPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </GsaProvider>
  );
}

export default App;

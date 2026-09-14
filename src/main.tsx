import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { GameProvider } from './state/GameProvider';
import './theme/tokens.css';
import './theme/base.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <GameProvider>
        <App />
      </GameProvider>
    </BrowserRouter>
  </StrictMode>,
);

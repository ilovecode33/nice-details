import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { UIFoundation } from '@ilovecode33/ui';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UIFoundation>
      <App />
    </UIFoundation>
  </StrictMode>,
);

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { UIFoundation } from '@ilovecode33/ui';
import { App } from './App';
import { DICTIONARIES } from './i18n';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UIFoundation
      dictionaries={DICTIONARIES}
      localeStorageKey="okr-web.locale"
    >
      <App />
    </UIFoundation>
  </StrictMode>,
);

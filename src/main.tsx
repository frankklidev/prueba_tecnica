import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { jsonPlaceholder } from './infrastructure/jsonPlaceholder';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App gateway={jsonPlaceholder} />
  </StrictMode>,
);

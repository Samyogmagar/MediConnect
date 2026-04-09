import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

const resolveTheme = (preference) => {
  if (preference === 'system') {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }
  return preference || 'light';
};

const applyTheme = (theme) => {
  document.documentElement.dataset.theme = theme;
};

const storedPreference = localStorage.getItem('appearancePreference') || 'system';
applyTheme(resolveTheme(storedPreference));

if (window.matchMedia) {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', (event) => {
    const currentPreference = localStorage.getItem('appearancePreference') || 'system';
    if (currentPreference === 'system') {
      applyTheme(event.matches ? 'dark' : 'light');
    }
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);

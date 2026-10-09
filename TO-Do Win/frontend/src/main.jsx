import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ViewModeProvider } from './contexts/ViewModeContext'
import './index.css'

if (window.location.protocol === 'file:') {
  const originalFetch = window.fetch;
  window.fetch = function (url, options) {
    if (typeof url === 'string' && url.startsWith('/api/')) {
      url = 'http://localhost:5005' + url;
    }
    return originalFetch(url, options);
  };
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <ViewModeProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ViewModeProvider>
    </ThemeProvider>
  </React.StrictMode>
)

if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('PWA: échec enregistrement service worker', err);
    });
  });
}
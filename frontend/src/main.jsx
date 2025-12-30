import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Error boundary for production
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

try {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error('Failed to render app:', error);
  document.getElementById('root').innerHTML = `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #000; color: #fff; font-family: sans-serif; padding: 20px;">
      <div style="text-align: center;">
        <h1 style="font-size: 24px; margin-bottom: 16px;">Something went wrong</h1>
        <p style="color: #888; margin-bottom: 24px;">Please refresh the page or contact support.</p>
        <button onclick="window.location.reload()" style="padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer;">
          Refresh Page
        </button>
      </div>
    </div>
  `;
}



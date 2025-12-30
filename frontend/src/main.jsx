import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Global error handlers
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  const root = document.getElementById('root');
  if (root && !root.querySelector('.error-display')) {
    root.innerHTML = `
      <div class="error-display" style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #000; color: #fff; font-family: sans-serif; padding: 20px;">
        <div style="text-align: center; max-width: 600px;">
          <h1 style="font-size: 24px; margin-bottom: 16px; color: #ef4444;">Error Loading App</h1>
          <p style="color: #888; margin-bottom: 24px;">${event.error?.message || 'Unknown error occurred'}</p>
          <button onclick="window.location.reload()" style="padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">
            Refresh Page
          </button>
        </div>
      </div>
    `;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Render app with error handling
const rootElement = document.getElementById('root');
if (!rootElement) {
  document.body.innerHTML = '<div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #000; color: #fff; font-family: sans-serif;"><div style="text-align: center;"><h1 style="font-size: 24px; margin-bottom: 16px;">Root element not found</h1></div></div>';
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Failed to render app:', error);
    rootElement.innerHTML = `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #000; color: #fff; font-family: sans-serif; padding: 20px;">
        <div style="text-align: center; max-width: 600px;">
          <h1 style="font-size: 24px; margin-bottom: 16px; color: #ef4444;">Failed to Render</h1>
          <p style="color: #888; margin-bottom: 24px;">${error.message || 'React failed to render'}</p>
          <button onclick="window.location.reload()" style="padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">
            Refresh Page
          </button>
        </div>
      </div>
    `;
  }
}



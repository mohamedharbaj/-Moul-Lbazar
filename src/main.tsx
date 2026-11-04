import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);

const errorBox = (title: string, err: unknown) => {
  const e = err as any;
  const text = (e && (e.stack || e.message)) || String(err);
  return (
    <pre
      style={{
        padding: 16,
        margin: 16,
        background: '#fff',
        color: '#b00020',
        border: '2px solid #b00020',
        borderRadius: 8,
        font: '13px monospace',
        whiteSpace: 'pre-wrap',
        direction: 'ltr',
        wordBreak: 'break-word',
      }}
    >
      {title}
      {'\n\n'}
      {text}
    </pre>
  );
};

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: unknown }
> {
  state = { error: null as unknown };

  static getDerivedStateFromError(error: unknown) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return errorBox('RENDER ERROR (خطأ أثناء عرض الصفحة):', this.state.error);
    }
    return this.props.children;
  }
}

import('./App')
  .then(({ default: App }) => {
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
  })
  .catch((err) => {
    root.render(errorBox('IMPORT ERROR (خطأ أثناء تحميل الكود):', err));
  });

// DEBUG: شريط يظهر بعد 6 ثواني
setTimeout(() => {
  const box = document.createElement('div');
  box.style.cssText =
    'position:fixed;top:0;left:0;right:0;z-index:2147483647;background:#000;color:#0f0;font:12px monospace;padding:8px;direction:ltr;white-space:pre-wrap';
  const header = document.querySelector('header');
  const r = document.getElementById('root');
  box.textContent =
    'DEBUG\n' +
    'root children: ' + (r ? r.childElementCount : 'no root') + '\n' +
    'text length: ' + (r ? (r.innerText || '').length : 0) + '\n' +
    'header found: ' + !!header + '\n' +
    'header height: ' + (header ? header.getBoundingClientRect().height : 0) + '\n' +
    'page height: ' + document.documentElement.scrollHeight + '\n' +
    'scrollY: ' + window.scrollY + '\n' +
    'body bg: ' + getComputedStyle(document.body).backgroundColor;
  document.body.appendChild(box);
}, 6000);

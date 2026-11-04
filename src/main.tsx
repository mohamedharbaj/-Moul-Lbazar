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

// DEBUG: نافذة alert بعد 6 ثواني
setTimeout(() => {
  const r = document.getElementById('root');
  const header = document.querySelector('header');
  const h1 = document.querySelector('h1');
  const cs = h1 ? getComputedStyle(h1) : null;
  const msg =
    'DEBUG\n' +
    'root children: ' + (r ? r.childElementCount : 'no root') + '\n' +
    'text length: ' + (r ? (r.innerText || '').length : 0) + '\n' +
    'header found: ' + !!header + '\n' +
    'header height: ' + (header ? Math.round(header.getBoundingClientRect().height) : 0) + '\n' +
    'page height: ' + document.documentElement.scrollHeight + '\n' +
    'scrollY: ' + window.scrollY + '\n' +
    'body bg: ' + getComputedStyle(document.body).backgroundColor + '\n' +
    'h1 color: ' + (cs ? cs.color : '-') + '\n' +
    'h1 fill: ' + (cs ? (cs as any).webkitTextFillColor : '-') + '\n' +
    'h1 opacity: ' + (cs ? cs.opacity : '-') + '\n' +
    'h1 visibility: ' + (cs ? cs.visibility : '-') + '\n' +
    'UA: ' + navigator.userAgent;
  alert(msg);
}, 6000);

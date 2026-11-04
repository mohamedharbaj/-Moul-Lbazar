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

// DEBUG3: مواقع العناصر (بعد 6 ثواني)
setTimeout(() => {
  const r = (el: Element | null) => {
    if (!el) return 'none';
    const b = el.getBoundingClientRect();
    return (
      'x' + Math.round(b.left) + ' y' + Math.round(b.top) +
      ' w' + Math.round(b.width) + ' h' + Math.round(b.height)
    );
  };
  const w = window.innerWidth;
  const h = window.innerHeight;
  const stack = document
    .elementsFromPoint(w / 2, h / 2)
    .map((e) => e.tagName)
    .join(',');
  alert(
    'DEBUG3\n' +
      'inner: ' + w + 'x' + h + ' dpr ' + window.devicePixelRatio + '\n' +
      'html client: ' + document.documentElement.clientWidth + 'x' + document.documentElement.clientHeight + '\n' +
      'html scroll: ' + document.documentElement.scrollWidth + 'x' + document.documentElement.scrollHeight + '\n' +
      'vv scale: ' + (window.visualViewport ? window.visualViewport.scale : '-') + '\n' +
      'body: ' + r(document.body) + '\n' +
      'root child: ' + r(document.getElementById('root')?.firstElementChild || null) + '\n' +
      'header: ' + r(document.querySelector('header')) + '\n' +
      'hero: ' + r(document.getElementById('home')) + '\n' +
      'stack: ' + stack + '\n' +
      'fonts: ' + document.fonts.status + '\n' +
      'dir: ' + document.documentElement.dir
  );
}, 6000);

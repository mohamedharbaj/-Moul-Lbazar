import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

// تعطيل المؤثرات اللي كتوقف الرسم فـ بعض التليفونات
const fixStyle = document.createElement('style');
fixStyle.textContent =
  '*,*::before,*::after{backdrop-filter:none!important;-webkit-backdrop-filter:none!important;filter:none!important;}';
document.head.appendChild(fixStyle);

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

// DEBUG: معلومات عن العنصر اللي فوق الشاشة (بعد 6 ثواني)
setTimeout(() => {
  const pick = (x: number, y: number) => {
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    if (!el) return 'none';
    const cs = getComputedStyle(el);
    return (
      el.tagName +
      ' | ' +
      String(el.className).slice(0, 60) +
      ' | bg ' +
      cs.backgroundColor +
      ' | pos ' +
      cs.position
    );
  };
  const w = window.innerWidth;
  const h = window.innerHeight;
  const header = document.querySelector('header');
  const hcs = header ? getComputedStyle(header) : null;
  alert(
    'DEBUG2\n' +
      'top: ' + pick(w / 2, 20) + '\n' +
      'mid: ' + pick(w / 2, h / 2) + '\n' +
      'header bg: ' + (hcs ? hcs.backgroundColor : '-') + '\n' +
      'header pos: ' + (hcs ? hcs.position : '-') + '\n' +
      'hero bg: ' +
      (document.getElementById('home')
        ? getComputedStyle(document.getElementById('home') as HTMLElement).backgroundColor
        : '-')
  );
}, 6000);

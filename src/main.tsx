import React from 'react';
import { createRoot } from 'react-dom/client';

const TestApp = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F5EFE3',
        color: '#292521',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h1 style={{ fontSize: '32px' }}>
        مول البزار
      </h1>

      <p style={{ fontSize: '20px' }}>
        الموقع خدام بنجاح!
      </p>

      <p>
        اختبار تشغيل React
      </p>
    </div>
  );
};

const rootElement = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(<TestApp />);
}

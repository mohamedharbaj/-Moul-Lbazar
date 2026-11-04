import {Component, ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const box: React.CSSProperties = {
  padding: 16,
  margin: 16,
  background: '#fff',
  color: '#b00020',
  border: '2px solid #b00020',
  borderRadius: 8,
  fontFamily: 'monospace',
  fontSize: 13,
  whiteSpace: 'pre-wrap',
  direction: 'ltr',
  wordBreak: 'break-word',
};

class ErrorBoundary extends Component<{children: ReactNode}, {error: Error | null}> {
  state = {error: null as Error | null};
  static getDerivedStateFromError(error: Error) {
    return {error};
  }
  render() {
    if (this.state.error) {
      return (
        <div style={box}>
          {'APP ERROR:\n' + this.state.error.message + '\n\n' + (this.state.error.stack || '')}
        </div>
      );
    }
    return this.props.children;
  }
}

window.addEventListener('error', (e) => {
  const root = document.getElementById('root');
  if (root && !root.hasChildNodes()) {
    const d = document.createElement('div');
    Object.assign(d.style, box as any);
    d.textContent = 'JS ERROR: ' + e.message + ' @ ' + e.filename + ':' + e.lineno;
    root.appendChild(d);
  }
});

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);

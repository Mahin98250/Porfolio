import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

class PortfolioErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error) {
    console.error('Portfolio render error:', error);
  }
  render() {
    if (this.state.hasError) {
      return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:'32px',fontFamily:'system-ui',background:'#f4f8fc',color:'#142437'}}>
        <section style={{maxWidth:'520px',textAlign:'center'}}>
          <div style={{fontSize:'12px',letterSpacing:'3px',color:'#1769e0',fontWeight:700}}>MAHIN PATEL · PORTFOLIO</div>
          <h1 style={{fontSize:'clamp(32px,6vw,52px)',lineHeight:1.1}}>We’re fixing a small glitch.</h1>
          <p style={{lineHeight:1.8,color:'#5c6d80'}}>The page hit a rendering error. Refresh once; if it continues, open the repository and report the issue.</p>
          <a href="https://github.com/Mahin98250/Porfolio" style={{display:'inline-block',padding:'13px 18px',borderRadius:'10px',background:'#1769e0',color:'#fff',textDecoration:'none',fontWeight:700}}>Open portfolio repository ↗</a>
        </section>
      </main>;
    }
    return this.props.children;
  }
}

const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <PortfolioErrorBoundary><App /></PortfolioErrorBoundary>
    </React.StrictMode>
  );
}

import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Markets from './components/Markets.jsx';
import Lens from './components/Lens.jsx';
import Products from './components/Products.jsx';
import AiFeatures from './components/AiFeatures.jsx';
import Security from './components/Security.jsx';
import Faq from './components/Faq.jsx';
import AppDownload from './components/AppDownload.jsx';
import Footer from './components/Footer.jsx';
import SiteV3 from './v3/SiteV3.jsx';
import SiteV4 from './v4/SiteV4.jsx';
import { useReveal } from './reveal.js';
import { VersionContext, useVersionState } from './version.js';

function App() {
  const versionState = useVersionState();
  // Re-scan for reveal targets whenever the layout version swaps sections in and out
  useReveal(versionState.version);
  // Version 3 is its own layout (src/v3): glass, aurora and scroll-driven motion
  if (versionState.version === '3' || versionState.version === '4') {
    // Version 4 (src/v4) refines V3: neutral surfaces, one accent colour, quieter motion
    const Site = versionState.version === '4' ? SiteV4 : SiteV3;
    return (
      <VersionContext.Provider value={versionState}>
        <Site />
      </VersionContext.Provider>
    );
  }
  return (
    <VersionContext.Provider value={versionState}>
    <div id="top">
      <Header />
      <main>
        <Hero />
        <Markets />
        <Lens />
        <Products />
        <AiFeatures />
        <Security />
        <Faq />
        <AppDownload />
      </main>
      <Footer />
    </div>
    </VersionContext.Provider>
  );
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);

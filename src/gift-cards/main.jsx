import React from 'react';
import { createRoot } from 'react-dom/client';
import '../styles.css';
import './gift-cards.css';
import GiftCards from './GiftCards.jsx';

createRoot(document.getElementById('root')).render(<React.StrictMode><GiftCards /></React.StrictMode>);

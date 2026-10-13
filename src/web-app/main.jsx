import React from 'react';
import { createRoot } from 'react-dom/client';
import '../styles.css';
import WebApp from './WebApp.jsx';

createRoot(document.getElementById('root')).render(<React.StrictMode><WebApp /></React.StrictMode>);

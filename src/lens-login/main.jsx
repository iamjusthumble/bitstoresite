import React from 'react';
import { createRoot } from 'react-dom/client';
import '../styles.css';
import './lens-login.css';
import LensLogin from './LensLogin.jsx';

createRoot(document.getElementById('root')).render(<React.StrictMode><LensLogin /></React.StrictMode>);

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; 
import { HelmetProvider } from 'react-helmet-async';
import 'bootstrap/dist/css/bootstrap.min.css';

import App from './App.jsx';

const appTree = import.meta.env.DEV ? (
  <BrowserRouter>
    <App />
  </BrowserRouter>
) : (
  <HelmetProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </HelmetProvider>
);

createRoot(document.getElementById('root')).render(
  import.meta.env.DEV ? appTree : <StrictMode>{appTree}</StrictMode>,
);

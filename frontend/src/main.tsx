import React from 'react';
import ReactDOM from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App.tsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.sass';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Auth0Provider
      domain="dev-84tzokd4ver78xn1.us.auth0.com"
      clientId="xQTpPIr3Mpm4HxT3i0BgbgEkDKCbGz1X"
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: "https://api-asignador-escuelas/" 
      }}
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>,
);
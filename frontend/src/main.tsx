/**
 * ================================================================================
 * ARCHIVO: main.tsx
 * ================================================================================
 * PROPÓSITO:
 * Este es el PUNTO DE ENTRADA (entry point) de la aplicación React (frontend).
 *
 * MANEJA:
 * 1.  La inicialización de React y su "enganche" al DOM (al <div id="root">
 * en el archivo 'index.html').
 * 2.  La importación de los estilos CSS globales (Bootstrap y SASS).
 * 3.  La envoltura (wrapping) de toda la aplicación (<App />) con el
 * <Auth0Provider>. Esto es fundamental para que el servicio de
 * autenticación (useAuth0) esté disponible en toda la app.
 * ================================================================================
 */

// --- Importaciones ---
import React from 'react'; // Librería principal de React.
import ReactDOM from 'react-dom/client'; // Librería para "renderizar" React en el DOM (navegador).
import { Auth0Provider } from '@auth0/auth0-react'; // El "proveedor" de contexto de Auth0.
import App from './App.tsx'; // Importa nuestro componente raíz (el cerebro del frontend).

// --- Importaciones de Estilos Globales ---
// Importa los estilos de Bootstrap para que estén disponibles en toda la app.
import 'bootstrap/dist/css/bootstrap.min.css'; 

// --- Inicialización de React ---

// 1. Busca el <div id="root"> en el archivo 'public/index.html'.
// 2. Crea la "raíz" de la aplicación React en ese div.
// 3. 'render()' le dice a React qué dibujar dentro de esa raíz.
ReactDOM.createRoot(document.getElementById('root')!).render(
  
  // <React.StrictMode> es una herramienta de desarrollo de React
  // que ayuda a encontrar problemas potenciales en la app (no afecta a producción).
  <React.StrictMode>
    
    {/* --- Configuración de Auth0 ---
        Este <Auth0Provider> envuelve a <App />. Esto significa que CUALQUIER
        componente dentro de <App> (como Header, PanelAdmin, etc.)
        puede "preguntar" a Auth0 si el usuario está logueado.
    */}
    <Auth0Provider
      // Credenciales de tu aplicación Auth0
      domain="dev-84tzokd4ver78xn1.us.auth0.com"
      clientId="xQTpPIr3Mpm4HxT3i0BgbgEkDKCbGz1X"
      
      authorizationParams={{
        // A dónde debe redirigir Auth0 al usuario después de un login exitoso.
        // 'window.location.origin' significa "la misma página donde estoy" (ej: http://localhost:5173)
        redirect_uri: window.location.origin,
        
        // ¡CRÍTICO! Esto le dice a Auth0: "El usuario que se loguee
        // necesita un token (JWT) que sea válido para esta API (nuestro backend)".
        audience: "https://api-asignador-escuelas/" 
      }}
    >
      {/* <App /> es nuestro componente principal (ver App.tsx) */}
      <App />
      
    </Auth0Provider>
  </React.StrictMode>,
);
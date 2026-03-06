import { Auth0Provider } from '@auth0/auth0-react';
import type { ReactNode } from 'react'; 

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: "https://api-asignador-escuelas/"
      }}
    >
      {children}
    </Auth0Provider>
  );
};

export default AuthProvider;
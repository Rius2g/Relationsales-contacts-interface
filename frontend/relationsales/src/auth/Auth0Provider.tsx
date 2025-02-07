import { Auth0Provider } from "@auth0/auth0-react";
import React from "react";

const domain = import.meta.env.VITE_AUTH0_DOMAIN;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;

if (!domain || !clientId) {
  throw new Error("Missing Auth0 configuration");
}

export const Auth0ProviderWithNavigate = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const origin = window.location.origin;

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: `${origin}`,
        audience: "http://localhost:8080",
        scope: "openid profile email offline_access",
      }}
      useRefreshTokens={true}
      cacheLocation="localstorage"
      // Enable refresh token rotation
      useRefreshTokensFallback={true}
    >
      {children}
    </Auth0Provider>
  );
};

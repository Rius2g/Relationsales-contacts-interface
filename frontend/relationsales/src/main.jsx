import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Auth0ProviderWithNavigate } from "./auth/Auth0Provider";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Auth0ProviderWithNavigate>
      <App />
    </Auth0ProviderWithNavigate>
  </StrictMode>,
);

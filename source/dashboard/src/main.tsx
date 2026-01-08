import React from "react";
import ReactDOM from "react-dom/client";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "./index.css";
import App from "./App.tsx";
import { PrimeReactProvider } from "primereact/api";
import { AuthProvider } from "./contexts/AuthContext/AuthProvider.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PrimeReactProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </PrimeReactProvider>
  </React.StrictMode>
);

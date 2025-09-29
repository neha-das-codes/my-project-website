import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css"; // Tailwind styles
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./AppRoutes"; // Updated import
import { AuthProvider } from "./contexts/AuthContext"; // auth context provider

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes /> {/* all routes handled here */}
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

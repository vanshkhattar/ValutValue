import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { RouterProvider } from 'react-router-dom';
import { Routes } from './provider/Route';
import { Provider } from 'react-redux';
import { store } from './provider/Store';
import { PrimeReactProvider } from 'primereact/api';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'sonner';

// PrimeReact theme
import "primereact/resources/themes/lara-light-cyan/theme.css";

// ✅ Get clientId from .env file
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <PrimeReactProvider>
        <Provider store={store}>
          <Toaster position='top-right' closeButton />
          <RouterProvider router={Routes} />
        </Provider>
      </PrimeReactProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);

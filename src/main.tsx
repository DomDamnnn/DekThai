import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { applyAppTheme, readAppSettings } from '@/lib/appSettings'
import { AuthProvider } from '@/hooks/useAuth'

applyAppTheme(readAppSettings().theme);

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);

import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { applyAppTheme, readAppSettings } from '@/lib/appSettings'

applyAppTheme(readAppSettings().theme);

createRoot(document.getElementById("root")!).render(<App />);

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {AppProvider } from "./context/AppContext.tsx"
import { GoogleOAuthProvider } from '@react-oauth/google'

export const server = "http://localhost:5000";


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <GoogleOAuthProvider clientId='518782470964-2b28ohjii0cc8bkcbs330fq9bj8cpvaq.apps.googleusercontent.com'>
      <App />{/*React internally ऐसे समझता है : <AppProvider children={<App />} />*/}
      </GoogleOAuthProvider>
    </AppProvider>
  </StrictMode>,
)



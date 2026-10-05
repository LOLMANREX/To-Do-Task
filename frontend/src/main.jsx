import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ViewModeProvider } from './contexts/ViewModeContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <ViewModeProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ViewModeProvider>
    </ThemeProvider>
  </React.StrictMode>
)
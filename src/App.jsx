import { useState } from 'react'
import { AuthProvider } from "./context/AuthContext"
import ProtectedRoute from "./routes/ProtectedRoute"
import './App.css'

import MikiPage from "./Page/MikiPage"
import MagoliPage from "./Page/MagoliPage"
import BonetePage from './Page/BonetePage'
import LoginPage from "./Page/Login"

import Miki from "./components/miki/miki"
import Magoli from "./components/magoli/magoli"
import Bonete from "./components/bonete/bonete"
import { Routes, Route } from 'react-router-dom'

function App() {
  return (
    <>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/miki"
            element={
              <ProtectedRoute allowedRoles={['miki']}>
                <MikiPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/magoli"
            element={
              <ProtectedRoute allowedRoles={['magoli']}>
                <MagoliPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bonete"
            element={
              <ProtectedRoute allowedRoles={['bonete']}>
                <BonetePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </>
  )
}

export default App
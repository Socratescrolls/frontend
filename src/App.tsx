import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import WelcomeForm from './components/WelcomeForm';
import MainAppContent from './components/MainAppContent';
import Layout from './components/Layout';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<WelcomeForm />} />
          <Route 
            path="/app" 
            element={
              <ProtectedRoute>
                <MainAppContent />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const userDataExists = localStorage.getItem('userFormData');
  return userDataExists ? <>{children}</> : <Navigate to="/" replace />;
}

export default App;
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
// Импорт компонентов аутентификации
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import LoadingSplash from './components/LoadingSplash';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Calculator from './pages/Calculator';
import Animals from './pages/Animals';
import Feeds from './pages/Feeds';
import Comparisons from './pages/Comparisons';
import PrivacyPolicy from './pages/PrivacyPolicy';
import PublicOffer from './pages/PublicOffer';
import UserAgreement from './pages/UserAgreement';
import TechnicalSupport from './pages/TechnicalSupport';

// Компонент для публичных маршрутов (только для неавторизованных)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading">
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🐕</div>
          <div>Загрузка...</div>
        </div>
      </div>
    );
  }

  return !isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
};

// Основной компонент приложения (без AuthProvider)
const AppContent: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  if (isLoading) {
    return <LoadingSplash onLoadingComplete={handleLoadingComplete} />;
  }

  return (
    <div className="App">
      <Router>
        <Routes>
          {/* Публичные маршруты для авторизации */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />

          {/* Основное приложение - доступно всем */}
          <Route path="/*" element={
            <Layout>
              <Routes>
                {/* Главная страница - Dashboard */}
                <Route path="/" element={<Dashboard />} />
                
                {/* Страница животных */}
                <Route path="/animals" element={<Animals />} />
                
                <Route path="/feeds" element={<Feeds />} />
                
                <Route path="/calculator" element={<Calculator />} />
                
                <Route path="/comparisons" element={<Comparisons />} />
                
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                
                <Route path="/public-offer" element={<PublicOffer />} />
                
                <Route path="/user-agreement" element={<UserAgreement />} />
                
                <Route path="/technical-support" element={<TechnicalSupport />} />
                
                {/* 404 страница */}
                <Route path="*" element={
                  <div style={{
                    minHeight: '80vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '20px',
                    margin: '20px'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        fontSize: '120px',
                        marginBottom: '20px'
                      }}>
                        🤔
                      </div>
                      <h1 style={{
                        fontSize: '48px',
                        fontWeight: '800',
                        background: 'var(--primary-gradient)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '16px'
                      }}>
                        404
                      </h1>
                      <h2 style={{
                        color: 'var(--dark-green)',
                        marginBottom: '16px'
                      }}>
                        Страница не найдена
                      </h2>
                      <p style={{
                        color: 'var(--text-secondary)',
                        marginBottom: '32px',
                        maxWidth: '400px'
                      }}>
                        Похоже, эта страница потерялась как котенок в ветклинике!
        </p>
        <a
                        href="/"
                        className="btn btn-primary"
                        style={{
                          textDecoration: 'none',
                          display: 'inline-block'
                        }}
                      >
                        🏠 Вернуться на главную
        </a>
                    </div>
                  </div>
                } />
              </Routes>
            </Layout>
          } />
        </Routes>
        
        {/* Глобальные уведомления */}
        <div id="toast-container" style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000
        }} />
      </Router>
    </div>
  );
};

// Главный компонент App с AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Корма', href: '/feeds', icon: 'restaurant' },
    { name: 'Калькулятор', href: '/calculator', icon: 'calculate' },
    { name: 'Аналитика', href: '/comparisons', icon: 'analytics' },
    { name: 'Питомцы', href: '/animals', icon: 'pets' }
  ];

  const getIcon = (iconName: string) => {
    const icons = {
      dashboard: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
        </svg>
      ),
      pets: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="4.5" cy="9.5" r="2.5"/>
          <circle cx="9" cy="5.5" r="2.5"/>
          <circle cx="15" cy="5.5" r="2.5"/>
          <circle cx="19.5" cy="9.5" r="2.5"/>
          <path d="M17.34 14.86c-.87-1.02-1.6-1.89-2.48-2.91-.46-.54-1.05-1.08-1.75-1.32-.11-.04-.22-.07-.33-.09-.25-.04-.52-.04-.78-.04s-.53 0-.79.05c-.11.02-.22.05-.33.09-.7.24-1.28.78-1.75 1.32-.87 1.02-1.6 1.89-2.48 2.91-1.31 1.31-2.92 2.76-2.62 4.79.29 1.02 1.02 2.03 2.33 2.32.73.15 3.06-.44 5.54-.44h.18c2.48 0 4.81.58 5.54.44 1.31-.29 2.04-1.31 2.33-2.32.31-2.04-1.3-3.49-2.61-4.8z"/>
        </svg>
      ),
      restaurant: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/>
        </svg>
      ),
      calculate: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V7h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2zm4 8h-2v-6h2v6zm0-8h-2V7h2v2z"/>
        </svg>
      ),
      analytics: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/>
        </svg>
      )
    };
    return icons[iconName as keyof typeof icons] || icons.dashboard;
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e8f8f5 0%, #d1f2eb 100%)'
    }}>
      {/* Professional Navigation */}
      <nav style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 200, 81, 0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 8px 32px rgba(0, 200, 81, 0.08)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          height: '72px'
        }}>
          {/* Logo */}
          <Link 
            to="/" 
            style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              fontSize: '24px',
              fontWeight: '700',
              color: '#2d3748',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#00C851';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#2d3748';
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '12px' }}>
              <circle cx="6" cy="8" r="2"/>
              <circle cx="18" cy="8" r="2"/>
              <circle cx="12" cy="6" r="2"/>
              <ellipse cx="12" cy="15" rx="5" ry="4"/>
            </svg>
            VetFormuLab
            <span style={{
              color: '#666',
              fontSize: '14px',
              fontWeight: '500',
              marginLeft: '8px'
            }}>
              Pro
            </span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              background: 'rgba(0, 200, 81, 0.1)',
              border: '2px solid rgba(0, 200, 81, 0.2)',
              borderRadius: '12px',
              padding: '10px',
              fontSize: '20px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              color: '#00C851'
            }}
            className="mobile-menu-toggle"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 200, 81, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(0, 200, 81, 0.4)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 200, 81, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(0, 200, 81, 0.2)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>

          {/* Desktop Navigation */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }} className="desktop-nav">
            {navigation.map((item, index) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 18px',
                    borderRadius: '14px',
                    textDecoration: 'none',
                    fontSize: '15px',
                    fontWeight: '600',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    background: isActive 
                      ? 'linear-gradient(135deg, #00C851 0%, #33B5E5 100%)' 
                      : 'transparent',
                    color: isActive 
                      ? 'white' 
                      : '#2d3748',
                    border: isActive 
                      ? 'none' 
                      : '2px solid transparent',
                    boxShadow: isActive 
                      ? '0 4px 16px rgba(0, 200, 81, 0.3)' 
                      : 'none',
                    transform: isActive ? 'translateY(-1px)' : 'translateY(0)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(0, 200, 81, 0.08)';
                      e.currentTarget.style.borderColor = 'rgba(0, 200, 81, 0.15)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 200, 81, 0.15)';
                    } else {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 200, 81, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = 'transparent';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    } else {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 200, 81, 0.3)';
                    }
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'rotate(5deg) scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'rotate(0deg) scale(1)';
                  }}
                  >
                    {getIcon(item.icon)}
                  </div>
                  <span style={{ letterSpacing: '0.3px' }}>{item.name}</span>
                  
                  {/* Animated background */}
                  {!isActive && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(0, 200, 81, 0.1), transparent)',
                      transition: 'left 0.5s ease',
                      zIndex: -1
                    }} />
                  )}
                </Link>
              );
            })}
          </div>

          {/* User Area */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            {isAuthenticated ? (
              <>
                {/* Clinic Info */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'linear-gradient(135deg, rgba(0, 200, 81, 0.08) 0%, rgba(51, 181, 229, 0.08) 100%)',
                  padding: '10px 16px',
                  borderRadius: '16px',
                  border: '2px solid rgba(0, 200, 81, 0.15)',
                  maxWidth: '200px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 200, 81, 0.12) 0%, rgba(51, 181, 229, 0.12) 100%)';
                  e.currentTarget.style.borderColor = 'rgba(0, 200, 81, 0.25)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 200, 81, 0.08) 0%, rgba(51, 181, 229, 0.08) 100%)';
                  e.currentTarget.style.borderColor = 'rgba(0, 200, 81, 0.15)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                >
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #00C851 0%, #33B5E5 100%)',
                    marginRight: '10px',
                    animation: 'pulse 2s infinite'
                  }} />
                  <span style={{ 
                    color: '#00C851',
                    fontSize: '14px',
                    fontWeight: '600',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap'
                  }}>
                    {user?.clinic_name || 'Clinic'}
                  </span>
                </div>

                {/* User Profile */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.8)',
                  border: '2px solid rgba(0, 200, 81, 0.15)',
                  borderRadius: '18px',
                  padding: '8px 12px',
                  gap: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
                  e.currentTarget.style.borderColor = 'rgba(0, 200, 81, 0.3)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 200, 81, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
                  e.currentTarget.style.borderColor = 'rgba(0, 200, 81, 0.15)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #00C851 0%, #33B5E5 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '700',
                    boxShadow: '0 4px 12px rgba(0, 200, 81, 0.3)'
                  }}>
                    {(user?.contact_person || 'Dr')[0].toUpperCase()}
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    minWidth: '0'
                  }}>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#2d3748',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      maxWidth: '100px'
                    }}>
                      {user?.contact_person || 'Doctor'}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#00C851',
                      fontWeight: '600'
                    }}>
                      {user?.subscription_type === 'basic' ? 'Basic Plan' : 'Pro Plan'}
                    </div>
                  </div>
                </div>

                {/* Logout Button */}
                <button 
                  onClick={logout}
                  style={{
                    background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.05) 100%)',
                    color: '#dc3545',
                    border: '2px solid rgba(244, 67, 54, 0.2)',
                    borderRadius: '12px',
                    width: '44px',
                    height: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '18px',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(244, 67, 54, 0.15) 0%, rgba(244, 67, 54, 0.1) 100%)';
                    e.currentTarget.style.borderColor = 'rgba(244, 67, 54, 0.4)';
                    e.currentTarget.style.transform = 'scale(1.1) rotate(-5deg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.05) 100%)';
                    e.currentTarget.style.borderColor = 'rgba(244, 67, 54, 0.2)';
                    e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                  }}
                  title="Logout"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                  </svg>
                </button>
              </>
            ) : (
              <>
                {/* Login Button */}
                <Link 
                  to="/login"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 18px',
                    background: 'rgba(0, 200, 81, 0.08)',
                    color: '#00C851',
                    border: '2px solid rgba(0, 200, 81, 0.2)',
                    borderRadius: '14px',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 200, 81, 0.15)';
                    e.currentTarget.style.borderColor = 'rgba(0, 200, 81, 0.4)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 200, 81, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 200, 81, 0.08)';
                    e.currentTarget.style.borderColor = 'rgba(0, 200, 81, 0.2)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H19V9Z"/>
                  </svg>
                  Login
                </Link>

                {/* Register Button */}
                <Link 
                  to="/register"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 18px',
                    background: 'linear-gradient(135deg, #00C851 0%, #33B5E5 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '14px',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 16px rgba(0, 200, 81, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 200, 81, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 200, 81, 0.3)';
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15 12C17.21 12 19 10.21 19 8S17.21 4 15 4 11 5.79 11 8 12.79 12 15 12M6 10V7H4V10H1V12H4V15H6V12H9V10M15 14C12.33 14 7 15.34 7 18V20H23V18C23 15.34 17.67 14 15 14Z"/>
                  </svg>
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: '72px',
          left: 0,
          right: 0,
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 200, 81, 0.1)',
          zIndex: 999,
          padding: '24px',
          boxShadow: '0 8px 32px rgba(0, 200, 81, 0.1)',
          animation: 'slideDown 0.3s ease-out'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '16px 20px',
                    borderRadius: '16px',
                    textDecoration: 'none',
                    fontSize: '16px',
                    fontWeight: '600',
                    background: isActive 
                      ? 'linear-gradient(135deg, #00C851 0%, #33B5E5 100%)' 
                      : 'rgba(0, 200, 81, 0.05)',
                    color: isActive 
                      ? 'white' 
                      : '#2d3748',
                    border: '2px solid rgba(0, 200, 81, 0.1)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {getIcon(item.icon)}
                  {item.name}
                </Link>
              );
            })}
            
            {/* Mobile Auth */}
            <div style={{
              borderTop: '1px solid rgba(0, 200, 81, 0.1)',
              paddingTop: '16px',
              marginTop: '12px'
            }}>
              {!isAuthenticated ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <Link 
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '14px 20px',
                      background: 'rgba(0, 200, 81, 0.08)',
                      color: '#00C851',
                      border: '2px solid rgba(0, 200, 81, 0.2)',
                      borderRadius: '14px',
                      textDecoration: 'none',
                      fontSize: '15px',
                      fontWeight: '600'
                    }}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '14px 20px',
                      background: 'linear-gradient(135deg, #00C851 0%, #33B5E5 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '14px',
                      textDecoration: 'none',
                      fontSize: '15px',
                      fontWeight: '600'
                    }}
                  >
                    Register
                  </Link>
                </div>
              ) : (
                <button 
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '14px 20px',
                    background: 'rgba(244, 67, 54, 0.1)',
                    color: '#dc3545',
                    border: '2px solid rgba(244, 67, 54, 0.2)',
                    borderRadius: '14px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main style={{
        minHeight: 'calc(100vh - 72px)',
        padding: '0'
      }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(0, 200, 81, 0.1)',
        padding: '48px 24px',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '32px',
            fontSize: '20px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #00C851 0%, #33B5E5 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #00C851 0%, #33B5E5 100%)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M19 8l-4 4h3c0 3.31-2.69 6-6 6-1.01 0-1.97-.25-2.8-.7l-1.46 1.46C8.97 19.54 10.43 20 12 20c4.42 0 8-3.58 8-8h3l-4-4zM6 12c0-3.31 2.69-6 6-6 1.01 0 1.97.25 2.8.7l1.46-1.46C15.03 4.46 13.57 4 12 4c-4.42 0-8 3.58-8 8H1l4 4 4-4H6z"/>
              </svg>
            </div>
            VetFormuLab Pro
          </div>
          
          {/* Legal Links */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '20px',
            flexWrap: 'wrap',
            marginBottom: '24px',
            fontSize: '14px'
          }}>
            <Link 
              to="/public-offer"
              style={{
                color: '#6b7280',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'color 0.3s ease',
                padding: '8px 12px',
                borderRadius: '6px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#00C851';
                e.currentTarget.style.background = 'rgba(0, 200, 81, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#6b7280';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Публичная оферта
            </Link>
            
            <span style={{ color: '#d1d5db', fontSize: '12px' }}>•</span>
            
            <Link 
              to="/privacy-policy"
              style={{
                color: '#6b7280',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'color 0.3s ease',
                padding: '8px 12px',
                borderRadius: '6px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#00C851';
                e.currentTarget.style.background = 'rgba(0, 200, 81, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#6b7280';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Политика конфиденциальности
            </Link>
            
            <span style={{ color: '#d1d5db', fontSize: '12px' }}>•</span>
            
            <Link 
              to="/user-agreement"
              style={{
                color: '#6b7280',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'color 0.3s ease',
                padding: '8px 12px',
                borderRadius: '6px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#00C851';
                e.currentTarget.style.background = 'rgba(0, 200, 81, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#6b7280';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Пользовательское соглашение
            </Link>
            
            <span style={{ color: '#d1d5db', fontSize: '12px' }}>•</span>
            
            <Link 
              to="/technical-support"
              style={{
                color: '#6b7280',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'color 0.3s ease',
                padding: '8px 12px',
                borderRadius: '6px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#00C851';
                e.currentTarget.style.background = 'rgba(0, 200, 81, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#6b7280';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Техподдержка
            </Link>
          </div>
          
          <div style={{
            color: '#6b7280',
            fontSize: '15px',
            fontWeight: '500',
            paddingTop: '24px',
            borderTop: '1px solid rgba(0, 200, 81, 0.1)'
          }}>
            © 2025 VetFormuLab Pro. Professional veterinary nutrition platform.
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Layout; 
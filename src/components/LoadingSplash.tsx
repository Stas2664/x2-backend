import React, { useState, useEffect } from 'react';

interface LoadingSplashProps {
  onLoadingComplete: () => void;
}

const LoadingSplash: React.FC<LoadingSplashProps> = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Инициализация...');

  useEffect(() => {
    const texts = [
      'Инициализация системы...',
      'Загрузка базы кормов...',
      'Настройка расчетов...',
      'Подготовка интерфейса...',
      'Готово к работе!'
    ];

    let currentTextIndex = 0;
    let progressValue = 0;

    const interval = setInterval(() => {
      progressValue += Math.random() * 25 + 10;
      
      if (progressValue > 100) {
        progressValue = 100;
        clearInterval(interval);
        setTimeout(() => {
          onLoadingComplete();
        }, 1000);
      }

      setProgress(progressValue);
      
      if (currentTextIndex < texts.length - 1 && progressValue > (currentTextIndex + 1) * 20) {
        currentTextIndex++;
        setLoadingText(texts[currentTextIndex]);
      }
    }, 300);

    return () => clearInterval(interval);
  }, [onLoadingComplete]);

  return (
    <div className="loading-splash">
      <div className="logo-animation">
        🐾
      </div>
      
      <div className="loading-text">
        VetFormuLab
      </div>
      
      <div className="loading-subtitle" style={{
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: '1.2rem',
        marginBottom: '3rem',
        fontWeight: 300
      }}>
        Система расчета кормов нового поколения
      </div>
      
      <div className="loading-bar">
        <div 
          className="loading-progress" 
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div style={{
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: '1rem',
        marginTop: '2rem',
        fontWeight: 400,
        textAlign: 'center'
      }}>
        {loadingText}
      </div>
      
      <div style={{
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: '0.9rem',
        marginTop: '1rem',
        textAlign: 'center'
      }}>
        {Math.round(progress)}%
      </div>

      {/* Particles animation */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none'
      }}>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: '4px',
              height: '4px',
              background: 'rgba(255, 255, 255, 0.6)',
              borderRadius: '50%',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default LoadingSplash; 
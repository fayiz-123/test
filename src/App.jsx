import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SmsToast } from './components/SmsToast';
import { PhoneStep } from './components/PhoneStep';
import { OtpStep } from './components/OtpStep';
import { HomePage } from './components/HomePage';

function AppContent() {
  const { isAuthenticated, step } = useAuth();

  return (
    <div className="app-container">
      {/* Simulated SMS Notification Popup */}
      <SmsToast />

      {isAuthenticated ? (
        <HomePage />
      ) : (
        <main className="auth-viewport">
          {/* Decorative background blobs */}
          <div className="ambient-blob ambient-blob-1"></div>
          <div className="ambient-blob ambient-blob-2"></div>

          <div className="auth-card-container">
            {step === 'phone' && <PhoneStep />}
            {step === 'otp' && <OtpStep />}
          </div>
        </main>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

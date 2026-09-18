import React, { createContext, useContext, useState, useEffect } from 'react';
import { RecaptchaVerifier, signInWithPhoneNumber, signOut } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebase/config';

const AuthContext = createContext(null);
const STORAGE_KEY = 'secure_auth_session';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [step, setStep] = useState(() => (user ? 'home' : 'phone'));
  const [pendingPhone, setPendingPhone] = useState({
    countryCode: '+91',
    phoneNumber: '',
    formatted: '',
    e164: ''
  });

  // Firebase confirmation result
  const [confirmationResult, setConfirmationResult] = useState(null);

  // Simulation fallback states (active when Firebase credentials are not yet added to .env.local)
  const [currentOtp, setCurrentOtp] = useState('');
  const [smsNotification, setSmsNotification] = useState(null);
  const [autoFillTrigger, setAutoFillTrigger] = useState(null);

  useEffect(() => {
    if (user) {
      setStep('home');
    }
  }, [user]);

  // Clean up reCAPTCHA on unmount
  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch {}
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  // Initialize or retrieve existing RecaptchaVerifier
  const getRecaptchaVerifier = (containerId = 'recaptcha-container') => {
    if (!auth) return null;

    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: 'normal',
        callback: () => {
          // reCAPTCHA solved
        },
        'expired-callback': () => {
          if (window.recaptchaVerifier) {
            try {
              window.recaptchaVerifier.clear();
            } catch {}
            window.recaptchaVerifier = null;
          }
        }
      });
    }

    return window.recaptchaVerifier;
  };

  // Generate a random 6-digit OTP for simulation fallback
  const generateSimulatedOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Send OTP (using Firebase if configured, otherwise fallback to simulation)
  const sendOtp = async (countryCode, phoneNumber) => {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    const cleanCode = countryCode.startsWith('+') ? countryCode : `+${countryCode}`;
    const e164 = `${cleanCode}${cleanNumber}`;
    const formatted = `${cleanCode} ${cleanNumber}`;

    setPendingPhone({ countryCode: cleanCode, phoneNumber: cleanNumber, formatted, e164 });

    if (isFirebaseConfigured && auth) {
      try {
        const appVerifier = getRecaptchaVerifier('recaptcha-container');
        const confirmation = await signInWithPhoneNumber(auth, e164, appVerifier);
        setConfirmationResult(confirmation);
        setStep('otp');
        return { success: true, mode: 'firebase' };
      } catch (error) {
        console.error('Firebase signInWithPhoneNumber error:', error);
        // Reset verifier so user can retry
        if (window.recaptchaVerifier) {
          try {
            window.recaptchaVerifier.clear();
          } catch {}
          window.recaptchaVerifier = null;
        }

        let friendlyMessage = 'Failed to send SMS OTP. Please try again.';
        if (error.code === 'auth/billing-not-enabled') {
          friendlyMessage = 'Firebase requires the Blaze plan to send carrier SMS, OR add this number as a "Test Phone Number" in Firebase Console (Authentication > Phone > Phone numbers for testing).';
        } else if (
          error.code === 'auth/invalid-app-credential' ||
          (error.message && error.message.includes('INVALID_APP_CREDENTIAL'))
        ) {
          friendlyMessage = 'reCAPTCHA verification failed (INVALID_APP_CREDENTIAL). Please complete the "I\'m not a robot" checkbox and ensure you are accessing via http://localhost:5173.';
        } else if (error.code === 'auth/invalid-phone-number') {
          friendlyMessage = 'Invalid phone number format. Please ensure correct country code and digits.';
        } else if (error.code === 'auth/too-many-requests') {
          friendlyMessage = 'Too many requests. Please wait a few minutes or use a test phone number.';
        } else if (error.code === 'auth/quota-exceeded') {
          friendlyMessage = 'Daily SMS quota exceeded. Use configured test numbers in Firebase Console.';
        } else if (error.code === 'auth/captcha-check-failed') {
          friendlyMessage = 'reCAPTCHA check failed. Please refresh the page and try again.';
        } else if (error.message) {
          friendlyMessage = error.message;
        }

        return { success: false, message: friendlyMessage };
      }
    } else {
      // Local simulation mode
      const otp = generateSimulatedOtp();
      setCurrentOtp(otp);
      setSmsNotification({
        code: otp,
        phone: formatted,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        id: Date.now()
      });
      setStep('otp');
      return { success: true, mode: 'simulated' };
    }
  };

  // Resend OTP
  const resendOtp = async () => {
    if (isFirebaseConfigured && auth && pendingPhone.e164) {
      try {
        if (window.recaptchaVerifier) {
          try {
            window.recaptchaVerifier.clear();
          } catch {}
          window.recaptchaVerifier = null;
        }
        const appVerifier = getRecaptchaVerifier('recaptcha-container');
        const confirmation = await signInWithPhoneNumber(auth, pendingPhone.e164, appVerifier);
        setConfirmationResult(confirmation);
        return { success: true, mode: 'firebase' };
      } catch (error) {
        console.error('Firebase resend error:', error);
        return { success: false, message: error.message || 'Failed to resend code' };
      }
    } else {
      const otp = generateSimulatedOtp();
      setCurrentOtp(otp);
      setSmsNotification({
        code: otp,
        phone: pendingPhone.formatted,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        id: Date.now()
      });
      return { success: true, mode: 'simulated' };
    }
  };

  // Verify OTP
  const verifyOtp = async (enteredOtp) => {
    if (isFirebaseConfigured && confirmationResult) {
      try {
        const userCredential = await confirmationResult.confirm(enteredOtp);
        const fbUser = userCredential.user;

        const userData = {
          phoneNumber: pendingPhone.phoneNumber,
          countryCode: pendingPhone.countryCode,
          fullPhone: fbUser.phoneNumber || pendingPhone.formatted,
          uid: fbUser.uid,
          loginTime: new Date().toLocaleString(),
          sessionId: 'FB-' + fbUser.uid.substring(0, 8).toUpperCase(),
          authProvider: 'Firebase Phone Auth'
        };

        setUser(userData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
        setStep('home');
        return { success: true };
      } catch (error) {
        console.error('Firebase confirm error:', error);
        let message = 'Invalid verification code. Please check the code and try again.';
        if (error.code === 'auth/code-expired') {
          message = 'Verification code has expired. Please request a new code.';
        } else if (error.code === 'auth/invalid-verification-code') {
          message = 'Incorrect OTP code. Please check your SMS and try again.';
        }
        return { success: false, message };
      }
    } else {
      // Local simulation verification
      if (enteredOtp === currentOtp || enteredOtp === '123456') {
        const userData = {
          phoneNumber: pendingPhone.phoneNumber,
          countryCode: pendingPhone.countryCode,
          fullPhone: pendingPhone.formatted,
          uid: 'SIM-' + Math.random().toString(36).substring(2, 9),
          loginTime: new Date().toLocaleString(),
          sessionId: 'SES-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
          authProvider: 'Local Simulated Auth'
        };

        setUser(userData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
        setStep('home');
        setSmsNotification(null);
        return { success: true };
      }

      return {
        success: false,
        message: 'Invalid OTP. Please check the code in the SMS and try again.'
      };
    }
  };

  const changePhoneNumber = () => {
    setStep('phone');
    setCurrentOtp('');
    setSmsNotification(null);
    setConfirmationResult(null);
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch {}
      window.recaptchaVerifier = null;
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.warn('Firebase sign out error:', err);
      }
    }

    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setCurrentOtp('');
    setConfirmationResult(null);
    setPendingPhone({ countryCode: '+91', phoneNumber: '', formatted: '', e164: '' });
    setSmsNotification(null);
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch {}
      window.recaptchaVerifier = null;
    }
    setStep('phone');
  };

  const dismissSms = () => setSmsNotification(null);

  const triggerAutoFill = () => {
    if (smsNotification?.code) {
      setAutoFillTrigger(smsNotification.code);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        step,
        pendingPhone,
        currentOtp,
        smsNotification,
        autoFillTrigger,
        isFirebaseConfigured,
        clearAutoFillTrigger: () => setAutoFillTrigger(null),
        getRecaptchaVerifier,
        sendOtp,
        resendOtp,
        verifyOtp,
        changePhoneNumber,
        logout,
        dismissSms,
        triggerAutoFill
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

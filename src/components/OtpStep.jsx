import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, Edit2, RotateCw, CheckCircle, AlertCircle, ArrowLeft, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const OtpStep = () => {
  const {
    pendingPhone,
    verifyOtp,
    resendOtp,
    changePhoneNumber,
    isFirebaseConfigured,
    autoFillTrigger,
    clearAutoFillTrigger
  } = useAuth();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [shake, setShake] = useState(false);

  const inputRefs = useRef([]);

  // Countdown timer for Resend OTP
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  // Handle auto-fill trigger (from test toast or clipboard)
  useEffect(() => {
    if (autoFillTrigger && autoFillTrigger.length === 6) {
      const digits = autoFillTrigger.split('');
      setOtp(digits);
      setError('');
      clearAutoFillTrigger();
      if (inputRefs.current[5]) {
        inputRefs.current[5].focus();
      }
    }
  }, [autoFillTrigger, clearAutoFillTrigger]);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    const cleanDigit = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = cleanDigit;
    setOtp(newOtp);
    if (error) setError('');

    if (cleanDigit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newOtp = [...otp];
    pastedData.split('').forEach((digit, i) => {
      if (i < 6) newOtp[i] = digit;
    });
    setOtp(newOtp);
    if (error) setError('');

    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const fullOtp = otp.join('');

    if (fullOtp.length < 6) {
      setError('Please enter all 6 digits of the OTP');
      triggerShake();
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const result = await verifyOtp(fullOtp);
      if (!result.success) {
        setError(result.message || 'Invalid verification code');
        triggerShake();
      }
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.');
      triggerShake();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setError('');
    try {
      const res = await resendOtp();
      if (res.success) {
        setTimer(30);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setError(res.message || 'Failed to resend code');
      }
    } catch (err) {
      setError(err.message || 'Failed to resend code');
    }
  };

  const isComplete = otp.every((digit) => digit !== '');

  return (
    <div className={`auth-card ${shake ? 'shake-animation' : ''}`}>
      {/* Back button & Brand Header */}
      <button 
        type="button" 
        onClick={changePhoneNumber} 
        className="back-step-btn"
        aria-label="Back to mobile number entry"
      >
        <ArrowLeft size={16} />
        <span>Change Number</span>
      </button>

      <div className="auth-header">
        <div className="auth-icon-badge auth-icon-badge-otp">
          <ShieldCheck className="brand-icon text-indigo" size={28} />
        </div>
        <h1 className="auth-title">Verify Mobile OTP</h1>
        <p className="auth-subtitle">
          We have sent a 6-digit verification code to
        </p>
        <div className="target-phone-pill">
          <span className="target-phone-text">{pendingPhone.formatted}</span>
          <button
            type="button"
            onClick={changePhoneNumber}
            className="edit-phone-btn"
            title="Edit number"
            aria-label="Edit number"
          >
            <Edit2 size={13} />
          </button>
        </div>
      </div>

      {/* OTP Form */}
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="otp-boxes-group">
          <label className="form-label text-center">
            Enter 6-Digit Code
          </label>
          <div className="otp-inputs-row" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`otp-digit-box ${digit ? 'filled' : ''} ${
                  error ? 'otp-box-error' : ''
                }`}
                aria-label={`Digit ${index + 1}`}
              />
            ))}
          </div>

          {error ? (
            <div className="form-error-msg form-error-center">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          ) : (
            <p className="otp-helper-text">
              {isFirebaseConfigured
                ? 'Check your mobile SMS inbox for the verification code sent by Google/Firebase.'
                : 'Type the OTP sent to your phone or use the simulated notification above.'}
            </p>
          )}
        </div>

        {/* Resend Section */}
        <div className="resend-container">
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              className="resend-active-btn"
            >
              <RotateCw size={14} />
              <span>Resend OTP SMS</span>
            </button>
          ) : (
            <span className="resend-countdown-text">
              Resend OTP in <strong>{timer}s</strong>
            </span>
          )}
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={!isComplete || isVerifying}
          className="submit-btn"
        >
          {isVerifying ? (
            <span className="btn-spinner-wrap">
              <span className="spinner"></span>
              Verifying Code...
            </span>
          ) : (
            <>
              <span>Verify & Proceed to Home</span>
              <CheckCircle size={18} />
            </>
          )}
        </button>
      </form>

      {/* Footer message */}
      <div className="auth-footer otp-footer-hint">
        {isFirebaseConfigured ? (
          <span className="flex-center-gap">
            <Smartphone size={14} /> Real SMS delivery active via Firebase Authentication
          </span>
        ) : (
          <span>💡 Check the simulated SMS push banner at the top of your screen!</span>
        )}
      </div>
    </div>
  );
};

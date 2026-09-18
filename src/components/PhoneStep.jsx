import React, { useState, useEffect } from 'react';
import { Phone, Shield, ArrowRight, CheckCircle2, Sparkles, Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const COUNTRY_CODES = [
  { code: '+91', country: 'India', flag: '🇮🇳', length: 10 },
  { code: '+1', country: 'United States', flag: '🇺🇸', length: 10 },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧', length: 10 },
  { code: '+971', country: 'United Arab Emirates', flag: '🇦🇪', length: 9 },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦', length: 9 },
  { code: '+65', country: 'Singapore', flag: '🇸🇬', length: 8 },
  { code: '+61', country: 'Australia', flag: '🇦🇺', length: 9 },
  { code: '+49', country: 'Germany', flag: '🇩🇪', length: 10 },
];

export const PhoneStep = () => {
  const { sendOtp, pendingPhone, isFirebaseConfigured, getRecaptchaVerifier } = useAuth();

  const [countryCode, setCountryCode] = useState(pendingPhone.countryCode || '+91');
  const [phoneNumber, setPhoneNumber] = useState(pendingPhone.phoneNumber || '');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isFirebaseConfigured && getRecaptchaVerifier) {
      try {
        const verifier = getRecaptchaVerifier('recaptcha-container');
        if (verifier && typeof verifier.render === 'function') {
          verifier.render().catch(() => {});
        }
      } catch (err) {
        console.warn('reCAPTCHA render notice:', err);
      }
    }
  }, [isFirebaseConfigured, getRecaptchaVerifier]);

  const selectedCountry = COUNTRY_CODES.find((c) => c.code === countryCode) || COUNTRY_CODES[0];

  const handlePhoneChange = (e) => {
    const cleanVal = e.target.value.replace(/\D/g, '');
    if (cleanVal.length <= 15) {
      setPhoneNumber(cleanVal);
      if (error) setError('');
    }
  };

  const handleQuickFill = (presetNumber) => {
    setPhoneNumber(presetNumber);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const minLength = selectedCountry.length || 10;
    if (!phoneNumber) {
      setError('Please enter your mobile number');
      return;
    }

    if (phoneNumber.length < minLength) {
      setError(`Please enter a valid ${minLength}-digit mobile number for ${selectedCountry.country}`);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await sendOtp(countryCode, phoneNumber);
      if (!result.success) {
        setError(result.message || 'Failed to send OTP SMS. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-card">
      {/* Firebase Status Badge */}
      <div className="firebase-status-banner">
        {isFirebaseConfigured ? (
          <span className="fb-badge fb-badge-active">
            <Flame size={13} className="text-orange" />
            <span>Firebase Real SMS Active</span>
          </span>
        ) : (
          <span className="fb-badge fb-badge-sim">
            <Sparkles size={13} />
            <span>Setup Mode (Add keys to .env.local for Real SMS)</span>
          </span>
        )}
      </div>

      {/* Brand & Step Header */}
      <div className="auth-header">
        <div className="auth-icon-badge">
          <Shield className="brand-icon" size={28} />
        </div>
        <h1 className="auth-title">Welcome</h1>
        <p className="auth-subtitle">
          {isFirebaseConfigured
            ? 'Enter your mobile number to receive a real verification SMS code via Firebase.'
            : 'Enter your mobile number to get started with OTP verification.'}
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="phone-input" className="form-label">
            Mobile Number
          </label>
          <div className="phone-input-composite">
            {/* Country Selector */}
            <div className="country-select-wrapper">
              <span className="country-flag">{selectedCountry.flag}</span>
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="country-select"
                aria-label="Country Code"
              >
                {COUNTRY_CODES.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.flag} {item.code} ({item.country})
                  </option>
                ))}
              </select>
            </div>

            {/* Phone Number Input */}
            <div className="number-input-wrapper">
              <Phone className="input-icon" size={18} />
              <input
                id="phone-input"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="tel"
                placeholder={`e.g. 98765 43210`}
                value={phoneNumber}
                onChange={handlePhoneChange}
                className={`number-input ${error ? 'input-error' : ''}`}
                autoFocus
              />
              {phoneNumber && (
                <button
                  type="button"
                  onClick={() => setPhoneNumber('')}
                  className="clear-input-btn"
                  aria-label="Clear input"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {error && <p className="form-error-msg">{error}</p>}
        </div>

        {/* Preset quick test buttons */}
        <div className="quick-test-section">
          <span className="quick-test-label">
            <Sparkles size={13} /> Quick Test Numbers:
          </span>
          <div className="quick-test-tags">
            <button
              type="button"
              onClick={() => handleQuickFill('9876543210')}
              className="quick-tag-btn"
            >
              98765 43210
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('9123456780')}
              className="quick-tag-btn"
            >
              91234 56780
            </button>
          </div>
        </div>

        {/* Invisible reCAPTCHA Anchor for Firebase */}
        <div id="recaptcha-container"></div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !phoneNumber}
          className="submit-btn"
        >
          {isLoading ? (
            <span className="btn-spinner-wrap">
              <span className="spinner"></span>
              {isFirebaseConfigured ? 'Verifying reCAPTCHA & Sending SMS...' : 'Sending OTP...'}
            </span>
          ) : (
            <>
              <span>Get OTP</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      {/* Security note footer */}
      <div className="auth-footer">
        <div className="security-guarantee">
          <CheckCircle2 size={15} className="text-success" />
          <span>Instant SMS verification • No password required</span>
        </div>
      </div>
    </div>
  );
};

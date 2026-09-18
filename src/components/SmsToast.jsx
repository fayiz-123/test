import React, { useState } from 'react';
import { MessageSquare, X, Copy, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SmsToast = () => {
  const { smsNotification, dismissSms, triggerAutoFill } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!smsNotification) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(smsNotification.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <aside className="sms-toast-container" aria-label="Incoming SMS Notification">
      <div className="sms-toast-card">
        {/* Top Header simulating OS Notification */}
        <div className="sms-toast-header">
          <div className="sms-toast-sender">
            <div className="sms-toast-icon-wrap">
              <MessageSquare className="sms-icon" size={15} />
            </div>
            <span className="sms-app-name">MESSAGES</span>
            <span className="sms-bullet">•</span>
            <span className="sms-time">{smsNotification.time || 'now'}</span>
          </div>
          <button 
            onClick={dismissSms}
            className="sms-close-btn"
            title="Dismiss notification"
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>

        {/* Message Content */}
        <div className="sms-toast-body">
          <div className="sms-toast-text">
            <p className="sms-title">SecureAuth Verification</p>
            <p className="sms-message">
              Your one-time password is{' '}
              <span className="sms-otp-badge">{smsNotification.code}</span>. Valid for 10 minutes.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="sms-toast-actions">
          <button 
            type="button"
            onClick={triggerAutoFill}
            className="sms-autofill-btn"
          >
            <Sparkles size={14} />
            <span>Auto-fill OTP</span>
          </button>
          <button 
            type="button"
            onClick={handleCopy}
            className="sms-copy-btn"
          >
            {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy Code'}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

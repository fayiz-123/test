import React, { useState } from 'react';
import {
  Shield,
  Smartphone,
  LogOut,
  CheckCircle2,
  Clock,
  KeyRound,
  Bell,
  Settings,
  UserCheck,
  Zap,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const HomePage = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const stats = [
    {
      title: 'Authentication Method',
      value: 'Mobile SMS OTP',
      desc: 'Two-Factor Verified',
      icon: Smartphone,
      color: 'stat-purple'
    },
    {
      title: 'Account Status',
      value: 'Active & Verified',
      desc: 'Full Access Granted',
      icon: UserCheck,
      color: 'stat-green'
    },
    {
      title: 'Session ID',
      value: user?.sessionId || 'SES-8921A',
      desc: 'Active 256-bit Encrypted',
      icon: KeyRound,
      color: 'stat-blue'
    },
    {
      title: 'Login Timestamp',
      value: user?.loginTime?.split(',')[1] || 'Just now',
      desc: user?.loginTime?.split(',')[0] || 'Today',
      icon: Clock,
      color: 'stat-amber'
    }
  ];

  const features = [
    {
      icon: Zap,
      title: 'Quick Dashboard',
      description: 'Monitor real-time updates and authenticated services at a glance.',
      badge: 'Live'
    },
    {
      icon: Shield,
      title: 'Security & Privacy',
      description: 'Manage OTP verification methods, active devices, and session duration.',
      badge: 'Protected'
    },
    {
      icon: Bell,
      title: 'SMS & Notifications',
      description: 'Configure incoming alert channels and SMS broadcast preferences.',
      badge: 'Enabled'
    },
    {
      icon: Layers,
      title: 'Connected Services',
      description: 'Explore integrations linked directly to your verified phone number.',
      badge: '4 Active'
    }
  ];

  return (
    <div className="home-wrapper">
      {/* Top Navigation Bar */}
      <header className="home-navbar">
        <div className="nav-container">
          <div className="nav-brand">
            <div className="nav-logo-badge">
              <Shield size={22} className="text-brand" />
            </div>
            <div className="nav-brand-text">
              <span className="nav-title">SecureAuth</span>
              <span className="nav-tag">PORTAL</span>
            </div>
          </div>

          <nav className="nav-center-menu">
            <button
              type="button"
              className={`nav-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              type="button"
              className={`nav-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              Security Log
            </button>
            <button
              type="button"
              className={`nav-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              Account
            </button>
          </nav>

          <div className="nav-user-actions">
            <div className="user-phone-badge">
              <div className="online-indicator"></div>
              <span className="user-phone-text">{user?.fullPhone || '+91 98765 43210'}</span>
            </div>

            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="logout-nav-btn"
              title="Log out from Home"
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Home Content */}
      <main className="home-main">
        {/* Hero Section */}
        <section className="hero-banner">
          <div className="hero-content">
            <div className="hero-pill">
              <CheckCircle2 size={14} className="text-emerald" />
              <span>Successfully Authenticated via SMS OTP</span>
            </div>
            <h1 className="hero-heading">
              Welcome to the <span className="gradient-text">Home Page</span>
            </h1>
            <p className="hero-subtext">
              You have successfully bypassed the login gate using your mobile one-time password.
              Explore your protected dashboard features below.
            </p>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="stats-section">
          <div className="stats-grid">
            {stats.map((stat, idx) => {
              const IconComp = stat.icon;
              return (
                <div key={idx} className={`stat-card ${stat.color}`}>
                  <div className="stat-icon-wrap">
                    <IconComp size={22} />
                  </div>
                  <div className="stat-details">
                    <span className="stat-title">{stat.title}</span>
                    <h3 className="stat-value">{stat.value}</h3>
                    <span className="stat-desc">{stat.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Main Content Grid */}
        <section className="content-grid-section">
          {/* Left Column: Feature Hub */}
          <div className="feature-hub">
            <div className="section-title-wrap">
              <h2 className="section-title">Home Services & Features</h2>
              <p className="section-subtitle">Authenticated features accessible only after OTP entry</p>
            </div>

            <div className="features-grid">
              {features.map((feature, i) => {
                const IconComp = feature.icon;
                return (
                  <div key={i} className="feature-card">
                    <div className="feature-top">
                      <div className="feature-icon-box">
                        <IconComp size={20} />
                      </div>
                      <span className="feature-badge">{feature.badge}</span>
                    </div>
                    <h3 className="feature-title">{feature.title}</h3>
                    <p className="feature-desc">{feature.description}</p>
                    <div className="feature-footer">
                      <span className="explore-link">
                        Explore <ArrowUpRight size={14} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: User Profile & Security Summary */}
          <div className="profile-sidebar">
            <div className="profile-card">
              <div className="profile-avatar-row">
                <div className="profile-avatar">
                  <Smartphone size={26} />
                </div>
                <div>
                  <h3 className="profile-name">Verified Mobile User</h3>
                  <p className="profile-meta">{user?.fullPhone}</p>
                </div>
              </div>

              <div className="profile-divider"></div>

              <div className="profile-details-list">
                <div className="detail-item">
                  <span className="detail-label">Verification Mode</span>
                  <span className="detail-value text-success-emphasis">SMS One-Time Password</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Access Level</span>
                  <span className="detail-value">Full Home Dashboard</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Session Protection</span>
                  <span className="detail-value">256-Bit SSL/TLS</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Auto-Lock</span>
                  <span className="detail-value">Enabled</span>
                </div>
              </div>

              <div className="profile-card-action">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(true)}
                  className="profile-logout-btn"
                >
                  <LogOut size={16} />
                  <span>Exit to Login Page</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon-badge">
              <LogOut size={26} className="text-danger" />
            </div>
            <h3 className="modal-title">Sign Out of Home Page?</h3>
            <p className="modal-text">
              You will return to the mobile number login screen. You will need to enter an SMS OTP
              again to regain access.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="modal-cancel-btn"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                }}
                className="modal-confirm-btn"
              >
                Confirm Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

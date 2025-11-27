import React, { useState } from 'react';
import axios from 'axios';

interface User {
  _id: string;
  username: string;
  email: string;
  subscription: {
    tier: string;
    startDate: string;
    endDate: string;
  };
  usageStats: {
    componentsGenerated: number;
    projectsCreated: number;
  };
}

interface RegisterFormProps {
  onRegisterSuccess: (token: string, user: User) => void;
  onSwitchToLogin: () => void;
  onGuestMode: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onRegisterSuccess, onSwitchToLogin, onGuestMode }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email');
      return false;
    }
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3001/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      const { token, user } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      onRegisterSuccess(token, user);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form-card">
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Start building amazing websites with AI</p>

        {error && (
          <div className="auth-error">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1C4.13 1 1 4.13 1 8s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7zm1 10.5H7V9.5h2v2zm0-3.5H7V4h2v4z" fill="currentColor"/>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="johndoe"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? (
              <>
                <div className="spinner"></div>
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <button onClick={onSwitchToLogin} className="auth-link">
              Sign in
            </button>
          </p>
          <p className="or-divider">or</p>
          <button onClick={onGuestMode} className="guest-link">
            Continue as Guest →
          </button>
        </div>
      </div>

      <style>{`
        .auth-form-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }

        .auth-form-card {
          background: white;
          border-radius: 16px;
          padding: 40px;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .auth-title {
          font-size: 28px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 8px 0;
          text-align: center;
        }

        .auth-subtitle {
          color: #6b7280;
          text-align: center;
          margin: 0 0 32px 0;
          font-size: 15px;
        }

        .auth-error {
          background: #fef2f2;
          border: 1px solid #fee2e2;
          color: #dc2626;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .form-group input {
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 15px;
          transition: all 0.2s;
          outline: none;
        }

        .form-group input:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-group input:disabled {
          background: #f9fafb;
          cursor: not-allowed;
        }

        .auth-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 14px 24px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          margin-top: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .auth-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }

        .auth-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .auth-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .auth-footer {
          margin-top: 24px;
          text-align: center;
        }

        .auth-footer p {
          color: #6b7280;
          font-size: 14px;
        }

        .auth-link {
          color: #667eea;
          background: none;
          border: none;
          cursor: pointer;
          font-weight: 600;
          text-decoration: none;
          padding: 0;
        }

        .auth-link:hover {
          text-decoration: underline;
        }

        .or-divider {
          margin: 16px 0 8px 0;
          color: #9ca3af;
          font-size: 13px;
        }

        .guest-link {
          background: none;
          border: none;
          color: #667eea;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          padding: 8px 0;
          text-decoration: none;
        }

        .guest-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

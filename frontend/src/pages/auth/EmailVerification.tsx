import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import Input from '../../components/forms/Input';
import Button from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { useRequest } from 'alova/client';
import { alova } from '../../services/api';

const EmailVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setToken } = useAuthStore();
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Get email from location state (passed from registration page)
  const email = location.state?.email || '';

  // Verify code request
  const {
    loading: verifying,
    error: verifyError,
    send: verifyCode,
  } = useRequest((data) => alova.Post('/auth/verify-email', data), {
    immediate: false,
  });

  // Resend code request
  const { loading: resending, send: resendCode } = useRequest(
    (data) => alova.Post('/auth/send-verification-email', data),
    { immediate: false }
  );

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Start initial countdown
  useEffect(() => {
    setCountdown(60);
  }, []);

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      alert('Please enter a valid 6-digit code');
      return;
    }

    try {
      const response = await verifyCode({ email, code });

      // Auto-login with returned tokens
      if (response.access_token) {
        setToken(response.access_token, response.refresh_token);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Verification failed:', err);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    try {
      await resendCode({ email });
      setCountdown(60);
      alert('Verification code sent! Please check your email.');
    } catch (err) {
      console.error('Resend failed:', err);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
  };

  if (!email) {
    return (
      <AuthLayout>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Invalid Access</h2>
          <p className="text-gray-600 mb-4">Please register first.</p>
          <Button onClick={() => navigate('/register')}>Go to Register</Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Verify Your Email</h2>
          <p className="text-gray-600">
            We've sent a 6-digit verification code to
          </p>
          <p className="font-semibold text-gray-800">{email}</p>
        </div>

        <div className="space-y-4">
          <Input
            id="code"
            name="code"
            label="Verification Code"
            type="text"
            value={code}
            onChange={handleCodeChange}
            placeholder="Enter 6-digit code"
            disabled={verifying}
            maxLength={6}
          />

          {verifyError && (
            <div className="text-red-500 text-sm text-center">
              {verifyError.message || 'Invalid or expired code'}
            </div>
          )}

          <Button
            type="button"
            onClick={handleVerify}
            disabled={verifying || code.length !== 6}
            className="w-full"
          >
            {verifying ? 'Verifying...' : 'Verify Email'}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResend}
              disabled={countdown > 0 || resending}
              className={`text-sm ${
                countdown > 0 || resending
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-blue-600 hover:text-blue-800'
              }`}
            >
              {resending
                ? 'Sending...'
                : countdown > 0
                  ? `Resend code in ${countdown}s`
                  : 'Resend verification code'}
            </button>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>Didn't receive the code? Check your spam folder.</p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default EmailVerificationPage;

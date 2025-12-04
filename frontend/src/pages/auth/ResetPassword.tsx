import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import AuthLayout from '../../components/layout/AuthLayout';
import Input from '../../components/forms/Input';
import PasswordInput from '../../components/forms/PasswordInput';
import PasswordStrengthIndicator from '../../components/forms/PasswordStrengthIndicator';
import Button from '../../components/ui/Button';
import { useRequest } from 'alova/client';
import { alova } from '../../services/api';

const ResetPasswordSchema = Yup.object().shape({
  code: Yup.string()
    .length(6, 'Code must be 6 digits')
    .required('Verification code is required'),
  newPassword: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .max(50, 'Password must be less than 50 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain uppercase, lowercase, number and special character'
    )
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your password'),
});

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showSuccess, setShowSuccess] = useState(false);
  const email = location.state?.email || '';

  const {
    loading,
    error,
    send: resetPassword,
  } = useRequest((data) => alova.Post('/auth/reset-password', data), {
    immediate: false,
  });

  const formik = useFormik({
    initialValues: {
      code: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: ResetPasswordSchema,
    onSubmit: async (values) => {
      try {
        await resetPassword({
          email,
          code: values.code,
          newPassword: values.newPassword,
        });
        setShowSuccess(true);
      } catch (err) {
        console.error('Password reset failed:', err);
      }
    },
  });

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    formik.setFieldValue('code', value);
  };

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        navigate('/login');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess, navigate]);

  if (!email) {
    return (
      <AuthLayout>
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Invalid Access</h2>
          <p className="text-gray-600">
            Please request a password reset first.
          </p>
          <Button onClick={() => navigate('/forgot-password')}>
            Go to Forgot Password
          </Button>
        </div>
      </AuthLayout>
    );
  }

  if (showSuccess) {
    return (
      <AuthLayout>
        <div className="text-center space-y-6">
          <div className="text-green-600 text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-bold">Password Reset Successfully!</h2>
          <p className="text-gray-600">
            Your password has been changed successfully.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to login page in 3 seconds...
          </p>
          <Button onClick={() => navigate('/login')} className="w-full">
            Go to Login Now
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Reset Password</h2>
          <p className="text-gray-600">
            Enter the code sent to{' '}
            <span className="font-semibold">{email}</span>
          </p>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <Input
            id="code"
            name="code"
            label="Verification Code"
            type="text"
            value={formik.values.code}
            onChange={handleCodeChange}
            placeholder="Enter 6-digit code"
            disabled={loading}
            maxLength={6}
            error={formik.touched.code && formik.errors.code}
          />

          <PasswordInput
            id="newPassword"
            name="newPassword"
            label="New Password"
            value={formik.values.newPassword}
            onChange={formik.handleChange}
            disabled={loading}
            error={formik.touched.newPassword && formik.errors.newPassword}
          />

          <PasswordStrengthIndicator password={formik.values.newPassword} />

          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm New Password"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            disabled={loading}
            error={
              formik.touched.confirmPassword && formik.errors.confirmPassword
            }
          />

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error.message || 'Password reset failed'}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </Button>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Didn't receive the code?{' '}
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-blue-600 hover:text-blue-800"
              >
                Request new code
              </button>
            </p>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default ResetPasswordPage;

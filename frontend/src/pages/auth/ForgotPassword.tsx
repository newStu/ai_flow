import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import AuthLayout from '../../components/layout/AuthLayout';
import Input from '../../components/forms/Input';
import Button from '../../components/ui/Button';
import { useRequest } from 'alova/client';
import { alova } from '../../services/api';

const ForgotPasswordSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
});

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'request' | 'success'>('request');

  const {
    loading,
    error,
    send: sendResetCode,
  } = useRequest((data) => alova.Post('/auth/forgot-password', data), {
    immediate: false,
  });

  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
    },
    validationSchema: ForgotPasswordSchema,
    onSubmit: async (values) => {
      try {
        await sendResetCode(values);
        setStep('success');
      } catch (err) {
        console.error('Failed to send reset code:', err);
      }
    },
  });

  if (step === 'success') {
    return (
      <AuthLayout>
        <div className="text-center space-y-6">
          <div className="text-green-600 text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-bold">Check Your Email</h2>
          <p className="text-gray-600">We've sent a password reset code to</p>
          <p className="font-semibold text-gray-800">{formik.values.email}</p>
          <p className="text-sm text-gray-500">
            The code will expire in 5 minutes.
          </p>
          <Button
            onClick={() =>
              navigate('/reset-password', {
                state: { email: formik.values.email },
              })
            }
            className="w-full"
          >
            Continue to Reset Password
          </Button>
          <div className="text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Back to Login
            </button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Forgot Password</h2>
          <p className="text-gray-600">
            Enter your username and email to receive a reset code
          </p>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <Input
            id="username"
            name="username"
            label="Username"
            value={formik.values.username}
            onChange={formik.handleChange}
            disabled={loading}
            error={formik.touched.username && formik.errors.username}
          />

          <Input
            id="email"
            name="email"
            label="Email Address"
            type="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            disabled={loading}
            error={formik.touched.email && formik.errors.email}
          />

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error.message || 'Failed to send reset code'}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Sending...' : 'Send Reset Code'}
          </Button>

          <div className="text-center">
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

export default ForgotPasswordPage;

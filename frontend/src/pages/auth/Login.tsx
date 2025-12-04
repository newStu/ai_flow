import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import Input from '../../components/forms/Input';
import PasswordInput from '../../components/forms/PasswordInput';
import Button from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { login } from '../../services/auth.service';
import { useRequest } from 'alova/client';

const LoginSchema = Yup.object().shape({
  username: Yup.string().required('Required'),
  password: Yup.string().required('Required'),
});

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setToken } = useAuthStore();
  const { loading, error, send } = useRequest(login, {
    immediate: false,
  });

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
      rememberMe: false,
    },
    validationSchema: LoginSchema,
    onSubmit: async (values) => {
      try {
        const { access_token, refresh_token } = await send(values);
        setToken(access_token, refresh_token);
        navigate('/dashboard');
      } catch (err) {
        // Error is already logged by alova
      }
    },
  });

  return (
    <AuthLayout>
      <form onSubmit={formik.handleSubmit} className="space-y-6">
        <Input
          id="username"
          name="username"
          label="Username"
          onChange={formik.handleChange}
          value={formik.values.username}
          disabled={loading}
        />
        <PasswordInput
          id="password"
          name="password"
          label="Password"
          onChange={formik.handleChange}
          value={formik.values.password}
          disabled={loading}
        />

        {error && <div className="text-red-500 text-sm">{error.message}</div>}

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="rememberMe"
              name="rememberMe"
              type="checkbox"
              onChange={formik.handleChange}
              checked={formik.values.rememberMe}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label
              htmlFor="rememberMe"
              className="ml-2 block text-sm text-gray-900"
            >
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <Link
              to="/forgot-password"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Forgot your password?
            </Link>
          </div>
        </div>

        <div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </div>

        <div className="text-center text-sm">
          <span className="text-gray-600">Don't have an account? </span>
          <Link
            to="/register"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Sign up
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;

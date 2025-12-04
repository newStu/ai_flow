import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import Input from '../../components/forms/Input';
import PasswordInput from '../../components/forms/PasswordInput';
import Button from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { useRequest } from 'alova';
import { alova } from '../../services/api';
import PasswordStrengthIndicator from '../../components/forms/PasswordStrengthIndicator';

const RegisterSchema = Yup.object().shape({
  username: Yup.string().required('Required'),
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().min(8, 'Too Short!').required('Required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Required'),
});

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { setToken } = useAuthStore();
  const { loading, error, send: register } = useRequest(
    (values) => alova.Post('/users', values),
    { immediate: false }
  );

  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: RegisterSchema,
    onSubmit: async (values) => {
      try {
        await register(values);
        // You would typically redirect to a verification page or auto-login
        alert('Registration successful!');
        navigate('/login');
      } catch (err) {
        // Handled by alova
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
        <Input
          id="email"
          name="email"
          label="Email"
          type="email"
          onChange={formik.handleChange}
          value={formik.values.email}
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
        <PasswordStrengthIndicator password={formik.values.password} />
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm Password"
          onChange={formik.handleChange}
          value={formik.values.confirmPassword}
          disabled={loading}
        />

        {error && <div className="text-red-500 text-sm">{error.message}</div>}

        <div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;

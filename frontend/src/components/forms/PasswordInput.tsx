import React from 'react';
import Input from './Input';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const PasswordInput: React.FC<PasswordInputProps> = (props) => {
  return <Input {...props} type="password" />;
};

export default PasswordInput;

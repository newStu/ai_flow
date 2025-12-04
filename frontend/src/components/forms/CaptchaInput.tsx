import React from 'react';
import Input from './Input';

interface CaptchaInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  imageUrl: string;
  onRefresh: () => void;
}

const CaptchaInput: React.FC<CaptchaInputProps> = ({
  label,
  imageUrl,
  onRefresh,
  ...props
}) => {
  return (
    <div>
      <label
        htmlFor={props.id}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      <div className="mt-1 flex items-center">
        <Input label={label} {...props} />
        <img src={imageUrl} alt="Captcha" className="ml-2 h-10" />
        <button
          type="button"
          onClick={onRefresh}
          className="ml-2 text-sm text-indigo-600 hover:text-indigo-500"
        >
          Refresh
        </button>
      </div>
    </div>
  );
};

export default CaptchaInput;

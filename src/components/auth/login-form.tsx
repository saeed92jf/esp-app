// src/features/Auth/LoginForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginValues } from '@/lib/validations/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface LoginFormProps {
  onLogin: (values: LoginValues) => void; // تابع برای ارسال مقادیر فرم
  loading?: boolean; // حالت لودینگ برای دکمه
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, loading }) => {
  // Initialize react-hook-form with zod schema
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  // عملیات ارسال فرم
  const onSubmit = (data: LoginValues) => {
    onLogin(data);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      {/* شماره موبایل */}
      <div>
        <label
          className="mb-2 block text-sm font-medium text-gray-700"
          htmlFor="phone"
        >
          شماره موبایل
        </label>
        <Input
          id="phone"
          placeholder="مثلاً 09123456789"
          type="tel"
          inputMode="numeric"
          {...register('phone')}
          className={`w-full ${errors.phone ? 'border-red-500' : ''}`}
        />
        {errors.phone && (
          <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
        )}
      </div>

      {/* رمز عبور */}
      <div>
        <label
          className="mb-2 block text-sm font-medium text-gray-700"
          htmlFor="password"
        >
          رمز عبور
        </label>
        <Input
          id="password"
          placeholder="رمز عبور شما"
          type="password"
          {...register('password')}
          className={`w-full ${errors.password ? 'border-red-500' : ''}`}
        />
        {errors.password && (
          <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      {/* دکمه submit */}
      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || loading}
      >
        {isSubmitting || loading ? 'در حال وارد شدن...' : 'ورود'}
      </Button>
    </form>
  );
};

export default LoginForm;

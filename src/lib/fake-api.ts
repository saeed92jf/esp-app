// src/lib/fake-api.ts

import { User } from '@/types/auth';

/**
 * Global delay helper for simulation.
 * Defined once to avoid "defined multiple times" error.
 */
const delay = (ms = 800) => new Promise((resolve) => setTimeout(resolve, ms));

interface RegisterArgs {
  fullName: string;
  emailOrMobile: string;
  password: string;
}

interface ForgotPasswordArgs {
  emailOrMobile: string;
}

interface ResetPasswordArgs {
  password: string;
}

/**
 * Mock API for authentication and user management.
 * All methods include artificial delay to simulate real network conditions.
 */
export const fakeApi = {
  // Login simulation
  login: async (emailOrMobile: string, password: string): Promise<User> => {
    await delay();
    // Simulate a hardcoded demo user
    return {
      id: '1',
      email: emailOrMobile.includes('@') ? emailOrMobile : 'user@example.com',
      mobile: !emailOrMobile.includes('@') ? emailOrMobile : '09123456789',
      fullName: 'کاربر آزمایشی',
      avatar: 'https://github.com/shadcn.png',
    };
  },

  // Registration simulation
  register: async (args: RegisterArgs): Promise<User> => {
    await delay();
    return {
      id: Math.random().toString(36).substr(2, 9),
      email: args.emailOrMobile.includes('@') ? args.emailOrMobile : '',
      mobile: !args.emailOrMobile.includes('@') ? args.emailOrMobile : '',
      fullName: args.fullName,
    };
  },

  // Forgot password simulation
  forgotPassword: async (
    args: ForgotPasswordArgs,
  ): Promise<{ message: string }> => {
    await delay();
    return {
      message: 'کد بازیابی به ایمیل یا شماره موبایل شما ارسال شد.',
    };
  },

  // Reset password simulation
  resetPassword: async (
    args: ResetPasswordArgs,
  ): Promise<{ success: boolean }> => {
    await delay();
    return {
      success: true,
    };
  },

  // Logout simulation
  logout: async () => {
    await delay(300);
    return { success: true };
  },
};

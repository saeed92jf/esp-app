// src/lib/fake-api.ts
import type { User } from '@/types/auth';

// Simulated network latency for a realistic demo feel.
const FAKE_DELAY = 600;
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * A single demo credential record. Both `email` and `mobile` are valid
 * identifiers for the same account (login with either one + the password).
 */
interface DemoCredential {
  email: string;
  mobile: string;
  password: string;
  user: User;
}

/**
 * The ONLY accounts allowed to sign in. Anything outside this list is rejected.
 * SECURITY: demo/testing only. Never store real credentials like this.
 */
export const DEMO_USERS: DemoCredential[] = [
  {
    email: 'admin@demo.com',
    mobile: '09120000001',
    password: 'admin1234',
    user: {
      id: 'u-admin',
      fullName: 'Morteza Shafiee',
      email: 'admin@demo.com',
      mobile: '09120000001',
      avatar: '',
      role: 'admin',
    },
  },
  {
    email: 'engineer@demo.com',
    mobile: '09120000002',
    password: 'engineer1234',
    user: {
      id: 'u-engineer',
      fullName: 'Saeed Jalili Fard',
      email: 'engineer@demo.com',
      mobile: '09120000002',
      avatar: '',
      role: 'engineer',
    },
  },
  {
    email: 'staff@demo.com',
    mobile: '09120000003',
    password: 'staff1234',
    user: {
      id: 'u-staff',
      fullName: 'Morteza Saeedi',
      email: 'staff@demo.com',
      mobile: '09120000003',
      avatar: '',
      role: 'staff',
    },
  },
  {
    email: 'customer@demo.com',
    mobile: '09120000004',
    password: 'customer1234',
    user: {
      id: 'u-customer',
      fullName: 'Allaye Mahestan',
      email: 'customer@demo.com',
      mobile: '09120000004',
      avatar: '',
      role: 'customer',
    },
  },
];

// Case-insensitive, whitespace-tolerant comparison for identifiers.
const normalize = (v: string) => v.trim().toLowerCase();

export const fakeApi = {
  /**
   * Authenticates against DEMO_USERS. Accepts email OR mobile as identifier.
   * @throws Error('INVALID_CREDENTIALS') when nothing matches.
   */
  async login(identifier: string, password: string): Promise<User> {
    await delay(FAKE_DELAY);
    const id = normalize(identifier);
    const match = DEMO_USERS.find(
      (c) =>
        (normalize(c.email) === id || normalize(c.mobile) === id) &&
        c.password === password,
    );
    // Generic error: do not reveal which field was wrong.
    if (!match) throw new Error('INVALID_CREDENTIALS');
    return match.user;
  },

  async logout(): Promise<void> {
    await delay(200);
  },
};

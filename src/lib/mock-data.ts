// lib/mock-data.ts
import bcrypt from 'bcryptjs'

export type UserRole = 'ADMIN' | 'ENGINEER' | 'EMPLOYEE' | 'CUSTOMER'

export interface MockUser {
  id: string
  name: string
  email: string
  password: string 
  role: UserRole
  avatar?: string
  department?: string
}

/* pass: 123456 */
const rawUsers = [
  {
    id: '1',
    name: 'Morteza Shafiee',
    email: 'admin@company.com',
    role: 'ADMIN' as UserRole,
    department: 'IT',
  },
  {
    id: '2',
    name: 'Saeed Jalili Fard',
    email: 'engineer@company.com',
    role: 'ENGINEER' as UserRole,
    department: 'Engineering',
  },
  {
    id: '3',
    name: 'Morteza Saeedi',
    email: 'employee@company.com',
    role: 'EMPLOYEE' as UserRole,
    department: 'Sales',
  },
  {
    id: '4',
    name: 'Sara Shayesteh',
    email: 'customer@company.com',
    role: 'CUSTOMER' as UserRole,
    department: 'External',
  },
    {
    id: '5',
    name: 'Test User',
    email: 'test@example.com',
    role: 'CUSTOMER' as UserRole,
  },
]

export const MOCK_USERS: MockUser[] = await Promise.all(
  rawUsers.map(async (user) => ({
    ...user,
    password: await bcrypt.hash('123456', 10),
  }))
)

export async function findUserByEmail(email: string): Promise<MockUser | undefined> {
  return MOCK_USERS.find(user => user.email === email)
}

export async function findUserById(id: string): Promise<Omit<MockUser, 'password'> | undefined> {
  const user = MOCK_USERS.find(user => user.id === id)
  if (!user) return undefined
  const { password, ...userWithoutPassword } = user
  return userWithoutPassword
}
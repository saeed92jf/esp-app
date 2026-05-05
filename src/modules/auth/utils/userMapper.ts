import type { User, UserRole } from '../types/auth.types'

export const mapToUser = (data: any): User => {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role as UserRole,
    createdAt: data.createdAt,
    avatar: data.avatar,
  }
}
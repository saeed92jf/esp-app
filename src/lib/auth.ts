// lib/auth.ts
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { findUserByEmail, findUserById } from "./mock-data"

// توسعه typeهای NextAuth برای اضافه کردن role
declare module "next-auth" {
  interface User {
    role?: string
    department?: string
  }
  interface Session {
    user: {
      id?: string
      name?: string | null
      email?: string | null
      role?: string
      department?: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    role?: string
    department?: string
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required")
        }

        // ============================================
        // بخش 1: MOCK API (برای توسعه - فعلاً فعال)
        // ============================================
        const user = await findUserByEmail(credentials.email)
        
        if (!user) {
          throw new Error("User not found")
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)
        
        if (!isValid) {
          throw new Error("Invalid password")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }

        // ============================================
        // بخش 2: REAL API (برای زمانی که سرور آماده شد)
        // ============================================
        // 🔴 کد زیر را زمانی فعال کن که سرور واقعی آماده است
        // 🔴 و کد MOCK API بالا را کامنت کن
        // ============================================
        /*
        
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })
          
          const data = await response.json()
          
          if (!response.ok) {
            throw new Error(data.message || 'Login failed')
          }
          
          // اطمینان از وجود role در پاسخ سرور
          if (!data.user || !data.user.role) {
            throw new Error('Invalid user data from server')
          }
          
          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            role: data.user.role,
            department: data.user.department, // اختیاری
          }
        } catch (error: any) {
          console.error('Login API error:', error)
          throw new Error(error.message || 'Authentication failed')
        }
        
        */
        // ============================================
        // انتهای بخش REAL API
        // ============================================
      }
    })
  ],
  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.department = user.department
      }
      return token
    },
    
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.department = token.department as string
      }
      return session
    }
  },
  
  pages: {
    signIn: "/login",
    error: "/login",
  },
  
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 ساعت
  },
  
  secret: process.env.NEXTAUTH_SECRET,
}

/* نمونه فرمت پاسخ سرور */
/*
{
  "success": true,
  "user": {
    "id": "123",
    "email": "user@company.com",
    "name": "John Doe",
    "role": "ADMIN",
    "department": "IT"
  }
}
  */
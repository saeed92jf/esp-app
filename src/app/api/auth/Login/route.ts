import { NextRequest, NextResponse } from 'next/server'

// Mock users database
const users: Map<string, any> = new Map()

// Pre-populate with test user
users.set('test@example.com', {
  id: 'user_test_123',
  name: 'Test User',
  email: 'test@example.com',
  password: '123456',
  role: 'user',
  createdAt: new Date().toISOString(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log('Login attempt:', { email, password })

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user
    const user = users.get(email)

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check password
    if (user.password !== password) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate token
    const token = `mock_jwt_token_${Date.now()}_${Math.random().toString(36).substring(7)}`

    // Return user
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
        token,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from "next/server";

// Mock users database (should match the one in login/register)
const users: Map<string, any> = new Map();

// Pre-populate with test user
users.set("test@example.com", {
  id: "user_test_123",
  name: "Test User",
  email: "test@example.com",
  password: "123456",
  role: "user",
  createdAt: new Date().toISOString(),
});

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.split(" ")[1];

  console.log("Get user request, token:", token);

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  // Mock: Extract user from token
  // In real app, verify JWT and get user
  // For demo, return the test user
  const testUser = users.get("test@example.com");

  if (!testUser) {
    return NextResponse.json(
      { success: false, message: "User not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      id: testUser.id,
      name: testUser.name,
      email: testUser.email,
      role: testUser.role as "user" | "admin",
      createdAt: testUser.createdAt,
    },
  });
}

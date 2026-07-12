// src/lib/fake-api.ts
import type { User } from "@/types/auth";

const buildUser = (identifier: string): User => ({
  id: `demo-${identifier.toLowerCase().replace(/\s+/g, "-")}`,
  fullName: identifier.trim() || "Demo User",
  role: "customer",
  email: `${identifier.toLowerCase().replace(/\s+/g, ".")}@demo.local`,
  avatar:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80",
});

export const fakeApi = {
  async login(identifier: string, password: string): Promise<User> {
    if (!identifier.trim() || !password.trim()) {
      throw new Error("Invalid credentials");
    }

    return buildUser(identifier);
  },

  async logout(): Promise<void> {
    return Promise.resolve();
  },
};

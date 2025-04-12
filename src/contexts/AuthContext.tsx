
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "@/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const MOCK_USERS: User[] = [
  {
    id: "emp-1",
    name: "TechCorp Recruiter",
    email: "recruiter@techcorp.com",
    role: "employer",
    avatar: "https://api.dicebear.com/7.x/personas/svg?seed=employer",
  },
  {
    id: "cand-1",
    name: "Alex Johnson",
    email: "alex@example.com",
    role: "candidate",
    avatar: "https://api.dicebear.com/7.x/personas/svg?seed=candidate",
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user in localStorage
    const storedUser = localStorage.getItem("jobwise_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call
      // For demo, we're using mock data
      const foundUser = MOCK_USERS.find(
        (u) => u.email === email && u.role === role
      );
      
      if (!foundUser) {
        throw new Error("Invalid credentials or user not found");
      }
      
      // Set the user in state and localStorage
      setUser(foundUser);
      localStorage.setItem("jobwise_user", JSON.stringify(foundUser));
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call
      // For demo, we'll create a mock user
      const newUser: User = {
        id: `${role.substring(0, 4)}-${Date.now()}`,
        name,
        email,
        role,
        avatar: `https://api.dicebear.com/7.x/personas/svg?seed=${email}`,
      };
      
      // Set the user in state and localStorage
      setUser(newUser);
      localStorage.setItem("jobwise_user", JSON.stringify(newUser));
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("jobwise_user");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

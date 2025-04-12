
import React, { createContext, useContext, useState, useEffect } from "react";
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { User, UserRole } from "@/types";

interface Profile {
  id: string;
  username: string;
  role: UserRole;
  email?: string; // Make email optional since it's not in the profiles table
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (username: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch user profile data
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      // Add email from user metadata if available
      return data ? {
        ...data,
        email: session?.user?.email || ''
      } as Profile : null;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  // Helper to map Supabase User to our User type
  const mapUser = (supabaseUser: SupabaseUser, userProfile: Profile | null): User => {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      role: userProfile?.role || 'candidate',
      name: userProfile?.username || supabaseUser.email?.split('@')[0] || '',
      avatar: supabaseUser.user_metadata.avatar_url,
    };
  };

  // Set up auth state listener
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          // Defer profile fetching to avoid Supabase auth callback issues
          setTimeout(async () => {
            const userProfile = await fetchProfile(session.user.id);
            setProfile(userProfile);
            setUser(mapUser(session.user, userProfile));
          }, 0);
        } else {
          setProfile(null);
          setUser(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);

      if (session?.user) {
        const userProfile = await fetchProfile(session.user.id);
        setProfile(userProfile);
        setUser(mapUser(session.user, userProfile));
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Validate email format before sending to Supabase
      const emailRegex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
      if (!emailRegex.test(email)) {
        throw new Error("Please enter a valid email address");
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      if (data.user) {
        const userProfile = await fetchProfile(data.user.id);
        setProfile(userProfile);
        setUser(mapUser(data.user, userProfile));
        
        // Redirect based on user role
        if (userProfile?.role === 'candidate') {
          navigate('/candidate/dashboard');
        } else if (userProfile?.role === 'employer') {
          navigate('/employer/dashboard');
        } else {
          navigate('/');
        }
      }
      
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    try {
      // Validate email format before sending to Supabase
      const emailRegex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
      if (!emailRegex.test(email)) {
        throw new Error("Please enter a valid email address");
      }
      
      // Check if email already exists using the auth API
      const { data: existingUsers } = await supabase.auth.admin.listUsers({
        filters: {
          email
        }
      });
        
      if (existingUsers && existingUsers.users.length > 0) {
        throw new Error("This email is already registered. Please use a different email or try logging in.");
      }
      
      // Register user with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: name,
            role,
            email // Store email in user metadata also
          }
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Account created",
        description: "Your account has been created successfully.",
      });
      
      // Redirect based on user role (profile will be created by the database trigger)
      if (role === 'candidate') {
        navigate('/candidate/dashboard');
      } else {
        navigate('/employer/dashboard');
      }
      
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Signup failed",
        description: error.message || "An error occurred during signup",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      navigate('/login');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: error.message || "An error occurred during logout",
        variant: "destructive"
      });
    }
  };

  const updateProfile = async (username: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          username, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update local profile state
      setProfile(prev => prev ? { ...prev, username } : null);
      
      // Update user state with new username
      setUser(prev => prev ? { ...prev, name: username } : null);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast({
        title: "Update failed",
        description: error.message || "An error occurred while updating your profile",
        variant: "destructive"
      });
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        profile, 
        isLoading, 
        login, 
        signup, 
        logout,
        updateProfile
      }}
    >
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

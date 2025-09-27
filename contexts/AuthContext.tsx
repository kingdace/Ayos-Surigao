import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { Session, User, AuthError } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { UserProfile } from "../types/simple-auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isSigningUp: boolean;
  signUp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    barangayCode: string,
    barangayName: string
  ) => Promise<{ error: AuthError | null }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const isSigningUpRef = useRef(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(
        "Auth state change:",
        event,
        "isSigningUpRef:",
        isSigningUpRef.current
      );

      // Ignore auth state changes during signup process to prevent navigation loops
      if (isSigningUpRef.current && event === "SIGNED_IN") {
        console.log("Ignoring SIGNED_IN event during signup");
        return;
      }

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    barangayCode: string,
    barangayName: string
  ) => {
    console.log("Starting signup process");
    setIsSigningUp(true);
    isSigningUpRef.current = true;

    try {
      // First, sign out any existing session to ensure clean state
      await supabase.auth.signOut();

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            barangay_code: barangayCode,
            barangay_name: barangayName,
          },
        },
      });

      // Sign out immediately after signup to prevent auto-login
      // This ensures user sees success message and goes to login page
      if (!error) {
        await supabase.auth.signOut();

        // Add a delay before clearing the signup flag to ensure all auth events are processed
        setTimeout(() => {
          console.log(
            "Signup completed, clearing isSigningUp flag after delay"
          );
          setIsSigningUp(false);
          isSigningUpRef.current = false;
        }, 500);
      } else {
        setIsSigningUp(false);
        isSigningUpRef.current = false;
      }

      return { error };
    } catch (err) {
      console.error("Signup error:", err);
      setIsSigningUp(false);
      isSigningUpRef.current = false;
      return { error: err as AuthError };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: new Error("No user logged in") };

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);

    if (!error) {
      setProfile((prev: UserProfile | null) =>
        prev ? { ...prev, ...updates } : null
      );
    }

    return { error };
  };

  const value = {
    session,
    user,
    profile,
    loading,
    isSigningUp,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

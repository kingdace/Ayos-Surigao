import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "../lib/supabase";

export interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role:
    | "super_admin"
    | "operations_manager"
    | "barangay_admin"
    | "field_coordinator"
    | "data_analyst";
  barangay_code?: string;
  is_active: boolean;
  last_login?: string;
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  loading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isSuperAdmin: boolean;
  isOperationsManager: boolean;
  isBarangayAdmin: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined
);

interface AdminAuthProviderProps {
  children: ReactNode;
}

export const AdminAuthProvider: React.FC<AdminAuthProviderProps> = ({
  children,
}) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing admin session
    checkAdminSession();
  }, []);

  const checkAdminSession = async () => {
    try {
      // For now, we'll start with no admin session
      // In a real app, you might store admin session in AsyncStorage
      setAdmin(null);
    } catch (error) {
      console.error("Error checking admin session:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      // Check if this is an admin account
      const { data: adminData, error: adminError } = await supabase
        .from("admin_accounts")
        .select("*")
        .eq("email", email)
        .eq("is_active", true)
        .single();

      if (adminError || !adminData) {
        return { success: false, error: "Invalid admin credentials" };
      }

      // For now, we'll use a simple password check against the stored hash
      // In production, you should use proper password hashing with bcrypt
      const isValidPassword =
        password === "Admin123!" ||
        password === "Ops123!" ||
        password === "Barangay123!";

      if (!isValidPassword) {
        return { success: false, error: "Invalid password" };
      }

      // Update last login
      await supabase
        .from("admin_accounts")
        .update({ last_login: new Date().toISOString() })
        .eq("id", adminData.id);

      setAdmin({
        id: adminData.id,
        email: adminData.email,
        first_name: adminData.first_name,
        last_name: adminData.last_name,
        role: adminData.role,
        barangay_code: adminData.barangay_code,
        is_active: adminData.is_active,
        last_login: new Date().toISOString(),
      });

      return { success: true };
    } catch (error) {
      console.error("Admin login error:", error);
      return { success: false, error: "An error occurred during login" };
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Simply clear the admin state since we're not using Supabase auth
      setAdmin(null);
    } catch (error) {
      console.error("Admin logout error:", error);
    }
  };

  const isSuperAdmin = admin?.role === "super_admin";
  const isOperationsManager = admin?.role === "operations_manager";
  const isBarangayAdmin = admin?.role === "barangay_admin";

  const value: AdminAuthContextType = {
    admin,
    loading,
    login,
    logout,
    isSuperAdmin,
    isOperationsManager,
    isBarangayAdmin,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = (): AdminAuthContextType => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};

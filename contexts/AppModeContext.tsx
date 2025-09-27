import React, { createContext, useContext, ReactNode } from "react";

type AppMode = "public" | "admin";

interface AppModeContextType {
  switchToAdmin: () => void;
  switchToPublic: () => void;
  currentMode: AppMode;
}

const AppModeContext = createContext<AppModeContextType | undefined>(undefined);

interface AppModeProviderProps {
  children: ReactNode;
  switchToAdmin: () => void;
  switchToPublic: () => void;
  currentMode: AppMode;
}

export const AppModeProvider: React.FC<AppModeProviderProps> = ({
  children,
  switchToAdmin,
  switchToPublic,
  currentMode,
}) => {
  const value: AppModeContextType = {
    switchToAdmin,
    switchToPublic,
    currentMode,
  };

  return (
    <AppModeContext.Provider value={value}>{children}</AppModeContext.Provider>
  );
};

export const useAppMode = (): AppModeContextType => {
  const context = useContext(AppModeContext);
  if (context === undefined) {
    throw new Error("useAppMode must be used within an AppModeProvider");
  }
  return context;
};

"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { pb } from "@/lib/pocketbase";
import { loginUser, registerUser, logoutUser, getCurrentUser, UserRecord } from "@/lib/auth";

interface AuthContextType {
    user: UserRecord | null;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, password: string, passwordConfirm: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserRecord | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Restore session from PocketBase authStore
        const currentUser = getCurrentUser();
        setUser(currentUser);
        setLoading(false);

        // Listen for auth changes
        const unsubscribe = pb.authStore.onChange(() => {
            setUser(getCurrentUser());
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const login = async (username: string, password: string) => {
        await loginUser(username, password);
        setUser(getCurrentUser());
    };

    const register = async (username: string, password: string, passwordConfirm: string) => {
        await registerUser(username, password, passwordConfirm);
        setUser(getCurrentUser());
    };

    const logout = () => {
        logoutUser();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

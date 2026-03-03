"use client";

import { useAuth } from "@/components/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage() {
    const { user, logout, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <main className="min-h-screen bg-background pt-32 pb-20 px-6 font-serif">
                <div className="max-w-2xl mx-auto text-center text-gray-400">
                    Loading...
                </div>
            </main>
        );
    }

    if (!user) return null;

    return (
        <main className="min-h-screen bg-background pt-32 pb-20 px-6 font-serif">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-4xl md:text-6xl font-eczar mb-12 tracking-tight text-center">
                    Profile
                </h1>

                <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-800">
                            <span className="text-xs font-sans uppercase tracking-widest text-gray-500">
                                Unique ID
                            </span>
                            <span className="font-mono text-sm text-gray-700 dark:text-gray-300">
                                {user.id}
                            </span>
                        </div>

                        <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-800">
                            <span className="text-xs font-sans uppercase tracking-widest text-gray-500">
                                Username
                            </span>
                            <span className="text-lg font-bold tracking-wider">
                                {user.username}
                            </span>
                        </div>

                        <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-800">
                            <span className="text-xs font-sans uppercase tracking-widest text-gray-500">
                                Created
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(user.created).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            logout();
                            router.push("/");
                        }}
                        className="w-full mt-8 py-3 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-sans uppercase tracking-widest text-sm transition-colors rounded"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </main>
    );
}

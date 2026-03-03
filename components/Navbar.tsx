"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu, X, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/components/AuthContext";

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const { user, loading } = useAuth();

    const navItems = [
        { name: "Home", href: "/" },
        { name: "News", href: "/news" },
        { name: "Blog", href: "/blog" },
        { name: "Skills", href: "/skills" },
        { name: "Physical Lab", href: "/about" },
        { name: "Staff", href: "/staff" },
    ];

    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-background/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

                {/* Logo - Eczar Font */}
                <Link href="/" className="text-3xl font-eczar tracking-wider hover:opacity-80 transition-opacity">
                    PHYSICAL LAB
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-8">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "text-sm font-medium tracking-widest uppercase hover:text-gray-600 transition-colors",
                                pathname === item.href ? "border-b-2 border-black dark:border-white" : ""
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}

                    {/* User ID / Login */}
                    <div className="border-l border-gray-300 dark:border-gray-700 pl-6 ml-2">
                        {loading ? (
                            <span className="text-xs text-gray-400">...</span>
                        ) : user ? (
                            <Link
                                href="/profile"
                                className={cn(
                                    "inline-flex items-center gap-2 text-sm font-medium tracking-widest uppercase hover:text-gray-600 transition-colors",
                                    pathname === "/profile" ? "border-b-2 border-black dark:border-white" : ""
                                )}
                            >
                                <User className="w-4 h-4" />
                                {user.username}
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="text-sm font-medium tracking-widest uppercase hover:text-gray-600 transition-colors"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden p-2"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu Dropdown */}
            {isOpen && (
                <div className="md:hidden absolute top-20 left-0 w-full bg-background border-b border-gray-100 p-6 flex flex-col space-y-4">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className="text-lg font-serif tracking-wide hover:ml-2 transition-all"
                        >
                            {item.name}
                        </Link>
                    ))}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
                        {user ? (
                            <Link
                                href="/profile"
                                onClick={() => setIsOpen(false)}
                                className="inline-flex items-center gap-2 text-lg font-serif tracking-wide hover:ml-2 transition-all"
                            >
                                <User className="w-4 h-4" />
                                {user.username}
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                onClick={() => setIsOpen(false)}
                                className="text-lg font-serif tracking-wide hover:ml-2 transition-all"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}


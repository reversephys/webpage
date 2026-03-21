"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu, X, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/components/AuthContext";

type NavItem = {
    name: string;
    href?: string;
    auth?: boolean;
    isDropdown?: boolean;
    subItems?: NavItem[];
};

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const { user, loading } = useAuth();

    const allNavItems: NavItem[] = [
        { name: "Home", href: "/" },
        {
            name: "POST",
            isDropdown: true,
            subItems: [
                { name: "Feed", href: "/feed" },
                { name: "Blog", href: "/blog" },
                { name: "Skills", href: "/skills", auth: true },
                { name: "Staff", href: "/staff", auth: true },
            ]
        },
        { name: "Physical Lab", href: "/about" },
        { name: "Member", href: "/member" },
    ];

    const navItems = allNavItems.map(item => {
        if (item.isDropdown && item.subItems) {
            return {
                ...item,
                subItems: item.subItems.filter(sub => !sub.auth || user)
            };
        }
        return item;
    }).filter(item => !item.auth || user);

    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-background/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

                {/* Logo - Eczar Font */}
                <Link href="/" className="text-3xl font-eczar tracking-wider hover:opacity-80 transition-opacity">
                    PHYSICAL LAB
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-8 h-full">
                    {navItems.map((item) => {
                        if (item.isDropdown) {
                            return (
                                <div key={item.name} className="relative group h-full flex items-center">
                                    <span className={cn(
                                        "text-sm font-medium tracking-widest uppercase hover:text-gray-600 transition-colors cursor-pointer",
                                        item.subItems?.some(s => pathname === s.href) ? "border-b-2 border-black dark:border-white" : ""
                                    )}>
                                        {item.name}
                                    </span>
                                    {/* Dropdown Menu */}
                                    <div className="absolute top-20 left-0 w-48 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-b-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 flex flex-col py-2">
                                        {item.subItems?.map(sub => (
                                            <Link
                                                key={sub.href!}
                                                href={sub.href!}
                                                className={cn(
                                                    "px-6 py-3 text-sm font-medium tracking-widest uppercase hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
                                                    pathname === sub.href ? "text-blue-600 dark:text-blue-400" : ""
                                                )}
                                            >
                                                {sub.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <Link
                                key={item.href!}
                                href={item.href!}
                                className={cn(
                                    "text-sm font-medium tracking-widest uppercase hover:text-gray-600 transition-colors",
                                    pathname === item.href ? "border-b-2 border-black dark:border-white" : ""
                                )}
                            >
                                {item.name}
                            </Link>
                        );
                    })}

                    {/* User ID / Login */}
                    <div className="border-l border-gray-300 dark:border-gray-700 pl-6 ml-2 h-6 flex items-center">
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
                <div className="md:hidden absolute top-20 left-0 w-full bg-background border-b border-gray-100 p-6 flex flex-col space-y-4 shadow-lg shadow-black/5">
                    {navItems.map((item) => {
                        if (item.isDropdown) {
                            return (
                                <div key={item.name} className="flex flex-col space-y-4">
                                    <span className="text-lg font-serif tracking-wide text-gray-400 border-b border-gray-100 dark:border-gray-800 pb-2">
                                        {item.name}
                                    </span>
                                    <div className="pl-4 flex flex-col space-y-3">
                                        {item.subItems?.map(sub => (
                                            <Link
                                                key={sub.href!}
                                                href={sub.href!}
                                                onClick={() => setIsOpen(false)}
                                                className={cn(
                                                    "text-base font-serif tracking-wide hover:ml-2 transition-all text-gray-600 dark:text-gray-300",
                                                    pathname === sub.href ? "text-blue-600 dark:text-blue-400 font-medium" : ""
                                                )}
                                            >
                                                {sub.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <Link
                                key={item.href!}
                                href={item.href!}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                    "text-lg font-serif tracking-wide hover:ml-2 transition-all border-b border-gray-100/50 dark:border-gray-800/50 pb-2",
                                    pathname === item.href ? "text-blue-600 dark:text-blue-400" : ""
                                )}
                            >
                                {item.name}
                            </Link>
                        );
                    })}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
                        {user ? (
                            <Link
                                href="/profile"
                                onClick={() => setIsOpen(false)}
                                className="inline-flex items-center gap-2 text-lg font-serif tracking-wide hover:ml-2 transition-all"
                            >
                                <User className="w-5 h-5" />
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

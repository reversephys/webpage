"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils"; // We might need to create this util
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const navItems = [
        { name: "Home", href: "/" },
        { name: "Blog", href: "/blog" },
        { name: "News", href: "/news" },
        { name: "Physical Lab", href: "/about" },
    ];

    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-background/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

                {/* Logo - Chomsky Font */}
                <Link href="/" className="text-3xl font-chomsky tracking-wider hover:opacity-80 transition-opacity">
                    Physical Lab
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
                </div>
            )}
        </nav>
    );
}

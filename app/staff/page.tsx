"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import { StaffPost } from "@/lib/staff";

export default function StaffPage() {
    const [posts, setPosts] = useState<StaffPost[]>([]);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/staff/posts");
                const data = await res.json();
                setPosts(data);
            } catch {
                console.error("Failed to load staff posts.");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const filtered = query.trim()
        ? posts.filter((post) => {
            const q = query.toLowerCase();
            return (
                post.title.toLowerCase().includes(q) ||
                post.tag.toLowerCase().includes(q) ||
                post.excerpt.toLowerCase().includes(q)
            );
        })
        : posts;

    return (
        <main className="min-h-screen bg-background pt-32 pb-10 px-6 font-serif">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-end justify-between mb-8">
                    <h1 className="text-3xl md:text-5xl font-eczar tracking-tight">Staff</h1>
                    <Link
                        href="/staff/write"
                        className="text-sm font-sans uppercase tracking-widest border border-gray-300 dark:border-gray-600 px-5 py-2 hover:bg-foreground hover:text-background transition-colors"
                    >
                        Write
                    </Link>
                </div>

                {/* Search bar */}
                <div className="flex gap-2 mb-8">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search staff posts..."
                        className="flex-1 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-sans focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors"
                    />
                </div>

                {loading ? (
                    <p className="text-gray-500 text-center py-20 text-lg">Loading...</p>
                ) : (
                    <div className="space-y-6">
                        {filtered.length === 0 ? (
                            <p className="text-gray-500 text-center py-20 italic">No posts found.</p>
                        ) : (
                            filtered.map((post) => (
                                <div key={post.slug} className="group border-b border-gray-100 dark:border-gray-800 pb-6">
                                    {/* Content (Full Width) */}
                                    <div>
                                        <div className="flex items-center gap-4 mb-2 text-xs tracking-[0.2em] text-gray-400 uppercase font-sans">
                                            <span>{post.date}</span>
                                            <span className="w-8 h-[1px] bg-gray-200 dark:bg-gray-700" />
                                            <span>{post.tag}</span>
                                        </div>

                                        <Link href={`/staff/${post.slug}`}>
                                            <h2 className="text-3xl font-bold mb-2 group-hover:underline decoration-1 underline-offset-4 cursor-pointer">
                                                {post.title}
                                            </h2>
                                        </Link>

                                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
                                            {post.excerpt}
                                        </p>

                                        <Link
                                            href={`/staff/${post.slug}`}
                                            className="inline-flex items-center text-xs font-sans uppercase tracking-widest text-gray-400 hover:text-foreground transition-colors mt-4"
                                        >
                                            Read More
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
